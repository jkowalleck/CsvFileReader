
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
		this.error = null;
		this.data = [];
	} ,

	read : function ( file )
	{
		var csvFileReader = this;
		csvFileReader.reset();

		var reader = new LinewiseFileReader();
		var parser = new CsvParser(this.delimiter, this.enclose, this.escape);

		// @XXX maybe make reader.bufferSize smaller ...

		reader.onerror = function (error)
		{
			csvFileReader.error = this.error;
			csvFileReader.onerror && csvFileReader.onerror(error);
		};

		var lastTrailingOpenLine=false;
		reader.onload = function (load)
		{
			var lines = this.lines;
			this.reset();

			var trailingOpenLine = parser.parseLines(lines)
			  , data = parser.data;
			parser.reset();

			trailingOpenLine = csvFileReader.processOpenLine(lastTrailingOpenLine, data, trailingOpenLine);
			csvFileReader.data = csvFileReader.data.concat(data);

			var notDone = ( load.loaded < load.total );
			if ( notDone )
			{
				lastTrailingOpenLine = trailingOpenLine;
			}
			else if ( trailingOpenLine !== false )
			{
				csvFileReader.data.push(trailingOpenLine);
			}

			var notAbort = ( csvFileReader.onload && csvFileReader.onload(load) );
			return notAbort;
		};

		reader.onloadend = function (loadend)
		{
			csvFileReader.onloadend && csvFileReader.onloadend(loadend);
		};

		reader.read(file);
	} ,

	processOpenLine : function (openLine, data, trailingOpenLine)
	{
		if ( openLine !== false )
		{
			var dataFirstLine = data[0];
			if ( dataFirstLine !== undefined )
			{
				data[0] = openLine.concat(dataFirstLine);
			}
			else if ( trailingOpenLine !== false  )
			{
				trailingOpenLine = openLine.concat(trailingOpenLine);
			}
			else
			{
				trailingOpenLine = openLine;
			}
		}

		return trailingOpenLine;
	} ,

	onerror : null ,
	onload : null , // return false to abort loading process
	onloadend : null
};