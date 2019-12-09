import {
  useState,
  useEffect
} from 'react';

import {
  Model,
  Collection
} from '@cherry-tomato/core';


interface ObserveOptions {
  autoUpdateEvents?: AutoUpdateEvents
}

interface AutoUpdateEventNameCreator {
  (model: any, key?: string): string[];
}
type AutoUpdateEvents = string[] | AutoUpdateEventNameCreator;

export default function useCherryTomato (model: Model, options:ObserveOptions = {}) {
  let autoUpdateEvents = options.autoUpdateEvents;
  const [, updateState] = useState();
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
    currentUpdateEvents = autoUpdateEvents(model);
  } else {
    currentUpdateEvents = autoUpdateEvents;
  }
  useEffect(() => {
    let removeListeners = currentUpdateEvents.map((eventName) => {
      return model.addListener(eventName as any, () => {
        updateState({});
      })
    })
    return () => {
      removeListeners.forEach((removeListener) => {
        removeListener();
      });
    }
  })
}