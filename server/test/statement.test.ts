import { expect } from 'chai';
import * as st from '../src/File/statement';
import { stat } from 'fs';

function StringToMCNPLines(text:string,line_num:number=0,position:number=0):Array<st.MCNPLine>
{
    var mcnp_lines = new Array<st.MCNPLine>();

    text.split('\n').forEach(line => 
    {
        var mcnp_line = new st.MCNPLine();

        mcnp_line.Contents = line;
        mcnp_line.LineNumber = line_num;
        mcnp_line.FilePosition = position;

        line_num += 1;
        position += line.length;

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
        const position = 55;

        var line = StringToMCNPLines(text_1,line_number,position);
        var statement = new st.Statement(line,null);

        expect(statement.StartIndex).to.equal(position);
        var expected_position = position;
        statement.Arguments.forEach(arg => 
        {
            expect(arg.FilePosition).to.equal(expected_position)
            expected_position += 2;
        });	
        
        var line = StringToMCNPLines(text_2,line_number,position);
        var statement = new st.Statement(line,null);

        expect(statement.StartIndex).to.equal(position);
        var expected_position = position + 1;
        statement.Arguments.forEach(arg => 
        {
            expect(arg.FilePosition).to.equal(expected_position)
            expected_position += 2;
        });
        
        var line = StringToMCNPLines(text_3,line_number,position);
        var statement = new st.Statement(line,null);

        expect(statement.StartIndex).to.equal(position);
        var expected_position = position;
        var h = 2;
        statement.Arguments.forEach(arg => 
        {
            expect(arg.FilePosition).to.equal(expected_position)
            expected_position += h;
            h += 1;
        });
    });

    it('GetLineType_Tab', () => 
    {
        const text_tab1 = "2 PY	TEXT"
        const text_tab2 = "2 PY		TEXT"
        const text =      "2 PY TEXT"

        const line_number = 10;
        const position = 55;

        var line = StringToMCNPLines(text_tab1,line_number,position);
        var statement = new st.Statement(line,null);

        expect(statement.Arguments.length).to.equal(3);
        expect(statement.RawText).to.equal(text_tab1);
        expect(statement.StartIndex).to.equal(position);
        
        var arg_ex = new RegExp("TEXT",'g');
        expect(statement.Arguments[statement.Arguments.length-1].Contents).to.equal("TEXT");
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition).to.equal(arg_ex.exec(text_tab1).index+position);

        ///////////////////////////////////////////////////////////////////////////////////////////

        line = StringToMCNPLines(text_tab2,line_number,position);
        statement = new st.Statement(line,null);

        expect(statement.Arguments.length).to.equal(3);
        expect(statement.RawText).to.equal(text_tab2);
        expect(statement.StartIndex).to.equal(position);
        
        var arg_ex = new RegExp("TEXT",'g');
        expect(statement.Arguments[statement.Arguments.length-1].Contents).to.equal("TEXT");
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition).to.equal(arg_ex.exec(text_tab2).index+position);
        
        ///////////////////////////////////////////////////////////////////////////////////////////

        line = StringToMCNPLines(text,line_number,position);
        statement = new st.Statement(line,null);

        expect(statement.Arguments.length).to.equal(3);
        expect(statement.RawText).to.equal(text);
        expect(statement.StartIndex).to.equal(position);
        
        var arg_ex = new RegExp("TEXT",'g');
        expect(statement.Arguments[statement.Arguments.length-1].Contents).to.equal("TEXT");
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition).to.equal(arg_ex.exec(text).index+position);
    });	

    // Equal signs are replaced with spaces to ensure consistent parsing behavior further on
    it('GetLineType_EqualSign', () => 
    {
        const text_equal = "2  2 5.0  -2 3 100   imp:n=2 $ Half-Sphere"
        const text =       "2  2 5.0  -2 3 100   imp:n 2 $ Half-Sphere"

        const line_number = 10;
        const position = 55;
        var line = StringToMCNPLines(text_equal,line_number,position);

        var statement = new st.Statement(line,null);

        expect(statement.Arguments.length).to.equal(8);
        expect(statement.InlineComments.length).to.equal(1);
        expect(statement.RawText).to.equal(text_equal);
        expect(statement.StartIndex).to.equal(position);
        
        expect(statement.Arguments[statement.Arguments.length-2].Contents).to.equal("imp:n");
        expect(statement.Arguments[statement.Arguments.length-2].FilePosition).to.equal(21+position);
        expect(statement.Arguments[statement.Arguments.length-1].Contents).to.equal("2");
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition).to.equal(27+position);	

        var line = StringToMCNPLines(text,line_number,position);

        var statement = new st.Statement(line,null);

        expect(statement.Arguments.length).to.equal(8);
        expect(statement.InlineComments.length).to.equal(1);
        expect(statement.RawText).to.equal(text);
        expect(statement.StartIndex).to.equal(position);
        
        expect(statement.Arguments[statement.Arguments.length-2].Contents).to.equal("imp:n");
        expect(statement.Arguments[statement.Arguments.length-2].FilePosition).to.equal(21+position);
        expect(statement.Arguments[statement.Arguments.length-1].Contents).to.equal("2");
        expect(statement.Arguments[statement.Arguments.length-1].FilePosition).to.equal(27+position);
    });	
});