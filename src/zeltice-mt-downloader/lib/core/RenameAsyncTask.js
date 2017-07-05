var fs = require('fs');

var task = function(oldName, newName, fd) {
	this.oldPath = oldName;
	this.newPath = newName;
  this.fd = fd
};
task.prototype.execute = function(callback) {
	this.callback = callback;

  fs.close(this.fd, (err) => {
    if (err) {
      console.log("Error closing file handle.")
    }
    fs.rename(this.oldPath, this.newPath, this.callback);
  })
};

module.exports = task;