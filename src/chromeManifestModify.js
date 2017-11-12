import fs from 'fs'
import path from 'path'
const {getPath1,getPath2} = require('./chromeExtensionUtil')

const contentScriptName = '___contentScriptModify_.js'

const backgroundScriptName = '___backgroundScriptModify_.js'

const backgroundHtmlName = '___backgroundModify_.html'
const backgroundHtmlStr = `<!DOCTYPE html>
<body>
<script src="${backgroundScriptName}"></script>
__REPLACE__`

function findJsTags(obj,callback){
  if(obj.js){
    obj.js = callback(obj.js)
  }
  if(Array.isArray(obj)) {
    for(let ele of obj){
      findJsTags(ele,callback)
    }
  }
  else if(obj instanceof Object){
    for(let [key,ele] of Object.entries(obj)){
      if(key != 'js') findJsTags(ele,callback)
    }
  }
}

function copyModifyFile(to,flagContent,flagBackground){
  if(flagContent){
    const cont = fs.readFileSync(path.join(__dirname,'../src/extension/contentScriptModify.js')).toString()
    const contPath = path.join(to,contentScriptName)
    if(fs.existsSync(contPath)) fs.unlinkSync(contPath)
    fs.writeFileSync(contPath,cont)
  }
  if(flagBackground){
    const bg = fs.readFileSync(path.join(__dirname,'../src/extension/backgroundScriptModify.js')).toString()
    const bgPath = path.join(to,backgroundScriptName)
    if(fs.existsSync(bgPath)) fs.unlinkSync(bgPath)
    fs.writeFileSync(bgPath,bg)
  }
}

let cache = new Set()
function htmlModify(verPath,fname){
  const dirName = path.dirname(fname)
  const backStr = dirName == '.' ? dirName : dirName.split(/[\/\\]/).map(x=>'..').join('/')
  console.log(verPath,fname,dirName,backStr)
  const fullPath = path.join(verPath,dirName,path.basename(fname).split("?")[0])
  if(cache.has(fullPath) || !fs.existsSync(fullPath)) return
  cache.add(fullPath)

  const str = fs.readFileSync(fullPath).toString()
  if(str.includes(backgroundScriptName)) return

  fs.unlinkSync(fullPath)
  let writeStr = str.replace(/< *(head)([^>]*)>/i,`<$1$2>\n  <script src="${backStr}/${backgroundScriptName}"></script>`)
  if(!writeStr.includes(backgroundScriptName)){
    writeStr = str.replace(/< *(body)([^>]*)>/i,`<$1$2>\n  <script src="${backStr}/${backgroundScriptName}"></script>`)
  }
  else if(!writeStr.includes(backgroundScriptName)){
    writeStr = str.replace(/html>/i,`html>\n  <script src="${backStr}/${backgroundScriptName}"></script>`)
  }
  fs.writeFileSync(fullPath,writeStr)
}

export default function modify(extensionId,verPath){
  cache = new Set()
  if(!verPath){
    verPath = getPath2(extensionId) || getPath1(extensionId) //getPath1(extensionId)
  }

  const manifestPath = path.join(verPath, 'manifest.json')
  fs.exists(manifestPath, (exists) => {
    if (exists) {
      const manifestStr = fs.readFileSync(manifestPath).toString().replace('\\u003Call_urls>','<all_urls>')
      const infos = JSON.parse(manifestStr)

      if(infos.permissions && infos.permissions.includes('activeTab')
        && (!infos.permissions.includes('http://*/*') || !infos.permissions.includes('https://*/*'))){
        infos.permissions = [...new Set([...infos.permissions,'http://*/*','https://*/*'])]
      }

      let flagContent,flagBackground
      if(infos.content_scripts){
        findJsTags(infos.content_scripts,js=>{
          if(!Array.isArray(js)) js = [js]
          if(!js.includes(contentScriptName)) js.unshift(contentScriptName)
          return js
        })
        flagContent = true
      }

      if(infos.background){
        if(infos.background.page){
          htmlModify(verPath,infos.background.page)
        }
        else if(infos.background.scripts){
          if(!Array.isArray(infos.background.scripts)) infos.background.scripts = [infos.background.scripts]
          const content = backgroundHtmlStr.replace('__REPLACE__',infos.background.scripts.map(src=>`<script src="${src}"></script>`).join("\n  "))
          fs.writeFileSync(path.join(verPath,backgroundHtmlName),content)
          infos.background.page = backgroundHtmlName
          delete infos.background.scripts
        }
        flagBackground = true
      }

      if(infos.options_page){
        htmlModify(verPath,infos.options_page)
        flagBackground = true
      }

      if(infos.page_action && infos.page_action.default_popup){
        htmlModify(verPath,infos.page_action.default_popup)
        flagBackground = true
      }

      if(infos.browser_action && infos.browser_action.default_popup){
        htmlModify(verPath,infos.browser_action.default_popup)
        flagBackground = true
      }

      if(infos.web_accessible_resources){
        for(let file of infos.web_accessible_resources){
          if(file.match(/\.html?$/)){
            htmlModify(verPath,file)
            flagBackground = true
          }
        }
      }

      if(infos.chrome_url_overrides){
        for(let file of Object.values(infos.chrome_url_overrides)){
          htmlModify(verPath,file)
          flagBackground = true
        }
      }


      if(infos.page_action && !infos.browser_action){
        infos.browser_action = infos.page_action
        if(infos.browser_action.show){
          infos.browser_action.enable  = infos.browser_action.show
          delete infos.browser_action.show
        }
        if(infos.browser_action.hide){
          infos.browser_action.disable = infos.browser_action.hide
          delete infos.browser_action.hide
        }
        delete infos.page_action
      }
      copyModifyFile(verPath,flagContent,flagBackground)

      fs.unlinkSync(manifestPath)
      fs.writeFileSync(manifestPath,JSON.stringify(infos, null, '  '))

    }
  })

}