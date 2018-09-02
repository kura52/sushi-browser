window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'node-uuid';
import path from 'path';

import ReactTable from 'react-table';

const l10n = require('../../brave/js/l10n')
l10n.init()

function showDialog(input,id){
  return new Promise((resolve,reject)=>{
    const key = uuid.v4()
    ipc.send('show-dialog-exploler',key,input,id)
    ipc.once(`show-dialog-exploler-reply_${key}`,(event,ret)=>{
      resolve(ret)
    })
  })
}

function deleteAllItems(){
  showDialog({
    normal: true,
    title: l10n.translation('confirm'),
    text: 'Are you sure you want to delete all input histories?',
    buttons:[l10n.translation('yes'),l10n.translation('no')]
  }).then(value => {
    ipc.send('delete-input-history',{})
  })
}

function formatDate(longDate) {
  const date = new Date(longDate)
  return `${date.getFullYear()}/${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`
}


class InputHistorySetting extends React.Component {
  static defaultProps = { rowKey: 'id' };

  constructor(props,context) {
    super(props,context);
    this.columns = [
      { accessor: 'menu', Header: '#', Cell: this.getMenuIcons, resizable: true, minWidth: 10, maxWidth: 30 },
      { accessor: 'time', Header: 'Time',resizable: true, sortable: true,filterable:true, minWidth:10, maxWidth:140  },
      { accessor: 'host', Header: 'Host', Cell: this.getHostIcons, resizable: true, sortable: true,filterable:true, minWidth: 20, maxWidth: 240 },
      { accessor: 'value', Header: 'Value', resizable: true, sortable: true,filterable:true, minWidth: 30, maxWidth: 420 },
      { accessor: 'selector', Header: 'Selector', resizable: true, sortable: true,filterable:true, minWidth: 20, maxWidth: 420 },
      { accessor: 'url', Header: 'URL', resizable: true, sortable: true,filterable:true, minWidth: 30, maxWidth: 520 },
    ]
    this.state = {rows: [], selectedIds: []};
  }

  updateData(){
    this.state.rows = []
    const key = uuid.v4()
    ipc.send('get-input-history',key)
    ipc.once(`get-input-history-reply_${key}`,(e,data)=>{
      for(let history of data){
        this.state.rows.push(this.buildItem(history))
      }
      this.setState({data: this.state.rows.slice(0)})
    })
  }

  componentDidMount(){
    this.updateData()
    document.querySelector('.rt-tbody').style.height = `calc(100vh - 106px - ${document.querySelector('.navbar').offsetHeight}px)`
    window.addEventListener('resize',_=>{
      document.querySelector('.rt-tbody').style.height = `calc(100vh - 106px - ${document.querySelector('.navbar').offsetHeight}px)`
    });

  }

  componentWillUnmount() {
  }

  getMenuIcons = (props)=>{
    const item = props.value
    const arr = []
    arr.push(<i onClick={_=>{
      ipc.send('delete-input-history',{_id: item._id})
      this.updateData()
    }} className="fa fa-times menu-item" aria-hidden="true"></i>)
    return arr
  }


  getHostIcons = (props)=>{
    const item = props.value
    const arr = [<span>{item.host}</span>]
    arr.push(<i style={{paddingLeft: '5px'}} onClick={_=>{
      ipc.send('delete-input-history',{host: item.host})
      this.updateData()
    }} className="fa fa-times menu-item" aria-hidden="true"></i>)
    return arr
  }

  buildItem(item) {
    item.value = JSON.parse(item.value)
    let value = [], selector = []
    for(let x of item.value){
      if(x.tag == 'select'){
        value.push(JSON.parse(x.value).map(x=>x.text).join(" | "))
      }
      else{
        value.push(x.value)
      }
      selector.push(x.optSelector)
    }
    return {
      id: item._id,
      menu: item,
      host: item,
      value: value.join(" || "),
      url: item.frameUrl,
      selector: selector.join(" || "),
      time: formatDate(item.now)
    }
  }

  render() {
    return  (
      <span>
        <nav className="navbar navbar-light bg-faded">
          <form className="form-inline">
            <button onClick={_=>deleteAllItems()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-window-close" aria-hidden="true"></i>Delete All Input History
            </button>
          </form>
        </nav>
        <ReactTable
          pageSizeOptions={[30,100,250,500,1000]}
          defaultPageSize={100}
          data={this.state.rows.slice(0)}
          defaultFilterMethod={(filter, row, column) => {
            const id = filter.pivotId || filter.id
            return row[id] !== undefined ? String(row[id]).includes(filter.value) : true
          }}
          columns={this.columns}
        />
      </span>);
  }
}

ReactDOM.render(<InputHistorySetting/>,  document.getElementById('app'))