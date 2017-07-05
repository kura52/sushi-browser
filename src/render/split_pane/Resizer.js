import React, { Component } from 'react';
import Prefixer from 'inline-style-prefixer';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.2 (KHTML, like Gecko) Safari/537.2';
const defaultPrefixer = new Prefixer({ userAgent: USER_AGENT })
const defaultResizerClassName = 'Resizer'


export default function Resizer(props){
  const { split, className, resizerClassName } = props;
  const classes = [resizerClassName || defaultResizerClassName, split, className];
  return (
    <span
      className={classes.join(' ')}
      style={(props.prefixer || defaultPrefixer).prefix(props.style) || {}}
      onMouseDown={(event) => {
        props.onMouseDown(event);
      }}
      onTouchStart={(event) => {
        event.preventDefault();
        props.onTouchStart(event);
      }}
      onTouchEnd={(event) => {
        event.preventDefault();
        props.onTouchEnd(event);
      }}
    />
  );
}
