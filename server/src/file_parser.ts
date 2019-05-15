import { MCNPFile } from './File/file';
import { TextDocument } from 'vscode-languageserver-types';
import { FileBlock } from './enumerations';
import * as regex from './regexpressions';
import { Line } from './line';

export function ParseFile(file: TextDocument): MCNPFile
{
	let mcnp_data: MCNPFile;

	// Replace tabs with 4 spaces
	// Split up entire file into sepearte lines
	let lines = file.getText().replace("\\t","    ").split('\n');

	GetLines(file.getText());

	let block = FileBlock.Cells;	

	for (let l = 0; l < lines.length; l++) 
	{
		const line = lines[l];	
		
		var lineType = GetLineType(line);

		if(lineType == LineType.BlockBreak)		
			block += 1;

		
		
	}

	return mcnp_data;
}

export enum LineType
{
	StatementStart,
	StatementExtension,
	Comment,
	BlockBreak
}

class MCNPLine
{
	LineNumber: number;
	Contents: string;

}

export function GetLineType(line: string): LineType
{
	if(line.match(regex.FULL_LINE_COMMENT_MATCH) != null)
	{
		return LineType.Comment;
	}
	else if(line.match(regex.STATEMENT_EXTENSION_MATCH) != null)
	{
		return LineType.StatementExtension;
	}
	else if(line.match(regex.BLOCK_BREAK_MATCH) != null)
	{
		return LineType.BlockBreak;
	}
	else
	{
		return LineType.StatementStart;
	}
}

export function ParseStatement(lines: Array<string>): Argument
{
	Array
	lines.forEach(element => {
		
	});

	return new Argument();
}

export function GetLines(file: string):Array<MCNPLine>
{
	let lines = Array<MCNPLine>();
	let pattern = /^(.*)\\n/g;
	let m: RegExpExecArray | null;

	while (m = pattern.exec(file))
	{
		var newLine = new MCNPLine();
	}	

	return lines;
}