import { Particle } from "./enumerations";
import { ParameterInformation } from "vscode-languageserver";
import { FULL_LINE_COMMENT_MATCH } from './regexpressions';

export function SplitStringNumberCombo(text: String): [string, number, string]
{
	var matches = text.match("^([\\*!+\\-#]?)([a-zA-Z]+)([0-9]+)");
	
	return [matches[2], parseFloat(matches[3]), matches[1]];
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
		throw new Error("Can not parse particle type from a string that is more than a single character!\n");
	}
	switch(text.toLowerCase())
	{
		case "n":{ return Particle.neutron;}
		case "p":{ return Particle.photon;}
		case "e":{ return Particle.electron;}
		default: { return Particle.NONE;}
	}
}

export function GetCommentText(text: string): string
{
	var comment_split = text.match(FULL_LINE_COMMENT_MATCH);

	if(comment_split.length == 2)	
		return comment_split[1].trim();		
	return "";
}

export function ReplaceTabsInLine(line: string, tabBreak=8): string
{
	let tab_split = line.split('\t');
	let mcnp_string = '';

	for (let i = 0; i < tab_split.length; i++) 
	{
		const text = tab_split[i];
		mcnp_string += text;
		if(i < tab_split.length-1)
		{		
			let mod = text.length % tabBreak;
			let n_spaces_to_add = tabBreak - mod;	
			
			for (let i = 0; i < n_spaces_to_add; i++) 
				mcnp_string += " ";
		}		
	}
		
	return mcnp_string;
}

// Compares two strings without considering case. MCNP is case-insensitive
export function CaseInsensitiveCompare(a: string, b: string): boolean
{
	return a.toLowerCase() === b.toLowerCase();
}

// Only parses pure Integer values (i.e. 1 not 1.0). MCNP is picky and expects pure integers for certain
// things such as surface IDs and Tally numbers. Returns NaN if the provided string is not a Pure Integer.
export function ParseOnlyInt(s: string): number
{
	if(s.match('[\.e\+]'))
		return NaN;
	return parseInt(s);
}

// Converts MCNP shorthand features (r, i, ilog, m) to their actual values.
// Each shorthand requires different number of arguments, but all require the preceding number and shorthand argument.
// ex.) 2 3 4 5i 10 -> preceding="4", shorthand="5i", post="10"
// Return array will only be the numbers that replace that actual shorthand
// argument (i.e. 3 2r will return [3,3] instead of [3,3,3])
export function ConvertShorthandFeature(preceding: string, shorthand: string, post?: string ): Array<number>
{
	if(shorthand.toLocaleLowerCase().includes('r'))
	{
		try 
		{
			return RepeatShorthand(preceding, shorthand.split('r')[0]);
		}
		catch (error)
		{
			
		}
	}
	else if(shorthand.toLocaleLowerCase().includes('i'))
	{

	}
	else if(shorthand.toLocaleLowerCase().includes('ilog'))
	{

	}
	else if(shorthand.toLocaleLowerCase().includes('m'))
	{

	}

	return new Array<number>();
}

function RepeatShorthand(n_string: string, num_repeats_string: string): Array<number>
{
	var num_repeats = ParseOnlyInt(num_repeats_string);

	// number of repeats must be a pure int for MCNP to be able to run
	if(isNaN(num_repeats))
	{
		// todo throw error
	}
	// Any number <= 0 will not repeat the provided number
	else if(num_repeats < 0)	
		num_repeats = 0;

	var n = parseFloat(n_string);

	var repeat_array = Array<number>();
	for (let i = 0; i < num_repeats; i++) 	
		repeat_array.push(n);
		
	return repeat_array;
}