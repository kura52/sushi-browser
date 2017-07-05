var process = {
  env : {NODE_ENV: 'development'},
  cwd : ()=> window.location.pathname.match(/^(.+?)[\\/]{1,2}history.html$/)[1]
}