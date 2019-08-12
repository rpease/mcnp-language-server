import { Card } from '../card';
import { SurfaceType, SurfaceModifier } from '../../enumerations';
import { Argument } from '../../File/argument';
import { MCNPArgumentException, MCNPException } from '../../mcnp_exception';
import { Statement } from '../../File/statement';
import { ParsePureInt, CreateErrorDiagnostic } from '../../utilities';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';

export class Surface extends Card
{
	Type: SurfaceType;
	Transform = null;
	Parameters: Array<Argument>;
	Modifier: SurfaceModifier;
	
	protected ParameterValues: Array<number> = [];
	protected DefaultValues: Array<number> = [];
	protected Errors: Diagnostic[] = [];

	constructor(statement: Statement)
	{
		super();

		this.Statement = statement;

		// Get modifier, if any
		this.SetModifierType(this.Statement.Arguments);
		let has_modifier = false;
		if(this.Modifier != null)
			has_modifier = true;

		// Set Transform ID if any	
		let has_transform = this.SetTransformation(this.Statement.Arguments);

		// Get Surface ID
		this.SetIDNumber(this.Statement.Arguments, has_modifier, has_transform);		

		// Get parameters
		this.SetParameters(this.Statement.Arguments, has_transform);
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
		else if(first_char == '+')
			mod = SurfaceModifier.WhiteBoundary;
		else // check to see if user used another invalid character
		{
			let first_char_number = Number(first_char);
			if(isNaN(first_char_number))
				this.Errors.push(
					CreateErrorDiagnostic(args[0], `${first_char} is not a valid surface modifier`, DiagnosticSeverity.Error,'Only a * or + are valid'));
		}
		
		this.Modifier = mod;				
	}

	private SetTransformation(args: Array<Argument>): boolean
	{
		let float_parse = Number(args[1].Contents);

		// Second argument is a number, which means a transformation card is being applied
		if(!isNaN(float_parse))
		{
			let int_parse = parseInt(args[1].Contents);

			// Transformation number needs to be an integer value
			// but need not be a "pure integer" from a string perspective
			if(int_parse != float_parse)
				this.Errors.push(
					CreateErrorDiagnostic(args[1], `Transformation ID ${float_parse} is not an integer value`, DiagnosticSeverity.Error));

			if(int_parse == 0)
				this.Errors.push(
					CreateErrorDiagnostic(args[1], `Transformation ID can not be zero`, DiagnosticSeverity.Error));

			this.Transform = int_parse;
			return true;
		}	
		return false;
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

		let id=-1
		try 
		{
			id = ParsePureInt(id_string);
		}
		catch (e) 
		{
			if(e instanceof MCNPException)
				this.Errors.push(
					CreateErrorDiagnostic(args[0], e.message, DiagnosticSeverity.Error));					
			else
				throw e;				
		}		
		
		var max_num = 99999;
		if(transform)
			max_num = 999;

		if(id <= 0 || id > max_num)
			this.Errors.push(
				CreateErrorDiagnostic(args[0], `Surface ID must be greater than 0 but less than ${max_num}`, DiagnosticSeverity.Error));			

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
			/*
			if(p >= this.DefaultValues.length)			
				throw new MCNPArgumentException(this.Parameters[p], `No default value for surface parameter ${param_string}`);
			
			param_value = this.DefaultValues[p];
			*/

			param_value = 0.0;
			this.Errors.push(
				CreateErrorDiagnostic(this.Parameters[p],'Default shorthand j should be avoided when defining surfaces',DiagnosticSeverity.Warning));
		}			
		else
			param_value = Number(param_string);

		if(isNaN(param_value))
			this.Errors.push(
				CreateErrorDiagnostic(this.Parameters[p], `Surface parameter ${param_string} is not a valid number`, DiagnosticSeverity.Error));

		return param_value;		
	}

	public GetDiagnostics(): Diagnostic[]
	{
		return this.Errors;
	}
}