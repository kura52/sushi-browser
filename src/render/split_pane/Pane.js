import React, { Component } from 'react';
import Prefixer from 'inline-style-prefixer';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Safari/537.2';
const defaultPrefixer = new Prefixer({ userAgent: USER_AGENT })

export default function Pane(props){
  const split = props.split;
  const classes = ['Pane', split, props.className];

  const style = Object.assign({}, props.style || {}, {
    flex: 1,
    position: 'relative',
    outline: 'none',
  });

  if (props.size !== undefined) {
    if (split === 'vertical') {
      style.width = props.size;
    } else {
      style.height = props.size;
      style.display = 'flex';
    }
    style.flex = 'none';
  }

  return <div className={classes.join(' ')} style={(props.prefixer || defaultPrefixer).prefix(style)}>{props.children}</div>
}

