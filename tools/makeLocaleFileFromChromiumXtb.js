const path = require('path')
const fs = require('fs')
const glob = require("glob")
const cheerio = require('cheerio')

function hexNumRefToString(hexNumRef) {
  return hexNumRef.replace(/&#x([0-9a-f]+);/ig, function(match, $1, idx, all) {
    return String.fromCharCode('0x' + $1);
  });
}

const availableLanguages = [
  'bn-BD',
  'bn-IN',
  'zh-CN',
  'cs',
  'nl-NL',
  'en-US',
  'fr-FR',
  'de-DE',
  'hi-IN',
  'id-ID',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'ms-MY',
  'pl-PL',
  'pt-BR',
  'ru',
  'sl',
  'es',
  'ta',
  'te',
  'tr-TR',
  'uk'
]

const convertMap = {
  'ja-JA':'ja-JP',
  'zh-ZH':'zh-CN',
  'en-EN':'en-US',
  'ko-KO':'ko-KR',
  'ms-MS':'ms-MY',
  'bn-BN':'bn-IN',
  'en-GB':'en-US',
  'hi-HI':'hi-IN',
}

const files = glob.sync('../../src-master-chrome-app-resources/generated_resources*.xtb')

const savePath = '../brave/app/extensions/brave/locales'
const fname = 'chrome.properties'

for(let file of files){
  // console.log(file)

  let lang = file.split("/").slice(-1)[0].match(/generated_resources_(.+?)\.xtb/)[1]
  if (!availableLanguages.includes(lang) && !lang.match(/-/)) {
    lang = lang + '-' + lang.toUpperCase()
  }
  lang = convertMap[lang] || lang
  if(!availableLanguages.includes(lang)) continue
  console.log(lang)

  const contents = fs.readFileSync(file).toString()
  const $ = cheerio.load(contents,{
    normalizeWhitespace: true,
    decodeEntities: true
  })
  const arr = []
  $('translation').each(function(i,ele){
    const e = $(this)
    arr.push(`${e.attr('id')}=${hexNumRefToString(e.html().replace(/\n/g,"<br>").replace(/\(&amp;[A-Z]\)/,'').replace(/&amp;/g,''))}`)
  })

  fs.writeFileSync(path.join(savePath,lang,fname),arr.join("\n"))
}