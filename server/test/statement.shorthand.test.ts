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
		var expected_shorthand = ConvertShorthandFeature(pre_array[pre_array.length-1], shorthand, post_array[0]);

		for (const num of expected_shorthand) 
		{
			let arg = args[arg_index];

			expect(num).to.be.equal(parseFloat(arg.Contents));
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
		var bad_pre = ["a","+","imp:n",""];

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

			expect(statement.Arguments.length).to.be.equal(1 + post_string.length + 1);
			ValidateArguments([pre], shorthand, post_string, statement.Arguments);
		}
	});
});