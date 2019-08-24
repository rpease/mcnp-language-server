import { TextDocument, Range, Position } from 'vscode-languageserver-types';
import { expect } from 'chai';
import { MCNPLine, LineType } from '../src/File/MCNPLines';

export function GetCommentSamples(): Array<string>
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

	// Tabs after C (from notepad++)
	comments.push(" c	still a comment");
	comments.push("  C	still a comment");
	comments.push("   c	still a comment");
	comments.push("    C	still a comment");
	comments.push("    c	M83 1001.00c 1.0 ");

	// Tab Characters after C
	comments.push(" c\tstill a comment");
	comments.push("  C\tstill a comment");
	comments.push("   c\tstill a comment");
	comments.push("    C\tstill a comment");
	comments.push("    c\tM83 1001.00c 1.0 ");

	return comments;
}

function GetStatementSamples(): Array<string>
{
	let statements = Array();
	statements.push("16 14 -2.831e-3 (-32 -27 28) imp:n=200 imp:p=1  $ BF3 ");
	statements.push("900 rpp -50 50 121.9 135 40 270");
	statements.push("This is the title line of the file.");
	statements.push("M1 7014 78.084 8016 20.946 18000 0.46 ");	
	statements.push(" M1 7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("  M1 7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("   M1 7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("    M1 7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("    M1 7014 78.084 8016 20.946 18000 0.46 $ Comment");
	statements.push("cThis is not a comment");

	// Tabs after C (from notepad++)
	statements.push("M1	7014 78.084 8016 20.946 18000 0.46 ");	
	statements.push(" M1	7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("  M1	7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("   M1	7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("    M1	7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("    M1	7014 78.084 8016 20.946 18000 0.46 $ Comment");

	// Tab Characters after C
	statements.push("M1\t7014 78.084 8016 20.946 18000 0.46 ");	
	statements.push(" M1\t7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("  M1\t7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("   M1\t7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("    M1\t7014 78.084 8016 20.946 18000 0.46 ");
	statements.push("    M1\t7014 78.084 8016 20.946 18000 0.46 $ Comment");

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

	// Tabs Before (notepad++)
	extensions.push("	u=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("	 u=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("	  u=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("	   u=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("	    cThis is not a comment");
	extensions.push("	     c This is also not a comment");
	extensions.push("		0.25Y 0 0.75v2 0 0 0 0 0 0 0");	

	// Tab characters before
	extensions.push("\tu=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("\tu=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("\tu=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("\tu=1 lat=1 erg=2.3 $ input parameters");

	// Tabs after first argument (notepad++)
	extensions.push("     u=1	lat=1 erg=2.3 $ input parameters");
	extensions.push("      u=1	lat=1 erg=2.3 $ input parameters");
	extensions.push("       u=1	lat=1 erg=2.3 $ input parameters");
	extensions.push("        u=1	lat=1 erg=2.3 $ input parameters");

	// Tab characters after first argument
	extensions.push("     u=1\tlat=1 erg=2.3 $ input parameters");
	extensions.push("      u=1\tlat=1 erg=2.3 $ input parameters");
	extensions.push("       u=1\tlat=1 erg=2.3 $ input parameters");
	extensions.push("        u=1\tlat=1 erg=2.3 $ input parameters");

	return extensions;
}

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

describe('MCNPLine', () => 
{
	it('FullLineComment', () => 
	{
		for (const text of GetCommentSamples()) 
		{
			console.log(text);
			for (let index = 0; index < 10; index++) 
			{
				var line = new MCNPLine(text, index);
				expect(line.Type).to.equal(LineType.Comment);			
			}
		}	
	});	

	it('Statement', () => 
	{	
		for (const text of GetStatementSamples()) 
		{
			console.log(text);
			for (let index = 0; index < 10; index++) 
			{
				var line = new MCNPLine(text, index);
				expect(line.Type).to.equal(LineType.StatementStart);			
			}
		}		
	});	

	it('GetLineType_StatementExtension', () => 
	{	
		for (const text of GetStatementExtensionSamples()) 
		{
			console.log(text);
			for (let index = 0; index < 10; index++) 
			{
				var line = new MCNPLine(text, index);
				expect(line.Type).to.equal(LineType.StatementExtension);			
			}
		}	
	});	

	it('GetLineType_Block', () => 
	{	
		for (const text of GetBlockSamples()) 
		{
			console.log(text);
			for (let index = 0; index < 10; index++) 
			{
				var line = new MCNPLine(text, index);
				expect(line.Type).to.equal(LineType.BlockBreak);			
			}
		}	
	});	

	it('EqualSignReplacement', () => 
	{	
		let text = [];
		let expected = [];
		
		text.push(    '2 9 -1.0 (#4:-5): -10 imp:n=6 Vol = 3 imp:p 5 10');
		expected.push('2 9 -1.0 (#4:-5): -10 imp:n 6 Vol   3 imp:p 5 10');

		text.push(    '2 9 -1.0 (#4:-5): -10 imp:n==6 Vol= = 3 imp:p= =5 10');
		expected.push('2 9 -1.0 (#4:-5): -10 imp:n  6 Vol    3 imp:p   5 10');

		for (let i = 0; i < text.length; i++) 
		{
			var line = new MCNPLine(text[i], 1);

			expect(line.RawContents).to.be.equal(text[i]);
			expect(line.MCNPInterpretation).to.be.equal(expected[i]);			
		}
	});	
});

