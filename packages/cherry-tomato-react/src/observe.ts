import React from 'react';
import {
  Model
} from '@cherry-tomato/core';

import autoObserve, { ObserveOptions } from './auto-observe';

export default function observe (
  options?: ObserveOptions
) {
  return function<This, Value> (
    value: undefined,
    context: ClassFieldDecoratorContext<This, Value>
  ) {
    let removeListener: ReturnType<typeof createObserveForComponent>;
    if (context.kind === 'field') {
      return function (this: This, initialValue: Value) {
        if (removeListener) {
          removeListener();
        }
        removeListener = createObserveForComponent(
          initialValue,
          this,
          options
        )
        return initialValue;
      }
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
  return removeListener;
}