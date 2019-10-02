import { expect } from 'chai';
import { MCNPLine } from '../src/File/MCNPLines';
import { Statement } from '../src/File/statement';
import { Cell } from '../src/Cards/Cells/cell';
import { MCNPException, MCNPArgumentException } from '../src/mcnp_exception';
import { SurfaceModifier, DensityType } from '../src/enumerations';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';

function StringToStatement(text:string): Statement
{
    var mcnp_lines = new Array<MCNPLine>();

	let line_num = 1;
    text.split('\n').forEach(line => 
    {
        var mcnp_line = new MCNPLine(line, line_num);      

        line_num += 1;

        mcnp_lines.push(mcnp_line);
    });	

	return new Statement(mcnp_lines, null);
}

function StringToCell(text: string): Cell
{
	let statement = StringToStatement(text);
	return new Cell(statement);
}

describe('Cell', () => 
{
	it('SimpleCell', () => 
	{
		let cell_ids = [1, 2, 3, 99999];
		let materials = [1, 2, 3, 4, 999];
		let densities = [-1.0, -2.0, -3, 1.0, 2.0, 3.0];
		let surfaces = ['2 3 4 -10','3:4.2: -8','(-10:8):(5.3 3 -3 8) -666']

		let expected_surfaces = [[2, 3, 4, -10],
								[3, 4.2, -8],
								[-10, 8, 5.3, 3, -3, -666]];

		for (const id of cell_ids) 
		{
			for (const mat of materials) 
			{
				for (const d of densities) 
				{
					for(let s = 0; s < surfaces.length; s++) 
					{
						let cell_string = `${id} ${mat} ${d} ${surfaces[s]}`;
						console.log(cell_string);
						let cell = StringToCell(cell_string);

						expect(cell.ID).to.be.equal(id);

						expect(cell.MaterialID).to.be.equal(mat);

						if(d < 0.0)
							expect(cell.DensityUnits).to.be.equal(DensityType.Mass);
						else if(d > 0.0)
							expect(cell.DensityUnits).to.be.equal(DensityType.Atomic);
						else
							expect(cell.DensityUnits).to.be.equal(DensityType.Void);

						expect(cell.Density).to.be.equal(d);

						expect(cell.UsedSurfaces.size).to.be.equal(expected_surfaces[s].length);
						for (let e = 0; e < cell.UsedSurfaces.size; e++)
							expect(cell.UsedSurfaces.has(expected_surfaces[s][e])).to.be.true;											
					}
				}
			}
		}
	});		

	it('VoidCell', () => 
	{
		let cell_ids = [1,2,3,99999];
		let materials = [0];
		let surfaces = ['2 3 4 -10','3:4.2: -8','(-10:8):(5.3 3 -3 8) -666']

		let expected_surfaces = [[2, 3, 4, -10],
								[3, 4.2, -8],
								[-10, 8, 5.3, 3, -3, -666]];

		for (const id of cell_ids) 
		{
			for (const mat of materials) 
			{				
				for(let s = 0; s < surfaces.length; s++) 
				{
					let cell_string = `${id} ${mat} ${surfaces[s]}`;
					console.log(cell_string);
					let cell = StringToCell(cell_string);

					expect(cell.ID).to.be.equal(id);

					expect(cell.MaterialID).to.be.equal(mat);
					
					expect(cell.DensityUnits).to.be.equal(DensityType.Void);

					expect(cell.Density).to.be.equal(0.0);

					expect(cell.UsedSurfaces.size).to.be.equal(expected_surfaces[s].length);
					for (let e = 0; e < cell.UsedSurfaces.size; e++)
						expect(cell.UsedSurfaces.has(expected_surfaces[s][e])).to.be.true;											
				}				
			}
		}
	});

///////////////////////////////////////////////////////////////////////////////////////////////////

	it('SurfaceID_Valid', () => 
	{
		let cell_ids = ['1','2','3','99999'];
		let materials = ['1','2','3','4','999'];
		let densities = ['-1.0','-2.0','-3','1.0','2.0','3.0'];
		let surfaces = ['-666 4','3:4.2:8','(-10:8):(5.3 3.4 -3) -666','-10 8.2 (5 6 -2) -666'];
		expect(true).to.be.false;		
	});

	it('SurfaceID_Error', () => 
	{
		let cell_ids = ['1','2','3','99999'];
		let materials = ['1','2','3','4','999'];
		let densities = ['-1.0','-2.0','-3','1.0','2.0','3.0'];
		let bad = ['0','+1', '+2e0', '+2E+0'];	
		expect(true).to.be.false;
	});

	it('SurfaceID_Warning', () => 
	{
		let cell_ids = ['1','2','3','99999'];
		let materials = ['1','2','3','4','999'];
		let densities = ['-1.0','-2.0','-3','1.0','2.0','3.0'];
		let bad = ['1e0','1E0','1e+0','1.5e0'];	
		expect(true).to.be.false;
	});

///////////////////////////////////////////////////////////////////////////////////////////////////

	it('Cell_Compliment_Valid', () => 
	{
		let cell_ids = ['1','2','3','99999'];
		let materials = ['1','2','3','4','999'];
		let densities = ['-1.0','-2.0','-3','1.0','2.0','3.0'];
		let surfaces = ['-666 #4','3:4.2:#8','(-10:8):(5.3 #3 -3) -666','-10 8 #(5 6 -2) -666'];
		expect(true).to.be.false;		
	});

	it('Cell_Compliment_Error', () => 
	{
		let cell_ids = ['1','2','3','99999'];
		let materials = ['1','2','3','4','999'];
		let densities = ['-1.0','-2.0','-3','1.0','2.0','3.0'];
		let bad = ['#0','#-2','-#2','#-2.0','-#2.0',];		
		expect(true).to.be.false;
	});

	it('Cell_Compliment_Warning', () => 
	{
		let cell_ids = ['1','2','3','99999'];
		let materials = ['1','2','3','4','999'];
		let densities = ['-1.0','-2.0','-3','1.0','2.0','3.0'];
		let bad = ['#4.1','#2.0','#1e0','#1E0','#1e+0','#1.5e0'];		
		expect(true).to.be.false;
	});

///////////////////////////////////////////////////////////////////////////////////////////////////

	it('Parentheses_Comment_Split', () => 
	{
		// These are valid examples
		let examples = [];
		examples.push(`666 0
		(#1
		#2
		$ This is a comment
		#100) imp:n=1 $ Graveyard`);

		examples.push(`666 0
		(#1
		#2
c This is a comment
		#100) imp:n=1 $ Graveyard`);

		expect(true).to.be.false;
	});	

	it('Incomplete_Parentheses', () => 
	{
		let examples = [];

		// example with trailing parameters
		examples.push('1 1 -10.0  (-1 100( 8 9:10) imp:n=0');

		// no trailing parameters
		examples.push('1 1 -10.0  (-1 100( 8 9:10) imp:n=0');

		// In-line comment break
		examples.push(`666 0
		(#1
		#2
		$ This is a comment
		#100 imp:n=1 $ Graveyard`);

		// full-line comment break
		examples.push(`666 0
		(#1
		#2
c This is a comment
		#100 imp:n=1 $ Graveyard`);

		expect(true).to.be.false;
	});	

///////////////////////////////////////////////////////////////////////////////////////////////////

	it('Colon_Comment_Split', () => 
	{
		// These are valid examples
		let examples = [];
		examples.push(`666 0
		#1
		#2 :
		$ This is a comment
		#100 imp:n=1 $ Graveyard`);

		examples.push(`666 0
		(#1
		#2 :
c This is a comment
		#100) imp:n=1 $ Graveyard`);

		expect(true).to.be.false;
	});	

	it('Valid_Colon', () => 
	{
		let examples = [];

		// No numbers near by
		examples.push('1 1 -10.0  (3 -4):(1 4) imp:n=0');

		// behind number
		examples.push('1 1 -10.0  ((3 -4):1) imp:n=0');

		expect(true).to.be.false;
	});	

	it('Incomplete_Colon', () => 
	{
		let examples = [];

		// No numbers near by
		examples.push('1 1 -10.0  (-1 100( 8 9:10):) imp:n=0');

		// behind number
		examples.push('1 1 -10.0  (-1 100( 8 9:10:)) imp:n=0');

		// before any surface/cell
		examples.push('1 1 -10.0  : -1 100 8 9 10 imp:n=0');

		// after all surface/cell
		examples.push('1 1 -10.0  : -1 100 8 9 10 imp:n=0');

		// In-line comment break
		examples.push(`666 0
		(#1
		#2
		$ This is a comment
		#100 imp:n=1 $ Graveyard`);

		// full-line comment break
		examples.push(`666 0
		(#1
		#2
c This is a comment
		#100 imp:n=1 $ Graveyard`);

		expect(true).to.be.false;
	});	

///////////////////////////////////////////////////////////////////////////////////////////////////

	it('SimpleCell_ZeroDensityWarning', () => 
	{
		// ex.) 4 6 0 -10 666
		expect(true).to.be.false;
	});	

	it('VoidCell_NonZeroImportanceWarning', () => 
	{
		// ex.) 4 6 0 -10 666 imp:n=0 imp:p=1
		expect(true).to.be.false;
	});	

	it('SimpleCell_BadID', () => 
	{
		// id must be 1 <= j <= 99999?
		expect(true).to.be.false;
	});
});