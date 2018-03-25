import React from 'react';
import classNames from 'classnames';
const PubSub = require('pubsub-js')

let headers = [
  {name:'#',width:10,maxWidth:40},
  {name:'Command',width:20,maxWidth:200},
  {name:'Target',width:30,maxWidth:300},
  {name:'Value',width:20,maxWidth:200},
  {name:'URL',width:20,maxWidth:200}
]
PubSub.subscribe('row-size',(msg,_headers)=>{
  headers = _headers
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
              value = node.no
              break
            case 'Command':
              value = node.name
              break
            case 'Target':
              value = node.optSelector
              break
            default:
              value = node[col.name.toLowerCase()]
          }
          return <div className="rt-td" style={{flex: `${col.width} 0 auto`,width:col.width,maxWidth:col.maxWidth}}>
            <span>{value}</span>
          </div>
        })}
        </div>
      </div>
    );
  };
}

