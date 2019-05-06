exports.setup = () => {
  const settingObj = {set(){},get(){return true},clear(){},onChange:{addListener(){},removeListener(){},hasListener(){},hasListeners(){}}}

  return {
    network: {
      networkPredictionEnabled: settingObj
    },
    services: {
      alternateErrorPagesEnabled: settingObj,
      instantEnabled: settingObj,
      safeBrowsingEnabled: settingObj,
      searchSuggestEnabled: settingObj,
      spellingServiceEnabled: settingObj,
      translationServiceEnabled: settingObj
    },
    websites: {
      thirdPartyCookiesAllowed: settingObj,
      hyperlinkAuditingEnabled: settingObj,
      referrersEnabled: settingObj,
      protectedContentEnabled: settingObj
    }
  }
}
