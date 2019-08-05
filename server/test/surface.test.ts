import { expect } from 'chai';
import { MCNPLine } from '../src/File/MCNPLines';
import { Statement } from '../src/File/statement';
import { Surface } from '../src/Cards/Surfaces/surface';
import { MCNPException } from '../src/mcnp_exception';

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
			let surf_statement = StringToStatement(surface_string);

			expect(() => new Surface(surf_statement),"Should have thrown and error.").to.throw(MCNPException);
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
						let surf_statement = StringToStatement(surface_string);

						expect(() => new Surface(surf_statement),"Should have thrown and error.").to.throw(MCNPException);
					}		
				}				
			}					
		}
	});	

	it('TransformedSurface', () => 
	{	
		let surface_codes = ['rpp', 'px', 'taco', 'doesntmatter'];
		let parameters = '-4 5.4 3.7e2 1 10';

		let num_formats = ['','.0','e0','E1',,'e+1'];

		let parameter_split = parameters.split(' ');
		for (let id = 1; id < 20; id++) 
		{
			for (let tr = -10; tr < 10; tr++) 
			{
				if(tr == 0)
					continue;

				for (const iterator of num_formats) 
				{
					for (const code of surface_codes) 
					{
						let surface_string = `${id} ${tr}${num_formats} ${code} ${parameters} $ But does it Djent?`;
						let surf = StringToSurface(surface_string);
		
						expect(surf.ID).to.be.equal(id);
						expect(surf.Modifier).to.be.null;
						expect(surf.Transform).to.be.equal(tr);
						expect(surf.Parameters.length).to.equal(parameter_split.length);
						for (let p = 0; p < surf.Parameters.length; p++)				
							expect(surf.Parameters[p].Contents).to.be.equal(parameter_split[p]);						
					}	
				}				
			}					
		}
	});	

	it('BadTransformNumber', () => 
	{	
		let surface_codes = ['rpp', 'px', 'taco', 'doesntmatter'];
		let parameters = '-4 5.4 3.7e2 1 10';

		let bad_tr = ['0', '-1.1', '2.4', '1e-1']

		let parameter_split = parameters.split(' ');
		for (let id = 1; id < 20; id++) 
		{
			for (const iterator of bad_tr) 
			{
				for (const code of surface_codes) 
				{
					let surface_string = `${id} ${bad_tr} ${code} ${parameters} $ But does it Djent?`;
					let surf_statement = StringToStatement(surface_string);
	
					expect(() => new Surface(surf_statement), "Should have thrown and error.").to.throw(MCNPException);					
				}
			}									
		}
	});	

	it('ModifiedSurface', () => 
	{	
		let surface_codes = ['rpp', 'px', 'taco', 'doesntmatter'];
		let modifiers = ['', '*', '+'];

		for (let id = 1; id < 20; id++) 
		{
			expect(true).to.be.false;
		}
	});	

	it('BadModifiers', () => 
	{	
		let bad_modifiers = ['\\', '-', '!', 'c', '$', '#', '@'];
		expect(true).to.be.false;
	});	

	it('ComplexSurface', () => 
	{	
		let surface_codes = ['rpp', 'px', 'taco', 'doesntmatter'];
		let modifiers = ['', '*', '+'];

		for (let id = 1; id < 20; id++) 
		{
			for (let tr = 1; tr < 10; tr++) 
			{				
				expect(true).to.be.false;
			}
		}
	});
	
	it('BadIDNumbers_AlwaysWrong', () => 
	{	
		// surface ID must be: 1 <= n <= 99999
		expect(true).to.be.false;
	});

	it('BadIDNumbers_Transformation', () => 
	{	
		// surface ID must be: 1 <= n <= 999
		expect(true).to.be.false;
	});
});