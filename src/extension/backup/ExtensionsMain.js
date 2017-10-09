import ExtensionBase from './ExtensionBase'
const {BrowserWindow} = require('electron')
import fs from 'fs'
import path from 'path'

export default class ExtensionsMain{
    constructor(){
        try{
            this.startServer()
            const appIds = fs.readFileSync(path.join(__dirname,'../../extensions.txt')).toString().split(/\r?\n/)
            const bgWin = new BrowserWindow({
                // show: false
            });
            const arr = []
            for(let appId of appIds){
                const extBase = new ExtensionBase(appId)
                extBase.settingContentScripts()
                extBase.loadLocal()
                const webview = extBase.loadBackground(bgWin)
                arr.push(webview)
                // extBase.loadOptionPage()
            }
            const fpath = path.join(__dirname,'../render/extensions.html')
            fs.writeFileSync(fpath,
                `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>bgScript${arr.join("")}</body></html>`)
            bgWin.loadURL(`file://${fpath}`)
        }catch(e){
            console.log(e)
        }
    }

    startServer(){
        const https = require('https');
        const statics = require('node-static');
        const fs = require('fs');
        const st =  new(statics.Server)(path.join(__dirname,'../../resource/extension'));

        https.createServer({pfx: fs.readFileSync(path.join(__dirname,'../../ssl/mysslserver.pfx'))}, function (req, res) {
          res.setHeader("Access-Control-Allow-Origin", "*");
            st.serve(req,res);
        }).listen(7173);

    }

}