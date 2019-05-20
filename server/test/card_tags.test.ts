import { expect } from 'chai';
import * as cards from '../src/File/card_tags';

describe('CellTag', () => 
{
	
});

describe('SurfaceTag', () => 
{
	it('Regular', () => 
	{
		let surf = "1 RPP 1 2  -10 10  -8 8 $ Box 1";

		var tag = new cards.SurfaceCardTag(surf);
		expect(tag.Modifier).to.equal(null);
		expect(tag.CardIdentifier).to.equal(null);
		expect(tag.ID).to.equal(10);	
		
		// todo finish test
		expect(true).to.be.false;
	});

	it('Reflective', () => 
	{
		let surf = "*2 PY 1 $ Reflective";

		var tag = new cards.SurfaceCardTag(surf);
		expect(tag.Modifier).to.equal(null);
		expect(tag.CardIdentifier).to.equal(null);
		expect(tag.ID).to.equal(10);	
		
		// todo finish test
		expect(true).to.be.false;
	});

	it('Transform', () => 
	{
		let surf = "2 3 PY 1 $ Tacos";

		var tag = new cards.SurfaceCardTag(surf);
		expect(tag.Modifier).to.equal(null);
		expect(tag.CardIdentifier).to.equal(null);
		expect(tag.ID).to.equal(10);	
		
		// todo finish test
		expect(true).to.be.false;
	});

	it('Periodic', () => 
	{
		let surf = "2 -3 PY 1 $ Tacos";

		var tag = new cards.SurfaceCardTag(surf);
		expect(tag.Modifier).to.equal(null);
		expect(tag.CardIdentifier).to.equal(null);
		expect(tag.ID).to.equal(10);		

		// todo finish test
		expect(true).to.be.false;
	});
});

describe('DataTag', () => 
{

	
	it('CardTag_Data', () => 
	{
		let data1 = "F4:p"; // Standard Tally
		let data2 = "M101"; // Material
		let data3 = "nps"; // No numbers
		let data4 = "*F8:n"; // Modified tally

		// todo finish test
		expect(true).to.be.false;

		/*
		var tag = new st.CardTag(surf1);
		expect(tag.Modifier).to.equal(null);
		expect(tag.CardIdentifier).to.equal(null);
		expect(tag.ID).to.equal(10);

		tag = new st.CardTag(surf2);
		expect(tag.Modifier).to.equal("*");
		expect(tag.CardIdentifier).to.equal(null);
		expect(tag.ID).to.equal(999);	
		*/		
	});
});