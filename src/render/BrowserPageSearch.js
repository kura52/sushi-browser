const React = require('react')
const {Component} = React

export default class BrowserPageSearch extends Component {
  componentDidUpdate(prevProps) {
    if (!prevProps.isActive && this.props.isActive)
      this.refs.input.focus()

    if(prevProps.isActive && !this.props.isActive){
      this.props.onClose()
      this.refs.input.value = ""
    }
  }
  // shouldComponentUpdate: function (nextProps, nextState) dd{
  //   return (this.props.isActive != nextProps.isActive)
  // },
  onKeyDown(e) {
    if (e.keyCode == 13) {
      e.preventDefault()
      this.props.onPageSearch(e.target.value)
    }
  }
  onChange(e) {
    e.preventDefault()
    this.props.onPageSearch(this.refs.input.value)
  }
  onClickPrev(e){
    e.preventDefault()
    this.props.onPageSearch(this.refs.input.value,false)
  }
  render() {
    return <div className={(this.props.isActive ? 'visible' : 'hidden')+" browser-page-search"}>
      <input className="search-text" ref="input" type="text" placeholder="Search..." onKeyDown={::this.onKeyDown} onChange={::this.onChange}/>
      <a className="search-button" href="#"><i className="search-next fa fa-angle-up" style={{fontSize: "1.5em",lineHeight: "1.2",height:"30px"}} onClick={::this.onClickPrev}></i></a>
      <a className="search-button" href="#"><i className="search-prev fa fa-angle-down" style={{fontSize: "1.5em",lineHeight: "1.3",height:"30px"}} onClick={::this.onChange}></i></a>
      <a className="search-button" href="#"><div className="search-close" style={{lineHeight: "1.5",height:"30px"}} onClick={this.props.onClose}>☓</div></a>
      <span className="search-num">{this.props.progress}</span>
    </div>
  }
}