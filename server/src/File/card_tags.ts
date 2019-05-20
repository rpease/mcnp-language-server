export class CellCardTag
{
	// ex.) 10 3 -4.53 #1 #2
	// Unique identifier of the surface (10)
	ID: number;
}

export class SurfaceCardTag
{
	// ex.) *10 PY 3
	// Prefix to Card identifier (*)
	Modifier: string;

	// ex.) 1 10 RPP ......
	// Transform/Periodic Card Number (10)
	Transform: number;

	// ex.) 1 10 RPP
	// Represents the equation mnemonic of the surface (RPP)
	CardIdentifier: string;

	// ex.) 12 10 RPP
	// Unique identifier of the surface (12)
	ID: number;

	constructor(text: string)
	{
		
	}
}

export class DataCardTag
{
	// ex.) *F14:p
	// Prefix to Card identifier (*)
	Modifier: string;

	// ex.) *F14:p
	// Character-Set that identifies what card the statement represents (F)
	CardIdentifier: string;

	// ex.) *F14:p
	// Most cards have a number identifier (14)
	ID: number;

	constructor(text: string)
	{
		
	}
}