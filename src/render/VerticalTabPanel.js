const React = require('react')
const ReactDOM = require('react-dom')
const {Component} = React
const PubSub = require('./pubsub')
const uuid = require("node-uuid")
const ipc = require('electron').ipcRenderer
const {remote} = require('electron')
const {BrowserWindow} = remote
const mainState = remote.require('./mainState')
import MenuOperation from './MenuOperation'
import { Button } from 'semantic-ui-react'
import Tabs from './draggable_tab/components/Tabs'
import Tab from './draggable_tab/components/Tab'
import VerticalTabResizer from './VerticalTabResizer'

const isDarwin = navigator.userAgent.includes('Mac OS X')

let [verticalTabWidth] = ipc.sendSync('get-sync-main-states',['verticalTabWidth'])


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
    this.state = {width: verticalTabWidth,tabs:{},keys:[]}
  }

  initBind(){
    this.setWidth = ::this.setWidth
    this.buildTabs = ::this.buildTabs
  }

  componentDidMount() {
    PubSub.subscribe('update-tabs',(msg,key)=>{
      this.buildTabs(key)
    })
    this.buildTabs()
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  setWidth(w, decision){
    const width = this.state.width
    this.setState({width:w})
    PubSub.publish('resize')
    verticalTabWidth = width
    if(decision) mainState.set('verticalTabWidth',width)
  }

  buildTabs(updateKey){
    const keys = []
    this.props.parent.allKeys(void 0,keys)
    this.state.keys = keys

    for(let key of keys){
      const tabPanel = this.props.parent.refs2[key]
      if(updateKey){
        if(updateKey == key){
          const tabRendered = this.tabPanelRender(tabPanel)
          this.state.tabs[key] = tabRendered
          this.setState({})
          return
        }
      }
      else{
        const tabRendered = this.tabPanelRender(tabPanel)
        this.state.tabs[key] = tabRendered
      }
    }
    this.setState({})
  }

  tabRender(){
    const ret = []
    for(let key of this.state.keys){
      if(this.state.tabs[key]) ret.push(this.state.tabs[key])
    }
    return ret
  }

  tabPanelRender(tabPanel){
    let toggle = tabPanel.state.tabBar !== (void 0) ? tabPanel.state.tabBar : tabPanel.props.toggleNav
    if(toggle == 1 && tabPanel.props.k.match(/fixed\-[lr]/)) toggle = 0
    return (
      <Tabs
        tabsClassNames={tabsClassNames}
        // tabsStyles={tabsStyles}
        selectedTab={tabPanel.state.selectedTab}
        onTabSelect={tabPanel.handleTabSelect}
        onClose={tabPanel.handleCloseRemoveOtherContainer}
        onTabClose={tabPanel.handleTabClose}
        // onTabAddOtherContainer={tabPanel.handleTabAddOtherContainer}
        onTabAddButtonClick={tabPanel.handleTabAddButtonClick}
        onTabPositionChange={tabPanel.handleTabPositionChange}
        onTabContextMenu={tabPanel.handleContextMenu}
        // handleTabAddOtherPanel={tabPanel.handleTabAddOtherPanel}
        multiSelectionClick={tabPanel.multiSelectionClick}
        onKeyDown={tabPanel.handleKeyDown}
        createNewTabFromOtherWindow={tabPanel.createNewTabFromOtherWindow}
        resetSelection={tabPanel.resetSelection}
        toggleNav={toggle}
        isTopLeft={tabPanel.props.isTopLeft}
        isTopRight={tabPanel.props.isTopRight}
        fullscreen={tabPanel.props.fullscreen}
        parent={tabPanel}
        isOnlyPanel={!tabPanel.props.parent.state.root.r}
        windowId={tabPanel.props.windowId}
        k={tabPanel.props.k}
        verticalTabPanel={true}
        tabs={tabPanel.state.tabs.map((tab,num)=>{
          return (<Tab key={tab.key} page={tab.page} orgTab={tab} pin={tab.pin} privateMode={tab.privateMode} selection={tab.selection}>
          </Tab>)
        })}
      />
    )
  }

  render() {
    const width = this.state.width

    return <div style={{display: 'flex'}}>
      <div className="vertical-tab" style={{width}}>
        <div style={{textAlign: 'center',paddingTop: 2,paddingBottom: 2}}>
          <Button size="small" onClick={_=>{
            const val = !mainState.tabBarHide
            PubSub.publish('hide-tabbar',val)
            mainState.set('tabBarHide',val)
            PubSub.publish('resize')
          }}>
            Toggle Tabbar
          </Button>
        </div>
        {this.tabRender()}
      </div>
      <VerticalTabResizer width={width}  setWidth={this.setWidth}/>
    </div>
  }
}
