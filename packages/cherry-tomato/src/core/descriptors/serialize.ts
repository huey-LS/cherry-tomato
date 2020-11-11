import {
  createThunkAttributeDecorator
} from '../../shared/utils';

import Model from '../model';


const serialize = createThunkAttributeDecorator<string|{
  name: string,
  type?: Function,
  writableType?: Function
}>(function (
  target,
  key,
  descriptor,
  options
) {
  let name: string;
  let type: Function|undefined;
  let writableType: Function|undefined;
  let oldSetter: any;
  let oldGetter: any;

  const MAPS_KEY = '__serialize_maps';
  if (!Object.getOwnPropertyDescriptor(target, MAPS_KEY)) {
    let originSerializeMaps = {};
    if (target[MAPS_KEY]) {
      originSerializeMaps = { ...originSerializeMaps, ...target[MAPS_KEY]};
    }
    Object.defineProperty(target, MAPS_KEY, {
      configurable: true,
      enumerable: false,
      value: originSerializeMaps
    })
  }

  let serializeMaps = target[MAPS_KEY];

  if (!options) {
    name = key;
  } else if (typeof options === 'string') {
    name = options;
  } else {
    name = options.name;
    type = options.type;
    writableType = options.writableType;
  }


  if (key && descriptor) {
    oldSetter = descriptor.set;
    oldGetter = descriptor.get;

    descriptor.enumerable = true;
    descriptor.get = function () {
      let defaultValue = oldGetter && oldGetter.call(this);
      let value;
      if (Model.isModel(this)) {
        value = this.get(name);
        if (type) {
          value = type(value);
        } else if (typeof value === 'undefined'){
          value = defaultValue;
        }
      } else {
        value = defaultValue;
      }

      return value;
    }

    descriptor.set = function (newValue: any) {
      if (Model.isModel(this)) {
        if (writableType) {
          newValue = writableType(newValue);
        }
        if (typeof newValue !== 'undefined') {
          this.set(name, newValue);
        }
      }

      if (oldSetter) {
        oldSetter.call(this, newValue)
      }
    }

    serializeMaps[key] = name;
  }
});

export default serialize;



const output = createThunkAttributeDecorator<any>(function (
  target,
  key,
  descriptor,
  options
) {

  if (descriptor) {
    let oldValue = descriptor.value;
    descriptor.value = function () {
      let serializeMaps = target['__serialize_maps'];
      let needSerializeKeys = oldValue();
      return needSerializeKeys.reduce((data: any, key: string) => {
        if (serializeMaps[key]) {
          data[
            serializeMaps[key]
          ] = (this as any)[key];
        }
        return data;
      }, {})
    }
  }
});

export { output };
