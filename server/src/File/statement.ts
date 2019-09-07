import { Argument } from './argument';
import { ARGUMENT, SHORTHAND_ARGUMENT } from '../regexpressions';
import { Diagnostic, ErrorMessageTracker, DiagnosticSeverity } from 'vscode-languageserver';
import { ReplaceTabsInLine, ConvertShorthandFeature, StringReplaceAll } from '../utilities';
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

			// Allow full-line comments, but ignore them
			if(line.Type == LineType.Comment)
				continue;
				
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
		// Need to do this because the MCNP interpretation has already replaced equal signs.
		var vs_code_interp = StringReplaceAll(line.RawContents, '=', ' ');

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

			let sub_arguments = this.GenerateArguments(m[0], v.index, m.index, line.LineNumber);

			for (const sub_arg of sub_arguments) 
			{
				this.Arguments.push(sub_arg);

				if(m.index+sub_arg.Contents.length > this.LINE_TOO_LONG_LIMIT)
				{
					if(line_too_long_start_index == -1)
					{
						line_too_long_start_index = sub_arg.FilePosition.character;
						let i = sub_arg.FilePosition.mcnp_character;
						for(var char of sub_arg.Contents)
						{
							if(i >= this.LINE_TOO_LONG_LIMIT)
								break
							
							line_too_long_start_index += 1;
							i += 1;
						}
					}
					line_too_long_end_index = sub_arg.FilePosition.character + sub_arg.Contents.length; 	
					line_too_long_end_verbose_index = sub_arg.FilePosition.mcnp_character + sub_arg.Contents.length;		
				}
			}
		} while (v);

		if(line_too_long_start_index != -1)
			this.CreateLineTooLongError(line.LineNumber, 
				line_too_long_start_index, 
				line_too_long_end_index, 
				line_too_long_end_verbose_index);	

		return contains_shorthand;
	}

	private GenerateArguments(text: string, vs_code_index: number, mcnp_index:number, line_num: number): Array<Argument>
	{
		let args = [];

		// Split string by Parentheses
		let parenth_split = text.split(new RegExp('(\\(|\\))','g'));

		// Split strings by ONLY cell colons
		for (const sub_arg of parenth_split) 
		{
			// parentheses is first character of the argument
			if(sub_arg == '')
				continue;

			let colon_split = sub_arg.split(new RegExp('(:)','g'));

			// Is the colon being used for particle type differentiation?
			if(isNaN(Number(colon_split[0])) && colon_split[0][0] != '#')
			{
				var arg = new Argument();
				arg.Contents = sub_arg;
				arg.FilePosition = 
				{
					line: line_num,
					character: vs_code_index,
					mcnp_character: mcnp_index
				}

				args.push(arg);

				vs_code_index += sub_arg.length;
				mcnp_index += sub_arg.length;
			}
			else
			{
				for (const a of colon_split) 
				{
					// colon is first character of the argument
					if(a == '')
						continue;

					var arg = new Argument();
					arg.Contents = a;
					arg.FilePosition = 
					{
						line: line_num,
						character: vs_code_index,
						mcnp_character: mcnp_index
					}
	
					args.push(arg);

					vs_code_index += a.length;
					mcnp_index += a.length;
				}
			}			
		}
		return args;
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