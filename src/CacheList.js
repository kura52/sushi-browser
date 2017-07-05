const {getMediaList} = require('./databaseFork')
const {getFromUrls} = require('./chromagnon/chromagnonCache')
const {sprintf} = require("sprintf-js")


function formatDate (date, format) {
  if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  if (format.match(/S/g)) {
    var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
    var length = format.match(/S/g).length;
    for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
  }
  return format;
};

export default (async function(){
  const ret = await getMediaList()
  // console.log(ret)
  const map = new Map()

  let {caches,path} = getFromUrls(ret.map(x=>{
    map.set(x.url,x)
    return x.url
  }))

  const result = []
  caches.forEach(x=>{
    if(!x.data[x.data.length -1]) return
    const data = map.get(x.key)
    result.push({type: data.type,
      fullSize: data.size,
      url: data.url,
      fname: data.fname,
      creationTime: formatDate(x.creationTime),
      addr: `f_00${sprintf("0x%08x",x.data[x.data.length -1].address.addr).slice(-4)}`,
      path: path,
      size: x.data[x.data.length -1].size
    })
  })
  // console.log(result.sort((a,b)=> a < b ? -1 : a > b ? 1 : 0))
  return result.sort((a,b)=> a < b ? -1 : a > b ? 1 : 0)
})