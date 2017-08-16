/* Inspired from Atom
  https://github.com/atom/tabs
  https://github.com/atom/atom-dark-ui
*/
const TabStyles = {

  tabWrapper: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },

  tabBar: {
    // @TODO safari needs prefix. Style should be define in CSS.
    // Can't use duprecated key's for inline-style.
    // See https://github.com/facebook/react/issues/2020
    // display: '-webkit-flex',
    // display: '-ms-flexbox',
    display: 'flex',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    userSelect: 'none',
    margin: 0,
    listStyle: 'none',
    outline: '0px',
    overflowY: 'hidden',
    overflowX: 'hidden',
    // paddingRight: '35px',
    height: "27px",
    // zIndex: 10,
    // '-webkit-app-region': 'drag'
  },

  // tabBarAfter: {
  //   content: '',
  //   position: 'absolute',
  //   top: '26px',
  //   height: '5px',
  //   left: 0,
  //   right: 0,
  //   zIndex: 3,
  //   backgroundColor: '#222222',
  //   borderBottom: '1px solid #111111',
  //   pointerEvents: 'none',
  // },

  tab: {
    fontFamily: "'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, sans-serif",
    // backgroundImage: 'linear-gradient(rgb(79, 79, 79), rgb(61, 61, 61))',
    // height: '26px',
    fontSize: '11px',
    position: 'relative',
    // marginLeft: '30px',
    // paddingLeft: '15px',
    // paddingRight: '24px',
    WebkutBoxFlex: 1,
    WebkitFlex: 1,
    MozFlex: 1,
    msFlex: 1,
    flex: 1,
    maxWidth: '200px',
    minWidth: '0px',
    // transform: 'translate(0px, 0px)',
    zIndex: 1
  },

  // tabBefore: {
  //   content: '',
  //   position: 'absolute',
  //   top: '0px',
  //   width: '25px',
  //   height: '26px',
  //
  //   left: '-14px',
  //   borderTopLeftRadius: '3px',
  //   // boxShadow: 'inset 1px 1px 0 rgb(83, 83, 83), -4px 0px 4px rgba(0, 0, 0, 0.1)',
  //   WebkitTransform: 'skewX(-30deg)',
  //   MozTransform: 'skewX(-30deg)',
  //   msTransform: 'skewX(-30deg)',
  //   transform: 'skewX(-30deg)',
  //   backgroundImage: 'linear-gradient(rgb(79, 79, 79), rgb(61, 61, 61))',
  //   borderRadius: '7.5px 0 0 0',
  // },

  // tabAfter: {
  //   content: '',
  //   position: 'absolute',
  //   top: '0px',
  //   width: '25px',
  //   height: '26px',
  //
  //   right: '-14px',
  //   borderTopRightRadius: '3px',
  //   // boxShadow: 'inset -1px 1px 0 rgb(83, 83, 83), 4px 0px 4px rgba(0, 0, 0, 0.1)',
  //   WebkitTransform: 'skewX(30deg)',
  //   MozTransform: 'skewX(30deg)',
  //   msTransform: 'skewX(30deg)',
  //   transform: 'skewX(30deg)',
  //   backgroundImage: 'linear-gradient(rgb(79, 79, 79), rgb(61, 61, 61))',
  //   borderRadius: '0 7.5px 0 0',
  // },

  tabTitle: {
    cursor: 'default',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    width: '100%',
    // textOverflow: 'ellipsis',
    marginTop: '4px',
    marginLeft: '1px',
    // marginLeft: '15px',
    // float: 'left',
    textAlign: 'center',
    postion: 'relative',
    // width: '120%',
    color: 'rgb(170, 170, 170)',
  },

  tabActive: {
    WebkutBoxFlex: 1,
    WebkitFlex: 1,
    MozFlex: 1,
    msFlex: 1,
    flex: 1,
    zIndex: 2,
    // color: '#ffffff',
    // fontSize: '13px',
    // backgroundImage: 'linear-gradient(#343434, #222222)',
  },

  // tabBeforeActive: {
  //   backgroundImage: 'linear-gradient(#343434, #222222)',
  // },
  //
  // tabAfterActive: {
  //   backgroundImage: 'linear-gradient(#343434, #222222)',
  // },

  tabTitleActive: {
    // lineHeight: '1.5em',
    color: 'rgb(255, 255, 255)',
    // marginTop: '3px',
  },

  tabOnHover: {
    // fill: 'rgb(66, 66, 66)'
  },

  // tabBeforeOnHover: {
  //   backgroundImage: 'linear-gradient(rgb(66, 66, 66), rgb(49, 49, 49))',
  // },
  //
  // tabAfterOnHover: {
  //   backgroundImage: 'linear-gradient(rgb(66, 66, 66), rgb(49, 49, 49))',
  // },

  tabTitleOnHover: {
    filter: 'alpha(opacity=20)',
  },

  tabCloseIcon: {
    position: 'absolute',
    cursor: 'pointer',
    font: '16px arial, sans-serif',
    right: '14px',
    marginTop: '7px',
    textDecoration: 'none',
    textShadow: '0 1px 0 #fff',
    lineHeight: '1em',
    filter: 'alpha(opacity=20)',
    opacity: '.2',
    width: '16px',
    height: '16px',
    textAlign: 'center',
    WebkitBorderRadius: '8px',
    MozBorderRadius: '8px',
    borderRadius: '8px',
    zIndex: 9999,
  },

  tabCloseIconOnHover: {
    filter: 'none',
    backgroundColor: 'red',
    color: 'white',
  },

  tabAddButton: {
    cursor: 'pointer',
    borderRadius: '2px',
    width: '25px',
    height: '16px',
    position: 'relative',
    transform: 'skewX(27deg)',
    backgroundColor: 'rgb(79, 79, 79)',
    top: '7px',
    zIndex: 3,
    marginLeft: "14px",
    marginRight: "auto"
    // boxShadow: 'inset 1px 1px 0 rgb(83, 83, 83), -4px 0px 4px rgba(0, 0, 0, 0.1)',
  },

  // beforeTitle: {
  //   position: 'absolute',
  //   top: '5px',
  //   left: '-4px',
  //   zIndex: 3,
  // },
  //
  // afterTitle: {
  //   position: 'absolute',
  //   top: '8px',
  //   right: '16px',
  //   zIndex: 3,
  // },
};

export default TabStyles;
