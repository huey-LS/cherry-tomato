import {
  Model,
  Collection
} from '@cherry-tomato/core';

interface ObserveOptions {
  autoUpdateEvents?: AutoUpdateEvents
}

interface AutoUpdateEventNameCreator {
  (model: any, key: string): string[];
}
type AutoUpdateEvents = string[] | AutoUpdateEventNameCreator;
export default function observe (
  options: ObserveOptions = {}
) {
  let autoUpdateEvents = options.autoUpdateEvents;

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
        autoUpdateEvents
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
          autoUpdateEvents
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
  autoUpdateEvents?: AutoUpdateEvents
) {
  if (!Model.isModel(model)) return;
  let currentUpdateEvents: string[] = [];
  if (!autoUpdateEvents) {
    if (Collection.isCollection(model)) {
      currentUpdateEvents = [
        'modelDidUpdate',
        'collectionDidUpdateChildren'
      ]
    } else if (Model.isModel(model)) {
      currentUpdateEvents = [
        'modelDidUpdate'
      ]
    }
  } else if (typeof autoUpdateEvents === 'function') {
    currentUpdateEvents = autoUpdateEvents(model, key);
  } else {
    currentUpdateEvents = autoUpdateEvents;
  }
  let removeListeners = currentUpdateEvents.map((eventName) => {
    return model.addListener(eventName as any, () => {
      component.forceUpdate();
    })
  })

  let oldComponentWillUnmount = component.componentWillUnmount;
  component.componentWillUnmount = function (...args: any) {
    removeListeners.forEach((removeListener) => {
      removeListener();
    });
    removeListeners = [];
    if (typeof oldComponentWillUnmount === 'function') {
      oldComponentWillUnmount.call(this, ...args);
    }
  }
}