import { IBlock } from './block';
import { Card } from '../Cards/card';
import { Statement } from '../File/statement';
import { SurfaceType, SurfaceModifier } from '../enumerations';
import { Surface } from '../Cards/Surfaces/surface';
import { Argument } from '../File/argument';
import { Diagnostic } from 'vscode-languageserver';
import * as regex from '../regexpressions';
import { stat } from 'fs';

let SURFACE_MAPPING = new Map([
	['p', SurfaceType.Plane]
])

export class SurfaceBlock implements IBlock
{
	Errors: Diagnostic[];
	Cards = Array<Surface>();
	
	ParseStatement(statement: Statement)
	{
		const args = statement.Arguments;

		// Get modifier, if any
		let modifier = this.GetModifierType(args);
		let has_modifier = false;
		if(modifier != null)
			has_modifier = true;

		// Get Transform, if any
		let transform = null;
		let has_transform = false;
		if(transform != null)
			has_transform = true;

		// Get Surface ID
		let id = this.GetIDNumber(args, has_modifier, has_transform);		

		// Get mnemonic
		let code = this.GetSurfaceType(args, has_transform)

		// Get parameters
		let parameters = this.GetParameters(args, has_modifier)	
	}

	private GetModifierType(args: Array<Argument>): SurfaceModifier
	{
		const first_char = args[0].Contents.charAt(0);

		if(first_char == '*')
			return SurfaceModifier.Reflective;
		if(first_char == '+')
			return SurfaceModifier.WhiteBoundary;			
		return null;
	}

	private GetIDNumber(args: Array<Argument>, modfier: boolean, transform: boolean): number
	{
		var id_string = args[0].Contents;
		if(modfier)		
			id_string = args[0].Contents.substring(1)

		if( id_string.match('[.eE+-]').length > 0)
		{
			// todo throw error because only pure ints are allowed
		}

		var id = parseInt(id_string);

		var max_num = 99999;
		if(transform)
			max_num = 999;

		if(id == NaN)
		{
			// todo throw error because the ID is not a number
		}

		if(id < 0 || id > max_num)
		{
			// todo throw an error because the ID is out of bounds
		}

		return id;		
	}

	private GetSurfaceType(args: Array<Argument>, transform: boolean): SurfaceType
	{
		return null;
	}

	private GetParameters(args: Array<Argument>, transform: boolean): Array<number>
	{
		return null;
	}

	GetDiagnostics(): Diagnostic[]
	{
		return this.Errors;
	}
}