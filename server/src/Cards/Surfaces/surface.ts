import { Card } from '../card';
import { SurfaceType, SurfaceModifier } from '../../enumerations';
import { Argument } from '../../File/argument';
import { MCNPArgumentException } from '../../mcnp_exception';
import { Statement } from '../../File/statement';
import { ParsePureInt } from '../../utilities';

export class Surface extends Card
{
	Type: SurfaceType;
	Transform = null;
	Parameters: Array<Argument>;
	Modifier: SurfaceModifier;
	
	protected ParameterValues: Array<number>;
	protected DefaultValues: Array<number>;

	constructor(statement: Statement)
	{
		super();

		this.Statement = statement;

		// Get modifier, if any
		this.SetModifierType(this.Statement.Arguments);
		let has_modifier = false;
		if(this.Modifier != null)
			has_modifier = true;

		// Get Transform, if any
		let transform = null;
		let has_transform = false;
		if(transform != null)
			has_transform = true;

		// Get Surface ID
		this.SetIDNumber(this.Statement.Arguments, has_modifier, has_transform);		

		// Get parameters
		this.SetParameters(this.Statement.Arguments, has_modifier);
	}

	/**
	 * Sets the surface modifier type, either reflective or
	 * a whiteboundary, if there is indeed a modifier on the given surface.
	 * 
	 * @param args The arguments that define the surface
	 */
	private SetModifierType(args: Array<Argument>)
	{
		const first_char = args[0].Contents.charAt(0);

		let mod = null;
		if(first_char == '*')
			mod = SurfaceModifier.Reflective;
		if(first_char == '+')
			mod = SurfaceModifier.WhiteBoundary;	
		
		this.Modifier = mod;				
	}

	/**
	 * Sets the integer ID number associated with the surface.
	 * 
	 * @param args The arguments that define the surface
	 * @param modfier True if the given surface has a modifier character
	 * @param transform True if the given surface has a transformation
	 */
	private SetIDNumber(args: Array<Argument>, modfier: boolean, transform: boolean)
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

		this.ID = id;		
	}

	/**
	 * Isolates only the arguments associated with the surface specific parameters
	 * 
	 * @param args The arguments that define the surface
	 * @param transform True if the given surface has a transformation
	 */
	private SetParameters(args: Array<Argument>, transform: boolean)
	{
		this.Parameters = new Array<Argument>();
		this.ParameterValues = new Array<number>();

		var parameter_index = 2;
		if(transform)		
			parameter_index = 3;

		let parameters = new Array<Argument>();
		for (let p = parameter_index; p < args.length; p++)
		{
			this.Parameters.push(args[p]);
			this.ParameterValues.push(this.ParseParameter(p-parameter_index));
		}
			
	}
	
	private ParseParameter(p: number): number
	{		
		let param_string = this.Parameters[p].Contents;

		let param_value;
		if(param_string == 'j')
		{
			if(p >= this.DefaultValues.length)			
				throw new MCNPArgumentException(this.Parameters[p], `No default value for surface parameter ${param_string}`);
			
			param_value = this.DefaultValues[p];
		}			
		else
			param_value = Number(param_string);

		if(isNaN(param_value))
			throw new MCNPArgumentException(this.Parameters[p], `Surface parameter ${param_string} is not a valid number`)

		return param_value;		
	}
}