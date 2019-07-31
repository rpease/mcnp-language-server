import { IBlock } from './block';
import { Card } from '../Cards/card';
import { Statement } from '../File/statement';
import { SurfaceType, SurfaceModifier } from '../enumerations';
import { Surface } from '../Cards/Surfaces/surface';
import { Argument } from '../File/argument';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import * as regex from '../regexpressions';
import { stat } from 'fs';
import { utils } from 'mocha';
import { CreateErrorDiagnostic, ParsePureInt } from '../utilities';
import { MCNPArgumentException } from '../mcnp_exception';

let SURFACE_MAPPING = new Map([
	['p', SurfaceType.Plane]
])

export class SurfaceBlock implements IBlock
{
	Errors: Diagnostic[];
	Cards = Array<Surface>();
	
	// Parses the MCNP Statement, creates the proper surface, and adds it to the Block
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

	/**
	 * Returns the surface modifier type, either reflective or
	 * a whiteboundary, if there is indeed a modifier on the given surface.
	 * 
	 * @param args The arguments that define the surface
	 * @returns The surface modifier, or null if none exists
	 */
	private GetModifierType(args: Array<Argument>): SurfaceModifier
	{
		const first_char = args[0].Contents.charAt(0);

		if(first_char == '*')
			return SurfaceModifier.Reflective;
		if(first_char == '+')
			return SurfaceModifier.WhiteBoundary;			
		return null;
	}

	/**
	 * Parses the integer ID number associated with the surface.
	 * 
	 * @param args The arguments that define the surface
	 * @param modfier True if the given surface has a modifier character
	 * @param transform True if the given surface has a transformation
	 * @returns The unique integer ID number of the provided surface
	 */
	private GetIDNumber(args: Array<Argument>, modfier: boolean, transform: boolean): number
	{
		var id_string = args[0].Contents;
		if(modfier)		
			id_string = args[0].Contents.substring(1)

		let id = ParsePureInt(id_string);
		
		var max_num = 99999;
		if(transform)
			max_num = 999;

		if(id < 0 || id > max_num)		
			throw new MCNPArgumentException(args[0], `Surface ID must be greater than 0 but less than ${max_num}`)		

		return id;		
	}

	/**
	 * Returns the surface type of the provided surface. If the equation mnemonic
	 * is not recognized, an error is thrown.
	 * 
	 * @param args The arguments that define the surface
	 * @param transform True if the given surface has a transformation
	 * @returns The SurfaceType associated with the provided surface
	 */
	private GetSurfaceType(args: Array<Argument>, transform: boolean): SurfaceType
	{
		let equation_arg = args[1];
		if(transform)
			equation_arg = args[2];

		let equation_mnemonic = equation_arg.Contents.toLowerCase();

		if(equation_mnemonic == 'p')
			return SurfaceType.Plane;
		if(equation_mnemonic == 'px')
			return SurfaceType.Plane_X;
		if(equation_mnemonic == 'py')
			return SurfaceType.Plane_Y;
		if(equation_mnemonic == 'pz')
			return SurfaceType.Plane_Z;
		
		if(equation_mnemonic == 'so')
			return SurfaceType.Sphere_Origin;
		if(equation_mnemonic == 's')
			return SurfaceType.Sphere;
		if(equation_mnemonic == 'sx')
			return SurfaceType.Sphere_X;
		if(equation_mnemonic == 'sy')
			return SurfaceType.Sphere_Y;
		if(equation_mnemonic == 'sz')
			return SurfaceType.Sphere_Z;
		
		if(equation_mnemonic == 'c/x')
			return SurfaceType.Cylinder_Par_X;
		if(equation_mnemonic == 'c/y')
			return SurfaceType.Cylinder_Par_Y;
		if(equation_mnemonic == 'c/z')
			return SurfaceType.Cylinder_Par_Z;
		if(equation_mnemonic == 'cx')
			return SurfaceType.Cylinder_X;
		if(equation_mnemonic == 'cy')
			return SurfaceType.Cylinder_Y;
		if(equation_mnemonic == 'cz')
			return SurfaceType.Cylinder_Z;
		
		if(equation_mnemonic == 'k/x')
			return SurfaceType.Cone_Par_X;
		if(equation_mnemonic == 'k/y')
			return SurfaceType.Cone_Par_Y;
		if(equation_mnemonic == 'k/z')
			return SurfaceType.Cone_Par_Z;
		if(equation_mnemonic == 'kx')
			return SurfaceType.Cone_X;
		if(equation_mnemonic == 'ky')
			return SurfaceType.Cone_Y;
		if(equation_mnemonic == 'kz')
			return SurfaceType.Cone_Z;
		
		if(equation_mnemonic == 'sq'
			|| equation_mnemonic == 'sph')
			return SurfaceType.SQ;
		
		if(equation_mnemonic == 'gq')
			return SurfaceType.GQ;
		
		if(equation_mnemonic == 'tx')
			return SurfaceType.Torus_X;
		if(equation_mnemonic == 'ty')
			return SurfaceType.Torus_Y;
		if(equation_mnemonic == 'tz')
			return SurfaceType.Torus_Z;
		
		if(equation_mnemonic == 'xyzp')
			return SurfaceType.Points;
		
		// Macrobodies
		if(equation_mnemonic == 'box')
			return SurfaceType.Box;
		if(equation_mnemonic == 'rpp')
			return SurfaceType.RectangularParallelepiped;
		if(equation_mnemonic == 'rcc')
			return SurfaceType.RightCircularCylinder;
		if(equation_mnemonic == 'rhp'
			|| equation_mnemonic == 'hex')
			return SurfaceType.HexagonalPrism;
		if(equation_mnemonic == 'rec')
			return SurfaceType.RightEllipitcalCylinder;
		if(equation_mnemonic == 'trc')
			return SurfaceType.TruncatedCone;
		if(equation_mnemonic == 'ell')
			return SurfaceType.Ellipsoid;
		if(equation_mnemonic == 'wed')
			return SurfaceType.Wedge;
		if(equation_mnemonic == 'arb')
			return SurfaceType.Polyhedron;

		throw new MCNPArgumentException(equation_arg, `Surfrace mnemonic ${equation_mnemonic} is not recognized`);
	}

	/**
	 * Parses the surface parameters into useable numbers that are used
	 * to actually define the surface.
	 * 
	 * @param args The arguments that define the surface
	 * @param transform True if the given surface has a transformation
	 * @returns The list of ordered numbers that define the surface shape
	 */
	private GetParameters(args: Array<Argument>, transform: boolean): Array<number>
	{
		var parameter_index = 2;
		if(transform)		
			parameter_index = 3;

		let parameters = new Array<number>();
		for (let p = parameter_index; p < args.length; p++) 
		{
			let param = Number(args[p].Contents)

			if(isNaN(param))
				throw new MCNPArgumentException(args[p], `Surface parameter ${args[p].Contents} is not a valid number`)

			parameters.push(param);
		}

		return parameters;
	}

	GetDiagnostics(): Diagnostic[]
	{
		return this.Errors;
	}
}