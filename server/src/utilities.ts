import { Particle } from "./enumerations";
import { ParameterInformation, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { FULL_LINE_COMMENT_MATCH } from './regexpressions';
import { Argument } from './File/argument';

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

/**
 * Compares two strings to see if they are equal without caring about the case.
 * 
 * @param a String 1
 * @param b String 2
 * @returns True if the strings are equivalent or False if they are not
 */
export function CaseInsensitiveCompare(a: string, b: string): boolean
{
	return a.toLowerCase() === b.toLowerCase();
}

/**
 * Only parses pure integer values (i.e. 1 not 1.0) from a string. MCNP is picky and expects pure integers for many
 * operations such as surface IDs and Tally numbers.
 * 
 * @param s The string to be parsed
 * @returns the pure integer value or NaN if the provided string is not a pure integer.
 */
export function ParseOnlyInt(s: string): number
{
	if(s.match('[\.e\+]'))
		return NaN;
	return parseInt(s);
}

export function CreateErrorDiagnostic(arg: Argument, message: string, severity=DiagnosticSeverity.Error, additional_message?: string): Diagnostic
{
	let diagnostic: Diagnostic = {
		severity: severity,
		range: {
			start: {
				line: arg.FilePosition.line,
				character: arg.FilePosition.character
			},
			end: {
				line: arg.FilePosition.line,
				character: arg.FilePosition.character + arg.Contents.length
			},
		},
		message: message,
		source: 'mcnp',		
	};

	// Additional Information
	if(additional_message != undefined)
	{
		diagnostic.relatedInformation = [
			{
				location: {
					uri:"",
					range: Object.assign({}, diagnostic.range)
				},
				message: additional_message
			}
		];
	}	

	return diagnostic;	
}

/**
 * Converts MCNP shorthand features (r, i, ilog, m) to their actual values. Each shorthand requires different number
 * of arguments, but all require the preceding string and shorthand argument.
 * 
 * @param preceding The contents of the argument directly before the shorthand
 * @param shorthand The string containing the shorthand (i.e. 6ilog)
 * @param post The contents of the argument directly after the shorthand. Only required for i and ilog
 * @returns The array of numbers that ONLY replace the shorthand. Does not include the preceding or post numbers.
 */
export function ConvertShorthandFeature(preceding: string, shorthand: string, post?: string ): Array<number>
{
	shorthand = shorthand.toLowerCase();
	if(shorthand.includes('r'))		
		return RepeatShorthand(preceding, shorthand.split('r')[0]);		
	else if(shorthand.includes('ilog'))
		return LogInterpolateShorthand(shorthand.split('ilog')[0], preceding, post);		
	else if(shorthand.includes('i'))
		return LinearInterpolateShorthand(shorthand.split('i')[0], preceding, post);		
	else if(shorthand.includes('m'))	
		return MultiplyShorthand(preceding, shorthand.split('m')[0]);		

	return new Array<number>();
}

function RepeatShorthand(n_string: string, num_repeats_string: string): Array<number>
{
	if(num_repeats_string == "")
		num_repeats_string = "1";

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

function Interpolate(left: number, right:number, n:number): Array<number>
{
	var h = (right-left)/(n+1);

	var interp_array = Array<number>();
	for (let i = 1; i <= n; i++) 	
		interp_array.push(left+h*i);
		
	return interp_array;
}

function LinearInterpolateShorthand(n_string: string, left_bound: string, right_bound: string): Array<number>
{
	var interp_array = Array<number>();

	if(n_string == "")
		n_string = "1";

	var num = ParseOnlyInt(n_string);

	// number of points must be a pure int for MCNP to be able to run
	if(isNaN(num))
	{
		// todo throw error
	}
	// Any number <= 0 will result in nothing
	else if(num <= 0)	
		return interp_array;

	var left = parseFloat(left_bound);
	var right = parseFloat(right_bound);
	
	return Interpolate(left, right, num);	
}

function LogInterpolateShorthand(n_string: string, left_bound: string, right_bound: string): Array<number>
{
	var interp_array = Array<number>();

	if(n_string == "")
		n_string = "0";

	var num = ParseOnlyInt(n_string);

	// number of points must be a pure int for MCNP to be able to run
	if(isNaN(num))
	{
		// todo throw error
	}
	// Any number <= 0 will result in nothing
	else if(num <= 0)	
		return interp_array;

	var left_log = Math.log10(parseFloat(left_bound));
	var right_log = Math.log10(parseFloat(right_bound));
	
	var log_interp =  Interpolate(left_log, right_log, num);

	log_interp.forEach(element => {
		interp_array.push(Math.pow(10.0, element));
	});

	return interp_array;
}

function MultiplyShorthand(n_string: string, factor_string: string): Array<number>
{
	var interp_array = Array<number>();

	if(n_string == "")
	{
		// todo throw error
	}

	var num = parseFloat(n_string);
	var factor = parseFloat(factor_string);

	interp_array.push(num*factor);
	return interp_array;
}