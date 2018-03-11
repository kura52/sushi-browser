'use strict';

(function () {
  var xpath_to_lower         = function (s) {
        return 'translate(' +
                (s || 'normalize-space()') +
                ', \'ABCDEFGHJIKLMNOPQRSTUVWXYZ\'' +
                ', \'abcdefghjiklmnopqrstuvwxyz\')';
      },
      xpath_ends_with        = function (s1, s2) {
        return 'substring(' + s1 + ',' +
                'string-length(' + s1 + ')-string-length(' + s2 + ')+1)=' + s2;
      },
      xpath_url              = function (s) {
        return 'substring-before(concat(substring-after(' +
                (s || xpath_url_attrs) + ',"://"),"?"),"?")';
      },
      xpath_url_path         = function (s) {
        return 'substring-after(' + (s || xpath_url_attrs) + ',"/")';
      },
      xpath_url_domain       = function (s) {
        return 'substring-before(concat(substring-after(' +
               (s || xpath_url_attrs) + ',"://"),"/"),"/")';
      },
      xpath_url_attrs        = '@href|@src',
      xpath_lower_case       = xpath_to_lower(),
      xpath_ns_uri           = 'ancestor-or-self::*[last()]/@url',
      xpath_ns_path          = xpath_url_path(xpath_url(xpath_ns_uri)),
      xpath_has_protocal     = '(starts-with(' + xpath_url_attrs + ',"http://") or starts-with(' + xpath_url_attrs + ',"https://"))',
      xpath_is_internal      = 'starts-with(' + xpath_url() + ',' + xpath_url_domain(xpath_ns_uri) + ') or ' + xpath_ends_with(xpath_url_domain(), xpath_url_domain(xpath_ns_uri)),
      xpath_is_local         = '(' + xpath_has_protocal + ' and starts-with(' + xpath_url() + ',' + xpath_url(xpath_ns_uri) + '))',
      xpath_is_path          = 'starts-with(' + xpath_url_attrs + ',"/")',
      xpath_is_local_path    = 'starts-with(' + xpath_url_path() + ',' + xpath_ns_path + ')',
      xpath_normalize_space  = 'normalize-space()',
      xpath_internal         = '[not(' + xpath_has_protocal + ') or ' + xpath_is_internal + ']',
      xpath_external         = '[' + xpath_has_protocal + ' and not(' + xpath_is_internal + ')]',
      escape_literal         = String.fromCharCode(30),
      escape_parens          = String.fromCharCode(31),
      regex_string_literal   = /("[^"\x1E]*"|'[^'\x1E]*'|=\s*[^\s\]\'\"]+)/g,
      regex_escaped_literal  = /['"]?(\x1E+)['"]?/g,
      regex_css_wrap_pseudo  = /(\x1F\)|[^\)])\:(first|limit|last|gt|lt|eq|nth)([^\-]|$)/,
      regex_specal_chars     = /[\x1C-\x1F]+/g,
      regex_first_axis       = /^([\s\(\x1F]*)(\.?[^\.\/\(]{1,2}[a-z]*:*)/,
      regex_filter_prefix    = /(^|\/|\:)\[/g,
      regex_attr_prefix      = /([^\(\[\/\|\s\x1F])\@/g,
      regex_nth_equation     = /^([-0-9]*)n.*?([0-9]*)$/,
      css_combinators_regex  = /\s*(!?[+>~,^ ])\s*(\.?\/+|[a-z\-]+::)?([a-z\-]+\()?((and\s*|or\s*|mod\s*)?[^+>~,\s'"\]\|\^\$\!\<\=\x1C-\x1F]+)?/g,
      css_combinators_callback = function (match, operator, axis, func, literal, exclude, offset, orig) {
        var prefix = ''; // If we can, we'll prefix a '.'

        // XPath operators can look like node-name selectors
        // Detect false positive for " and", " or", " mod"
        if (operator === ' ' && exclude !== undefined) {
          return match;
        }

        if (axis === undefined) {
          // Only allow node-selecting XPath functions
          // Detect false positive for " + count(...)", " count(...)", " > position()", etc.
          if (func !== undefined && (func !== 'node(' && func !== 'text(' && func !== 'comment('))                {
            return;
          } else if (literal === undefined) {
            literal = func;
          } // Handle case " + text()", " > comment()", etc. where "func" is our "literal"

            // XPath math operators match some CSS combinators
            // Detect false positive for " + 1", " > 1", etc.
          if (isNumeric(literal)) {
            return match;
          }

          var prevChar = orig.charAt(offset - 1);

          if (prevChar.length === 0 ||
                prevChar === '(' ||
                prevChar === '|' ||
                prevChar === ':') {
            prefix = '.';
          }
        }

        // Return if we don't have a selector to follow the axis
        if (literal === undefined) {
          if (offset + match.length === orig.length) {
            literal = '*';
          } else {
            return match;
          }
        }


        switch (operator) {
        case ' ':
          return '//' + literal;
        case '>':
          return '/' + literal;
        case '+':
          return prefix + '/following-sibling::*[1]/self::' + literal;
        case '~':
          return prefix + '/following-sibling::' + literal;
        case ',':
          if (axis === undefined) {

          }
          axis = './/';
          return '|' + axis + literal;
        case '^': // first child
          return '/child::*[1]/self::' + literal;
        case '!^': // last child
          return '/child::*[last()]/self::' + literal;
        case '! ': // ancestor-or-self
          return '/ancestor-or-self::' + literal;
        case '!>': // direct parent
          return '/parent::' + literal;
        case '!+': // adjacent preceding sibling
          return '/preceding-sibling::*[1]/self::' + literal;
        case '!~': // preceding sibling
          return '/preceding-sibling::' + literal;
            // case '~~'
            // return '/following-sibling::*/self::|'+selectorStart(orig, offset)+'/preceding-sibling::*/self::'+literal;
        }
      },

      css_attributes_regex = /\[([^\@\|\*\=\^\~\$\!\(\/\s\x1C-\x1F]+)\s*(([\|\*\~\^\$\!]?)=?\s*(\x1E+))?\]/g,
      css_attributes_callback = function (str, attr, comp, op, val, offset, orig) {
        var axis = '';
        var prevChar = orig.charAt(offset - 1);

        /*
        if (prevChar === '/' || // found after an axis shortcut ("/", "//", etc.)
            prevChar === ':')   // found after an axis ("self::", "parent::", etc.)
            axis = '*';*/

        switch (op) {
        case '!':
          return axis + '[not(@' + attr + ') or @' + attr + '!="' + val + '"]';
        case '$':
          return axis + '[substring(@' + attr + ',string-length(@' + attr + ')-(string-length("' + val + '")-1))="' + val + '"]';
        case '^':
          return axis + '[starts-with(@' + attr + ',"' + val + '")]';
        case '~':
          return axis + '[contains(concat(" ",normalize-space(@' + attr + ')," "),concat(" ","' + val + '"," "))]';
        case '*':
          return axis + '[contains(@' + attr + ',"' + val + '")]';
        case '|':
          return axis + '[@' + attr + '="' + val + '" or starts-with(@' + attr + ',concat("' + val + '","-"))]';
        default:
          if (comp === undefined) {
            if (attr.charAt(attr.length - 1) === '(' || attr.search(/^[0-9]+$/) !== -1 || attr.indexOf(':') !== -1)                        {
              return str;
            }
            return axis + '[@' + attr + ']';
          } else {
            return axis + '[@' + attr + '="' + val + '"]';
          }
        }
      },

      css_pseudo_classes_regex = /:([a-z\-]+)(\((\x1F+)(([^\x1F]+(\3\x1F+)?)*)(\3\)))?/g,
      css_pseudo_classes_callback = function (match, name, g1, g2, arg, g3, g4, g5, offset, orig) {
        if (orig.charAt(offset - 1) === ':' && orig.charAt(offset - 2) !== ':') {
            // XPath "axis::node-name" will match
            // Detect false positive ":node-name"
          return match;
        }

        if (name === 'odd' || name === 'even') {
          arg  = name;
          name = 'nth-of-type';
        }

        switch (name) { // name.toLowerCase()?
        case 'after':
          return '[count(' + css2xpath('preceding::' + arg, true) + ') > 0]';
        case 'after-sibling':
          return '[count(' + css2xpath('preceding-sibling::' + arg, true) + ') > 0]';
        case 'before':
          return '[count(' + css2xpath('following::' + arg, true) + ') > 0]';
        case 'before-sibling':
          return '[count(' + css2xpath('following-sibling::' + arg, true) + ') > 0]';
        case 'checked':
          return '[@selected or @checked]';
        case 'contains':
          return '[contains(' + xpath_normalize_space + ',' + arg + ')]';
        case 'icontains':
          return '[contains(' + xpath_lower_case + ',' + xpath_to_lower(arg) + ')]';
        case 'empty':
          return '[not(*) and not(normalize-space())]';
        case 'enabled':
        case 'disabled':
          return '[@' + name + ']';
        case 'first-child':
          return '[not(preceding-sibling::*)]';
        case 'first':
        case 'limit':
        case 'first-of-type':
          if (arg !== undefined)                    {
            return '[position()<=' + arg + ']';
          }
          return '[1]';
        case 'gt':
                // Position starts at 0 for consistency with Sizzle selectors
          return '[position()>' + (parseInt(arg, 10) + 1) + ']';
        case 'lt':
                // Position starts at 0 for consistency with Sizzle selectors
          return '[position()<' + (parseInt(arg, 10) + 1) + ']';
        case 'last-child':
          return '[not(following-sibling::*)]';
        case 'only-child':
          return '[not(preceding-sibling::*) and not(following-sibling::*)]';
        case 'only-of-type':
          return '[not(preceding-sibling::*[name()=name(self::node())]) and not(following-sibling::*[name()=name(self::node())])]';
        case 'nth-child':
          if (isNumeric(arg))                    {
            return '[(count(preceding-sibling::*)+1) = ' + arg + ']';
          }
          switch (arg) {
          case 'even':
            return '[(count(preceding-sibling::*)+1) mod 2=0]';
          case 'odd':
            return '[(count(preceding-sibling::*)+1) mod 2=1]';
          default:
            var a = (arg || '0').replace(regex_nth_equation, '$1+$2').split('+');

            a[0] = a[0] || '1';
            a[1] = a[1] || '0';
            return '[(count(preceding-sibling::*)+1)>=' + a[1] + ' and ((count(preceding-sibling::*)+1)-' + a[1] + ') mod ' + a[0] + '=0]';
          }
        case 'nth-of-type':
          if (isNumeric(arg))                    {
            return '[' + arg + ']';
          }
          switch (arg) {
          case 'odd':
            return '[position() mod 2=1]';
          case 'even':
            return '[position() mod 2=0 and position()>=0]';
          default:
            var a = (arg || '0').replace(regex_nth_equation, '$1+$2').split('+');

            a[0] = a[0] || '1';
            a[1] = a[1] || '0';
            return '[position()>=' + a[1] + ' and (position()-' + a[1] + ') mod ' + a[0] + '=0]';
          }
        case 'eq':
        case 'nth':
          // Position starts at 0 for consistency with Sizzle selectors
          if (isNumeric(arg)) {
            return '[' + (parseInt(arg, 10) + 1) + ']';
          }

          return '[1]';
        case 'text':
          return '[@type="text"]';
        case 'istarts-with':
          return '[starts-with(' + xpath_lower_case + ',' + xpath_to_lower(arg) + ')]';
        case 'starts-with':
          return '[starts-with(' + xpath_normalize_space + ',' + arg + ')]';
        case 'iends-with':
          return '[' + xpath_ends_with(xpath_lower_case, xpath_to_lower(arg)) + ']';
        case 'ends-with':
          return '[' + xpath_ends_with(xpath_normalize_space, arg) + ']';
        case 'has':
          var xpath = prependAxis(css2xpath(arg, true), './/');

          return '[count(' + xpath + ') > 0]';
        case 'has-sibling':
          var xpath = css2xpath('preceding-sibling::' + arg, true);

          return '[count(' + xpath + ') > 0 or count(following-sibling::' + xpath.substr(19) + ') > 0]';
        case 'has-parent':
          return '[count(' + css2xpath('parent::' + arg, true) + ') > 0]';
        case 'has-ancestor':
          return '[count(' + css2xpath('ancestor::' + arg, true) + ') > 0]';
        case 'last':
        case 'last-of-type':
          if (arg !== undefined)                    {
            return '[position()>last()-' + arg + ']';
          }
          return '[last()]';
        case 'selected': // Sizzle: "(option) elements that are currently selected"
          return '[local-name()="option" and @selected]';
        case 'skip':
        case 'skip-first':
          return '[position()>' + arg + ']';
        case 'skip-last':
          if (arg !== undefined)                    {
            return '[last()-position()>=' + arg + ']';
          }
          return '[position()<last()]';
        case 'root':
          return '/ancestor::[last()]';
        case 'range':
          var arr = arg.split(',');

          return '[' + arr[0] + '<=position() and position()<=' + arr[1] + ']';
        case 'input': // Sizzle: "input, button, select, and textarea are all considered to be input elements."
          return '[local-name()="input" or local-name()="button" or local-name()="select" or local-name()="textarea"]';
        case 'internal':
          return xpath_internal;
        case 'external':
          return xpath_external;
        case 'http':
        case 'https':
        case 'mailto':
        case 'javascript':
          return '[starts-with(@href,concat("' + name + '",":"))]';
        case 'domain':
          return '[(string-length(' + xpath_url_domain() + ')=0 and contains(' + xpath_url_domain(xpath_ns_uri) + ',' + arg + ')) or contains(' + xpath_url_domain() + ',' + arg + ')]';
        case 'path':
          return '[starts-with(' + xpath_url_path() + ',substring-after("' + arg + '","/"))]'
        case 'not':
          var xpath = css2xpath(arg, true);

          if (xpath.charAt(0) === '[')                    {
            xpath = 'self::node()' + xpath;
          }
          return '[not(' + xpath + ')]';
        case 'target':
          return '[starts-with(@href, "#")]';
        case 'root':
          return 'ancestor-or-self::*[last()]';
            /* case 'active':
            case 'focus':
            case 'hover':
            case 'link':
            case 'visited':
                return '';*/
        case 'lang':
          return '[@lang="' + arg + '"]';
        case 'read-only':
        case 'read-write':
          return '[@' + name.replace('-', '') + ']';
        case 'valid':
        case 'required':
        case 'in-range':
        case 'out-of-range':
          return '[@' + name + ']';
        default:
          return str;
        }
      },

      css_ids_classes_regex = /(#|\.)([^\#\@\.\/\(\[\)\]\|\:\s\+\>\<\'\"\x1D-\x1F]+)/g,
      css_ids_classes_callback = function (str, op, val, offset, orig) {
        var axis = '';
        /* var prevChar = orig.charAt(offset-1);
        if (prevChar.length === 0 ||
            prevChar === '/' ||
            prevChar === '(')
            axis = '*';
        else if (prevChar === ':')
            axis = 'node()';*/
        if (op === '#')            {
          return axis + '[@id="' + val + '"]';
        }
        return axis + '[contains(concat(" ",normalize-space(@class)," ")," ' + val + ' ")]';
      };

    // Prepend descendant-or-self if no other axis is specified
  function prependAxis(s, axis) {
    return s.replace(regex_first_axis, function (match, start, literal) {
      if (literal.substr(literal.length - 2) === '::') // Already has axis::
            {
        return match;
      }

      if (literal.charAt(0) === '[')            {
        axis += '*';
      }
        // else if (axis.charAt(axis.length-1) === ')')
        //    axis += '/';
      return start + axis + literal;
    });
  }

    // Find the begining of the selector, starting at i and working backwards
  function selectorStart(s, i) {
    var depth = 0;
    var offset = 0;

    while (i--) {
      switch (s.charAt(i)) {
      case ' ':
      case escape_parens:
        offset++;
        break;
      case '[':
      case '(':
        depth--;

        if (depth < 0)                    {
          return ++i + offset;
        }
        break;
      case ']':
      case ')':
        depth++;
        break;
      case ',':
      case '|':
        if (depth === 0)                    {
          return ++i + offset;
        }
      default:
        offset = 0;
      }
    }

    return 0;
  }

    // Check if string is numeric
  function isNumeric(s) {
    var num = parseInt(s, 10);

    return (!isNaN(num) && '' + num === s);
  }

    // Append escape "char" to "open" or "close"
  function escapeChar(s, open, close, char) {
    var depth = 0;

    return s.replace(new RegExp('[\\' + open + '\\' + close + ']', 'g'), function (a) {
      if (a === open)            {
        depth++;
      }

      if (a === open) {
        return a + repeat(char, depth);
      } else {
        return repeat(char, depth--) + a;
      }
    })
  }

  function repeat(str, num) {
    num = Number(num);
    var result = '';

    while (true) {
      if (num & 1)            {
        result += str;
      }
      num >>>= 1;

      if (num <= 0) {
        break;
      }
      str += str;
    }

    return result;
  }

  function css2xpath(s, nested) {
    // s = s.trim();

    if (nested === true) {
        // Replace :pseudo-classes
      s = s.replace(css_pseudo_classes_regex, css_pseudo_classes_callback);

        // Replace #ids and .classes
      s = s.replace(css_ids_classes_regex, css_ids_classes_callback);

      return s;
    }

    // Tag open and close parenthesis pairs (for RegExp searches)
    s = escapeChar(s, '(', ')', escape_parens);

    // Remove and save any string literals
    var literals = [];

    s = s.replace(regex_string_literal, function (s, a) {
      if (a.charAt(0) === '=') {
        a = a.substr(1).trim();

        if (isNumeric(a))                {
          return s;
        }
      } else {
        a = a.substr(1, a.length - 2);
      }

      return repeat(escape_literal, literals.push(a));
    });

    // Replace CSS combinators (" ", "+", ">", "~", ",") and reverse combinators ("!", "!+", "!>", "!~")
    s = s.replace(css_combinators_regex, css_combinators_callback);

    // Replace CSS attribute filters
    s = s.replace(css_attributes_regex, css_attributes_callback);

    // Wrap certain :pseudo-classes in parens (to collect node-sets)
    while (true) {
      var index = s.search(regex_css_wrap_pseudo);

      if (index === -1) {
        break;
      }
      index = s.indexOf(':', index);
      var start = selectorStart(s, index);

      s = s.substr(0, start) +
            '(' + s.substring(start, index) + ')' +
            s.substr(index);
    }

    // Replace :pseudo-classes
    s = s.replace(css_pseudo_classes_regex, css_pseudo_classes_callback);

    // Replace #ids and .classes
    s = s.replace(css_ids_classes_regex, css_ids_classes_callback);

    // Restore the saved string literals
    s = s.replace(regex_escaped_literal, function (s, a) {
      var str = literals[a.length - 1];

      return '"' + str + '"';
    })

    // Remove any special characters
    s = s.replace(regex_specal_chars, '');

    // add * to stand-alone filters
    s = s.replace(regex_filter_prefix, '$1*[');

    // add "/" between @attribute selectors
    s = s.replace(regex_attr_prefix, '$1/@');

    /*
    Combine multiple filters?

    s = escapeChar(s, '[', ']', filter_char);
    s = s.replace(/(\x1D+)\]\[\1(.+?[^\x1D])\1\]/g, ' and ($2)$1]')
    */

    s = prependAxis(s, './/'); // prepend ".//" axis to begining of CSS selector
    return s;
  }


  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = css2xpath;
  } else {
    window.css2xpath = css2xpath;
  }

})();
