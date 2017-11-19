window.debug = require('debug')('info')
// require('debug').enable("info")
import process from './process'
import {ipcRenderer as ipc} from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import Selection from '../render/react-selection/indexTable'

const ReactDataGrid = require('react-data-grid');
const {
  Draggable: { Container: DraggableContainer,RowActionsCell, DropTargetRowContainer },
  Data: { Selectors }
} = require('react-data-grid-addons');


const baseURL = 'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd'

function downloadingItemReply(callback){
  ipc.on('download-progress', (event, item) => {
    callback(item,event.sender)
  })
}

function fetchDownload(range){
  console.log("fetchDownload",range)
  ipc.send('fetch-download',range)
}

function searchDownload(cond){
  ipc.send('search-download',cond)
}

function downloadReply(callback){
  ipc.on('download-reply', (event, data) => {
    callback(data)
  })
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function round(val, precision) {
  const digit = Math.pow(10, precision)
  return Math.round(val * digit) / digit
}

function getAppropriateByteUnit(byte){
  if(byte / 1024 < 1){
    return [byte,"B"]
  }
  else if(byte / 1024 / 1024 < 1){
    return [round(byte /1024,2),"KB"]
  }
  else if(byte / 1024 / 1024 / 1024 < 1){
    return [round(byte /1024 / 1024 ,2),"MB"]
  }
  return [round(byte /1024 / 1024 / 1024,2), "GB"]
}


function getAppropriateTimeUnit(time){
  if(time / 60 < 1){
    return [Math.round(time),"s"]
  }
  else if(time / 60 / 60 < 1){
    return [Math.round(time /60),"m",Math.round(time % 60),"s"]
  }
  else if(time / 60 / 60 / 24 < 1){
    return [Math.round(time / 60 / 60),"h",Math.round((time / 60) % 60),"m"]
  }
  return [Math.round(time / 60 / 60 / 24),"d",Math.round((time/60/60) % 24),"h"]
}

function calcSpeed(item){
  const diff =item.now - item.created_at
  const percent = round(item.receivedBytes / item.totalBytes * 100,1)
  const speed = item.receivedBytes / diff * 1000
  const restTime = (item.totalBytes - item.receivedBytes) / speed

  return {diff,percent,speed,restTime}
}


function formatDate(longDate) {
  const date = new Date(longDate)
  return `${date.getFullYear()}/${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`
};

// Custom Formatter component
function PercentCompleteFormatter(props){
  const percentComplete = `${props.value}%`
  return <div className="progress">
    <div className={`progress-bar ${props.value == 100 ? 'bg-success' : ''}`} role="progressbar"
         aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style={{width: percentComplete,justifyContent: props.value < 25 ? 'baseline' : void 0}}>
      {percentComplete == '0%' ? '' : percentComplete}
    </div>
  </div>
}

const columns = [
  { key: 'menu', name: 'Menu', resizable: true,  width: 80 },
  { key: 'name', name: 'Name', resizable: true, sortable: true, width: 250 },
  { key: 'progress', name: 'Progress', resizable: true, sortable: true, formatter: PercentCompleteFormatter, width: 150 },
  { key: 'size', name: 'Size', resizable: true, sortable: true, width: 80 },
  { key: 'est', name: 'Est. Time', resizable: true, sortable: true, width: 90 },
  { key: 'speed', name: 'Speed', resizable: true, sortable: true, width: 80 },
  { key: 'starttime', name: 'Start Time',resizable: true, sortable: true, width:150 },
  { key: 'url', name: 'URL', resizable: true, sortable: true },
]
const RowRenderer = DropTargetRowContainer(ReactDataGrid.Row);


class ContextMenu extends React.Component {
  onRowDelete = (e, data) => {
    if (typeof(this.props.onRowDelete) === 'function') {
      this.props.onRowDelete(e, data);
    }
  };

  onRowInsertAbove = (e, data) => {
    if (typeof(this.props.onRowInsertAbove) === 'function') {
      this.props.onRowInsertAbove(e, data);
    }
  };

  onRowInsertBelow = (e, data) => {
    if (typeof(this.props.onRowInsertBelow) === 'function') {
      this.props.onRowInsertBelow(e, data);
    }
  };

  render() {
    return (
      <ContextMenu>
        <MenuItem data={{rowIdx: this.props.rowIdx, idx: this.props.idx}} onClick={this.onRowDelete}>Delete Row</MenuItem>
        <SubMenu title="Insert Row">
          <MenuItem data={{rowIdx: this.props.rowIdx, idx: this.props.idx}} onClick={this.onRowInsertAbove}>Above</MenuItem>
          <MenuItem data={{rowIdx: this.props.rowIdx, idx: this.props.idx}} onClick={this.onRowInsertBelow}>Below</MenuItem>
        </SubMenu>
      </ContextMenu>
    );
  }
}

class Downloader extends React.Component {
  static defaultProps = { rowKey: 'id' };

  constructor(props,context) {
    super(props,context);
    this.state = {downloads: new Map(), rows: [], selectedIds: [],columns };
  }

  componentDidMount(){
    window.addEventListener('resize',_=>this.setState());

    downloadingItemReply((item,sender)=>{
      item.sender = sender
      item.created_at = item.startTime
      console.log(item,item.startTime,this.state.rows.findIndex(x=>x.id === item.created_at))
      if(this.state.downloads.has(item.created_at)){
        this.state.rows[this.state.rows.findIndex(x=>x.id === item.created_at)] = this.buildItem(item)
      }
      else{
        this.state.rows.unshift(this.buildItem(item))
      }
      this.state.downloads.set(item.created_at,item)
      this.setState({})
    })

    downloadReply((data,flag)=>{
      let num = 0
      for(let item of data){
        const has = this.state.downloads.has(item.created_at)
        if(!has || num<1000){
          this.state.downloads.set(item.created_at,item)
          if(has){
            this.state.rows[this.state.rows.findIndex(x=>x.id === item.created_at)] = this.buildItem(item)
          }
          else{
            this.state.rows.push(this.buildItem(item))
          }
          num++
        }
      }
      this.setState({})
    })
    fetchDownload({})
  }

  rowGetter = (i) => {
    return this.state.rows[i];
  }

  isDraggedRowSelected = (selectedRows, rowDragSource) => {
    if (selectedRows && selectedRows.length > 0) {
      let key = this.props.rowKey;
      return selectedRows.filter(r => r[key] === rowDragSource.data[key]).length > 0;
    }
    return false;
  }

  handleGridSort = (sortColumn, sortDirection) => {
    const comparer = sortDirection === 'ASC' ?
      (a, b) => a[sortColumn] > b[sortColumn] ? 1 : -1 :
      (a, b) => a[sortColumn] < b[sortColumn] ? 1 : -1

    const rows = sortDirection === 'NONE' ? this.state.originalRows.slice(0) : this.state.rows.sort(comparer);
    this.setState({rows});
  }

  reorderRows = (e) => {
    let selectedRows = Selectors.getSelectedRowsByKey({rowKey: this.props.rowKey, selectedKeys: this.state.selectedIds, rows: this.state.rows});
    let draggedRows = this.isDraggedRowSelected(selectedRows, e.rowSource) ? selectedRows : [e.rowSource.data];
    let undraggedRows = this.state.rows.filter(r=>draggedRows.indexOf(r) === -1);
    let args = [e.rowTarget.idx, 0].concat(draggedRows);
    Array.prototype.splice.apply(undraggedRows, args);
    this.setState({rows: undraggedRows});
  }

  // onHeaderDrop = (source, target) => {
  //   const stateCopy = Object.assign({}, this.state);
  //   const columnSourceIndex = this.state.columns.findIndex(i => i.key === source);
  //   const columnTargetIndex = this.state.columns.findIndex(i => i.key === target);
  //
  //   stateCopy.columns.splice(columnTargetIndex,0,stateCopy.columns.splice(columnSourceIndex, 1)[0]);
  //
  //   const emptyColumns = Object.assign({},this.state, { columns: [] });
  //   this.setState(emptyColumns)
  //
  //   const reorderedColumns = Object.assign({},this.state, { columns: stateCopy.columns });
  //   this.setState(reorderedColumns)
  // }

  onRowClick = (rowIdx, row,_, e)=>{
    console.log(rowIdx, row,_, e)
    if(!e || (!e.ctrlKey && !e.shiftKey)) this.clearSelect()

    if(e.shiftKey && this.state.selectedIds.length){
      const prevId = this.state.selectedIds[this.state.selectedIds.length - 1]
      const prevInd = this.state.rows.findIndex(x=>x.id === prevId)
      const min = rowIdx == prevInd ? rowIdx : prevInd < rowIdx ? prevInd + 1 : rowIdx
      const max = rowIdx == prevInd ? rowIdx : prevInd < rowIdx ? rowIdx : prevInd - 1
      for(let i = min;i<=max;i++){
        const row = this.state.rows[i]
        let ind = this.state.selectedIds.findIndex(r => r == row[this.props.rowKey]);
        if(ind == -1){
          this.state.selectedIds.push(row[this.props.rowKey])
        }
        else{
          this.state.selectedIds.splice(ind,1)
        }
      }
    }
    else{
      let ind = this.state.selectedIds.findIndex(r => r == row[this.props.rowKey]);
      if(ind == -1){
        this.state.selectedIds.push(row[this.props.rowKey])
      }
      else{
        this.state.selectedIds.splice(ind,1)
      }
    }


    this.setState({})
  }

  onRowsSelected = (rows) => {
    this.state.selectedIds.push(...rows.map(r => r.row[this.props.rowKey]))
    this.setState({selectedIds: this.state.selectedIds});
  }

  onRowsDeselected = (rows) => {
    let rowIds = rows.map(r =>  r.row[this.props.rowKey]);
    this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 )});
  }

  play(item){
    if(item.state == "cancelled"){
      ipc.send("download-retry", item.url, item.savePath) //元アイテムを消す
    }
    else{
      ipc.send("download-pause", item)
    }
  }

  getMenuIcons(item){
    const arr = []
    if(!(item.state == "completed" || (item.state == "progressing" && !item.isPaused))){
      arr.push(<i onClick={_=>this.play(item)} className="fa fa-play-circle-o menu-item" aria-hidden="true"></i>)
    }
    if(item.state == "progressing" && !item.isPaused){
      arr.push(<i onClick={_=>ipc.send("download-pause",item)} className="fa fa-pause-circle-o menu-item" aria-hidden="true"></i>)
    }
    if(item.state != "completed" && item.state != "cancelled"){
      arr.push(<i onClick={_=>ipc.send("download-cancel", item)} className="fa fa-trash-o menu-item" aria-hidden="true"></i>)
    }
    arr.push(<i onClick={_=>ipc.send("download-open-folder", item.savePath)} className="fa fa-folder-o menu-item" aria-hidden="true"></i>)
    if(item.state != "cancelled"){
      arr.push(<i onClick={_=>ipc.send("download-open",item)} className="fa fa-file-o menu-item" aria-hidden="true"></i>)
    }
    return arr
  }

  buildItem(item) {
    const rest = calcSpeed(item)
    const isProgress = item.state == "progressing" && !!rest.restTime

    return {
      id: item.created_at,
      menu: this.getMenuIcons(item),
      name: item.filename,
      size: item.totalBytes ? `${getAppropriateByteUnit(item.totalBytes).join(" ")}` : '-',
      progress: isProgress ? rest.percent : item.state == "completed" ? 100 : 0,
      est: isProgress ? `${getAppropriateTimeUnit(rest.restTime).join(" ")}` : '-',
      speed: isProgress ? `${item.speed ||getAppropriateByteUnit(rest.speed).join(" ")}/s` : '-',
      starttime: formatDate(item.created_at),
      url: item.url
    }
  }

  afterSelect = (selectedTargets) =>{
    console.log('afterSelect',selectedTargets)
    if(selectedTargets.length == 0) return

    for(let ele of selectedTargets){
      const cl = ele.classList
      cl.contains('row-selected')
      cl.remove('row-selected2')
      const key = parseInt(ele.parentNode.className.slice(1))
      const ind = this.state.selectedIds.findIndex(x=>x == key)
      if(ind == -1){
        this.state.selectedIds.push(key)
      }
      else{
        this.state.selectedIds.splice(ind,1)
      }
    }
    this.setState({selectedIds: this.state.selectedIds})
  }

  clearSelect = () =>{
    console.log('clearSelect')
    this.setState({selectedIds:[]})
  }

  getSelectedMap = ()=>{
    const map = {}
    for(let x of this.state.selectedIds){
      const item = this.state.downloads.get(x)
      map[item.savePath] = item
    }
    return map
  }

  handleStart = ()=>{
    for(let item of Object.values(this.getSelectedMap())){
      if(item.state == "completed" || (item.state == "progressing" && !item.isPaused)) continue
      if(item.state == "cancelled"){
        ipc.send("download-retry", item.url, item.savePath) //元アイテムを消す
      }
      else{
        ipc.send("download-pause", item)
      }
    }
  }

  handlePause = ()=>{
    for(let item of Object.values(this.getSelectedMap())){
      if(item.state == "progressing" && !item.isPaused){
        ipc.send("download-pause",item)
      }
    }
  }

  handleCancel = ()=>{
    for(let item of Object.values(this.getSelectedMap())){
      if(item.state != "completed" && item.state != "cancelled"){
        ipc.send("download-cancel", item)
      }
    }
  }

  handleOpenFolder = ()=>{
    for(let path of Object.keys(this.getSelectedMap())){
      ipc.send("download-open-folder", path)
    }
  }

  handleOpenFile = ()=>{
    for(let item of Object.values(this.getSelectedMap())){
      if(item.state != "cancelled") ipc.send("download-open",item)
    }
  }


  render() {
    return  (
      <Selection ref="select" target=".react-grid-Row" selectedClass="row-selected2"
                 afterSelect={this.afterSelect} clearSelect={this.clearSelect}>
        <nav className="navbar navbar-light bg-faded">
          <form className="form-inline">
            <button onClick={_=>this.handleStart()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-play-circle-o" aria-hidden="true"></i>Start
            </button>
            <button onClick={_=>this.handlePause()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-pause-circle-o" aria-hidden="true"></i>Pause
            </button>
            <button onClick={_=>this.handleCancel()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-trash-o" aria-hidden="true"></i>Remove Selected
            </button>
            <button className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-window-close" aria-hidden="true"></i>Remove All Finished
            </button>
            <button onClick={_=>this.handleOpenFolder()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-folder-o" aria-hidden="true"></i>Show Folder
            </button>
            <button onClick={_=>this.handleOpenFile()} className="btn btn-sm align-middle btn-outline-secondary" type="button">
              <i className="fa fa-file-o" aria-hidden="true"></i>Open File
            </button>
          </form>
        </nav>
        <DraggableContainer>
          {/*onHeaderDrop={this.onHeaderDrop}>*/}
          <ReactDataGrid
            onGridSort={this.handleGridSort}
            // enableCellSelection={true}
            rowActionsCell={RowActionsCell}
            columns={this.state.columns}
            rowGetter={this.rowGetter}
            rowsCount={this.state.rows.length}
            minHeight={window.innerHeight - 44}
            rowHeight={24}
            rowRenderer={<RowRenderer onRowDrop={this.reorderRows}/>}
            onRowClick={this.onRowClick}
            rowSelection={{
              showCheckbox: false,
              onRowsSelected: this.onRowsSelected,
              onRowsDeselected: this.onRowsDeselected,
              selectBy: {
                keys: {rowKey: this.props.rowKey, values: this.state.selectedIds}
              }
            }}/>
        </DraggableContainer>
      </Selection>);
  }
}

ReactDOM.render(<Downloader/>,  document.getElementById('app'))