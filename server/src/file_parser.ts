import { MCNPFile } from './File/file';
import { TextDocument } from 'vscode-languageserver-types';
import { FileBlock } from './enumerations';
import * as regex from './regexpressions';

export function ParseFile(file: TextDocument): MCNPFile
{
	let mcnp_data: MCNPFile;

	let lines = file.getText().split('\n');

	let block = FileBlock.Cells;	

	for (let l = 0; l < lines.length; l++) 
	{
		const line = lines[l];		
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