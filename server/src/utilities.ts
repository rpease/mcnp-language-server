import { Particle } from "./enumerations";
import { ParameterInformation } from "vscode-languageserver";

export function SplitStringNumberCombo(text: String): [string, string, number]
{
	var matches = text.match("(+|*|)([a-zA-Z]+)([0-9]+)");
	return [matches[0], matches[1], parseFloat(matches[2])]
}

export function SplitParticleCombo(text: String): [string,Particle]
{
	var combo = text.split(":");
	let particle = GetParticleFromChar(combo[0]);

	return [combo[0], particle];
}

export function GetParticleFromChar(text: string): Particle
{
	if(text.length != 1)
	{
		throw new Error("Can not parse particle type from a string that is more than a single character!\n")
	}
	switch(text.toLowerCase())
	{
		case "n":{ return Particle.neutron;}
		case "p":{ return Particle.photon;}
		case "e":{ return Particle.electron;}
		default: { return Particle.NONE}
	}
}

