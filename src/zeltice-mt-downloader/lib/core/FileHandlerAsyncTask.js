var fs = require('fs');
var e = require('../Exceptions');
global.FHandler = {}

var FileHandleGenerator = function(fileName, truncate) {
	this.file = fileName;
	this.truncate = truncate || false;
};

var _execute = function(callback) {
	this.callback = callback;
	var self = this;
	var mode = 'r+';

	if (self.truncate === false) {
		if (fs.existsSync(self.file) === false) {
			self.callback(e(1003, self.file));
			return;
		}
	} else if (self.truncate === true) {
		mode = 'w+';
	}

	fs.open(this.file, mode, undefined, (err, fd)=> {
    global.FHandler[this.file] = fd
		if (err)
			self.onError(err);
		else {
			self.fd = fd;
			self.callback(null, fd);
		}
	});
};

FileHandleGenerator.prototype.execute = _execute;
FileHandleGenerator.prototype.onError = function(err) {
	this.callback(e(1007, this.file));
};

module.exports = FileHandleGenerator;