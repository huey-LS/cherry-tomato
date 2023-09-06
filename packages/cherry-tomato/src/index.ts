import Attributes from './core/attributes';
import Model from './core/model';
import Collection from './core/collection';
import EventEmitter, {
  EventConfig,
  TypedEventCallback
} from './core/event-emitter';
import * as KeyCreators from './core/key-creators';
import { connect } from './core/descriptors/connect';
import { attribute } from './core/descriptors/attribute';


export {
  Attributes,
  Model,
  Collection,
  EventEmitter,
  EventConfig,
  TypedEventCallback,
  KeyCreators,
  connect,
  attribute
}
