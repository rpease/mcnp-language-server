/// <reference path="..\\utilities.ts" />
/// <reference path="..\\enumerations.ts" />

import { utilities } from '../utilities';

namespace mcnp
{
	namespace DataCards
	{
		namespace Material
		{
			enum FractionType
			{
				Atomic,
				Mass
			}
			
			class IsotopeEntry
			{
				Z: number;
				A: number;
				Library; String;
				Fraction: number;
				Type: FractionType;
			}

			export class Material
			{
				ID: number;
				Lines: Array<Line>;
				Entries: Array<IsotopeEntry>;
				
				
			
				constructor(lines: Array<Line>)
				{					
					var tag = utilities.SplitStringNumberCombo();
				}
			
				private static ConvertZAID()
				{

				}
			}			
		}

		
	}
}
