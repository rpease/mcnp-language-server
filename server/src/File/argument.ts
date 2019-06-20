import { MCNPFilePosition } from './MCNPFilePosition';

export class Argument
{
	// used with TextDocument.positionAt()
	// Relative to begining of input file
	FilePosition: MCNPFilePosition;
	Contents: string;
}