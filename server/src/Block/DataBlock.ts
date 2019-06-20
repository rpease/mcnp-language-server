import { IBlock } from './block';
import { Card } from '../Cards/card';
import { Statement } from '../File/statement';
import { Diagnostic } from 'vscode-languageserver';

export class DataBlock implements IBlock
{
	Errors: Diagnostic[];
	Cards = Array<Card>();
	
	ParseStatement(statement: Statement)
	{
		let card: Card;

		card = new Card();
		card.Statement = statement;

		this.Cards.push(card);
	}

	GetDiagnostics(): Diagnostic[]
	{
		return this.Errors;
	}
}