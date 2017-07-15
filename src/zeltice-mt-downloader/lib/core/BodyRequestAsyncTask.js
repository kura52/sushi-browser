var http = require('http')
var https = require('https')
var Url = require('url');
var e = require('../Exceptions');
const {session} = require('electron')
const moment = require('moment')

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

  const now = moment().unix()
  session.defaultSession.cookies.get({url: self.url}, (error, cookies) => {
    const cookieArray = []
    if(!error && cookies.expirationDate >= now){
      cookieArray.push(`${cookies.name}=${cookies.value}`)
    }


    if(cookieArray.length > 0){
      requestOptions.headers['Cookie'] = cookieArray.join('; ')
    }


    var htt_protocol = this.url.protocol == "https:" ? https : http

		console.log(requestOptions)
    htt_protocol.request(requestOptions, _onStart)
      .on('error', onError)
      .end();
  })
};

BodyDownloader.prototype.onError = function (e) {
	this.callback(e);
};
BodyDownloader.prototype.execute = _start;

module.exports = BodyDownloader;