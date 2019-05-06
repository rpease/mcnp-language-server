
import { Line } from '../line';

// example of importing whole module as sort of an object
import * as utilities from '../utilities';

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
	Lines: Array<Line>;
	Entries: Array<IsotopeEntry>;
	
	

	constructor(lines: Array<Line>)
	{					
		var tag = utilities.SplitStringNumberCombo("");
	}

	private static ConvertZAID()
	{

	}
}		
