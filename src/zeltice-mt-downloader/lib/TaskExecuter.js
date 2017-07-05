//UNIVERSALS
var a = require('async');
var e = require('./Exceptions');
var u = require('./Utils');
var NewDownload = require('./NewDownloadSetup');
var ReDownload = require('./ReDownloadSetup');

var isReDownload = function() {
	this.options.downloadType = 'new';
	if (this.options.file.match(/.*\.mtd$/g)) {
		this.options.downloadType = 're';
		return true;
	}
	return false;
}

var normalizeUrl = function(url) {
	if ( url.startsWith("//") )
		return `http:${url}`

	if ( !url.startsWith("http") )
		return `http://${url}`

	return url
}

var TaskExecuter = function(file, url, options) {
	if (url !== null) {
		url = normalizeUrl(url)
	}

	this.options = options || {};

	this.options.file = file;

	if (isReDownload.call(this) === false) {
		this.options.url = url;
		// console.log("not a redownload")
	} else {
		// console.log("is a redownload")
	}

};


var _start = function() {
	var self = this;
	var run_tasks_asynchronously = function(tasks) {
		a.auto(tasks, self.options.onEnd);
	};

	if (self.options.downloadType == 'new') {
		if (self.options.url === undefined)
			self.options.onEnd(e(1005));
		else {
			// u.executor(NewDownload, self.options)(callback);

			var execute_fn = u.executor(NewDownload, self.options)

			execute_fn( run_tasks_asynchronously )
		}
	} else {
		u.executor(ReDownload, self.options)( run_tasks_asynchronously );
	}
};


TaskExecuter.prototype.start = _start;

module.exports = TaskExecuter;