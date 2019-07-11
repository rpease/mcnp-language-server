import { expect } from 'chai';
import * as utilities from '../src/utilities';
import { MCNPException } from '../src/mcnp_exception';

function CompareArrays(test, expected): void
{
	expect(test.length).to.be.equal(expected.length);

	for (let index = 0; index < expected.length; index++)
	{ 
		var a = test[index];
		var b = expected[index];

		if(typeof b === "number")
		{
			if(typeof b === "string")
				b = parseFloat(b);
			expect(Math.abs(a-b)).to.be.lessThan(1e-4);
		}			
		else		
			expect(test[index]).to.be.equal(expected[index]);
	}
}

describe('ShorthandInput', () => 
{
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

	it('ConvertShorthandFeature_Repeat_Nothing', () => 
	{			
		let expected = [5.5];

		let array_input = [];
		array_input.push(['5.5','r']);
		array_input.push(['5.5','R']);

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

	it('ConvertShorthandFeature_Repeat_BadNum', () => 
	{			
		// Bad arguments for the number of numbers added
		var bad_n = ["2.0","-2.0","2e0","2e+1","2e-1"];
	
		var preceding = "2";
		bad_n.forEach(element => 
		{			
			element += "r";
			expect(() => utilities.ConvertShorthandFeature(preceding, element),"Should have thrown and error.").to.throw(MCNPException);
		});
	});

	it('ConvertShorthandFeature_Repeat_BadPre', () => 
	{			
		// Bad arguments for the pre/post arguments
		var bad_pre_post = ["abc","#4","-","5r","5i","2j","3m","4ilog",""];

		var preceding: string;
		var shorthand = "2r";

		bad_pre_post.forEach(element => 
		{
			expect(() => utilities.ConvertShorthandFeature(element, shorthand), "Should have thrown and error.").to.throw(MCNPException);
		});
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
		string_input = '5 1I 30';
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

	it('ConvertShorthandFeature_LinearInterp_BadNum', () => 
	{		
		// Bad arguments for the number of numbers added
		var bad_n = ["2.0","-2.0","2e0","2e+1","2e-1"];
	
		var preceding = "2";
		var post = "10";
		bad_n.forEach(element => 
		{			
			element += "i";
			expect(() => utilities.ConvertShorthandFeature(preceding, element, post),"Should have thrown and error.").to.throw(MCNPException);
		});
	});

	it('ConvertShorthandFeature_LinearInterp_BadPrePost', () => 
	{		
		// Bad arguments for the pre/post arguments
		var bad_pre_post = ["abc","#4","-","5r","5i","2j","3m","4ilog",""];

		var preceding: string;
		var post: string;
		var shorthand = "2i";

		for (let i = 0; i <= bad_pre_post.length; i++) 
		{
			if(i==0)
				preceding = "2"; // Good pre
			else
				preceding = bad_pre_post[i];

			for (let j = 0; j <= bad_pre_post.length; j++) 
			{
				if(j==0)
					post = "10"; // Good post
				else
					post = bad_pre_post[j];

				if(i==0 && j==0)
					utilities.ConvertShorthandFeature(preceding, shorthand, post);
				else				
					expect(() => utilities.ConvertShorthandFeature(preceding, shorthand, post), "Should have thrown and error.").to.throw(MCNPException);
			}			
		}	
	});

	it('ConvertShorthandFeature_LogInterp', () => 
	{				
		var expected = [];
		var string_input = '';
		var array_input = [];		

		// 0.01 2ilog 10 = 0.01 0.1 1.0 10
		expected = [ 0.1, 1.0];
		string_input = '0.01 2ilog 10';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 0.01 2iLoG 10 = 0.01 0.1 1.0 10
		expected = [ 0.1, 1.0];
		string_input = '0.01 2iLoG 10';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 0.01 1ilog 10 = 0.01 3.1623E-01 10.0
		expected = [3.1623E-01];
		string_input = '0.01 1ILOG 10';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));
	});

	it('ConvertShorthandFeature_LogInterp_Ignore', () => 
	{				
		var expected = [];
		var string_input = '';
		var array_input = [];

		// 0.01 2 ilog 10 = 0.01 2 10
		expected = [];
		string_input = '2 ilog 10';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

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
	});

	it('ConvertShorthandFeature_LogInterp_BadNum', () => 
	{	
		// Bad arguments for the number of numbers added
		var bad_n = ["2.0","-2.0","2e0","2e+1","2e-1"];
	
		var preceding = "2";
		var post = "10";
		bad_n.forEach(element => 
		{			
			element += "ilog";
			expect(() => utilities.ConvertShorthandFeature(preceding, element, post),"Should have thrown and error.").to.throw(MCNPException);
		});		
	});

	it('ConvertShorthandFeature_LogInterp_BadPrePost', () => 
	{	
		// Bad arguments for the pre/post arguments
		var bad_pre_post = ["abc","#4","-","5r","5i","2j","3m","4ilog",""];

		var preceding: string;
		var post: string;
		var shorthand = "2ilog";

		for (let i = 0; i <= bad_pre_post.length; i++) 
		{
			if(i==0)
				preceding = "2"; // Good pre
			else
				preceding = bad_pre_post[i];

			for (let j = 0; j <= bad_pre_post.length; j++) 
			{
				if(j==0)
					post = "10"; // Good post
				else
					post = bad_pre_post[j];

				if(i==0 && j==0)
					utilities.ConvertShorthandFeature(preceding, shorthand, post);
				else				
					expect(() => utilities.ConvertShorthandFeature(preceding, shorthand, post), "Should have thrown and error.").to.throw(MCNPException);
			}			
		}		
	});

	it('ConvertShorthandFeature_LogInterp_NegativePrePost', () => 
	{	
		var shorthand = "2ilog";

		for(let i = -10; i < 10; i++)
		{
			for(let j = -10; j < 10; j++)
			{
				if(i <= 0 || j <= 0)
				expect(() => utilities.ConvertShorthandFeature(i.toString(), shorthand, j.toString()), "Should have thrown and error.").to.throw(MCNPException);
			}
		}			
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
		string_input = '1 -2M';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 2.4 4.2m = 2.4 10.08
		expected = [10.08];
		string_input = '2.4 4.2m';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 5.5 1m = 5.5 5.5
		expected = [5.5];
		string_input = '5.5 1M';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 5.5 0m = 5.5 0
		expected = [0];
		string_input = '5.5 0m';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 1 3e1m = 1 30
		expected = [30];
		string_input = '1 3e1M';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 2.4 3e+1m = 2.4 72
		expected = [72];
		string_input = '2.4 3e+1m';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		// 1 2.0e-1m = 1 0.2
		expected = [0.2];
		string_input = '1 2.0e-1M';
		array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));
	});

	it('ConvertShorthandFeature_Multiply_BadPre', () => 
	{				
		// Bad arguments for the pre/post arguments
		var bad_pre_post = ["abc","#4","-","5r","5i","2j","3m","4ilog"];

		var preceding: string;
		var shorthand = "2m";

		bad_pre_post.forEach(element => 
		{
			expect(() => utilities.ConvertShorthandFeature(element, shorthand), "Should have thrown and error.").to.throw(MCNPException);
		});
	});

	it('ConvertShorthandFeature_Multiply_BadNum', () => 
	{			
		for (let i = -10; i < 10; i++) 
		{
			expect(() => utilities.ConvertShorthandFeature(i.toString(), "m"), "Should have thrown and error.").to.throw(MCNPException);			
		}			
	});

	it('ConvertShorthandFeature_Jump', () => 
	{				
		// ex.) 3 2J 1e-10 = 3 ? ? 1e-10
		var expected = ['j','j'];
		var string_input = '3 2j 1e-10';
		var array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		var expected = ['j'];
		var string_input = '3 J 1e-10';
		var array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		var expected = ['j'];
		var string_input = '3 1J 1e-10';
		var array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		var expected = ['j'];
		var string_input = 'taco 1j 1e-10';
		var array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));

		var expected = ['j'];
		var string_input = '3 1J taco';
		var array_input = string_input.split(' ');
		expect(CompareArrays(utilities.ConvertShorthandFeature(array_input[0], array_input[1], array_input[2]),expected));
	});

	it('ConvertShorthandFeature_Jump_BadNum', () => 
	{			
		// Bad arguments for the number of numbers added
		var bad_n = ["2.0","-2.0","2e0","2e+1","2e-1","-1","-2","0"];
	
		var preceding = "2";
		bad_n.forEach(element => 
		{			
			element += "j";
			expect(() => utilities.ConvertShorthandFeature(preceding, element),"Should have thrown and error.").to.throw(MCNPException);
		});	
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

	it('ConvertShorthandFeature_Bad_Mnemonics', () => 
	{			
		let pre = '100';
		let post = '500';
		let good_arg = '2';

		let good_mnemonics = ['r','m','i','ilog','j']

		let bad_trailing = ['r','m','i','ilog','j','+','2','abc']
		
		for (const good of good_mnemonics) 
		{
			for (const bad of bad_trailing) 
			{
				var shorthand = good_arg + good + bad;
				console.log(shorthand);

				expect(() => utilities.ConvertShorthandFeature(pre, shorthand, post),"Should have thrown and error.").to.throw(MCNPException);
			}
		}
	});

	it('ConvertShorthandFeature_No_Mnemonics', () => 
	{			
		let pre = '100';
		let post = '500';

		let bad_shorthand = ['2','',' ','3$','3h','3q','3log','|'];		

		for (const b of bad_shorthand) 
		{
			expect(() => utilities.ConvertShorthandFeature(pre, b, post),"Should have thrown and error.").to.throw(MCNPException);
		}		
	});
});