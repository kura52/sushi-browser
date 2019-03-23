const React = require('react')
const {Component} = React
const PubSub = require('./pubsub')
const {BrowserPage} = require("./browserPage")
const ReactDOM = require('react-dom')
const _ = require("lodash")
const sharedState = require('./sharedState')
const {tabState} = require('./databaseRender')


export default class WebPageList extends Component{
  constructor(props) {
    super(props)
    this.state = {l:{},del_nodes:new Set()}
  }


  componentDidMount() {
    this.mount = true
    const tokenCreate = PubSub.subscribe("webview-create",(msg,x)=>{
      if(!this.mount) return
      const obj = {l: this.state.l}
      if(!this.state.del_nodes.has(x.key)){
        obj.l[x.key] = x.val
      }
      this.setState(obj)
    })

    const tokenClose = PubSub.subscribe("tab-close",(msg,x)=>{
      if(!this.mount) return
      const obj = {l: this.state.l}
      delete obj.l[x.key]
      this.state.del_nodes.add(x.key)
      this.setState(obj)
    })

    const tokenFloatPanel = PubSub.subscribe('float-panel-focus',(msg,key)=>{
      if(!this.mount) return
      this.setState({floatKey: key})

    })

    this.setState({tokens: [tokenCreate,tokenClose,tokenFloatPanel]})
  }

  componentWillUnmount() {
    this.mount = false
    this.state.tokens.forEach(x => PubSub.unsubscribe(x));
  }

  //
  //   for (var key in this.state) {
  //     if (this.state.hasOwnProperty(key)) {
  //       var value = this.state[key];
  //       for (var key2 in value) {
  //         if (value.hasOwnProperty(key2)) {
  //           var value2 = value[key2];
  //
  //         }
  //       }
  //     }
  //   }
  //
  //   const ret = !(this.isActive === nextProps.isActive &&
  //   this.isSearching === nextProps.page.isSearching &&
  //   this.location === nextProps.page.location &&
  //   this.statusText === nextProps.page.statusText)
  //
  //   this.isActive = this.props.isActive
  //   this.isSearching = this.props.page.isSearching
  //   this.location = this.props.page.location
  //   this.statusText = this.props.page.statusText
  //   return ret
  // }


  render() {
    const {notLoadTabUntilSelected,allSelectedkeys,tabBarMarginTop} = sharedState
    let arr = []
    const list = this.state.l
    // console.log(list)
    for (var key in list) {
      if (list.hasOwnProperty(key)) {
        var value = list[key];
        for (var key2 in value) {
          if (value.hasOwnProperty(key2)) {
            const datas = value[key2];
            let style={}
            const tab = datas.tab
            if(datas.ref){
              const pos = datas.ref
              let modify = 30 + datas.modify
              if(datas.navbar){
                const style = datas.navbar.style
                if(style.display == "none" || style.position == "sticky" || style.visibility == "hidden"){
                  modify = datas.modify
                }
              }
              style = datas.isActive ? {position: "absolute",
                top: pos.top + modify,
                left: pos.left,
                width: pos.width,
                height: pos.height - modify,
                // display: "inline-flex",
                zIndex: datas.isMaximize ? 6 : datas.float ? this.state.floatKey == key ? 6 : 4 : 1
              } : {
                // position: "absolute",
                // // top: `${pos.top + modify}px`,
                // // left: `${pos.left}px`,
                // flex: "0 1",
                // width: "0px",
                // height: "0px"
                // // width: `${pos.width}px`,
                // // height: `${pos.height - modify}px`,
                zIndex: -1,
                visibility: sharedState.arrange || (sharedState.tabPreview && (datas.getCapture || sharedState.tabPreviewRecent)) ? "initial" : "hidden",
                position: "absolute",
                top: pos.top + modify,
                left: pos.left,
                width: pos.width,
                height: pos.height - modify,
              }
            }
            const notLoadPage = notLoadTabUntilSelected && !allSelectedkeys.has(tab.key) && !tab.wvId
            arr.push([tab.key,
              <div className={`browser-page-wrapper ${datas.isActive ? "visible" : "visible"}`} style={style} key={tab.key}>
                {notLoadPage ? null :<BrowserPage ref={`page-${tab.key}`} k={tab.key} k2={key} {...tab.pageHandlers}
                                                  index={datas.index} toggleNav={datas.toggleNav} tab={tab} pageIndex={0} isActive={datas.isActive} pos={style}/>}
              </div>])
            if(notLoadPage && !tab.recorded){
              tabState.findOne({tabKey:tab.key}).then(rec=>{
                if(!rec){
                  tab.recorded = true
                  const location = tab.page.location
                  tabState.insert({tabKey:tab.key,titles:location,urls:location,currentIndex:0,close:1,updated_at: Date.now()}).then(_=>_)
                }
              })
            }
          }
        }
      }
    }
    // console.log(arr.map(x=>x[0]).join("\t"));
    arr = _.sortedUniqBy(_.sortBy(arr.filter(x => x[0] !== undefined), x => x[0]), x => x[0]);
    // console.log(arr.map(x=>x[0]).join("\t"));
    // arr.forEach(x=>console.log(x))
    return <div>{arr.map(x=>x[1])}</div>
  }
}
