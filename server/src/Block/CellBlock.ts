import { IBlock } from './block';
import { Card } from '../Cards/card';
import { Statement } from '../File/statement';
import { stat } from 'fs';

export class CellBlock implements IBlock
{
	Cards = Array<Card>();
	
	ParseStatement(statment: Statement)
	{
		let card: Card;

		card = new Card();
		card.Statement = statment;

		this.Cards.push(card);
	}
}