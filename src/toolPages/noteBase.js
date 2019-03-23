import process from './process'
import {ipcRenderer as ipc} from './ipcRenderer'
import localForage from "../LocalForage";
import uuid from 'node-uuid';
import React from 'react';
import ReactDOM from 'react-dom';
import path from 'path';
import {StickyContainer, Sticky} from 'react-sticky';
import {Menu, Segment, Input, Button} from 'semantic-ui-react';
import Selection from '../render/react-selection/index'
import ToolbarResizer from '../render/ToolbarResizer'
import VerticalTabResizer from '../render/VerticalTabResizer'
import removeMarkdown from './removeMarkdown'
import $ from 'jquery';
const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'
import l10n from '../../brave/js/l10n';
const initPromise = l10n.init()

const Editor = require('./tui-editor/dist/tui-editor-Editor-all.min');

Editor.i18n.setLanguage(['ja', 'ja_JP'], {
  'Markdown': 'Markdown',
  'WYSIWYG': 'WYSIWYG',
  'Write': '編集',
  'Preview': 'プレビュー',
  'Headings': '見出し',
  'Paragraph': '本文',
  'Bold': '太字',
  'Italic': '斜体',
  'Strike': '取り消し線',
  'Code': 'インラインコード',
  'Line': 'ライン',
  'Blockquote': '引用',
  'Unordered list': '番号なしリスト',
  'Ordered list': '順序付きリスト',
  'Task': 'タスク',
  'Indent': 'インデントを減らす',
  'Outdent': 'インデントを増やす',
  'Insert link': 'リンク挿入',
  'Insert CodeBlock': 'コードブロック挿入',
  'Insert table': 'テーブル挿入',
  'Insert image': '画像挿入',
  'Heading': '見出し',
  'Image URL': '画像URL',
  'Select image file': '画像ファイル選択',
  'Description': '概要 ',
  'OK': 'OK',
  'More': '他のボタン',
  'Cancel': 'Cancel',
  'File': 'ファイル',
  'URL': 'URL',
  'Link text': 'リンクテキスト',
  'Add row': '行追加',
  'Add col': '列追加',
  'Remove row': '行削除',
  'Remove col': '列削除',
  'Align left': '左揃え',
  'Align center': '中央揃え',
  'Align right': '右揃え',
  'Remove table': 'テーブル削除',
  'Would you like to paste as table?': '表を貼り付けますか?',
  'Text color': '文字色変更',
  'Auto scroll enabled': '自動スクロール有効',
  'Auto scroll disabled': '自動スクロール無効',
  'Cannot paste values ​​other than a table in the cell selection state': '表以外の値をセル選択状態に貼り付けることはできません。',
  'Choose language': '言語選択'
})

import InfiniteTree from '../render/react-infinite-tree';
import rowRenderer from '../render/react-infinite-tree/rendererNote';

const isMain = location.href.startsWith("file://")

// if(!isMain){
//   localForage.getItem('favicon-set').then(setTime=>{
//     ipc.send("favicon-get",setTime ? parseInt(setTime) : null)
//     ipc.once("favicon-get-reply",(e,ret)=>{
//       localForage.setItem('favicon-set',Date.now().toString())
//       for(let [k,v] of Object.entries(ret)){
//         localForage.setItem(k,v)
//       }
//     })
//   })
// }

let openType
const key = uuid.v4()
ipc.send("get-main-state",key,[isMain ? 'toolbarLink' : 'sidebarLink'])
ipc.once(`get-main-state-reply_${key}`,(e,data)=> {
  openType = data[isMain ? 'toolbarLink' : 'sidebarLink']
})

// async function faviconGet(x){
//   return x.favicon == "resource/file.svg" ? (void 0) : x.favicon && (await localForage.getItem(x.favicon))
// }

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


function showDialog(input,id){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('show-dialog-exploler',key,input,id)
    ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

// function getFavorites(dbKey){
//   return new Promise((resolve,reject)=>{
//     const key = uuid.v4()
//     ipc.send('get-favorites',key,dbKey)
//     ipc.once(`get-favorites-reply_${key}`,(event,ret)=>{
//       resolve(ret)
//     })
//   })
// }

function getAllFavorites(dbKey,num){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('get-all-favorites',key,dbKey,num ? num() : void 0,true)
    ipc.once(`get-all-favorites-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function insertFavorite(writePath,data){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('insert-favorite',key,writePath,data,true)
    ipc.once(`insert-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function insertFavorite2(writePath,dbKey,data){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('insert-favorite2',key,writePath,dbKey,data,true)
    ipc.once(`insert-favorite2-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function renameFavorite(dbKey,newName){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('rename-favorite',key,dbKey,newName,true)
    ipc.once(`rename-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function openFavorite(dbKey,id,type){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('open-favorite',key,dbKey,id,type,true)
    ipc.once(`open-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function deleteFavorite(dbKey,newName){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('delete-favorite',key,dbKey,newName,true)
    ipc.once(`delete-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function moveFavorite(args){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('move-favorite',key,args,true)
    ipc.once(`move-favorite-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

async function treeBuild(datas,nodePath){
  const newChildren = []
  for(let x of datas){
    const id = `${nodePath}/${x.key}`
    const data = {
      id,
      name: x.is_file ? removeMarkdown(x.title).slice(0,15) : x.title,
      title: x.title,
      url: x.url,
      // loadOnDemand: !x.is_file,
      type: x.is_file ? 'file' : 'directory'
    }
    if(x.children2){
      data.children = await treeBuild(x.children2,id)
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

async function getAllChildren(nodePath,num){
  const dbKey = path.basename(nodePath)
  const ret = await getAllFavorites([dbKey],num)
  // console.log(treeBuild(ret,nodePath))
  return (await treeBuild(ret,''))[0].children
}


let selectedNodes = [];
let treeAllData,timeoutId
export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.handleBlur = ::this.handleBlur
    this.handleLoad = ::this.handleLoad
    this.handleChange = ::this.handleChange
    this.handleClickFile = ::this.handleClickFile
    this.setHeight = ::this.setHeight
    this.setWidth = ::this.setWidth
    this.state = {height: 300, width:235, hidden: !!this.props.id}
  }

  handleLoad(e){
    localForage.getItem("note-sidebar-select-node").then(async nodeIds=>{
      const iTree = this.refs.content.refs.iTree
      let root = iTree.tree.getRootNode()
      if(!root.children.length){
        for(let i=0;i<100;i++){
          await new Promise(r=>{
            setTimeout(_=>{
              root = iTree.tree.getRootNode()
              r()
            },100)
          })
          if(root.children.length) break
        }
      }
      if(this.props.content){
        const node = root.getLastChild()
        insertFavorite2(this.refs.content.getKey(node.getParent()),this.refs.content.getKey(node),{title:this.props.content,is_file:true}).then(async key=>{
          this.refs.content.eventUpdateDatas()
          let currentNode
          for(let i=0;i<100;i++){
            await new Promise(r=>{
              setTimeout(_=>{
                currentNode = iTree.tree.getNodeById(`/root/${key}`)
                r()
              },100)
            })
            if(currentNode) break
          }
          this.firstContent = true
          iTree.props.onClick({currentNode, stopPropagation:()=>{}})
        })
        return
      }
      if(this.props.id){
        const currentNode = iTree.tree.getNodeById(this.props.id)
        iTree.props.onClick({currentNode, stopPropagation:()=>{}})
        return
      }

      if(!nodeIds){
        const currentNode = iTree.tree.getNodeById('/root/f1bf9993-3bc4-4874-ac7d-7656054c1850')
        if(currentNode) iTree.props.onClick({currentNode, stopPropagation:()=>{}})
      }
      let i=0
      for(let id of nodeIds){
        const currentNode = iTree.tree.getNodeById(id)
        if(currentNode)  iTree.props.onClick({ctrlKey:i++ == 0, currentNode, stopPropagation:()=>{}})
      }
    })
  }

  handleChange(e){
    clearTimeout(timeoutId)
    timeoutId = setTimeout(_=>this.handleBlur(e),1500)
  }

  handleBlur(e){
    if(this.currentNode){
      renameFavorite(this.refs.content.getKey(this.currentNode),{title: this.state.editor.getMarkdown()})
      this.setState({})
    }
  }

  async handleClickFile(nextNode){
    this.setHidden(false)
    this.currentNode = nextNode
    if(this.firstContent){
      this.firstContent = false
      this.state.editor.setHtml(nextNode.title,false)
    }
    else{
      this.state.editor.setValue(nextNode.title,false)
    }
  }

  setHeight(height){
    if(height <= 0) height = 1
    localForage.setItem("note-sidebar-height",height)
    document.querySelector('#editSection').style.height = `${height}px`
    this.state.editor.wwEditor.setHeight(height - 55)
    this.state.editor.mdEditor.setHeight(height - 55)
    document.querySelector("#classic .infinite-tree-scroll").style.height = `calc(100vh - ${height+126}px)`
    this.setState({height})
  }

  setWidth(width){
    if(width <= 0) width = 1
    localForage.setItem("note-width",width)
    this.setState({width})
  }

  setHidden(val){
    if(val){
      document.querySelector('#editSection').style.backgroundColor = '#f2f2f2f2'
      document.querySelector('.tui-editor-defaultUI').style.visibility = 'hidden'
    }
    else{
      document.querySelector('#editSection').style.backgroundColor = null
      document.querySelector('.tui-editor-defaultUI').style.visibility = null
    }
  }

  setMarkdownButton(){
    const editor = this.state.editor
    if(this.mode == 'markdown'){
      if(this.notFirst){
        editor.getUI().getToolbar().$el.find('.tui-toolbar-divider').eq(0).remove()
      }
      editor.getUI().getToolbar().addButton( {
        name: 'preview',
        className: 'fab fa-accessible-icon',
        event: 'PreviewStyleChangeEvent',
        tooltip: 'Change Markdown Preview Style',
        $el: $('<div class="our-button-class" style="font-weight: bold">P</div>')
      }, 1)
      editor.getUI().getToolbar().addButton( {
        name: 'lineWrapping',
        className: 'fab fa-accessible-icon',
        event: 'lineWrappingEvent',
        tooltip: 'Switch Line Wrapping',
        $el: $('<div class="our-button-class" style="font-weight: bold">L</div>')
      }, 1)
      editor.getUI().getToolbar().$el.find('.tui-toolbar-icons').eq(0).before($('<div class="tui-toolbar-divider"></div>'))
    }
    else if(this.notFirst){
      editor.getUI().getToolbar().removeItem(1)
      editor.getUI().getToolbar().removeItem(1)
    }
    else{
      editor.getUI().getToolbar().$el.find('.tui-toolbar-icons').eq(0).before($('<div class="tui-toolbar-divider"></div>'))
    }
    this.notFirst = true
  }

  async componentDidMount() {
    await initPromise
    ReactDOM.findDOMNode(this.refs.stickey).style.height = "100%"
    const isAuto = this.props.favoritePage

    let height,width

    if(!isAuto){
      height = await localForage.getItem("note-sidebar-height")
      height = height ? parseInt(height) : 300
      document.querySelector("#classic .infinite-tree-scroll").style.height = `calc(100vh - ${height+126}px)`
    }
    else{
      width = await localForage.getItem("note-width")
      document.querySelector("#classic .infinite-tree-scroll").style.height = `calc(100vh - 68px)`
      if(width) this.setState({width: parseInt(width)})
    }


    this.mode = await localForage.getItem("note-sidebar-mode") || 'wysiwyg'
    this.previewMode = await localForage.getItem("note-sidebar-preview") || 'vertical'
    this.notlineWrapping = await localForage.getItem("note-sidebar-line")

    this.refs.content.refs.iTree.tree.getRootNode().getLastChild()

    this.setState({editor: new Editor({
        el: document.querySelector('#editSection'),
        initialEditType: this.mode,
        previewStyle: this.previewMode,
        height: isAuto ? 'calc(100vh - 68px)' : `${height}px`,
        minHeight: '0px',
        language: navigator.languages[0].slice(0,2),
        exts: ['chart', 'scrollSync', 'table', 'uml', 'colorSyntax'],
        useDefaultHTMLSanitizer: false,
        events: {
          load: this.handleLoad,
          change: this.handleChange,
          blur: this.handleBlur
        }
      }),height
    })

    const editor = this.state.editor

    ;["js/codemirror/dialog.js",
    "js/codemirror/searchcursor.js",
    "js/codemirror/search.js",
    "js/codemirror/jump-to-line.js"].forEach(x=>{
      const css = document.createElement('script')
      css.setAttribute('src',x)
      const head = document.getElementsByTagName('head')
      if(head[0]) head[0].appendChild(css)
    })


    if(!this.props.sidebar){
      editor.eventManager.addEventType('HideEvent');
      editor.eventManager.listen('HideEvent', () => this.setState({hidden: !this.state.hidden}))
    }
    editor.eventManager.addEventType('PreviewStyleChangeEvent');
    editor.eventManager.listen('PreviewStyleChangeEvent', () =>{
      this.previewMode = editor.mdPreviewStyle == 'tab' ? 'vertical' : 'tab'
      localForage.setItem("note-sidebar-preview",this.previewMode)
      editor.changePreviewStyle(this.previewMode)
    })

    editor.eventManager.addEventType('lineWrappingEvent');
    editor.eventManager.listen('lineWrappingEvent', () =>{
      this.notlineWrapping = !this.notlineWrapping
      localForage.setItem("note-sidebar-line",this.notlineWrapping)
      editor.mdEditor.cm.setOption('lineWrapping',!this.notlineWrapping)
    })

    editor.getUI().getToolbar().addButton({
      name: 'Hide',
      className: 'fab fa-accessible-icon',
      event: 'HideEvent',
      tooltip: 'Hide SideBar',
      $el: $('<div class="our-button-class"><i class="angle double left icon"></i></div>')
    }, 1)

    this.setMarkdownButton()

    editor.on('changeMode', e=>{
      if(this.state.editor && this.mode != e){
        this.mode = e
        localForage.setItem("note-sidebar-mode",this.mode)
        this.setMarkdownButton()
      }
    })

    if(this.notlineWrapping){
      editor.mdEditor.cm.setOption('lineWrapping',!this.notlineWrapping)
    }

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
    // const tree = this.refs.content.refs.iTree.tree
    // // Empty an array of selected nodes
    // selectedNodes.forEach(selectedNode => {
    //   selectedNode.state.selected = false;
    //   tree.updateNode(selectedNode, {}, { shallowRendering: true },true)
    // });
    // selectedNodes = [];
    //
    // tree.update()

  }

  recurNewTreeData(datas,reg){
    const newDatas = []
    for(let ele of datas){
      if(ele.type == "file"){
        if(reg.test(`${ele.title}\t${ele.url}`)){
          newDatas.push(ele)
        }
      }
      else{
        const newChildren = this.recurNewTreeData(ele.children,reg)
        if(newChildren.length > 0){
          newDatas.push({
            id: ele.id,
            name: ele.name,
            title: ele.title,
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

  async onChange(e,data) {
    const prevState = await localForage.getItem("note-sidebar-open-node")
    e.preventDefault()
    if(!treeAllData) return
    const regList = [...new Set(escapeRegExp(data.value).split(/[ 　]+/,-1).filter(x=>x))]
    const reg = new RegExp(regList.length > 1 ? `(?=.*${regList.join(")(?=.*")})`: regList[0],"i")

    console.log(reg)

    const tree = this.refs.content.refs.iTree.tree


    const openNodes = prevState ? prevState.split("\t",-1) : (void 0)
    tree.loadData(this.recurNewTreeData(treeAllData,reg),false,openNodes)

    let selected
    for(let node of selectedNodes){
      const node2 = tree.getNodeById(node.id)
      if(node2){
        node2.state.selected = true;
        tree.updateNode(node2, {}, { shallowRendering: true });
        if(node.type == 'file') selected = true
      }
      this.setHidden(!selected)
    }

    localForage.setItem("note-sidebar-open-node",prevState)

  }

  render(){
    return <StickyContainer ref="stickey">
      {this.props.sidebar ?
        <Sticky>
          <div>
            <Menu pointing secondary >
              <Menu.Item as='a' href={`${baseURL}/favorite_sidebar.html`} key="favorite" icon="star"/>
              <Menu.Item as='a' href={`${baseURL}/history_sidebar.html`} key="history" icon="history"/>
              <Menu.Item as='a' href={`${baseURL}/download_sidebar.html`} key="download" icon="download"/>
              <Menu.Item as='a' key="note" icon="sticky note" active={true}/>
              <Menu.Item as='a' href={`${baseURL}/saved_state_sidebar.html`} key="database" icon="database"/>
              <Menu.Item as='a' href={`${baseURL}/tab_trash_sidebar.html`} key="trash" icon="trash"/>
              <Menu.Item as='a' href={`${baseURL}/tab_history_sidebar.html`} key="tags" icon="tags"/>
              <Menu.Item as='a' href={`${baseURL}/explorer_sidebar.html`} key="file-explorer" icon="folder"/>
            </Menu>
            <Input ref='input' icon='search' placeholder='Search...' size="small" onChange={::this.onChange}/>
            <div style={{padding: '4px 0px 2px 12px'}}>
              <Button.Group basic>
                <Button icon='file' onClick={_=>{
                  this.refs.content.menuKey = selectedNodes.length ? selectedNodes : [this.refs.content.refs.iTree.tree.getRootNode().getLastChild()]
                  ipc.emit('favorite-menu-reply',null,'addBookmark',true)
                }}/>
                <Button icon='folder' onClick={_=>{
                  this.refs.content.menuKey = selectedNodes.length ? selectedNodes : [this.refs.content.refs.iTree.tree.getRootNode().getLastChild()]
                  ipc.emit('favorite-menu-reply',null,'addFolder',true)
                }}/>
                <Button icon='minus' onClick={_=>{
                  if(selectedNodes.length){
                    this.refs.content.menuKey = selectedNodes
                    ipc.emit('favorite-menu-reply',null,'delete')
                  }
                }}/>
                <Button icon='save' onClick={_=>{
                  if(selectedNodes.length && selectedNodes[0].type == 'file'){
                    let content = this.state.editor.getMarkdown()
                    if(navigator.userAgent.includes('Windows')) content = content.replace(/\r?\n/g, "\r\n")
                    ipc.send('save-file',{content, fname: 'note.txt', isDesktop: true})
                  }
                }}/>
                <Button icon='save' onClick={_=>{
                  if(selectedNodes.length && selectedNodes[0].type == 'file'){
                    let content = removeMarkdown(this.state.editor.getMarkdown())
                    if(navigator.userAgent.includes('Windows')) content = content.replace(/\r?\n/g, "\r\n")
                    ipc.send('save-file',{content, fname: 'note.txt', isDesktop: true})
                  }
                }}/>
                <div className='save-text'>Text</div>


              </Button.Group>
            </div>
          </div>
        </Sticky> :
        this.props.favoritePage ?
          <div>
            <Menu pointing secondary className="no-sidebar">
              <Menu.Menu >
                <Menu.Item style={{ paddingBottom: 5, paddingRight: 0}}>
                  <Button.Group basic size="small">
                    <Button icon='angle double left' onClick={_=>{
                      this.setState({hidden: !this.state.hidden})
                    }} />
                    <Button icon='file' onClick={_=>{
                      this.refs.content.menuKey = selectedNodes.length ? selectedNodes : [this.refs.content.refs.iTree.tree.getRootNode().getLastChild()]
                      ipc.emit('favorite-menu-reply',null,'addBookmark',true)
                    }} content="New"/>
                    <Button icon='folder' onClick={_=>{
                      this.refs.content.menuKey = selectedNodes.length ? selectedNodes : [this.refs.content.refs.iTree.tree.getRootNode().getLastChild()]
                      ipc.emit('favorite-menu-reply',null,'addFolder',true)
                    }} content="New Folder"/>
                    <Button icon='minus' onClick={_=>{
                      if(selectedNodes.length){
                        this.refs.content.menuKey = selectedNodes
                        ipc.emit('favorite-menu-reply',null,'delete')
                      }
                    }} content="Delete"/>
                    <Button icon='save' onClick={_=>{
                      if(selectedNodes.length && selectedNodes[0].type == 'file'){
                        let content = this.state.editor.getMarkdown()
                        if(navigator.userAgent.includes('Windows')) content = content.replace(/\r?\n/g, "\r\n")
                        ipc.send('save-file',{content, fname: 'note.txt', isDesktop: true})
                      }
                    }} content="Save"/>
                    <Button icon='save' onClick={_=>{
                      if(selectedNodes.length && selectedNodes[0].type == 'file'){
                        let content = removeMarkdown(this.state.editor.getMarkdown())
                        if(navigator.userAgent.includes('Windows')) content = content.replace(/\r?\n/g, "\r\n")
                        ipc.send('save-file',{content, fname: 'note.txt', isDesktop: true})
                      }
                    }} content="Save As Text"/>
                  </Button.Group>
                </Menu.Item>
                <Menu.Item>
                  <Input ref='input' icon='search' placeholder='Search...' onChange={::this.onChange}/>
                </Menu.Item>
              </Menu.Menu>
              <Menu.Item as='a' href='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html' id='top-link' key="top" name="Top" style={{
                borderLeft: "2px solid rgba(34,36,38,.15)"
              }}/>
              <Menu.Item as='a' href='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/favorite.html' id='bookmark-link' key="favorite" name={l10n.translation('bookmarks')}/>
              <Menu.Item as='a' href='chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/history.html' id='history-link' key="history" name={l10n.translation('history')}/>
              <Menu.Item as='a' href={`${baseURL}/download.html`} key="download" name={l10n.translation('downloads')}/>
              <Menu.Item key="note" name={l10n.translation('note')} active={true}/>
              <Menu.Item as='a' href={`${baseURL}/settings.html`} key="settings" name={l10n.translation('settings')}/>
              <Menu.Item as='a' href={`${baseURL}/explorer.html`} key="file-explorer" name={l10n.translation('fileExplorer')}/>
              <Menu.Item as='a' href={`${baseURL}/terminal.html`} key="terminal" name={l10n.translation('terminal')}/>
              <Menu.Item as='a' href={`${baseURL}/automation.html`} key="automation" name={l10n.translation('automation')}/>
              <Menu.Item as='a' href={`${baseURL}/converter.html`} key="converter" name={l10n.translation('videoConverter')}/>
            </Menu>
            <div style={{padding: '4px 0px 2px 0px', float: 'left'}}>

            </div>
          </div>
          : <Input ref='input' icon='search' placeholder='Search...' size="small" onChange={::this.onChange}/>}
      {this.props.cont ?  <Contents ref="content" editor={this.state.editor} parent={this}
                                    onClick={this.props.onClick}
                                    cont={(typeof this.props.cont) == 'function' ? this.props.cont() : this.props.cont} /> : null}
      <div className={this.props.favoritePage ? 'main' : 'main-sidebar'}>
        <Selection ref="select" target=".infinite-tree-item" selectedClass="selection-selected" style={this.props.favoritePage && this.state.hidden ? {display: 'none'} :
          this.props.favoritePage && this.state.width ? {width: this.state.width} : void 0}
                   afterSelect={::this.afterSelect} clearSelect={::this.clearSelect}>
          <Contents ref="content" editor={this.state.editor} parent={this} favoritePage={this.props.favoritePage}/>
        </Selection>
        {this.props.favoritePage ? <VerticalTabResizer width={this.state.width} setWidth={this.setWidth} direction='left' /> :
          <ToolbarResizer height={this.state.height} setHeight={this.setHeight} minus={true}/>}

        <div id="editSection" ref="editor"/>
      </div>
    </StickyContainer>
  }
}

class Contents extends React.Component {
  // tree = null;

  updatePreview(node) {
    console.log(node)
  }

  async loadAllData(){
    const prevState = this.prevState || (await localForage.getItem("note-sidebar-open-node"))
    this.prevState = (void 0)
    getAllChildren('root').then(data=>{
      console.log(data)
      treeAllData = data

      localForage.setItem("note-sidebar-open-node",prevState)
      const openNodes = prevState ? prevState.split("\t",-1) : (void 0)
      const tree = this.refs.iTree.tree
      if(tree){
        const node = tree.loadData(data,false,openNodes,true)
        if(node){
          selectedNodes.splice(0,selectedNodes.length,node)
        }
        else{
          let selected
          for(let node of selectedNodes){
            const node2 = tree.getNodeById(node.id)
            if(node2){
              node2.state.selected = true;
              tree.updateNode(node2, {}, { shallowRendering: true });
              if(node.type == 'file') selected = true
            }
            this.props.parent.setHidden(!selected)
          }
        }
      }
      else{
        setTimeout(_=>tree.loadData(data,false,openNodes),100)
      }
    })
  }

  componentDidMount() {
    if(isMain && !this.props.onClick) return
    this.loadAllData()
    this.eventUpdateDatas = (e,data)=>{
      console.log('eventUpdateDatas')
      this.loadAllData()
    }
    ipc.on("update-datas",this.eventUpdateDatas)

    const tree = this.refs.iTree.tree
    this.onMouseDown = (event)=>{
      if(!this.refs.iTree) return
      const currentNode = tree.getNodeFromPoint(event.x, event.y);
      if (!currentNode) {
        return;
      }

      if(event.which == 3){
        const nodes = [...new Set([currentNode,...selectedNodes])]
        ipc.send("favorite-menu",nodes.map(node=>(node.url || node.title)),true,nodes[0].type == 'file')
        this.menuKey = nodes
        return
      }
      if(event.target.closest('.hover-external')){
        ipc.send('send-to-host', "open-tab-opposite", `chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/note.html?id=${currentNode.id}`
          ,true,event.button == 1 ? 'create-web-contents' : openType ? 'new-tab' : 'load-url')
        return
      }

    }
    tree.contentElement.addEventListener('mousedown',this.onMouseDown)
    this.initEvents()
    this.initDragEvents()
  }

  componentWillUnmount() {
    const tree = this.refs.iTree.tree
    tree.contentElement.removeEventListener('mousedown',this.onMouseDown)
    document.removeEventListener('dragstart', this.onDragStart);
    document.removeEventListener('dragend',this.onDragEnd,false);
    tree.contentElement.removeEventListener('dragover',this.onDragOver);
    if(this.event) ipc.removeListener("favorite-menu-reply",this.event)
    if(this.eventUpdateDatas) ipc.removeListener("update-datas",this.eventUpdateDatas)
  }

  initEvents() {
    this.event = (e, cmd, forceFile) => {
      if(cmd == "openInNewTab" || cmd == "openInNewPrivateTab" || cmd == "openInNewTorTab" || cmd == "openInNewSessionTab" || cmd == "openInNewWindow" || cmd == "openInNewWindowWithOneRow" || cmd == "openInNewWindowWithTwoRow") {
        const nodes = this.menuKey
        this.menuKey = (void 0)
        openFavorite(nodes.map(n=>this.getKey(n)),this.props.cont ? this.props.cont.id : (void 0),cmd).then(_=>{
          console.log(324234235346545)
          this.props.onClick && this.props.onClick()
        })
      }
      else if(cmd == "delete") {
        const tree = this.refs.iTree.tree
        const nodeIndex = tree.getSelectedIndex()

        const nodes = this.menuKey
        this.menuKey = (void 0)
        const parentNodes = nodes.map(n => n.getParent())
        deleteFavorite(nodes.map(n=>this.getKey(n)),parentNodes.map(parent=>this.getKey(parent))).then(_ => {
          if(isMain) this.eventUpdateDatas()
          const nextNode = tree.nodes[nodeIndex + 1] || tree.nodes[nodeIndex - 1]
          if(!nextNode){
            this.props.parent.setHidden(true)
          }
          else{
            this.refs.iTree.props.onClick({currentNode: nextNode, stopPropagation:()=>{}})
          }
        })
      }
      else if(cmd == "edit"){
        const nodes = this.menuKey
        this.menuKey = (void 0)
        showDialog({
          inputable: true, title: 'Rename',
          text: `Enter a new Name`,
          initValue:  [nodes[0].name],
          needInput:  ["Title"]
        },this.props.cont ? this.props.cont.id : (void 0)).then(value => {
          if (!value) return
          const data =  {title:value[0]}
          console.log(this.getKey(nodes[0]),data)
          renameFavorite(this.getKey(nodes[0]),data).then(_=>_)
        })
      }
      else if(cmd == "addBookmark" || cmd == "addFolder") {
        let nodes = this.menuKey
        this.menuKey = (void 0)
        const isPage = cmd == "addBookmark"
        if(!nodes[0]){
          nodes = [{}]
          forceFile = false
        }

        if(isPage){
          if(nodes[0].type == 'file' || forceFile){
            insertFavorite2(this.getKey(nodes[0].getParent()),this.getKey(nodes[0]),{title:"",is_file:true}).then(async key=>{
              this.eventUpdateDatas()
              let currentNode
              for(let i=0;i<100;i++){
                await new Promise(r=>{
                  setTimeout(_=>{
                    currentNode = this.refs.iTree.tree.getNodeById(`/root/${key}`)
                    r()
                  },100)
                })
                if(currentNode) break
              }
              this.refs.iTree.props.onClick({currentNode, stopPropagation:()=>{}})
            })
          }
          else{
            insertFavorite(this.getKey(nodes[0]),{title:"",is_file:true}).then(async key=>{
              this.eventUpdateDatas()
              let currentNode
              for(let i=0;i<100;i++){
                await new Promise(r=>{
                  setTimeout(_=>{
                    currentNode = this.refs.iTree.tree.getNodeById(`/root/${key}`)
                    r()
                  },100)
                })
                if(currentNode) break
              }
              this.refs.iTree.props.onClick({currentNode, stopPropagation:()=>{}})
            })
          }
          return
        }
        showDialog({
          inputable: true, title: 'New Directory',
          text: `Enter a new Directory name`,
          needInput: [""]
        },this.props.cont ? this.props.cont.id : (void 0)).then(value => {
          if (!value) return
          const data =  {title:value[0], is_file:false,children:[]}
          if(nodes[0].type == 'file' || forceFile){
            insertFavorite2(this.getKey(nodes[0].getParent()),this.getKey(nodes[0]),data).then(_=>_)
          }
          else{
            insertFavorite(this.getKey(nodes[0]),data).then(_=>_)
          }
        })
      }
    }
    ipc.on('favorite-menu-reply', this.event)
  }

  initDragEvents(){

    const tree = this.refs.iTree.tree
    let currentElement,dragImage
    let draggingX = 0;
    let draggingY = 0;
    const head_bottom = 3
    const middle = 6;


    const createDragImage = (e,num)=>{
      const canvas = document.createElement('canvas')
      canvas.className = 'drag-image'
      document.body.appendChild(canvas)
      const context = canvas.getContext('2d')

      canvas.width = 85
      canvas.height = 20

      context.fillStyle = '#666666'
      context.fillRect(0, 0, canvas.width, canvas.height)

      context.fillStyle = '#dddddd'
      context.font = 'bold 13px Arial'
      context.fillText(`${num} Items`, 15, 15)

      e.dataTransfer.setDragImage(canvas, 5, 9)
      return canvas
    }

    const getSelectClass = (el)=>{
      return el.classList.contains('infinite-tree-selected') ? ' infinite-tree-selected' : ''
    }


    this.onDragStart = (e) => {
      draggingX = 0;
      draggingY = 0;
      if(selectedNodes.length > 1){
        const canvas = createDragImage(e,selectedNodes.length)
        dragImage = canvas
      }
    }
    document.addEventListener('dragstart', this.onDragStart);

    document.addEventListener("drop", e=>{
      e.preventDefault()
    }, false)

    document.addEventListener('mousemove',e=>{
      this.mousePoint = {x:e.clientX, y:e.clientY}
    },{passive:true})

    this.onDragEnd = async (e) => {
      console.log('dragend',e)
      if(currentElement){
        console.log('dragend')
        console.log(e.target)

        const tree = this.refs.iTree.tree
        const dropElement = currentElement
        let dropNode = tree.getNodeById(currentElement.dataset.id)

        const dragNode = tree.getNodeById(e.target.dataset.id)

        const dropClassList = dropElement.classList

        let newDirectory,next
        if(dropClassList.contains('folder-item')){
          newDirectory = this.getKey(dropNode)
          dropNode = (void 0)
        }
        else if(dropClassList.contains('top-overlap')){
          newDirectory = this.getKey(dropNode,2)
          const treePrev = dropNode.getPreviousSibling()
          if(treePrev){
            dropNode = treePrev
          }
          else{
            const prev = dropElement.previousSibling
            if(prev){
              dropNode = tree.getNodeById(prev.dataset.id)
            }
            else{
              dropNode = tree.getRootNode()
            }
          }
        }
        else if(!dropClassList.contains('middle') && dropElement.getElementsByClassName('folder-open').length !== 0 && dropNode.hasChildren()){
          newDirectory = this.getKey(dropNode)
        }
        else if(next = dropElement.nextSibling){
          dropNode = tree.getNodeById(next.dataset.id)
          newDirectory = this.getKey(dropNode,2)
          dropNode = dropNode.getPreviousSibling() || tree.getRootNode()
        }
        else{
          newDirectory = 'root'
          dropNode = tree.getRootNode().getLastChild()
        }

        const dropKey = dropNode && this.getKey(dropNode)
        const nodesNotHaveParent = this.rejectKeysHaveParent([...new Set([dragNode,...selectedNodes])])


        const renameArgs = []
        for(let node of nodesNotHaveParent){
          const [dragKey,oldDirectory] = node.id.split('/').slice(-2).reverse()
          if(dragKey === dropKey) continue
          renameArgs.push([dragKey,oldDirectory,newDirectory,dropKey])
        }
        console.log('renameArgs',renameArgs)
        if(renameArgs.length > 0){
          this.prevState = await localForage.getItem("note-sidebar-open-node")
          moveFavorite(renameArgs).then(_ =>{
            if(isMain) this.eventUpdateDatas()
          })
        }


        currentElement.className = `infinite-tree-item${currentElement.classList.contains('infinite-tree-selected') ? ' infinite-tree-selected' : ''}`
        if(currentElement.previousSibling) currentElement.previousSibling.classList.remove('bottom-previous-sibling-overlap')
        if(currentElement.nextSibling) currentElement.nextSibling.classList.remove('top-next-sibling-overlap')
        currentElement = (void 0)
      }
      if(dragImage){
        document.body.removeChild(dragImage)
        dragImage = (void 0)
      }
    }
    document.addEventListener('dragend',this.onDragEnd,false);


    this.onDragOver = (e) => {
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

      if(currentElement && currentElement !== el){
        // console.log('not',currentElement,el)
        currentElement.className = `infinite-tree-item${currentElement.classList.contains('infinite-tree-selected') ? ' infinite-tree-selected' : ''}`
        if(currentElement.previousSibling) currentElement.previousSibling.classList.remove('bottom-previous-sibling-overlap')
        if(currentElement.nextSibling) currentElement.nextSibling.classList.remove('top-next-sibling-overlap')
      }

      const rect = el.getBoundingClientRect();

      const folder = el.getElementsByClassName('folder-icon').length == 0 ? '' : ' folder-item'
      const selectClass = getSelectClass(el)

      const diff = event.y - rect.top
      if(diff < head_bottom){
        el.className = `infinite-tree-item top-overlap${selectClass}`
        if(el.previousSibling) el.previousSibling.className = `infinite-tree-item bottom-previous-sibling-overlap${getSelectClass(el.previousSibling)}`
        if(el.nextSibling) el.nextSibling.classList.remove('top-next-sibling-overlap')
      }
      else if(diff < head_bottom + middle){
        el.className = `infinite-tree-item top-overlap middle${folder}${selectClass}`
        if(el.previousSibling) el.previousSibling.className = `infinite-tree-item${folder ? '' : ' bottom-previous-sibling-overlap'}${getSelectClass(el.previousSibling)}`
        if(el.nextSibling) el.nextSibling.classList.remove('top-next-sibling-overlap')
      }
      else if(diff < head_bottom + middle * 2){
        el.className = `infinite-tree-item bottom-overlap middle${folder}${selectClass}`
        if(el.previousSibling) el.previousSibling.classList.remove('bottom-previous-sibling-overlap')
        if(el.nextSibling) el.nextSibling.className = `infinite-tree-item${folder ? '' : ' top-next-sibling-overlap'}${getSelectClass(el.nextSibling)}`
      }
      else{
        el.className = `infinite-tree-item bottom-overlap${selectClass}`
        if(el.previousSibling) el.previousSibling.classList.remove('bottom-previous-sibling-overlap')
        if(el.nextSibling) el.nextSibling.className = `infinite-tree-item top-next-sibling-overlap${getSelectClass(el.nextSibling)}`
      }

      currentElement = el
    }
    tree.contentElement.addEventListener('dragover',this.onDragOver);

  }

  rejectKeysHaveParent(selectedNodes) {
    const keysNotHaveParent = []
    for (let node of selectedNodes) {
      let addFlag = true
      const key = node.id
      for (let node2 of selectedNodes) {
        const key2 = node2.id
        if (key != key2 && key.startsWith(key2)) {
          addFlag = false
          break
        }
      }
      if (addFlag) keysNotHaveParent.push(node)
    }
    return keysNotHaveParent;
  }

  getKey(node,ind=1){
    if(!node.id) return 'root'
    const arr = node.id.split('/')
    return arr[arr.length - ind]
  }

  render() {
    const self = this
    const style = this.props.favoritePage ? {paddingLeft:2} : {paddingLeft:4,paddingTop:4,width:this.props.cont ? '600px' :'calc(100vw - 4px)'}
    return (
      <div style={style}>
        <InfiniteTree
          ref="iTree"
          noDataText=""
          loadNodes={(parentNode, done) => {
            console.log(11,parentNode.id)
            getAllChildren(parentNode.id).then(children => done(null, children))
          }}
          rowRenderer={rowRenderer(!this.props.cont && !this.props.favoritePage ? 14 : 18)}
          selectable={true} // Defaults to true
          shouldSelectNode={(node) => { // Defaults to null
            if (!node || (node === this.refs.iTree.tree.getSelectedNode())) {
              return false; // Prevent from deselecting the current node
            }
            return true;
          }}
          onClick={(event) => {
            let openType2 = openType
            const tree = this.refs.iTree.tree
            const currentNode = event.currentNode || tree.getNodeFromPoint(event.x, event.y);
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
              }

              // Select current node
              tree.state.selectedNode = currentNode;
              currentNode.state.selected = true;
              tree.updateNode(currentNode, {}, { shallowRendering: true });


              if(currentNode.type == 'file'){
                // if(this.props.favoritePage){
                //   selectedNodes.forEach(selectedNode => {
                //     selectedNode.state.selected = false
                //     tree.updateNode(selectedNode, {}, { shallowRendering: true },true)
                //   });
                //   selectedNodes = [];
                // }
                // else{
                if(this.props.cont){
                  // if(event.button == 1){
                  //   this.props.cont.hostWebContents2.send('create-web-contents',{id:this.props.cont.id,targetUrl:currentNode.url,disposition:'background-tab'})
                  // }
                  // else{
                  //   this.props.cont.hostWebContents2.send(openType2 ? 'new-tab' : 'load-url',this.props.cont.id,currentNode.url)
                  // }
                  // if(this.props.onClick) this.props.onClick()
                }
                else{
                  this.props.parent.handleClickFile(currentNode)
                  selectedNodes.push(currentNode)
                  localForage.setItem("note-sidebar-select-node",selectedNodes.map(node=>node.id))
                  // ipc.send('send-to-host', "open-tab-opposite",currentNode.url,true,event.button == 1 ? 'create-web-contents' : openType2 ? 'new-tab' : 'load-url')
                }
                return;
                // }
              }
              else{
                this.props.parent.setHidden(true)
                tree.toggleNode(currentNode);
                selectedNodes.push(currentNode)
                localForage.setItem("note-sidebar-select-node",selectedNodes.map(node=>node.id))
                return;
              }
            }
            else if(currentNode.type == 'file'){
              this.props.parent.handleClickFile(currentNode)
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

            localForage.setItem("note-sidebar-select-node",selectedNodes.map(node=>node.id))
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

              if(prevNode.type == 'file'){
                this.props.parent.handleClickFile(prevNode)
                selectedNodes.splice(0,selectedNodes.length,prevNode)
                localForage.setItem("note-sidebar-select-node",selectedNodes.map(node=>node.id))
              }
              else{
                this.props.parent.setHidden(true)
                tree.toggleNode(prevNode)
                selectedNodes.push(prevNode)
                localForage.setItem("note-sidebar-select-node",selectedNodes.map(node=>node.id))
              }
            } else if (event.keyCode === 39) { // Right
              tree.openNode(node);
            } else if (event.keyCode === 40) { // Down
              const nextNode = tree.nodes[nodeIndex + 1] || node;
              tree.selectNode(nextNode);
              if(nextNode.type == 'file'){
                this.props.parent.handleClickFile(nextNode)
                selectedNodes.splice(0,selectedNodes.length,nextNode)
                localForage.setItem("note-sidebar-select-node",selectedNodes.map(node=>node.id))
              }
              else{
                this.props.parent.setHidden(true)
                tree.toggleNode(nextNode)
                selectedNodes.push(nextNode)
                localForage.setItem("note-sidebar-select-node",selectedNodes.map(node=>node.id))
              }
            }
          }}
          onOpenNode={(node) => {
            localForage.setItem("note-sidebar-open-node",this.refs.iTree.tree.getOpenNodes().map(node=>node.id).join("\t"))
          }}
          onCloseNode={(node) => {
            localForage.setItem("note-sidebar-open-node",this.refs.iTree.tree.getOpenNodes().map(node=>node.id).join("\t"))
          }}
        />
      </div>
    );
  }
}
