import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { Argument } from './File/argument';
import { CreateErrorDiagnostic } from './utilities';

export class MCNPArgumentException extends Error
{
	diagnostic: Diagnostic;
	stack?: string;

	constructor(arg: Argument, message: string, additional_message?: string, severity?: DiagnosticSeverity)
	{
		super();

		if(!severity)
			severity = DiagnosticSeverity.Error;
			
		this.diagnostic = CreateErrorDiagnostic(arg, message, severity, additional_message);
	}
}

export class MCNPException extends Error
{
	stack: string;
	additional_message: string;
	severity = DiagnosticSeverity.Error;

	constructor(message: string, additional_message?: string, severity?: DiagnosticSeverity)
	{
		super();

		if(!severity)
			severity = DiagnosticSeverity.Error;

		this.stack = message;
		this.additional_message = additional_message;
	}

	CreateArgumentException(arg: Argument): MCNPArgumentException
	{
		return new MCNPArgumentException(arg, this.stack, this.additional_message, this.severity);
	}
}