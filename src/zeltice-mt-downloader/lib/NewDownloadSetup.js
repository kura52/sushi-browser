var u = require('./Utils');
var a = require('async');

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

//META DATA
var MetaDataBuilder = require('./core/MetaDataBuilderSyncTask');


//READ WRITE
var DownloadWriter = require('./core/DownloadWriterAsyncTask');
var DownloadReader = require('./core/DownloadReaderAsyncTask');


//EXECUTOR
var ExecutorGenerator = require('./core/ExecutorGenerator');

//INDICATOR
var StartIndicator = require('./core/StartIndicator');

//VALIDATOR
var DownloadValidator = require('./core/DownloadValidator');

var Setup_New_Download = function(options) {
	this.options = options;
};

Setup_New_Download.prototype.execute = function(callback) {
	var options = this.options;

	this.tasks = {

		//HTTP
		'http-head': ['file-handle', function(callback, results) {
			u.executor(HeadRequest, options.url, options)(callback);
		}],


		//THREADS
		'threads-generate': ['http-head',	function(callback, results) {
			u.executor(ThreadsGenerator,
			results['http-head'].fileSize,
			results['http-head'].headers,
			results['http-head'].port,
			results['http-head'].url_object,
			options)(callback);
		}],


		//FILE
		'file-name': a.apply( u.executor(FileNameGenerator, options.file) ),

		'file-handle': ['file-name', function(callback, results) {
			// console.log('file-handle')
			// console.log('  results so far:', results)
			u.executor(FileHandler, results['file-name'].downloadFile, true)(callback);
		}],

		'file-truncate': ['validate-download', function(callback, results) {
			u.executor(Truncator, results['file-handle'], results['meta-read'].downloadSize)(callback);
		}],

		'file-rename': ['file-truncate', function(callback, results) {
			u.executor(Renamer,	results['file-name'].downloadFile, results['file-name'].originalFile, results['file-handle'])(callback);
		}],


		//META(UPDATE AND WRITE TIMELY)
		'meta-generate': ['threads-generate',	function(callback, results) {
			// console.log('options so far:', options)
			// console.log('results[http-head]', results['http-head'])
			u.executor(MetaDataBuilder,
				results['threads-generate'],
				results['http-head'].fileSize,
				results['http-head'].url_object.href || options.url,
				options.method,
				results['http-head'].port,
				results['http-head'].headers,
				options
			)(callback);
		}],


		'meta-write': ['meta-generate', 'file-handle', function(callback, results) {
			u.executor(DownloadWriter, results['file-handle'])(
				results['meta-generate'].data,
				results['meta-generate'].position,
				callback
			);
		}],

		'meta-read': ['meta-write',	function(callback, results) {
			u.executor(DownloadReader,
				results['file-handle'],
				options
			)(callback);
		}],

		//INDICATOR
		'start-indicator': ['meta-read', function(callback, results) {
			u.executor(StartIndicator,
				results['meta-read'].threads,
				results['meta-read'].downloadSize,
				results['meta-read'].url,
				results['meta-read'].headers,
				options
			)(callback);
		}],

		//EXECUTOR GENERATOR
		'executor-generator': ['meta-read', function(callback, results) {
			// console.log('meta-read:', results['meta-read'])
			u.executor(ExecutorGenerator,
				results['file-handle'],
				results['meta-read'].threads,
				results['meta-read'].downloadSize,
				results['meta-read'].url,
				results['meta-read'].method,
				results['meta-read'].port,
				results['meta-read'].headers,
				Object.assign({}, options, {port: results['http-head'].port})
			)(callback);
		}],

		//VALIDATE DOWNLOAD
		'validate-download': ['http-data', function(callback, results) {
			u.executor(DownloadValidator, results['meta-read'].threads)(callback);
		}],

		//DATA
		'http-data': ['executor-generator',	function(callback, results) {
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

module.exports = Setup_New_Download;