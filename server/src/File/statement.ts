import { Argument } from './argument';
import { ARGUMENT } from '../regexpressions';
import { Diagnostic, ErrorMessageTracker, DiagnosticSeverity } from 'vscode-languageserver';

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
			console.log(line)
			this.RawText += line.Contents;
			this.AppendArguments(line)
		});
	}
	
	private AppendArguments(line: MCNPLine)
	{
		var comment_split = line.Contents.split("$");
		
		if(comment_split.length > 1)		
			this.InlineComments.push(comment_split[1].trim());
			
		if(comment_split[0].length > 80)
			this.CreateLineTooLongError(line.LineNumber,comment_split[0].length)

		// Replace all '=' with a space since they are equivalent
		comment_split[0] = comment_split[0].replace('=',' ');

		var arg_ex = new RegExp(ARGUMENT,'g')

		let m: RegExpExecArray | null;
		while (m = arg_ex.exec(comment_split[0]))
		{
			var arg = new Argument();
			arg.Contents = m[0];
			arg.FilePosition = 
			{
				line: line.LineNumber,
				character: m.index
			}

			this.Arguments.push(arg);
		}
	}

	private CreateLineTooLongError(lineNum: number, end: number, limit: number = 80)
	{
		let diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
				start: {
					line: lineNum,
					character: limit-1
				},
				end: {
					line: lineNum,
					character: end
				}
			},
			message: `MCNP will ignore this because the line because it is over ${limit} characters deep`,
			source: 'MCNP'
		};
		this.Errors.push(diagnostic);
	}

	public GetDiagnostics(): Diagnostic[]
	{
		return this.Errors;
	}
}