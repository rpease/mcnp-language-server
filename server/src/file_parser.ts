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

enum LineType
{
	StatementStart,
	StatementExtension,
	Comment,
	BlockBreak
}

function GetLineType(line: string): LineType
{
	if(line.match(regex.FULL_LINE_COMMENT_MATCH).length > 0)
	{
		return LineType.Comment;
	}
	else if(line.match(regex.FULL_LINE_COMMENT_MATCH).length > 0)
	{
		return LineType.Comment;
	}	
}