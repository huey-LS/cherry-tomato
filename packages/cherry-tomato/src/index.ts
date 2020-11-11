import Model from './core/model';
import Collection from './core/collection';
import EventEmitter from './core/event-emitter';
import * as KeyCreators from './core/key-creators';
import connect from './core/descriptors/connect';
import serialize, { output } from './core/descriptors/serialize';

const attribute = serialize;

export {
  Model,
  Collection,
  EventEmitter,
  KeyCreators,
  connect,
  serialize,
  attribute,
  output
}
