import { expect } from 'chai';

describe('Surface', () => 
{
	it('NormalSurface', () => 
	{
		let surface_codes = ['rpp', 'px', 'taco', 'doesntmatter'];

		for (let id = 1; id < 20; id++) 
		{
			expect(true).to.be.false;
		}
	});	

	it('TransformedSurface', () => 
	{	
		for (let id = 1; id < 20; id++) 
		{
			for (let tr = 1; tr < 10; tr++) 
			{				
				expect(true).to.be.false;
			}
		}
	});	

	it('BadTransformNumber', () => 
	{	
		for (let id = 1; id < 20; id++) 
		{
			let tr = 0;
			expect(true).to.be.false;
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