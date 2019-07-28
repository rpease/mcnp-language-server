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

	let previous_line_type: LineType;
	let auto_statement_extension = false;

	for (let l = 0; l < lines.length; l++) 
	{
		// Ignore the first line (Title Card)
		if(l == 0)
			continue;

		// Create MCNPLine
		let newLine = new MCNPLine(lines[l].replace('\r',''), l);
		
		// If previous line had a '&'
		if(auto_statement_extension)
		{
			newLine.Type = LineType.StatementExtension;
			auto_statement_extension = false;
		}

		var lineType = newLine.Type;

		if(lineType == LineType.BlockBreak
			|| lineType == LineType.StatementStart)
		{
			// If the line has a '&' the next line is automatically an extension of the current
			// statement
			if(newLine.RawContents.indexOf('&') != -1)
				auto_statement_extension = true;

			if(current_statement.length > 0)
			{
				let new_statement = new Statement(current_statement,last_comment);			

				input_statements[current_block].push(new_statement);

				// Erase previous comment header
				last_comment = null;

				// Reset current statement array to start collecting new lines
				current_statement = Array<MCNPLine>();
			}

			if(lineType == LineType.BlockBreak)
			{
				// Two block breaks in a row signal the end of the input file
				if(previous_line_type == LineType.BlockBreak)
				{
					input_statements.pop();
					return input_statements;
				}					

				current_block += 1;				

				// All blocks MCNP cares about has been read.
				// All text after is completely unused
				if(current_block == FileBlock.NA)
					return input_statements		
					
				input_statements.push(new Array<Statement>());
			}
			else				
				current_statement.push(newLine);		
						
		}		
		else if(lineType == LineType.StatementExtension)
		{
			current_statement.push(newLine);

			// If the line has a '&' the next line is automatically an extension of the current
			// statement
			if(newLine.RawContents.indexOf('&') != -1)
				auto_statement_extension = true;
		}		
					
		else if(lineType == LineType.Comment)	
		{
			last_comment = newLine;
			last_comment.RawContents = GetCommentText(last_comment.MCNPInterpretation);

			if(last_comment.RawContents == "")
				last_comment = null;
		}

		previous_line_type = lineType;
	}

	// If there is no extra-line at the end of the file,
	// we need to deal with the last statement we were building
	if(current_statement.length > 0)
	{
		let new_statement = new Statement(current_statement,last_comment);
		input_statements[current_block].push(new_statement);
	}

	// If last block is empty, just throw it away.
	if(input_statements[current_block].length == 0)
		input_statements.pop();

	return input_statements;
}