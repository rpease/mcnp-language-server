import { IBlock } from './block';
import { Card } from '../Cards/card';
import { Statement } from '../File/statement';

export class SurfaceBlock implements IBlock
{
	Cards = Array<Card>();
	
	ParseStatement(statement: Statement)
	{
		let card: Card;

		card = new Card();
		card.Statement = statement;

		this.Cards.push(card);
	}
}