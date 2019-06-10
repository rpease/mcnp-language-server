import { expect } from 'chai';
import * as st from '../src/File/statement';
import { stat } from 'fs';

function StringToMCNPLines(text:string,line_num:number=0):Array<st.MCNPLine>
{
    var mcnp_lines = new Array<st.MCNPLine>();

    text.split('\n').forEach(line => 
    {
        var mcnp_line = new st.MCNPLine();

        mcnp_line.Contents = line;
        mcnp_line.LineNumber = line_num;        

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
            expected_position += 2;
        });	
        
        var line = StringToMCNPLines(text_2,line_number);
        var statement = new st.Statement(line,null);

        var expected_position = 1;
        statement.Arguments.forEach(arg => 
        {
            expect(arg.FilePosition.line).to.equal(line_number)
            expect(arg.FilePosition.character).to.equal(expected_position)
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
            expected_position += h;
            h += 1;
        });
    });
        

    it('Multiline_1', () => 
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
        expect(statement.Arguments[1].FilePosition.line).to.equal(10);

        // Second-Line
        expect(statement.Arguments[5].Contents).to.equal("15");
        expect(statement.Arguments[5].FilePosition.character).to.equal(12);
        expect(statement.Arguments[5].FilePosition.line).to.equal(11);

        // Third-Line
        expect(statement.Arguments[6].Contents).to.equal("-10");
        expect(statement.Arguments[6].FilePosition.character).to.equal(8);
        expect(statement.Arguments[6].FilePosition.line).to.equal(12);        	
    });	

    it('GetLineType_EqualSign', () => 
    {
        const text_equal = "2  2 5.0  -2 3 100   imp:n= 2 $ Half-Sphere"
        const text =       "2  2 5.0  -2 3 100   imp:n  2 $ Half-Sphere"

        const line_number = 10;
        var line = StringToMCNPLines(text_equal,line_number);

        var statement = new st.Statement(line,null);

        expect(statement.Arguments.length).to.equal(8);
        expect(statement.InlineComments.length).to.equal(1);
        expect(statement.RawText).to.equal(text_equal);
        
        expect(statement.Arguments[statement.Arguments.length-2].Contents).to.equal("imp:n");
        expect(statement.Arguments[statement.Arguments.length-2].FilePosition.character).to.equal(21);
        expect(statement.Arguments[statement.Arguments.length-1].Contents).to.equal("2");
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition.character).to.equal(28);	

        var line = StringToMCNPLines(text,line_number);

        var statement = new st.Statement(line,null);

        expect(statement.Arguments.length).to.equal(8);
        expect(statement.InlineComments.length).to.equal(1);
        expect(statement.RawText).to.equal(text);
        
        expect(statement.Arguments[statement.Arguments.length-2].Contents).to.equal("imp:n");
        expect(statement.Arguments[statement.Arguments.length-2].FilePosition.character).to.equal(21);
        expect(statement.Arguments[statement.Arguments.length-1].Contents).to.equal("2");
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition.character).to.equal(28);
    });
});