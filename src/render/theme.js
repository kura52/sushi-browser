const sharedState = require('./sharedState')
const isWin = navigator.userAgent.includes('Windows')

export default function get(entity,name,org){
  let name2
  if(sharedState.inActive && (name == 'theme_frame' || name == 'frame' || name == 'theme_frame_overlay')){
    if(org)
      name = `${name}_inactive`
    else
      name2 = `${name}_inactive`
  }

  if(!sharedState.theme || !sharedState.theme[entity] || !sharedState.theme[entity][name]){
    if(entity == 'colors' || entity == 'tints'){
      let val
      if(entity == 'colors'){
        if(name2 == 'frame_inactive'){
          return 'rgb(245, 245, 245)'
        }
        else if(name == 'frame_inactive'){
          return 'rgb(245, 245, 245)'
        }
        else if(name == 'frame'){
          return 'rgb(221, 221, 221)'
        }
      }
    }
    return ""
  }


  const val = name2 ? (sharedState.theme[entity][name2] || sharedState.theme[entity][name]) : sharedState.theme[entity][name]

  if(entity == 'colors' || entity == 'tints'){
    return `rgb${val.length == 4 ? 'a' : ''}(${val.join(',')})`
  }
  else if(entity == 'images'){
    const url = `url(file://${sharedState.theme.base_path}/${val})`
    return isWin ? url.replace(/\\/g,'/') : url
  }
  return val
}