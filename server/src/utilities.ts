export function SplitStringNumberCombo(text: String): [string, number]
{
	var matches = text.match("([a-zA-Z]+)([0-9]+)");
	return [matches[0], parseFloat(matches[1])]
}

