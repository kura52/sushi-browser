/*
Frontend script using Chrome Cache parsing library*/
const {parse, exportTol2t} = require('./chromagnon/cacheParse')
const commandLineArgs = require('command-line-args')
const path = require('path')
const {app} = require('electron')


const optionDefinitions = [
    { name: 'output', alias: 'o', type: String },
    { name: 'urls', alias: 'u', multiple: true, type: String},
    { name: 'input', alias: 'i', defaultOption: true }
]
const options = commandLineArgs(optionDefinitions)
function main() {
    const args = process.argv;
    const cache = parse(options.input, options.urls);
    exportTol2t(cache, options.output);
}

export default {
    getAll(){
        const cachePath = path.join(app.getPath('userData'),'Cache')
        return {path:cachePath,caches:parse(cachePath)}
    },
    getFromUrls(urls){
        const cachePath = path.join(app.getPath('userData'),'Cache')
        return {path:cachePath,caches:parse(cachePath,urls)}
    }
}