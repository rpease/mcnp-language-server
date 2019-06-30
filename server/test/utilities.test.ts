import { expect } from 'chai';
import * as utilities from '../src/utilities';
import { Particle } from '../src/enumerations';
import { EPERM } from 'constants';


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
		let expected = [2,2,2,2,2];
		
		let array_input = [];
		array_input.push(['2','5r']);
		array_input.push(['2','5R']);

		array_input.forEach(element => 
		{
			console.log(element);
			CompareArrays(utilities.ConvertShorthandFeature(element[0], element[1]),expected);
		});
	});

	it('ConvertShorthandFeature_Repeat_Space', () => 
	{			
		let expected = [];

		let array_input = [];
		array_input.push(['5','r']);
		array_input.push(['5','R']);

		array_input.forEach(element => 
		{
			console.log(element);
			expect(CompareArrays(utilities.ConvertShorthandFeature(element[0], element[1]), expected));
		});
	});

	// MCNP Ignores bad inputs and will just completely skip over the shorthand
	it('ConvertShorthandFeature_Repeat_Ignore', () => 
	{			
		let expected = [];

		let array_input = [];
		array_input.push(['2','0r']);
		array_input.push(['2','-1R']);

		array_input.forEach(element => 
		{
			console.log(element);
			expect(CompareArrays(utilities.ConvertShorthandFeature(element[0], element[1]),expected));
		});
	});

	// MCNP Ignores bad inputs and will just completely skip over the shorthand
	it('ConvertShorthandFeature_Repeat_Bad', () => 
	{			
		// 1 2.0r 

		// 1 -2.0r 

		// 1 2.1r

		// 1 2e0r 

		// 1 2.1e0r 

		// 1 2e+1r

		// 1 2e-1r

		expect(true).to.be.false;
	});

	it('ConvertShorthandFeature_LinearInterp', () => 
	{				
		var expected = [];
		var string_input = '';
		var array_input = [];

		// 1 2i 4 = 1 2 3 4
		expected = [2,3];
		string_input = '1 2i 4';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 1 2I 4 = 1 2 3 4
		expected = [2,3];
		string_input = '1 2I 4';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 1 2 i 4 = 1 2 3 4
		expected = [3];
		string_input = '2 i 4';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 2 5i 4 = 2 2.33 2.66 3 3.33 3.66 4
		expected = [2.33333,2.66666,3,3.3333333,3.666666];
		string_input = '2 5i 4';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 2 5i 100 = 2 18.33 34.66 51 67.33 83.66 100
		expected = [18.3333333,34.666666,51,67.333333,83.6666666];
		string_input = '2 5i 100';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 2 5 i 30 = 2 5 17.5 30
		expected = [17.5];
		string_input = '5 i 30';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 2 5 1i 30 = 2 5 17.5 30
		expected = [17.5];
		string_input = '5 1i 30';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));		
	});

	it('ConvertShorthandFeature_LinearInterp_Ignore', () => 
	{	
		var expected = [];
		var string_input = '';
		var array_input = [];

		// 2 5 0i 30 = 2 5 30
		expected = [];
		string_input = '5 0i 30';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 2 5 -1i 30 = 2 5 30
		expected = [];
		string_input = '5 -1i 30';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));
	});

	it('ConvertShorthandFeature_LinearInterp_Bad', () => 
	{		
		// 2 5.0i 4

		// 2 -5.0i 4

		// 2 5.1i 4

		// 2 5e0i 4

		// 2 5.0e0i 4
		expect(true).to.be.false;
	});

	it('ConvertShorthandFeature_LogInterp', () => 
	{				
		var expected = [];
		var string_input = '';
		var array_input = [];		

		// 0.01 2ilog 10 = 0.1 4.6416e-1 2.1544 10
		expected = [ 4.6416e-1, 2.1544];
		string_input = '0.01 2ilog 10';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 0.01 2iLoG 10 = 0.1 4.6416e-1 2.1544 10
		expected = [4.6416e-1, 2.1544];
		string_input = '0.01 2iLoG 10';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 0.01 1ilog 10 = 0.1 1 10.0
		expected = [1];
		string_input = '0.01 1ilog 10';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 0.01 2 ilog 10 = 0.1 2 10
		expected = [];
		string_input = '2 ilog 10';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));
	});

	it('ConvertShorthandFeature_LogInterp_Ignore', () => 
	{				
		var expected = [];
		var string_input = '';
		var array_input = [];

		// 0.1 2 0ilog 10 = 0.1 2 10
		expected = [];
		string_input = '2 0ilog 10';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 0.1 2 -1ilog 10 = 0.1 2 10
		expected = [];
		string_input = '2 -1ilog 10';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		expect(true).to.be.false;
	});

	it('ConvertShorthandFeature_LogInterp_Bad', () => 
	{				
		// 0.1 2 2.0ilog 10

		// 0.1 2 -2.0ilog 10

		// 0.1 2 2.1ilog 10

		// 0.1 2 2e0ilog 10

		// 0.1 2 2e+1ilog 10

		expect(true).to.be.false;
	});

	it('ConvertShorthandFeature_Multiply', () => 
	{				
		var expected = [];
		var string_input = '';
		var array_input = [];

		// 1 3m = 1 3
		expected = [3];
		string_input = '1 3m';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 1 -2m = 1 -2
		expected = [-2];
		string_input = '1 -2m';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 2.4 4.2m = 2.4 10.08
		expected = [10.08];
		string_input = '2.4 4.2m';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 5.5 1m = 5.5 5.5
		expected = [5.5];
		string_input = '5.5 1m';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 5.5 0m = 5.5 0
		expected = [0];
		string_input = '5.5 0m';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 1 3e1m = 1 30
		expected = [30];
		string_input = '1 3e1m';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 2.4 3e+1m = 2.4 72
		expected = [72];
		string_input = '2.4 3e+1m';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 1 2.0e-1m = 1 0.2
		expected = [0.2];
		string_input = '1 2.0e-1m';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));
	});

	it('ConvertShorthandFeature_Multiply_Bad', () => 
	{				
		// 1 m

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