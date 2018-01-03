// if(location.href.match(/^(http)/)){
//   browser.runtime.sendMessage = (extensionId,message,options) =>{
//     const ipc = chrome.ipcRenderer
//     if(typeof extensionId !== "string"){
//       [extensionId,message,options] = [null,extensionId,message]
//     }
//     if(!extensionId) extensionId = chrome.runtime.id
//     const key = `${Math.random().toString()}-${Date.now()}`
//     return new Promise((resolve,reject)=>{
//       // console.log(`browser-message-webext`,key,extensionId,message)
//       ipc.send(`browser-message-webext`,key,extensionId,message,{id:chrome.runtime.id,url:location.href,content:true})
//       ipc.once(`browser-message-webext-reply_${key}`,(e,val)=>resolve(val))
//     })
//   }
// }