import { expect } from 'chai';
import * as fp from '../src/file_parser';
import { TextDocument, Range, Position } from 'vscode-languageserver-types';
import { readSync, readFileSync } from 'fs';

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

describe('FileParser', () => 
{
	it('ParseFile', () => 
	{	
		fp.ParseFile(getTextDocument("test\\test.i"));
	});	
});

describe('GetStatementsFromInput', () => 
{
	it('EmptyTitleCard', () => 
	{	
		let text =`		
1 1 -10.0  -1 100 imp:n=1
2 2 5.0		-2 3 100 imp:n=2 $ Half-Sphere`

		let blocks = fp.GetStatementsFromInput(text);

		expect(blocks.length).to.be.equal(1);
		expect(blocks[0].length).to.be.equal(2);
	});		

	it('IgnoreTitleCard_CellCard', () => 
	{	
		let text =`1 -10.0  -1 100 imp:n=1
2 2 5.0		-2 3 100 imp:n=2 $ Half-Sphere`

		let blocks = fp.GetStatementsFromInput(text);

		expect(blocks.length).to.be.equal(1);
		expect(blocks[0].length).to.be.equal(1);
		expect(blocks[0][0].Arguments[0].Contents).to.be.equal('2');
	});	

	it('IgnoreTitleCard_Comment', () => 
	{	
		let text =`C This is a comment bro
2 2 5.0		-2 3 100 imp:n=2 $ Half-Sphere`

		let blocks = fp.GetStatementsFromInput(text);

		expect(blocks.length).to.be.equal(1);
		expect(blocks[0].length).to.be.equal(1);
		expect(blocks[0][0].Arguments[0].Contents).to.be.equal('2');
	});	

	it('IgnoreTitleCard_StatementExtension', () => 
	{	
		let text =`        IINTS=40 EINTS= 4 5 5 $ comment bro
2 2 5.0		-2 3 100 imp:n=2 $ Half-Sphere`

		let blocks = fp.GetStatementsFromInput(text);

		expect(blocks.length).to.be.equal(1);
		expect(blocks[0].length).to.be.equal(1);
		expect(blocks[0][0].Arguments[0].Contents).to.be.equal('2');
	});	
});