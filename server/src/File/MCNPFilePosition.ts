import { Position } from 'vscode-languageserver';
import { FileBlock } from '../enumerations';

export class MCNPFilePosition implements Position
{
	line: number;
	character: number;
	mcnp_character: number;
}