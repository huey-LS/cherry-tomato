import React from 'react';
import {
  Model
} from '@cherry-tomato/core';

import autoObserve, { ObserveOptions } from './auto-observe';

export default function observe (
  options?: ObserveOptions
) {
  return function (): (this: React.Component, newValue: Model) => Model {
    return function (newValue) {
      createObserveForComponent(
        Model,
        this,
        options
      )
      return newValue;
    }
  }
}
function createObserveForComponent (
  model: any,
  component: any,
  options?: ObserveOptions
) {
  if (!Model.isModel(model)) return;
  let removeListener = autoObserve(
    model,
    () => { component.forceUpdate(); },
    options
  )

  let oldComponentWillUnmount = component.componentWillUnmount;
  component.componentWillUnmount = function (...args: any) {
    removeListener();
    if (typeof oldComponentWillUnmount === 'function') {
      oldComponentWillUnmount.call(this, ...args);
    }
  }
}