import { expect } from 'chai';
import * as utilities from '../src/utilities';
import { Particle } from '../src/enumerations';

describe('Utilities', () => 
{
	it('GetParticleFromChar_npe', () => 
	{		
		let test1 = "n";
		let test2 = "p";
		let test3 = "e";
		let test4 = "c";

		expect(utilities.GetParticleFromChar(test1)).to.equal(Particle.neutron);
		expect(utilities.GetParticleFromChar(test2)).to.equal(Particle.photon);
		expect(utilities.GetParticleFromChar(test3)).to.equal(Particle.electron);
		expect(utilities.GetParticleFromChar(test4)).to.equal(Particle.NONE);
	});

	it('GetParticleFromChar_Uppercase', () => 
	{		
		let test1 = "N";
		let test2 = "P";
		let test3 = "E";
		let test4 = "C";

		expect(utilities.GetParticleFromChar(test1)).to.equal(Particle.neutron);
		expect(utilities.GetParticleFromChar(test2)).to.equal(Particle.photon);
		expect(utilities.GetParticleFromChar(test3)).to.equal(Particle.electron);
		expect(utilities.GetParticleFromChar(test4)).to.equal(Particle.NONE);
	});

	it('GetParticleFromChar_Bad', () => 
	{		
		let test1 = "Nn";
		let test2 = "Pe";
		let test3 = "ne";
		let test4 = "Cc";
		
		expect(() => utilities.GetParticleFromChar(test1)).to.throw(Error);
		expect(() => utilities.GetParticleFromChar(test2)).to.throw(Error);
		expect(() => utilities.GetParticleFromChar(test3)).to.throw(Error);
		expect(() => utilities.GetParticleFromChar(test4)).to.throw(Error);
	});

	it('GetCommentText', () => 
	{	
		var comment = "This is the Comment bro c C more butts";
		var tests = Array<string>();
		tests.push("c " + comment);
		tests.push("C " + comment);
		tests.push("c " + comment + "     ");
		tests.push(" c " + comment + "     ");
		tests.push(" c  " + comment + "     ");
		tests.push("  c   " + comment + "     ");
		tests.push("   c    " + comment + "     ");
		
		tests.forEach(test => {
			console.log(test);
			expect(utilities.GetCommentText(test)).to.equal(comment);
		});
	});  

	it('GetCommentText_NoComment', () => 
	{	
		var tests = Array<string>();
		tests.push("c");
		tests.push("C");
		tests.push("c ");
		tests.push("c  ");
		tests.push(" c  ");
		tests.push("  c   ");		
		tests.forEach(test => {
			console.log(test);
			expect(utilities.GetCommentText(test)).to.equal("");
		});

	}); 

	it('SplitStringNumberCombo_Standard', () => 
	{		
		let test1 = "M4";
		let test2 = "SI1";
		let test3 = "FM314";
		expect(1).to.equal(0);
	});    
});