const glob = require("glob")
const fs = require("fs")

const files = ['../node_modules/react-sticky','../node_modules/semantic-ui-react','../node_modules/react-table']

for(let f of files){
  for(let js of glob.sync(`${f}/**/*.js`)){
    reactToInferno(js)
    // if(f.includes('react-data-grid-addons')){
    //   dataGridAddons(js)
    // }
    // else if(f.includes('react-data-grid')){
    //   dataGrid(js)
    // }
  }
}

function reactToInferno(file){
  const datas = fs.readFileSync(file).toString()
  if(datas.match(/require\(['"]react['"]\)|require\(['"]react\-dom['"]\)|from +?['"]react['"]|from +?['"]react\-dom['"]/)){
    console.log(file)
    const result = datas.replace(/require\(['"]react['"]\)|require\(['"]react\-dom['"]\)/g,"require('inferno-compat')")
      .replace(/from +?['"]react['"]|from +?['"]react\-dom['"]/g,"from 'inferno-compat'")
    fs.writeFileSync(file,result)
  }
}

// function dataGridAddons(file){
//   const datas = fs.readFileSync(file).toString()
//   const result = datas.replace(`	      return connectDropTarget(_react2['default'].createElement(
// 	        'div',
// 	        null,`,
//     `	      return connectDropTarget(_react2['default'].createElement(
// 	        'div',
//           {className: \`a\${this.props.row.id}\`},`)
//     .replace(`	    return connectDragSource(_react2['default'].createElement(
// 	      'div',
// 	      null,
// 	      _react2['default'].createElement('div', { className: 'rdg-drag-row-handle', style: rowHandleStyle }),
// 	      !isSelected ? this.renderRowIndex() : null,
// 	      rowSelection != null && _react2['default'].createElement(
// 	        'div',
// 	        { className: editorClass },
// 	        _react2['default'].createElement(CheckboxEditor, { column: this.props.column, rowIdx: this.props.rowIdx, dependentValues: this.props.dependentValues, value: this.props.value })
// 	      )
// 	    ));`,
//       `	    return connectDragSource(_react2['default'].createElement(
// 	      'div',
// 	      null,
// 	      _react2['default'].createElement('div', { className: 'rdg-drag-row-handle' }),
// 	      this.renderRowIndex(),
// 	      null
// 	    ));`)
//   fs.writeFileSync(file,result)
// }
//
// function dataGrid(file){
//   const datas = fs.readFileSync(file).toString()
//   const result = datas.replace(`this.props.onRowClick(cell.rowIdx, this.props.rowGetter(cell.rowIdx), this.getColumn(cell.idx));`,
//       `this.props.onRowClick(cell.rowIdx, this.props.rowGetter(cell.rowIdx), this.getColumn(cell.idx), e);`)
//     .replace(`var headerRenderer = props.enableRowSelect === 'single' ? null : React.createElement(
// 	        'div',
// 	        { className: 'react-grid-checkbox-container checkbox-align' },
// 	        React.createElement('input', { className: 'react-grid-checkbox', type: 'checkbox', name: 'select-all-checkbox', id: 'select-all-checkbox', ref: function ref(grid) {
// 	            return _this7.selectAllCheckbox = grid;
// 	          }, onChange: this.handleCheckboxChange }),
// 	        React.createElement('label', { htmlFor: 'select-all-checkbox', className: 'react-grid-checkbox-label' })
// 	      );`,
//       `var headerRenderer = null`)
//     .replace(`var selectColumn = {
// 	        key: 'select-row',
// 	        name: '',
// 	        formatter: React.createElement(Formatter, { rowSelection: this.props.rowSelection }),
// 	        onCellChange: this.handleRowSelect,
// 	        filterable: false,
// 	        headerRenderer: headerRenderer,
// 	        width: 60,`,
//       `var selectColumn = {
// 	        key: 'select-row',
// 	        name: 'No',
// 	        formatter: React.createElement(Formatter, { rowSelection: this.props.rowSelection }),
// 	        onCellChange: this.handleRowSelect,
// 	        filterable: false,
// 	        headerRenderer: headerRenderer,
// 	        width: 40,`)
//     .replace(`{ title: this.props.value },`,'null,')
//     .replace(`	  componentDidMount: function componentDidMount() {
// 	    this.onRows();`,
//       `	  componentDidMount: function componentDidMount() {
//       document.querySelector('.react-grid-Canvas').addEventListener('scroll',this.onScroll,{passive:true})
// 	    this.onRows();`)
//     .replace(`	    this._scroll = { scrollTop: 0, scrollLeft: 0 };
// 	  },`,
//       `	    this._scroll = { scrollTop: 0, scrollLeft: 0 };
//       document.querySelector('.react-grid-Canvas').removeEventListener('scroll',this.onScroll,{passive:true})
// 	  },`)
//     .replace(`onScroll: this.onScroll,
// 	        className: joinClasses('react-grid-Canvas', this.props.className, { opaque: this.props.cellMetaData.selected && this.props.cellMetaData.selected.active }) },`,
//       `	        className: joinClasses('react-grid-Canvas', this.props.className, { opaque: this.props.cellMetaData.selected && this.props.cellMetaData.selected.active }) },`)
//   fs.writeFileSync(file,result)
// }