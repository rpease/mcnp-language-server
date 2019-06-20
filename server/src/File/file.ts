import { DataBlock } from '../Block/DataBlock';
import { CellBlock } from '../Block/CellBlock';
import { SurfaceBlock } from '../Block/SurfaceBlock';

export class MCNPFile
{
	Title: string;
	CellBlock: CellBlock;
	SurfaceBlock: SurfaceBlock;
	DataBlock: DataBlock;
}