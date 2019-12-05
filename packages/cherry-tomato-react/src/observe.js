import {
  Model,
  Collection
} from '@cherry-tomato/core';

export default function observe (options = {}) {
  let autoUpdateEvents = options.autoUpdateEvents;

  return function (target, key, descriptor) {
    if (Model.isModel(descriptor.value)) {
      createObserveForComponent(
        descriptor.value,
        target,
        autoUpdateEvents
      );
    } else if (descriptor.initializer){
      const oldInitializer = descriptor.initializer;

      descriptor.initializer = function () {
        const _this = this;
        const oldValue = oldInitializer.call(_this);
        createObserveForComponent(
          oldValue,
          _this,
          autoUpdateEvents
        );
        return oldValue;
      }
    }
    return descriptor;
  }
}
function createObserveForComponent (model, component, autoUpdateEvents) {
  if (!Model.isModel(model)) return;
  let currentUpdateEvents = autoUpdateEvents;
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
  }
  let removeListeners = currentUpdateEvents.map((eventName) => {
    return model.addListener(eventName, () => {
      component.forceUpdate();
    })
  })

  let oldComponentWillUnmount = component.componentWillUnmount;
  component.componentWillUnmount = function (...args) {
    removeListeners.forEach((removeListener) => {
      removeListener();
    });
    removeListeners = null;
    if (typeof oldComponentWillUnmount === 'function') {
      oldComponentWillUnmount.call(this, ...args);
    }
  }
}