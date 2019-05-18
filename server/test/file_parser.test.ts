import { expect } from 'chai';
import * as fp from '../src/file_parser';
import { TextDocument, Range, Position } from 'vscode-languageserver-types';
import { readSync, readFileSync } from 'fs';

function GetCommentSamples(): Array<string>
{
	let comments = Array();
	comments.push("c ----------------- Cell Cards -----------------");
	comments.push("C ----------------- Cell Cards -----------------");
	comments.push(" c still a comment");
	comments.push("  C still a comment");
	comments.push("   c still a comment");
	comments.push("    C still a comment");
	comments.push("    c M83 1001.00c 1.0 ");
	comments.push("    C ");
	comments.push("   c");
	comments.push("  C  ");
	comments.push(" c");
	comments.push("c");
	comments.push("c\r");
	comments.push("c ");

	return comments;
}

function GetStatementSamples(): Array<string>
{
	let statements = Array();
	statements.push("16 14 -2.831e-3 (-32 -27 28) imp:n=200 imp:p=1  $ BF3 ");
	statements.push("900 rpp -50 50 121.9 135 40 270");
	statements.push("M1 7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("This is the title line of the file.");
	statements.push(" M1 7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("  M1 7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("   M1 7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("    M1 7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("    M1 7014 78.084 8016 20.946 18000 0.46 $ Comment");
	statements.push("cThis is not a comment");

	return statements;
}

function GetStatementExtensionSamples(): Array<string>
{
	let extensions = Array();
	extensions.push("     u=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("      u=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("       u=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("        u=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("     cThis is not a comment");
	extensions.push("     c This is also not a comment");
	extensions.push("     0.25Y 0 0.75v2 0 0 0 0 0 0 0");

	return extensions;
}

// This is an alternate way to declare a function
const getTextDocument = (file_path: string): TextDocument => {

	// This will genrate a text document
	return TextDocument.create(
		// uri, can probably be empty string
		'file://mcnp',
		// language id
		'mncp', 
		// version number, not sure what it should be
		1,
		// the file source
		readFileSync(file_path,'utf8')
	);
};

function GetBlockSamples(): Array<string>
{
	let blocks = Array();
	blocks.push("");
	blocks.push(" ");
	blocks.push("  ");
	blocks.push("   ");
	blocks.push("    ");
	blocks.push("     ");
	blocks.push("      ");
	blocks.push("       ");
	blocks.push("        ");
	blocks.push("         ");

	return blocks;
}

describe('FileParser', () => 
{
	it('GetLineType_FullLineComment', () => 
	{
		GetCommentSamples().forEach(element => {
			console.log(element);
			expect(fp.GetLineType(element)).to.equal(fp.LineType.Comment)
		});		
	});	

	it('GetLineType_Statement', () => 
	{	
		GetStatementSamples().forEach(element => {
			console.log(element);
			expect(fp.GetLineType(element)).to.equal(fp.LineType.StatementStart)
		});		
	});	

	it('GetLineType_StatementExtension', () => 
	{	
		GetStatementExtensionSamples().forEach(element => {
			console.log(element);
			expect(fp.GetLineType(element)).to.equal(fp.LineType.StatementExtension)
		});		
	});	

	it('GetLineType_Block', () => 
	{	
		GetBlockSamples().forEach(element => {
			console.log(element);
			expect(fp.GetLineType(element)).to.equal(fp.LineType.BlockBreak)
		});		
	});	

	it('ParseFile', () => 
	{	
		fp.ParseFile(getTextDocument("test\\test.i"));
	});	
});