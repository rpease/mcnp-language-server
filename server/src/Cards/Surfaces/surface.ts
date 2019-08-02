import { Card } from '../card';
import { SurfaceType, SurfaceModifier } from '../../enumerations';
import { Argument } from '../../File/argument';
import { MCNPArgumentException } from '../../mcnp_exception';

export class Surface extends Card
{
	Type: SurfaceType;
	Transform = null;
	Parameters: Array<Argument>;
	Modifier: SurfaceModifier;
	
	protected DefaultValues: Array<number>;
	
	protected ParseParameter(p: number): Number
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