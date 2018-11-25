'use strict'

const {ipcRenderer,webFrame} = require('electron')
ipcRenderer.setMaxListeners(0)

function exe(isExtensionPage){
  window.close = () => ipcRenderer.send('send-to-host', 'window-close', {})

// Check whether pattern matches.
// https://developer.chrome.com/extensions/match_patterns
  const matchesPattern = function (pattern) {
    if (pattern === '<all_urls>') return true
    const regexp = new RegExp(`^${pattern.replace(/[-[\]{}()^$|+?.\\/\s]/g, '\\$&').replace(/\*/g, '.*')}$`)
    // console.log('matchesPattern',pattern,regexp)
    const url = `${location.protocol}//${location.host}${location.pathname}`
    return url.match(regexp)
  }

  const matchesGlob = function (pattern) {
    if (pattern === '<all_urls>') return true
    const regexp = new RegExp(`^${pattern.replace(/[-[\]{}()^$|+.\\/\s]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.?')}$`)
    // console.log('matchesGlob',pattern,regexp)
    const url = `${location.protocol}//${location.host}${location.pathname}`
    return url.match(regexp)
  }

// Run the code with chrome API integrated.
  let seq = 0, seqMap = {}
  const runContentScript = async function (extensionId, name, url, code) {
    console.log('runContentScript')
    const context = {}
    require('./chrome-api').injectTo(extensionId, false, isExtensionPage, context)
    let worldId = seqMap[extensionId]
    if(!worldId){
      worldId = ++seq
      seqMap[extensionId] = worldId
      webFrame.setIsolatedWorldHumanReadableName(worldId, name)
      await new Promise(r=>{
        webFrame.executeJavaScriptInIsolatedWorld(worldId, [{code: `;\n((chrome) => { window.chrome = chrome });\n`}], false, compiledWrapper => {
          compiledWrapper.call(this, context.chrome)
          r()
        })
      })
    }

    return function(){
      return new Promise(r=>{
        webFrame.executeJavaScriptInIsolatedWorld(worldId, [{code: `;\n${code};\n`}], false, r)
      })
    }

    // const compiledWrapper = runInThisContext(wrapper, {
    //   filename: url,
    //   lineOffset: 1,
    //   displayErrors: true
    // })
    // return compiledWrapper.call(this, context.chrome)
  }

  const runAllContentScript = function (scripts, extensionId, name) {
    let _url, _code = []
    for (const { url, code } of scripts) {
      _url = url
      _code.push(code)
    }
    return runContentScript.call(window, extensionId, name, _url, _code.join("\n;\n"))
  }

  const runStylesheet = function (extensionId, name, url, code) {
    const wrapper = `((code) => {
    function init() {
      const styleElement = document.createElement('style');
      styleElement.textContent = code;
      document.head.append(styleElement);
    }
    document.addEventListener('DOMContentLoaded', init);
  })`

    let worldId = seqMap[extensionId]
    if(!worldId){
      worldId = ++seq
      seqMap[extensionId] = worldId
      webFrame.setIsolatedWorldHumanReadableName(worldId, name)
    }

    return function(){
      webFrame.executeJavaScriptInIsolatedWorld(worldId, [{code: wrapper}], false, compiledWrapper => {
        compiledWrapper.call(this, code)
      })
    }
  }

  const runAllStylesheet = function (css, extensionId, name) {
    for (const { url, code } of css) {
      return runStylesheet.call(window, extensionId, name, url, code)
    }
  }

// Run injected scripts.
// https://developer.chrome.com/extensions/content_scripts
  const injectContentScript = async function (extensionId, name, script) {
    console.log('injectContentScript')
    if (!script.matches.some(matchesPattern)) return
    if (script.include_globs && !script.include_globs.some(matchesGlob)) return
    if (script.exclude_matches && script.exclude_matches.some(matchesPattern)) return
    if (script.exclude_globs && script.exclude_globs.some(matchesGlob)) return

    if (script.js) {
      const fire = (await runAllContentScript.bind(window, script.js, extensionId, name)())
      if (script.runAt === 'document_start') {
        const id = setInterval(()=>{
          if(document.documentElement){
            clearInterval(id)
            fire()
          }
        },1)
      } else if (script.runAt === 'document_end') {
        document.addEventListener('DOMContentLoaded', ()=>setTimeout(fire,0))
        // process.once('document-end', fire)
      } else {
        window.addEventListener('load', ()=>setTimeout(fire,0))
      }
    }

    if (script.css) {
      const fire = runAllStylesheet.bind(window, script.css, extensionId, name)()
      if(!fire){}
      else if (script.runAt === 'document_start') {
        // setTimeout(fire,0)
        const id = setInterval(()=>{
          if(document.documentElement){
            clearInterval(id)
            fire()
          }
        },1)
        // document.addEventListener('readystatechange', () => document.readyState == 'interactive' && fire())
        // process.once('document-start', fire)
      } else if (script.runAt === 'document_end') {
        // process.once('document-end', fire)
        document.addEventListener('DOMContentLoaded', ()=>setTimeout(fire,0))
      } else {
        window.addEventListener('load', ()=>setTimeout(fire,0))
      }
    }
  }

// Handle the request of chrome.tabs.executeJavaScript.
  ipcRenderer.on('CHROME_TABS_EXECUTESCRIPT', async function (event, senderWebContentsId, requestId, extensionId, url, code) {
    console.log('CHROME_TABS_EXECUTESCRIPT', url, code)
    const result = await (await runContentScript.call(window, extensionId, 'execute script', url, code))()
    ipcRenderer.sendToAll(senderWebContentsId, `CHROME_TABS_EXECUTESCRIPT_RESULT_${requestId}`, result)
  })

// Read the renderer process preferences.
  const preferences = ipcRenderer.sendSync('get-render-process-preferences')
  if (preferences) {
    for (const pref of preferences) {
      if (pref.contentScripts) {
        for (const script of pref.contentScripts) {
          console.log(pref.extensionId, isExtensionPage, window.location.href, script)
          if(isExtensionPage && !pref.admin) continue
          injectContentScript(pref.extensionId, pref.name, script)
        }
      }
    }
  }

}

exe(location.href.startsWith('chrome-extension'))