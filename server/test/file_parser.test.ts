import { expect } from 'chai';
import * as fp from '../src/file_parser';
import { Particle } from '../src/enumerations';

describe('FileParser', () => 
{
	it('GetLineType_FullLineComment', () => 
	{		
		let good = Array();
		good.push("c ----------------- Cell Cards -----------------");
		good.push("C ----------------- Cell Cards -----------------");
		good.push(" c still a comment");
		good.push("  C still a comment");
		good.push("   c still a comment");
		good.push("    C still a comment");
		good.push("     c still a comment");
		good.push("     c M83 1001.00c 1.0 ");

		let bad = Array();
		bad.push("      c not a comment");
		bad.push("cThis is not a comment");

		good.forEach(element => {
			expect(fp.GetLineType(element)).to.equal(fp.LineType.Comment)
		});

		bad.forEach(element => {
			expect(fp.GetLineType(element)).to.not.equal(fp.LineType.Comment)
		});
	});	
});