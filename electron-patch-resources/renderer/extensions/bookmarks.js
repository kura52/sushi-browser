const {simpleIpcFunc} = require('./util')

exports.setup = (chrome) => {
  return {
    get(idOrIdList, callback){
      simpleIpcFunc('get', callback, idOrIdList)
    },
    getChildren(id, callback){
      simpleIpcFunc('getChildren', callback, id)
    },
    getRecent(numberOfItems, callback){
      simpleIpcFunc('getRecent', callback, numberOfItems)
    },
    getTree(callback){
      simpleIpcFunc('chrome-bookmarks-getTree', ret=>{
        if(chrome.runtime.getBrowserInfo){
          ret[0].children = [
            { id:"menu________", title:"Bookmark Menu", index:0, dateAdded:1528599737256, type:"folder", parentId:"0", dateGroupModified:1528599737854, children:[] },
            { id:"toolbar_____", title:"Bookmark Toolbar", index:0, dateAdded:1528599737256, type:"folder", parentId:"0", dateGroupModified:1528599737854, children:ret[0].children },
            { id:"unfiled_____", title:"Bookmark Unfiled", index:0, dateAdded:1528599737256, type:"folder", parentId:"0", dateGroupModified:1528599737854, children:[] },
            { id:"mobile______", title:"Bookmark Mobile", index:0, dateAdded:1528599737256, type:"folder", parentId:"0", dateGroupModified:1528599737854, children:[] },
            { id:"menu________", title:"Bookmark Menu", index:0, dateAdded:1528599737256, type:"folder", parentId:"0", dateGroupModified:1528599737854, children:[] },
          ]
        }
        callback(ret)
      })
    },
    getSubTree(id, callback){
      simpleIpcFunc('getSubTree', callback, id)
    },
    search(query, callback){
      simpleIpcFunc('search', callback, query)
    },
    create(bookmark, callback){
      simpleIpcFunc('create', callback, bookmark)
    },
    move(id, destination, callback){
      simpleIpcFunc('move', callback, id, destination)
    },
    update(id, changes, callback){
      simpleIpcFunc('update', callback, id, changes)
    },
    remove(id, callback){
      simpleIpcFunc('remove', callback, id)
    },
    removeTree(id, callback){
      simpleIpcFunc('removeTree', callback, id)
    },
    bookmarkManagerPrivate: {
      onMetaInfoChanged:{set(){},get(){return true},clear(){},addListener(){},removeListener(){},hasListener(){},hasListeners(){}}
    }
  }
}
