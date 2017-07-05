var url = require('url')
var http = require('http');
var https = require('https')
var e = require('../Exceptions');

var HeadRequest = function (http_url, options) {
	options = options || {};

	this.url = url.parse(http_url, false, true);

	if ( this.url.port ) {
		this.port = this.url.port
	}	else if ( this.url.protocol ) {
		if ( this.url.protocol === 'https:' ) {
			this.port = 443
		} else {
			this.port = 80
		}
	} else {
		// no protocol and no port found.  we're S.O.L bois.
	}

	// console.log('Url:', this.url)

	// console.log('this.port:', this.port)

	this.headers = options.headers || {};
};

var onHttpHeadRequestComplete = (response, context, callback) => {
	// console.log('HEAD response.statusCode:', response.statusCode)
	// console.log('HEAD response.headers:', response.headers)

	if (response.statusCode == 301 || response.statusCode == 302) {
		// console.log('redirect detected, changing port and url...')

		var http_url = response.headers.location

		context.url = url.parse(http_url, false, true);

		if ( context.url.port ) {
			context.port = context.url.port
		}	else if ( context.url.protocol ) {
			if ( context.url.protocol === 'https:' ) {
				context.port = 443
			} else {
				context.port = 80
			}
		} else {
			// no protocol and no port found.  we're S.O.L bois.
		}

		_execute.call(context, callback)
	} else {
		var fileSize = Number(response.headers['content-length']);

		response.destroy();

		if (isNaN(fileSize)) {
			context.callback(e(1008, context.url.host));
			return;
		}

		var result = {
			fileSize: fileSize,
			headers: response.headers,
			port: context.port,
			url_object: context.url,
		};

		// console.log('fileSize:', fileSize)

		// console.log('calling headrequest callback w/ result:', result)
		callback(null, result);
	}
}

var _execute = function (callback) {
	var self = this;
	this.callback = callback;
	http.globalAgent.maxSockets = 200;
	http.Agent.defaultMaxSockets = 200;

  var requestOptions = {
		hostname: self.url.hostname,
		path: self.url.path,
		method: 'HEAD',
		port: self.port,
		headers: {'user-agent': process.userAgent,...self.headers}
	};

	// console.log('headers:', self.headers)
	// console.log('requestOptions', requestOptions)

	var htt_protocol = self.url.protocol == "https:" ? https : http

	var the_request = htt_protocol.request(requestOptions, (res) => {
		onHttpHeadRequestComplete(res, self, callback)
	})

	the_request.on('error', (err) => {
		console.log(err)
		self.callback(e(1004, self.url.host));
	})

	the_request.end();
};

HeadRequest.prototype.execute = _execute;

module.exports = HeadRequest;