const {app, ipcMain} = require('electron')
const fs = require('fs')
const path = require('path')
const {ipcFuncMain} = require('./util-main')
const franc = require('./franc-min')

const transLang = {eng:'en', dan:'da', dut:'nl', fin:'fi', fre:'fr', ger:'de', heb:'he', ita:'it', jpn:'ja', kor:'ko', nor:'nb', pol:'pl', por:'pt', rus:'ru', spa:'es', swe:'sv', chi:'zh', cze:'cs', gre:'el', ice:'is', lav:'lv', lit:'lt', rum:'ro', hun:'hu', est:'et', bul:'bg', scr:'hr', scc:'sr', gle:'ga', glg:'gl', tur:'tr', ukr:'uk', hin:'hi', mac:'mk', ben:'bn', ind:'id', lat:'la', may:'ms', mal:'ml', wel:'cy', nep:'ne', tel:'te', alb:'sq', tam:'ta', bel:'be', jav:'jw', oci:'oc', urd:'ur', bih:'bh', guj:'gu', tha:'th', ara:'ar', cat:'ca', epo:'eo', baq:'eu', ina:'ia', kan:'kn', pan:'pa', gla:'gd', swa:'sw', slv:'sl', mar:'mr', mlt:'mt', vie:'vi', fry:'fy', slo:'sk', fao:'fo', sun:'su', uzb:'uz', amh:'am', aze:'az', geo:'ka', tir:'ti', per:'fa', bos:'bs', sin:'si', nno:'nn', xho:'xh', zul:'zu', grn:'gn', sot:'st', tuk:'tk', kir:'ky', bre:'br', twi:'tw', yid:'yi', som:'so', uig:'ug', kur:'ku', mon:'mn', arm:'hy', lao:'lo', snd:'sd', roh:'rm', afr:'af', ltz:'lb', bur:'my', khm:'km', tib:'bo', div:'dv', ori:'or', asm:'as', cos:'co', ine:'ie', kaz:'kk', lin:'ln', mol:'mo', pus:'ps', que:'qu', sna:'sn', tgk:'tg', tat:'tt', tog:'to', yor:'yo', mao:'mi', wol:'wo', abk:'ab', aar:'aa', aym:'ay', bak:'ba', bis:'bi', dzo:'dz', fij:'fj', kal:'kl', hau:'ha', ipk:'ik', iku:'iu', kas:'ks', kin:'rw', mlg:'mg', nau:'na', orm:'om', run:'rn', smo:'sm', sag:'sg', san:'sa', ssw:'ss', tso:'ts', tsn:'tn', vol:'vo', zha:'za', lug:'lg', glv:'gv'}


module.exports = function(manifest){

  const getMessagesPath = (extensionId, language) => {
    const metadata = manifest[extensionId]
    const localesDirectory = path.join(metadata.srcDirectory, '_locales')
    try {
      const filename = path.join(localesDirectory, language, 'messages.json')
      fs.accessSync(filename, fs.constants.R_OK)
      return filename
    } catch (err) {
      const defaultLocale = metadata.default_locale || 'en'
      return path.join(localesDirectory, defaultLocale, 'messages.json')
    }
  }

  const getMessages = (extensionId, language) => {
    try {
      const messagesPath = getMessagesPath(extensionId, language)
      return JSON.parse(fs.readFileSync(messagesPath)) || {}
    } catch (error) {
      return {}
    }
  }

  ipcFuncMain('i18n','detectLanguage',(e, inputText) => transLang[franc(inputText)] || 'en')
  ipcFuncMain('i18n','getAcceptLanguages',(e) => app.getLocale())
  ipcMain.on('CHROME_I18N_GET_MESSAGES', (e, extensionId, language) => e.returnValue = getMessages(extensionId, language))
}