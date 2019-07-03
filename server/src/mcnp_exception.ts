import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { Argument } from './File/argument';
import { CreateErrorDiagnostic } from './utilities';

export class MCNPArgumentException extends Error
{
	diagnostic: Diagnostic;
	stack?: string;

	constructor(arg: Argument, message: string, additional_message: string)
	{
		super();
		this.diagnostic = CreateErrorDiagnostic(arg, message, DiagnosticSeverity.Error, additional_message);
	}
}

export class MCNPException extends Error
{
	stack: string;
	additional_message: string

	constructor(message: string, additional_message: string)
	{
		super();
		this.stack = message;
		this.additional_message = additional_message;
	}
}