import { Statement } from '../File/statement';
import { Card } from '../Cards/card';

export interface IBlock
{
	Cards: Array<Card>;
	ParseStatement(card:Statement): void;
}