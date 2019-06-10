import { MCNPFile } from './File/file';
import { TextDocument, Range, Position } from 'vscode-languageserver-types';
import {Diagnostic} from 'vscode-languageserver';
import * as regex from './regexpressions';
import { MCNPLine, Statement } from './File/statement';
import { IBlock } from './Block/block';
import { utils } from 'mocha';
import { GetCommentText, ReplaceTabsInLine } from './utilities';
import { CellBlock } from './Block/CellBlock';
import { SurfaceBlock } from './Block/SurfaceBlock';
import { DataBlock } from './Block/DataBlock';

export function ParseFile(file: TextDocument): [MCNPFile, Diagnostic[]]
{
	let mcnp_data = new MCNPFile();
	let diagnostics: Diagnostic[] = [];

	// Split up entire file into sepearte lines
	let lines = file.getText().split('\n');

	let block: IBlock;

	// First block is always Cells
	block = new CellBlock();

	let last_comment: MCNPLine;
	let current_statement = Array<MCNPLine>();
	for (let l = 0; l < lines.length; l++) 
	{
		console.log(l);

		let line = ReplaceTabsInLine(lines[l]);
		
		// Create MCNPLine
		let newLine = 
		{
			Contents: line.replace('\r',''),
			LineNumber: l
		}
		
		// Determine what type of line this is
		var lineType = GetLineType(newLine.Contents);

		if(lineType == LineType.BlockBreak
			|| lineType == LineType.StatementStart)
		{
			if(current_statement.length > 0)
			{
				let new_statement = new Statement(current_statement,last_comment)

				diagnostics = diagnostics.concat(new_statement.GetDiagnostics());

				// Add to current block
				block.ParseStatement(new_statement);

				// Erase previous comment header
				last_comment = null;

				// Reset current statement array to start collecting new lines
				current_statement = Array<MCNPLine>();
			}

			if(lineType == LineType.BlockBreak)
			{
				if(block instanceof CellBlock)
				{
					mcnp_data.CellBlock = block;
					block = new SurfaceBlock();
				}
				else if(block instanceof SurfaceBlock)
				{
					mcnp_data.SurfaceBlock = block;
					block = new DataBlock();
				}
				else if(block instanceof DataBlock)
				{
					mcnp_data.DataBlock = block;

					// todo have warnings for all lines past this point

					return [mcnp_data,diagnostics];
				}				
			} // end if BlockBreak
			else
			{
				if(l == 0)				
					mcnp_data.Title = newLine.Contents;	
				else					
					current_statement.push(newLine);		
			}			
		}		
		else if(lineType == LineType.StatementExtension)		
			current_statement.push(newLine);		
		else if(lineType == LineType.Comment)	
		{
			last_comment = newLine;
			last_comment.Contents = GetCommentText(last_comment.Contents);

			if(last_comment.Contents == "")
				last_comment = null;
		}
	}

	// todo throw error for not having enough blocks
	return [mcnp_data,diagnostics];
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