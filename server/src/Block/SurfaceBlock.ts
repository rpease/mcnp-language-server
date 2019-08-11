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
	Errors: Diagnostic[] = [];
	Cards = Array<Surface>();
	
	// Parses the MCNP Statement, creates the proper surface, and adds it to the Block
	ParseStatement(statement: Statement)
	{
		this.CreateSpecificSurface(statement);
	}	

	/**
	 * Returns the surface type of the provided surface. If the equation mnemonic
	 * is not recognized, an error is thrown.
	 * 
	 * @param args The arguments that define the surface
	 * @param transform True if the given surface has a transformation
	 * @returns The SurfaceType associated with the provided surface
	 */
	private CreateSpecificSurface(surf_statement: Statement)
	{
		let generic_surface: Surface;
		try 
		{
			generic_surface = new Surface(surf_statement);
		} catch (e) 
		{
			if(e instanceof MCNPArgumentException)					
				this.Errors.push(e.diagnostic);
			else
				throw e;
		}	

		/*if(equation_mnemonic == 'p')
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
		*/
	}	

	GetDiagnostics(): Diagnostic[]
	{
		return this.Errors;
	}
}