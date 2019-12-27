
import {
  Model,
  Collection
} from '@cherry-tomato/core';

interface AutoUpdateEventNameCreator {
  (model: any, key?: string): string[];
}
export type AutoUpdateEvents = string[] | AutoUpdateEventNameCreator;

export interface ObserveOptions {
  autoUpdateEvents?: AutoUpdateEvents
}

export default function (model: Model, callback: () => void, options: ObserveOptions = {}) {
  let autoUpdateEvents = options.autoUpdateEvents;
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

  return model.addAllListener((event) => {
    if (
      ~currentUpdateEvents.indexOf(event.type)
    ) {
      callback();
    }
  });
}