import Attributes from './attributes';
import EventEmitter from './event-emitter';
import {
  MODEL_DID_UPDATE,
  MODEL_WILL_UPDATE,
  CONNECT_MODEL_DID_UPDATE,
 } from '../constants/life-cycle';
import { respond } from '../shared/spread';
import {
  KeyCreator,
  incrementCreator
} from './key-creators';

const defaultKeyCreator = incrementCreator();


type prevAttributes = Attributes;
type nextAttributes = Attributes;

export type CommonModelEventConfig = {
  [MODEL_WILL_UPDATE]: [prevAttributes, nextAttributes];
  [MODEL_DID_UPDATE]: [prevAttributes, nextAttributes];
  [CONNECT_MODEL_DID_UPDATE]: {
    key: string;
    modal: Model;
  };
}

export default class Model<
ED = {},
Attrs = any,
PAttrs extends Partial<Attrs> = Partial<Attrs>
> extends EventEmitter<
ED & CommonModelEventConfig
> {
  static isModel = function (obj: any): obj is Model {
    return obj &&
      (
        obj instanceof Model
        || obj.__cherry_tomato_model
      )
  }

  static isInstance = function isInstance<
    T extends typeof Model<any>
  > (
    this: T,
    obj: any
  ): obj is InstanceType<T> {
    return (
      obj instanceof this
    )
  }

  static initialAttributes: () => any;
  static key?: string|KeyCreator;

  readonly __cherry_tomato_model = true;

  // @enumerable(false)
  // @writable(true)
  _attributes: Attributes;

  key!: string;

  constructor (attributes: PAttrs = {} as PAttrs) {
    super();

    const constructor = this.constructor as typeof Model;

    let initialAttributesCreator = constructor.initialAttributes;
    let initialAttributes: any;
    if (typeof initialAttributesCreator === 'function') {
      initialAttributes = initialAttributesCreator();
    }
    this._attributes = new Attributes({ ...initialAttributes, ...attributes });
    var keyCreator = constructor.key || defaultKeyCreator;

    if (typeof keyCreator === 'function') {
      this.key = keyCreator();
    } else {
      // use attribute
      Object.defineProperty(this, 'key', {
        get: function () {
          return this.get(keyCreator);
        }
      })
    }
  }

  [MODEL_WILL_UPDATE]? (data: [prevAttributes, nextAttributes]): void;
  [MODEL_DID_UPDATE]? (data: [prevAttributes, nextAttributes]): void;

  reset (newValue: any) {
    const newAttributes = new Attributes({ ...newValue });
    this.updateNewAttributes(newAttributes);
  }

  set<K extends keyof PAttrs> (
    key: K | PAttrs,
    newValue?: PAttrs[K]
  ) {
    let prevAttributes = this._attributes;
    let nextAttributes;
    if (typeof key === 'string') {
      nextAttributes = prevAttributes.set(key, newValue)
    } else {
      nextAttributes = prevAttributes.merge(key);
    }
    this.updateNewAttributes(nextAttributes)
    return this;
  }

  get (attributeName: string) {
    return this._attributes.get(attributeName);
  }

  remove (attributeName: string) {
    let nextAttributes = this._attributes.remove(attributeName);
    this.updateNewAttributes(nextAttributes)
    return this;
  }

  updateNewAttributes (nextAttributes: Attributes) {
    let prevAttributes = this._attributes;
    respond(MODEL_WILL_UPDATE, this, [prevAttributes, nextAttributes])
    this._attributes = nextAttributes;
    respond(MODEL_DID_UPDATE, this, [prevAttributes, nextAttributes])
    return this;
  }

  toJSON () {
    return this._attributes.toJSON();
  }
}
