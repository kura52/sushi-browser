const glob = require("glob")
const fs = require("fs")

const files = ['../node_modules/react-sticky','../node_modules/semantic-ui-react','../node_modules/re-resizable']

for(let f of files){
  for(let js of glob.sync(`${f}/**/*.js`)){
    reactToInferno(js)
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