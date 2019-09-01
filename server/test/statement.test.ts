import { expect } from 'chai';
import * as st from '../src/File/statement';
import { stat } from 'fs';
import { MCNPLine } from '../src/File/MCNPLines';
import { GetCommentSamples } from './mcnpline.test';

function StringToMCNPLines(text:string,line_num:number=0):Array<MCNPLine>
{
    var mcnp_lines = new Array<MCNPLine>();

    text.split('\n').forEach(line => 
    {
        var mcnp_line = new MCNPLine(line, line_num);      

        line_num += 1;

        mcnp_lines.push(mcnp_line);
    });	

    return mcnp_lines;
}

describe('Statement', () => 
{
    it('GetLineType_Position', () => 
    {
        const text_1 = "1 2 3 4 5 9 7 8 9 10";
        const text_2 = " 1 2 3 4 5 6 7 8 9 10 ";
        const text_3 = "1 2  3   4    5     6";

        const line_number = 10;

        var line = StringToMCNPLines(text_1,line_number);
        var statement = new st.Statement(line,null);

        var expected_position = 0;
        statement.Arguments.forEach(arg => 
        {
            expect(arg.FilePosition.line).to.equal(line_number)
            expect(arg.FilePosition.character).to.equal(expected_position)
            expect(arg.FilePosition.mcnp_character).to.equal(expected_position)
            expected_position += 2;
        });	
        
        var line = StringToMCNPLines(text_2,line_number);
        var statement = new st.Statement(line,null);

        var expected_position = 1;
        statement.Arguments.forEach(arg => 
        {
            expect(arg.FilePosition.line).to.equal(line_number)
            expect(arg.FilePosition.character).to.equal(expected_position)
            expect(arg.FilePosition.mcnp_character).to.equal(expected_position)
            expected_position += 2;
        });
        
        var line = StringToMCNPLines(text_3,line_number);
        var statement = new st.Statement(line,null);

        var expected_position = 0;
        var h = 2;
        statement.Arguments.forEach(arg => 
        {
            expect(arg.FilePosition.line).to.equal(line_number)
            expect(arg.FilePosition.character).to.equal(expected_position)
            expect(arg.FilePosition.mcnp_character).to.equal(expected_position)
            expected_position += h;
            h += 1;
        });
    });        

    it('Multiline', () => 
    {
        const text_lines = `666      rpp -1 20 $ X-bounds
        -15 15 
        -10 10 $    Z-bounds`;

        const text_single = "666      rpp -1 20 $ X-bounds        -15 15         -10 10 $    Z-bounds";

        const line_number = 10;
        var line = StringToMCNPLines(text_lines,line_number);

        var statement = new st.Statement(line,null);

        expect(statement.Arguments.length).to.equal(8);
        expect(statement.InlineComments.length).to.equal(2);
        expect(statement.RawText).to.equal(text_single);
        
        // First-Line
        // rpp
        expect(statement.Arguments[1].Contents).to.equal("rpp");
        expect(statement.Arguments[1].FilePosition.character).to.equal(9);
        expect(statement.Arguments[1].FilePosition.mcnp_character).to.equal(9);
        expect(statement.Arguments[1].FilePosition.line).to.equal(10);

        // Second-Line
        expect(statement.Arguments[5].Contents).to.equal("15");
        expect(statement.Arguments[5].FilePosition.character).to.equal(12);
        expect(statement.Arguments[5].FilePosition.mcnp_character).to.equal(12);
        expect(statement.Arguments[5].FilePosition.line).to.equal(11);

        // Third-Line
        expect(statement.Arguments[6].Contents).to.equal("-10");
        expect(statement.Arguments[6].FilePosition.character).to.equal(8);
        expect(statement.Arguments[6].FilePosition.mcnp_character).to.equal(8);
        expect(statement.Arguments[6].FilePosition.line).to.equal(12);        	
    });	

    it('EqualSign_Replacement', () => 
    {
        let equivalent_text = [];
        equivalent_text.push("2  2 5.0  -2 3 100   imp:n   2 $ Half-Sphere");
        equivalent_text.push("2  2 5.0  -2 3 100   imp:n=  2 $ Half-Sphere");
        equivalent_text.push("2  2 5.0  -2 3 100   imp:n = 2 $ Half-Sphere");
        equivalent_text.push("2  2 5.0  -2 3 100   imp:n  =2 $ Half-Sphere");        
        equivalent_text.push("2  2 5.0  -2 3 100   imp:n== 2 $ Half-Sphere");
        equivalent_text.push("2  2 5.0  -2 3 100   imp:n===2 $ Half-Sphere");

        const line_number = 10;
        for (const text of equivalent_text)
        {
            console.log(text);
            var line = StringToMCNPLines(text, line_number);

            var statement = new st.Statement(line,null);

            expect(statement.Arguments.length).to.equal(8);
            expect(statement.InlineComments.length).to.equal(1);
            expect(statement.RawText).to.equal(text);
            
            expect(statement.Arguments[statement.Arguments.length-2].Contents).to.equal("imp:n");
            expect(statement.Arguments[statement.Arguments.length-2].FilePosition.character).to.equal(21);
            expect(statement.Arguments[statement.Arguments.length-2].FilePosition.mcnp_character).to.equal(21);

            expect(statement.Arguments[statement.Arguments.length-1].Contents).to.equal("2");
            expect(statement.Arguments[statement.Arguments.length-1].FilePosition.character).to.equal(29);
            expect(statement.Arguments[statement.Arguments.length-1].FilePosition.mcnp_character).to.equal(29);
        }
    });

    it('Parentheses_Separation', () => 
    {
        let equivalent_text = [];
        equivalent_text.push("10 7 -5.4 (10 6(7 1 -2)3)vol  10.3 $ Cell-Card");
        equivalent_text.push("10 7 -5.4 ( 10 6(7 1 -2)3)vol  10.3 $ Cell-Card");
        equivalent_text.push("10 7 -5.4 ( 10 6 (7 1 -2)3)vol  10.3 $ Cell-Card");
        equivalent_text.push("10 7 -5.4 ( 10 6 (7 1 -2 )3)vol  10.3 $ Cell-Card");        
        equivalent_text.push("10 7 -5.4 ( 10 6 ( 7 1 -2 ) 3 ) vol  10.3 $ Cell-Card");

        let expected_arg_contents = ['10', '7', '-5.4', '(', '10', '6', '(' , '7', '1', '-2', ')', '3', ')', 'vol', '10.3']

        const line_number = 10;
        for (const text of equivalent_text)
        {
            console.log(text);
            var line = StringToMCNPLines(text, line_number);

            var statement = new st.Statement(line,null);

            expect(statement.Arguments.length).to.equal(expected_arg_contents.length);
            expect(statement.InlineComments.length).to.equal(1);
            expect(statement.RawText).to.equal(text);
            
            for (let a = 0; a < expected_arg_contents.length; a++)             
                expect(expected_arg_contents[a]).to.be.equal(statement.Arguments[a].Contents);            
        }
    });

    it('Colon_Separation', () => 
    {
        let equivalent_text = [];
        equivalent_text.push("10 7 -5.4 #6:-10:666 vol  10.3 $ Cell-Card");
        equivalent_text.push("10 7 -5.4 #6 :-10:666 vol  10.3 $ Cell-Card");
        equivalent_text.push("10 7 -5.4 #6 : -10:666 vol  10.3 $ Cell-Card");
        equivalent_text.push("10 7 -5.4 #6 : -10 :666 vol  10.3 $ Cell-Card");        
        equivalent_text.push("10 7 -5.4 #6 : -10 : 666 vol  10.3 $ Cell-Card");

        let expected_arg_contents = ['10', '7', '-5.4', '#6', ':', '-10', ':' , '666', 'vol', '10.3']

        const line_number = 10;
        for (const text of equivalent_text)
        {
            console.log(text);
            var line = StringToMCNPLines(text, line_number);

            var statement = new st.Statement(line,null);

            expect(statement.Arguments.length).to.equal(expected_arg_contents.length);
            expect(statement.InlineComments.length).to.equal(1);
            expect(statement.RawText).to.equal(text);
            
            for (let a = 0; a < expected_arg_contents.length; a++)             
                expect(expected_arg_contents[a]).to.be.equal(statement.Arguments[a].Contents);            
        }
    });

    it('Colon_Separation_Ignore', () => 
    {
        let cell_card = '10 7 -5.4 #6:-10:666 vol  10.3 ';

        let cards = ['ImP:n', 'fmesh34:p', 'taco45:n,p,e', 'dxc0:p4', 'F5a:e'];
        let rand_vals = ['=3',' 3',' = 3'];

        for (const c of cards) 
        {
            for (const v of rand_vals) 
            {
                let text = cell_card + c + v + ' $ Defensive Posture';

                console.log(text);
                var line = StringToMCNPLines(text, 2);

                var statement = new st.Statement(line,null);

                expect(statement.Arguments.length).to.be.equal(12);
                expect(statement.Arguments[statement.Arguments.length-1].Contents).to.be.equal('3');
                expect(statement.Arguments[statement.Arguments.length-2].Contents).to.be.equal(c);
            }            
        }
    });
    
    it('&_Replacement', () => 
    {
        const text_equal = `2  2 5.0  -2 & 
        3 & 5 4 6 7 
        100   imp:n= 2 $ Half-Sphere`
        const text =       "2  2 5.0  -2 3 100   imp:n  2 $ Half-Sphere"

        const line_number = 10;
        var line = StringToMCNPLines(text_equal, line_number);
        var amp_statement = new st.Statement(line,null);

        line = StringToMCNPLines(text, line_number);
        var statement = new st.Statement(line,null);

        expect(amp_statement.Arguments.length).to.equal(statement.Arguments.length);
        
        // All arguments should be equivalent
        for (let i = 0; i < amp_statement.Arguments.length; i++)         
            expect(amp_statement.Arguments[i].Contents).to.be.equal(statement.Arguments[i].Contents);
        
    });

    it('Tabs', () =>
    {
        // Strings that MCNP considers length 81
		let length_81_1 = "1 RPP 1 2  -10 1  8   					                        8";
		let length_81_2 = "1 RPP 1 2  -10 10  -8 							        856";
        let length_81_3 = "1 RPP 1 2  -10 							                8";
        
        var statement = new st.Statement(StringToMCNPLines(length_81_1), null)
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition.mcnp_character).to.equal(80);
        statement = new st.Statement(StringToMCNPLines(length_81_2), null)
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition.mcnp_character).to.equal(80);
        statement = new st.Statement(StringToMCNPLines(length_81_3), null)
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition.mcnp_character).to.equal(80);
    });

    it('Line_Too_Long_Error', () =>
    {
        // Strings that MCNP considers length 81
		let tabs1 = "1 RPP 1 2  -10 1  8   					                        8";
		let tabs2 = "1 RPP 1 2  -10 1  8   					                         8";
        let tabs3 = "1 RPP 1 2  -10 							                856";
        let spaces1 = "1 RPP 1 2  -10 1  8                                                             8";
        let good_length1 = "1 RPP 1 2  -10 1  8   					                       8";
        let good_length2 = "1 RPP 1 2  -10 1  8                                                            8";
        
        var statement = new st.Statement(StringToMCNPLines(tabs1), null)
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition.mcnp_character).to.equal(80);
        expect(statement.GetDiagnostics().length).to.equal(1);

        statement = new st.Statement(StringToMCNPLines(tabs2), null)
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition.mcnp_character).to.equal(81);
        expect(statement.GetDiagnostics().length).to.equal(1);

        statement = new st.Statement(StringToMCNPLines(tabs3), null)
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition.mcnp_character).to.equal(80);
        expect(statement.GetDiagnostics().length).to.equal(1);

        statement = new st.Statement(StringToMCNPLines(spaces1), null)
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition.mcnp_character).to.equal(80);
        expect(statement.GetDiagnostics().length).to.equal(1);

        statement = new st.Statement(StringToMCNPLines(good_length1), null)
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition.mcnp_character).to.equal(79);
        expect(statement.GetDiagnostics().length).to.equal(0);

        statement = new st.Statement(StringToMCNPLines(good_length2), null)
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition.mcnp_character).to.equal(79);
        expect(statement.GetDiagnostics().length).to.equal(0);
    });

    it('IgnoreComments', () => 
    {
        const line_number = 10;

        for (const c of GetCommentSamples()) 
        {
            console.log(c);

            var line = StringToMCNPLines(c, line_number);

            expect(() => new st.Statement(line,null), "Should have thrown and error.").to.throw(Error);
        }          
    });  
});