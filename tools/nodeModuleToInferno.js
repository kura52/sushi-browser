const glob = require("glob")
const fs = require("fs")

const files = ['../node_modules/react-sticky','../node_modules/semantic-ui-react','../node_modules/react-table',
'../node_modules/react-sortable-hoc']

for(let f of files){
  for(let js of glob.sync(`${f}/**/*.js`)){
    reactToInferno(js)
    if(f.includes('react-table')){
      reactTable(js)
    }
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

function reactTable(file){
  const datas = fs.readFileSync(file).toString()
  const result = datas.replace(`_this2.setState({ page: _this2.getSafePage(page) });`,
    `_this2.state.page = _this2.getSafePage(page) ;_this2.applyPage();`)
  fs.writeFileSync(file,result)
}
