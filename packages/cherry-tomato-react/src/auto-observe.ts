
import {
  Model,
  Collection,
  CherryTomatoLifeCycle
} from '@cherry-tomato/core';

import {
  throttle,
  ThrottleParams
} from './throttle';

interface AutoUpdateEventNameCreator {
  (model: any, key?: string): string[];
}
export type AutoUpdateEvents = string[] | AutoUpdateEventNameCreator;

export interface ObserveOptions {
  autoUpdateEvents?: AutoUpdateEvents;
  throttle?: ThrottleParams
}

export default function (
  model: Model,
  callback: () => void,
  options: ObserveOptions = {}
) {
  let autoUpdateEvents = options.autoUpdateEvents;
  let currentUpdateEvents: string[] = [];
  if (!autoUpdateEvents) {
    if (Collection.isCollection(model)) {
      currentUpdateEvents = CherryTomatoLifeCycle.COLLECTION_UPDATE_LIFE_CYCLES;
    } else if (Model.isModel(model)) {
      currentUpdateEvents = CherryTomatoLifeCycle.MODEL_UPDATE_LIFE_CYCLES;
    }
  } else if (typeof autoUpdateEvents === 'function') {
    currentUpdateEvents = autoUpdateEvents(model);
  } else {
    currentUpdateEvents = autoUpdateEvents;
  }

  const throttleCallback = options.throttle ? throttle(
    callback,
    options.throttle
  ).run : callback;

  return model.addAllListener((event) => {
    if (
      ~currentUpdateEvents.indexOf(event.type)
    ) {
      throttleCallback();
    }
  });
}