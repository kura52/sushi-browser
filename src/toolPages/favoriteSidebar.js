window.debug = require('debug')('info')
import process from './process'
const ipc = require('electron').ipcRenderer
const uuid = require('node-uuid')
const React = require('react')
const ReactDOM = require('react-dom')
const path = require('path')
const { StickyContainer, Sticky } = require('react-sticky')
const { Menu,Segment,Input } = require('semantic-ui-react')
import classNames from 'classnames'
import elementClass from 'element-class'
import escapeHTML from 'escape-html'
import Selection from '../render/react-selection/index'
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'

import InfiniteTree from '../render/react-infinite-tree';
import rowRenderer from '../render/react-infinite-tree/renderer';

let resourcePath
let setTime = localStorage.getItem('favicon-set')
ipc.send("favicon-get",setTime ? parseInt(setTime) : null)
ipc.once("favicon-get-reply",(e,ret)=>{
  localStorage.setItem('favicon-set',Date.now().toString())
  for(let [k,v] of Object.entries(ret)){
    localStorage.setItem(k,v)
  }
})

function faviconGet(x){
  return x.favicon == "resource/file.png" ? (void 0) : x.favicon && localStorage.getItem(x.favicon)
}

ipc.send("get-resource-path",{})
ipc.once("get-resource-path-reply",(e,data)=>{
  resourcePath = data
})

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


function showDialog(input){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('show-dialog-exploler',key,input)
    ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function getFavorites(dbKey){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('get-favorites',key,dbKey)
    ipc.once(`get-favorites-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function getAllFavorites(dbKey){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('get-all-favorites',key,dbKey)
    ipc.once(`get-all-favorites-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function insertFavorite(writePath,data){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('insert-favorite',key,writePath,data)
    ipc.once(`insert-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function renameFavorite(dbKey,newName){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('rename-favorite',key,dbKey,newName)
    ipc.once(`rename-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function openFavorite(dbKey,id){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('open-favorite',key,dbKey,id)
    ipc.once(`open-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function deleteFavorite(dbKey,newName){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('delete-favorite',key,dbKey,newName)
    ipc.once(`delete-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function moveFavorite(args){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('move-favorite',key,args)
    ipc.once(`move-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function treeBuild(datas,nodePath){
  const newChildren = []
  for(let x of datas){
    const id = `${nodePath}/${x.key}`
    const data = {
      id,
      name: x.title,
      url: x.url,
      favicon: faviconGet(x),
      // loadOnDemand: !x.is_file,
      type: x.is_file ? 'file' : 'directory'
    }
    if(x.children2){
      data.children = treeBuild(x.children2,id)
    }
    newChildren.push(data)
  }
  return newChildren
}

function searchOpenNodes(nodes,set,tree){
  for(let node of nodes){
    if(node.type == "directory" && set.has(node.id)){
      tree.openNode(node)
      set.delete(node.id)
      if(set.size == 0) break
      searchOpenNodes(node.children,set,tree)
    }
  }
}

async function getAllChildren(nodePath){
  const dbKey = path.basename(nodePath)
  const ret = await getAllFavorites([dbKey])
  // console.log(treeBuild(ret,nodePath))
  return treeBuild(ret,nodePath)[0].children
}


let selectedNodes = [];
let treeAllData
class App extends React.Component {
  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.stickey).style.height = "100%"
  }

  afterSelect(selectedTargets){
    if(selectedTargets.length == 0) return

    const tree = this.refs.content.refs.iTree.tree
    // const selectedNode = tree.getSelectedNode();
    // if (selectedNodes.length === 0 && selectedNode) {
    //   selectedNodes.push(selectedNode);
    //   tree.state.selectedNode = null;
    // }


    const targetNodes = selectedTargets.map(ele=>{
      const nodeId = ele.dataset.id
      return tree.getNodeById(nodeId)
    })

    for(let currentNode of targetNodes){
      const index = selectedNodes.indexOf(currentNode);

      // Remove current node if the array length of selected nodes is greater than 1
      if (index >= 0 && selectedNodes.length > 1) {
        currentNode.state.selected = false;
        selectedNodes.splice(index, 1);
        tree.updateNode(currentNode, {}, { shallowRendering: true },true);
      }

      // Add current node to the selected nodes
      if (index < 0) {
        currentNode.state.selected = true;
        selectedNodes.push(currentNode);
        tree.updateNode(currentNode, {}, { shallowRendering: true },true);
      }
    }

    tree.update()

  }

  clearSelect(){
    const tree = this.refs.content.refs.iTree.tree
    // Empty an array of selected nodes
    selectedNodes.forEach(selectedNode => {
      selectedNode.state.selected = false;
      tree.updateNode(selectedNode, {}, { shallowRendering: true },true)
    });
    selectedNodes = [];

    tree.update()

  }

  recurNewTreeData(datas,reg){
    const newDatas = []
    for(let ele of datas){
      if(ele.type == "file"){
        if(reg.test(`${ele.name}\t${ele.url}`)){
          newDatas.push(ele)
        }
      }
      else{
        const newChildren = this.recurNewTreeData(ele.children,reg)
        if(newChildren.length > 0){
          newDatas.push({
            id: ele.id,
            name: ele.name,
            url: ele.url,
            favicon: ele.favicon,
            type: ele.type,
            children: newChildren
          })
        }
      }
    }
    return newDatas
  }

  onChange(e,data) {
    e.preventDefault()
    if(!treeAllData) return
    const regList = [...new Set(escapeRegExp(data.value).split(/[ 　]+/,-1).filter(x=>x))]
    const reg = new RegExp(regList.length > 1 ? `(?=.*${regList.join(")(?=.*")})`: regList[0],"i")

    console.log(reg)

    const tree = this.refs.content.refs.iTree.tree
    const openNodes = new Set(tree.getOpenNodes().map(node=>node.id))


    tree.loadData(this.recurNewTreeData(treeAllData,reg),true)
    for(let nodeId of openNodes){
      const node = tree.getNodeById(nodeId)
      tree.openNode(node,void 0,true)
    }
    tree.update()

  }

  render(){
    return <StickyContainer ref="stickey">
      <Sticky>
        <div>
          <Menu pointing secondary >
            <Menu.Item key="favorite" icon="star" active={true}/>
            <Menu.Item as='a' href={`${baseURL}/history_sidebar.html`} key="history" icon="history"/>
            <Menu.Item as='a' href={`${baseURL}/tabs_sidebar.html`} key="tabs" icon="align justify"/>
            <Menu.Item as='a' href={`${baseURL}/explorer_sidebar.html`} key="file-explorer" icon="folder"/>
          </Menu>
          <Input ref='input' icon='search' placeholder='Search...' size="small" onChange={::this.onChange}/>
        </div>
      </Sticky>
      <Selection ref="select" target=".infinite-tree-item" selectedClass="selection-selected"
                 afterSelect={::this.afterSelect} clearSelect={::this.clearSelect}>
        <Contents ref="content"/>
      </Selection>
    </StickyContainer>
  }
}

class Contents extends React.Component {
  // tree = null;

  updatePreview(node) {
    console.log(node)
  }

  loadAllData(){
    const tree = this.refs.iTree.tree
    getAllChildren('root').then(data=>{
      console.log(data)
      treeAllData = data
      tree.loadData(data,true);

      const prevState  = localStorage.getItem("favorite-sidebar-open-node")
      if(prevState){
        const openNodes = new Set(prevState.split("\t",-1))
        for(let nodeId of openNodes){
          const node = tree.getNodeById(nodeId)
          tree.openNode(node,void 0,true)
        }
      }
      tree.update()
    })
  }

  componentDidMount() {
    this.loadAllData()
    ipc.on("update-datas",(e,data)=>{
      this.loadAllData()
    })

    document.addEventListener('mousedown',(event)=>{
      const tree = this.refs.iTree.tree
      const currentNode = tree.getNodeFromPoint(event.x, event.y);
      if (!currentNode) {
        return;
      }

      if(event.which == 3){
        const nodes = [currentNode,...new Set([selectedNodes,...selectedNodes])]
        ipc.send("favorite-menu",nodes.map(node=>(node.url || node.title)))
        this.menuKey = nodes
        return
      }
    })
    this.initEvents()
    this.initDragEvents()
  }

  initEvents() {
    this.event = (e, cmd) => {
      if(cmd == "open") {
        const nodes = this.menuKey
        const keys = nodes.map(node=> node.id)
        this.menuKey = (void 0)
        openFavorite(keys.map(k=>path.basename(k))).then(_=>_)
      }
      // else if(cmd == "delete") {
      //   const nodes = this.menuKey
      //   const keys = nodes.map(node=> node.id)
      //   this.menuKey = (void 0)
      //   const parentNodes = this.getNodesFromKeys(nodes.map(n => n.props.parent && n.props.parent.path))
      //   deleteFavorite(keys.map(k=>path.basename(k)),parentNodes.map(parent=>path.basename(parent.props.k))).then(ret => {
      //     Promise.all(this.reloadDatas([...new Set(parentNodes)])).then(_ => {
      //       this.setState({treeItems: this.renderFolder(this.state.items)})
      //     })
      //   })
      // }
      // else if(cmd == "rename"){
      //   const nodes = this.menuKey
      //   const keys = nodes.map(node=> node.id)
      //   this.menuKey = (void 0)
      //   showDialog({
      //     inputable: true, title: 'Rename',
      //     text: `Enter a new Name`,
      //     initValue: nodes[0].props.isLeaf ? [nodes[0].props.title,nodes[0].props.url] : [nodes[0].props.title],
      //     needInput: nodes[0].props.isLeaf ? ["Title","URL"] : ["Title"]
      //   }).then(value => {
      //     if (!value) return
      //     const parentNodes = this.getNodesFromKeys(nodes.map(n => n.props.parent && n.props.parent.path))
      //     let writePath = keys[0]
      //     const data = nodes[0].props.isLeaf ? {title:value[0], url:value[1]} : {title:value[0]}
      //     renameFavorite(path.basename(writePath),data).then(ret => {
      //       Promise.all(this.reloadDatas(parentNodes)).then(_ => {
      //         this.setState({treeItems: this.renderFolder(this.state.items)})
      //       })
      //     })
      //   })
      // }
      // else if(cmd == "create-page" || cmd == "create-dirctory") {
      //   const isPage = cmd == "create-page"
      //   const nodes = this.menuKey
      //   const keys = nodes.map(node=> node.id)
      //   this.menuKey = (void 0)
      //   showDialog({
      //     inputable: true, title: `New ${isPage ? 'Page' : 'Directory'}`,
      //     text: `Enter a new ${isPage ? 'page title and URL' : 'directory name'}`,
      //     needInput: isPage ? ["Title","URL"] : [""]
      //   }).then(value => {
      //     console.log(value)
      //     if (!value) return
      //     const parentNodes = this.getNodesFromKeys(nodes.map(n => n.props.parent && n.props.parent.path))
      //     let writePath = nodes[0].props.isLeaf ? parentNodes[0].props.k : keys[0]
      //     const data = isPage ? {title:value[0], url:value[1], is_file:true} : {title:value[0], is_file:false,children:[]}
      //     insertFavorite(path.basename(writePath),data).then(ret => {
      //       Promise.all(this.reloadDatas(nodes[0].props.isLeaf ? parentNodes : nodes)).then(_ => {
      //         this.setState({treeItems: this.renderFolder(this.state.items)})
      //       })
      //     })
      //   })
      // }
    }
    ipc.on('favorite-menu-reply', this.event)
  }

  initDragEvents(){

    const tree = this.refs.iTree.tree
    let ghostElement = null;
    let draggingX = 0;
    let draggingY = 0;

    document.addEventListener('dragstart', (e) => {
      draggingX = 0;
      draggingY = 0;
    });

    document.addEventListener('dragend', (e) => {
      if (ghostElement) {
        ghostElement.parentNode.removeChild(ghostElement);
        ghostElement = null;
      }
    });

    tree.contentElement.addEventListener('dragover', (e) => {
      e.preventDefault();

      const event = e

      const movementX = event.x - (Number(draggingX) || event.x);
      const movementY = event.y - (Number(draggingY) || event.y);

      draggingX = event.x;
      draggingY = event.y;

      if (movementY === 0) {
        return;
      }

      let el = document.elementFromPoint(event.x, event.y);
      while (el && el.parentElement !== tree.contentElement) {
        el = el.parentElement;
      }
      if (!el /*|| el === ghostElement*/) {
        return;
      }

      const id = el.getAttribute(tree.options.nodeIdAttr);
      if (id === undefined) {
        return;
      }

      const rect = el.getBoundingClientRect();
      const tolerance = 15;

      if (event.y <= rect.top + tolerance) {
        if (ghostElement) {
          ghostElement.parentNode.removeChild(ghostElement);
          ghostElement = null;
        }

        if (el.parentNode) {
          ghostElement = document.createElement('div');
          ghostElement.style.height = '0px';
          ghostElement.style.border = '1px dotted #ccc';
          ghostElement.style.backgroundColor = '#f5f6f7';
          el.parentNode.insertBefore(ghostElement, el);
        }
      }
      else if (rect.top + el.offsetHeight <= event.y) {
        if (el.nextSibling !== ghostElement) {
          if (ghostElement) {
            ghostElement.parentNode.removeChild(ghostElement);
            ghostElement = null;
          }

          if (el.parentNode) {
            ghostElement = document.createElement('div');
            ghostElement.style.height = '0px';
            ghostElement.style.border = '1px dotted #ccc';
            ghostElement.style.backgroundColor = '#f5f6f7';
            el.parentNode.insertBefore(ghostElement, el.nextSibling);
          }
        }
      }
      else if (ghostElement) {
        ghostElement.parentNode.removeChild(ghostElement);
        ghostElement = null;
      }
    });

  }

  render() {
    const self = this
    return (
      <div style={{paddingLeft:4,paddingTop:4,width:'calc(100vw - 4px)'}}>
        <InfiniteTree
          ref="iTree"
          noDataText=""
          loadNodes={(parentNode, done) => {
            console.log(11,parentNode.id)
            getAllChildren(parentNode.id).then(children => done(null, children))
          }}
          rowRenderer={rowRenderer(18)}
          selectable={true} // Defaults to true
          droppable={{
            hoverClass: 'infinite-tree-drop-hover',
            accept: (opts) => {
              const { type, draggableTarget, droppableTarget, node } = opts;

              if (elementClass(event.target).has('infinite-tree-overlay')) {
                console.log(33333333333)
                elementClass(event.target).add('hover'); // add hover class
              } else {
                const el = self.refs.iTree.tree.contentElement.querySelector('.infinite-tree-overlay');
                elementClass(el).remove('hover'); // remove hover class
              }

              return true;
            },
            drop: (e, opts) => {
              const { draggableTarget, droppableTarget, node } = opts;

              if (elementClass(event.target).has('infinite-tree-overlay')) {
                elementClass(event.target).remove('hover'); // remove hover class
                const innerHTML = 'Dropped to an overlay element';
                document.querySelector('#classic [data-id="dropped-result"]').innerHTML = innerHTML;
                return;
              }

              //console.log('drop:', event, event.dataTransfer.getData('text'));
              // const innerHTML = 'Dropped to <b>' + escapeHTML(node.name) + '</b>';
              // document.querySelector('#classic [data-id="dropped-result"]').innerHTML = innerHTML;
            }
          }}
          shouldSelectNode={(node) => { // Defaults to null
            if (!node || (node === this.refs.iTree.tree.getSelectedNode())) {
              return false; // Prevent from deselecting the current node
            }
            return true;
          }}
          onClick={(event) => {
            const tree = this.refs.iTree.tree
            const currentNode = tree.getNodeFromPoint(event.x, event.y);
            if (!currentNode) {
              return;
            }


            const multipleSelectionMode = event.ctrlKey || event.metaKey;

            if (!multipleSelectionMode) {
              if (selectedNodes.length > 0) {
                // Call event.stopPropagation() to stop event bubbling
                event.stopPropagation();

                // Empty an array of selected nodes
                selectedNodes.forEach(selectedNode => {
                  selectedNode.state.selected = false;
                  tree.updateNode(selectedNode, {}, { shallowRendering: true });
                });
                selectedNodes = [];

                // Select current node
                tree.state.selectedNode = currentNode;
                currentNode.state.selected = true;
                tree.updateNode(currentNode, {}, { shallowRendering: true });

              }
              if(currentNode.type == 'file'){
                ipc.sendToHost("open-tab-opposite",currentNode.url,true)
              }
              else{
                tree.toggleNode(currentNode);
              }
              return;
            }

            // Call event.stopPropagation() to stop event bubbling
            event.stopPropagation();

            const selectedNode = tree.getSelectedNode();
            if (selectedNodes.length === 0 && selectedNode) {
              selectedNodes.push(selectedNode);
              tree.state.selectedNode = null;
            }

            const index = selectedNodes.indexOf(currentNode);

            // Remove current node if the array length of selected nodes is greater than 1
            if (index >= 0 && selectedNodes.length > 1) {
              currentNode.state.selected = false;
              selectedNodes.splice(index, 1);
              tree.updateNode(currentNode, {}, { shallowRendering: true });
            }

            // Add current node to the selected nodes
            if (index < 0) {
              currentNode.state.selected = true;
              selectedNodes.push(currentNode);
              tree.updateNode(currentNode, {}, { shallowRendering: true });
            }
          }}
          onDoubleClick={(event) => {
            const target = event.target || event.srcElement; // IE8
            console.log('onDoubleClick', target);
          }}
          onKeyDown={(event) => {
            const tree = this.refs.iTree.tree
            const target = event.target || event.srcElement; // IE8
            console.log('onKeyDown', target);
            event.preventDefault();

            const node = tree.getSelectedNode();
            const nodeIndex = tree.getSelectedIndex();

            if (event.keyCode === 37) { // Left
              tree.closeNode(node);
            } else if (event.keyCode === 38) { // Up
              const prevNode = tree.nodes[nodeIndex - 1] || node;
              tree.selectNode(prevNode);
            } else if (event.keyCode === 39) { // Right
              tree.openNode(node);
            } else if (event.keyCode === 40) { // Down
              const nextNode = tree.nodes[nodeIndex + 1] || node;
              tree.selectNode(nextNode);
            }
          }}
          // onContentWillUpdate={() => {
          //   console.log('onContentWillUpdate');
          // }}
          // onContentDidUpdate={() => {
          //   this.updatePreview(this.refs.iTree.tree.getSelectedNode());
          // }}
          onOpenNode={(node) => {
            localStorage.setItem("favorite-sidebar-open-node",this.refs.iTree.tree.getOpenNodes().map(node=>node.id).join("\t"))
          }}
          onCloseNode={(node) => {
            localStorage.setItem("favorite-sidebar-open-node",this.refs.iTree.tree.getOpenNodes().map(node=>node.id).join("\t"))
          }}
          // onClusterDidChange={() => {
          //   const tree = this.refs.iTree.tree
          //   // No overlay on filtered mode
          //   if (tree.filtered) {
          //     return;
          //   }
          //
          //   const overlayElement = document.createElement('div');
          //   const top = tree.nodes.indexOf(tree.getNodeById('<root>.1'));
          //   const bottom = tree.nodes.indexOf(tree.getNodeById('<root>.2'));
          //   const el = tree.contentElement.querySelector('.infinite-tree-item');
          //   if (!el) {
          //     return;
          //   }
          //   const height = parseFloat(getComputedStyle(el).height);
          //
          //   overlayElement.className = classNames(
          //     'infinite-tree-overlay'
          //   );
          //   overlayElement.style.top = top * height + 'px';
          //   overlayElement.style.height = (bottom - top) * height + 'px';
          //   overlayElement.style.lineHeight = (bottom - top) * height + 'px';
          //   overlayElement.appendChild(document.createTextNode('OVERLAY'));
          //   tree.contentElement.appendChild(overlayElement);
          // }}
          // onSelectNode={(node) => {
          //   this.updatePreview(node);
          // }}
        />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.querySelector('#classic')
);
