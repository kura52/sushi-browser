const LRUCache = function(capacity){
  this.capacity = capacity
  this.length = 0
  this.map = {}
  // save the head and tail so we can update it easily
  this.head = null
  this.tail = null
}

LRUCache.prototype.node = function(key,value){
  this.key = key
  this.val = value
  this.newer = null
  this.older = null
}

LRUCache.prototype.get = function(key){
  if(this.map.hasOwnProperty(key)){
    this.updateKey(key)
    return this.map[key].val
  }else{
    return
  }
}
LRUCache.prototype.updateKey = function(key){
  var node = this.map[key]
  // break the chain and reconnect with newer and older
  if(node.newer){
    node.newer.older= node.older
  }else{
    this.head = node.older
  }

  if(node.older){
    node.older.newer = node.newer
  }else{
    this.tail = node.newer
  }

  // replace the node into head - newest
  node.older = this.head
  node.newer = null
  if(this.head){
    this.head.newer = node
  }
  this.head = node

  // if no items in the bucket, set the tail to node too.
  if(!this.tail){
    this.tail = node
  }
}

LRUCache.prototype.set = function(key,value){
  var node = new this.node(key,value)
  // update the value for exist entries
  if(this.map.hasOwnProperty(key)){
    this.map[key].val = value
    this.updateKey(key)
    return
  }
  if(this.length >= this.capacity){
    // remove the least recently used item
    var dKey = this.tail.key
    this.tail = this.tail.newer
    if(this.tail){
      this.tail.older = null
    }
    delete this.map[dKey]
    this.length --
  }

  // insert node into the head
  node.older = this.head
  // if have head, we need re-connect node with other nodes older than head
  if(this.head){
    this.head.newer = node
  }
  this.head = node
  // if no tail which means first insert, set the tail to node too
  if(!this.tail){
    this.tail = node
  }
  this.map[key] = node
  this.length ++
}

module.exports = LRUCache