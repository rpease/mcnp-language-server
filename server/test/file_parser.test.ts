import { expect } from 'chai';
import * as fp from '../src/file_parser';
import { TextDocument, Range, Position } from 'vscode-languageserver-types';
import { readSync, readFileSync } from 'fs';

// This is an alternate way to declare a function
const getTextDocument = (file_path: string): TextDocument => {

	// This will genrate a text document
	return TextDocument.create(
		// uri, can probably be empty string
		'file://mcnp',
		// language id
		'mncp', 
		// version number, not sure what it should be
		1,
		// the file source
		readFileSync(file_path,'utf8')
	);
};

describe('FileParser', () => 
{
	it('ParseFile', () => 
	{	
		fp.ParseFile(getTextDocument("test\\test.i"));
	});	
});