import {
  Model,
  Collection
} from '@cherry-tomato/core';

import autoObserve, { ObserveOptions } from './auto-observe';

export default function observe (
  options?: ObserveOptions
) {
  return function (
    target: any,
    key: string,
    descriptor: PropertyDescriptor
  ) {
    if (Model.isModel(descriptor.value)) {
      createObserveForComponent(
        descriptor.value,
        target,
        key,
        options
      );
    } else if ((descriptor as any).initializer){
      const oldInitializer = (descriptor as any).initializer;

      (descriptor as any).initializer = function () {
        const _this = this;
        const oldValue = oldInitializer.call(_this);
        createObserveForComponent(
          oldValue,
          _this,
          key,
          options
        );
        return oldValue;
      }
    }
    return descriptor;
  }
}
function createObserveForComponent (
  model: any,
  component: any,
  key: string,
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