const code = (function(){
  var urlArr = [], queryArr = [];
  urlArr[0] = ['Google',	 'q=',	 'www.google.'];
  urlArr[1] = ['Yahoo',	 'p=',	 'search.yahoo.c'];
  urlArr[2] = ['Baidu',	 'wd=',	 'www.baidu.com'];
  urlArr[3] = ['Baidu',	 'word=', '.baidu.com'];
  urlArr[4] = ['Ask',		 'q=',	 'www.ask.com'];
  urlArr[5] = ['Bing',	 'q=',	 '.bing.com'];
  urlArr[6] = ['Youdao',	 'q=',	 'www.youdao.com'];

  queryArr[0] = ['query', '/search'];		// most common
  queryArr[1] = ['search', ''];				// most common
  queryArr[2] = ['script_q', 'userscripts.org/scripts/search'];			// userscripts.org
  queryArr[3] = ['top-search-input', 'www.verycd.com/search/folders'];	// verycd.com
  queryArr[4] = ['search-q', '/search'];		// addons.mozilla.org

  function init_KW_SR() {	//for Search Results
    let keyword
    var host = location.host, q = document.location.search.slice(1), e = -1;
    for (i = 0; i < urlArr.length; i++) {
      if (host.indexOf(urlArr[i][2]) != -1 && q.indexOf(urlArr[i][1]) != -1) e = i;//l(e);
    }
    if (e >= 0) {
      keyword = get_KW_from_URL(q, e);//l(keyword);
    }
    return keyword
  }

  function get_KW_from_URL(urlsearch, _e) {
    if (urlArr[_e][0] =='Google' && urlsearch.indexOf('&url=') != -1) urlsearch = urlsearch.replace(/%25/g,'%');  // if it is from Google's redirect link
    var qspairs = urlsearch.split('&'), kwtmp;
    for (k = 0; k < qspairs.length; k++) {
      if (qspairs[k].indexOf(urlArr[_e][1]) == 0) {KW = qspairs[k].substring(urlArr[_e][1].length).replace(/\+/g,' '); break;}
    }//l(KW);
    if (urlArr[_e][0] =='Baidu' && urlsearch.indexOf('ie=utf-8') == -1 && urlsearch.indexOf('ie=UTF-8') == -1) kwtmp = urlDecode(KW);
    /*else*/ kwtmp = decodeURIComponent(KW);
    return clean(kwtmp);
  }

  function clean(str) {
    return str.replace(/(?:(?:\s?(?:site|(?:all)?in(?:url|title|anchor|text)):|(?:\s|^)-)\S*|(\s)(?:OR|AND)\s|[()])/g,'$1');
  }

  return init_KW_SR()
}).toString()

export default function(cont,callback){
  cont.executeScriptInTab('dckpbojndfoinamcdamhkjhnjnmjkfjd',`(${code})()`, {},(err, url, result)=>{
    callback(result[0])
  })
}