import { clone } from '../shared/utils';
import { respond } from '../shared/spread';

import {
  WILL_DESTROY,
  DID_DESTROY
} from '../constants/life-cycle';

export class Event {
  data: any;
  target: any;
  type: string;
  origin?: Event;

  constructor (
    options: {
      data: any,
      target: any,
      type: string
    }
  ) {
    const { data, target, type } = options;
    this.data = data;
    this.target = target;
    this.type = type;

    return this;
  }
}

export interface TypedEventCallback<TypedEvent extends Event = Event> {
  (event: TypedEvent): void;
}


export type EventConfig<Events extends string> = {
  [E in Events]: TypedEventCallback;
}


export interface CommonEventConfig extends EventConfig<
typeof WILL_DESTROY | typeof DID_DESTROY
>{
  [WILL_DESTROY]: TypedEventCallback,
  [DID_DESTROY]: TypedEventCallback
}

// export interface EventConfig {
//   [type: string]: TypedEventCallback,
// }

interface EventCallbacksByType {
  [type: string]: TypedEventCallback[];
}

export default class EventEmitter<
CE extends EventConfig<never> = {},
EventsConfig = CE & CommonEventConfig
> {
  static isEvent = function (obj: any): obj is EventEmitter {
    return obj &&
      (
        obj instanceof Event
        || obj.__cherry_tomato_event
      )
  }

  readonly __cherry_tomato_event = true;

  _events: EventCallbacksByType;

  _all_events: TypedEventCallback[]

  _destroyed: boolean;

  constructor () {
    this._events = {};
    this._all_events = [];
    this._destroyed = false;
  }

  emit (name: Event|keyof EventsConfig, data: any, originEvent?: Event) {
    let event: Event;
    if (EventEmitter.isEvent(name)) {
      event = data;
    } else {
      event = new Event({
        target: this,
        data,
        type: name as string
      });
    }
    if (originEvent) {
      event.origin = originEvent;
    }

    let type = event.type;
    let events = this._events[type];
    if (events) {
      events.forEach((callback) => {
        callback(event);
      })
    }

    this._all_events.forEach((callback) => {
      callback(event);
    })
  }

  addAllListener (callback: TypedEventCallback) {
    let removeListener = () => {};
    if (callback) {
      let events = this._all_events;
      events.push(callback);
      removeListener = () => {
        this.removeAllListener(callback);
      }
    }
    return removeListener;
  }

  removeAllListener (callback: TypedEventCallback) {
    if (this._destroyed) return false;
    let events = this._all_events;
    this._removeEventCallback(events, callback);
    return callback;
  }

  addListener<K extends keyof EventsConfig>(name: K, callback: EventsConfig[K]) {
    let removeListener = () => {};
    if (this._destroyed) return removeListener;
    if (callback) {
      let events = this._events[name as string];
      if (!events) events = this._events[name as string] = [];
      events.push(callback as any);
      removeListener = () => {
        this.removeListener(callback as any);
      }
    }
    return removeListener;
  }

  removeListener (callback: TypedEventCallback) {
    if (this._destroyed) return false;
    let events = this._events;
    Object.keys(events).forEach((key) => {
      this._removeEventCallback(events[key], callback);
    })

    return callback;
  }

  _removeEventCallback (events: TypedEventCallback[], callback: TypedEventCallback) {
    let index = events.findIndex((fn) => (fn === callback));
    if (index > -1) {
      events.splice(index, 1);
      return callback;
    }
  }

  destroy () {
    respond(WILL_DESTROY, this);
    this._events = {};
    this._all_events = [];
    this._destroyed = true;
    respond(DID_DESTROY, this);
  }

  clone () {
    const newThis = clone(this);
    const events = this._events;
    newThis._events = Object.keys(events).reduce((newEvents, key) => {
      newEvents[key] = [ ...events[key] ];
      return newEvents
    }, {} as EventCallbacksByType);
    newThis._all_events = this._all_events.slice(0);
    return newThis;
  }
}
