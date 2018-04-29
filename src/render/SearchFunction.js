if(!window.__complex_search_define__){
// injectのデータ
  const hlClass = 'itel-highlight'
  const selected = 'itel-selected'
  const top_selected = 'isear-top-selected'

  const regPrefix = '@RE:'

// 検索結果のハイライトの色の表示順
  var bgColors = [
    '#FFFF00',
    '#88FF88',
    '#00FFFF',
    '#CCDDFF',
    '#FF88FF',
    '#FF8888',
    '#FFAA00',
  ]
  var barColors = bgColors

  class Word{
    // regbool=trueで強制正規表現
    constructor(sword, regbool=false){
      this.enabled = false

      if(sword == 'OR'){
        return
      }
      if(sword.indexOf('-') == 0){
        return
      }

      // 正規表現の接頭語がついていたら外す
      if(sword.toUpperCase().indexOf(regPrefix) == 0){
        sword = sword.substr(regPrefix.length)
        regbool = true
      }
      if(regbool){
        try{
          this.regexp = new RegExp(sword, `g${matchCase ? '' : 'i'}`)
          this.regbool = true
          this.unified = sword
        }catch(e){
          return
        }
      }else{
        if(!/^"[^"]+"$|^'[^']+'$/g.test(sword)){
          sword = sword.replace(/[()]/g,'')
        }

        sword = sword.replace(/^"(.*)"$/g,'$1')
        sword = sword.replace(/^'(.*)'$/g,'$1')
        this.unified = unifyWord(sword)
      }
      if(sword == ''){
        return
      }
      this.enabled = true
      this.origin = sword
      this.count = new Count()
      this.elems = []
    }
  }
  class Words{
    constructor(swords){
      this.array = []
      this.map = {}
      swords = swords.trim()
      if(swords == ''){
        return
      }
      var unique = {}
      var regunique= {}
      swords = shiftLeftChars(swords, '"', '”')
      swords = shiftLeftChars(swords, "'", "’")
      swords = shiftLeftChars(swords, "(", "（")
      swords = shiftLeftChars(swords, ")", "）")
      var ws = swords.match(/-?"[^"]*"|-?'[^']+'|[^\s\t　"']+/g)
      var regbool = false
      var cnt = 0
      for(let n = 0; n < ws.length; n++){
        let sword = ws[n]
        if(sword.toUpperCase() == regPrefix){
          regbool = true
          continue
        }

        let word = new Word(sword, regbool)
        if(word.origin == undefined){
          continue
        }

        // 文字の重複を無くす
        let uq = unique
        if(word.regbool){
          uq = regunique
        }
        if(uq[word.unified] == true){
          continue
        }
        uq[word.unified] = true

        word.bgColor = bgColors[cnt%bgColors.length]
        word.barColor = barColors[cnt%barColors.length]
        cnt++
        word.id = cnt
        this.array.push(word)
        this.map[word.origin] = word
      }
    }

    getList(key){
      var result = []
      for(let n = 0; n < this.array.length; n++){
        let word = this.array[n]
        let w = word[key]
        if(w == undefined){
          continue
        }
        result.push(w)
      }
      return result
    }
  }

  class Count{
    constructor(){
      this.enabled = false
      this.num = 0
      this.cur = 0
    }
  }

// 文字に融通を聞かせる為
  function shiftLeftCode(code, leftCode, rightCode, range){
    if(rightCode <= code && code <= rightCode+range){
      code = code - rightCode + leftCode
    }
    return code
  }
  function shiftLeftChar(char, leftChar, rightChar, range){
    var code = char.charCodeAt(0)
    var leftCode = leftChar.charCodeAt(0)
    var rightCode = rightChar.charCodeAt(0)
    code = shiftLeftCode(code, leftCode, rightCode, range)
    return String.fromCharCode(code)
  }
// 半角/全角、ひらがな/カタカナを柔軟に検索させるため
  function shiftLeftChars(str, leftChar, rightChar, range = 1){
    var chars = []
    for(let n = 0; n < str.length; n++){
      chars[n] = shiftLeftChar(str[n], leftChar, rightChar, range)
    }
    return chars.join('')
  }
// 大文字/小文字、半角/全角、ひらがな/カタカナを柔軟に検索させるため
  function unifyWord(word){
    if(!matchCase){
      word = shiftLeftChars(word, '!', '！', '~'.charCodeAt(0)-'!'.charCodeAt(0))
      word = shiftLeftChars(word, 'ぁ', 'ァ', 'ゔ'.charCodeAt(0)-'ぁ'.charCodeAt(0))
      word = shiftLeftChars(word, ' ', '　')
      word = word.toUpperCase()
    }
    return word
  }


  var regbool = true;
  var def_option = {
    childList: true,
    characterData: true,
    subtree: true,
  };
  function highlight_all(dest, words) {
    for (var n = 0; n < words.array.length; n++) {
      var word = words.array[n];
      if (!regbool) {
        word.regbool = false;
        word.regexp = undefined;
      }
      word.bgColor = bgColors[n % bgColors.length];
      word.barColor = word.bgColor;
      words_nums[word.origin] = 0;
      replace_auto(dest, word, hlClass);
    }
  }
// 呼び出し元に返す値(callback)
  var words_nums = {};
// 再帰的にテキストノードを書き換えるため
  var icnt = 0;
  function replace_auto(dest, word, className) {
    //word.id, document.body, word.origin, className, word.bgColor, word.regbool, word.barColor
    textNode_req(document.body, className, function (obj) {
      var tmpword = word.origin;
      // 置換処理
      var text = obj.data;
      if (text.trim() == '') {
        return;
      }
      if (word.regbool) {
        var m = regMatch(obj.data, word.origin);
        if (m == null) {
          return;
        }
        tmpword = m[0];
      }
      if (tmpword == '') {
        return;
      }
      var start = unifyWord(obj.data).indexOf(unifyWord(tmpword));
      if (start == -1) {
        return;
      }
      words_nums[word.origin]++;
      var prefix = text.substr(0, start);
      var middle = text.substr(start, tmpword.length);
      var suffix = text.substr(start + tmpword.length);
      var prefix_tn = document.createTextNode(prefix);
      var middle_tn = document.createTextNode(middle);
      var suffix_tn = document.createTextNode(suffix);
      var newObj = document.createElement('esspan');
      newObj.id = 'isear-' + icnt;
      newObj.className = className + ' ' + icnt;
      newObj.style.backgroundColor = word.bgColor;
      newObj.style.color = 'black';
      newObj.appendChild(middle_tn);
      var parent = obj.parentNode;
      parent.replaceChild(suffix_tn, obj);
      parent.insertBefore(prefix_tn, suffix_tn);
      parent.insertBefore(newObj, suffix_tn);
      // ハイライト位置くん
      newObj = document.getElementById('isear-' + icnt);
      if (newObj == null) {
        return;
      }
      word.elems.push(newObj);
      word.count.num++;
      icnt++;
    });
  }
// id:number, obj:any, word:string, className:string, bgcolor:string, regbool:boolean, barcolor:string
  function textNode_req(obj, className, callback) {
    if (obj.nodeType == 3) { // テキストノードなら
      callback(obj);
      return;
    }
    if (obj.nodeType != 1 ||
      new RegExp(className, 'g').test(obj.className)) {
      return;
    }
    for (var n = 0; n < obj.childNodes.length; n++) {
      var child = obj.childNodes[n];
      if (child.nodeType == 1) {
        if (child.style.display == 'none' ||
          child.style.visibility == 'hidden' ||
          child.tagName == 'STYLE' ||
          child.tagName == 'SCRIPT' ||
          child.tagName == 'TEXTAREA') {
          continue;
        }
      }
      textNode_req(child, className, callback);
    }
  }
  function wordMatch(str, word, regbool) {
    if (regbool) {
      var m = regMatch(str, word);
      if (m != null) {
        for (var n = 0; n < m.length; n++) {
          if (m[n] == str) {
            return true;
          }
        }
        return false;
      }
    }
    return unifyWord(str) == unifyWord(word);
  }
  function regMatch(str, regstr) {
    var m = null;
    try {
      m = str.match(new RegExp(regstr, `g${matchCase ? '' : 'i'}`));
    }
    catch (e) {
      return null;
    }
    if (m == null) {
      return null;
    }
    // プログラムの停止(無限ループ？)を回避する
    var result = [];
    for (var n = 0; n < m.length; n++) {
      if (m[n] == '') {
        continue;
      }
      result.push(m[n]);
    }
    return result;
  }
  function offElementsByClassName(className) {
    // 過去の検索結果のハイライトを削除するため
    // えいち・える・えす
    var hls = document.getElementsByClassName(className);
    for (var n = hls.length - 1; n >= 0; n--) {
      var hl = hls[n];
      var tn = document.createTextNode(hl.innerText);
      hl.parentNode.replaceChild(tn, hl);
      tn.parentNode.normalize();
    }
  }
  function getAbsTop(obj) {
    if (obj == null || obj == undefined) {
      return null;
    }
    var rect = obj.getBoundingClientRect();
    var abstop = rect.top + window.pageYOffset;
    return abstop;
  }
  function focusToObj(obj) {
    // 過去のIDを削除する
    var s = document.getElementById(selected);
    if (s != null) {
      s.removeAttribute('id');
    }
    var s = document.getElementById(top_selected);
    if (s != null) {
      s.removeAttribute('id');
    }
    if (obj == null || obj == undefined) {
      return;
    }
    obj.id = selected;
    var clist = obj.classList;
    var top = document.getElementsByClassName('isear-top-' + clist[1])[0];
    if (top == null) {
      return;
    }
    top.id += top_selected;
  }
  function getUnderCurrentElemNum(className) {
    var elems = document.getElementsByClassName(className);
    for (var n = 0; n < elems.length; n++) {
      var elem = elems[n];
      if (getAbsTop(elem) > window.pageYOffset) {
        return n;
      }
    }
    return 0;
  }
  function scrollFocusAuto(obj) {
    if (obj == undefined || obj == null)  return
    obj.scrollIntoViewIfNeeded()
    focusToObj(obj);
  }
  function scrollFocusAutoNum(className, num) {
    var elems = document.getElementsByClassName(className);
    scrollFocusAuto(elems[num]);
  }
  var sfcount = 0;
// 次の位置を返す
  function sfcountNext(sfcount, max) {
    sfcount++;
    sfcount %= max;
    return sfcount;
  }
  function sfcountPrev(sfcount, max) {
    sfcount--;
    if (sfcount == -1) {
      sfcount = max - 1;
    }
    return sfcount;
  }
// 次のワードの位置を返す
  function sfcountNextWord(count, className, word, regbool) {
    if (regbool === void 0) { regbool = false; }
    var elems = document.getElementsByClassName(className);
    var last = sfcountPrev(count, elems.length);
    while (count != last) {
      count = sfcountNext(count, elems.length);
      var elem = elems[count];
      if (wordMatch(elem.innerText, word, regbool)) {
        return count;
      }
    }
    return -1;
  }
  function sfcountPrevWord(count, className, word, regbool) {
    if (regbool === void 0) { regbool = false; }
    var elems = document.getElementsByClassName(className);
    var last = sfcountNext(count, elems.length);
    while (count != last) {
      count = sfcountPrev(count, elems.length);
      var elem = elems[count];
      if (wordMatch(elem.innerText, word, regbool)) {
        return count;
      }
    }
    return -1;
  }
// 探索するクラス名と、選択時に一時的につけるid
  function scrollFocusNext(className, idName) {
    init_sfcount(className, idName, -1);
    var elems = document.getElementsByClassName(className);
    const length = elems.length
    if(!length) return '0/0'

    sfcount = sfcountNext(sfcount, length);
    scrollFocusAuto(elems[sfcount]);
    return `${sfcount + 1}/${length}`
  }
  function scrollFocusPrev(className, idName) {
    init_sfcount(className, idName, 1);
    var elems = document.getElementsByClassName(className);
    const length = elems.length
    if(!length) return '0/0'

    sfcount = sfcountPrev(sfcount, length);
    scrollFocusAuto(elems[sfcount]);
    return `${sfcount + 1}/${length}`
  }
// 次のワードを辿る
  function scrollFocusNextWord(word, className, idName, regbool) {
    init_sfcount(className, idName, -1);
    sfcount = sfcountNextWord(sfcount, className, word, regbool);
    var elems = document.getElementsByClassName(className);
    scrollFocusAuto(elems[sfcount]);
  }
// 前のワードをたどる(上の関数の取り消し)
  function scrollFocusPrevWord(word, className, idName, regbool) {
    init_sfcount(className, idName, 1);
    sfcount = sfcountPrevWord(sfcount, className, word, regbool);
    var elems = document.getElementsByClassName(className);
    scrollFocusAuto(elems[sfcount]);
  }
// pm:補正
  function init_sfcount(className, idName, pm) {
    var selected = document.getElementById(idName);
    if (selected == null) {
      sfcount = getUnderCurrentElemNum(className);
      sfcount += pm;
    }
  }
// フォーカス位置より前のワード数+1をカウント
  function countBeforeWords(word, className, regbool) {
    var elems = document.getElementsByClassName(className);
    var count = 0;
    for (var i = sfcount; i >= 0; i--) {
      var elem = elems[i];
      if (wordMatch(elem.innerText, word, regbool)) {
        count++;
      }
    }
    return count;
  }
  function countAllWords(word, className, regbool) {
    var elems = document.getElementsByClassName(className);
    var count = 0;
    for (var i = elems.length - 1; i >= 0; i--) {
      var elem = elems[i];
      if (wordMatch(elem.innerText, word, regbool)) {
        count++;
      }
    }
    return count;
  }
// 検索結果をハイライトする処理
  var itel_inject_flag = false;
  var search_words_prev,matchCase
  function itel_main(search_words, enabled, _matchCase) {
    if(search_words_prev == search_words && _matchCase == matchCase) return
    gstatus.enabled = enabled;
    var words = new Words(search_words);
    if (words.array.length == 0) {
      enabled = false;
    }
    reset_all();
    search_words_prev = search_words
    matchCase = _matchCase
    return parsed_main(words, enabled);
  }
  function parsed_main(words, enabled) {
    // 全部リセット
    if (!enabled) {
      return;
    }
    highlight_all(document.body, words);
    defineEvents(words, enabled);
    window.onresize(null);
    return words_nums;
  }
  var already_event = false;
  var gstatus = { words: null, enabled: null };
// var global_words:Words
// var global_enabled:boolean
  function defineEvents(words, enabled) {
    // イベントは一度しか登録しなくていいけど、値は共有すべき
    gstatus.words = words;
    gstatus.enabled = enabled;
    if (already_event) {
      return;
    }
    already_event = true;
    document.body.onkeydown = function (e) {
      bodyKeydownEvent(e, gstatus.words);
    };
    window.onresize = function () {
      words = gstatus.words;
      if (!enabled) {
        return;
      }
    }
  }

  function reset_all() {
    offElementsByClassName('itel-highlight')
    search_words_prev = void 0
    matchCase = void 0
  }

  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(`#itel-selected, #isear-top-selected {
    background-color: #ff9632 !important;
    color: black !important;
}
`));
  document.head.appendChild(style);

  window.__complex_search_define__ = {
    itel_main,
    reset_all,
    scrollFocusNext,
    scrollFocusPrev
  }
}