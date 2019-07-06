import { Particle } from "./enumerations";
import { ParameterInformation, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { FULL_LINE_COMMENT_MATCH } from './regexpressions';
import { Argument } from './File/argument';
import { MCNPException } from './mcnp_exception';

export function SplitStringNumberCombo(text: String): [string, number, string]
{
	var matches = text.match("^([\\*!+\\-#]?)([a-zA-Z]+)([0-9]+)");
	
	return [matches[2], parseFloat(matches[3]), matches[1]];
}

export function SplitParticleCombo(text: String): [string, Particle]
{
	var combo = text.split(":");
	let particle = GetParticleFromChar(combo[0]);

	return [combo[0], particle];
}

/**
 * Converts a particle string to a particle enumeration
 * @param text The particle string. i.e. 'p', 'n', 'e', etc
 */
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

/**
 * Returns only the text located in the MCNP comment if there is one in the provided line.
 * @param text the line to be read
 */
export function GetCommentText(text: string): string
{
	var comment_split = text.match(FULL_LINE_COMMENT_MATCH);

	if(comment_split.length == 2)	
		return comment_split[1].trim();		
	return "";
}

/**
 * Replaces tabs in a line with the appropriate amount of spaces.
 * @param line The line to replace tabs in
 * @param tabBreak [8] The number of spaces by which the tabs will reset the text to. Default value of 8 is the number that MCNPs compiler uses.
 */
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
 * @param throw_error [true] An MCNP exception will be thrown if set to true and the provided string is not a pure integer
 * @returns the pure integer value or NaN if the provided string is not a pure integer.
 */
export function ParsePureInt(s: string, throw_error=true): number
{
	if(s.match('[\.e\+]'))
	{
		if(throw_error)
			ThrowPureIntegerError(s);
		else
			return NaN;
	}
		
	return Number(s);
}

/**
 * 
 * @param arg The argument that will be highlighted with the provided diagnostic information
 * @param message The message that will appear in the terminal and during hover-over
 * @param severity The severity type of the diagnostic
 * @param additional_message Additional information that will be displayed only during hover-over
 */
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
	var shorthand_re = new RegExp("(\\S*?)(r|m|j|ilog|i)(\\S*)",'i');

	var breakdown = shorthand_re.exec(shorthand);

	if( breakdown == null)
		throw new MCNPException(`${shorthand} is not a valid shorthand text`);

	var mnemonic = breakdown[2].toLowerCase();
	var shorthand_arg = breakdown[1];

	if(breakdown[3] != "")
		throw new MCNPException(`Trailing text ${breakdown[3]} not allowed after shorthand mnemonics`);
		
	if(mnemonic == 'r')		
		return RepeatShorthand(preceding, shorthand_arg);		
	else if(mnemonic == 'ilog')
		return LogInterpolateShorthand(shorthand_arg, preceding, post);		
	else if(mnemonic == 'i')
		return LinearInterpolateShorthand(shorthand_arg, preceding, post);		
	else if(mnemonic == 'm')	
		return MultiplyShorthand(preceding, shorthand_arg);		
	else if(mnemonic == 'j')	
		return DefaultShorthand(shorthand_arg);

	return new Array<number>();
}

function RepeatShorthand(n_string: string, num_repeats_string: string): Array<number>
{
	if(num_repeats_string == "")
		num_repeats_string = "1";

	var num_repeats = ParsePureInt(num_repeats_string);

	// Any number <= 0 will not repeat the provided number
	if(num_repeats < 0)	
		num_repeats = 0;

	var n = Number(n_string);

	if(isNaN(n))
		throw new MCNPException(`${n_string} is not a valid number to be repeated ${num_repeats} times`);

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

	var num = ParsePureInt(n_string);

	// Any number <= 0 will result in nothing
	if(num <= 0)	
		return interp_array;

	var left = Number(left_bound);
	if(isNaN(left))
		throw new MCNPException(`${left_bound} is not a valid number to be start interpolation`);

	var right = Number(right_bound);
	if(isNaN(right))
		throw new MCNPException(`${right_bound} is not a valid number to be end interpolation`);
	
	return Interpolate(left, right, num);	
}

function LogInterpolateShorthand(n_string: string, left_bound: string, right_bound: string): Array<number>
{
	var interp_array = Array<number>();

	if(n_string == "")
		n_string = "0";

	var num = ParsePureInt(n_string);

	// Any number <= 0 will result in nothing
	if(num <= 0)	
		return interp_array;

	var left = Number(left_bound);
	if(isNaN(left) || left <= 0)
		throw new MCNPException(`${left_bound} is not a valid number to be start logarithmic interpolation`);

	var right = Number(right_bound);
	if(isNaN(right) || right <= 0)
		throw new MCNPException(`${right_bound} is not a valid number to be end logarithmic interpolation`);
	
	var left_log = Math.log10(left);
	var right_log = Math.log10(right);
	
	var log_interp =  Interpolate(left_log, right_log, num);

	log_interp.forEach(element => {
		interp_array.push(Math.pow(10.0, element));
	});

	return interp_array;
}

function MultiplyShorthand(n_string: string, factor_string: string): Array<number>
{
	var interp_array = Array<number>();

	if(factor_string == "")
		throw new MCNPException('Must provide a number for multiplication shorthand');

	var num = Number(n_string);
	if(isNaN(num))
		throw new MCNPException(`${n_string} is not a valid number to be multiplied`);

	var factor = Number(factor_string);
	if(isNaN(factor))
		throw new MCNPException(`${factor_string} is not a valid number to multiply ${num} by`);

	interp_array.push(num*factor);
	return interp_array;
}

/**
 * Currently does not have any conversion capabilities because default values are very specific to the card being used.
 * Only the value used the 'j' is read to ensure it is at least a valid number.
 * @param sequence_string The number (i.e. '2' in '2j') of default values
 */
function DefaultShorthand(sequence_string: string): Array<number>
{
	var interp_array = Array<number>();

	if(sequence_string == "")
		sequence_string = '1';

	var num = ParsePureInt(sequence_string);

	if(num <= 0)
		throw new MCNPException("Must provide a pure integer greater than zero","Ints less than or equal to 0 do not cause MCNP to crash but do produce unreliable results")

	return interp_array;
}

export function ThrowPureIntegerError(bad_num: string)
{
	let num = parseFloat(bad_num);
	throw new MCNPException(`Expected a pure integer but got a float: ${bad_num}`,`${num.toFixed()} would be acceptable` );
}