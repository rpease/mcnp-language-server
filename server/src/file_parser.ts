import { MCNPFile } from './File/file';
import { TextDocument, Range, Position } from 'vscode-languageserver-types';
import {Diagnostic} from 'vscode-languageserver';
import { Statement } from './File/statement';
import { IBlock } from './Block/block';
import { utils } from 'mocha';
import { GetCommentText, ReplaceTabsInLine } from './utilities';
import { CellBlock } from './Block/CellBlock';
import { SurfaceBlock } from './Block/SurfaceBlock';
import { DataBlock } from './Block/DataBlock';
import { LineType, MCNPLine } from './File/MCNPLines';
import { FileBlock } from './enumerations';

export function ParseFile(file: TextDocument): [MCNPFile, Diagnostic[]]
{
	let mcnp_data = new MCNPFile();
	let diagnostics: Diagnostic[] = [];

	// Split up entire file into sepearte lines
	let lines = file.getText().split('\n');

	let contents: Array<Array<Statement>>;
	contents = GetStatementsFromInput(file.getText());

	let block: IBlock;
	let block_type = FileBlock.Cells;
	for(const statements of contents)
	{
		if(block_type == FileBlock.Cells)
			block = new CellBlock();
		else if(block_type == FileBlock.Surfaces)
			block = new SurfaceBlock();
		else if(block_type == FileBlock.Data)
			block = new DataBlock();

		for (const statement of statements)
		{
			diagnostics = diagnostics.concat(statement.GetDiagnostics());
			block.ParseStatement(statement)
		}			

		if(block instanceof CellBlock)
			mcnp_data.CellBlock = block;
		else if(block instanceof SurfaceBlock)
			mcnp_data.SurfaceBlock = block;
		else if(block instanceof DataBlock)
			mcnp_data.DataBlock = block;	
			
		block_type += 1;
	}

	// todo throw error for not having enough blocks
	return [mcnp_data,diagnostics];
}

export function GetStatementsFromInput(input_file: string): Array<Array<Statement>>
{
	let input_statements = new Array<Array<Statement>>();

	let last_comment: MCNPLine;
	let current_statement = Array<MCNPLine>();

	let current_block = FileBlock.Cells;

	// Split up entire file into sepearte lines
	let lines = input_file.split('\n');

	input_statements.push(new Array<Statement>());

	for (let l = 0; l < lines.length; l++) 
	{
		// Create MCNPLine
		let newLine = new MCNPLine(lines[l].replace('\r',''), l);
		
		var lineType = newLine.Type;

		if(lineType == LineType.BlockBreak
			|| lineType == LineType.StatementStart)
		{
			if(current_statement.length > 0)
			{
				let new_statement = new Statement(current_statement,last_comment)			

				input_statements[current_block].push(new_statement);

				// Erase previous comment header
				last_comment = null;

				// Reset current statement array to start collecting new lines
				current_statement = Array<MCNPLine>();
			}

			if(lineType == LineType.BlockBreak)
			{
				current_block += 1;				

				// All blocks MCNP cares about has been read.
				// All text after is completely unused
				if(current_block == FileBlock.NA)
					return input_statements		
					
				input_statements.push(new Array<Statement>());
			}
			else
			{
				// Ignore the title card
				if(l != 0)	
					current_statement.push(newLine);		
			}			
		}		
		else if(lineType == LineType.StatementExtension)		
			current_statement.push(newLine);		
		else if(lineType == LineType.Comment)	
		{
			last_comment = newLine;
			last_comment.RawContents = GetCommentText(last_comment.MCNPInterpretation);

			if(last_comment.RawContents == "")
				last_comment = null;
		}
	}

	return input_statements;
}