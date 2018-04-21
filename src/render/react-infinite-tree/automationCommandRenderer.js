import React from 'react';
import classNames from 'classnames';
const PubSub = require('pubsub-js')

let headers = [
  {name:'#',width:10,maxWidth:48},
  {name:'Command',width:20,maxWidth:200},
  {name:'Target',width:30,maxWidth:300},
  {name:'Value',width:20,maxWidth:500},
  {name:'Info',width:20,maxWidth:700}
]
PubSub.subscribe('row-size',(msg,{name,maxWidth})=>{
  const header = headers.find(x=>x.name==name)
  header.maxWidth = maxWidth
  // header.width = maxWidth
})

export default function(){
  return (node, treeOptions) => {
    const { id, name, loadOnDemand = false, children, state, props = {} } = node;
    const droppable = (treeOptions.droppable) && (props.droppable);
    const { depth, open, path, total, loading = false, selected = false } = state;
    const childrenLength = children.filter(node=>node.favicon != "empty").length;
    const more = node.type == "directory"
    const faviconEmpty = node.favicon == "empty"
    const divider = node.name == "divider"
    return (
      <div
        className={classNames(
          'infinite-tree-item',
          { 'infinite-tree-selected': selected }
        )}
        data-id={id}
        data-expanded={more && open}
        data-depth={depth}
        data-path={path}
        data-selected={selected}
        data-children={childrenLength}
        data-total={total}
        droppable="true"
        draggable="true"
      >
        <div className="rt-tr-group">
        {headers.map((col,i)=>{
          let value
          switch (col.name) {
            case '#':
              value = <span><i className="fa fa-times menu-item" aria-hidden="true"></i>{node.no}</span>
              break
            case 'Command':
              value = node.name
              break
            case 'Target':
              value = node.optSelector
              break
            case 'Info':
              value = node.name == 'keydown' ? `${node.ctrlKey ? 'Ctrl+' : ''}${node.keyChar}` : node.url
              break
            default:
              value = node[col.name.toLowerCase()]
          }
          const style = {flex: `${col.width} 0 auto`,width:col.width,maxWidth:col.maxWidth}

          return <div className="rt-td" style={style}>
            <span>{value}</span>
          </div>
        })}
        </div>
      </div>
    );
  };
}

