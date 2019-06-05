import { Position } from 'vscode-languageserver';

export class Argument
{
	// used with TextDocument.positionAt()
	// Relative to begining of input file
	FilePosition: Position;
	Contents: string;
}