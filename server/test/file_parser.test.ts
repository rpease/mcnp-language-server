import { expect } from 'chai';
import * as fp from '../src/file_parser';
import { Particle } from '../src/enumerations';

function GetCommentSamples(): Array<string>
{
	let comments = Array();
	comments.push("c ----------------- Cell Cards -----------------");
	comments.push("C ----------------- Cell Cards -----------------");
	comments.push(" c still a comment");
	comments.push("  C still a comment");
	comments.push("   c still a comment");
	comments.push("    C still a comment");
	comments.push("     c still a comment");
	comments.push("     c M83 1001.00c 1.0 ");

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
	statements.push("     M1 7014 78.084 8016 20.946 18000 0.46 $ Comment");
	statements.push("cThis is not a comment");

	return statements;
}

function GetStatementExtensionSamples(): Array<string>
{
	let extensions = Array();
	extensions.push("      u=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("       u=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("        u=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("         u=1 lat=1 erg=2.3 $ input parameters");
	extensions.push("      cThis is not a comment");
	extensions.push("      0.25Y 0 0.75v2 0 0 0 0 0 0 0");

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

describe('FileParser', () => 
{
	it('GetLineType_FullLineComment', () => 
	{
		GetCommentSamples().forEach(element => {
			expect(fp.GetLineType(element)).to.equal(fp.LineType.Comment)
		});		
	});	

	it('GetLineType_Statement', () => 
	{	
		GetStatementSamples().forEach(element => {
			expect(fp.GetLineType(element)).to.equal(fp.LineType.StatementStart)
		});		
	});	

	it('GetLineType_StatementExtension', () => 
	{	
		GetStatementExtensionSamples().forEach(element => {
			expect(fp.GetLineType(element)).to.equal(fp.LineType.StatementExtension)
		});		
	});	

	it('GetLineType_Block', () => 
	{	
		GetBlockSamples().forEach(element => {
			expect(fp.GetLineType(element)).to.equal(fp.LineType.BlockBreak)
		});		
	});	
});