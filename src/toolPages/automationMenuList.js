import React, {Component} from 'react';
import {render} from 'react-dom';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove,
} from 'react-sortable-hoc';

const editableEvent = {
  handleDbClick(e){
    e.target.contentEditable = true
    e.target.focus()
    e.target.style.border = '1px solid gray'
    e.target.style.backgroundColor = 'white'
    e.target.style.borderRadius = '3px'
  },

  handleBlur(e,props,value){
    e.target.contentEditable = false
    value.name = e.target.textContent
    e.target.style.border = '1px solid rgba(0,0,0,0)'
    e.target.style.backgroundColor = null
    e.target.style.borderRadius = null
    props.updateItems(props.items)
  },

  handleKeyDown(e){
    if(e.keyCode == 13 || e.keyCode == 27){
      e.target.blur()
    }
  }
}

const DragHandle = SortableHandle(() => <span className="drag-handle"></span>); // This can be any component you want

const SortableItem = SortableElement(({value,_props}) => {
  return <div className={`rt-tr-group menu ${_props.selected == value.key ? 'selected' : ''}`}
              onClick={_=>_props.selectItem(value.key)}>
    <div className="rt-td">
      <DragHandle />
      <span onDoubleClick={editableEvent.handleDbClick}
            onKeyDown={editableEvent.handleKeyDown}
            onBlur={e=>editableEvent.handleBlur(e,_props,value)}
            style={{outline: 'none',border: '1px solid rgba(0,0,0,0)' }}>{value.name}</span>
      <span style={{float: 'right'}} onClick={_=>_props.removeItem(value.key)}>
        <i className="fa fa-times menu-item" aria-hidden="true"/>
      </span>
    </div>
  </div>
})

const SortableList = SortableContainer(({items, _props}) => {
  return (
    <div className="rt-tbody" style={{minWidth: 80}}>
      {items.map((value, index) => (
        <SortableItem _props={_props} key={`item-${index}`} index={index} value={value} />
      ))}
      <div className="rt-tr-group menu add-button" onClick={_=>_props.addItem()}>
        <div className="rt-td"><span>+</span></div>
      </div>
    </div>
  )
})

export default class SortableComponent extends Component {
  onSortEnd = ({oldIndex, newIndex}) => {
    this.props.updateItems(arrayMove(this.props.items, oldIndex, newIndex))
  }

  render() {
    return <SortableList _props={this.props} items={this.props.items} onSortEnd={this.onSortEnd} useDragHandle={true} />;
  }
}