import { Card } from '../card';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { DensityType } from '../../enumerations';
import { Statement } from '../../File/statement';
import { Argument } from '../../File/argument';
import { ParsePureInt, CreateErrorDiagnostic, ExtractKeyValueParameters } from '../../utilities';
import { MCNPException } from '../../mcnp_exception';
import { setFlagsFromString } from 'v8';
import { CardParameter } from '../card_parameter';

export class Cell extends Card
{
	MaterialID: number;
	Density: number;
	DensityUnits: DensityType;

	UsedCells: Set<number>;
	UsedSurfaces: Set<number>;
	DataParameters: Array<CardParameter>;

	protected Errors: Diagnostic[] = [];

	/**
	 * Creates a cell given the provided Statement. All MCNP related errors and 
	 * warnings can be access with GetDiagnostics().
	 * 
	 * @param statement The Statment that define the cell
	 */
	constructor(statement: Statement)
	{
		super();

		this.Statement = statement;

		// Get Cell ID
		this.SetIDNumber(this.Statement.Arguments, false);

		// Get Material Card Number
		let is_void = this.SetMaterial(this.Statement.Arguments);

		// Get Material Density Information
		this.SetDensity(this.Statement.Arguments, is_void);

		// Extract Geometric Definition
		let geo_end = this.ExtractSpatialIDs(this.Statement.Arguments, is_void);

		// Extract key-value parameters at the end of a cell definition
		this.SetKeyValueParameters(this.Statement.Arguments, geo_end);
	}

	/**
	 * Sets the integer ID number associated with the cell.
	 * 
	 * @param args The arguments that define the cell
	 * @param transform True if the given cell is transformed
	 */
	private SetIDNumber(args: Array<Argument>, transform: boolean)
	{
		var id_string = args[0].Contents;

		let id=-1
		try 
		{
			id = ParsePureInt(id_string);
		}
		catch (e) 
		{
			if(e instanceof MCNPException)
			{
				this.Errors.push(e.CreateArgumentException(args[0]).diagnostic);				
				return;
			}									
			else
				throw e;				
		}		
		
		var max_num = 99999999;
		if(transform)
			max_num = 999;

		if(id <= 0 || id > max_num)
			this.Errors.push(
				CreateErrorDiagnostic(args[0], `Cell ID must be greater than 0 but less than ${max_num}`, DiagnosticSeverity.Error));			

		this.ID = id;		
	}

	/**
	 * Sets the material that fills the cell.
	 * 
	 * @param args The arguments that define the cell
	 * @return boolean, True if the cell uses a material, False if it's void
	 */
	private SetMaterial(args: Array<Argument>): boolean
	{
		var m_string = args[1].Contents;
		var is_void = false;

		let material=-1
		try 
		{
			material = ParsePureInt(m_string);
		}
		catch (e) 
		{
			if(e instanceof MCNPException)
				this.Errors.push(e.CreateArgumentException(args[1]).diagnostic);					
			else
				throw e;				
		}

		if(material == 0)
			is_void = true;
		else if(material < 0)
			this.Errors.push(
				CreateErrorDiagnostic(args[1], `Material ID can not be negative`, DiagnosticSeverity.Error));			

		this.MaterialID = material;
		
		return is_void;
	}

	/**
	 * Sets the density value and units of the cell material.
	 * 
	 * @param args The arguments that define the cell
	 * @param is_void True if the cell is void of material
	 */
	private SetDensity(args: Array<Argument>, is_void: boolean)
	{
		if(is_void)
		{
			this.Density = 0.0;
			this.DensityUnits = DensityType.Void;
			return;
		}

		let density_value = Number(args[2].Contents);

		if(isNaN(density_value))
		{
			this.Errors.push(
				CreateErrorDiagnostic(args[2], `${args[2].Contents} is not a valid material density number`, DiagnosticSeverity.Error));
		}
		
		if(density_value < 0)
		{
			this.Density = -density_value;
			this.DensityUnits = DensityType.Mass;

			if(density_value >= 23.0)
				this.Errors.push(
					CreateErrorDiagnostic(args[2], `Material density higher than that of Osmium (22.59 g/cm3), the densest material on Earth`, DiagnosticSeverity.Warning));

			return;
		}
		else if(density_value > 0)
		{
			this.Density = density_value;
			this.DensityUnits = DensityType.Atomic;
			return;
		}
		else if(density_value == 0)
		{
			this.Density = density_value;
			this.DensityUnits = DensityType.Void;

			this.Errors.push(
				CreateErrorDiagnostic(args[2], `Non-Void cell has density of 0`, DiagnosticSeverity.Warning));

			return;
		}
	}

	/**
	 * Extracts the Cell and Surface IDs used to define the geometry of the current cell
	 * 
	 * @param args The arguments that define the cell
	 * @param is_void True if the cell is void of material
	 */
	private ExtractSpatialIDs(args: Array<Argument>, is_void: boolean): number
	{
		this.UsedCells = new Set<number>();
		this.UsedSurfaces = new Set<number>();

		let ignore_string = [')', '(', ':'];

		let start_index = 3;
		if(is_void)
			start_index = 2;

		for (let i = start_index; i < args.length; i++) 
		{
			const arg = args[i];

			if(!ignore_string.includes(arg.Contents))
			{				
				// Cell ID
				if(arg.Contents.includes('#'))				
				{
					const num_string = arg.Contents.substring(1);

					// Nothing before the '#' is accepted by MCNP
					if(arg.Contents[0] != '#')
					{
						this.Errors.push(
							CreateErrorDiagnostic(arg, `${arg.Contents[0]} or any modifier are not allowed when defining complementary cell.`, DiagnosticSeverity.Error));
						continue;
					}

					let num_parse = Number(num_string);
					if(isNaN(num_parse))
					{
						this.Errors.push(
							CreateErrorDiagnostic(arg, `Complement operator must be used with a number.`, DiagnosticSeverity.Error));
						continue;
					}

					// MCNP thinks these are equivalent: '#6.5', '#6'
					const int_parse = ParsePureInt(num_string, false);
					if(isNaN(int_parse))
					{
						// MCNP ignores decimals in the cell numbers
						num_parse = parseInt(num_string);
						this.Errors.push(
							CreateErrorDiagnostic(arg, `Avoid using non pure integers to define complementary cell.`, DiagnosticSeverity.Warning));
					}

					if(num_string[0] == '-')
					{
						this.Errors.push(
							CreateErrorDiagnostic(arg, `'-' character not valid for geometry definition.`, DiagnosticSeverity.Error));
						continue;
					}

					if(num_parse == 0)
					{
						this.Errors.push(
							CreateErrorDiagnostic(arg, `0 is an invalid cell ID.`, DiagnosticSeverity.Error));
						continue;
					}

					this.UsedCells.add(num_parse);	
				}
								
				// Surface ID
				else
				{
					const surface_id = Number(arg.Contents);

					// Precense of non-number signals the end of geometry definition
					if(isNaN(surface_id))
						return i;

					if(arg.Contents.match('[eE]'))
					{
						this.Errors.push(
							CreateErrorDiagnostic(arg, `Avoid using scientific notation for surface geometry definition.`, DiagnosticSeverity.Warning));
					}

					if(arg.Contents[0] == '+')
					{
						this.Errors.push(
							CreateErrorDiagnostic(arg, `'+' character not valid for geometry definition.`, DiagnosticSeverity.Error));
						continue;
					}

					if(surface_id == 0)
					{
						this.Errors.push(
							CreateErrorDiagnostic(arg, `0 is an invalid surface ID.`, DiagnosticSeverity.Error));
						continue;
					}
					
					this.UsedSurfaces.add(surface_id);
				}				
			}			
		}

		return args.length;
	}

	private SetKeyValueParameters(args: Array<Argument>, start_index: number)
	{
		this.DataParameters = ExtractKeyValueParameters(args, start_index);
	}

	GetDiagnostics(): Diagnostic[]
	{
		return this.Errors;
	}
}