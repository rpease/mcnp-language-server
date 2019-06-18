import { Argument } from './argument';
import { ARGUMENT } from '../regexpressions';
import { Diagnostic, ErrorMessageTracker, DiagnosticSeverity } from 'vscode-languageserver';
import { ReplaceTabsInLine } from '../utilities';

export class MCNPLine
{
	LineNumber: number;
	Contents: string;
}

export class Statement
{
	Arguments = Array<Argument>();

	// Full statement in a single string. Includes multi-line extensions of a statment
	RawText = "";

	// $ Comments
	InlineComments = Array<string>();
	
	// The "C" comment directly above the statement
	HeaderComment: MCNPLine;

	// The index of the start of the statement relative to the entire file
	StartLine: number;

	private Errors: Diagnostic[] = [];

	constructor(text: Array<MCNPLine>,header: MCNPLine)
	{
		this.HeaderComment = header;
		this.StartLine = text[0].LineNumber;

		text.forEach(line => 
		{
			this.RawText += line.Contents;
			this.AppendArguments(line)
		});
	}
	
	private AppendArguments(line: MCNPLine)
	{
		var comment_split = line.Contents.split("$");
		
		if(comment_split.length > 1)		
			this.InlineComments.push(comment_split[1].trim());

		// Replace all '=' with a space since they are equivalent
		var vs_code_interp = comment_split[0].replace('=',' ');	

		var mcnp_interp = vs_code_interp;
		if(vs_code_interp.includes('\t'))		
			mcnp_interp = ReplaceTabsInLine(vs_code_interp);

		var vs_arg_re = new RegExp(ARGUMENT,'g');
		var mcnp_arg_re = new RegExp(ARGUMENT,'g');		
			
		var m;
		var v;
		do
		{
			v = vs_arg_re.exec(vs_code_interp);
			m = mcnp_arg_re.exec(mcnp_interp);

			if (m == null)
				break;

			var arg = new Argument();
			arg.Contents = v[0];
			arg.FilePosition = 
			{
				line: line.LineNumber,
				character: v.index,
				mcnp_character: m.index
			}

			this.Arguments.push(arg);

			if(m.index+m.length > 80)			
				this.CreateLineTooLongError(arg);			

		} while (v);
	}

	private CreateLineTooLongError(arg: Argument, limit: number = 80)
	{
		let diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			range: {
				start: {
					line: arg.FilePosition.line,
					character: Math.max(limit, arg.FilePosition.character)
				},
				end: {
					line: arg.FilePosition.line,
					character: arg.FilePosition.character + arg.Contents.length
				}
			},
			message: `MCNP will ignore this because it is over ${limit} characters deep`,
			source: 'MCNP'
		};
		this.Errors.push(diagnostic);
	}

	public GetDiagnostics(): Diagnostic[]
	{
		return this.Errors;
	}
}