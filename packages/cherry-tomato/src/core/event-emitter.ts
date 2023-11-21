import { clone } from '../shared/utils';
import { respond } from '../shared/spread';

import {
  WILL_DESTROY,
  DID_DESTROY
} from '../constants/life-cycle';

export class Event<D = any, TA = any, T = string> {
  data: D;
  target: TA;
  type: T;

  constructor (
    options: {
      data: D,
      target: TA,
      type: T
    }
  ) {
    const { data, target, type } = options;
    this.data = data;
    this.target = target;
    this.type = type;
  }
}

export interface TypedEventCallback<
D = void,
TA = any,
> {
  (this:TA, event: Event<D, TA>): void;
}


export type EventConfig<Events extends string> = {
  [E in Events]: TypedEventCallback;
}


export type CommonEventConfig = {
  [WILL_DESTROY]: TypedEventCallback<void>,
  [DID_DESTROY]: TypedEventCallback<void>
}

export interface EventCallbacksByType {
  [type: string]: TypedEventCallback[];
}


type EventDataToEventCallback<T> = {
  [K in keyof T]: TypedEventCallback<T[K]>;
}

type AccessCallbackEventData<C> = C extends TypedEventCallback<infer D> ? D : never;

type AccessCallbackThis<C, TA> = C extends TypedEventCallback<infer D> ? TypedEventCallback<D, TA> : never;


export default class EventEmitter<
ED = {},
CE extends EventConfig<never> = EventDataToEventCallback<ED>,
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

  emit<K extends keyof EventsConfig> (name: K, data: AccessCallbackEventData<EventsConfig[K]>) {
    let event: Event;
    event = new Event({
      target: this,
      data,
      type: name as string
    });

    let type = event.type;
    let events = this._events[type];
    if (events) {
      events.forEach((callback) => {
        callback.call(this, event);
      })
    }

    this._all_events.forEach((callback) => {
      callback.call(this, event);
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

  addListener<K extends keyof EventsConfig, TA extends this>(name: K, callback: AccessCallbackThis<EventsConfig[K], TA>) {
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
    newThis._events = {};
    newThis._all_events = [];
    return newThis;
  }
}
