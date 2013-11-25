
CsvFileReader = function (delimiter, enclose, escape) 
{
	this.delimiter = delimiter;
	this.enclose = enclose;
	this.escape = escape;

	this.reset();
};

CsvFileReader.prototype = {
	constructor : CsvFileReader ,
	
	reset : function () 
	{
		this.data = [];
	} ,
	
	read : function (file)
	{	
		var reader = new LinewiseFileReader();
		var parser = new CsvParser(this.delimiter, this.enclose, this.escape);
	
		var csvFileReader = this;
		csvFileReader.reset();
		
		var parser_enclose = parser.enclose;
		
		var openField = false;
		reader.onload = function (load) 
		{
			var lines = this.lines;
			if ( lines.length == 0 ) 
			{
				// return true;
			}
			
			this.reset();
			
			if ( openField ) 
			{
				lines[0] = openField + lines[0];
			}
						
			parser.parseLines(lines);
			var parsedLines = parser.data;
			
			if ( openField ) 
			{
				// this looks so disgusting 
				csvFileReader.data[csvFileReader.data.length -1] = csvFileReader.data[csvFileReader.data.length -1].concat(parsedLines.shift());
			}
			
			var lastLine = ( parsedLines.length ? parsedLines : csvFileReader.data )[parsedLines.length-1] , lastField;
			if ( lastLine && (lastField = lastLine[lastLine.length-1]) && lastField[0] == parser_enclose && lastField[lastField.length-1] != parser_enclose )
			{
				openField = lastLine.pop();
			}			
			else
			{
				openField = false;
			}
			
			csvFileReader.data = csvFileReader.data.concat(parsedLines);
			
			if ( csvFileReader.onload )
			{
				return csvFileReader.onload(load);
			}
			return true;
		}
		
		reader.onloadend = function (loadend) { 
			csvFileReader.onloadend && csvFileReader.onloadend(loadend);
		}
		
		reader.read(file);
	} ,
	
	onload : null , // return false to abort loading process
	onloadend : null
};