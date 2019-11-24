const sh = require('shelljs')
const path = require('path')
const fs = require('fs')
const glob = require("glob")

// Ika(Squid)
// Tako(Octopus)
// Katsuo(Tuna)
// Sanma(Saury)
// Tobiuo(Flying Fish)
// Negitoro
// Hotate(Scallop)
// Sazae(Turban Shell)
// Tai(Sea Bream)
// Gari(Sushi Ginger)
// Kappa(Cucumber)
// Aji(Horse mackerel)
// Kani(Crab)
// Unagi(Eel)
// Shirauo(Icefish)
// Ikura(Salmon Roe)
// Iwashi(Sardine)
// Engawa(Flounder Fin)
// Amaebi(Sweet Shrimp)
// Geso(Squid arms)
// Fugu(Blowfish)
// Akamutsu(Rosy seabass)
// Yariika(Spear squid)
// Saba(Mackerel)

const BEFORE_CODE_NAME = 'Saba(Mackerel)'
const CODE_NAME = 'Hatahata(Sandfish)'
const CURRENT_APP_VERSION = fs.readFileSync('../VERSION.txt').toString()
const NEXT_APP_VERSION = "0.29.0"
const NEXT_APP_VERSION2 = `${NEXT_APP_VERSION.split(".").slice(0,-1).join('.')}${NEXT_APP_VERSION.split(".").slice(-1)[0]}`

const CHANGE_ENGLISH =`Fixed video maximize function.
Added a function to move the window by dragging the mouse when maximizing the movie.
Added a function to set the size of 100% or more when maximizing the video. In addition, it was possible to move the position by mouse drag when it was over 100%.
Fixed the pause function by clicking the video and set it to the default action.
Fixed video page.
Fixed video pop-up window.
Bug fixes when changing the window size.
Fixed bug when maximizing window.
Changed the default bookmark page to Chrome standard. And add options to change.
Fixed a bug that right-click menu does not work when extension is uninstalled.
Fixed tab focus by mouse over.
Fixed a bug in the location bar.
Updated Electron to v6.1.5.
Updated Custom Chromium to 78.0.3904.108.
Updated Custom Brave to v1.0.1.
Updated youtube-dl to 2019.11.22.
Fixed the z-order bug of the window.
Fixed panel split bug.
Fixed a bug that failed to start Custom Brave.`

const CHANGE_JAPANESE = `動画のmaximize機能を修正。
動画の最大化時に、マウスドラッグによるウインドウ移動機能を追加。
動画の最大化時に、100%以上のサイズを設定できるように機能を追加。また、100%以上にした際にマウスドラッグによる位置の移動も可能とした。
Alt + マウスホイールで最大化時のサイズを変更できるように機能を追加。
動画クリックによる一時停止機能を修正し、デフォルト動作に設定。
動画ページを修正。
動画のポップアップウインドウを修正。
ウインドウサイズ変更時の不具合修正。
ウインドウ最大化時の不具合修正。
ブックマークページのデフォルトをChrome標準に変更。かつ変更するオプションを追加。
拡張機能をアンインストールした際に、右クリックメニューが動作しない不具合を修正。
マウスオーバーによるタブフォーカスを修正。
ロケーションバーのバグを修正。
Electronをv6.1.5に更新。
Custom Chromiumを78.0.3904.108に更新。
Custom Braveをv1.01に更新。
youtube-dlを2019.11.22に更新
ウインドウのz-orderの不具合を修正
パネル分割の不具合を修正
Custom Braveの起動処理に失敗する不具合を修正`

const isWindows = process.platform === 'win32'
const isDarwin = process.platform === 'darwin'
const isLinux = process.platform === 'linux'
const outDir = 'release-packed'
const arch = 'x64'
const buildDir = `sushi-browser-${process.platform}-${arch}`

function orderAdd(string){
  return string.split("\n").map((x,i)=>`${i+1}. ${x}`).join("\n")
}

function formatDate(date, format) {
  if (!format) format = 'YYYY-MM-DD'
  format = format.replace(/YYYY/g, date.getFullYear())
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2))
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2))
  return format
}

function round(val, precision) {
  const digit = Math.pow(10, precision)
  return Math.round(val * digit) / digit
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function fileContentsReplace(file, reg, after) {
  if(typeof reg == "string"){
    reg = new RegExp(escapeRegExp(reg))
  }
  const datas = fs.readFileSync(file).toString()
  if (datas.match(reg)) {
    // console.log(file)
    const result = datas.replace(new RegExp(reg.toString().slice(1,-1), 'g'), after)
    fs.writeFileSync(file, result)
  }
}

function filesContentsReplace(files,reg,after){
  if(Array.isArray(files)){
    for (let file of files) {
      fileContentsReplace(file, reg, after);
    }
  }
  else{
    fileContentsReplace(files,reg,after)
  }
}


function sizeAdd(htmls,fname,size) {
  for(let file of htmls){
    const result = []
    const datas = fs.readFileSync(file).toString()
    for(let data of datas.split(/\r?\n/)){
      if(data.includes(fname)){
        data = data.replace(/\([\d\.]+MB\)/,`(${size})`)
        data = data.replace('(undefined)',`(${size})`)
      }
      result.push(data)
    }
    fs.writeFileSync(file, result.join("\n"))
  }
}

const start = Date.now()
const RELEASE_DIRECTORY = 'sushi-browser-release'
sh.cd('..')
let pwd = sh.pwd().toString()
console.log(pwd)

fileContentsReplace(path.join(pwd,'package.json'),`"version": "${CURRENT_APP_VERSION}"`,`"version": "${NEXT_APP_VERSION}"`)
fileContentsReplace(path.join(pwd,'VERSION.txt'),/.+/,NEXT_APP_VERSION)
filesContentsReplace([path.join(pwd,'../web/check.json'),path.join(pwd,'README.md'),path.join(pwd,'ja','README.md')],CURRENT_APP_VERSION,NEXT_APP_VERSION)

fileContentsReplace(path.join(pwd,'../web/sitemap.xml'),/<lastmod>(.+?)<\/lastmod>/,`<lastmod>${formatDate(new Date())}</lastmod>`)


if(!fs.readFileSync(path.join(pwd,'README.md')).includes(`v${NEXT_APP_VERSION2}`)){
  fileContentsReplace(path.join(pwd,'README.md'),'# New Features',`# New Features

#### New function(v${NEXT_APP_VERSION2})
- ${CHANGE_ENGLISH.split("\n").join("\n- ")}`)
}

// filesContentsReplace(path.join(pwd,'ja','README.md'),CURRENT_APP_VERSION,NEXT_APP_VERSION)

if(!fs.readFileSync(path.join(pwd,'ja/README.md')).includes(`v${NEXT_APP_VERSION2}`)){
  fileContentsReplace(path.join(pwd,'ja/README.md'),'# 新機能 ',`# 新機能

#### 新機能(v${NEXT_APP_VERSION2})
- ${CHANGE_JAPANESE.split("\n").join("\n- ")}`)
}

if(!fs.readFileSync(path.join(pwd,'../web/index.html')).includes(`v${NEXT_APP_VERSION2}`)){
  fileContentsReplace(path.join(pwd,'../web/index.html'),'<!-- REPLACE -->',`<!-- REPLACE -->
								<h4 class="features-tittle" style="padding-top: 20px;">New function(v${NEXT_APP_VERSION2})&nbsp;[${formatDate(new Date()).replace(/\-/g,'/')}]</h4>
								<div style="text-align: left;line-height: inherit;width: 75%;margin: auto;border-bottom: 1px solid #dedede;">
									<p>${orderAdd(CHANGE_ENGLISH).split("\n").join("</p>\n\t\t\t\t\t\t\t\t\t<p>")}</p>
								</div>`)
}

if(!fs.readFileSync(path.join(pwd,'../web/ja/index.html')).includes(`v${NEXT_APP_VERSION2}`)){
  fileContentsReplace(path.join(pwd,'../web/ja/index.html'),'<!-- REPLACE -->',`<!-- REPLACE -->
								<h4 class="features-tittle" style="padding-top: 20px;">新機能(v${NEXT_APP_VERSION2})&nbsp;[${formatDate(new Date()).replace(/\-/g, '/')}]</h4>
								<div style="text-align: left;line-height: inherit;width: 75%;margin: auto;border-bottom: 1px solid #dedede;">
									<p>${orderAdd(CHANGE_JAPANESE).split("\n").join("</p>\n\t\t\t\t\t\t\t\t\t<p>")}</p>
								</div>`)
}

if(!fs.readFileSync(path.join(pwd,'../web/download.html')).includes(`v${NEXT_APP_VERSION2}`)){
  fileContentsReplace(path.join(pwd,'../web/download.html'),'<!-- REPLACE -->',`<!-- REPLACE -->
						<h4 class="features-tittle">New function(v${NEXT_APP_VERSION2})&nbsp;[${formatDate(new Date()).replace(/\-/g, '/')}]</h4>
						<div style="text-align: left;line-height: inherit;width: 75%;margin: auto;border-bottom: 1px solid #dedede;">
							<p>${orderAdd(CHANGE_ENGLISH).split("\n").join("</p>\n\t\t\t\t\t\t\t<p>")}</p>
						</div>`)
}

if(!fs.readFileSync(path.join(pwd,'../web/ja/download.html')).includes(`v${NEXT_APP_VERSION2}`)){
  fileContentsReplace(path.join(pwd,'../web/ja/download.html'),'<!-- REPLACE -->',`<!-- REPLACE -->
						<h4 class="features-tittle">新機能(v${NEXT_APP_VERSION2})&nbsp;[${formatDate(new Date()).replace(/\-/g, '/')}]</h4>
						<div style="text-align: left;line-height: inherit;width: 75%;margin: auto;">
							<p>${orderAdd(CHANGE_JAPANESE).split("\n").join("</p>\n\t\t\t\t\t\t\t<p>")}</p>
						</div>`)
}


const htmls = []
glob.sync(`${pwd}/../web/**/index.html`).forEach(file=>{
  filesContentsReplace(file,CURRENT_APP_VERSION,NEXT_APP_VERSION)
  filesContentsReplace(file,BEFORE_CODE_NAME,CODE_NAME)
  htmls.push(file)
})
glob.sync(`${pwd}/../web/**/download.html`).forEach(file=>{
  filesContentsReplace(file,CURRENT_APP_VERSION,NEXT_APP_VERSION)
  filesContentsReplace(file,BEFORE_CODE_NAME,CODE_NAME)
  htmls.push(file)
})

const sizeMap = {}
glob.sync(`${pwd}/../${RELEASE_DIRECTORY}/release-packed/*`).forEach(file=>{
  const fname = file.split("/").slice(-1)[0]
  const fsize = `${round(fs.statSync(file).size /1024.0/1024,1)}MB`
  sizeMap[fname] = fsize
})


console.log(`Sushi Browser v${NEXT_APP_VERSION} ${CODE_NAME}

## New Features
- ${CHANGE_ENGLISH.split("\n").join("\n- ")}

## Applications`)
let app = `sushi-browser-${NEXT_APP_VERSION}-setup-x64.exe`
console.log(`- [Windows Installer v${NEXT_APP_VERSION} (${sizeMap[app]})](https://github.com/kura52/sushi-browser/releases/download/${NEXT_APP_VERSION}/${app})`)
sizeAdd(htmls,app,sizeMap[app])

app = `sushi-browser-${NEXT_APP_VERSION}-win-x64-chromium.zip`
console.log(`- [Windows Portable v${NEXT_APP_VERSION} with Chromium (${sizeMap[app]})](https://github.com/kura52/sushi-browser/releases/download/${NEXT_APP_VERSION}/${app})`)
sizeAdd(htmls,app,sizeMap[app])

app = `sushi-browser-${NEXT_APP_VERSION}-win-x64-brave.zip`
console.log(`- [Windows Portable v${NEXT_APP_VERSION} with Brave (${sizeMap[app]})](https://github.com/kura52/sushi-browser/releases/download/${NEXT_APP_VERSION}/${app})`)
sizeAdd(htmls,app,sizeMap[app])

app = `sushi-browser-${NEXT_APP_VERSION}-win-x64.zip`
console.log(`- [Windows Portable v${NEXT_APP_VERSION} (${sizeMap[app]})](https://github.com/kura52/sushi-browser/releases/download/${NEXT_APP_VERSION}/${app})`)
sizeAdd(htmls,app,sizeMap[app])

app = `sushi-browser-${NEXT_APP_VERSION}-setup-ia32.exe`
console.log(`- [Windows Installer 32bit v${NEXT_APP_VERSION} (${sizeMap[app]})](https://github.com/kura52/sushi-browser/releases/download/${NEXT_APP_VERSION}/${app})`)
sizeAdd(htmls,app,sizeMap[app])

app = `sushi-browser-${NEXT_APP_VERSION}-win-ia32.zip`
console.log(`- [Windows Portable 32bit v${NEXT_APP_VERSION} (${sizeMap[app]})](https://github.com/kura52/sushi-browser/releases/download/${NEXT_APP_VERSION}/${app})`)
sizeAdd(htmls,app,sizeMap[app])

app = `SushiBrowser-${NEXT_APP_VERSION}.dmg`
console.log(`- [MacOS dmg v${NEXT_APP_VERSION} (${sizeMap[app]})](https://github.com/kura52/sushi-browser/releases/download/${NEXT_APP_VERSION}/${app})`)
sizeAdd(htmls,app,sizeMap[app])

app = `sushi-browser-${NEXT_APP_VERSION}-mac-x64.zip`
console.log(`- [MacOS Portable v${NEXT_APP_VERSION} (${sizeMap[app]})](https://github.com/kura52/sushi-browser/releases/download/${NEXT_APP_VERSION}/${app})`)
sizeAdd(htmls,app,sizeMap[app])
//
app = `sushi-browser-${NEXT_APP_VERSION}-1.x86_64.rpm`
console.log(`- [Linux rpm (for Fedora/CentOS) v${NEXT_APP_VERSION} (${sizeMap[app]})](https://github.com/kura52/sushi-browser/releases/download/${NEXT_APP_VERSION}/${app})`)
sizeAdd(htmls,app,sizeMap[app])

app = `sushi-browser_${NEXT_APP_VERSION}_amd64.deb`
console.log(`- [Linux deb (for Debian/Ubuntu) v${NEXT_APP_VERSION} (${sizeMap[app]})](https://github.com/kura52/sushi-browser/releases/download/${NEXT_APP_VERSION}/${app})`)
sizeAdd(htmls,app,sizeMap[app])

app = `sushi-browser-${NEXT_APP_VERSION}.tar.bz2`
console.log(`- [Linux Portable v${NEXT_APP_VERSION} (${sizeMap[app]})](https://github.com/kura52/sushi-browser/releases/download/${NEXT_APP_VERSION}/${app})`)
sizeAdd(htmls,app,sizeMap[app])



