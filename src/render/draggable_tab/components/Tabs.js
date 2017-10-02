import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom'
import invariant from 'invariant';
import classNames from 'classnames';
import Mousetrap from 'mousetrap';

import TabStyles from './TabStyles';
import TabContainer from './TabContainer';
import CloseIcon from './CloseIcon';

import StyleOverride from '../helpers/styleOverride';
import Utils from '../helpers/utils';

import SortableMixin from './react-mixin-sortable'
import reactMixin  from 'react-mixin'

import RightTopBottonSet from '../../RightTopBottonSet'
import PubSub from '../../pubsub'

const {remote} = require('electron')
const BrowserWindowPlus = remote.require('./BrowserWindowPlus')
const mainState = remote.require('./mainState')
const {alwaysOnTop} = require('../../browserNavbar')

const isDarwin = navigator.userAgent.includes('Mac OS X')
const bgSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg"><defs><symbol id="topleft" viewBox="0 0 214 29"><path d="M14.3 0.1L214 0.1 214 29 0 29C0 29 12.2 2.6 13.2 1.1 14.3-0.4 14.3 0.1 14.3 0.1Z"></path></symbol><symbol id="topright" viewBox="0 0 214 29"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#topleft"></use></symbol><clipPath id="crop"><rect class="mask" width="100%" height="100%" x="0"></rect></clipPath></defs><svg width="50%" height="100%" transfrom="scale(-1, 1)"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#topleft" width="214" height="29" class="chrome-tab-background"></use><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#topleft" width="214" height="29" class="chrome-tab-shadow"></use></svg><g transform="scale(-1, 1)"><svg width="50%" height="100%" x="-100%" y="0"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#topright" width="214" height="29" class="chrome-tab-background"></use><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#topright" width="214" height="29" class="chrome-tab-shadow"></use></svg></g></svg>`


function isFixedPanel(key){
  return key.startsWith('fixed-')
}

function getWebContents(tab){
  if(!tab.wv || !tab.wvId) return
  return global.currentWebContents[tab.wvId]
}

class Title extends React.Component {
  componentDidMount() {
    PubSub.subscribe(`tab-component-update_${this.props.datas.key}`,(msg,datas)=>{
      this.title = datas.title
      this.beforeTitle = datas.beforeTitle
      this.setState({})
    })
  }

  componentWillReceiveProps(nextProps) {
    this.title = nextProps.datas.title
    this.beforeTitle = nextProps.datas.beforeTitle
  }

  render(){
    const {key,TabStyles,tabBeforeTitleClasses,beforeTitle,tabTiteleStyle,tabTitleClasses,extraAttribute,privateMode,pin,title} = this.props.datas

    let m
    if(privateMode && (m = privateMode.match(/^persist:(\d+)$/))){
      m = m[1]
    }

    return <div style={{display:'unset'}}>
      <span style={TabStyles.beforeTitle} className={tabBeforeTitleClasses}>{this.beforeTitle || beforeTitle}</span>
      <p style={tabTiteleStyle}
         className={tabTitleClasses}
         {...extraAttribute} >
        {m ? <span className='private-mode'>[{m}]</span>: privateMode ? <i className="fa fa-eye-slash private-mode" ></i> : ""}
        {pin ? <i className="fa fa-thumb-tack pin-mode" ></i> : ""}
        {this.title || title}
      </p>
    </div>
  }

}

let isMove
let transfer = {}
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
    const hoveredTab = '';
    const closedTabs = new Set();
    const defaultState = {
      tabs,
      selectedTab,
      hoveredTab,
      closedTabs,
    };

    this.state = defaultState;
    this.tabs = []

    this.handlePanelDragOver = ::this.handlePanelDragOver
  }


  _tabStateFromProps(props) {
    const tabs = [];
    let idx = 0;
    props.tabs.forEach((tab) => {

      tabs[idx] = tab;
      idx++;
    });

    return {
      tabs,
    };
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


  shouldComponentUpdate(nextProps, nextState) {
    if (!this.noRender) return true
    this.noRender = false
    return false
  }

  componentDidMount() {
    const update = (_,e)=>{
      setTimeout(_=>this.setState({}),500)
    }
    this.tokenResizeWindow = PubSub.subscribe("resizeWindow",update)
    this.tokenResize = PubSub.subscribe("resize",update)

    this.bindShortcuts();

    if(mainState.scrollTab)
      this.refs.ttab.addEventListener('wheel',::this.handleWheel,{passive: true})
    // this.addDropEvent();

    this.token = PubSub.subscribe('tab-move',(msg,k)=>{
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
  }


  componentWillUnmount() {
    this.unbindShortcuts();
    PubSub.unsubscribe(this.token)
    delete transfer[this.props.k]
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
    // override inline tabs styles
    const tabInlineStyles = {};
    tabInlineStyles.tabWrapper = StyleOverride.merge(TabStyles.tabWrapper, this.props.tabsStyles.tabWrapper);
    tabInlineStyles.tabBar = StyleOverride.merge(TabStyles.tabBar, this.props.tabsStyles.tabBar);
    if(this.props.toggleNav == 1){
      tabInlineStyles.tabBar = StyleOverride.merge(tabInlineStyles.tabBar, {display: 'flex',position:'absolute',height: 30});
    }
    // else if(this.props.toggleNav == 3){
    //   tabInlineStyles.tabBar = StyleOverride.merge(tabInlineStyles.tabBar, {display: 'flex',position:'absolute',zIndex: 2});
    // }
    else {
      tabInlineStyles.tabBar.display = "flex"
      // const titleElements = document.getElementsByClassName("rdTabBar mfyTabBar")
      //   for (let i = 0; i < titleElements.length; i++) {
      //     titleElements[i].style.display = "flex"
      //   }
    }
    tabInlineStyles.tab = StyleOverride.merge(TabStyles.tab, this.props.tabsStyles.tab);
    tabInlineStyles.tabTitle = StyleOverride.merge(TabStyles.tabTitle, this.props.tabsStyles.tabTitle);
    tabInlineStyles.tabCloseIcon = StyleOverride.merge(TabStyles.tabCloseIcon, this.props.tabsStyles.tabCloseIcon);
    tabInlineStyles.tabCloseIconOnHover = StyleOverride.merge(TabStyles.tabCloseIconOnHover, this.props.tabsStyles.tabCloseIconOnHover);

    tabInlineStyles.tabActive = StyleOverride.merge(TabStyles.tabActive, this.props.tabsStyles.tabActive);
    tabInlineStyles.tabTitleActive = StyleOverride.merge(TabStyles.tabTitleActive, this.props.tabsStyles.tabTitleActive);
    tabInlineStyles.tabBeforeActive = StyleOverride.merge(TabStyles.tabBeforeActive, this.props.tabsStyles.tabBeforeActive);

    tabInlineStyles.tabOnHover = StyleOverride.merge(TabStyles.tabOnHover, this.props.tabsStyles.tabOnHover);
    tabInlineStyles.tabTitleOnHover = StyleOverride.merge(TabStyles.tabTitleOnHover, this.props.tabsStyles.tabTitleOnHover);

    // append tabs classNames
    const _tabClassNames = {};
    _tabClassNames.tabWrapper = classNames('rdTabWrapper', this.props.tabsClassNames.tabWrapper);
    _tabClassNames.tabBar = classNames('rdTabBar', this.props.tabsClassNames.tabBar);
    _tabClassNames.tab = classNames('rdTab', this.props.tabsClassNames.tab);
    _tabClassNames.tabTitle = classNames('rdTabTitle', this.props.tabsClassNames.tabTitle);
    _tabClassNames.tabBeforeTitle = classNames('rdTabBeforeTitle', this.props.tabsClassNames.tabBeforeTitle);
    _tabClassNames.tabCloseIcon = classNames('rdTabCloseIcon', this.props.tabsClassNames.tabCloseIcon);


    let content = [];
    let tabs = _.map(this.state.tabs, (tab,tabNum) => {
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
        ...others
      } = tab.props;

      const beforeTitle = <img className='favi' src={page.title && page.favicon !== 'loading' ? page.favicon : 'resource/l.svg'} onError={(e)=>{e.target.src = 'resource/file.png'}}/>
      const title = page.favicon !== 'loading' || page.titleSet  || page.location == 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/top.html' ? page.title : page.location

      console.log("tabs",title)

      containerStyle = containerStyle || {}
      tabStyles = tabStyles || {}
      tabClassNames = tabClassNames || {}
      // containerStyle.height = `calc(100% - ${this.props.toggleNav == 0 ? 27 : this.props.toggleNav == 1 ? 1 : 0}px)`
      containerStyle.height = `calc(100% - ${this.props.toggleNav == 0 ? 27 : 0}px)`

      // override inline each tab styles
      let tabStyle = StyleOverride.merge(tabInlineStyles.tab, tabStyles.tab);
      let tabTiteleStyle = StyleOverride.merge(tabInlineStyles.tabTitle, tabStyles.tabTitle);
      const tabCloseIconStyle = StyleOverride.merge(tabInlineStyles.tabCloseIcon, tabStyles.tabCloseIcon);

      let tabClasses = classNames(_tabClassNames.tab, tabClassNames.tab);
      let tabTitleClasses = classNames(_tabClassNames.tabTitle, tabClassNames.tabTitle);
      let tabBeforeTitleClasses = classNames(_tabClassNames.tabBeforeTitle, tabClassNames.tabBeforeTitle);
      const tabCloseIconClasses = classNames(_tabClassNames.tabCloseIcon, tabClassNames.tabCloseIcon);

      if (this.state.selectedTab === tab.key) {
        tabStyle = StyleOverride.merge(StyleOverride.merge(tabInlineStyles.tab, tabInlineStyles.tabActive), tabStyles.tabActive);
        tabTiteleStyle = StyleOverride.merge(StyleOverride.merge(tabInlineStyles.tabTitle, tabInlineStyles.tabTitleActive), tabStyles.tabTitleActive);
        tabClasses = classNames(tabClasses, 'rdTabActive', this.props.tabsClassNames.tabActive, tabClassNames.tabActive);
        content.push(<TabContainer key={`tabContainer#${tab.key}`} selected={true} style={containerStyle}>{tab}</TabContainer>);
      } else {
        if (this.state.hoveredTab === tab.key) {
          tabStyle = StyleOverride.merge(StyleOverride.merge(tabStyle, tabInlineStyles.tabOnHover), tabStyles.tabOnHover);
          tabTiteleStyle = StyleOverride.merge(StyleOverride.merge(tabTiteleStyle, tabInlineStyles.tabTitleOnHover), tabStyles.tabTitleOnHover);
          tabClasses = classNames(tabClasses, 'rdTabHover', this.props.tabsClassNames.tabHover, tabClassNames.tabHover);
        }
        content.push(
          <TabContainer key={`tabContainer#${tab.key}`} selected={false} style={containerStyle} hiddenStyle={hiddenContainerStyle}>{tab}</TabContainer>);
      }

      tabStyle = StyleOverride.merge(tabStyle, tabNum === 0 ? {marginLeft: this.props.toggleNav == 1 ? 0 : 10} : {left: -13 * tabNum});
      if(this.refs && this.refs[tab.key]){
        const li = ReactDOM.findDOMNode(this.refs[tab.key])
        if(tabNum === 0){
          li.style.marginLeft = `${tabStyle.marginLeft}px`
          li.style.left = '0px'
        }
        else{
          li.style.left = `${tabStyle.left}px`
          li.style['margin-left'] = null
        }
      }
      if(tab.props.selection){
        tabClasses = classNames(tabClasses,'chrome-tab-selection')
      }
      // if(this.props.toggleNav == 1){
      //   tabStyle.marginTop = 3
      // }
      // title will be shorten with inline style
      //  {
      //    overflow: 'hidden',
      //    whiteSpace: 'nowrap',
      //    textOverflow: 'ellipsis'
      //  }
      const extraAttribute = {};
      if (typeof title === 'string') {
        extraAttribute.title = title;
      }
      let closeButton = this.getCloseButton(tab, tabCloseIconStyle, tabCloseIconClasses, tabInlineStyles.tabCloseIconOnHover);

      // if(this.refs && this.refs[tab.key]){
      //   const width = this.refs[tab.key].offsetWidth
      //   tabTiteleStyle.width = width > 93 ? "100%" : width > 60 ? "120%" : "140%"
      // }

      const t = tab.props.orgTab
      return (
        <li style={tabStyle} className={tabClasses} draggable
            key={`draggable_tabs_${tab.key}`}
            onDragStart={this.handleDragStart.bind(this, [t])}
            onDragEnter={::this.handleDragEnter}
            onDragLeave={this.handleDragLeave}
            onDragEnd={this.handleDragEnd.bind(this, [t])}
            onDrop={this.handleDrop.bind(this, t)}
            onMouseDown={this.handleTabClick.bind(this, tab.key)}
            onMouseUp={_=>setTimeout(_=>{
              PubSub.publish('drag-overlay',false)
              if(this.enableMulti) this.props.multiSelectionClick(...this.enableMulti)
            },100)}
          // onContextMenu={this.handleContextMenu.bind(this, tab.key)}
            onMouseOver={()=>{
              if(this.state.hoveredTab != tab.key){
                this.setState({hoveredTab:tab.key})
              }
            }}
            onMouseOut={()=>this.setState({hoveredTab:undefined})}
            ref={tab.key}
            {...others}>
          <div className="chrome-tab-background">
            <svg dangerouslySetInnerHTML={{__html: bgSvg }} />
          </div>
          <Title datas={{key:tab.key,TabStyles,tabBeforeTitleClasses,beforeTitle,tabTiteleStyle,tabTitleClasses,extraAttribute,privateMode,pin,title}}/>
          {closeButton}
        </li>
      );
    });

    const modifyLeft = 13 * this.state.tabs.length
    TabStyles.tabAddButton.left = modifyLeft * -1
    if(this.props.toggleNav == 1){
      const thisNode = ReactDOM.findDOMNode(this)
      let prefix
      if(thisNode){
        const rdTabBar = thisNode.querySelector(".rdTabBar")
        prefix = rdTabBar.getAttribute("nav-width")
        rdTabBar.setAttribute("bar-margin",`${modifyLeft}px`)
      }
      // console.log(33,`${prefix || (this.props.toggleNav == 1 && this.props.isTopRight ? "calc(45%" : "calc(50%")} + ${modifyLeft}px)`)
      // console.log(78,prefix)
      tabInlineStyles.tabBar.width = `calc(${prefix || (this.props.toggleNav == 1 && this.props.isTopRight ? "45%" : "50%")} + ${modifyLeft}px)`
    }
    else{
      tabInlineStyles.tabBar.width = `calc(100% + ${modifyLeft}px - 8px)`
    }

    if(this.props.toggleNav == 1){
      tabInlineStyles.tabBar.marginRight = modifyLeft
      // tabInlineStyles.tabBar.background = isFixedPanel(this.props.k) ? "#fafafa" : 'linear-gradient(to bottom, #eee, #ddd)'
      TabStyles.tabAddButton.marginTop = 3
    }
    else{
      TabStyles.tabAddButton.marginTop = 0
    }
    return {_tabClassNames,tabInlineStyles,tabs,content}
  }

  componentDidUpdate() {
    // this.addDropEvent()
    // this.setState({renders: this.buildRenderComponent()})
  }


  bindShortcuts() {
    if (this.props.shortCutKeys) {
      if (this.props.shortCutKeys.close) {
        Mousetrap.bind(this.props.shortCutKeys.close, (e) => {
          const ev = this._cancelEventSafety(e);
          if (this.state.selectedTab) {
            this.handleCloseButtonClick(this.state.selectedTab, ev);
          }
        });
      }
      if (this.props.shortCutKeys.create) {
        Mousetrap.bind(this.props.shortCutKeys.create, (e) => {
          const ev = this._cancelEventSafety(e);
          this.handleAddButtonClick(ev);
        });
      }
      if (this.props.shortCutKeys.moveRight) {
        Mousetrap.bind(this.props.shortCutKeys.moveRight, (e) => {
          const ev = this._cancelEventSafety(e);
          this.moveRight(ev);
        });
      }
      if (this.props.shortCutKeys.moveLeft) {
        Mousetrap.bind(this.props.shortCutKeys.moveLeft, (e) => {
          const ev = this._cancelEventSafety(e);
          this.moveLeft(ev);
        });
      }
    }
  }

  unbindShortcuts() {
    Mousetrap.reset();
  }

  handleRemove(e) {
    console.log("handleRemove")
    const _tabs = this.state.tabs
    console.log(this.state.tabs,e)
    this.props.onClose(e,this.state.tabs)

    const i = e.oldIndex
    // const key = _tabs.length > i ? _tabs[i].key : _tabs.length > 0 ? _tabs[i-1].key : null
    // this.props.onTabPositionChange(e, key, _tabs);
  }

  handleUpdate(e) {
    const key = this.state.tabs[e.newIndex].key
    this.props.onTabPositionChange(e, key, this.state.tabs);
    this.setState({selectedTab:key});
    console.log("handleUpdate",e,this)
  }

  handleAdd(e) {
    console.log("handleAdd")
    const key = this.state.tabs[e.newIndex].key
    this.props.onTabAddOtherContainer(e, key, this.state.tabs);
    this.props.onTabPositionChange(e, key, this.state.tabs);

    this.setState({selectedTab:key});

  }

  handleEnd(e) {
    setTimeout(_=>PubSub.publish('drag-overlay',false),100)
  }

  handleWheel(e){
    const moveKey = e.deltaY > 0 ? this._getNextTabKey(this.state.selectedTab) : this._getPrevTabKey(this.state.selectedTab)
    if(moveKey){
      this.props.onTabSelect(e, moveKey, this.state.tabs,true);
    }
  }

  handleTabClick(key, e) {
    if(!e.nativeEvent) e.nativeEvent = e
    if(e.nativeEvent.which == 3){
      this.handleContextMenu(key)
      return
    }
    if(e.nativeEvent.which == 2){
      this.handleCloseButtonClick(key, e)
      return;
    }
    // PubSub.publish('drag-overlay',true)

    this.enableMulti = [e,key]
    if(e.ctrlKey || e.metaKey || e.shiftKey){
      return
    }

    const classes = (e.target.getAttribute('class') || '').split(' ');
    if (classes.indexOf('rdTabCloseIcon') > -1) {
      this._cancelEventSafety(e);
    } else {
      this.setState({ selectedTab: key }, () => {
        this.props.onTabSelect(e, key, this._getCurrentOpenTabs());
      });
    }
  }

  handleContextMenu(key, e) {
    this.props.onTabContextMenu(e, key, this._getCurrentOpenTabs(),this)
  }


  handleCloseButtonClick(key, e) {
    const ev = this._cancelEventSafety(e);
    this.props.onTabClose(ev, key);
  }

  handleAddButtonClick(e) {
    // console.log("handleAddButtonClick")
    this.props.resetSelection()
    this.props.onTabAddButtonClick(e, this._getCurrentOpenTabs());
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
    console.log("handleDragEnd",Date.now())
    mainState.set('dragData',null)

    const overlayElement = document.querySelector('.tabs-layout-overlay-wrapper.visible')
    const overlayClassList = overlayElement && [...overlayElement.classList]
    PubSub.publish('drag-overlay',false)

    for(let ele of document.querySelectorAll(".div-back.front")){
      ele.classList.remove("front")
    }


    const contentEle = document.getElementById("content")
    for(let ele of contentEle.querySelectorAll(this.props.toggleNav == 1 ? ".navbar-main" : ".rdTabBar")){
      const rect = ele.getBoundingClientRect()
      if(rect.left <= evt.clientX && evt.clientX <= rect.left + rect.width &&
        rect.top <= evt.clientY && evt.clientY <= rect.top + rect.height) return
    }

    if(isMove) return

    const selectionTabs = this.state.tabs.filter(t=>t.props.selection)
    if(selectionTabs.length > 0) tabs = null

    setTimeout(_=>{
        if(mainState.stopDragEnd){
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

        if(overlayClassList){
          console.log(overlayClassList)
          const [type,droppedKey,droppedTabKey] = [overlayClassList[2],overlayClassList[3].slice(1),overlayClassList[4].slice(1)]
          console.log({type,dropTabs:this.props.parent.state.tabs,dropTabKey:tabs[0].key,droppedKey,droppedTabKey})
          PubSub.publish('drag-split',{type,dropTabKeys:tabs.map(t=>t.key),droppedKey})
          return
        }

        if(this.state.tabs.length < 2 && this.props.isOnlyPanel) return
        console.log(evt,tabs,this.state.tabs)
        if(evt.dataTransfer.dropEffect == "move") return
        if(tabs.length == 1){
          const tab = tabs[0]
          getWebContents(tab).detach(_=>{
            BrowserWindowPlus.load({id:remote.getCurrentWindow().id,dropX:evt.screenX,dropY:evt.screenY,alwaysOnTop: alwaysOnTop[0],
              tabParam:JSON.stringify([{wvId:tab.wvId,c_page:tab.page,c_key:tab.key,privateMode:tab.privateMode,pin:tab.pin,
                rest:{wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis},guestInstanceId: tab._guestInstanceId || getWebContents(tab).guestInstanceId}])})
            setTimeout(_=>{
              PubSub.publish('include-key',tab.key)
              const token = PubSub.subscribe(`include-key-reply_${tab.key}`,(msg,k)=>{
                PubSub.publish(`close_tab_${k}`, {key:tab.key})
                PubSub.unsubscribe(token)
              })
            },100)
          })
        }
        else{
          const promises = tabs.map(tab=>{
            return new Promise((resolve,reject)=>{
              getWebContents(tab).detach(_=>{
                resolve({wvId:tab.wvId,c_page:tab.page,c_key:tab.key,privateMode:tab.privateMode,pin:tab.pin,
                  rest:{wvId:tab.wvId,openlink: tab.openlink,sync:tab.sync,syncReplace:tab.syncReplace,dirc:tab.dirc,ext:tab.ext,oppositeMode:tab.oppositeMode,bind:tab.bind,mobile:tab.mobile,adBlockThis:tab.adBlockThis},guestInstanceId: tab._guestInstanceId || getWebContents(tab).guestInstanceId})
              })
            })
          })
          Promise.all(promises).then(vals=>{
            BrowserWindowPlus.load({id:remote.getCurrentWindow().id,x:evt.screenX,y:evt.screenY,tabParam:JSON.stringify(vals)})
            console.log(5435,vals)
            for(let val of vals) PubSub.publish(`close_tab_${this.props.k}`, {key: val.c_key})
          })
        }
      }
      ,100)

  }

  handleDrop(tab,evt) {
    console.log("handleDrop",Date.now())
    mainState.set('stopDragEnd',true)
    evt.stopPropagation()
    evt.preventDefault()
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
          this.props.handleTabAddOtherPanel(tab.key,transfer[trans[0].k])
          if(data.addButton){
            PubSub.publish(`close-panel_${trans[0].k}`)
          }
          else{
            for(let t of transfer[trans[0].k]){
              PubSub.publish(`close_tab_${trans[0].k}`, {key: t.key})
            }
          }
          delete transfer[trans[0].k]
        }
        else{
          console.log("missing")
        }
      }
    }
  }

  handleDragLeave(evt){
    const classList = evt.target.classList
    if (classList.contains('chrome-tab-drag') ) {
      classList.remove("chrome-tab-drag")
    }
  }
  handleDragEnter(evt){
    const dragData = mainState.dragData
    if(!dragData) return
    console.log(134,dragData.windowId == this.props.windowId,this.props.k == dragData.k,dragData.tabs,dragData)
    if(dragData.windowId == this.props.windowId){
      if(this.props.k == dragData.k || dragData.tabs) return
    }
    console.log(evt,evt.target)
    const classList = evt.target.classList
    if ( classList.contains('chrome-tab') && !classList.contains('chrome-tab-drag') ) {
      classList.add("chrome-tab-drag")
    }
    evt.preventDefault();
    evt.stopPropagation();
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

  render() {
    const {_tabClassNames,tabInlineStyles,tabs,content} = this.buildRenderComponent()
    console.log("tabs-rend",tabs)
    return (
      <div style={tabInlineStyles.tabWrapper} className={_tabClassNames.tabWrapper} ref="div"
           onDragOver={(e)=>{e.preventDefault();return false}} onDrop={(e)=>{e.preventDefault();return false}}
           onKeyDown={this.props.onKeyDown}>
        <div className="tab-base" style={this.props.toggleNav == 2 ? {display: 'none'} :
          this.props.toggleNav == 3 ? {
              height: 27,
              background: 'rgb(221, 221, 221)',
              borderBottom: '1px solid #aaa',
              zIndex: 2,
              position: 'absolute',
              width: '100%'
            }:
            this.props.toggleNav == 1 ? {} :
              {
                height: 27,
                background: 'rgb(221, 221, 221)',
                borderBottom: '1px solid #aaa',
              }}>
          <ul tabIndex="-1" style={tabInlineStyles.tabBar} className={_tabClassNames.tabBar} ref="ttab"
              onDoubleClick={isDarwin ? _=>{
                const win = remote.getCurrentWindow()
                if(win.isFullScreen()){}
                else if(win.isMaximized()){
                  win.unmaximize()
                }
                else{
                  win.maximize()
                }
              }: null}>
            {isDarwin && this.props.isTopRight && this.props.toggleNav != 1 ? <div style={{width: this.props.fullscreen ? 0 : 62}}/>  : ""}
            {tabs}
            <span ref="addButton" draggable="true" className="rdTabAddButton"
                  style={Object.assign({},TabStyles.tabAddButton)} onClick={this.handleAddButtonClick.bind(this)}
                  onDragStart={this.handleDragStart.bind(this, null)} onDragEnd={this.handleDragEnd.bind(this, null)}>
              {this.props.tabAddButton}
            </span>
            {!isDarwin && this.props.isTopRight && this.props.toggleNav != 1 ? <RightTopBottonSet style={{transform: `translateX(-${this.state.tabs.length * 13 - 6}px)`}}/>: ""}
          </ul>
        </div>
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

// Tabs.propTypes = {
//   tabs: React.PropTypes.arrayOf(React.PropTypes.element),
//
//   selectedTab: React.PropTypes.string,
//   tabsClassNames: React.PropTypes.shape({
//     tabWrapper: React.PropTypes.string,
//     tabBar: React.PropTypes.string,
//     tab: React.PropTypes.string,
//     tabBeforeTitle: React.PropTypes.string,
//     tabTitle: React.PropTypes.string,
//     tabCloseIcon: React.PropTypes.string,
//     tabActive: React.PropTypes.string,
//     tabHover: React.PropTypes.string,
//   }),
//   tabsStyles: React.PropTypes.shape({
//     tabWrapper: React.PropTypes.object,
//     tabBar: React.PropTypes.object,
//     tab: React.PropTypes.object,
//     tabTitle: React.PropTypes.object,
//     tabActive: React.PropTypes.object,
//     tabTitleActive: React.PropTypes.object,
//     tabOnHover: React.PropTypes.object,
//     tabTitleOnHover: React.PropTypes.object,
//     tabBeforeOnHover: React.PropTypes.object,
//     tabCloseIcon: React.PropTypes.object,
//     tabCloseIconOnHover: React.PropTypes.object,
//   }),
//   shortCutKeys: React.PropTypes.shape({
//     close: React.PropTypes.oneOfType(
//       [React.PropTypes.string, React.PropTypes.arrayOf(React.PropTypes.string)]),
//     create: React.PropTypes.oneOfType(
//       [React.PropTypes.string, React.PropTypes.arrayOf(React.PropTypes.string)]),
//     moveRight: React.PropTypes.oneOfType(
//       [React.PropTypes.string, React.PropTypes.arrayOf(React.PropTypes.string)]),
//     moveLeft: React.PropTypes.oneOfType(
//       [React.PropTypes.string, React.PropTypes.arrayOf(React.PropTypes.string)]),
//   }),
//   tabAddButton: React.PropTypes.element,
//   onTabSelect: React.PropTypes.func,
//   onClose: React.PropTypes.func,
//   onTabClose: React.PropTypes.func,
//   onTabContextMenu: React.PropTypes.func,
//   onTabAddButtonClick: React.PropTypes.func,
//   onTabPositionChange: React.PropTypes.func,
//   onKeyDown: React.PropTypes.func,
//   createNewTabFromOtherWindow: React.PropTypes.func,
//   shouldTabClose: React.PropTypes.func,
//   keepSelectedTab: React.PropTypes.bool,
//   disableDrag: React.PropTypes.bool,
//   width: React.PropTypes.string,
//   isTopRight: React.PropTypes.bool,
// };

export default Tabs;
