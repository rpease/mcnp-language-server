import { Card } from '../card';
import { Diagnostic } from 'vscode-languageserver';
import { DensityType } from '../../enumerations';
import { Statement } from '../../File/statement';

export class Cell extends Card
{
	MaterialID: number;
	Density: number;
	DensityUnits: DensityType;

	BasicGeometry: Array<number>;
	DataParameters: Map<string, string>;

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
	}

	GetDiagnostics(): Diagnostic[]
	{
		return this.Errors;
	}
}