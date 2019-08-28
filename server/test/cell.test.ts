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
								[3, 4, 2, -8],
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

						expect(cell.UsedSurfaces.length).to.be.equal(expected_surfaces[s].length);
						for (let e = 0; e < cell.UsedSurfaces.length; e++) 													
							expect(expected_surfaces[s].includes(cell.UsedSurfaces[e])).to.be.true;												
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
								[3, 4, 2, -8],
								[-10, 8, 5.3, 3, -3, -666]];

		expect(true).to.be.false;
	});

	it('Compliment', () => 
	{
		let cell_ids = ['1','2','3','99999'];
		let materials = ['1','2','3','4','999'];
		let densities = ['-1.0','-2.0','-3','1.0','2.0','3.0'];
		let surfaces = ['-666 #4','3:4.2:#8','(-10:8):(5.3 #3 -3) -666','-10 8 #(5 6 -2) -666'];
		expect(true).to.be.false;		
	});

	it('Compliment_NotValid', () => 
	{
		let cell_ids = ['1','2','3','99999'];
		let materials = ['1','2','3','4','999'];
		let densities = ['-1.0','-2.0','-3','1.0','2.0','3.0'];
		let bad = ['#4.1','#-2','-#2','#2.0']; // todo is the last one invalid?		
		expect(true).to.be.false;
	});

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