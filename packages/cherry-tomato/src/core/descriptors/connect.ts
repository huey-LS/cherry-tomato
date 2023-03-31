import {
  MODEL_DID_UPDATE,
} from '../../constants/life-cycle';

import Model from '../model';
import Collection from '../collection';

interface ConnectOptions<M extends Model = Model, ConnectM extends Model = Model> {
  sync?: Boolean;
}


function connectModel<
  M extends Model = Model,
  ConnectedM extends Model = Model
> (
  connectedModel: ConnectedM,
  target: M,
  key: string,
  options: ConnectOptions<M, ConnectedM>
) {

  // 设置初始化值
  if (target.get(key)) {
    if (Collection.isCollection(connectedModel)) {
      connectedModel.resetChildren(target.get(key))
    } else if (Model.isModel(connectedModel)) {
      connectedModel.reset(target.get(key))
    }
  }

  let removeListener = () => {};


  if (options.sync) {
    let syncing = false;
    let removeConnectedModelDidUpdateListener = connectedModel.addListener(MODEL_DID_UPDATE, ({ data }) => {
      if (syncing) return;
      syncing = true;
      target.set(key, connectedModel.toJSON())
      syncing = false;
    })

    let removeTargetDidUpdateListener = target.addListener(MODEL_DID_UPDATE, ({
      data: [prevAttributes, nextAttributes]
    }) => {
      if (
        prevAttributes.get(key) !== nextAttributes.get(key)
      ) {
        if (syncing) return;
        syncing = true;
        if (Collection.isCollection(connectedModel)) {
          connectedModel.resetChildren(nextAttributes.get(key))
        } else if (Model.isModel(connectedModel)) {
          connectedModel.set(nextAttributes.get(key))
        }
        syncing = false;
      }
    });

    let prevRemoveListener = removeListener;

    removeListener = () => {
      removeConnectedModelDidUpdateListener();
      removeTargetDidUpdateListener();
      prevRemoveListener();
    }

    if (typeof target.get(key) !== 'undefined') {
      connectedModel.set(target.get(key));
    } else {
      target.set(key, connectedModel.toJSON())
    }
  }

  target.addListener('willDestroy', () => {
    removeListener();
  });

  connectedModel.addListener('willDestroy', () => {
    removeListener();
  })

  return () => {
    removeListener();
  }
}

export function connect (
  params?: string | {
    name?: string;
    sync?: boolean;
  }
) {
  let name: string = '';
  let sync = true;
  if (params) {
    if (typeof params === 'string') {
      name = params
    } else {
      if (params.name) {
        name = params.name;
      }
      if (params.sync === false) {
        sync = false;
      }
    }
  }

  return function connectDecorator<This extends Model, Value extends Model> (
    value: any,
    context: ClassFieldDecoratorContext<This, Value>
  ) {
    if (!name && typeof context.name === 'string') {
      name = context.name;
    }

    return function (this: This, initialValue: Value) {
      connectModel(
        initialValue,
        this,
        name,
        {
          sync
        }
      );
      return initialValue;
    }
  }
}
