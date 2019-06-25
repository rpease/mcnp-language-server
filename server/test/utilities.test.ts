import { expect } from 'chai';
import * as utilities from '../src/utilities';
import { Particle } from '../src/enumerations';


function CompareArrays(array1, array2): void
{
	expect(array1.length).to.be.equal(array2.length)

	for (let index = 0; index < array1.length; index++) 	
		expect(array1[index]).to.be.equal(array2[index])
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
		const tab_break = 8
		for (let i = 0; i <= 17; i++) 
		{
			console.log(i)
			let line = '';
			for (let j = 0; j < i; j++)
				line += " ";				
			line += "\t";

			let expected_length = Math.ceil((i+1)/tab_break)*tab_break
			
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
		let original = "1RpP"
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
			expect(utilities.ParseOnlyInt(index.toString())).to.be.equal(index);	
	});

	it('ParseOnlyInt_Doubles', () => 
	{				
		for (let i = -100; i < 100; i++)
		{			
			for (let j = 0; j < 10; j++)
			{
				let string_base = i.toString();
				string_base += "." + j.toString();
				expect(utilities.ParseOnlyInt(string_base)).to.be.NaN;
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
					expect(utilities.ParseOnlyInt(string_base)).to.be.NaN;
				}				
			} 	
		}		
	});

	it('ConvertShorthandFeature_Repeat', () => 
	{			
		let expected = [2,2,2,2,2,2];

		let string_input = [];
		string_input.push('2 5r');
		string_input.push('2 5R');
		string_input.push('2 5 r');
		string_input.push('2 5 r ');
		string_input.push(' 2  5   R ');

		let array_input = [];
		array_input.push('2','5','r');
		array_input.push('2','5','R');

		string_input.forEach(element => 
		{
			console.log(element);
			expect(CompareArrays(utilities.ConvertShorthandFeature(element),expected)).to.be.true;
		});

		array_input.forEach(element => 
		{
			console.log(element);
			expect(CompareArrays(utilities.ConvertShorthandFeature(element),expected)).to.be.true;
		});
	});

	// MCNP Ignores bad inputs and will just completely skip over the shorthand
	it('ConvertShorthandFeature_Repeat_Bad', () => 
	{			
		let expected = [2];

		let string_input = [];
		string_input.push('2 0r');
		string_input.push('2 0R');
		string_input.push('2 0 R');
		string_input.push('2 -1 R');
		string_input.push('2 -3 R');

		let array_input = [];
		array_input.push('2','0','r');
		array_input.push('2','-1','R');

		string_input.forEach(element => 
		{
			console.log(element);
			expect(CompareArrays(utilities.ConvertShorthandFeature(element),expected)).to.be.true;
		});

		array_input.forEach(element => 
		{
			console.log(element);
			expect(CompareArrays(utilities.ConvertShorthandFeature(element),expected)).to.be.true;
		});
	});

	it('ConvertShorthandFeature_LinearInterp', () => 
	{				
		// 1 2i 4 = 1 2 3 4

		// 1 2 i 4 = 1 2 3 4

		// 2 5i 4 = 2 2.33 2.66 3 3.33 3.66 4

		// 2 5i 100 = 2 18.33 34.66 51 67.33 83.66 100

		// 2 5 i 30 = 2 5 17.5 30

		// 2 5 1i 30 = 2 5 17.5 30
		
		expect(true).to.be.false;
	});

	it('ConvertShorthandFeature_LinearInterp_Bad', () => 
	{		
		// 2 5 0i 30 = 2 5 30

		// 2 5 -1i 30 = 2 5 30
		expect(true).to.be.false;
	});

	it('ConvertShorthandFeature_LogInterp', () => 
	{				
		// ex.) .01 2ilog 10
		expect(true).to.be.false;
	});

	it('ConvertShorthandFeature_Multiply', () => 
	{				
		// ex.) 1 3m 3m 3m
		expect(true).to.be.false;
	});

	it('ConvertShorthandFeature_Jump', () => 
	{				
		// ex.) 2J 1e-10
		expect(true).to.be.false;
	});

	it('ConvertShorthandFeature_Combinations', () => 
	{				
		// ex.) 1 3m 2r = 1 3 3 3
		// ex.) 1 3m i 5 = 1 3 4 5
		expect(true).to.be.false;
	});

	it('ConvertShorthandFeature_BadCombinations', () => 
	{				
		// ex.) 3j 4r
		// ex.) 1 4i 3m
		// ex.) 1 3i j
		expect(true).to.be.false;
	});

});