chrome.runtime.getBrowserInfo = callback=> callback({name:'Firefox',vendor:'Mozilla',version:'57.0',buildID:'20171203000000'})

// for(let method of ['onMessage']){
//   const ipc = chrome.ipcRenderer
//   const isThenable = value => {
//     return value && typeof value === "object" && typeof value.then === "function";
//   }
//
//   const name = `browser-runtime-webext-${method}`
//   const ipcEvents = {}
//   browser.runtime[method] = {
//     addListener(cb) {
//       console.log(method)
//       ipcEvents[cb] = async (e, key, message, sender) =>{
//         if(sender.content){
//           const tab = await browser.tabs.get(sender.tabId)
//           sender.tab = tab
//           // console.log(sender)
//         }
//         let sended = false
//         let promise = new Promise((resolve,reject)=>{
//           const result = cb(message, sender, resolve)
//           // console.log(result)
//           if(isThenable(result)){
//             result.then(value=>{
//               // if(value === void 0) return
//               // console.log(`browser-message-webext-reply-bg_${key}`,true,value)
//               ipc.send(`browser-message-webext-reply-bg_${key}`,true,value)
//               sended = true
//             })
//           }
//           setTimeout(_=>resolve("__TIMEOUT__"),10000)
//         })
//         promise.then(value=>{
//           if(sended){}
//           else if(value == "__TIMEOUT__"){
//             console.log(`browser-message-webext-reply-bg_${key}`,false)
//             ipc.send(`browser-message-webext-reply-bg_${key}`,false)
//           }
//           else{
//             // console.log(`browser-message-webext-reply-bg_${key}`,true,value)
//             ipc.send(`browser-message-webext-reply-bg_${key}`,true,value)
//           }
//         })
//       }
//       ipc.send(`regist-${name}`,chrome.runtime.id)
//       ipc.on(name, ipcEvents[cb])
//     },
//     removeListener(cb){
//       ipc.send(`unregist-${name}`)
//       ipc.removeListener(name, ipcEvents[cb])
//     },
//     hasListener(cb){
//       return !!ipcEvents[cb]
//     },
//     hasListeners(){
//       return !!Object.keys(ipcEvents).length
//     }
//   }
// }
//
// browser.runtime.sendMessage = (extensionId,message,options) =>{
//   const ipc = chrome.ipcRenderer
//   if(typeof extensionId !== "string"){
//     [extensionId,message,options] = [null,extensionId,message]
//   }
//   if(!extensionId) extensionId = chrome.runtime.id
//   const key = `${Math.random().toString()}-${Date.now()}`
//   return new Promise((resolve,reject)=>{
//     // console.log(`browser-message-webext`,key,extensionId,message)
//     ipc.send(`browser-message-webext`,key,extensionId,message,{id:chrome.runtime.id,url:location.href})
//     ipc.once(`browser-message-webext-reply_${key}`,(e,val)=>resolve(val))
//   })
// }
//
// browser.tabs.sendMessage = (tabId,message,options) =>{
//   const ipc = chrome.ipcRenderer
//   const key = `${Math.random().toString()}-${Date.now()}`
//   return new Promise((resolve,reject)=>{
//     // console.log(`browser-message-webext-tab`,key,extensionId,message)
//     chrome.tabs.get(tabId, tab=>{
//       ipc.send(`browser-message-webext`,key,chrome.runtime.id,message,{tab,frameId:0,id:chrome.runtime.id,url:location.href})
//       ipc.once(`browser-message-webext-reply_${key}`,(e,val)=>{
//         resolve(val)
//       })
//     })
//   })
// }