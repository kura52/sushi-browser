window.process = {
  env : {NODE_ENV: 'development'},
  browser: true,
  cwd : ()=> window.location.pathname.match(/^(.+?)[\\/]{1,2}.+?\.html$/)[1]
}