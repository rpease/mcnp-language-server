import { Diagnostic } from 'vscode-languageserver';

export class MCNPException extends Error
{
	diagnostic: Diagnostic;
	stack?: string;
}