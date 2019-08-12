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
			
		this.MCNPInterpretation = this.ConvertToMCNP(text);

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

	private ConvertToMCNP(text: string): string
	{
		// Remove Inline Comment
		var comment_split = text.split("$");		
		if(comment_split.length > 1)		
			this.Comment = comment_split[1].trim();
		else
			this.Comment = null;
		text = comment_split[0];		

		// Remove continutation ampersand
		var continuation_split = text.split("&");
		text = continuation_split[0];

		// Replace = signs with a space
		text = text.replace('=',' ');

		// Replace tabs
		// MCNP always considers tabs to go to stops every 8 spaces.
		if(text.includes('\t'))
			text = ReplaceTabsInLine(text);

		return text;
	}
}