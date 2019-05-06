import fs from 'fs'
import path from 'path'
const Jimp = require('jimp')
const hjson = require('hjson')
const electronImageResize = require('./electronImageResize')
const {getPath1,getPath2} = require('./chromeExtensionUtil')

const contentScriptName = '___contentScriptModify_.js'

const backgroundScriptName = '___backgroundScriptModify_.js'

const polyfillName = 'browser-polyfill.min.js'
const webExtModifyBg = 'webextensionModifyBg.js'
const webExtModifyCs = 'webextensionModifyCs.js'
const webExtStyleName = 'webextension.css'

const backgroundHtmlName = '___backgroundModify_.html'
let backgroundHtmlStr = `<!DOCTYPE html>
<head><meta charset="UTF-8"></head>
<body>
<script src="${backgroundScriptName}"></script>
__REPLACE__
</body></html>`

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

function copyModifyFile(to,flagContent,flagBackground,isWebExt){
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
  if(isWebExt){
    for(let file of [polyfillName,webExtModifyBg,webExtModifyCs,webExtStyleName]){
      const poli = fs.readFileSync(path.join(__dirname,`../resource/${file}`)).toString()
      const poliPath = path.join(to,file)
      if(fs.existsSync(poliPath)) fs.unlinkSync(poliPath)
      fs.writeFileSync(poliPath,poli)
    }
  }
}

let cache = new Set()
function htmlModify(verPath,fname,isWebExt){
  const dirName = path.dirname(fname)
  const backStr = dirName == '.' ? dirName : dirName.split(/[\/\\]/).map(x=>'..').join('/')
  console.log(verPath,fname,dirName,backStr)
  const fullPath = path.join(verPath,dirName,path.basename(fname).split("?")[0])
  if(cache.has(fullPath) || !fs.existsSync(fullPath)) return
  cache.add(fullPath)

  const str = fs.readFileSync(fullPath).toString()
  if(str.includes(backgroundScriptName)) return

  fs.unlinkSync(fullPath)
  let writeStr = str.replace(/< *(head)([^>]*)>/i,`<$1$2>\n  ${isWebExt ? `<script src="${backStr}/${polyfillName}"></script>\n<script src="${backStr}/${webExtModifyBg}"></script>\n` : ''}<script src="${backStr}/${backgroundScriptName}"></script>`)
  if(!writeStr.includes(backgroundScriptName)){
    writeStr = str.replace(/< *(body)([^>]*)>/i,`<$1$2>\n  ${isWebExt ? `<script src="${backStr}/${polyfillName}"></script>\n<script src="${backStr}/${webExtModifyBg}"></script>\n` : ''}<script src="${backStr}/${backgroundScriptName}"></script>`)
  }
  if(!writeStr.includes(backgroundScriptName)){
    writeStr = str.replace(/html>/i,`html>\n  ${isWebExt ? `<script src="${backStr}/${polyfillName}"></script>\n<script src="${backStr}/${webExtModifyBg}"></script>\n<link rel="stylesheet" href="${backStr}/${webExtStyleName}">\n` : ''}\n<script src="${backStr}/${backgroundScriptName}"></script>`)
  }
  if(!writeStr.includes(backgroundScriptName)){
    writeStr = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Background</title>
  ${isWebExt ? `<script src="${backStr}/${polyfillName}"></script>\n<script src="${backStr}/${webExtModifyBg}"></script>\n` : ''}
  <script src="${backStr}/${backgroundScriptName}"></script>
  ${writeStr}
</head>
<body>

</body>
</html>`
  }
  fs.writeFileSync(fullPath,writeStr)
}

function removeBom(x){
  return x.charCodeAt(0) === 0xFEFF ? x.slice(1) : x
}

export default async function modify(extensionId,verPath){
  const isWebExt = !extensionId.match(/(^[a-z]+$)|(_chrome_$)/)
  cache = new Set()
  if(!verPath){
    verPath = getPath2(extensionId) || getPath1(extensionId) //getPath1(extensionId)
  }

  const manifestPath = path.join(verPath, 'manifest.json')
  const exists = fs.existsSync(manifestPath)
  if (exists) {
    const manifestStr = removeBom(fs.readFileSync(manifestPath).toString()).replace('\\u003Call_urls>','<all_urls>')
    const infos = hjson.parse(manifestStr)

    if(!infos.key || infos.key.match(/[\-\.]/)){
      infos.key = new Buffer(extensionId).toString('base64')
    }

    if(infos.permissions && infos.permissions.includes('activeTab')
      && (!infos.permissions.includes('http://*/*') || !infos.permissions.includes('https://*/*'))){
      infos.permissions = [...new Set([...infos.permissions,'http://*/*','https://*/*'])]
    }

    if(infos.optional_permissions){
      infos.permissions = [...new Set([...(infos.permissions || []),...infos.optional_permissions])]
    }

    if(!infos.content_security_policy){
      infos.content_security_policy = "script-src 'self' 'unsafe-eval'; object-src 'self'"
    }

    if(isWebExt && infos.permissions){
      infos.permissions = infos.permissions.filter(x=>x!=='clipboardWrite' && x!=='clipboardRead')
      const ind = infos.permissions.findIndex(x=>x=='menus')
      if(ind != -1) infos.permissions[ind] = 'contextMenus'
    }

    let flagContent,flagBackground
    if(infos.content_scripts){
      findJsTags(infos.content_scripts,js=>{
        if(!Array.isArray(js)) js = [js]
        if(isWebExt && !js.includes(polyfillName)){
          js.unshift(webExtModifyCs)
          js.unshift(polyfillName)
        }
        if(!js.includes(contentScriptName)) js.unshift(contentScriptName)
        return js
      })
      flagContent = true
    }

    let open
    const imageResize = new electronImageResize()
    try{
      if(infos.background){
        if(infos.background.persistent === false && !['jpkfjicglakibpenojifdiepckckakgk','occjjkgifpmdgodlplnacmkejpdionan'].includes(extensionId)){
          infos.background.persistent = true
        }
        if(infos.background.page){
          htmlModify(verPath,infos.background.page,isWebExt)
        }
        else if(infos.background.scripts){
          if(!Array.isArray(infos.background.scripts)) infos.background.scripts = [infos.background.scripts]
          if(isWebExt) backgroundHtmlStr = backgroundHtmlStr.replace('<body>',`<body>\n<script src="${polyfillName}"></script>\n<script src="${webExtModifyBg}"></script>`)
          const content = backgroundHtmlStr.replace('__REPLACE__',infos.background.scripts.map(src=>`<script src="${src}"></script>`).join("\n  "))
          fs.writeFileSync(path.join(verPath,backgroundHtmlName),content)
          infos.background.page = backgroundHtmlName
          delete infos.background.scripts
        }
        flagBackground = true
      }

      if(infos.options_page){
        htmlModify(verPath,infos.options_page,isWebExt)
        flagBackground = true
      }

      if(infos.options_ui && infos.options_ui.page){
        if(!infos.options_page) infos.options_page = infos.options_ui.page
        htmlModify(verPath,infos.options_ui.page,isWebExt)
        flagBackground = true
      }

      if(infos.page_action && infos.page_action.default_popup){
        htmlModify(verPath,infos.page_action.default_popup,isWebExt)
        flagBackground = true
      }

      if(infos.browser_action && infos.browser_action.default_popup){
        htmlModify(verPath,infos.browser_action.default_popup,isWebExt)
        flagBackground = true
      }


      if(infos.web_accessible_resources){
        for(let file of infos.web_accessible_resources){
          if(file.match(/\.html?$/)){
            htmlModify(verPath,file,isWebExt)
            flagBackground = true
          }
        }
      }

      if(infos.chrome_url_overrides){
        for(let file of Object.values(infos.chrome_url_overrides)){
          htmlModify(verPath,file,isWebExt)
          flagBackground = true
        }
      }

      if(infos.page_action){
        if(!infos.browser_action){
          infos.browser_action = infos.page_action
          if(infos.browser_action.show){
            infos.browser_action.enable  = infos.browser_action.show
            delete infos.browser_action.show
          }
          if(infos.browser_action.hide){
            infos.browser_action.disable = infos.browser_action.hide
            delete infos.browser_action.hide
          }
        }
        delete infos.page_action
      }

      for(let file of require("glob").sync(`${verPath}/**/*.html`)){
        console.log(222444,verPath,file.replace(`${verPath}/`,''),isWebExt)
        htmlModify(verPath,file.replace(`${verPath.replace(/\\/g,'/')}/`,''),isWebExt)
      }

      for(let file of require("glob").sync(`${verPath}/**/*.js`)){
        let datas = fs.readFileSync(file).toString(),needWrite = false
        if (isWebExt && datas.includes('moz-extension')) {
          // console.log(file)
          datas = datas.replace(/moz\-extension/ig,'chrome-extension')
          needWrite = true
        }
        if(extensionId == 'mlomiejdfkolichcflejclcbmpeaniij' && datas.includes('about:blank')){
          datas = datas.replace(/about:blank/ig,'chrome-extension://dckpbojndfoinamcdamhkjhnjnmjkfjd/blank.html')
          needWrite = true
        }
        if(needWrite){
          fs.writeFileSync(file, datas)
        }
      }
      if(infos.commands){
        for(let [k,v] of Object.entries(infos.commands)) {
          if(v.suggested_key){
            for(let [k2,v2] of Object.entries(v.suggested_key)){
              if(v2.match(/^F\d+$/)){
                delete infos.commands[k]
                break
              }
            }
          }
          if (k == '_execute_browser_action' || k == '_execute_page_action') continue
          if (!v.description) v.description = "description"
        }
      }

      copyModifyFile(verPath,flagContent,flagBackground,isWebExt)

      fs.unlinkSync(manifestPath)
      fs.writeFileSync(manifestPath,JSON.stringify(infos, null, '  '))

      console.log(33332001)
      for(let svg of require("glob").sync(`${verPath}/**/*.svg`)){
        const out = svg.replace(/\.svg$/,".png")
        if(!fs.existsSync(out)){
          if(!open){
            imageResize.open({width: 16, height: 16})
            open = true
          }
          console.log(`file://${svg}`)
          const url = path.join(path.parse(svg).dir,'svg.html')
          fs.writeFileSync(url,`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
    <style type="text/css">
    img,svg{
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
<img src="${svg}"/>
</body>
</html>`)
          const img = await imageResize.capture({url: `file://${url}`, width: 16, height: 16})

          Jimp.read(img.toPNG(), function (err, image) {
            if(image.bitmap.width > image.bitmap.height){
              image = image.resize(16,Jimp.AUTO,Jimp.RESIZE_BICUBIC)
            }
            else{
              image = image.resize(Jimp.AUTO,16,Jimp.RESIZE_BICUBIC)
            }
            image.write(out)
          })
        }
      }
      if(open) imageResize.close()
    }catch(e){
      if(open) imageResize.close()
      console.log(33332002,e)
    }
    // if(isWebExt){
    //   for(let js of require("glob").sync(`${verPath}/**/*.js`)){
    //     const datas = fs.readFileSync(js).toString()
    //     if(datas.match(/document.execCommand\( *(["'])copy\1 *\)/)){
    //       const result = datas.replace(/document.execCommand\( *(["'])copy\1 *\)/,`chrome.ipcRenderer.send('execCommand-copy')`)
    //       fs.writeFileSync(js, result)
    //     }
    //   }
    // }
  }

}
