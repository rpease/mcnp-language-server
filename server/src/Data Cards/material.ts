enum AbundanceType
{
	Atomic,
	Mass
}

class IsotopeEntry
{
	Z: number;
	A: number;
	Library; String;
	Abundance: number;
	Type: AbundanceType;
}

class Material
{
	Lines: Array<Line>;
	Entries: Array<IsotopeEntry>;
}