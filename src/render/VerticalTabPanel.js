const React = require('react')
const ReactDOM = require('react-dom')
const {Component} = React
const PubSub = require('./pubsub')
const uuid = require("node-uuid")
const ipc = require('electron').ipcRenderer
const {remote} = require('electron')
const {BrowserWindow} = remote
const mainState = remote.require('./mainState')
const sharedState = require('./sharedState')
import MenuOperation from './MenuOperation'
import { Button } from 'semantic-ui-react'
import Tabs from './draggable_tab/components/Tabs'
import Tab from './draggable_tab/components/Tab'
import VerticalTabResizer from './VerticalTabResizer'
import Tree from './tree-js/tree'

const isDarwin = navigator.userAgent.includes('Mac OS X')

let [verticalTabWidth,verticalTabTree] = ipc.sendSync('get-sync-main-states',['verticalTabWidth','verticalTabTree'])

const allSelectedkeys = sharedState.allSelectedkeys

const tabsClassNames = {
  tabWrapper: 'chrome-tabs',
  tabBar: 'chrome-tabs-content',
  tab:      'chrome-tab',
  tabBeforeTitle: 'chrome-tab-favicon',
  tabTitle: 'chrome-tab-title',
  tabCloseIcon: '',
  tabActive: 'chrome-tab-current'
};


export default class VerticalTabPanel extends Component{
  constructor(props) {
    super(props)
    this.initBind()
    this.state = {width: verticalTabWidth,tree:verticalTabTree,tabs:{},keys:[]}
    this.foldTabs = {}
  }

  initBind(){
    this.setWidth = ::this.setWidth
    this.buildTabs = ::this.buildTabs
    this.toggleTree = ::this.toggleTree
  }

  componentDidMount() {
    this.tokenTabMovedChild = PubSub.subscribe('tab-moved-child',(msg,{tabId,parentTabId})=>{
      const openers = this.props.tabValues
      const opener= openers[tabId]
      const beforeOpener = openers[parentTabId]

      if(beforeOpener == tabId){
        for(let [_tabId,_opener] of Object.entries(openers)){
          if(_opener == tabId){
            openers[_tabId] = opener
          }
        }
      }
      openers[tabId] = parentTabId

      this.setState({})

    })

    this.tokenTabMoved = PubSub.subscribe('tab-moved',(msg,{tabId,fromIndex,toIndex,before})=>{
      if(!this.prevTabs) return
      const openers = this.props.tabValues

      if(!before){
        openers[tabId] = void 0
      }
      else{
        const opener= openers[tabId]
        const beforeOpener = openers[before.wvId]
        let openerIsBefore = []
        for(let [_tabId,_opener] of Object.entries(openers)){
          if(_opener == before.wvId){
            openerIsBefore.push(_tabId)
          }
        }

        if(beforeOpener == tabId){
          for(let [_tabId,_opener] of Object.entries(openers)){
            if(_opener == tabId){
              openers[_tabId] = opener
            }
          }
        }

        if(!openerIsBefore.length){
          openers[tabId] = beforeOpener == tabId ?  openers[openers[tabId]] : beforeOpener
        }
        else{
          openers[tabId] = before.wvId
        }
      }
      this.setState({})

    })

    this.tokenCloseTree = PubSub.subscribe('close-tree',(msg,{key,tabId,tabKey})=>{
      this.treeClose(tabId,new Set([tabId]))
      PubSub.publish(`close_tab_${key}`,{key:tabKey})
    })

    this.tokenExpandTab = PubSub.subscribe('expand-tab',(msg,{key,val})=>{
      this.foldTabs[key] = val
      this.setState({})
    })

    this.tokenUpdateTabs = PubSub.subscribe('update-tabs',(msg,key)=>{
      this.buildTabs(key)
    })
    this.buildTabs()
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenTabMovedChild)
    PubSub.unsubscribe(this.tokenTabMoved)
    PubSub.unsubscribe(this.tokenCloseTree)
    PubSub.unsubscribe(this.tokenExpandTab)
    PubSub.unsubscribe(this.tokenUpdateTabs)
  }


  treeClose(tabId,closes){
    for (let [key,panel] of Object.entries(this.prevTabs)) {
      for (let tab of panel) {
        if (!closes.has(tab.wvId) && tab.opener == tabId) {
          closes.add(tab.wvId)
          console.log(`close_tab_${key}`,{key:tab.key,isUpdateState:false})
          PubSub.publish(`close_tab_${key}`,{key:tab.key})
          this.treeClose(tab.wvId,closes)
        }
      }
    }
  }

  setWidth(w, decision){
    const width = this.state.width
    this.setState({width:w})
    PubSub.publish('resize')
    verticalTabWidth = width
    if(decision) mainState.set('verticalTabWidth',width)
  }

  toggleTree(){
    const newVal = !this.state.tree
    this.setState({tree:newVal})
    verticalTabTree = newVal
    mainState.set('verticalTabTree',newVal)
  }

  buildTabs(updateKey){
    const keys = []
    this.props.parent.allKeys(void 0,keys)
    this.state.keys = keys

    let i = 0
    const tabs = {}
    for(let key of keys){
      const tabPanel = this.props.parent.refs2[key]
      if(updateKey){
        if(updateKey == key){
          if(!tabPanel.state.tabs.length){
            delete this.state.tabs[key]
          }
          else{
            this.state.tabs[key] = tabPanel
          }
          this.setState({})
          return
        }
      }
      else{
        this.state.tabs[key] = tabPanel
      }
    }
    this.setState({})
  }

  buildTree(tabs,obj){
    for(let tab of tabs){
      const ele = {name:tab.wvId,tab,children:[]}
      obj.children.push(ele)
      if(tab.children.length){
        this.buildTree(tab.children,ele)
      }
    }
  }

  diffPrev(nowTabs,prevTabs){
    const nowSet= new Set(),removeTabs = new Set()
    if(!prevTabs) return removeTabs

    for (let panel of Object.values(nowTabs)) {
      for(let tab of panel){
        nowSet.add(tab.wvId)
      }
    }
    for (let panel of Object.values(prevTabs)) {
      for(let tab of panel) {
        if (!nowSet.has(tab.wvId)) removeTabs.add(tab.wvId)
      }
    }
    return removeTabs
  }

  tabRender(){
    const ret = []
    const openers = this.props.tabValues
    let i = 0,len = this.state.keys.length

    if(this.state.tree){
      const tabIdMap = {},tabSeqMap = {},nowTabs={}
      let seq = 0
      for (let key of this.state.keys) {
        if (this.state.tabs[key]) {
          const tabs = this.state.tabs[key].state.tabs
          nowTabs[key] = tabs.map(tab=>{return {...tab} })
          for(let tab of tabs){
            delete tab.depth
            delete tab.seq
            delete tab.referred
            delete tab.expand
            delete tab.fold
            delete tab.hidden
            delete tab.opener
            tabIdMap[tab.wvId] = ++seq
          }
        }
      }
      const removeTabs = this.diffPrev(nowTabs,this.prevTabs)



      const tmpTabs2Map = {}
      for (let key of this.state.keys) {
        if (this.state.tabs[key]) {
          const tabs = this.state.tabs[key].state.tabs

          const tmpTabs = new Map()
          for(let tab of tabs){
            const tabId = tab.wvId
            if(openers[tabId]){
              tab.opener = openers[tabId]
              if(removeTabs.has(tab.opener)){
                const newOpener = openers[tab.opener]
                openers[tabId] = newOpener
                if(newOpener){
                  tab.opener = newOpener
                }
                else{
                  delete tab.opener
                }
              }
            }
            tab.children = []
            tmpTabs.set(tabId,tab)
          }
          const tmpTabs2 = []
          for(let [tabId,tab] of tmpTabs){
            if(tab.opener && tmpTabs.get(tab.opener)){
              tmpTabs.get(tab.opener).children.push(tab)
            }
            else{
              if(tab.opener && tabIdMap[tab.opener]){
                tab.referred = tabIdMap[tab.opener]
                tabSeqMap[tab.opener] = tab.referred
              }
              tmpTabs2.push(tab)
            }
          }
          tmpTabs2Map[key] = tmpTabs2
        }
      }
      for (let key of this.state.keys) {
        if (this.state.tabs[key]) {
          const retTabs = []
          const treeObj = {name: 'root', children: []}
          const tmpTabs2 = tmpTabs2Map[key]
          this.buildTree(tmpTabs2,treeObj)
          const tabTree = Tree(treeObj)
          const flattenTree = tabTree.flatten()

          let pre = {depth: 99999}
          let fold = -1
          for(let x of flattenTree){
            if(!x[1]) continue
            const tab = x[0].tab
            tab.depth =  x[1] - 1
            if(fold !== -1){
              if(fold < tab.depth){
                tab.hidden = true
              }
              else{
                fold = -1
              }
            }
            if(this.foldTabs[tab.key]){
              fold = tab.depth
              tab.fold = true
            }
            if(pre.depth < tab.depth) pre.expand = true
            pre = tab
            if(tabSeqMap[tab.wvId]) tab.seq = tabSeqMap[tab.wvId]
            retTabs.push(tab)
          }
          ret.push(this.tabPanelRenderTree(this.state.tabs[key], retTabs, ++i == len))
        }
      }
      this.prevTabs = nowTabs
    }
    else {
      for (let key of this.state.keys) {
        if (this.state.tabs[key]) {
          ret.push(this.tabPanelRenderNormal(this.state.tabs[key], ++i == len))
        }
      }
    }

    console.log(ret)
    return ret
  }

  tabPanelRenderTree(tabPanel,retTabs,last){
    return (
      <Tabs
        key={tabPanel.props.k}
        tabsClassNames={tabsClassNames}
        selectedTab={tabPanel.state.selectedTab}
        onTabSelect={tabPanel.handleTabSelect}
        onClose={tabPanel.handleCloseRemoveOtherContainer}
        onTabClose={tabPanel.handleTabClose}
        onTabAddButtonClick={tabPanel.handleTabAddButtonClick}
        onTabPositionChange={tabPanel.handleTabPositionChange}
        onTabContextMenu={tabPanel.handleContextMenuTree}
        multiSelectionClick={tabPanel.multiSelectionClick}
        onKeyDown={tabPanel.handleKeyDown}
        createNewTabFromOtherWindow={tabPanel.createNewTabFromOtherWindow}
        resetSelection={tabPanel.resetSelection}
        toggleNav={0}
        isTopLeft={last}
        isTopRight={last}
        fullscreen={tabPanel.props.fullscreen}
        parent={tabPanel}
        isOnlyPanel={!tabPanel.props.parent.state.root.r}
        windowId={tabPanel.props.windowId}
        k={tabPanel.props.k}
        mouseClickHandles={key=>tabPanel._handleContextMenu(null,key,null,tabPanel.state.tabs,false,true)}
        verticalTabPanel={true}
        verticalTabTree={this.state.tree}
        tabs={retTabs.map(tab=>{
          return (<Tab key={tab.key} page={tab.page} orgTab={tab} pin={tab.pin} protect={tab.protect} lock={tab.lock} mute={tab.mute} reloadInterval={tab.reloadInterval} unread={tabPanel.state.selectedTab != tab.key && !allSelectedkeys.has(tab.key)} depth={tab.depth} seq={tab.seq} expand={tab.expand} fold={tab.fold} hidden={tab.hidden} referred={tab.referred} privateMode={tab.privateMode} selection={tab.selection}/>)
        })}
      />
    )
  }

  tabPanelRenderNormal(tabPanel,last){
    return (
      <Tabs
        key={tabPanel.props.k}
        tabsClassNames={tabsClassNames}
        selectedTab={tabPanel.state.selectedTab}
        onTabSelect={tabPanel.handleTabSelect}
        onClose={tabPanel.handleCloseRemoveOtherContainer}
        onTabClose={tabPanel.handleTabClose}
        onTabAddButtonClick={tabPanel.handleTabAddButtonClick}
        onTabPositionChange={tabPanel.handleTabPositionChange}
        onTabContextMenu={tabPanel.handleContextMenu}
        multiSelectionClick={tabPanel.multiSelectionClick}
        onKeyDown={tabPanel.handleKeyDown}
        createNewTabFromOtherWindow={tabPanel.createNewTabFromOtherWindow}
        resetSelection={tabPanel.resetSelection}
        toggleNav={0}
        isTopLeft={last}
        isTopRight={last}
        fullscreen={tabPanel.props.fullscreen}
        parent={tabPanel}
        isOnlyPanel={!tabPanel.props.parent.state.root.r}
        windowId={tabPanel.props.windowId}
        mouseClickHandles={key=>tabPanel._handleContextMenu(null,key,null,tabPanel.state.tabs,false,true)}
        k={tabPanel.props.k}
        verticalTabPanel={true}
        verticalTabTree={this.state.tree}
        tabs={tabPanel.state.tabs.map(tab=>{
          return (<Tab key={tab.key} page={tab.page} orgTab={tab} pin={tab.pin} protect={tab.protect} lock={tab.lock} mute={tab.mute} reloadInterval={tab.reloadInterval} unread={tabPanel.state.selectedTab != tab.key && !allSelectedkeys.has(tab.key)} privateMode={tab.privateMode} selection={tab.selection}/>)
        })}
      />
    )
  }

  render() {
    const width = this.state.width
    const styleText = {
      paddingTop: '0.47em',
      paddingBottom: '0.43em',
      paddingLeft: '1em',
      paddingRight: '1em'
    }
    const styleButton = {
      padding: '0.4em'
    }

    const verticalTabStyle = {
      width,
      background: 'rgb(247, 247, 247)',
      border: '1px solid rgb(148, 148, 148)',
    }
    if(!MenuOperation.windowIsMaximized()){
      verticalTabStyle.border = '1px solid rgb(148, 148, 148)'
      if(this.props.direction == "right"){
        verticalTabStyle.borderLeft =  'none'
      }
      else{
        verticalTabStyle.borderRight =  'none'
      }
    }

    return <div style={{display: this.props.toggleNav > 1 ? 'none' : 'flex'}}>
      {this.props.direction == "right" ? <VerticalTabResizer width={width} setWidth={this.setWidth} direction={this.props.direction}/> : null}
      <div className={`vertical-tab ${this.props.direction}`} style={verticalTabStyle}>
        <div className="vertical-header"/>
        <div style={{textAlign: 'center',paddingTop: 2,paddingBottom: 2}}>
          <Button style={styleText} size="small" onClick={_=>{
            const val = !mainState.tabBarHide
            PubSub.publish('hide-tabbar',val)
            mainState.set('tabBarHide',val)
            PubSub.publish("resizeWindow",{})
          }}>Hide Tabs</Button>
          <Button style={styleButton} icon='tree' onClick={this.toggleTree}/>
          <Button style={styleButton} icon='remove' onClick={_=>{
            PubSub.publish('set-vertical-tab-state',"none")
            PubSub.publish('hide-tabbar',false)
            mainState.set('tabBarHide',false)
          }}/>
        </div>
        {this.tabRender()}
      </div>
      {this.props.direction == "left" ? <VerticalTabResizer width={width}  setWidth={this.setWidth} direction={this.props.direction}/> : null}
    </div>
  }
}
