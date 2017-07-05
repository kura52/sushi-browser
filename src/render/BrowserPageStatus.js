const React = require('react')
const {Component} = React

export default function BrowserPageStatus(props){
  let status = props.page.statusText
  if (!status && props.page.isLoading)
    status = 'Loading...'
  else if(status){
    try{
      status = decodeURIComponent(status)
    }catch(e){
      console.log(e)
    }
  }
  return <div className={(status ? 'visible' : 'hidden')+" browser-page-status"}>{!status || status.length <= 100 ? status : `${status.substr(0,100)}...`}</div>

}