
import * as utilities from '../utilities';
import { Statement } from '../File/statement';

enum FractionType
{
	Atomic,
	Mass
}

class IsotopeEntry
{
	Z: number;
	A: number;
	Library: string;
	Fraction: number;
	Type: FractionType;
}

export class Material
{
	ID: number;
	Statement: Statement;
	Entries: Array<IsotopeEntry>;
	
	

	constructor(statement: Statement)
	{					
		var tag = utilities.SplitStringNumberCombo("");
	}

	private static ConvertZAID()
	{

	}
}		
