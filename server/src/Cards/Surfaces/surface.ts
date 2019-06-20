import { Card } from '../card';
import { SurfaceType, SurfaceModifier } from '../../enumerations';

export class Surface extends Card
{
	Type: SurfaceType;
	Transform = null;
	Parameters: Array<Number>;
	Modifier: SurfaceModifier;
}