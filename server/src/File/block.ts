import { FileBlock } from '../enumerations';
import { Statement } from './statement';

export class Block
{
	Statements: Array<Statement>;
	Type: FileBlock;
}