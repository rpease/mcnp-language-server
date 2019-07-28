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

	it('&_Simple', () => 
	{	
		let text =`This is the title card
2 2 5.0		-2 3 100 & $ Half-Sphere
imp:n=2 &
imp:p=1
666 0 #1 #2 #100 imp:n=0 $Graveyard`

		let blocks = fp.GetStatementsFromInput(text);

		expect(blocks.length).to.be.equal(1);
		expect(blocks[0].length).to.be.equal(2);
		expect(blocks[0][0].Arguments[0].Contents).to.be.equal('2');
		expect(blocks[0][1].Arguments[0].Contents).to.be.equal('666');

		// & are replaced by empty strings
		// remember = are also replaced by empty strings
		expect(blocks[0][0].Arguments.length).to.be.equal(10);
		expect(blocks[0][0].Arguments[9].Contents).to.be.equal('1');
	});

	it('&_Complex', () => 
	{	
		let text =`This is the title card
2 2 5.0		-2 3 100 && $ Half-Sphere
imp:n=2 &
    C This is a comment
  imp:p=1 & 1 2 3 4 5 6 7 8 9 $ All this should be ignored after the &
           vol=5
666 0 #1 #2 #100 imp:n=0 $Graveyard`

		let blocks = fp.GetStatementsFromInput(text);

		expect(blocks.length).to.be.equal(1);
		expect(blocks[0].length).to.be.equal(2);
		expect(blocks[0][0].Arguments[0].Contents).to.be.equal('2');
		expect(blocks[0][1].Arguments[0].Contents).to.be.equal('666');

		// & are replaced by empty strings
		// remember = are also replaced by empty strings
		expect(blocks[0][0].Arguments.length).to.be.equal(12);

		expect(blocks[0][0].Arguments[11].Contents).to.be.equal('5');
	});

	it('NormalExtension', () => 
	{	
		let text =`This is the title card
FMESH4:n geom=xyz
	  EINTS= 0 1 2
	  IINTS= 1
	  IMESH= 6
	  imp:n=4
EC4 5 6 7 8
FC4 This is the fmesh comment card
`

		let blocks = fp.GetStatementsFromInput(text);

		expect(blocks.length).to.be.equal(1);
		expect(blocks[0].length).to.be.equal(3);
		expect(blocks[0][0].Arguments[0].Contents).to.be.equal('FMESH4:n');
		expect(blocks[0][2].Arguments[0].Contents).to.be.equal('FC4');
	});

	it('NormalExtension_NoLastLine', () => 
	{	
		let text =`This is the title card
FMESH4:n geom=xyz
	  EINTS= 0 1 2
	  IINTS= 1
	  IMESH= 6
	  imp:n=4
EC4 5 6 7 8
FC4 This is the fmesh comment card`

		let blocks = fp.GetStatementsFromInput(text);

		expect(blocks.length).to.be.equal(1);
		expect(blocks[0].length).to.be.equal(3);
		expect(blocks[0][0].Arguments[0].Contents).to.be.equal('FMESH4:n');
		expect(blocks[0][2].Arguments[0].Contents).to.be.equal('FC4');
	});

	it('NormalExtension_WithComments', () => 
	{	
		let text =`This is the title card
FMESH4:n geom=xyz
	  EINTS= 0 1 2 $ Energy bins
	  IINTS= 1
	  IMESH= 6
  C Below is the neutron importance
	  imp:n=4
EC4 5 6 7 8
FC4 This is the fmesh comment card`

		let blocks = fp.GetStatementsFromInput(text);

		expect(blocks.length).to.be.equal(1);
		expect(blocks[0].length).to.be.equal(3);
		expect(blocks[0][0].Arguments[0].Contents).to.be.equal('FMESH4:n');
		expect(blocks[0][2].Arguments[0].Contents).to.be.equal('FC4');
	});

	it('BlockRecognition', () => 
	{	
		let text =`This is the title card
c Cell Cards
1 -1 imp:n=1
666 1 imp:n=0

c Surface Cards
1 RPP -5 -1m  -1m -1m  -1m -1m

c Data Cards
nps 1e6
f4:n 1
c Random comment
fc4 tally of dreams
sdef pos=0 0 0 erg=5 par=1

`
		let blocks = fp.GetStatementsFromInput(text);

		expect(blocks.length).to.be.equal(3);

		// Cell Block
		expect(blocks[0].length).to.be.equal(2);
		
		// Surface Block
		expect(blocks[1].length).to.be.equal(1);

		// Surface Block
		expect(blocks[2].length).to.be.equal(4);
	});

	it('BlockRecognition_IgnorePostData', () => 
	{	
		let text =`This is the title card
c Cell Cards
1 -1 imp:n=1
666 1 imp:n=0

c Surface Cards
1 RPP -5 -1m  -1m -1m  -1m -1m

c Data Cards
nps 1e6
f4:n 1
c Random comment
fc4 tally of dreams
sdef pos=0 0 0 erg=5 par=1

C Fake block
5 1 rpp 1 2  1 2  0 500 $ who knows
M5 1001.80c 2.0
       8016.00c 1.0

`
		let blocks = fp.GetStatementsFromInput(text);

		expect(blocks.length).to.be.equal(3);

		// Cell Block
		expect(blocks[0].length).to.be.equal(2);
		
		// Surface Block
		expect(blocks[1].length).to.be.equal(1);

		// Surface Block
		expect(blocks[2].length).to.be.equal(4);
	});

	it('BlockRecognition_DoubleEmptyLines', () => 
	{	
		let text =`This is the title card
c Cell Cards
1 -1 imp:n=1
666 1 imp:n=0


c Surface Cards
1 RPP -5 -1m  -1m -1m  -1m -1m

c Data Cards
nps 1e6
f4:n 1
c Random comment
fc4 tally of dreams
sdef pos=0 0 0 erg=5 par=1

C Fake block
5 1 rpp 1 2  1 2  0 500 $ who knows
M5 1001.80c 2.0
       8016.00c 1.0

`
		let blocks = fp.GetStatementsFromInput(text);

		expect(blocks.length).to.be.equal(1);

		// Cell Block
		expect(blocks[0].length).to.be.equal(2);
	});
});