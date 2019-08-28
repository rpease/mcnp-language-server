import { IBlock } from './block';
import { Card } from '../Cards/card';
import { Statement } from '../File/statement';
import { Cell } from '../Cards/Cells/cell';
import { Diagnostic } from 'vscode-languageserver';

export class CellBlock implements IBlock
{
	Errors: Diagnostic[] = [];
	Cards = Array<Card>();
	
	ParseStatement(statement: Statement)
	{
		let card = new Cell(statement);
		this.Cards.push(card);

		this.Errors = this.Errors.concat(card.GetDiagnostics());
	}

	GetDiagnostics(): Diagnostic[]
	{
		return this.Errors;
	}
}