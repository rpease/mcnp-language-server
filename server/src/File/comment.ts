
export enum CommentType
{
	C,
	$,
}

export class Comment
{
	Type: CommentType;
	Contents: string;

	// Relative to begining of input file
	StartPosition: number;
	EndPosition: number;
}