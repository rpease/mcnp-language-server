import { IBlock } from './block';
import { Card } from '../Cards/card';
import { Statement } from '../File/statement';
import { stat } from 'fs';
import { Diagnostic } from 'vscode-languageserver';

export class CellBlock implements IBlock
{
	Errors: Diagnostic[];
	Cards = Array<Card>();
	
	ParseStatement(statment: Statement)
	{
		let card: Card;

		card = new Card();
		card.Statement = statment;

		this.Cards.push(card);
	}

	GetDiagnostics(): Diagnostic[]
	{
		return this.Errors;
	}
}