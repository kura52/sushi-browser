"use strict";

function configurable(targetFunction, config) {
  for (var item in config) {
    if (config.hasOwnProperty(item)) {
      (function(item) {
        targetFunction[item] = function(value) {
          if (!arguments.length) {
            return config[item];
          }
          config[item] = value;
          return targetFunction;
        };
      })(item); // for doesn't create a closure, forcing it
    }
  }
}

/**
 * Build `_parent` attribute on a tree and its children.
 * @param {tree}   tree   The root
 * @param {tree}   parent The parent to apply to the root (optionnal)
 */
function setParent(tree, parent) {
  var search = function(node, parent) {
    if (parent) {
      node._parent = parent;
    }

    if (node.children && node.children.length > 0) {
      for (var i in node.children) {
        if (node.children.hasOwnProperty(i)) {
          search(node.children[i], node);
        }
      }
    }
  };

  search(tree, parent);
}

/**
 * Will return a tree with method to manipulate it.
 * @param  {object} data The raw tree as litteral object
 * @return {object}      A tree
 */
function tree (data) {

  var config = {
    // The raw data can be updated by calling `data(object d)` on the tree`.
    data
  };

  setParent(data);

  var model = {
    /**
     * Will find a node in the tree.
     * @param  {string} path The path of the node based on the current tree
     * @return {undefined|tree}        The node
     */

    flatten(){
      var search = function (rootTree, depth, accum) {
        accum.push([rootTree,depth])
        if (rootTree.children) {
          for (var child in rootTree.children) {
            if (rootTree.children.hasOwnProperty(child) &&
              rootTree.children[child]) {
              search(rootTree.children[child],depth+1,accum);
            }
          }
        }
        return accum
      };
      return search(config.data,0,[]);
    },

    find(path) {
      var search = function (target, rootTree) {
        if(target.length > 0) {
          if (rootTree.children) {
            // we did not reach the wanted node
            for (var child in rootTree.children) {
              if (rootTree.children.hasOwnProperty(child) &&
                rootTree.children[child] &&
                target[0] === rootTree.children[child].name) {
                target.shift();
                // we found the children which is on the path of the wanted node, we restart a search in it
                return search(target,rootTree.children[child]);
              }
            }
          }
          // no node found
          return undefined;
        }
        // finally found the wanted node
        return tree(rootTree);
      };

      // build target array
      // if path is /path/of/node, target will contains ['path', 'of', 'node']
      var target = path.split('/');
      if (path === '/') {
        target = [];
      } else {
        target.shift();
      }

      return search(target, config.data);
    },


    findName(name) {
      var search = function (target, rootTree) {
          if (rootTree.children) {
            // we did not reach the wanted node
            for (var child in rootTree.children) {
              if (rootTree.children.hasOwnProperty(child) &&
                rootTree.children[child]) {
                // we found the children which is on the path of the wanted node, we restart a search in it
                if(target === rootTree.children[child].name) return tree(rootTree.children[child])
                else{
                  var val = search(name,rootTree.children[child])
                  if(val) return val
                }
              }
            }
          }
        // finally found the wanted node
        return
      };

      if(config.data.name == name) return tree(config.data)
      return search(name, config.data);
    },

    /**
     * Will append a node to the tree.
     * @param  {tree} childNode The node to append
     * @return {tree}           The child node
     */
    push(childNode) {
      if (!config.data.children) {
        config.data.children = [];
      }

      var childNodeData = childNode.data();
      setParent(childNodeData, config.data);
      config.data.children.push(childNodeData);

      return tree(childNodeData);
    },

    splice(index, howMany,...childNodes) {
      if (!config.data.children) {
        config.data.children = [];
      }

      const arr = []
      for(let childNode of childNodes){
        var childNodeData = childNode.data();
        setParent(childNodeData, config.data);
        arr.push(childNodeData)
      }
      config.data.children.splice(index, howMany, ...arr);
    },

    prune(){
      if (!config.data._parent) {
        return undefined;
      }

      var parent = config.data._parent
      var parentChildren = parent.children;
      var currentIndex = parentChildren.indexOf(model.data())

      for(let child of config.data.children){
        child._parent = parent
      }

      parentChildren.splice(currentIndex, 1);
      parentChildren.splice(currentIndex, 0, ...config.data.children);
      config.data._parent.children = parentChildren;

    },

    /**
     * Will remove the current tree from its parent.
     * @return {undefined|tree} The parent of the tree
     */
    remove() {
      if (!config.data._parent) {
        return undefined;
      }

      var parentChildren = config.data._parent.children;
      parentChildren.splice(parentChildren.indexOf(model.data()), 1);
      config.data._parent.children = parentChildren;

      return model.parent();
    },

    /**
     * Will move the current tree to an other node.
     * @param  {tree} destNode           The future parent of the tree
     * @return {undefined|tree}          The moved tree
     */
    moveTo(destNode,position=-1) {
      var parent = model.parent();

      if (!parent) {
        return undefined;
      }

      parent.find('/' + config.data.name).remove();
      if(position == -1){
        destNode.push(model)
      }
      else{
        destNode.splice(position,0,model)
      }

      return model;
    },

    /**
     * Will return the children of the tree.
     * @return {array} The children
     */
    children() {
      if (!config.data.children) {
        return [];
      }

      return config.data.children.map(function(child) {
        return tree(child);
      });
    },

    /**
     * Will return the parent of the tree.
     * @return {undefined|tree} The parent
     */
    parent() {
      if (!config.data._parent) {
        return undefined;
      }

      return tree(config.data._parent);
    },

    /**
     * Will return the path of the current node.
     * @return {string} The path
     */
    path() {
      var path = config.data._parent ? [config.data.name] : [];
      var search = function(node) {
        if (node._parent && node._parent._parent) {
          path.unshift(node._parent.name);
          search(node._parent);
        }
      };
      search(config.data);
      return '/' + path.join('/');
    },

    /**
     * Will return the name of the current node.
     * @return {string} The name
     */
    name() {
      return config.data.name;
    },

    /**
     * Will return or set an attribute on the current node.
     * @param  {string} key   The name of the attribute
     * @param  {mixed}  value The value of the attribute (optional)
     * @return {mixed|tree}   The value of the attribute or the current node
     */
    attr(key, value) {
      if (value === undefined) {
        return config.data[key];
      }

      config.data[key] = value;

      return model;
    },

    /**
     * Will clone the current node.
     * When a node is cloned, it is extract from the current tree scope
     * and become detached from its parent. That means calling `parent()`
     * will return undefined.
     * @return {tree} The cloned node
     */
    clone() {
      var clone = function(node) {
        return tree(JSON.parse(JSON.stringify(node, function (key, value) {
          if (key === '_parent') {
            return undefined;
          }
          return value;
        })));
      };

      var copy = clone(config.data);

      setParent(copy);

      return copy;
    },

    /**
     * Will return the tree factory
     * @return Function
     */
    factory() {
      return tree;
    },

    /**
     * Will return a visitor to execute a callback on each node
     * @return {Function} The visitor
     */
    visitor() {
      return function (cb) {
        var search = function (rootTree) {
          if (rootTree.children) {
            for (var child in rootTree.children) {
              if (rootTree.children.hasOwnProperty(child) &&
                search(rootTree.children[child]);
                rootTree.children[child]) {
              }
            }
          }

          cb(tree(rootTree));
        };

        search(config.data);
      };
    },

    /**
     * Will serialize the tree by using JSON.stringify with custom replacer
     * @return {string} The serialized tree
     */
    stringify() {
      return JSON.stringify(data, function replacer(key, value) {
        if (key === '_parent') {
          return undefined;
        }

        return value;
      });
    }
  };

  configurable(model, config);

  return model;
};

myTree = tree({
  children: [
    {
      name: 'dupuis',
      children: [
        {
          name: 'prunelle',
          children: [
            {
              name: 'lebrac',
              job: 'designer'
            },
            {
              name: 'lagaffe',
              firstname: 'gaston',
              job: 'sleeper'
            },
          ]
        }
      ]
    }
  ]
});