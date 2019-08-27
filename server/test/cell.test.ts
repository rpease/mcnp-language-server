import { expect } from 'chai';
import { MCNPLine } from '../src/File/MCNPLines';
import { Statement } from '../src/File/statement';
import { Surface } from '../src/Cards/Surfaces/surface';
import { MCNPException, MCNPArgumentException } from '../src/mcnp_exception';
import { SurfaceModifier } from '../src/enumerations';
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

function StringToSurface(text: string): Surface
{
	let statement = StringToStatement(text);
	return new Surface(statement);
}

describe('Cell', () => 
{
	it('SimpleCell', () => 
	{
		let cell_ids = ['1','2','3','99999'];
		let materials = ['1','2','3','4','999'];
		let densities = ['-1.0','-2.0','-3','1.0','2.0','3.0'];
		let surfaces = ['2 3 4 -10','3:4.2:-8','(-10:8):(5.3 3 -3) -666']

		/*let parameter_split = parameters.split(' ');
		for (let id = 1; id < 20; id++) 
		{
			for (const code of surface_codes) 
			{
				let surface_string = `${id} ${code} ${parameters} $ Magic spider on the wind`;
				let surf = StringToSurface(surface_string);

				expect(surf.ID).to.be.equal(id);
				expect(surf.Modifier).to.be.null;
				expect(surf.Transform).to.be.null;
				expect(surf.Parameters.length).to.equal(parameter_split.length);
				for (let p = 0; p < surf.Parameters.length; p++)				
					expect(surf.Parameters[p].Contents).to.be.equal(parameter_split[p]);	
					
				expect(surf.GetDiagnostics().length).to.be.equal(0);
			}			
		}*/
		expect(true).to.be.false;
	});		

	it('VoidCell', () => 
	{
		let cell_ids = ['1','2','3','99999'];
		let materials = ['0'];
		let surfaces = ['2 3 4 -10','3:4:-8','(-10:8):(5 3 -3) -666']

		expect(true).to.be.false;
	});

	it('Compliment', () => 
	{
		let cell_ids = ['1','2','3','99999'];
		let materials = ['1','2','3','4','999'];
		let densities = ['-1.0','-2.0','-3','1.0','2.0','3.0'];
		let surfaces = ['-666 #4','3:4.2:#8','(-10:8):(5.3 #3 -3) -666'];
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