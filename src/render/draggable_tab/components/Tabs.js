import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom'
import invariant from 'invariant';
import classNames from 'classnames';
import Mousetrap from 'mousetrap';

import TabStylesCreate from './TabStyles';
import TabContainer from './TabContainer';
import CloseIcon from './CloseIcon';

import StyleOverride from '../helpers/styleOverride';
import Utils from '../helpers/utils';

import SortableMixin from './react-mixin-sortable'
import reactMixin  from 'react-mixin'

import RightTopBottonSet from '../../RightTopBottonSet'
import PubSub from '../../pubsub'
import ResizeObserver from 'resize-observer-polyfill'

const {remote} = require('electron')
const mainState = require('../../mainStateRemote')
const ipc = require('electron').ipcRenderer
const {alwaysOnTop} = require('../../browserNavbar')
const NavbarMenu = require('../../NavbarMenu')
const {NavbarMenuItem, NavbarMenuBarItem} = require('../../NavbarMenuItem')
const sharedState = require('../../sharedState')
const {getTextColorForBackground} = require('../../../../brave/app/color')
const ToolbarResizer = require('../../ToolbarResizer')
const getTheme = require('../../theme')

const isDarwin = navigator.userAgent.includes('Mac OS X')
const isWin = navigator.userAgent.includes('Windows')
let [scrollTab,reverseScrollTab,multistageTabs,verticalTabWidth,tabBarHide,tabMinWidth,tabMaxWidth,tabFlipLabel,mouseHoverSelectLabelBeginDelay,mouseHoverSelectLabelBegin,doubleClickTab,middleClickTab,altClickTab,maxrowLabel,openTabNextLabel,rightClickTabAdd,middleClickTabAdd,altClickTabAdd,displayFullIcon,mediaPlaying,tabPreviewSizeWidth,tabPreviewSizeHeight,tabPreviewSlideHeight,tabPreviewWait,tabCirculateSelection,tabBarMarginTop,removeTabBarMarginTop] = ipc.sendSync('get-sync-main-states',['scrollTab','reverseScrollTab','multistageTabs','verticalTabWidth','tabBarHide','tabMinWidth','tabMaxWidth','tabFlipLabel','mouseHoverSelectLabelBeginDelay','mouseHoverSelectLabelBegin','doubleClickTab','middleClickTab','altClickTab','maxrowLabel','openTabNextLabel','rightClickTabAdd','middleClickTabAdd','altClickTabAdd','displayFullIcon','mediaPlaying','tabPreviewSizeWidth','tabPreviewSizeHeight','tabPreviewSlideHeight','tabPreviewWait','tabCirculateSelection','tabBarMarginTop','removeTabBarMarginTop'])
maxrowLabel = parseInt(maxrowLabel)
tabPreviewSizeWidth = tabPreviewSizeWidth ? parseInt(tabPreviewSizeWidth) : null
tabPreviewSizeHeight = tabPreviewSizeHeight ? parseInt(tabPreviewSizeHeight) : null
tabPreviewSlideHeight = tabPreviewSlideHeight ? parseInt(tabPreviewSlideHeight) : 140
tabPreviewWait = tabPreviewWait ? parseInt(tabPreviewWait) : 0
sharedState._tabBarMarginTop = parseInt(tabBarMarginTop)
sharedState.tabBarMarginTop = (removeTabBarMarginTop && remote.getCurrentWindow().isMaximized()) ? 0 : sharedState._tabBarMarginTop
sharedState.multistageTabs = multistageTabs

// if(removeTabBarMarginTop){
//   ipc.on('maximize',(e,val)=>{
//     let nextVal
//     if(val){
//       nextVal = sharedState._tabBarMarginTop
//     }
//     else{
//       nextVal = sharedState._tabBarMarginTop
//     }
//     if(nextVal != sharedState.tabBarMarginTop){
//       sharedState.tabBarMarginTop = nextVal
//       PubSub.publish('set-state-split-window')
//       PubSub.publish('set-state-split-window')
//     }
//   })
// }

;(function(){
  const s = document.createElement('style');
  s.setAttribute('type', 'text/css');
  s.appendChild(document.createTextNode(`.chrome-tabs .chrome-tab-drag .chrome-tab-background > svg .chrome-tab-background,
.chrome-tab-selection{
  stroke: ${sharedState.colorTabDot};
  stroke-width: 1.5px;
  stroke-dasharray: 3;
  stroke-dashoffset:0;
}
.chrome-tabs .chrome-tab-drag.multi-row .chrome-tab-background,
.chrome-tab-selection.multi-row .chrome-tab-background,
.vertical-tab .chrome-tab-drag, .vertical-selection{
  border: 1px dashed ${sharedState.colorTabDot} !important;
}
${sharedState.showBorderActiveTab ? '.chrome-tabs .chrome-tab.chrome-tab-current .chrome-tab-background { border-bottom: 1px solid #aaa; }' : ''}
span.private-mode,i.private-mode,i.pin-mode,i.mute-mode,i.reload-mode {color: ${sharedState.colorTabMode};}
${isWin ? '.browserActionBadge {top: 14px !important;}' : ''}`));
  document.head.appendChild(s)
}())

let noUpdate


function getWebContents(tab){
  if(!tab.wv || !tab.wvId) return
  return global.currentWebContents[tab.wvId]
}

function isFixedPanel(key){
  return key.startsWith('fixed-')
}

function isFloatPanel(key){
  return key.startsWith('fixed-float')
}

class Title extends React.Component {
  componentDidMount() {
    this.audioVolume = "10"
    this.beforeTitle = this.props.datas.beforeTitle
    this.tokenTabComponentUpdate = PubSub.subscribe(`tab-component-update_${this.props.datas.key}`,(msg,datas)=>{
      this.title = datas.title
      this.beforeTitle[this.beforeTitle.length - 1] = datas.beforeTitle
      this.setState({})
    })

  }

  componentWillReceiveProps(nextProps) {
    this.title = nextProps.datas.title
    this.beforeTitle = nextProps.datas.beforeTitle
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenTabComponentUpdate)
  }

  audioControl(e){
    console.log(e)
    const val = parseFloat(e.target.value)
    this.audioVolume = e.target.value

    this.props.datas.tab.wv.send('on-stream-event',val)

    this.setState({})

    mainState.add('isVolumeControl',this.props.datas.tab.wvId,val)
  }

  handleClick(){
    ipc.emit('menu-or-key-events', null, 'unmuteTab', this.props.datas.tab.wvId)
  }

  mediaMenu(){
    return <NavbarMenu className="sort-sidebar" k={this.props.datas.k} mouseOver={true} isFloat={isFloatPanel(this.props.datas.k)} onClick={::this.handleClick}
                       onMouseOver={_=>{
                         if(document.querySelector('.hol-resizer')) document.querySelector('.hol-resizer').style.display = 'none'
                         this.props.parent.setState({})
                       }}
                       onMouseLeave={_=>{if(document.querySelector('.hol-resizer')) document.querySelector('.hol-resizer').style.display = 'inherit'}}
                       audio={true} icon="volume-up" className="play-mode playing" style={{lineHeight: 'inherit',pointerEvents: 'initial', float: 'left','-webkit-app-region': 'no-drag'}} keepVisible={true}>

      <div className="ui input preview-img-input" style={{ margin: '4px 5px 0px 10px', display: 'inline-block'}}>
        <input  className="preview-img-input" onMouseDown={e=>e.target.closest('li').setAttribute('draggable',false)}
                style={{padding: '.5em 0', width: 180}} type="range" min="0" max="80" name="vol" step="1" value={this.audioVolume} onInput={::this.audioControl}/>
      </div>
      <label style={{verticalAlign: '13px', paddingRight: 10}}>{parseInt(this.audioVolume) * 10}%</label>
    </NavbarMenu>
  }

  render(){
    const {key,tab,TabStyles,tabBeforeTitleClasses,beforeTitle,tabTiteleStyle,tabTitleClasses,extraAttribute,privateMode,lock,protect,mute,reloadInterval,title,verticalTabPanel,toggleNav,beforeTitleStyle,selected} = this.props.datas

    let m, m2
    if(privateMode){
      if(m = privateMode.match(/^persist:(\d+)$/)) m = m[1]
    }
    const color = selected ? getTheme('colors','tab_text') : getTheme('colors','tab_background_text')
    if(color) tabTiteleStyle.color = color

    return <div style={{display:'unset',boxSizing: !verticalTabPanel && multistageTabs && toggleNav == 0 ? 'content-box' : (void 0)}}>
       <span style={beforeTitleStyle} className={tabBeforeTitleClasses}>
        {this.beforeTitle || beforeTitle}
         {protect ? <i className="fa fa-shield protect-mode" /> : ""}
         {lock ? <i className="fa fa-ban lock-mode" /> : ""}
       </span>
      <p style={tabTiteleStyle}
         className={tabTitleClasses}
         {...extraAttribute} >
        {m ? <span className='private-mode'>[{m}]</span> :
          privateMode == 'persist:tor' ? <span className='private-mode'>[T]</span>:
            privateMode ? <i className="fa fa-eye-slash private-mode" ></i> : ""}
        {mediaPlaying[tab.wvId] ? mute ? <i className="fa fa-volume-off mute-mode playing" onClick={::this.handleClick}/> :
          this.mediaMenu() :
          mute ? <i className="fa fa-volume-off mute-mode" onClick={::this.handleClick}/> : ""}
        {this.audioVolume && this.audioVolume != "10" ? <span className='audio-percent'>[{parseInt(this.audioVolume) * 10}%]</span> : ""}

        {reloadInterval ? <i className="fa fa-repeat reload-mode" /> : ""}
        {this.title || title}
      </p>
    </div>
  }

}

let isMove
let transfer = {}
let tabPreviewHeight
class Tabs extends React.Component {
  constructor(props) {
    super(props);
    this.sortableOptions = {
      ref: "ttab",
      group: "shared",
      // delay: 5000,
      model: "tabs"
    }

    const tabs = this._tabStateFromProps(this.props).tabs;
    let selectedTab = '';
    if (this.props.selectedTab) {
      selectedTab = this.props.selectedTab;
    } else if (this.props.tabs) {
      selectedTab = this.props.tabs[0].key;
    }
    // const hoveredTab = '';
    const closedTabs = new Set();
    const defaultState = {
      tabs,
      selectedTab,
      // hoveredTab,
      closedTabs,
      verticalTabWidth: verticalTabWidth
    };

    this.state = defaultState;
    this.tabs = []
    this.TabStyles = TabStylesCreate()
    this.clickCount = 0
    this.minWidth = tabMinWidth
    this.maxWidth = tabMaxWidth
    this.tabPreviews = {}
    this.tabPreviewHeight = tabPreviewHeight

    this.handlePanelDragOver = ::this.handlePanelDragOver
    this.handleWheel = ::this.handleWheel
    this.updateWidth = ::this.updateWidth
  }

  componentWillMount(){
    if(this.props.refs2) this.props.refs2[`tabs-${this.props.k}`] = this
  }

  componentDidMount(){
    this.props.refs2[`tabs-${this.props.k}`] = this
  }

  componentWillUnmount() {
    if(this.props.refs2[`tabs-${this.props.k}`] == this){
      delete this.props.refs2[`tabs-${this.props.k}`]
    }
  }

  isMultistageTabsMode(){
    return (multistageTabs && this.props.toggleNav == 0) || this.props.verticalTabPanel
  }


  _tabStateFromProps(props) {
    console.log(22111142,props)
    const tabs = []
    for(let tab of props.tabs){tabs.push(tab)}

    return { tabs }
  }

  _isClosed(key) {
    return this.state.closedTabs.has(key);
  }

  _getIndexOfTabByKey(key) {
    return _.findIndex(this.state.tabs, (tab) => tab.key === key);
  }

  _getNextTabKey(key) {
    let nextKey;
    const current = this._getIndexOfTabByKey(key);
    if (current + 1 < this.state.tabs.length) {
      nextKey = this.state.tabs[current + 1].key;
      if (this._isClosed(nextKey)) {
        nextKey = this._getNextTabKey(nextKey);
      }
    }
    else if(tabCirculateSelection){
      nextKey = this.state.tabs[0].key;
    }
    return nextKey;
  }

  _getPrevTabKey(key) {
    let prevKey;
    const current = this._getIndexOfTabByKey(key);
    if (current > 0) {
      prevKey = this.state.tabs[current - 1].key;
      if (this._isClosed(prevKey)) {
        prevKey = this._getPrevTabKey(prevKey);
      }
    }
    else if(tabCirculateSelection){
      prevKey = this.state.tabs[this.state.tabs.length-1].key;
    }
    return prevKey;
  }

  _getCurrentOpenTabs() {
    return this._getOpenTabs(this.state.tabs);
  }

  _getOpenTabs(tabs) {
    return _.filter(tabs, (tab) => !this._isClosed(tab.key));
  }

  _moveTabPosition(key1, key2) {
    const t1 = this._getIndexOfTabByKey(key1);
    const t2 = this._getIndexOfTabByKey(key2);
    return Utils.slideArray(this.state.tabs, t1, t2);
  }

  _cancelEventSafety(e) {
    const ev = e;
    if (typeof e.preventDefault !== 'function') {
      ev.preventDefault = () => {};
    }
    if (typeof e.stopPropagation !== 'function') {
      ev.stopPropagation = () => {};
    }
    ev.preventDefault();
    ev.stopPropagation();
    return ev;
  }

  updateWidth(){
    if(multistageTabs && !this.props.verticalTabPanel){
      const rect = this.refs.ttab.getBoundingClientRect();
      const min = Math.min(tabMinWidth,Math.floor((rect.width * maxrowLabel * 0.8)/ this.state.tabs.length))
      if(min != this.minWidth){
        this.minWidth = min
        this.maxWidth = Math.min(tabMaxWidth,this.minWidth * 1.5)
        this.setState({})
      }
    }
  }

  componentDidMount() {
    let prevHeight = 0
    this.ro = new ResizeObserver((entries, observer) => {
      if(!multistageTabs || this.props.verticalTabPanel) return
      for (const entry of entries) {
        console.log(88974,entry,entry.contentRect.height)
        const height = entry.contentRect.height,
          width = entry.contentRect.width
        if(prevHeight != height){
          if(maxrowLabel != 0){
            const min = Math.min(tabMinWidth,Math.floor((width * maxrowLabel * 0.8)/ this.state.tabs.length))
            if(min != this.minWidth){
              this.minWidth = min
              this.maxWidth = Math.min(tabMaxWidth,this.minWidth * 1.5)
              this.setState({})
            }
          }
          this.props.parent.setState({})
          prevHeight = height
        }
      }
    });
    this.ro.observe(ReactDOM.findDOMNode(this.refs.ttab))

    const update = (_,e)=>{
      setTimeout(_=>this.setState({}),500)
    }
    this.tokenResizeWindow = PubSub.subscribe("resizeWindow",update)
    this.tokenResize = PubSub.subscribe("resize",update)

    this.tokenMultistageTabs = PubSub.subscribe('change-multistage-tabs',(msg,val)=>{
      multistageTabs = val
      this.setState({})
    })

    this.tokenHideTabBar = PubSub.subscribe('hide-tabbar',(msg,val)=>{
      tabBarHide = val
      this.setState({})
    })


    if(scrollTab) this.refs.ttab.addEventListener('wheel',this.handleWheel,{passive: true})
    // this.addDropEvent();

    this.tokenTabMove = PubSub.subscribe('tab-move',(msg,k)=>{
      if(this.isMultistageTabsMode() || this.props.verticalTabPanel) return
      let i = 0
      const thisDom = ReactDOM.findDOMNode(this)
      console.log(thisDom.querySelectorAll("li"))
      for (let li of thisDom.querySelectorAll("li")) {
        const className = li.className
        if (k == this.props.k && className.includes('rdTabActive') && !className.includes("ghost")) continue

        if (i == 0) {
          li.style.left = null
          li.style['margin-left'] = this.props.toggleNav == 1 ? '0px' : '10px'
        }
        else {
          li.style.left = `${i * -13}px`
          li.style['margin-left'] = null
        }
        i++
      }
      thisDom.querySelector('.rdTabAddButton').style.left = `${i * -13}px`
    })

    this.tokenPreviewHeight = PubSub.subscribe('token-preview-change',(msg,val)=>{
      if(val){
        this.tabPreviewHeight = this._tabPreviewHeight
        tabPreviewHeight = this._tabPreviewHeight
      }
      else{
        this._tabPreviewHeight = this.tabPreviewHeight
        this.tabPreviewHeight = void 0
        tabPreviewHeight = void 0
      }
      this.props.parent.setState({})
    })

    this.tokenPreview = PubSub.subscribe('tab-preview-update',(msg,val)=>{
      if((this.tabPreviewHeight && this.tabPreviewHeight != 27) || this.props.verticalTabPanel){
        this.setState({})
      }
    })

    this.handleUpdateMediaPlaying = (e,tabId,val)=>{
      mediaPlaying[tabId] = val
      this.setState({})
    }
    ipc.on('update-media-playing',this.handleUpdateMediaPlaying)

    // PubSub.publish('update-tabs',this.props.k)
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.tokenResizeWindow)
    PubSub.unsubscribe(this.tokenResize)
    PubSub.unsubscribe(this.tokenMultistageTabs)
    PubSub.unsubscribe(this.tokenHideTabBar)
    PubSub.unsubscribe(this.tokenTabMove)
    PubSub.unsubscribe(this.tokenPreview)
    PubSub.unsubscribe(this.tokenPreviewHeight)
    ipc.removeListener('update-media-playing',this.handleUpdateMediaPlaying)

    this.refs.ttab.removeEventListener('wheel',this.handleWheel,{passive: true})
    delete transfer[this.props.k]
    this.ro.unobserve(ReactDOM.findDOMNode(this.refs.ttab))
  }

  componentWillReceiveProps(nextProps) {
    const newState = this._tabStateFromProps(nextProps);
    if (nextProps.selectedTab !== 'undefined') {
      newState.selectedTab = nextProps.selectedTab;
    }
    // reset closedTabs, respect props from application
    newState.closedTabs = new Set();
    this.setState(newState);
  }

  buildRenderComponent(){
    this.TabStyles = TabStylesCreate()
    // override inline tabs styles
    const tabInlineStyles = {};
    tabInlineStyles.tabWrapper = this.TabStyles.tabWrapper //StyleOverride.merge(this.TabStyles.tabWrapper, this.props.tabsStyles.tabWrapper);
    if(this.props.verticalTabPanel) tabInlineStyles.tabWrapper = StyleOverride.merge(this.TabStyles.tabWrapper,{height: 'initial'})

    tabInlineStyles.tabBar = StyleOverride.merge(this.TabStyles.tabBar, this.props.tabsStyles.tabBar);
    if(this.isMultistageTabsMode()){
      tabInlineStyles.tabBar.display = "flex"
      tabInlineStyles.tabBar.height = void 0
      tabInlineStyles.tabBar.left = 3
      tabInlineStyles.tabBar.right = 3
      tabInlineStyles.tabBar.paddingRight = 4
      tabInlineStyles.tabBar.marginBottom = -1
    }
    else if(this.props.toggleNav == 1){
      tabInlineStyles.tabBar = StyleOverride.merge(tabInlineStyles.tabBar, {display: 'flex',position:'absolute',height: 30});
      tabInlineStyles.tabBar.paddingRight = void 0
      tabInlineStyles.tabBar.marginBottom = void 0
    }
    else if(this.props.toggleNav == 3){
      tabInlineStyles.tabBar.left = 0
      tabInlineStyles.tabBar.height = 27
    }
    else {
      tabInlineStyles.tabBar.display = "flex"
      tabInlineStyles.tabBar.paddingRight = void 0
      tabInlineStyles.tabBar.height = `${(this.tabPreviewHeight || 27) + sharedState.tabBarMarginTop}px`
      // const titleElements = document.getElementsByClassName("rdTabBar mfyTabBar")
      //   for (let i = 0; i < titleElements.length; i++) {
      //     titleElements[i].style.display = "flex"
      //   }
    }
    if(sharedState.theme && !getTheme('images','theme_frame',true))
      tabInlineStyles.tabBar.backgroundColor = 'rgba(255, 255, 255, 0.5)'

    tabInlineStyles.tab = this.TabStyles.tab //StyleOverride.merge(this.TabStyles.tab, this.props.tabsStyles.tab);
    if(this.props.verticalTabPanel){
      delete this.TabStyles.tab.minWidth
      delete this.TabStyles.tab.maxWidth
    }
    else if(this.isMultistageTabsMode()){
      this.TabStyles.tab.minWidth = `${this.minWidth}px`
      this.TabStyles.tab.maxWidth = `${this.maxWidth}px`
      this.TabStyles.tab.height = this.tabPreviewHeight && this.tabPreviewHeight != 27 ? 'auto' : '27px'
    }
    else{
      this.TabStyles.tabActive.zIndex = 2
      this.TabStyles.tab.minWidth = '0px'
      this.TabStyles.tab.maxWidth = `${tabMaxWidth}px`
      this.TabStyles.tab.height = this.tabPreviewHeight && this.tabPreviewHeight != 27 ? `${this.tabPreviewHeight}px` :  void 0
    }
    tabInlineStyles.tabTitle = this.TabStyles.tabTitle //StyleOverride.merge(this.TabStyles.tabTitle, this.props.tabsStyles.tabTitle);
    tabInlineStyles.tabCloseIcon = this.TabStyles.tabCloseIcon //StyleOverride.merge(this.TabStyles.tabCloseIcon, this.props.tabsStyles.tabCloseIcon);
    tabInlineStyles.tabCloseIconOnHover = this.TabStyles.tabCloseIconOnHover //StyleOverride.merge(this.TabStyles.tabCloseIconOnHover, this.props.tabsStyles.tabCloseIconOnHover);

    tabInlineStyles.tabActive = this.TabStyles.tabActive //StyleOverride.merge(this.TabStyles.tabActive, this.props.tabsStyles.tabActive);
    tabInlineStyles.tabTitleActive = this.TabStyles.tabTitleActive //StyleOverride.merge(this.TabStyles.tabTitleActive, this.props.tabsStyles.tabTitleActive);
    tabInlineStyles.tabBeforeActive = this.TabStyles.tabBeforeActive //StyleOverride.merge(this.TabStyles.tabBeforeActive, this.props.tabsStyles.tabBeforeActive);

    tabInlineStyles.tabOnHover = this.TabStyles.tabOnHover //StyleOverride.merge(this.TabStyles.tabOnHover, this.props.tabsStyles.tabOnHover);
    tabInlineStyles.tabTitleOnHover = this.TabStyles.tabTitleOnHover //StyleOverride.merge(this.TabStyles.tabTitleOnHover, this.props.tabsStyles.tabTitleOnHover);

    // append tabs classNames
    const _tabClassNames = {};
    _tabClassNames.tabWrapper = `rdTabWrapper ${this.props.tabsClassNames.tabWrapper}`
    _tabClassNames.tabBar = `rdTabBar ${this.props.tabsClassNames.tabBar}`
    _tabClassNames.tab = `rdTab ${this.props.tabsClassNames.tab}`
    _tabClassNames.tabTitle = `rdTabTitle ${this.props.tabsClassNames.tabTitle}`
    _tabClassNames.tabBeforeTitle = `rdTabBeforeTitle ${this.props.tabsClassNames.tabBeforeTitle}`
    _tabClassNames.tabCloseIcon = `rdTabCloseIcon ${this.props.tabsClassNames.tabCloseIcon}`

    let vHeight
    if(this.props.verticalTabPanel && sharedState.tabPreview){
      vHeight = Math.min(tabPreviewSlideHeight + 32, (window.innerHeight - 92 - document.querySelectorAll('.split-window .chrome-tabs').length * 38 ) / document.querySelectorAll('.split-window .chrome-tab').length)
    }
    let content = [];
    const {notLoadTabUntilSelected,allSelectedkeys} = sharedState
    let tabs = this.state.tabs.map((tab,tabNum) => {
      if (this.state.closedTabs.has(tab.key)) {
        return '';
      }
      let {
        page,
        afterTitle,
        disableClose,
        tabClassNames,
        tabStyles,
        containerStyle,
        hiddenContainerStyle,
        onClick,
        onMouseEnter,
        onMouseLeave,
        orgTab,
        privateMode,
        pin,
        mute,
        freeze,
        protect,
        lock,
        unread,
        reloadInterval,
        ...others
      } = tab.props;

      const selected = this.state.selectedTab === tab.key
      const unreadTab = sharedState.enableColorOfNoSelect && unread
      const themeColor = sharedState.themeColorChange && sharedState[`color-${tab.key}`]
      const bgColor = selected ? (themeColor || sharedState.colorActiveBackground) : sharedState.colorNormalBackground
      const titleColor = this.props.verticalTabTree ? selected ? themeColor ?  getTextColorForBackground(themeColor) : tabInlineStyles.tabTitleActive.color : unreadTab ? sharedState.colorUnreadText : tabInlineStyles.tabTitle.color : null


      let beforeTitleCount = 0
      const beforeTitle = []
      if(this.props.verticalTabTree && (tab.props.seq || tab.props.referred)){
        let tabNumber = `[${tab.props.referred}']`
        beforeTitleCount++
        if(tab.props.seq && tab.props.referred){
          tabNumber = `[${tab.props.referred}'][${tab.props.seq}]`
          beforeTitleCount++
        }
        else if(tab.props.seq){
          tabNumber = `[${tab.props.seq}]`
        }
        beforeTitle.push(<span className="tab-number" style={{color:titleColor}}>{tabNumber}</span>)
      }
      beforeTitle.push(<img className='favi-tab' src={notLoadTabUntilSelected && !allSelectedkeys.has(tab.key) ? 'resource/file.svg' : page.title && page.favicon !== 'loading' && !page.isLoading ? page.favicon : 'resource/l.svg'} onError={(e)=>{e.target.src = 'resource/file.svg'}}/>)

      const title = page.favicon !== 'loading' || page.titleSet  || page.location == 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html' ? page.title : page.location

      // containerStyle = containerStyle || {}
      // tabStyles = tabStyles || {}
      tabClassNames = tabClassNames || {}
      // containerStyle.height = `calc(100% - ${this.props.toggleNav == 0 ? 27 : this.props.toggleNav == 1 ? 1 : 0}px)`
      if(this.props.toggleNav == 0 && multistageTabs){
        const ele = document.querySelector(`.s${this.props.k} .tab-base`)
        containerStyle.height = `calc(100% - ${ele ? ele.offsetHeight : 30}px)`
      }
      else if(this.props.toggleNav == 0 && this.tabPreviewHeight && this.tabPreviewHeight != 27){
        const ele = document.querySelector(`.s${this.props.k} .tab-base`)
        containerStyle.height = `calc(100% - ${ele ? ele.offsetHeight : 27 + sharedState.tabBarMarginTop}px)`
      }
      else{
        containerStyle.height = `calc(100% - ${this.props.toggleNav == 0 ?  27 + sharedState.tabBarMarginTop : 0}px)`
      }

      // override inline each tab styles
      let tabStyle = StyleOverride.merge(tabInlineStyles.tab, {});
      let tabTiteleStyle = {...tabInlineStyles.tabTitle} //StyleOverride.merge(tabInlineStyles.tabTitle, this.TabStyles.tabTitle);
      const tabCloseIconStyle = {...tabInlineStyles.tabCloseIcon} //StyleOverride.merge(tabInlineStyles.tabCloseIcon, this.TabStyles.tabCloseIcon);
      if(this.props.toggleNav == 0 && multistageTabs) tabCloseIconStyle.right = '10px'

      let tabClasses = `${_tabClassNames.tab} ${tabClassNames.tab} ${this.props.toggleNav == 0 && multistageTabs ? 'multi-row' : ''}${this.props.verticalTabPanel && tab.props.hidden ? ' tab-hidden' : ''}`
      let tabTitleClasses = `${_tabClassNames.tabTitle} ${tabClassNames.tabTitle}`
      let tabBeforeTitleClasses = `${_tabClassNames.tabBeforeTitle} ${tabClassNames.tabBeforeTitle}`
      const tabCloseIconClasses = `${_tabClassNames.tabCloseIcon} ${tabClassNames.tabCloseIcon}`

      if (selected) {
        tabStyle = StyleOverride.merge(tabInlineStyles.tab, tabInlineStyles.tabActive) //StyleOverride.merge(StyleOverride.merge(tabInlineStyles.tab, tabInlineStyles.tabActive), this.TabStyles.tabActive);
        tabTiteleStyle = StyleOverride.merge(tabInlineStyles.tabTitle, tabInlineStyles.tabTitleActive) //StyleOverride.merge(StyleOverride.merge(tabInlineStyles.tabTitle, tabInlineStyles.tabTitleActive), this.TabStyles.tabTitleActive);
        if(themeColor) tabTiteleStyle.color = getTextColorForBackground(themeColor)
        tabClasses = classNames(tabClasses, 'rdTabActive', this.props.tabsClassNames.tabActive, tabClassNames.tabActive);
        content.push(<TabContainer key={`tabContainer#${tab.key}`} selected={true} style={containerStyle}>{tab}</TabContainer>);
      } else {
        // if (this.state.hoveredTab === tab.key) {
        //   tabStyle = StyleOverride.merge(StyleOverride.merge(tabStyle, tabInlineStyles.tabOnHover), this.TabStyles.tabOnHover);
        //   tabTiteleStyle = StyleOverride.merge(StyleOverride.merge(tabTiteleStyle, tabInlineStyles.tabTitleOnHover), this.TabStyles.tabTitleOnHover);
        //   tabClasses = classNames(tabClasses, 'rdTabHover', this.props.tabsClassNames.tabHover, tabClassNames.tabHover);
        // }
        content.push(
          <TabContainer key={`tabContainer#${tab.key}`} selected={false} style={containerStyle} hiddenStyle={hiddenContainerStyle}>{tab}</TabContainer>);
      }

      if((this.props.toggleNav == 0 && multistageTabs) || this.props.verticalTabPanel){
        tabTiteleStyle.paddingRight = 8
      }

      if(!this.props.verticalTabPanel){
        tabStyle = StyleOverride.merge(tabStyle, tabNum === 0 ? { marginLeft: this.props.toggleNav == 1 || multistageTabs ? 0 : 10} : {left: this.isMultistageTabsMode() ? 0 : -13 * tabNum});
        if(this.refs && this.refs[tab.key]){
          const li = ReactDOM.findDOMNode(this.refs[tab.key])
          if(tabNum === 0){
            li.style.marginLeft = `${this.isMultistageTabsMode() ? 0 : tabStyle.marginLeft}px`
            li.style.left = '0px'
          }
          else{
            li.style.left = `${this.isMultistageTabsMode() ? 0 : tabStyle.left}px`
            li.style['margin-left'] = null
          }
        }
      }
      if(tab.props.selection){
        tabClasses = `${tabClasses} chrome-tab-selection`
      }

      if(unreadTab) tabTiteleStyle.color = sharedState.colorUnreadText

      if(protect) tabCloseIconStyle.display = 'none'

      if(pin && !this.props.verticalTabPanel){
        tabTiteleStyle.display = 'none'
        tabCloseIconStyle.display = 'none'
        if(this.isMultistageTabsMode()){
          tabStyle.minWidth = '37px'
          tabStyle.maxWidth =  '37px'
        }
        else{
          tabStyle.minWidth = '48px'
          tabStyle.maxWidth =  '48px'
        }
      }

      if(this.props.verticalTabPanel){
        tabStyle.backgroundColor = bgColor
        tabStyle.borderBottom = '1px solid rgba(0, 0, 0, 0.27)'
        tabStyle.borderLeft = '1px solid rgba(0, 0, 0, 0.27)'
        tabStyle.borderRight = '1px solid rgba(0, 0, 0, 0.27)'
        if(tabNum == 0) tabStyle.borderTop = '1px solid rgba(0, 0, 0, 0.27)'
        if(vHeight) tabStyle.height = vHeight
        if(tab.props.depth){
          const margin = tab.props.depth * 10
          tabStyle.marginLeft = margin
          tabStyle.width = `calc(100% - ${margin}px)`
        }
        else{
          tabStyle.marginLeft = 0
        }
      }

      const extraAttribute = {};
      if (typeof title === 'string') {
        extraAttribute.title = title;
      }
      let closeButton = this.getCloseButton(tab, tabCloseIconStyle, tabCloseIconClasses, tabInlineStyles.tabCloseIconOnHover);


      const t = tab.props.orgTab

      const onMouseHover = sharedState.tabPreview || mouseHoverSelectLabelBegin ? e=>{
        let target = e.target

        if(sharedState.tabPreview && !this.props.verticalTabPanel) {
          if(this.tabPreviewStop || tab.key == this.props.selectedTab) return
          setTimeout(async _=>{
            if(this.tabPreviewStop || tab.key == this.props.selectedTab) return

            const handleMouseMove = e =>{
              if(!e || !e.target.closest(`#draggable_tabs_${tab.key}`)){
                delete this.tabPreviews[tab.key]
                PubSub.unsubscribe(token)
                document.removeEventListener('mousemove',handleMouseMove)
                this.setState({})
              }
            }

            if(sharedState.tabPreviewRecent && (!this.tabPreviewHeight || this.tabPreviewHeight == 27)){
              const base64 = Math.random().toString()
              ipc.send('take-capture', {base64, tabId: t.wvId})
              await new Promise(r=>{
                ipc.once(`take-capture-reply_${base64}`,(e,dataURL,size)=>{
                  t.tabPreview = {dataURL,...size}
                  r()
                })
              })
            }
            const rect = target.getBoundingClientRect()
            this.tabPreviews[tab.key] = {left: rect.left,top:rect.top,tabPreview: t.tabPreview}
            const token = PubSub.subscribe('tab-preview-update',(msg,val)=>{
              if(val) handleMouseMove()
              this.setState({})
            })
            this.setState({})
            document.addEventListener('mousemove',handleMouseMove)
          },Object.keys(this.tabPreviews).length ? 0 : tabPreviewWait)
        }

        if(mouseHoverSelectLabelBegin){
          const handleMouseMove = e => target = e.target
          document.addEventListener('mousemove',handleMouseMove)
          setTimeout(_=>{
            document.removeEventListener('mousemove',handleMouseMove)
            if(target.closest(`[data-key='${tab.key}']`)){
              this.setState({ selectedTab: tab.key }, () => {
                this.props.onTabSelect(e, tab.key, this._getCurrentOpenTabs());
              })
            }
          },parseInt(mouseHoverSelectLabelBeginDelay))
        }
      } : void 0


      let prevTitle,beforeTitleStyle
      if(this.props.verticalTabTree && tab.props.expand){
        if(tab.props.fold){
          prevTitle = <span onMouseDown={e =>{e.stopPropagation();PubSub.publish('expand-tab',{key:tab.key,val:false})}} className="tab-expand" style={{color:titleColor,position: 'relative'}}>▶</span>
          beforeTitleStyle = {marginLeft: 2}
        }
        else{
          prevTitle = <span onMouseDown={e =>{e.stopPropagation();PubSub.publish('expand-tab',{key:tab.key,val:true})}} className="tab-expand" style={{color:titleColor,verticalAlign: -3,position: 'relative'}}>▼</span>
          beforeTitleStyle = {marginLeft: 4}
        }
        beforeTitleCount++
      }

      if(this.props.verticalTabPanel){
        tabTiteleStyle.maxWidth =  `calc(100% - ${beforeTitleCount == 0 ? 54 : beforeTitleCount == 1 ? 66 : beforeTitleCount == 2 ? 80 : 98}px)`
      }

      let bgUrl = selected ? getTheme('images','theme_toolbar') : getTheme('images','theme_tab_background')
      let bgSize = !bgUrl ? null : selected ? getTheme('sizes','theme_toolbar') : getTheme('sizes','theme_tab_background')
      if(bgUrl) bgUrl = bgUrl.substring(4, bgUrl.length-1)
      const height = selected ? 29 : 28
      const bgSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${bgUrl ? `<pattern patternUnits="userSpaceOnUse"  id="imgpattern${tab.key}" x="0" y="0" width="${bgSize.width}" height="${bgSize.height}">
      <image width="${bgSize.width}" height="${bgSize.height}" xlink:href="${bgUrl}"/>
    </pattern>` : ""}
    <symbol id="topleft${tab.key}" viewBox="0 0 214 ${height}">
      <path d="M14.3 0.1L214 0.1 214 ${height} 0 ${height}C0 ${height} 12.2 2.6 13.2 1.1 14.3-0.4 14.3 0.1 14.3 0.1Z" fill="${bgUrl ? `url(#imgpattern${tab.key}` : bgColor}"></path>
    </symbol>
    <symbol id="topright${tab.key}" viewBox="0 0 214 ${height}">
      <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#topleft${tab.key}"></use>
    </symbol>
    <clipPath>
      <rect class="mask" width="100%" height="100%" x="0"></rect>
    </clipPath>
  </defs>
  <svg width="50%" height="100%" transfrom="scale(-1, 1)">
    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#topleft${tab.key}" width="214" height="${height}" class="chrome-tab-shadow"></use>
  </svg>
  <g transform="scale(-1, 1)">
    <svg width="50%" height="100%" x="-99%" y="0">
      <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#topright${tab.key}" width="214" height="${height}" class="chrome-tab-shadow"></use>
    </svg>
  </g>
</svg>`


      return (
        <li style={tabStyle} className={tabClasses} draggable
            key={`draggable_tabs_${tab.key}`}
            id={`draggable_tabs_${tab.key}`}
            data-id={t.wvId}
            data-key={tab.key}
            onDragStart={this.handleDragStart.bind(this, [t])}
            onDragEnter={::this.handleDragEnter}
            onDragLeave={this.handleDragLeave}
            onDragEnd={this.handleDragEnd.bind(this, [t])}
            onDrop={this.handleDrop.bind(this, t)}
            onMouseDown={this.handleTabClick.bind(this, tab.key)}
            onMouseUp={::this.handleTabMouseUp}
            onMouseEnter={onMouseHover}
            {...others}>
          {
            this.isMultistageTabsMode() || this.props.verticalTabPanel ?
              <div className="chrome-tab-background" style={
                {
                  backgroundColor: getTheme('images',selected ? 'theme_toolbar' : 'theme_tab_background' ) ? 'initial' :
                    selected ? sharedState.colorActiveBackground : unreadTab ? sharedState.colorUnreadBackground : sharedState.colorNormalBackground,
                  backgroundImage: getTheme('images',selected ? 'theme_toolbar' : 'theme_tab_background' ) || void 0,
                  height: tab.props.orgTab.tabPreview && this.tabPreviewHeight && this.tabPreviewHeight != 27 ? 'initial' : selected && !this.props.verticalTabPanel ? 28 : void 0
                }
              }>
                {tab.props.orgTab.tabPreview && ((this.tabPreviewHeight && this.tabPreviewHeight != 27) || this.props.verticalTabPanel) ?
                  <img style={{width: '100%',height: tabPreviewSlideHeight, marginTop:30}} src={tab.props.orgTab.tabPreview.dataURL}/> : null}
              </div> :
              <div className="chrome-tab-background" style={
                {
                  height: tab.props.orgTab.tabPreview && this.tabPreviewHeight && this.tabPreviewHeight != 27 ? 'initial' : selected && !this.props.verticalTabPanel ? 28 : void 0
                }
              }>
                <svg dangerouslySetInnerHTML={{__html: bgSvg }} />
                {tab.props.orgTab.tabPreview && this.tabPreviewHeight && this.tabPreviewHeight != 27 ? <img style={{width: '100%',height: 140,marginTop: -4}} src={tab.props.orgTab.tabPreview.dataURL}/> : null}
              </div>
          }
          {prevTitle}
          <Title parent={this} datas={{key:tab.key,k:this.props.k,tab:t,toggleNav:this.props.toggleNav,verticalTabPanel:this.props.verticalTabPanel,TabStyles:this.TabStyles,tabBeforeTitleClasses,beforeTitle,tabTiteleStyle,tabTitleClasses,extraAttribute,privateMode,lock,protect,mute,reloadInterval,title,beforeTitleStyle,selected}}/>
          {closeButton}
        </li>
      );
    });

    const modifyLeft = this.isMultistageTabsMode() ? 10 :13 * this.state.tabs.length
    this.TabStyles.tabAddButton.transform = this.isMultistageTabsMode() ? 'initial' : 'skewX(27deg)'
    this.TabStyles.tabAddButton.left = modifyLeft * -1

    if(this.props.toggleNav == 1){
      const thisNode = ReactDOM.findDOMNode(this)
      let prefix
      if(thisNode){
        const rdTabBar = thisNode.querySelector(".rdTabBar")
        prefix = rdTabBar.getAttribute("nav-width")
        rdTabBar.setAttribute("bar-margin",`${modifyLeft}px`)
      }
      tabInlineStyles.tabBar.width = `calc(${prefix || (this.props.isTopRight ? "45%" : "50%")} + ${this.isMultistageTabsMode() ? 0 : modifyLeft}px)`
    }
    else{
      tabInlineStyles.tabBar.width = `calc(100% + ${this.isMultistageTabsMode() ? 0 : modifyLeft - 8}px)`
    }

    if(this.props.toggleNav == 1){
      tabInlineStyles.tabBar.marginRight = modifyLeft
      // tabInlineStyles.tabBar.background = isFixedPanel(this.props.k) ? "#fafafa" : 'linear-gradient(to bottom, #eee, #ddd)'
      this.TabStyles.tabAddButton.marginTop = 3
    }
    else{
      this.TabStyles.tabAddButton.marginTop = 0
    }

    if(this.props.verticalTabPanel){
      tabInlineStyles.tabBar.flexDirection = 'column'
      this.TabStyles.tabAddButton.top = 2
      this.TabStyles.tabAddButton.display = 'flex'
      this.TabStyles.tabAddButton.width = '80%'
      this.TabStyles.tabAddButton.height = 17
      delete this.TabStyles.tabAddButton.left
      this.TabStyles.tabAddButton.marginLeft = 'auto'
      delete tabInlineStyles.tabBar.paddingTop
    }
    else{
      delete tabInlineStyles.tabBar.overflowY
      this.TabStyles.tabAddButton.top = 7
      this.TabStyles.tabAddButton.height = 16
      delete this.TabStyles.tabAddButton.display
      this.TabStyles.tabAddButton.width = 25
      this.TabStyles.tabAddButton.marginLeft = 14
      if(this.props.toggleNav == 0){
        tabInlineStyles.tabBar.paddingTop = sharedState.tabBarMarginTop
      }
      else{
        delete tabInlineStyles.tabBar.paddingTop
      }
    }


    return {_tabClassNames,tabInlineStyles,tabs,content}
  }

  componentDidUpdate() {
    // PubSub.publish('update-tabs',this.props.k)
    // this.addDropEvent()
    // this.setState({renders: this.buildRenderComponent()})
  }


  handleRemove(e) {
    console.log("handleRemove")
    // const _tabs = this.state.tabs
    // console.log(this.state.tabs,e)
    // this.props.onClose(e,this.state.tabs)
    //
    // const i = e.oldIndex
    // const key = _tabs.length > i ? _tabs[i].key : _tabs.length > 0 ? _tabs[i-1].key : null
    // this.props.onTabPositionChange(e, key, _tabs);
  }

  handleUpdate(e) {
    if(noUpdate) return
    const key = this.state.tabs[e.newIndex].key
    this.props.onTabPositionChange(e, key, this.state.tabs);
    this.setState({selectedTab:key});
    console.log("handleUpdate",e,this)
    ipc.send('chrome-tabs-onMoved-to-main',this.state.tabs[e.newIndex].props.orgTab.wvId,{fromIndex:e.oldIndex,toIndex:e.newIndex})

    const before = this.state.tabs[e.newIndex -1] ? this.state.tabs[e.newIndex -1].props.orgTab : void 0
    PubSub.publish('tab-moved',{tabId:this.state.tabs[e.newIndex].props.orgTab.wvId,fromIndex:e.oldIndex,toIndex:e.newIndex,before})
  }

  handleAdd(e) {
    if(noUpdate) return
    console.log("handleAdd")
    const key = this.state.tabs[e.newIndex].key
    const fromTab = this.state.tabs[e.newIndex].props.orgTab.wvId
    if(e.newIndex == 0){
      ipc.emit('chrome-tabs-move-inner',null,null,[fromTab],this.state.tabs[1].key,false,key)
    }
    else{
      ipc.emit('chrome-tabs-move-inner',null,null,[fromTab],this.state.tabs[e.newIndex-1].key,true,key)
    }
  }

  handleEnd(e) {
    console.log('handleEnd',e)
    noUpdate = false
    if(this.props.verticalTabTree){
      const ele = e.to.querySelector("li.vertical-selection")
      if(ele){
        noUpdate = true
        const current = e.item
        const tabId = parseInt(e.item.dataset.id)
        const parentTabId = parseInt(ele.dataset.id)
        const currentKey = e.item.dataset.key
        const toKey = ele.dataset.key

        ipc.emit('chrome-tabs-move-inner',null,null,[tabId],toKey,true,currentKey)
        PubSub.publish('tab-moved-child',{tabId, parentTabId})
      }
      for(let ele of e.to.querySelectorAll("li.vertical-selection")){
        ele.classList.remove("vertical-selection")
      }
      for(let ele of e.from.querySelectorAll("li.vertical-selection")){
        ele.classList.remove("vertical-selection")
      }
    }
    this.tabPreviewStop = false
    setTimeout(_=>PubSub.publish('drag-overlay',false),100)
  }

  handleWheel(e){
    const moveKey = e.deltaY * (reverseScrollTab ? -1 : 1) > 0 ? this._getNextTabKey(this.state.selectedTab) : this._getPrevTabKey(this.state.selectedTab)
    if(moveKey){
      this.props.onTabSelect(e, moveKey, this.state.tabs,true);
    }
  }

  handleTabClick(key, e) {
    this.tabPreviewStop = true
    PubSub.publish('tab-preview-update',true)
    console.log(e)
    if(!e.nativeEvent) e.nativeEvent = e
    if(e.nativeEvent.which == 3){
      this.handleContextMenu(key, e)
      return
    }
    if(e.nativeEvent.which == 2){
      if(middleClickTab == 'closeTab'){
        this.handleCloseButtonClick(key, e)
      }
      else if(middleClickTab != 'clicktabNothing'){
        const items = this.props.mouseClickHandles(key)
        const item = items.find(i=>(i.t || i.label) == middleClickTab)
        if(item) item.click()
      }
      return
    }
    if(e.altKey){
      if(altClickTab != 'clicktabNothing'){
        const items = this.props.mouseClickHandles(key)
        const item = items.find(i=>(i.t || i.label)== altClickTab)
        if(item) item.click()
      }
      return
    }
    // PubSub.publish('drag-overlay',true)

    this.enableMulti = [e,key]
    if(e.ctrlKey || e.metaKey || e.shiftKey){
      return
    }

    const classes = (e.target.getAttribute('class') || '').split(' ');
    if (classes.indexOf('rdTabCloseIcon') > -1 || (e.target.closest('.nav-menu-audio') && e.target.tagName != 'INPUT')) {
      this._cancelEventSafety(e);
    }
    else {
      let selected,tabFilpFunc
      if(tabFlipLabel){
        this.mouseUp = false
        selected = this.state.selectedTab == key
        tabFilpFunc = _=>{
          if(tabFlipLabel && selected){
            console.log(this.props.parent.state.selectedKeys)
            for(let key2 of this.props.parent.state.selectedKeys.slice(0).reverse()){
              if(key != key2 && this.props.parent.state.tabs.find(t=>t.key == key2)){
                if(this.mouseUp){
                  this.mouseUp = false
                  this.setState({ selectedTab: key2 }, () => {
                    this.props.onTabSelect(e, key2, this._getCurrentOpenTabs());
                  })
                }
                else{
                  this.mouseUpSelect = key2
                }
                return
              }
            }
          }
        }
      }

      if(doubleClickTab == 'clicktabNothing'){
        tabFilpFunc && tabFilpFunc()
      }
      else{
        this.clickCount++;
        if (this.clickCount === 1) {
          this.singleClickTimer = setTimeout(_=> {
            this.clickCount = 0
            tabFilpFunc && tabFilpFunc()
          }, 300)
        }
        else if (this.clickCount === 2) {
          clearTimeout(this.singleClickTimer)
          this.clickCount = 0
          const items = this.props.mouseClickHandles(key)
          const item = items.find(i=>(i.t || i.label)== doubleClickTab)
          if(item) item.click()
        }
      }

      this.setState({ selectedTab: key }, () => {
        this.props.onTabSelect(e, key, this._getCurrentOpenTabs());
      })
    }
  }

  handleTabMouseUp(e){
    this.tabPreviewStop = false
    setTimeout(_=>{
      const dom = ReactDOM.findDOMNode(this.refs.ttab)
      if(dom){
        dom.style['-webkit-app-region'] = 'drag'
      }

      PubSub.publish('drag-overlay',false)
      if(this.enableMulti) this.props.multiSelectionClick(...this.enableMulti)
      if(this.mouseUpSelect){
        const key = this.mouseUpSelect
        this.mouseUpSelect = void 0
        this.setState({ selectedTab: key }, () => {
          this.props.onTabSelect(e, key, this._getCurrentOpenTabs());
        })
      }
      else if(tabFlipLabel){
        this.mouseUp = true
      }
    },100)
  }

  handleContextMenu(key, e) {
    this.props.onTabContextMenu(e, key, this._getCurrentOpenTabs(),this)
  }


  handleCloseButtonClick(key, e) {
    const ev = this._cancelEventSafety(e);
    this.props.onTabClose(ev, key);
  }

  handleAddButtonMouseDown(e) {
    if(!e.nativeEvent) e.nativeEvent = e
    if(e.nativeEvent.which == 3){
      if(rightClickTabAdd != 'clicktabNothing'){
        const items = this.props.mouseClickHandles(this.state.selectedTab)
        const item = items.find(i=>(i.t || i.label) == rightClickTabAdd)
        if(item) item.click()
      }
    }
    else if(e.nativeEvent.which == 2){
      if(middleClickTabAdd != 'clicktabNothing'){
        const items = this.props.mouseClickHandles(this.state.selectedTab)
        const item = items.find(i=>(i.t || i.label) == middleClickTabAdd)
        if(item) item.click()
      }
    }
  }

  handleAddButtonClick(e) {
    if(!e.nativeEvent) e.nativeEvent = e
    if(e.altKey){
      if(altClickTabAdd != 'clicktabNothing'){
        const items = this.props.mouseClickHandles(this.state.selectedTab)
        const item = items.find(i=>(i.t || i.label)== altClickTabAdd)
        if(item) item.click()
      }
      return
    }
    this.props.resetSelection()
    this.props.onTabAddButtonClick(e, this._getCurrentOpenTabs(),openTabNextLabel);
  }

  handleStart(e){
    isMove=false
  }

  handleMove(e){
    console.log("handleMove",this.props.k,e)
    isMove=true
    PubSub.publishSync('tab-move',this.props.k)
  }

  moveRight(e) {
    let nextSelected = this._getNextTabKey(this.state.selectedTab);
    if (!nextSelected) {
      nextSelected = this.props.tabs[0] ? this.props.tabs[0].key : '';
    }
    if (nextSelected !== this.state.selectedTab) {
      this.setState({ selectedTab: nextSelected }, () => {
        this.props.onTabSelect(e, nextSelected, this._getCurrentOpenTabs());
      });
    }
  }

  moveLeft(e) {
    let nextSelected = this._getPrevTabKey(this.state.selectedTab);
    if (!nextSelected) {
      nextSelected = _.last(this.props.tabs) ? _.last(this.props.tabs).key : '';
    }
    if (nextSelected !== this.state.selectedTab) {
      this.setState({ selectedTab: nextSelected }, () => {
        this.props.onTabSelect(e, nextSelected, this._getCurrentOpenTabs());
      });
    }
  }

  getCloseButton(tab, style, classes, hoverStyleBase) {
    if (tab.props.disableClose) {
      return '';
    }
    let onHoverStyle = StyleOverride.merge(
      hoverStyleBase, (tab.props.tabStyles || {}).tabCloseIconOnHover);
    return (<CloseIcon
      style={style}
      hoverStyle={onHoverStyle}
      className={classes}
      onClick={this.handleCloseButtonClick.bind(this, tab.key)}>&times;</CloseIcon>);
  }

  handleDragEnd(tabs,evt) {
    ReactDOM.findDOMNode(this.refs.ttab).style['-webkit-app-region'] = 'drag'
    console.log("handleDragEnd",Date.now())
    mainState.set('dragData',null)

    const overlayElement = document.querySelector('.tabs-layout-overlay-wrapper.visible')
    const overlayClassList = overlayElement && [...overlayElement.classList]
    this.tabPreviewStop = false
    PubSub.publish('drag-overlay',false)


    for(let ele of document.querySelectorAll(".div-back.front")){
      ele.classList.remove("front")
    }

    this.props.resetSelection()
    for(let ele of document.querySelectorAll(".chrome-tab-selection,.chrome-tab-drag,.vertical-selection")){
      ele.classList.remove("chrome-tab-selection")
      ele.classList.remove("chrome-tab-drag")
      setTimeout(_=>ele.classList.remove("vertical-selection"))
    }

    if(!overlayClassList){
      const contentEle = document.getElementById("content")
      for(let ele of contentEle.querySelectorAll(this.props.toggleNav == 1 ? ".navbar-main" : ".rdTabBar")){
        const rect = ele.getBoundingClientRect()
        if(rect.left <= evt.clientX && evt.clientX <= rect.left + rect.width &&
          rect.top <= evt.clientY && evt.clientY <= rect.top + rect.height) return
      }
      if(isMove) return
    }


    evt.stopPropagation()
    evt.preventDefault()

    const selectionTabs = this.state.tabs.filter(t=>t.props.selection)
    if(selectionTabs.length > 0) tabs = null

    setTimeout(_=>{
        if(overlayClassList){
          console.log(overlayClassList)
          const [type,droppedKey,droppedTabKey] = [overlayClassList[2],overlayClassList[3].slice(1),overlayClassList[4].slice(1)]
          console.log({type,dropTabs:this.props.parent.state.tabs,dropTabKey:tabs[0].key,droppedKey,droppedTabKey})
          PubSub.publish('drag-split',{type,dropTabKeys:tabs.map(t=>t.key),droppedKey})
          return
        }

        if(ipc.sendSync('get-sync-main-state','stopDragEnd')){
          mainState.set('stopDragEnd',false)
          return
        }

        console.log("handleDragEnd2",Date.now())

        if(selectionTabs.length > 0){
          tabs = []
          for(let t of this.state.tabs){
            if (this.state.closedTabs.has(t.key) || !t.props.selection) continue
            tabs.push(t.props.orgTab)
          }
        }
        else if(!tabs){
          tabs = []
          for(let t of this.state.tabs){
            if (this.state.closedTabs.has(t.key)) continue
            tabs.push(t.props.orgTab)
          }
        }


        if(this.state.tabs.length == tabs.length && this.props.isOnlyPanel) return
        console.log(evt,tabs,this.state.tabs)
        if(evt.dataTransfer.dropEffect == "move") return
        const vals = tabs.map(tab=>{
          ipc.send('move-browser-view', this.props.k, tab.key, 'detach')
          const d = {wvId:tab.wvId,c_page:tab.page,c_key:tab.key,privateMode:tab.privateMode,tabPreview:tab.tabPreview,pin:tab.pin,protect:tab.protect,lock:tab.lock,mute:tab.mute,fields:tab.fields,reloadInterval:tab.reloadInterval,
            rest:{rSession:tab.rSession,wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis},guestInstanceId: tab.wvId}
          ipc.send('chrome-tabs-onDetached-to-main',d.wvId,{oldPosition: this.state.tabs.findIndex(t=>t.key==d.c_key)})
          return d
        })
        const winId = ipc.sendSync('browser-load',{id:remote.getCurrentWindow().id,x:evt.screenX,y:evt.screenY,tabParam:JSON.stringify(vals)})
      }
      ,100)

  }

  handleDrop(tab,evt) {
    console.log("handleDrop",Date.now())
    ReactDOM.findDOMNode(this.refs.ttab).style['-webkit-app-region'] = 'drag'
    mainState.set('stopDragEnd',true)
    evt.stopPropagation()
    evt.preventDefault()

    for(let ele of document.querySelectorAll(".chrome-tab-drag")){
      ele.classList.remove("chrome-tab-drag")
    }

    const cont = getWebContents(tab)
    if(cont){
      const dropData = evt.dataTransfer.getData("text/html")
      let data
      try{
        data = JSON.parse(dropData)
      }catch(e){
        data = JSON.parse(dropData.split('>')[1])
      }
      const trans = data.trans
      const winId = this.props.windowId
      if(trans[0].windowId !== winId){
        this.props.createNewTabFromOtherWindow(tab,trans)
      }
      else if((data.addButton && trans[0].k != this.props.k) || data.selection){
        console.log(transfer[trans[0].k],trans[0].k)
        if(transfer[trans[0].k]){
          const fromTabs = transfer[trans[0].k].map(t=>t.wvId)
          if(!fromTabs.includes(tab.wvId))
            ipc.emit('chrome-tabs-move-inner',null,null,fromTabs,tab.key,true)

          delete transfer[trans[0].k]
        }
        else{
          console.log("missing")
        }
      }
    }
  }

  handleDragLeave(evt){
    evt.preventDefault();
    const mouseEle = document.elementFromPoint(evt.clientX,evt.clientY)
    const closest = evt.target.closest('.chrome-tab-drag')
    if(mouseEle.closest('.chrome-tab-drag') == closest) return
    if(closest){
      const classList = closest.classList
      if (classList.contains('chrome-tab-drag') ) {
        classList.remove("chrome-tab-drag")
      }
    }
    // evt.stopPropagation()
  }
  handleDragEnter(evt){
    evt.preventDefault()
    ReactDOM.findDOMNode(this.refs.ttab).style['-webkit-app-region'] = 'no-drag'
    const dragData = ipc.sendSync('get-sync-main-state','dragData')
    if(!dragData) return
    console.log(134,dragData.windowId == this.props.windowId,this.props.k == dragData.k,dragData.tabs,dragData)
    if(dragData.windowId == this.props.windowId){
      if(dragData.tabs) return
    }
    console.log(evt,evt.target)
    const closest = evt.target.closest('.chrome-tab')
    if(!closest) return
    const classList = closest.classList
    if (classList.contains('chrome-tab') && !classList.contains('chrome-tab-drag') ) {
      classList.add("chrome-tab-drag")
    }
    // evt.stopPropagation();
    // evt.preventDefault()
  }

  handlePanelDragOver(e) {
    console.log(1)
    console.log(document.elementFromPoint(e.clientX,e.clientY))
  }

  handleDragStart(tabs,evt) {
    const selectionTabs = this.state.tabs.filter(t=>t.props.selection)
    if(selectionTabs.length > 0) tabs = null
    isMove=false
    mainState.set('stopDragEnd',false)
    mainState.set('dragData',{tabs:!!tabs,windowId: this.props.windowId,k:this.props.k})
    for(let ele of document.querySelectorAll(".div-back")){
      if(!ele.classList.contains("front")) ele.classList.add("front")
    }
    // evt.preventDefault()
    // this.props.parent.setState({})
    console.log("dragstart,tabs")
    // evt.stopPropagation()
    // evt.preventDefault()

    if(tabs) {
      PubSub.publish('drag-overlay', true)
    }

    let addButton = false,selection = false
    if(selectionTabs.length > 0){
      evt.stopPropagation()
      tabs = []
      selection = true
      for(let t of this.state.tabs){
        if (this.state.closedTabs.has(t.key) || !t.props.selection) continue
        tabs.push(t.props.orgTab)
      }
      transfer[this.props.k] = tabs
    }
    else if(!tabs){
      addButton = true
      tabs = []
      for(let t of this.state.tabs){
        console.log(1,t)
        if (this.state.closedTabs.has(t.key)) continue
        console.log(2,t)
        tabs.push(t.props.orgTab)
      }
      console.log(this.props.k,tabs)
      transfer[this.props.k] = tabs
      console.log(transfer)
    }

    const data = []
    for(let tab of tabs){
      const cont = getWebContents(tab)
      if(cont){
        data.push({k: this.props.k,key:tab.key,windowId:this.props.windowId ,guestInstanceId: cont.guestInstanceId})
      }
    }
    if(data.length > 0){
      evt.dataTransfer.setData("text/html", JSON.stringify({addButton,selection,trans:data}))
    }
    else{
      evt.dataTransfer.setData("text/html", "{}")
    }
  }

  setHeight(height){
    if(height < 0) height = 0
    if(height > tabPreviewSlideHeight && !this.isMultistageTabsMode()) height = tabPreviewSlideHeight
    this.tabPreviewHeight = height + 27
    tabPreviewHeight = height + 27
    this.props.parent.setState({})
  }

  render() {
    const {_tabClassNames,tabInlineStyles,tabs,content} = this.buildRenderComponent()
    const background = !sharedState.theme ? getTheme('colors','frame') : `${getTheme('images','theme_frame')} ${getTheme('images','theme_frame') ? (getTheme('colors','frame') || 'initial') : ''}`

    const tabBaseStyle = this.props.toggleNav == 2 ? {display: 'none'} :
      this.props.toggleNav == 3 ? {
          height: 27,
          background,
          borderBottom: '1px solid rgba(0, 0, 0, 0.27)',
          zIndex: 2,
          position: 'absolute',
          width: '100%'
        }:
        this.isMultistageTabsMode() ?
          {
            height : !this.props.verticalTabPanel && this.tabPreviewHeight && this.tabPreviewHeight != 27 ? this.tabPreviewHeight : void 0,
            background,
            borderBottom: '1px solid rgba(0, 0, 0, 0.27)',
          } :
          this.props.toggleNav == 1 ? {} :
            {
              height: (this.tabPreviewHeight || 27) + sharedState.tabBarMarginTop,
              background,
              borderBottom: '1px solid rgba(0, 0, 0, 0.27)',
            }

    if(this.props.verticalTabPanel){
      tabBaseStyle.paddingTop = 5
      tabBaseStyle.paddingBottom = 5
    }
    if( this.props.toggleNav != 3 && tabBarHide && !this.props.verticalTabPanel){
      tabBaseStyle.display = 'none'
    }
    else if(this.props.toggleNav != 2){
      tabBaseStyle.display = 'inherit'
    }

    const previews = Object.values(this.tabPreviews)
    const preview = previews.length && previews[previews.length - 1]
    const bgImage = getTheme('images','theme_tab_background' ) || void 0

    return (
      <div style={tabInlineStyles.tabWrapper} className={_tabClassNames.tabWrapper} ref="div"
           onDragOver={(e)=>{e.preventDefault();return false}} onDrop={(e)=>{e.preventDefault();return false}}
           onKeyDown={this.props.onKeyDown}>
        {(!this.tabPreviewHeight || this.tabPreviewHeight == 27) && preview ? <div style={{
          position: 'fixed',
          zIndex: 9999999,
          width:tabPreviewSizeWidth || preview.tabPreview.width,
          height: preview.tabPreview ? Math.round((tabPreviewSizeWidth || preview.tabPreview.width) * (tabPreviewSizeHeight || preview.tabPreview.height / preview.tabPreview.width)) : tabPreviewSlideHeight,
          left: preview.left + (tabPreviewSizeWidth || preview.tabPreview.width) > window.innerWidth ? (void 0) : preview.left,
          right: preview.left + (tabPreviewSizeWidth || preview.tabPreview.width) > window.innerWidth ? 0 : (void 0),
          top: preview.top + 27 + (document.elementFromPoint(preview.left + 40, preview.top + 25).className.includes("preview-img-input") ? 38 : 0),
          backgroundImage: preview.tabPreview ? `url(${preview.tabPreview.dataURL})` : 'none',
          backgroundColor: '#fbfbfb',
          backgroundSize: `${tabPreviewSizeWidth || preview.tabPreview.width}px ${preview.tabPreview ? Math.round((tabPreviewSizeWidth || preview.tabPreview.width) * (tabPreviewSizeHeight || preview.tabPreview.height / preview.tabPreview.width)) : tabPreviewSlideHeight}px`,
          backgroundRepeat: 'no-repeat'
        }}/> : null}
        <div className={`tab-base${this.props.toggleNav == 3 ? ' full-screen visible transition' : ''}`} style={tabBaseStyle}>
          <ul tabIndex="-1" style={tabInlineStyles.tabBar} className={_tabClassNames.tabBar} ref="ttab"
              onDoubleClick={isDarwin ? _=>{
                const win = remote.getCurrentWindow()
                if(win.isFullScreen()){}
                else if(win.isMaximized()){
                  // win.unmaximize()
                  win.nativeWindow.showWindow(9)
                }
                else{
                  // win.maximize()
                  win.nativeWindow.showWindow(3)
                }
              }: null}
            // onMouseDown={e=>{
            //   if(e.button != 0) return
            //   const mup = e =>{
            //     if(e.button != 0) return
            //     ipc.send('drag-window', false)
            //   }
            //   document.addEventListener('mouseup',mup,{once: true})
            // }}
              onScroll={e=>{e.preventDefault();e.target.scrollTo(0,0)}}>
            {isDarwin && this.props.isTopRight && this.props.toggleNav != 1 && !document.querySelector('.vertical-tab.left') ? <div style={{width: this.props.fullscreen ? 0 : 62}}/>  : ""}
            {tabs}
            <span ref="addButton" draggable="true" className="rdTabAddButton"
                  style={{...this.TabStyles.tabAddButton, backgroundImage: bgImage, backgroundColor: !sharedState.theme ? sharedState.colorNormalBackground : bgImage ? 'initial' : void 0}}
                  onClick={this.handleAddButtonClick.bind(this)} onMouseDown={this.handleAddButtonMouseDown.bind(this)}
                  onDragStart={this.handleDragStart.bind(this, null)} onDragEnd={this.handleDragEnd.bind(this, null)}>
              {this.props.verticalTabPanel ? <i className="fa fa-plus" aria-hidden="true"  style={{marginLeft: 'auto', marginRight: 'auto', fontSize: 13, padding: 2}}/> : null}
              {this.props.tabAddButton}
            </span>
            {this.props.isMaximize && this.props.toggleNav != 1 ? <div className="title-button-set" style={{lineHeight: 0.9}}>
                {isDarwin ? null : <span className={`fa fa-th ${sharedState.arrange == 'all' ? 'active-arrange' : ''}`} onClick={_=>PubSub.publish('toggle-arrange')}></span>}
                {displayFullIcon ? <span className={this.props.toggleNav == 3 ? "typcn typcn-arrow-minimise" : "typcn typcn-arrow-maximise"} onClick={_=>ipc.send('toggle-fullscreen')}></span> : null}
                <span className="typcn typcn-media-stop-outline" onClick={()=>this.props.parent.maximizePanel()}></span>
              </div>
              : null}
            {isFloatPanel(this.props.k)  && this.props.toggleNav != 1 ? <div className="title-button-set" style={{lineHeight: 0.9, transform: `translateX(${this.isMultistageTabsMode() ? 1 : - this.state.tabs.length * 13 + 6}px)`}}>
              <span className="typcn typcn-media-stop-outline" onClick={()=>PubSub.publish(`maximize-float-panel_${this.props.k}`)}></span>
              <span className="typcn typcn-times" onClick={()=>PubSub.publish(`close-panel_${this.props.k}`)}></span>
            </div> : null}
            {!isDarwin && !this.props.isMaximize && this.props.isTopRight && this.props.toggleNav != 1 ? <RightTopBottonSet displayFullIcon={displayFullIcon} toggleNav={this.props.toggleNav} style={{
              marginTop: (this.props.verticalTabPanel ||this.props.toggleNav == 3 || this.isMultistageTabsMode()) ? void 0 : sharedState.tabBarMarginTop * -1, transform: `translateX(${this.isMultistageTabsMode() ? 1 : - this.state.tabs.length * 13 + 6}px)`}}/>: ""}
          </ul>
        </div>
        {this.props.toggleNav == 1 || !sharedState.tabPreview ? null : <ToolbarResizer height={this.tabPreviewHeight ? this.tabPreviewHeight - 27 : 0} setHeight={::this.setHeight}/>}
        {content}
      </div>
    );
  }
}
reactMixin(Tabs.prototype,SortableMixin)

Tabs.defaultProps = {
  tabsClassNames: {
    tabWrapper: '',
    tabBar: '',
    tab: '',
    tabBeforeTitle: '',
    tabTitle: '',
    tabCloseIcon: '',
    tabActive: '',
    tabHover: '',
  },
  tabsStyles: {},
  shortCutKeys: {},
  tabAddButton: undefined,
  onTabSelect: () => {},
  onClose: () => {},
  onTabClose: () => {},
  onTabContextMenu: () => {},
  onTabAddButtonClick: () => {},
  onTabPositionChange: () => {},
  onKeyDown: () => {},
  shouldTabClose: () => true,
  keepSelectedTab: false,
  disableDrag: false,
  width: "100%",
};

export default Tabs;
