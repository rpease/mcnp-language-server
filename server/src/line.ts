namespace mcnp
{
	export class Line
	{
		LineNum: number;
		Block: FileBlock;
		Contents: Array<String>;

		public static Create(text: string, lineNum: number, block: FileBlock): Line
		{
			let newLine = new Line();
			newLine.LineNum = lineNum;
			newLine.Block = block;
			newLine.Contents = text.split(' ');

			return newLine;
		}
	}
}
