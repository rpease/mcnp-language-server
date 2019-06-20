import { Statement } from '../File/statement';
import { Card } from '../Cards/card';
import { Diagnostic, ErrorMessageTracker } from 'vscode-languageserver';

export interface IBlock
{
	Cards: Array<Card>;
	Errors: Diagnostic[];

	ParseStatement(card:Statement): void;
	GetDiagnostics(): Diagnostic[]	
}