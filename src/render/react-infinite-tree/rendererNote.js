import React from 'react';
import classNames from 'classnames';

export default function(margin){
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
        <div
          className={`infinite-tree-node${node.divider ? " tree-divider" : ""}`}
          style={{ marginLeft: depth * margin }}
        >
          {!more && loadOnDemand &&
          <a className={classNames(treeOptions.togglerClass, 'infinite-tree-closed')}>
            <i aria-hidden="true" class="fa fa-caret-right caret"/>
          </a>
          }
          {more && open &&
          <a className={classNames(treeOptions.togglerClass)}>
            <i aria-hidden="true" class="fa fa-caret-down caret"/>
          </a>
          }
          {more && !open &&
          <a className={classNames(treeOptions.togglerClass, 'infinite-tree-closed')}>
            <i aria-hidden="true" class="fa fa-caret-right caret"/>
          </a>
          }
          {node.favicon ? faviconEmpty ? <span className="margin-left"></span> : <img src={node.favicon} className="favi-favorite"/>
            :<i className={classNames(
                'infinite-tree-folder-icon',
                { 'folder-icon': more || loadOnDemand },
                'fa',
                { 'fa-folder-open folder-open': more && open },
                { 'fa-folder folder': (loadOnDemand || more) && !open },
                { 'fa-file doc': !more && !loadOnDemand }
              )}
            />}

          <span className={`infinite-tree-title${faviconEmpty ? " date-slice" : ""}${node.inactive ? " node-inactive" : ""}`}>{name}</span>
          <i
            style={{ marginLeft: 5 }}
            className={classNames(
              { 'hidden': !loading },
              'glyphicon',
              'glyphicon-refresh',
              { 'rotating': loading }
            )}
          />
          {more ? <span className="count">{childrenLength}</span> :
            <span className="count hover-external"><i className="fa fa-external-link"/></span>}
        </div>
      </div>
    );
  };
}

