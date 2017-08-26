const title = location.search.substring(5)
if(title.length > 0) document.title = decodeURIComponent(title)