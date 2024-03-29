import { Argument } from './argument';
import { ARGUMENT, SHORTHAND_ARGUMENT } from '../regexpressions';
import { Diagnostic, ErrorMessageTracker, DiagnosticSeverity } from 'vscode-languageserver';
import { ReplaceTabsInLine, ConvertShorthandFeature } from '../utilities';
import { MCNPException } from '../mcnp_exception';
import { MCNPLine, LineType } from './MCNPLines';
import { isNull } from 'util';

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

	private LINE_TOO_LONG_LIMIT = 80;

	constructor(text: Array<MCNPLine>,header: MCNPLine)
	{
		this.HeaderComment = header;
		this.StartLine = text[0].LineNumber;

		var contains_shorthand = false;
		for (const line of text)
		{
			this.RawText += line.RawContents;

			if(line.Type == LineType.Comment)
				throw Error("A Full-Line Comment can not be a part of an MCNP Statement.")
				
			contains_shorthand = this.ConvertLineToArguments(line) || contains_shorthand;
		}

		if(contains_shorthand)
			this.ConvertShorthand();
	}
	
	/**
	 * Converts an MCNP Line to the arguments that make-up that line and adds them to the current Statement's
	 * list of arguments. Order is maintained.
	 * Returns true if the line contains any shorthand (i.e. r, m, j, i, ilog)
	 * @param line The line to convert to arguments.
	 */
	private ConvertLineToArguments(line: MCNPLine): boolean
	{
		var contains_shorthand = false;

		if(!isNull(line.Comment))
			this.InlineComments.push(line.Comment);

		// Replace all '=' with a space since they are equivalent
		var vs_code_interp = line.RawContents.replace('=',' ');	

		var vs_arg_re = new RegExp(ARGUMENT,'g');
		var mcnp_arg_re = new RegExp(ARGUMENT,'g');	
		
		var shorthand_re = new RegExp(SHORTHAND_ARGUMENT,'i');
			
		let line_too_long_start_index = -1;
		let line_too_long_end_index = -1;
		let line_too_long_end_verbose_index = -1;

		var m;
		var v;
		do
		{
			v = vs_arg_re.exec(vs_code_interp);
			m = mcnp_arg_re.exec(line.MCNPInterpretation);

			if (m == null)
				break;

			// Does the contents of this argument contain any shorthand?
			if(!contains_shorthand && shorthand_re.exec(v[0]) != null)
				contains_shorthand = true;

			var arg = new Argument();
			arg.Contents = v[0];
			arg.FilePosition = 
			{
				line: line.LineNumber,
				character: v.index,
				mcnp_character: m.index
			}

			this.Arguments.push(arg);

			if(m.index+arg.Contents.length > this.LINE_TOO_LONG_LIMIT)
			{
				if(line_too_long_start_index == -1)
				{
					line_too_long_start_index = arg.FilePosition.character;
					let i = arg.FilePosition.mcnp_character;
					for(var char of arg.Contents)
					{
						if(i >= this.LINE_TOO_LONG_LIMIT)
							break
						
						line_too_long_start_index += 1;
						i += 1;
					}
				}
				line_too_long_end_index = arg.FilePosition.character + arg.Contents.length; 	
				line_too_long_end_verbose_index = arg.FilePosition.mcnp_character + arg.Contents.length;		
			}			

		} while (v);

		if(line_too_long_start_index != -1)
			this.CreateLineTooLongError(arg.FilePosition.line, 
				line_too_long_start_index, 
				line_too_long_end_index, 
				line_too_long_end_verbose_index);	

		return contains_shorthand;
	}

	/**
	 * Converts all shorthand (i.e. r, m, j, i, ilog) arguments to multiple arguments and maintains the 
	 * correct ordering of the all Arguments in this statement.
	 */
	private ConvertShorthand()
	{
		var unconverted_args = this.Arguments;

		this.Arguments = new Array<Argument>();
		var shorthand_re = new RegExp(SHORTHAND_ARGUMENT,'i');		
		for (let i = 0; i < unconverted_args.length; i++) 
		{
			const arg = unconverted_args[i];

			var shorthand = shorthand_re.exec(arg.Contents)

			// Does this argument contain shorthand?
			if(shorthand != null && !isNaN(Number(shorthand[1])))
			{
				var pre_contents = null;
				if(i != 0)
					pre_contents = this.Arguments[this.Arguments.length-1].Contents;

				var post_contents = null;
				if(i != unconverted_args.length-1)
					post_contents = unconverted_args[i+1].Contents

				var conversion = Array<string>();
				try 
				{
					conversion = ConvertShorthandFeature(
						pre_contents,
						arg.Contents,
						post_contents);
				} 
				catch (e) 
				{
					if(e instanceof MCNPException)					
						this.Errors.push(e.CreateArgumentException(arg).diagnostic);
					else
						throw e;				

					this.Arguments.push(arg);
				}
				
				// Add new arguments that will have the same file-position
				// as the original shorthand argument
				for (const num of conversion) 
				{
					let new_arg: Argument = {
						Contents: num,
						FilePosition: arg.FilePosition
					}
					this.Arguments.push(new_arg);
				}
				
			} // end if shorthand
			else
				this.Arguments.push(arg);			
		}		
	}

	private CreateLineTooLongError(line_num:number, start: number, end: number, verbose_end: number)
	{
			let diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			range: {
				start: {
					line: line_num,
					character: start
				},
				end: {
					line: line_num,
					character: end
				}
			},
			message: `Line too long for MCNP ( ${verbose_end} > ${this.LINE_TOO_LONG_LIMIT} )`,
			source: 'MCNP'
		};
		this.Errors.push(diagnostic);
	}

	public GetDiagnostics(): Diagnostic[]
	{
		return this.Errors;
	}
}