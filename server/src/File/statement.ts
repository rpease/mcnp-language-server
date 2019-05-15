import { Comment } from './comment';

export class Statement
{
	Tag: string;
	Arguments: Array<Argument>
	InlineComments: Array<Comment>;
	HeaderComment: Comment;

	constructor(text: Array<string>)
	{
		text.forEach(line => 
		{
			var comment_split = line.split("$");

			if(comment_split.length > 1)
			{
				
			}
		});
	}	
}