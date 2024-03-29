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

describe('Surface', () => 
{
	it('SimpleSurface', () => 
	{
		let surface_codes = ['rpp', 'px', 'taco', 'doesntmatter'];
		let parameters = '-4 5.4 3.7e2 1 10';

		let parameter_split = parameters.split(' ');
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
		}
	});	

	it('NoIDProvided', () => 
	{
		let surface_codes = ['rpp', 'px', 'taco', 'doesntmatter'];
		let parameters = '-4 5.4 3.7e2 1 10';

		for (const code of surface_codes) 
		{
			let surface_string = `${code} ${parameters} $ Magic spider on the wind`;
			let surf = StringToSurface(surface_string);

			let d = surf.GetDiagnostics();

			expect(d.length).to.be.greaterThan(0);
			expect(d[0].severity).to.be.equal(DiagnosticSeverity.Error);
		}
	});	

	it('TooManyArgsBeforeMnemonic', () => 
	{
		let surface_codes = ['rpp', 'px', 'taco', 'doesntmatter'];
		let parameters = '-4 5.4 3.7e2 1 10';

		for (let id = 1; id < 20; id++) 
		{
			for (let tr = 1; tr < 10; tr++) 
			{
				for (let x = -10; x <10; x++) 
				{
					for (const code of surface_codes) 
					{
						let surface_string = `${id} ${tr} ${x} ${code} ${parameters} $ Try not to die!!!`;
						let surf = StringToSurface(surface_string);

						let d = surf.GetDiagnostics();

						expect(d.length).to.be.greaterThan(0);
						expect(d[0].severity).to.be.equal(DiagnosticSeverity.Error);
					}		
				}				
			}					
		}
	});	

	it('TransformedSurface', () => 
	{	
		let surface_codes = ['rpp', 'px', 'taco', 'doesntmatter'];
		let parameters = '-4 5.4 3.7e2 1 10';

		let num_formats = ['','.0','e0','E0','e+0'];

		let parameter_split = parameters.split(' ');
		for (let id = 1; id < 20; id++) 
		{
			for (let tr = -10; tr < 10; tr++) 
			{
				if(tr == 0)
					continue;

				for (const f of num_formats) 
				{
					for (const code of surface_codes) 
					{
						let surface_string = `${id} ${tr}${f} ${code} ${parameters} $ But does it Djent?`;
						console.log(surface_string);
						let surf = StringToSurface(surface_string);
		
						expect(surf.ID).to.be.equal(id);
						expect(surf.Modifier).to.be.null;
						expect(surf.Transform).to.be.equal(tr);
						expect(surf.Parameters.length).to.equal(parameter_split.length);
						for (let p = 0; p < surf.Parameters.length; p++)				
							expect(surf.Parameters[p].Contents).to.be.equal(parameter_split[p]);	
							
						expect(surf.GetDiagnostics().length).to.be.equal(0);
					}	
				}				
			}					
		}
	});	

	it('BadTransformNumber', () => 
	{	
		let surface_codes = ['rpp', 'px', 'taco', 'doesntmatter'];
		let parameters = '-4 5.4 3.7e2 1 10';

		let bad_tr = ['0', '-1.1', '2.4', '1e-1', '1000']

		let parameter_split = parameters.split(' ');
		for (let id = 1; id < 20; id++) 
		{
			for (const iterator of bad_tr) 
			{
				for (const code of surface_codes) 
				{
					let surface_string = `${id} ${bad_tr} ${code} ${parameters} $ But does it Djent?`;
					let surf = StringToSurface(surface_string);

					let d = surf.GetDiagnostics();

					expect(d.length).to.be.greaterThan(0);
					expect(d[0].severity).to.be.equal(DiagnosticSeverity.Error);				
				}
			}									
		}
	});	

	it('ModifiedSurface', () => 
	{	
		let surface_codes = ['rpp', 'px', 'c/x', 'doesntmatter'];
		let parameters = '-4 5.4 3.7e2 1 10';
		let modifiers = ['', '*', '+'];

		let parameter_split = parameters.split(' ');
		for (let id = 1; id < 20; id++) 
		{
			for (const mod of modifiers)
			{				
				for (const code of surface_codes) 
				{
					let surface_string = `${mod}${id} ${code} ${parameters} $ Thall`;
					console.log(surface_string);
					let surf = StringToSurface(surface_string);

					let expected_mod = null;
					if(mod == '*')
						expected_mod = SurfaceModifier.Reflective;
					else if (mod == '+')
						expected_mod = SurfaceModifier.WhiteBoundary;
						
					expect(surf.ID).to.be.equal(id);
					expect(surf.Modifier).to.be.equal(expected_mod);
					expect(surf.Transform).to.be.null;
					expect(surf.Parameters.length).to.equal(parameter_split.length);
					for (let p = 0; p < surf.Parameters.length; p++)				
						expect(surf.Parameters[p].Contents).to.be.equal(parameter_split[p]);		
						
					expect(surf.GetDiagnostics().length).to.be.equal(0);
				}									
			}					
		}
	});	

	it('BadModifiers', () => 
	{	
		let surface_codes = ['rpp', 'px', 'c/x', 'doesntmatter'];
		let parameters = '-4 5.4 3.7e2 1 10';
		let bad_modifiers = ['\\', '-', '!', 'c', '#', '@'];
		
		let parameter_split = parameters.split(' ');
		for (let id = 1; id < 20; id++) 
		{
			for (const mod of bad_modifiers)
			{				
				for (const code of surface_codes) 
				{
					let surface_string = `${mod}${id} ${code} ${parameters} $ Thall`;					
					console.log(surface_string);
					let surf = StringToSurface(surface_string);

					let d = surf.GetDiagnostics();

					expect(d.length).to.be.greaterThan(0);
					expect(d[0].severity).to.be.equal(DiagnosticSeverity.Error);
				}									
			}					
		}
	});	

	it('ComplexSurface', () => 
	{	
		let surface_codes = ['rpp', 'px', 'c/x', 'doesntmatter'];
		let parameters = '-4 5.4 3.7e2 1 10';
		let modifiers = ['', '*', '+'];
		let num_formats = ['','.0','e0','E0','e+0'];

		let parameter_split = parameters.split(' ');
		
		for (const mod of modifiers) 
		{		
			for (let id = 1; id < 20; id++) 
			{
				for (let tr = -10; tr < 10; tr++) 
				{
					if(tr == 0)
						continue;

					for (const f of num_formats) 
					{
						for (const code of surface_codes) 
						{
							let surface_string = `${mod}${id} ${tr}${f} ${code} ${parameters} $ Are you feeling it now?!`;
							let surf = StringToSurface(surface_string);

							let expected_mod = null;
							if(mod == '*')
								expected_mod = SurfaceModifier.Reflective;
							else if (mod == '+')
								expected_mod = SurfaceModifier.WhiteBoundary;
			
							expect(surf.ID).to.be.equal(id);
							expect(surf.Modifier).to.be.equal(expected_mod);
							expect(surf.Transform).to.be.equal(tr);
							expect(surf.Parameters.length).to.equal(parameter_split.length);
							for (let p = 0; p < surf.Parameters.length; p++)				
								expect(surf.Parameters[p].Contents).to.be.equal(parameter_split[p]);		
								
							expect(surf.GetDiagnostics().length).to.be.equal(0);
						}	
					}				
				}					
			}
		}
	});
	
	it('BadIDNumbers', () => 
	{	
		// surface ID must be: 1 <= n <= 99999
		let surface_codes = ['rpp', 'px', 'taco', 'doesntmatter'];
		let parameters = '-4 5.4 3.7e2 1 10';
		let ids = [-1,0,1,99999999,100000000]

		let parameter_split = parameters.split(' ');
		for (const id of ids) 
		{
			for (const code of surface_codes) 
			{
				let surface_string = `${id} ${code} ${parameters} $ Magic spider on the wind`;
				let surf = StringToSurface(surface_string);

				let d = surf.GetDiagnostics();
			
				// Invalid Number
				if(id <= 0 || id >99999999)
				{
					expect(d.length).to.be.greaterThan(0);
					expect(d[0].severity).to.be.equal(DiagnosticSeverity.Error);
				}					
				// valid number
				else				
					expect(d.length).to.be.equal(0);				
							
			}			
		}
	});
});