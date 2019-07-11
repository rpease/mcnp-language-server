import { expect } from 'chai';
import * as st from '../src/File/statement';
import { Argument } from '../src/File/argument';
import { ConvertShorthandFeature } from '../src/utilities';

function StringToStatement(text:string,line_num:number=0):st.Statement
{
    var mcnp_lines = new Array<st.MCNPLine>();

    text.split('\n').forEach(line => 
    {
        var mcnp_line = new st.MCNPLine();

        mcnp_line.Contents = line;
        mcnp_line.LineNumber = line_num;        

        line_num += 1;

        mcnp_lines.push(mcnp_line);
    });	

    return new st.Statement(mcnp_lines, null);
}

function ArrayToString(text: Array<string>): string
{
	let outstring = '';
	text.forEach(element => 
	{
		outstring += element + ' ';
	});
	return outstring;
}

function ValidateArguments(pre_array: Array<string>, shorthand: string, 
	post_array: Array<string>, args: Array<Argument>)
{
	let arg_index = 0;
	let expected_position = 0;

	for (const text of pre_array) 
	{
		let arg = args[arg_index];

		expect(text).to.be.equal(arg.Contents);
		expect(expected_position).to.be.equal(arg.FilePosition.character);

		arg_index += 1;
		expected_position += text.length;
		expected_position += 1; // space in-between arguments
	}	

	try {

		let pre = null;
		if(pre_array.length > 0)
			pre = pre_array[pre_array.length-1];

		var expected_shorthand = ConvertShorthandFeature(pre, shorthand, post_array[0]);

		for (const num of expected_shorthand) 
		{
			let arg = args[arg_index];

			expect(parseFloat(num)).to.be.equal(parseFloat(arg.Contents));
			expect(expected_position).to.be.equal(arg.FilePosition.character);

			arg_index += 1;
		}
	} catch (MCNPException) 
	{
		let arg = args[arg_index];

		expect(shorthand).to.be.equal(arg.Contents);
		expect(expected_position).to.be.equal(arg.FilePosition.character);
		
		arg_index += 1;
	}		
	
	expected_position += shorthand.length;
	expected_position += 1; // space in-between arguments

	for (const text of post_array) 
	{
		let arg = args[arg_index];

		expect(text).to.be.equal(arg.Contents);
		expect(expected_position).to.be.equal(arg.FilePosition.character);

		arg_index += 1;
		expected_position += text.length;
		expected_position += 1; // space in-between arguments
	}	
}

describe('Statement_Shorthand_Replacement', () => 
{
	it('Repeat_Normal', () =>
	{
		let preceding_arg = '3';
		let post_arg = '0';

		let pre_string = ['IMP:n','1','2',preceding_arg];
		let post_string = [post_arg];
		let line_num = 10;

		///////////////////////////////////////////////////////

		let pre = ArrayToString(pre_string);
		let post = ArrayToString(post_string);	

		for(let i = 1; i < 81; i++)
		{
			let shorthand = i.toString() + 'r';

			let line_string = pre + shorthand + " " + post;
			let statement = StringToStatement(line_string, line_num);

			expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + i);
			ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
		}
	});

	it('Repeat_Ignore', () =>
	{
		let preceding_arg = '3';
		let post_arg = '0';

		let pre_string = ['IMP:n','1','2',preceding_arg];
		let post_string = [post_arg];
		let line_num = 10;

		///////////////////////////////////////////////////////

		let pre = ArrayToString(pre_string);
		let post = ArrayToString(post_string);	

		for(let i = -50; i < 1; i++)
		{
			let shorthand = i.toString() + 'r';

			let line_string = pre + shorthand + " " + post;
			let statement = StringToStatement(line_string, line_num);

			expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length);
			ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
		}
	});

	it('Repeat_Nothing', () =>
	{
		let preceding_arg = '3';
		let post_arg = '0';

		let pre_string = ['IMP:n','1','2',preceding_arg];
		let post_string = [post_arg];
		let line_num = 10;

		///////////////////////////////////////////////////////

		let pre = ArrayToString(pre_string);
		let post = ArrayToString(post_string);	
		
		let shorthand = 'r';

		let line_string = pre + shorthand + " " + post;
		let statement = StringToStatement(line_string, line_num);

		expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
		ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);		
	});

	it('Repeat_BadNum', () =>
	{
		// Bad arguments for the number of numbers added
		var bad_n = ["2.0","-2.0","2e0","2e+1","2e-1"];

		let preceding_arg = '3';
		let post_arg = '0';

		let pre_string = ['IMP:n','1','2',preceding_arg];
		let post_string = [post_arg];
		let line_num = 10;

		///////////////////////////////////////////////////////

		let pre = ArrayToString(pre_string);
		let post = ArrayToString(post_string);

		for (const bad of bad_n)
		{
			let shorthand = bad.toString() + 'r';

			let line_string = pre + shorthand + " " + post;
			let statement = StringToStatement(line_string, line_num);

			expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
			ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
		}
	});

	it('Repeat_BadPre', () =>
	{
		var bad_pre = ["a","+","imp:n"];

		let post_arg = '0';
		
		let post_string = [post_arg];
		let line_num = 10;

		///////////////////////////////////////////////////////
		
		let post = ArrayToString(post_string);

		for (const bad of bad_pre)
		{	
			let pre = bad;

			let shorthand = '2r';

			let line_string = pre + " " + shorthand + " " + post;
			let statement = StringToStatement(line_string, line_num);

			expect(statement.Arguments.length).to.be.equal(post_string.length + 2);
			ValidateArguments([pre], shorthand, post_string, statement.Arguments);
		}
	});

	it('Repeat_Empty', () =>
	{
		let line_num = 10;

		let shorthand = '2r';
		let post = '4 5'
		let line = `${shorthand} ${post}`;

		let statement = StringToStatement(line, line_num);

		expect(statement.Arguments.length).to.be.equal(3); // ['2r','4','5']
		ValidateArguments([], shorthand, post.split(' '), statement.Arguments);	
	});

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

	it('Linear_Normal', () =>
	{		
		let line_num = 10;

		///////////////////////////////////////////////////////		
		
		for (let i = -10; i < 10; i++) 
		{
			for (let j = -10; j < 10; j++) 
			{
				let pre_string = ['IMP:n','1','2',i.toString()];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);

				for (let n = 1; n < 10; n++) 
				{
					let shorthand = n.toString() + 'i';

					let line_string = pre + shorthand + " " + post;
					let statement = StringToStatement(line_string, line_num);

					expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + n);
					ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
				}
			}			
		}
	});

	it('Linear_Ignore', () =>
	{		
		let line_num = 10;

		///////////////////////////////////////////////////////		
		
		for (let i = -10; i < 10; i++) 
		{
			for (let j = -10; j < 10; j++) 
			{
				let pre_string = ['E4','1','2',i.toString()];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);

				for (let n = -10; n <= 0; n++) 
				{
					let shorthand = n.toString() + 'i';

					let line_string = pre + shorthand + " " + post;
					let statement = StringToStatement(line_string, line_num);

					expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 0);
					ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
				}
			}			
		}
	});

	it('Linear_Nothing', () =>
	{		
		let line_num = 10;

		///////////////////////////////////////////////////////		
		
		for (let i = -10; i < 10; i++) 
		{
			for (let j = -10; j < 10; j++) 
			{
				let pre_string = ['E4','1','2',i.toString()];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);
				
				let shorthand = 'i';

				let line_string = pre + shorthand + " " + post;
				let statement = StringToStatement(line_string, line_num);

				expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
				ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
				
			}			
		}
	});

	it('Linear_BadNum', () =>
	{		
		// Bad arguments for the number of numbers added
		var bad_n = ["2.0","-2.0","2e0","2e+1","2e-1"];
		
		let line_num = 10;

		///////////////////////////////////////////////////////		
		
		for (let i = -10; i < 10; i++) 
		{
			for (let j = -10; j < 10; j++) 
			{
				let pre_string = ['E4','1','2',i.toString()];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);

				for (const bad of bad_n)
				{
					let shorthand = bad.toString() + 'i';

					let line_string = pre + shorthand + " " + post;
					let statement = StringToStatement(line_string, line_num);
	
					expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
					ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
				}				
			}			
		}
	});	

	it('Linear_BadPre', () =>
	{
		var bad_pre = ["a","+","imp:n"];

		let line_num = 12;

		for (const bad of bad_pre)
		{	
			for (let j = -10; j < 10; j++) 
			{
				let pre_string = ['E4','1','2', bad];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);
				
				let shorthand = '2i';

				let line_string = pre + shorthand + " " + post;
				let statement = StringToStatement(line_string, line_num);

				expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
				ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);							
			}
		}
	});

	it('Linear_BadPost', () =>
	{
		var bad_post = ["a","+","imp:n"];

		let line_num = 12;

		for (const bad of bad_post)
		{	
			for (let j = -10; j < 10; j++) 
			{
				let pre_string = ['E4','1','2', j.toString()];
				let post_string = [bad,'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);
				
				let shorthand = '2i';

				let line_string = pre + shorthand + " " + post;
				let statement = StringToStatement(line_string, line_num);

				expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
				ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);							
			}
		}
	});

	it('Linear_BadPrePost', () =>
	{
		var bad_prepost = ["a","+","imp:n"];

		let line_num = 12;

		for (const bad_pre of bad_prepost)
		{	
			for (const bad_post of bad_prepost)
			{	
				for (let j = -10; j < 10; j++) 
				{
					let pre_string = ['E4','1','2', bad_pre];
					let post_string = [bad_post,'5','9'];	
					
					let pre = ArrayToString(pre_string);
					let post = ArrayToString(post_string);
					
					let shorthand = '2i';

					let line_string = pre + shorthand + " " + post;
					let statement = StringToStatement(line_string, line_num);

					expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
					ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);							
				}
			}
		}
	});

	it('Linear_Empty', () =>
	{
		//////////////////////////////////////////////////////////////////////////////////////////////
		// Empty Pre
		let line_num = 10;

		let shorthand = '2i';
		let post = '4 5'
		let line = `${shorthand} ${post}`;

		let statement = StringToStatement(line, line_num);

		expect(statement.Arguments.length).to.be.equal(3); // ['2r','4','5']
		ValidateArguments([], shorthand, post.split(' '), statement.Arguments);	

		//////////////////////////////////////////////////////////////////////////////////////////////
		// Empty Post
		line_num = 10;

		shorthand = '2i';
		let pre = '4 5'
		line = `${pre} ${shorthand}`;

		statement = StringToStatement(line, line_num);

		expect(statement.Arguments.length).to.be.equal(3); // ['4','5','2r']
		ValidateArguments(pre.split(' '), shorthand, [], statement.Arguments);	

		//////////////////////////////////////////////////////////////////////////////////////////////
		// Empty Pre and Post

		line_num = 10;

		shorthand = '2i';
		line = `${shorthand}`;

		statement = StringToStatement(line, line_num);

		expect(statement.Arguments.length).to.be.equal(1); // ['2r']
		ValidateArguments([], shorthand, [], statement.Arguments);	
	});

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

	it('Log_Normal', () =>
	{		
		let line_num = 10;

		///////////////////////////////////////////////////////		
		
		for (let i = 1; i < 20; i++) 
		{
			for (let j = 1; j < 20; j++) 
			{
				let pre_string = ['IMP:n','1','2',i.toString()];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);

				for (let n = 1; n < 10; n++) 
				{
					let shorthand = n.toString() + 'iLoG';

					let line_string = pre + shorthand + " " + post;
					let statement = StringToStatement(line_string, line_num);

					expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + n);
					ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
				}
			}			
		}
	});

	it('Log_Ignore', () =>
	{		
		let line_num = 10;

		///////////////////////////////////////////////////////		
		
		for (let i = 1; i < 20; i++) 
		{
			for (let j = 1; j < 20; j++) 
			{
				let pre_string = ['E4','1','2',i.toString()];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);

				for (let n = -10; n <= 0; n++) 
				{
					let shorthand = n.toString() + 'iLoG';

					let line_string = pre + shorthand + " " + post;
					let statement = StringToStatement(line_string, line_num);

					expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 0);
					ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
				}
			}			
		}
	});

	it('Log_Nothing', () =>
	{		
		let line_num = 10;

		///////////////////////////////////////////////////////		
		
		for (let i = 1; i < 20; i++) 
		{
			for (let j = 1; j < 20; j++) 
			{
				let pre_string = ['E4','1','2',i.toString()];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);
				
				let shorthand = 'iLoG';

				let line_string = pre + shorthand + " " + post;
				let statement = StringToStatement(line_string, line_num);

				expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length);
				ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
				
			}			
		}
	});

	it('Log_BadNum', () =>
	{		
		// Bad arguments for the number of numbers added
		var bad_n = ["2.0","-2.0","2e0","2e+1","2e-1"];
		
		let line_num = 10;

		///////////////////////////////////////////////////////		
		
		for (let i = 1; i < 20; i++) 
		{
			for (let j = 1; j < 20; j++) 
			{
				let pre_string = ['E4','1','2',i.toString()];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);

				for (const bad of bad_n)
				{
					let shorthand = bad + 'iLoG';

					let line_string = pre + shorthand + " " + post;
					let statement = StringToStatement(line_string, line_num);

					expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
					ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
				}
			}			
		}
	});	

	it('Log_BadPre', () =>
	{
		var bad_pre = ["a","+","imp:n","-2","-1","0"];

		let line_num = 12;

		for (const bad of bad_pre)
		{	
			for (let j = 1; j < 20; j++) 
			{
				let pre_string = ['E4','1','2', bad];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);
				
				let shorthand = '2ilog';

				let line_string = pre + shorthand + " " + post;
				let statement = StringToStatement(line_string, line_num);

				expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
				ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);							
			}
		}
	});

	it('Log_BadPost', () =>
	{
		var bad_post = ["a","+","imp:n","-2","-1","0"];

		let line_num = 12;

		for (const bad of bad_post)
		{	
			for (let j = 1; j < 20; j++) 
			{
				let pre_string = ['E4','1','2', j.toString()];
				let post_string = [bad,'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);
				
				let shorthand = '2iog';

				let line_string = pre + shorthand + " " + post;
				let statement = StringToStatement(line_string, line_num);

				expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
				ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);							
			}
		}
	});

	it('Log_BadPrePost', () =>
	{
		var bad_prepost = ["a","+","imp:n","-2","-1","0"];

		let line_num = 12;

		for (const bad_pre of bad_prepost)
		{	
			for (const bad_post of bad_prepost)
			{	
				for (let j = 1; j < 20; j++) 
			{
					let pre_string = ['E4','1','2', bad_pre];
					let post_string = [bad_post,'5','9'];	
					
					let pre = ArrayToString(pre_string);
					let post = ArrayToString(post_string);
					
					let shorthand = '2ilog';

					let line_string = pre + shorthand + " " + post;
					let statement = StringToStatement(line_string, line_num);

					expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
					ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);							
				}
			}
		}
	});

	it('Log_Empty', () =>
	{
		//////////////////////////////////////////////////////////////////////////////////////////////
		// Empty Pre
		let line_num = 10;

		let shorthand = '2ilog';
		let post = '4 5'
		let line = `${shorthand} ${post}`;

		let statement = StringToStatement(line, line_num);

		expect(statement.Arguments.length).to.be.equal(3); // ['2ilog','4','5']
		ValidateArguments([], shorthand, post.split(' '), statement.Arguments);	

		//////////////////////////////////////////////////////////////////////////////////////////////
		// Empty Post
		line_num = 10;

		shorthand = '2ilog';
		let pre = '4 5'
		line = `${pre} ${shorthand}`;

		statement = StringToStatement(line, line_num);

		expect(statement.Arguments.length).to.be.equal(3); // ['4','5','2log']
		ValidateArguments(pre.split(' '), shorthand, [], statement.Arguments);	

		//////////////////////////////////////////////////////////////////////////////////////////////
		// Empty Pre and Post

		line_num = 10;

		shorthand = '2ilog';
		line = `${shorthand}`;

		statement = StringToStatement(line, line_num);

		expect(statement.Arguments.length).to.be.equal(1); // ['2log']
		ValidateArguments([], shorthand, [], statement.Arguments);	
	});

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

	it('Multiply_Normal', () =>
	{		
		let line_num = 10;

		///////////////////////////////////////////////////////		
		
		for (let i = -10; i < 10; i++) 
		{
			for (let j = -10; j < 10; j++) 
			{
				let pre_string = ['E4','1','2',i.toString()];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);

				for (let n = -10.0; n < 10.0; n += 0.5) 
				{
					let shorthand = n.toString() + 'm';

					let line_string = pre + shorthand + " " + post;
					let statement = StringToStatement(line_string, line_num);

					expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
					ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
				}
			}			
		}
	});

	it('Multiply_Nothing', () =>
	{		
		let line_num = 10;

		///////////////////////////////////////////////////////		
		
		for (let i = -10; i < 10; i++) 
		{
			for (let j = -10; j < 10; j++) 
			{
				let pre_string = ['E4','1','2',i.toString()];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);
				
				let shorthand = 'm';

				let line_string = pre + shorthand + " " + post;
				let statement = StringToStatement(line_string, line_num);

				expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
				ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);				
			}			
		}
	});

	it('Multiply_GoodNum', () =>
	{		
		// Bad arguments for the number of numbers added
		var bad_n = ["2.1","-2.4","2e1","2.4e+1","2.7e-1"];
		
		let line_num = 10;

		///////////////////////////////////////////////////////		
		
		for (let i = -10; i < 10; i++) 
		{
			for (let j = -10; j < 10; j++) 
			{
				let pre_string = ['E4','1','2',i.toString()];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);

				for (const bad of bad_n)
				{
					let shorthand = bad.toString() + 'm';

					let line_string = pre + shorthand + " " + post;
					let statement = StringToStatement(line_string, line_num);

					expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
					ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);
				}				
			}			
		}
	});	

	it('Multiply_BadPre', () =>
	{
		var bad_pre = ["a","+","imp:n"];

		let line_num = 12;

		for (const bad of bad_pre)
		{	
			for (let j = -10; j < 20; j++) 
			{
				let pre_string = ['E4','1','2', bad];
				let post_string = [j.toString(),'5','9'];	
				
				let pre = ArrayToString(pre_string);
				let post = ArrayToString(post_string);
				
				let shorthand = '2m';

				let line_string = pre + shorthand + " " + post;
				let statement = StringToStatement(line_string, line_num);

				expect(statement.Arguments.length).to.be.equal(pre_string.length + post_string.length + 1);
				ValidateArguments(pre_string, shorthand, post_string, statement.Arguments);							
			}
		}
	});

	it('Multiply_Empty', () =>
	{
		//////////////////////////////////////////////////////////////////////////////////////////////
		// Empty Pre
		let line_num = 10;

		let shorthand = '2m';
		let post = '4 5'
		let line = `${shorthand} ${post}`;

		let statement = StringToStatement(line, line_num);

		expect(statement.Arguments.length).to.be.equal(3); // ['2ilog','4','5']
		ValidateArguments([], shorthand, post.split(' '), statement.Arguments);	

		//////////////////////////////////////////////////////////////////////////////////////////////
		// Empty Post
		line_num = 10;

		shorthand = '2m';
		let pre = '4 5'
		line = `${pre} ${shorthand}`;

		statement = StringToStatement(line, line_num);

		expect(statement.Arguments.length).to.be.equal(3); // ['4','5','2log']
		ValidateArguments(pre.split(' '), shorthand, [], statement.Arguments);	

		//////////////////////////////////////////////////////////////////////////////////////////////
		// Empty Pre and Post

		line_num = 10;

		shorthand = '2m';
		line = `${shorthand}`;

		statement = StringToStatement(line, line_num);

		expect(statement.Arguments.length).to.be.equal(1); // ['2log']
		ValidateArguments([], shorthand, [], statement.Arguments);	
	});

});