const sharedState = require('./sharedState')
const isWin = navigator.userAgent.includes('Windows')

export default function get(entity,name){
  if(sharedState.inActive && (name == 'theme_frame' || name == 'frame' || name == 'theme_frame_overlay')){
    name = `${name}_inactive`
  }

  if(!sharedState.theme || !sharedState.theme[entity] || !sharedState.theme[entity][name]){
    if(entity == 'colors' || entity == 'tints'){
      let val
      if(entity == 'colors'){
        if(name == 'frame'){
          return 'rgb(221, 221, 221)'
        }
        else if(name == 'frame_inactive'){
          return 'rgb(245, 245, 245)'
        }
      }
    }
    return ""
  }


  const val = sharedState.theme[entity][name]

  if(entity == 'colors' || entity == 'tints'){
    return `rgb(${val.join(',')})`
  }
  else if(entity == 'images'){
    const url = `url(file://${sharedState.theme.base_path}/${val})`
    return isWin ? url.replace(/\\/g,'/') : url
  }
  return val
}