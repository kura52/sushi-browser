import { Browser } from './Browser'

export default {
  async bg(){
    if(Browser.bg) return Browser.bg
    for(let i=0;i<100;i++){
      await new Promise(r=>setTimeout(r,1000))
      if(Browser.bg) return Browser.bg
    }
  },

  async search(query){
    return (await this.bg()).evaluate((query) => {
      return new Promise(resolve => {
        chrome.bookmarks.search(query, results => resolve(results.map(x=>({title: x.title, location: x.url}))))
      })
    }, query)
  },

  async getSubTree(id){
    return (await this.bg()).evaluate((id) => {
      return new Promise(resolve => {
        chrome.bookmarks.getSubTree(id, results => resolve(results ? results[0] : null))
      })
    }, id)
  },

  async getSubTreeShallow(id){
    return (await this.bg()).evaluate((id) => {
      return new Promise(resolve => {
        chrome.bookmarks.getSubTree(id, results => {
          const result = results ? results[0] : null
          if(result && result.children){
            for(let child of result.children){
              delete child.children
            }
          }
          resolve(result)
        })
      })
    }, id)
  },

  parseFavoritesTree(tree,num){
    tree.key = tree.id
    tree.is_file = !!tree.url
    if(tree.children){
      let i =0
      const children = []
      for(let item of tree.children){
        const _item = this.parseFavoritesTree(item,num)
        children.push(_item)
        if(++i == num) break
      }
      tree.children = children
      tree.children2 = children
    }
    return tree
  },

  async getFavoritesTree(keys, num, shallow){
    const key = keys[0] == 'root' ? '1' : keys[0]
    const tree = await (shallow ? this.getSubTreeShallow(key) : this.getSubTree(key))
    return this.parseFavoritesTree(tree,num)
  },

  async create(bookmarks, parentId){
    if(!Array.isArray(bookmarks)) bookmarks = [bookmarks]

    return (await this.bg()).evaluate((bookmarks, parentId) => {
      const promises = []
      for(let bookmark of bookmarks){
        if(parentId) bookmark.parentId = parentId
        else if(!bookmark.parentId || bookmark.parentId == 'root') bookmark.parentId = '1'

        promises.push(new Promise(resolve => {
          chrome.bookmarks.create(bookmark, resolve)
        }))
      }
      return Promise.all(promises)
    }, bookmarks, parentId)
  },

  async insert(id,writePath,data,dbKey){
    if(writePath == 'root') writePath = '1'

    if(data.url){
      data = {title: data.title, url: data.url}
    }
    else{
      data = {title: data.title}
    }

    return (await this.bg()).evaluate((id, writePath, dbKey, data) => {
      return new Promise(async resolve => {
        if(writePath == 'top-page'){
          writePath = await new Promise(resolve => chrome.bookmarks.search({title: 'top-page'}, results =>{
            if(!results.length){
              chrome.bookmarks.create({parentId: '1', title: 'top-page'}, result => resolve(result.id))
            }
            else{
              resolve(results[0].id)
            }
          }))
        }

        if(dbKey){
          const results = new Promise(resolve => chrome.bookmarks.get(dbKey, resolve))
          const result = results ? results[0] : null
          if(!result) return resolve(result)
          chrome.bookmarks.create(id, {parentId: writePath, index: result.index, ...data}, resolve)
        }
        else{
          chrome.bookmarks.create(id, {parentId: writePath, ...data}, resolve)
        }
      })
    }, id, writePath, dbKey, data)
  },

  async move(id, newDirectory, dropKey){
    if(newDirectory == 'root') newDirectory = '1'

    return (await this.bg()).evaluate((id, newDirectory, dropKey) => {
      return new Promise(async resolve => {
        if(dropKey){
          const results = new Promise(resolve => chrome.bookmarks.get(dropKey, resolve))
          const result = results ? results[0] : null
          if(!result) return resolve(result)
          chrome.bookmarks.move(id, {parentId: newDirectory, index: result.index}, resolve)
        }
        else{
          chrome.bookmarks.move(id, {parentId: newDirectory}, resolve)
        }
      })
    }, id, newDirectory, dropKey)
  },

  async update(id, changes){
    return (await this.bg()).evaluate((id, changes) => {
      return new Promise(resolve => {
        chrome.bookmarks.update(id, changes, resolve)
      })
    }, id, changes)
  },

  async remove(ids){
    return (await this.bg()).evaluate((ids) => {
      const promises = []
      for(let id of ids){
        promises.push(new Promise(resolve => {
          chrome.bookmarks.get(id, results => {
            const result = results ? results[0] : null
            if(result){
              if(result.url || !result.children.length){
                chrome.bookmarks.remove(id, resolve)
              }
              else{
                chrome.bookmarks.removeTree(id, resolve)
              }
            }
            else{
              resolve(result)
            }
          })
        }))
      }
      return Promise.all(promises)
    }, ids)
  },

  async removeAll(){
    const ids = (await this.bg()).evaluate(() => {
      return new Promise(resolve => {
        chrome.bookmarks.getSubTree("1", results => {
          const result = results ? results[0] : null
          resolve(result.children.map(x=>x.id))
        })
      })
    })
    return this.remove(ids)
  },

  async export(id){
    return (await this.bg()).evaluate((id) => {
      return new Promise(async resolve => {

        const func = (tree, arr)=>{
          const item = {key: tree.id, url: tree.url, title: tree.title, created_at: tree.dateAdded, updated_at: tree.dateGroupModified, is_file: !!tree.url}
          if(tree.children){
            item.children = []
            for(let x of tree.children){
              const _item = func(x, arr)
              item.children.push(_item)
            }
          }
          arr.push(item)
        }

        if(id == 'top-page'){
          id = await new Promise(resolve => chrome.bookmarks.search({title: 'top-page'}, results =>{
            if(!results.length){
              resolve(null)
            }
            else{
              resolve(results[0].id)
            }
          }))
        }
        if(!id) return resolve(null)

        chrome.bookmarks.getSubTree(id, results => {
          const result = results ? results[0] : null
          const arr = []
          func(result, arr)
          resolve(arr)
        })
      })
    },id)
  }
}