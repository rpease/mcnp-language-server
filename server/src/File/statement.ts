import { Argument } from './argument';
import { ARGUMENT } from '../regexpressions';

export class MCNPLine
{
	LineNumber: number;
	Contents: string;
	FilePosition: number;
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
	StartIndex: number;

	constructor(text: Array<MCNPLine>,header: MCNPLine)
	{
		this.HeaderComment = header;
		this.StartIndex = text[0].FilePosition;

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

		var arg_ex = new RegExp(ARGUMENT,'g');

		let m: RegExpExecArray | null;
		while (m = arg_ex.exec(comment_split[0]))
		{
			var arg = new Argument();
			arg.Contents = m[0];
			arg.FilePosition = line.FilePosition + m.index;

			this.Arguments.push(arg);
		}
	}
}