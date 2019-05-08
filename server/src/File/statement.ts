import { Comment } from './comment';

export class Statement
{
	Arguments: Array<Argument>
	InlineComments: Array<Comment>;
	HeaderComment: Comment;
}