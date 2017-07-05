var Download = require('./Download');
var Formatters = require('./Formatters');
var util = require('util');

var extend = function(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
};

/*
  ------------------------------------------
  - Downloader class
  ------------------------------------------
 */
var Downloader = function() {
	this._downloads = [];
};

Downloader.prototype._defaultOptions = {
    //To set the total number of download threads
    threadsCount: 2, //(Default: 6)

    //HTTP method
    method: 'GET', //(Default: GET)

    //HTTP port
    port: 80, //(Default: 80)

    //If no data is received the download times out. It is measured in seconds.
    timeout: 5000, //(Default: 5 seconds)

    //Control the part of file that needs to be downloaded.
    range: '0-100', //(Default: '0-100')
};

Downloader.prototype.download = function(url, filePath, options) {
	var options = extend({}, this._defaultOptions, options);

	var dl = new Download();

	dl.setUrl(url);
	dl.setFilePath(filePath);
	dl.setOptions(options);

	this._downloads.push(dl);

    return dl;
};

Downloader.prototype.resumeDownload = function(filePath, options) {
    var options = extend({}, this._defaultOptions, options);
    
    var dl = new Download();

    if (!filePath.match(/\.mtd$/)) {
        filePath += '.mtd';
    }

    dl.setUrl(null);
    dl.setFilePath(filePath);
    dl.setOptions(options);

    this._downloads.push(dl);

    return dl;
};

// For backward compatibility, will be removed in next releases
Downloader.prototype.restart = util.deprecate(function(filePath) {
    return this.resumeDownload(filePath);
}, 'Downloader `restart(filePath)` is deprecated, please use `resumeDownload(filePath)` instead.');

Downloader.prototype.getDownloadByUrl = function(url) {
	var dlFound = null;

	this._downloads.forEach(function(dl) {
		if(dl.url === url || (dl.meta && dl.meta.url && dl.meta.url == url)) {
			dlFound = dl;
		}
	});

	return dlFound;
};

Downloader.prototype.getDownloadByFilePath = function(filePath) {
    var dlFound = null;

    var mtdRegex = new RegExp('(.mtd)*$', 'g');

    filePath = filePath.replace(mtdRegex, '');

    this._downloads.forEach(function(dl) {
        var dlFilePath = dl.filePath //.replace(mtdRegex, '');

        if(dlFilePath === filePath) {
            dlFound = dl;
        }
    });

    return dlFound;
};

Downloader.prototype.removeDownloadByFilePath = function(filePath) {
    var dlFound = false;

    var mtdRegex = new RegExp('(.mtd)*$', 'g');

    filePath = filePath.replace(mtdRegex, '');

    for(var i = 0; i < this._downloads.length; i++) {
        var dlFilePath = this._downloads[i].filePath.replace(mtdRegex, '');

        if(dlFilePath === filePath) {
            this._downloads.splice(i, 1);
            dlFound = true;
        }
    }

    return dlFound;
};

Downloader.prototype.getDownloads = function() {
    return this._downloads;
};

Downloader.prototype.Formatters = Formatters;
Downloader.Formatters = Formatters;

module.exports = Downloader;
