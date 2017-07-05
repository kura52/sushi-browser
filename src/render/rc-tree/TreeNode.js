import React, { PropTypes } from 'react';
import assign from 'object-assign';
import classNames from 'classnames';
// import Animate from 'rc-animate';
import { browser } from './util';

const browserUa = typeof window !== 'undefined' ? browser(window.navigator) : '';
const ieOrEdge = /.*(IE|Edge).+/.test(browserUa);
// const uaArray = browserUa.split(' ');
// const gtIE8 = uaArray.length !== 2 || uaArray[0].indexOf('IE') === -1 || Number(uaArray[1]) > 8;

const defaultTitle = '---';

function equal(a,b){
  const len = a.length
  if(len!=b.length) return false
  for(let i = 0; i < len; i++){
    if(a[i]!=b[i]) return false
  }
  return true
}

class TreeNode extends React.Component {
  constructor(props) {
    super(props);
    [
      'onExpand',
      'onCheck',
      'onContextMenu',
      'onMouseEnter',
      'onMouseLeave',
      'onDragStart',
      'onDragEnter',
      'onDragOver',
      'onDragLeave',
      'onDrop',
      'onDragEnd',
    ].forEach((m) => {
      this[m] = this[m].bind(this);
    });
    this.state = {
      dataLoading: false,
      dragNodeHighlight: false,
    };
    this.refChildren = []
  }


  componentDidMount() {
    if (!this.props.root._treeNodeInstances) {
      this.props.root._treeNodeInstances = [];
    }
    this.props.root._treeNodeInstances.push(this);

    if(this.props.refParent){
      const ref = this.props.refParent
      const item = this.props.item
      ref.nodes.set(item.path,this)
      if(!ref.nodeMap.has(item.path)) ref.nodeMap.set(item.path,item.children)
    }

  }

  shouldComponentUpdate(nextProps, nextState) {
    if(window.expandKey){
      if(window.expandKey.startsWith(this.props.k)){
        return true
      }
    }
    // if(this.props.expanded) return true
    const ret = !(
      // this.props.childrenUpdate === nextProps.childrenUpdate &&
      this.props.expanded === nextProps.expanded &&
        this.props.title === nextProps.title &&
        this.props.className === nextProps.className &&
      this.props.selected === nextProps.selected &&
      this.props.prefixCls === nextProps.prefixCls &&
      this.props.disabled === nextProps.disabled &&
      this.props.dragOver === nextProps.dragOver &&
      this.props.dragOverGapTop === nextProps.dragOverGapTop &&
      this.props.dragOverGapBottom === nextProps.dragOverGapBottom &&
      this.state.dataLoading === nextState.dataLoading &&
      this.state.dragNodeHighlight === nextState.dragNodeHighlight &&
        equal(this.refChildren,nextProps.refChildren)
    )
    // console.log(this.props.k,this.refChildren,nextProps.refChildren,this.props.root)
    // console.log(this.props.expanded === nextProps.expanded , this.props.title === nextProps.title , this.props.selected === nextProps.selected , this.props.prefixCls === nextProps.prefixCls , this.props.disabled === nextProps.disabled , this.props.dragOver === nextProps.dragOver , this.props.dragOverGapTop === nextProps.dragOverGapTop , this.props.dragOverGapBottom === nextProps.dragOverGapBottom , this.state.dataLoading === nextState.dataLoading , this.state.dragNodeHighlight === nextState.dragNodeHighlight , equal(this.refChildren,nextProps.refChildren))
    if(ret) {
      // this.expanded = nextProps.expanded
      // this.title = nextProps.title
      this.refChildren = nextProps.refChildren.slice(0)
    }

    return ret
  }

  onCheck() {
    this.props.root.onCheck(this);
  }

  onSelect() {
    this.props.root.onSelect(this);
  }

  onMouseEnter(e) {
    e.preventDefault();
    this.props.root.onMouseEnter(e, this);
  }

  onMouseLeave(e) {
    e.preventDefault();
    this.props.root.onMouseLeave(e, this);
  }

  onContextMenu(e) {
    e.preventDefault();
    this.props.root.onContextMenu(e, this);
  }

  createDragImage(e,num){
    const canvas = document.createElement('canvas')
    canvas.className = 'drag-image'
    document.body.appendChild(canvas)
    const context = canvas.getContext('2d')

    canvas.width = 85
    canvas.height = 20

    context.fillStyle = '#666666'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = '#dddddd'
    context.font = 'bold 13px Arial'
    context.fillText(`${num} Items`, 15, 15)

    e.dataTransfer.setDragImage(canvas, 5, 9)
    return canvas
  }

  onDragStart(e) {
    // console.log('dragstart', this.props.eventKey, e);
    // e.preventDefault();
    e.stopPropagation();
    this.setState({
      dragNodeHighlight: true,
    });
    const len = this.props.root.state.selectedKeys.length
    if(len > 1){
      const canvas = this.createDragImage(e,len)
      this.dragImage = canvas
    }
    this.props.root.onDragStart(e, this);
    try {
      // ie throw error
      // firefox-need-it
      e.dataTransfer.setData('text/plain', '');
    } catch (error) {
      // empty
    }
  }

  onDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.root.onDragEnter(e, this);
  }

  onDragOver(e) {
    // todo disabled
    e.preventDefault();
    e.stopPropagation();
    this.props.root.onDragOver(e, this);
    return false;
  }

  onDragLeave(e) {
    e.stopPropagation();
    this.props.root.onDragLeave(e, this);
  }

  onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      dragNodeHighlight: false,
    });
    this.props.root.onDrop(e, this);
  }

  onDragEnd(e) {
    e.stopPropagation();
    this.setState({
      dragNodeHighlight: false,
    });
    this.props.root.onDragEnd(e, this);
    if(this.dragImage){
      document.body.removeChild(this.dragImage)
      this.dragImage = (void 0)
    }
  }

  onExpand() {
    const callbackPromise = this.props.root.onExpand(this);
    if (callbackPromise && typeof callbackPromise === 'object') {
      const setLoading = (dataLoading) => {
        this.setState({ dataLoading });
      };
      setLoading(true);
      callbackPromise.then(() => {
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    }
  }

  // keyboard event support
  onKeyDown(e) {
    // e.preventDefault();
  }

  renderSwitcher(props, expandedState) {
    const prefixCls = props.prefixCls;
    const switcherCls = {
      [`${prefixCls}-switcher`]: true,
    };
    if (!props.showLine) {
      switcherCls[`${prefixCls}-noline_${expandedState}`] = true;
    } else if (props.pos === '0-0') {
      switcherCls[`${prefixCls}-roots_${expandedState}`] = true;
    } else {
      switcherCls[`${prefixCls}-center_${expandedState}`] = !props.last;
      switcherCls[`${prefixCls}-bottom_${expandedState}`] = props.last;
    }
    // if (props.disabled) {
    //   switcherCls[`${prefixCls}-switcher-disabled`] = true;
    //   return <span className={classNames(switcherCls)}></span>;
    // }
    switch(classNames(switcherCls)){
      case 'rc-tree-switcher rc-tree-noline_close' :
        return <i className="fa fa-caret-right caret" aria-hidden="true" onClick={this.onExpand}></i>
      case 'rc-tree-switcher rc-tree-noline_open' :
        return <i className="fa fa-caret-down caret" aria-hidden="true" onClick={this.onExpand}></i>
    }
    // return <span className={classNames(switcherCls)} onClick={this.onExpand}></span>;
  }

  renderCheckbox(props) {
    const prefixCls = props.prefixCls;
    const checkboxCls = {
      [`${prefixCls}-checkbox`]: true,
    };
    if (props.checked) {
      checkboxCls[`${prefixCls}-checkbox-checked`] = true;
    } else if (props.halfChecked) {
      checkboxCls[`${prefixCls}-checkbox-indeterminate`] = true;
    }
    let customEle = null;
    if (typeof props.checkable !== 'boolean') {
      customEle = props.checkable;
    }
    if (props.disabled || props.disableCheckbox) {
      checkboxCls[`${prefixCls}-checkbox-disabled`] = true;
      return <span ref="checkbox" className={classNames(checkboxCls)}>{customEle}</span>;
    }
    return (
      <span ref="checkbox"
        className={classNames(checkboxCls) }
        onClick={this.onCheck}
      >{customEle}</span>);
  }

  renderChildren(props) {
    const renderFirst = this.renderFirst;
    this.renderFirst = 1;
    let transitionAppear = true;
    if (!renderFirst && props.expanded) {
      transitionAppear = false;
    }
    const children = props.children;
    let newChildren = children;
    if (children &&
      (children.type === TreeNode ||
      Array.isArray(children) &&
      children.every((item) => {
        return item.type === TreeNode;
      }))) {
      const cls = {
        [`${props.prefixCls}-child-tree`]: true,
        [`${props.prefixCls}-child-tree-open`]: props.expanded,
      };
      if (props.showLine) {
        cls[`${props.prefixCls}-line`] = !props.last;
      }
      const animProps = {};
      if (props.openTransitionName) {
        animProps.transitionName = props.openTransitionName;
      } else if (typeof props.openAnimation === 'object') {
        animProps.animation = assign({}, props.openAnimation);
        if (!transitionAppear) {
          delete animProps.animation.appear;
        }
      }
      newChildren = (
        <div {...animProps}
          showProp="data-expanded"
          transitionAppear={transitionAppear}
          component=""
        >
          {!props.expanded ? null : <ul className={classNames(cls)} data-expanded={props.expanded}>
            {React.Children.map(children, (item, index) => {
              return props.root.renderTreeNode(item, index, props.pos);
            }, props.root)}
          </ul>}
        </div>
      );
    }
    return newChildren;
  }

  render() {
    const props = this.props;
    const prefixCls = props.prefixCls;
    const expandedState = props.expanded ? 'open' : 'close';
    let iconState = expandedState;

    let canRenderSwitcher = true;
    const content = props.title;
    let newChildren = this.renderChildren(props);
    if (!newChildren || newChildren === props.children) {
      // content = newChildren;
      newChildren = null;
      if (!props.loadData || props.isLeaf) {
        canRenderSwitcher = false;
        iconState = 'docu';
      }
    }
    // For performance, does't render children into dom when `!props.expanded` (move to Animate)
    // if (!props.expanded) {
    //   newChildren = null;
    // }

    const iconEleCls = {
      [`${prefixCls}-iconEle`]: true,
      [`${prefixCls}-icon_loading`]: this.state.dataLoading,
      [`${prefixCls}-icon__${iconState}`]: true,
    };

    const selectHandle = () => {
      let icon = null;
      switch(classNames(iconEleCls)){
        case 'rc-tree-iconEle rc-tree-icon__close':
          icon = <i className="fa fa-folder folder" aria-hidden="true"></i>
          break
        case 'rc-tree-iconEle rc-tree-icon__open':
          icon = <i className="fa fa-folder-open folder-open" aria-hidden="true"></i>
          break
        case 'rc-tree-iconEle rc-tree-icon__docu':
          icon = this.props.favicon ? this.props.favicon == "empty" ? "" : <img src={this.props.favicon} className="favi-favorite"/> : <i className="fa fa-file doc" aria-hidden="true"></i>
          break
        default:
          <span className={classNames(iconEleCls)}></span>

      }

      const title = <span className={`${prefixCls}-title`}>{content}</span>;
      const wrap = `${prefixCls}-node-content-wrapper`;
      const domProps = {
        className: `${wrap} ${wrap}-${iconState === expandedState ? iconState : 'normal'}`,
      };
      if (!props.disabled) {
        // console.log(33533,props.selected,!props._dropTrigger,this.state.dragNodeHighlight)
        if (props.selected || !props._dropTrigger && this.state.dragNodeHighlight) {
          domProps.className += ` ${prefixCls}-node-selected`;
        }
        domProps.onClick = (e) => {
          e.preventDefault();
          if (props.selectable) {
            this.onSelect();
          }
          // not fire check event
          // if (props.checkable) {
          //   this.onCheck();
          // }
        };
        if (props.onRightClick) {
          domProps.onContextMenu = this.onContextMenu;
        }
        if (props.onMouseEnter) {
          domProps.onMouseEnter = this.onMouseEnter;
        }
        if (props.onMouseLeave) {
          domProps.onMouseLeave = this.onMouseLeave;
        }
        if (props.draggable) {
          domProps.className += ' draggable target';
          if (ieOrEdge) {
            // ie bug!
            domProps.href = '#';
          }
          domProps.draggable = true;
          domProps['aria-grabbed'] = true;
          domProps.onDragStart = this.onDragStart;
        }
      }
      domProps.onMouseDown = this.props.onMouseDown
      // console.log(456,domProps)
      return (
        <a ref="selectHandle" title={typeof content === 'string' ? content : ''} {...domProps}>
          {icon}{title}
        </a>
      );
    };

    const liProps = {};
    if (props.draggable) {
      liProps.onDragEnter = this.onDragEnter;
      liProps.onDragOver = this.onDragOver;
      liProps.onDragLeave = this.onDragLeave;
      liProps.onDrop = this.onDrop;
      liProps.onDragEnd = this.onDragEnd;
    }

    let disabledCls = '';
    let dragOverCls = '';
    if (props.disabled) {
      disabledCls = `${prefixCls}-treenode-disabled`;
    } else if (props.dragOver) {
      dragOverCls = 'drag-over';
    } else if (props.dragOverGapTop) {
      dragOverCls = 'drag-over-gap-top';
    } else if (props.dragOverGapBottom) {
      dragOverCls = 'drag-over-gap-bottom';
    }

    const filterCls = props.filterTreeNode(this) ? 'filter-node' : '';

    const noopSwitcher = () => {
      const cls = {
        [`${prefixCls}-switcher`]: true,
        [`${prefixCls}-switcher-noop`]: true,
      };
      if (props.showLine) {
        cls[`${prefixCls}-center_docu`] = !props.last;
        cls[`${prefixCls}-bottom_docu`] = props.last;
      } else {
        cls[`${prefixCls}-noline_docu`] = true;
      }
      return <span className={classNames(cls)}></span>;
    };
    return <li {...liProps} ref="li"
                     className={classNames(props.className, disabledCls, dragOverCls, filterCls) }
    >
      {canRenderSwitcher ? this.renderSwitcher(props, expandedState) : noopSwitcher()}
      {/*{props.checkable ? this.renderCheckbox(props) : null}*/}
      {selectHandle()}
      {newChildren}
    </li>
  }
}

TreeNode.isTreeNode = 1;

TreeNode.propTypes = {
  prefixCls: PropTypes.string,
  disabled: PropTypes.bool,
  disableCheckbox: PropTypes.bool,
  expanded: PropTypes.bool,
  isLeaf: PropTypes.bool,
  root: PropTypes.object,
  onSelect: PropTypes.func,
};

TreeNode.defaultProps = {
  title: defaultTitle,
};

export default TreeNode;
