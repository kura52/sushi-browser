const path = require('path')
const Jimp = require('jimp')

export default function(file,cb){
  Jimp.read(file, function (err, _image) {
    if(_image.bitmap.width > _image.bitmap.height){
      _image = _image.resize(160,Jimp.AUTO,Jimp.RESIZE_BICUBIC)
    }
    else{
      _image = _image.resize(Jimp.AUTO,160,Jimp.RESIZE_BICUBIC)
    }
    _image.write(file,_=>cb())
  });
}