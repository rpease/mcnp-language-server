import { expect } from 'chai';
import * as utilities from '../src/utilities';
import { Particle } from '../src/enumerations';
import { EPERM } from 'constants';
import { MCNPException } from '../src/mcnp_exception';


function CompareArrays(array1, array2): void
{
	expect(array1.length).to.be.equal(array2.length);

	for (let index = 0; index < array1.length; index++)
	{ 
		var a = array1[index];
		var b = array2[index];

		if(typeof a === "number")		
			expect(Math.abs(a-b)).to.be.lessThan(1e-4);
		else		
			expect(array1[index]).to.be.equal(array2[index]);
	}
}

describe('Utilities', () => 
{
	it('GetParticleFromChar_npe', () => 
	{		
		let test1 = "n";
		let test2 = "p";
		let test3 = "e";
		let test4 = "c";

		expect(utilities.GetParticleFromChar(test1)).to.equal(Particle.neutron);
		expect(utilities.GetParticleFromChar(test2)).to.equal(Particle.photon);
		expect(utilities.GetParticleFromChar(test3)).to.equal(Particle.electron);
		expect(utilities.GetParticleFromChar(test4)).to.equal(Particle.NONE);
	});

	it('GetParticleFromChar_Uppercase', () => 
	{		
		let test1 = "N";
		let test2 = "P";
		let test3 = "E";
		let test4 = "C";

		expect(utilities.GetParticleFromChar(test1)).to.equal(Particle.neutron);
		expect(utilities.GetParticleFromChar(test2)).to.equal(Particle.photon);
		expect(utilities.GetParticleFromChar(test3)).to.equal(Particle.electron);
		expect(utilities.GetParticleFromChar(test4)).to.equal(Particle.NONE);
	});

	it('GetParticleFromChar_Bad', () => 
	{		
		let test1 = "Nn";
		let test2 = "Pe";
		let test3 = "ne";
		let test4 = "Cc";
		
		expect(() => utilities.GetParticleFromChar(test1)).to.throw(Error);
		expect(() => utilities.GetParticleFromChar(test2)).to.throw(Error);
		expect(() => utilities.GetParticleFromChar(test3)).to.throw(Error);
		expect(() => utilities.GetParticleFromChar(test4)).to.throw(Error);
	});

	it('GetCommentText', () => 
	{	
		var comment = "This is the Comment bro c C more butts";
		var tests = Array<string>();
		tests.push("c " + comment);
		tests.push("C " + comment);
		tests.push("c " + comment + "     ");
		tests.push(" c " + comment + "     ");
		tests.push(" c  " + comment + "     ");
		tests.push("  c   " + comment + "     ");
		tests.push("   c    " + comment + "     ");
		
		tests.forEach(test => {
			console.log(test);
			expect(utilities.GetCommentText(test)).to.equal(comment);
		});
	});  

	it('GetCommentText_NoComment', () => 
	{	
		var tests = Array<string>();
		tests.push("c");
		tests.push("C");
		tests.push("c ");
		tests.push("c  ");
		tests.push(" c  ");
		tests.push("  c   ");		
		tests.forEach(test => {
			console.log(test);
			expect(utilities.GetCommentText(test)).to.equal("");
		});

	}); 

	it('SplitStringNumberCombo_Standard', () => 
	{		
		let test1 = "M4";
		let test2 = "si100";
		let test3 = "*Fm314";
		let test4 = "+F15a";
		
		CompareArrays(utilities.SplitStringNumberCombo(test1),["M",4, ""]);
		CompareArrays(utilities.SplitStringNumberCombo(test2),["si",100, ""]);
		CompareArrays(utilities.SplitStringNumberCombo(test3),["Fm",314, "*"]);
		CompareArrays(utilities.SplitStringNumberCombo(test4),["F",15, "+"]);
	});

	it('ReplaceTabs_Basic', () => 
	{		
		const tab_break = 8;
		for (let i = 0; i <= 17; i++) 
		{
			console.log(i);
			let line = '';
			for (let j = 0; j < i; j++)
				line += " ";				
			line += "\t";

			let expected_length = Math.ceil((i+1)/tab_break)*tab_break;
			
			expect(utilities.ReplaceTabsInLine(line, tab_break).length).to.be.equal(expected_length);
		}		
	});
	
	it('ReplaceTabs', () => 
	{		
		// Strings that MCNP considers length 81
		let length_81_1 = "1 RPP 1 2  -10 1  8   					                        8";
		let length_81_2 = "1 RPP 1 2  -10 10  -8 							        8";
		let length_81_3 = "1 RPP 1 2  -10 							                8";
		
		let new_line = utilities.ReplaceTabsInLine(length_81_1);
		
		expect(utilities.ReplaceTabsInLine(length_81_1).length).to.equal(81);
		expect(utilities.ReplaceTabsInLine(length_81_2).length).to.equal(81);
		expect(utilities.ReplaceTabsInLine(length_81_3).length).to.equal(81);
	});  

	it('CaseInsensitiveCompare', () => 
	{				
		let original = "1RpP";
		expect(utilities.CaseInsensitiveCompare(original,"1rpp")).to.be.true;
		expect(utilities.CaseInsensitiveCompare(original,"1Rpp")).to.be.true;
		expect(utilities.CaseInsensitiveCompare(original,"1rpP")).to.be.true;
		expect(utilities.CaseInsensitiveCompare(original,"1rPp")).to.be.true;
		expect(utilities.CaseInsensitiveCompare(original,original)).to.be.true;
		expect(utilities.CaseInsensitiveCompare(original,"1RPP")).to.be.true;
		expect(utilities.CaseInsensitiveCompare(original,"1Rppp")).to.be.false;
	}); 
	
	it('ParseOnlyInt_Integers', () => 
	{				
		for (let index = -100; index < 100; index++) 	
		{
			var pure_int_string = index.toString();

			expect(utilities.ParsePureInt(pure_int_string, true)).to.be.equal(index);
			expect(utilities.ParsePureInt(pure_int_string, false)).to.be.equal(index);
		}	
				
	});

	it('ParseOnlyInt_Doubles', () => 
	{				
		for (let i = -100; i < 100; i++)
		{			
			for (let j = 0; j < 10; j++)
			{
				let string_base = i.toString();
				string_base += "." + j.toString();

				expect(() => utilities.ParsePureInt(string_base, true)).to.throw(MCNPException);
				expect(utilities.ParsePureInt(string_base, false)).to.be.NaN;
			} 	
		}		
	});
	
	it('ParseOnlyInt_Scientific', () => 
	{				
		for (let i = -100; i < 100; i++)
		{
			let string_base = i.toString();
			for (let j = 0; j < 10; j++)
			{
				for (let e = -2; e < 3; e++)
				{
					let string_base = i.toString();
					string_base += "." + j.toString();
					string_base += "E" + e.toString();					
					
					expect(() => utilities.ParsePureInt(string_base, true)).to.throw(MCNPException);
					expect(utilities.ParsePureInt(string_base, false)).to.be.NaN;
				}				
			} 	
		}		
	});

	it('ParseOnlyInt_TrailingString', () => 
	{				
		for (let index = -100; index < 100; index++)
		{
			let bad_string = index.toString() + 'abcfg';

			expect(() => utilities.ParsePureInt(bad_string, true)).to.throw(MCNPException);
			expect(utilities.ParsePureInt(bad_string, false)).to.be.NaN;
		} 						
	});

	it('ParseOnlyInt_Nonsense', () => 
	{				
		let nonsense = ['a','-','+','$','c','@',')','?'];
		for (const bad of nonsense) 
		{
			expect(() => utilities.ParsePureInt(bad, true)).to.throw(MCNPException);
			expect(utilities.ParsePureInt(bad, false)).to.be.NaN;
		}							
	});
});