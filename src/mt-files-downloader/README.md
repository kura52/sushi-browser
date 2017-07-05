# Multi Threaded Files Downloader

This module wrap the [zeltice-mt-downloader](https://www.npmjs.com/package/zeltice-mt-downloader) module and let you :

- Manage multiple downloads
- Get stats (speed, eta, completed, etc)
- Auto-retry (continue) a download in case of error (ie. network error)
- Manually resume a download from partial file
- Stop and resume downloads
- Get notified by events when a download start, fail, retry, stopped, destroyed or complete

## Install

	npm install mt-files-downloader

## Usage

Require the module :

	var Downloader = require('mt-files-downloader');

Create a new Downloader instance :

	var downloader = new Downloader();

Create a new download :

	var dl = downloader.download('FILE_URL', 'FILE_SAVE_PATH');

Start the download :

	dl.start();

## Examples

You can find complete examples in the `examples/` folder :

- [Simple download](https://github.com/leeroybrun/node-mt-files-downloader/blob/master/examples/simple-download.js)
- [Multiple downloads](https://github.com/leeroybrun/node-mt-files-downloader/blob/master/examples/multiple-downloads.js)
- [Resume download](https://github.com/leeroybrun/node-mt-files-downloader/blob/master/examples/resume-download.js)
- [Stop & resume download](https://github.com/leeroybrun/node-mt-files-downloader/blob/master/examples/stop-n-resume-download.js)
- [Destroy download](https://github.com/leeroybrun/node-mt-files-downloader/blob/master/examples/destroy-download.js)
- [Custom download options](https://github.com/leeroybrun/node-mt-files-downloader/blob/master/examples/custom-download-options.js)

## Events

You can then listen to those events :

- `dl.on('start', function(dl) { ... });`
- `dl.on('error', function(dl) { ... });`
- `dl.on('end', function(dl) { ... });`
- `dl.on('stopped', function(dl) { ... });`
- `dl.on('destroyed', function(dl) { ... });`
- `dl.on('retry', function(dl) { ... });`

## Downloader object

### Methods

- download(URL, FILE_SAVE_PATH, [options])
    - URL : URL of the file to download
    - FILE_SAVE_PATH : where to save the file (including filename !)
    - options : optional, passed directly to Download object
- resumeDownload(filePath) : create a new download by resuming from an existing file
- getDownloads() : get the list of downloads in manager
- getDownloadByUrl(url) : get a specified download by URL
- getDownloadByFilePath(filePath) : get a specified download by file path
- removeDownloadByFilePath(filePath) : remove a specified download by file path. It does not destroy it, just remove from download manager ! Call download.destroy() before if you want to completely remove it.

### Formatters methods

The Downloader object exposes some formatters for the stats as static methods :

- Downloader.Formatters.speed(speed)
- Downloader.Formatters.elapsedTime(seconds)
- Downloader.Formatters.remainingTime(seconds)

## Download object

### Properties

- status :
    - -3 = destroyed
    - -2 = stopped
    - -1 = error
    - 0 = not started
    - 1 = started (downloading)
    - 2 = error, retrying
    - 3 = finished
- url
- filePath
- options
- meta

### Methods

- setUrl(url) : set the download URL
- setFilePath(path) : set the download file save path
- setOptions(options) : set the download options
    - threadsCount: Default: 2, Set the total number of download threads
    - method: Default: GET, HTTP method
    - port: Default: 80, HTTP port
    - timeout: Default: 5000, If no data is received, the download times out (milliseconds)
    - range: Default: 0-100, Control the part of file that needs to be downloaded.
- setRetryOptions(options) : set the retry options
    - maxRetries: Default 5, max number of retries before considering the download as failed
    - retryInterval: Default 2000, interval (milliseconds) between each retry
- setMeta(meta) : set download metadata
- setStatus(status) : set download status
- setError(error) : set error message for download
- getStats() : compute and get stats for the download
- start() : start download
- resume() : resume download
- stop() : stop the download, keep the files
- destroy() : stop the download, remove files

## TODO

- Validate data (setters)
- Add tests

## Licence

The MIT License (MIT)

Copyright (c) 2015 Leeroy Brun

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
