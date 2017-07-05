NOTE: This is an opinionated revision of the original [mt-downloader](https://github.com/tusharmath/Multi-threaded-downloader) code.

This codebase enhances upon the original work with the following:

##Features
1. **HTTP & HTTPS downloads work:** Working download for both protocols.  Refer to code examples below.

2. **Properly Downloads Redirecting URLs:** Sometimes URLs will redirect to another URL, for N times.  This library will follow redirects until it finds the source.

3. **Windows Support:** Add official support for Windows 10 x64 and Windows Server 2012 R2 (32 + 64 bit) operating systems.

4. **Multi threaded downloads:** In a conventional single threaded download you might experience poor performance due to network lags etc. So you don't completely utilize your bandwidth. With multi threads there is always one thread which is getting data thus minimizing the wait period between data packets.

5. **Stop and start from the last downloaded byte:**. You don't have to worry about internet getting disconnected or your computer shutting down while downloading. You can quite easily start from the last byte that was downloaded.

##Installation

The conventional npm installation process needs to be followed.

```bash
$ npm install zeltice-mt-downloader --save-dev
```

##.mtd file
Once the download starts the library will create a file with a **.mtd** extension. This file contains some meta information related to the download and is a little bigger *(around 10kb)* than the original download size. The **.mtd** file can be used later to restart downloads from where the last byte that was downloaded. After the download is completed the downloader will truncate the file to remove that meta data.

##New-Downloads
When you want to start a new download you just need to provide a download url and a download path and call the ```start()``` method.

```javascript
var url = require("url")
var path = require("path")
var mtd = require('zeltice-mt-downloader')

var target_url = "https://upload.wikimedia.org/wikipedia/commons/4/47/Gadget_the_pug_expressive_eyes.jpg"
var file_name = path.basename(url.parse(target_url).pathname)
var file_path = path.join(__dirname, file_name)

var downloader = new mtd(file_path, target_url)

downloader.start()
```

##Re-Downloads
If you want to restart a download from where it left off. You just need to provide the path of the **.mtd** file.

```javascript
var url = require("url")
var path = require("path")
var mtd = require('zeltice-mt-downloader')

// File should have a .mtd extension
var file_path = "/var/www/some_incomplete_download_file.zip.mtd"

var downloader = new mtd(file_path)

downloader.start()
```

##Download Options
A set of custom options can be sent to control the way a download is performed.

```javascript
var options = {
  //To set the total number of download threads
  count: 8, //(Default: 2)

	//To set custom headers, such as cookies etc.
  headers: {cookies: 'abc=pqr;'},

  //HTTP method
  method: 'GET', //(Default: GET)

  //HTTP port
  port: 80, //(Default: 80)

  //If no data is received the download times out. It is measured in seconds.
  timeout: 5, //(Default: 5 seconds)

  //Control the part of file that needs to be downloaded.
  range: '0-100', //(Default: '0-100')

  //Triggered when the download is started
  onStart: function(meta) {
    console.log('Download Started', meta);
  },

  //Triggered when the download is completed
  onEnd: function(err, result) {
    if (err) console.error(err);
    else console.log('Download Complete');
  }
};
```

##*onStart* Callback
The onStart method is called with some meta data. The main components are as follows -

1. **url:** As we learnt from above that we don't need to provide a url parameter to start a download from .mtd file. So this is particularly useful when you want to know the url of a file which is getting downloaded from a .mtd file.

2. **size:** This stores the actual download size of the file on the server.

3. **threads:** This stores the actual download thread information. Fields such as start, end and position. We will learn more about it later.

4. **headers:** You can get all the http Headers of the download in case you want to use them. For instance, you might want to use the **Content-Disposition** header to get the name of the downloaded file.

##*threads* Meta
The ```onStart``` callback return a **threads** object which stores all the information related to the download threads. This vital object is available of consumption for other libraries. With this object you can retrieve all kinds of information related to the download status of the file.

Each thread has a **connection** key which shows its downloading status, namely -

1. **Idle:** It means that no connection has yet been established successfully.

2. **Open:** Connection has been made and data is getting received through this thread.

3. **Closed:** Download has been completed successfully for this thread.

4. **Failed:** Download abruptly ended for this thread.


**Important Note:** Never modify this object or else your download will be corrupted.
The threads also have ```start```, ```position``` and ```end``` keys. They tell what part of the download does each thread represent in terms of *bytes*. ```start``` represents the start byte, ```end``` represents the end byte and ```position``` represents the bytes that have been downloaded till now.
