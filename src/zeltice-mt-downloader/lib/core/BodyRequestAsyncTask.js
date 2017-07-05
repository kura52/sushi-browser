var http = require('http')
var https = require('https')
var Url = require('url');
var e = require('../Exceptions');

var BodyDownloader = function (url, start, end, options) {

	// console.log("options:", options)

	this.url = Url.parse(url);
	this.rangeHeader = 'bytes=' + start + '-' + end;
	options = options || {};
	this.method = options.method || "GET";
	this.port = options.port;
	this.startByte = start;
	this.endByte = end;
	this.headers = options.headers || {};

	// console.log('BodyDownloader:', this)
};

var _start = function (callback) {
	var self = this;
	self.callback = callback;
	if (self.startByte >= self.endByte) {
		self.callback(null, {
			event: 'end'
		});
		return;
	}

	var onError = self.callback.bind(self);

	var _onStart = function (response) {
		var destroy = response.destroy.bind(response);

		self.callback(null, {
			event: 'response',
			destroy: destroy
		});

		response.addListener('data', function (chunk) {
			self.callback(null, {
				data: chunk,
				event: 'data'
			});
		});

		response.addListener('end', function (chunk) {
			self.callback(null, {
				event: 'end'
			});
		});

	};

	this.headers.range = this.rangeHeader
	var requestOptions = {
		headers: {'user-agent': process.userAgent,...this.headers},
		hostname: this.url.hostname,
		path: this.url.path,
		method: this.method,
		port: this.port
	};
	console.log(requestOptions)


	var htt_protocol = this.url.protocol == "https:" ? https : http

	htt_protocol.request(requestOptions, _onStart)
		.on('error', onError)
		.end();
};

BodyDownloader.prototype.onError = function (e) {
	this.callback(e);
};
BodyDownloader.prototype.execute = _start;

module.exports = BodyDownloader;