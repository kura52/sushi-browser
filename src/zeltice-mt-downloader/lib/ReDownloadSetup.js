//UNIVERSALS
var a = require('async');
var u = require('./Utils');
var url = require('url')

//HTTP
var HeadRequest = require('./core/HeadRequestAsyncTask');
var DataRequest = require('./core/DataRequestTask');

//FILE
var FileHandler = require('./core/FileHandlerAsyncTask');
var Truncator = require('./core/TruncateAsyncTask');
var FileNameGenerator = require('./core/FileNameGeneratorSync');
var Renamer = require('./core/RenameAsyncTask');

//Threads
var ThreadsGenerator = require('./core/ThreadsGeneratorSyncTask');
var ThreadUpdater = require('./core/ThreadUpdateTask');

//META DATA
var MetaDataBuilder = require('./core/MetaDataBuilderSyncTask');
var MetaDataUpdater = require('./core/MetaDataUpdator');


//READ WRITE
var DownloadWriter = require('./core/DownloadWriterAsyncTask');
var DownloadReader = require('./core/DownloadReaderAsyncTask');


//EXECUTOR
var ExecutorGenerator = require('./core/ExecutorGenerator');

//INDICATOR
var StartIndicator = require('./core/StartIndicator');

//VALIDATOR
var DownloadValidator = require('./core/DownloadValidator');

var _calculatePortFromUrl = (http_url) => {
	if (!http_url)
		return 80

	http_url = url.parse(http_url, false, true);

	var port = 80
	if ( http_url.port ) {
		port = http_url.port
	}	else if ( http_url.protocol ) {
		if ( http_url.protocol === 'https:' ) {
			port = 443
		} else {
			port = 80
		}
	} else {
		// no protocol and no port found.  we're S.O.L bois.
	}

	return port
}

var Setup_Re_Download = function(options) {
	this.options = options;
};

Setup_Re_Download.prototype.execute = function(callback) {
	var options = this.options;

	this.tasks = {

		//EXECUTOR GENERATOR
		'executor-generator': ['meta-update', function(callback, results) {
			var port = _calculatePortFromUrl(results['meta-update'].url)

			u.executor(ExecutorGenerator,
				results['file-handle'],
				results['meta-update'].threads,
				results['meta-update'].downloadSize,
				results['meta-update'].url,
				results['meta-update'].method,
				results['meta-update'].port,
				results['meta-update'].headers,
				Object.assign({}, options, {port: port})
			)(callback);
		}],


		'file-name': a.apply(u.executor(FileNameGenerator, options.file)),

		'file-handle': ['file-name',

		function(callback, results) {
			u.executor(FileHandler,
			results['file-name'].downloadFile, false)(callback);
		}],

		'file-truncate': ['validate-download',

		function(callback, results) {
			u.executor(Truncator,
			results['file-handle'],
			results['meta-update'].downloadSize)(callback);
		}],



		'file-rename': ['file-truncate',

		function(callback, results) {
			u.executor(Renamer,
			results['file-name'].downloadFile,
			results['file-name'].originalFile,
			results['file-handle']
			)(callback);
		}],

		'meta-read': ['file-handle',

		function(callback, results) {
			u.executor(DownloadReader,
			results['file-handle'],
			options)(callback);
		}],

		'meta-update': ['meta-read',

		function(callback, results) {
			u.executor(MetaDataUpdater,
			results['meta-read'],
			options)(callback);
		}],

		//INDICATOR
		'start-indicator': ['meta-update', function(callback, results) {
			u.executor(StartIndicator,
			results['meta-update'].threads,
			results['meta-update'].downloadSize,
			results['meta-update'].url,
			results['meta-update'].headers,
			options)(callback);
		}],

		//VALIDATE DOWNLOAD
		'validate-download': ['http-data',

		function(callback, results) {
			u.executor(DownloadValidator, results['meta-read'].threads)(callback);
		}],


		//DATA
		'http-data': ['executor-generator',

		function(callback, results) {
			u.executor(DataRequest,
				results['executor-generator'].writer,
				results['executor-generator'].threads,
				results['executor-generator'].metaBuilder,
				results['executor-generator'].timer,
				results['executor-generator'].threadUpdator,
				results['executor-generator'].threadsDestroyer,
				results['meta-read'].downloadSize,
				options
			)(callback);
		}]
	};
	callback(this.tasks);
};

module.exports = Setup_Re_Download;