var mtd = require('../../zeltice-mt-downloader');
var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Download = function() {
  EventEmitter.call(this);

  this._reset();

  this.url = '';
  this.filePath = '';
  this.options = {};
  this.meta = {};

  this._retryOptions = {
    _nbRetries: 0,
    maxRetries: 5,
    retryInterval: 5000
  };
};

util.inherits(Download, EventEmitter);

Download.prototype._reset = function(first_argument) {
  this.status = 0; // -3 = destroyed, -2 = stopped, -1 = error, 0 = not started, 1 = started (downloading), 2 = error, retrying, 3 = finished
  this.error = '';

  this.stats = {
    time: {
      start: 0,
      end: 0
    },
    total: {
      size: 0,
      downloaded: 0,
      completed: 0
    },
    past: {
      downloaded: 0
    },
    present: {
      downloaded: 0,
      time: 0,
      speed: 0
    },
    future: {
      remaining: 0,
      eta: 0
    },
    threadStatus: {
      idle: 0,
      open: 0,
      closed: 0,
      failed: 0
    }
  };
};

Download.prototype.setUrl = function(url) {
  this.url = url;

  return this;
};

Download.prototype.setFilePath = function(filePath) {
  this.filePath = filePath;

  return this;
};

Download.prototype.setOptions = function(options) {
  if(!options || options == {}) {
    return this.options = {};
  }

  // The "options" object will be directly passed to mt-downloader, so we need to conform to his format

  //To set the total number of download threads
  this.options.count = options.threadsCount || options.count || 2;

  //HTTP method
  this.options.method = options.method || 'GET';

  //HTTP port
  this.options.port =  options.port || 80;

  //If no data is received the download times out. It is measured in seconds.
  this.options.timeout = options.timeout/1000 || 5;

  //Control the part of file that needs to be downloaded.
  this.options.range = options.range || '0-100';

  return this;
};

Download.prototype.setRetryOptions = function(options) {
  this._retryOptions.maxRetries = options.maxRetries || 5;
  this._retryOptions.retryInterval = options.retryInterval || 2000;

  return this;
};

Download.prototype.setMeta = function(meta) {
  this.meta = meta;

  return this;
};

Download.prototype.setStatus = function(status) {
  this.status = status;

  return this;
};

Download.prototype.setError = function(error) {
  this.error = error;

  return this;
};

Download.prototype._computeDownloaded = function() {
  if(!this.meta.threads) { return 0; }

  var downloaded = 0;
  this.meta.threads.forEach(function(thread) {
    downloaded += thread.position - thread.start;
  });

  return downloaded;
};

// Should be called on start, set the start timestamp (in seconds)
Download.prototype._computeStartTime = function() {
  this.stats.time.start = Math.floor(Date.now() / 1000);
};

// Should be called on end, set the end timestamp (in seconds)
Download.prototype._computeEndTime = function() {
  this.stats.time.end = Math.floor(Date.now() / 1000);
};

// Should be called on start, count size already downloaded (eg. resumed download)
Download.prototype._computePastDownloaded = function() {
  this.stats.past.downloaded = this._computeDownloaded();
};

// Should be called on start compute total size
Download.prototype._computeTotalSize = function() {
  var threads = this.meta.threads;

  if(!threads) { return 0; }

  this.stats.total.size = threads[threads.length-1].end - threads[0].start;
};

Download.prototype._computeStats = function() {
  this._computeTotalSize();
  this._computeTotalDownloaded();
  this._computePresentDownloaded();
  this._computeTotalCompleted();
  this._computeFutureRemaining();

  // Only compute those stats when downloading
  if(this.status == 1) {
    this._computePresentTime();
    this._computePresentSpeed();
    this._computeFutureEta();
    this._computeThreadStatus();
  }
};

Download.prototype._computePresentTime = function() {
  this.stats.present.time = Math.floor(Date.now() / 1000) - this.stats.time.start;
};

Download.prototype._computeTotalDownloaded = function() {
  this.stats.total.downloaded = this._computeDownloaded();
};

Download.prototype._computePresentDownloaded = function() {
  this.stats.present.downloaded = this.stats.total.downloaded - this.stats.past.downloaded;
};

Download.prototype._computeTotalCompleted = function() {
  this.stats.total.completed = Math.floor((this.stats.total.downloaded) * 1000 / this.stats.total.size) / 10;
};

Download.prototype._computeFutureRemaining = function() {
  this.stats.future.remaining = this.stats.total.size - this.stats.total.downloaded;
};

Download.prototype._computePresentSpeed = function() {
  this.stats.present.speed = this.stats.present.downloaded / this.stats.present.time;
};

Download.prototype._computeFutureEta = function() {
  this.stats.future.eta = this.stats.future.remaining / this.stats.present.speed;
};

Download.prototype._computeThreadStatus = function() {
  var self = this;

  this.stats.threadStatus = {
    idle: 0,
    open: 0,
    closed: 0,
    failed: 0
  };

  this.meta.threads.forEach(function(thread) {
    self.stats.threadStatus[thread.connection]++;
  });
};

Download.prototype.getStats = function() {
  if(!this.meta.threads) {
    return this.stats;
  }

  this._computeStats();

  return this.stats;
};

Download.prototype._destroyThreads = function() {
  if(this.meta.threads) {
    this.meta.threads.forEach(function(i){
      if(i.destroy) {
        i.destroy();
      }
    });
  }
};

Download.prototype.stop = function() {
  this.setStatus(-2);

  this._destroyThreads();

  this.emit('stopped', this);
};

Download.prototype.destroy = function() {
  var self = this;

  this._destroyThreads();

  this.setStatus(-3);

  var filePath = this.filePath;
  var tmpFilePath = filePath;
  if (!filePath.match(/\.mtd$/)) {
    tmpFilePath += '.mtd';
  } else {
    filePath = filePath.replace(new RegExp('(.mtd)*$', 'g'), '');
  }

  fs.unlink(filePath, function() {
    fs.unlink(tmpFilePath, function() {
      self.emit('destroyed', this);
    });
  });
};

Download.prototype.start = function() {
  var self = this;

  self._reset();
  self._retryOptions._nbRetries = 0;

  this.options.onStart = function(meta) {
    self.setStatus(1);
    self.setMeta(meta);

    self.setUrl(meta.url);

    self._computeStartTime();
    self._computePastDownloaded();
    self._computeTotalSize();

    self.emit('start', self);
  };

  this.options.onEnd = function(err, result) {
    // If stopped or destroyed, do nothing
    if(self.status == -2 || self.status == -3) {
      return;
    }

    // If we encountered an error and it's not an "Invalid file path" error, we try to resume download "maxRetries" times
    if(err && !(''+err).match(/Invalid file path|Head request failed to/) && self._retryOptions._nbRetries < self._retryOptions.maxRetries) {
      self.setStatus(2);
      self._retryOptions._nbRetries++;

      setTimeout(function() {
        self.resume();

        self.emit('retry', self);
      }, self._retryOptions.retryInterval);
      // "Invalid file path" or maxRetries reached, emit error
    } else if(err) {
      self._computeEndTime();

      self.setError(err);
      self.setStatus(-1);

      self.emit('error', self);
      // No error, download ended successfully
    } else {
      self._computeEndTime();

      self.setStatus(3);

      self.emit('end', self);
    }
  };

  this._downloader = new mtd(this.filePath, this.url, this.options);

  this._downloader.start();

  return this;
};

Download.prototype.resume = function() {
  this._reset();

  var filePath = this.filePath;
  let url = this.url
  if (!filePath.match(/\.mtd$/)) {
    const stat = fs.statSync(`${filePath}.mtd`)
    if(stat){
      if(stat.size > 0){
        console.log("resume",filePath)
        filePath += '.mtd';
        url = null
      }
      else{
        fs.unlinkSync(`${filePath}.mtd`)
      }
    }

  }

  this._downloader = new mtd(filePath, url, this.options);

  this._downloader.start();

  return this;
};

// For backward compatibility, will be removed in next releases
Download.prototype.restart = util.deprecate(function() {
  return this.resume();
}, 'Download `restart()` is deprecated, please use `resume()` instead.');

module.exports = Download;