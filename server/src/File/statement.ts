import { Comment } from './comment';
import { Argument } from './argument';

export class MCNPLine
{
	LineNumber: number;
	Contents: string;
}

export class Statement
{
	Tag: string;
	Arguments: Array<Argument>
	InlineComments: Array<Comment>;
	HeaderComment: Comment;

	constructor(text: Array<MCNPLine>)
	{
		text.forEach(line => 
		{
			var comment_split = line.Contents.split("$");

			if(comment_split.length > 1)
			{
				
			}
		});
	}	
}