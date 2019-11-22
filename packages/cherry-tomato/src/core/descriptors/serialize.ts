import {
  createThunkAttributeDecorator
} from '../../shared/utils';

import Model from '../model';


const serialize = createThunkAttributeDecorator<undefined|string|{
  name: string,
  type?: Function,
  writableType?: Function
}>(function (
  options,
  target,
  key,
  descriptor
) {
  let name: string;
  let type: Function|undefined;
  let writableType: Function|undefined;
  let oldSetter: any;
  let oldGetter: any;

  let serializeMaps = target['__serialize_maps'];
  if (!serializeMaps) {
    serializeMaps = target['__serialize_maps'] = {};
  }

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

    // console.log(descriptor, oldGetter);
    if (oldGetter) {
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
    }

    if (oldSetter) {
      descriptor.set = function (newValue: any) {
        if (Model.isModel(this)) {
          if (writableType) {
            newValue = writableType(newValue);
          }
          this.set(name, newValue);
        }

        oldSetter.call(this, newValue)
      }
    }

    // delete descriptor.writable;

    serializeMaps[key] = name;
  }
});

export default serialize;



const output = createThunkAttributeDecorator<any>(function (
  options,
  target,
  key,
  descriptor
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
