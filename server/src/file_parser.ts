import { MCNPFile } from './File/file';
import { TextDocument, Range, Position } from 'vscode-languageserver-types';
import { FileBlock } from './enumerations';
import * as regex from './regexpressions';
import { MCNPLine, Statement } from './File/statement';
import { Block } from './File/block';

export function ParseFile(file: TextDocument): MCNPFile
{
	let mcnp_data = new MCNPFile();

	// Split up entire file into sepearte lines
	let lines = file.getText().split('\n');

	let block = new Block();
	block.Type = FileBlock.Cells;

	let file_position = 0;
	let last_comment: MCNPLine;
	let current_statement = Array<MCNPLine>();
	for (let l = 0; l < lines.length; l++) 
	{
		let newLine = new MCNPLine();
		newLine.Contents = lines[l].replace('\r','');
		newLine.LineNumber = l+1;
		
		var lineType = GetLineType(newLine.Contents);

		if(lineType == LineType.BlockBreak)
		{
			switch(block.Type)
			{
				case FileBlock.Cells:
				{
					mcnp_data.CellBlock = block;
					block = new Block();
					block.Type = FileBlock.Surfaces;
					break;
				}
				case FileBlock.Surfaces:
				{
					mcnp_data.SurfaceBlock = block;
					block = new Block();
					block.Type = FileBlock.Data;
					break;
				}
				case FileBlock.Data:
				{
					mcnp_data.DataBlock = block;

					// todo throw error across all following lines

					return mcnp_data;
				}
			}
		}				
		else if(lineType == LineType.StatementStart)
		{
			if(l == 0)
			{
				mcnp_data.Title = newLine.Contents;
			}
			else
			{
				if(current_statement.length > 0)
				{
					// Create statement
					var newStatement: Statement;
	
					// Add to current block
					block.Statements.push(new Statement(current_statement));
	
					// Erarse previous comment header
					last_comment = null;
				}
	
				current_statement = Array<MCNPLine>();
				current_statement.push(newLine)
			}			
		}
		else if(lineType == LineType.StatementExtension)
		{
			current_statement.push(newLine)
		}
		else if(lineType == LineType.Comment)
		{
			last_comment = newLine;
		}

		file_position += newLine.Contents.length+1;
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

/*export function ParseStatement(lines: Array<string>): Argument
{
	Array
	lines.forEach(element => {
		
	});

	return new Argument();
}
*/

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