/**
 * CSV File Reader
 *
 * @author jan Kowalleck <jan.kowalleck@googlemail.com>
 */

CsvFileReader = function (csvProperties, fileBufferSize) {
	this.reset();

	csvProperties && this.setCsvProperties(csvProperties);
	fileBufferSize && this.setFileBufferSize(fileBufferSize);
};

CsvFileReader.prototype = {
	constructor : CsvFileReader ,

	reset : function () {
		this.error = null;
		this.data = [];
	} ,

	csvProperties : (function(){ var defaults = {}; CsvParser.prototype.setCsvProperties.call(defaults); return defaults; })() ,
	setCsvProperties : function (csvProperties) {
		csvProperties = csvProperties || {};
		var csvProperties_tmpHolder = {};
		CsvParser.prototype.setCsvProperties.call(csvProperties_tmpHolder, csvProperties.delimiter, csvProperties.enclose, csvProperties.escape);
		this.csvProperties = csvProperties_tmpHolder;
	} ,

	fileBufferSize : LinewiseFileReader.prototype.bufferSize ,
	setFileBufferSize : function (fileBufferSize) {
		var fileBufferSize_tmpHolder = {};
		LinewiseFileReader.prototype.setBufferSize.call(fileBufferSize_tmpHolder, fileBufferSize);
		this.fileBufferSize = fileBufferSize_tmpHolder.bufferSize;
	} ,

	read : function ( file ) {
		var csvFileReader = this;
		csvFileReader.reset();

		var reader = new LinewiseFileReader(this.fileBufferSize);

		var csvProperties = this.csvProperties;
		var parser = new CsvParser(csvProperties.delimiter, csvProperties.enclose, csvProperties.escape);

		// @XXX maybe make reader.bufferSize smaller ...

		reader.onerror = function (error) {
			csvFileReader.error = this.error;
			csvFileReader.onerror && csvFileReader.onerror(error);
		};

		var lastTrailingOpenLine=false;
		reader.onload = function (load) {
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

			return ( !csvFileReader.onload || csvFileReader.onload(load) );
		};

		reader.onloadend = function (loadend) {
			csvFileReader.onloadend && csvFileReader.onloadend(loadend);
		};

		reader.read(file);
	} ,

	processOpenLine : function (openLine, data, trailingOpenLine) {
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