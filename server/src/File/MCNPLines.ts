import { ReplaceTabsInLine } from '../utilities';
import { FULL_LINE_COMMENT_MATCH, STATEMENT_EXTENSION_MATCH, BLOCK_BREAK_MATCH } from '../regexpressions';

export enum LineType
{
	StatementStart,
	StatementExtension,
	Comment,
	BlockBreak
}

export class MCNPLine
{
	LineNumber: number;
	RawContents: string;
	MCNPInterpretation: string;
	Comment: string;
	Type: LineType;

	constructor(text: string, line_num: number)
	{
		this.RawContents = text;
		this.LineNumber = line_num; 

		var comment_split = text.split("$");		
		if(comment_split.length > 1)		
			this.Comment = comment_split[1].trim();
		else
			this.Comment = null;

		// Replace all '=' with a space since they are equivalent to MCNP
		this.MCNPInterpretation = comment_split[0].replace('=',' ');	

		// MCNP always considers tabs to go to stops every 8 spaces.
		if(this.MCNPInterpretation.includes('\t'))		
			this.MCNPInterpretation = ReplaceTabsInLine(this.MCNPInterpretation);

		this.Type = this.GetLineType(this.MCNPInterpretation);
	}

	private GetLineType(line: string|MCNPLine): LineType
	{
		var tab_free_line;
		if(line instanceof MCNPLine)
			tab_free_line = line.MCNPInterpretation;
		else
			tab_free_line = line;

		if(tab_free_line.match(FULL_LINE_COMMENT_MATCH) != null)		
			return LineType.Comment;		
		else if(tab_free_line.match(STATEMENT_EXTENSION_MATCH) != null)		
			return LineType.StatementExtension;		
		else if(tab_free_line.match(BLOCK_BREAK_MATCH) != null)		
			return LineType.BlockBreak;		
		else		
			return LineType.StatementStart;		
	}
}