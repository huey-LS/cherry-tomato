import {
  MODEL_DID_UPDATE,
  CONNECT_MODEL_DID_UPDATE,
  COLLECTION_UPDATE_LIFE_CYCLES
} from '../../constants/life-cycle';

import Model, {
  CommonModelEventConfig
} from '../model';
import Collection from '../collection';
import {
  throttle
} from '../../shared/throttle';

interface ConnectOptions<
ConnectM extends Model = Model,
M extends Model = Model> {
  sync?: boolean | {
    /**
     * 节流同步
     */
    throttle?: boolean;
  };
  lazy?: {
    generate: (parent: M) => ConnectM;
  }
}

const defaultSyncParams = {
  throttle: false
}


function connectModel<
  M extends Model = Model,
  ConnectedM extends Model = Model
> (
  connectedModel: ConnectedM,
  target: M,
  key: string,
  options: ConnectOptions<ConnectedM, M>
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


  if (
    options.sync
  ) {
    const syncParams = {
      ...defaultSyncParams,
      ...(
        typeof options.sync !== 'boolean'
        ? options.sync
        : {}
      )
    };
    let syncing = false;
    const connectedModelCallback: Parameters<Model['addAllListener']>[0] = ({ data, type }) => {
      if (
        !syncing
        &&  ~COLLECTION_UPDATE_LIFE_CYCLES.indexOf(type)
        && connectedModel
      ) {
        syncing = true;
        target.set(key, connectedModel.toJSON())
        syncing = false;
        target.emit(
          CONNECT_MODEL_DID_UPDATE,
          {
            key,
            modal: connectedModel
          }
        )
      }
    }

    let removeConnectedModelDidUpdateListener = connectedModel.addAllListener(
      syncParams.throttle ? throttle(connectedModelCallback).run : connectedModelCallback
    );

    const targetModelCallback: Parameters<Model['addListener']>[1] = ({
      data: [
        prevAttributes,
        nextAttributes
      ]
    }: {
      data: CommonModelEventConfig['modelDidUpdate']
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
    }

    let removeTargetDidUpdateListener = target.addListener(
      MODEL_DID_UPDATE,
      syncParams.throttle ? throttle(targetModelCallback).run : targetModelCallback
    );

    let prevRemoveListener = removeListener;

    removeListener = () => {
      removeConnectedModelDidUpdateListener();
      removeTargetDidUpdateListener();
      prevRemoveListener();
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

export function connect<
Value extends Model = Model,
Target extends Model = Model,
> (
  params?: string | {
    name?: string;
    sync?: ConnectOptions<Value, Target>['sync'];
    lazy?: ConnectOptions<Value, Target>['lazy'];
  }
) {
  let name: string = '';
  let sync: ConnectOptions<Value, Target>['sync'] = true;
  let lazy: ConnectOptions<Value, Target>['lazy'];
  if (params) {
    if (typeof params === 'string') {
      name = params
    } else {
      if (params.name) {
        name = params.name;
      }
      if (params.sync === false) {
        sync = false;
      } else if (params.sync) {
        sync = params.sync
      }
      lazy = params.lazy;
    }
  }

  function connectDecorator (
    value: ClassAccessorDecoratorTarget<Target, Value>,
    context: ClassAccessorDecoratorContext<Target, Value>
  ): ClassAccessorDecoratorResult<Target, Value>;
  function connectDecorator (
    value: undefined,
    context: ClassFieldDecoratorContext<Target, Value>
  ): void | ((initialValue: Value) => Value);
  function connectDecorator (
    value: ClassAccessorDecoratorTarget<Target, Value>
      | undefined,
    context: ClassAccessorDecoratorContext<Target, Value>
      | ClassFieldDecoratorContext<Target, Value>
  ): (
    ClassAccessorDecoratorResult<Target, Value>
    | void
    | ((initialValue: Value) => Value)
  ) {
    if (!name && typeof context.name === 'string') {
      name = context.name;
    }

    const storageKey = Symbol(name);

    interface Storage {
      initClone?: boolean;
      connectedModel: undefined | Value;
      removeConnected: () => void;
    }

    const updateConnectedModel = (
      target: Target,
      newConnectedModel: undefined | Value,
    ) => {
      const storage: Storage = (target as any)[storageKey] as Storage || {
        removeConnected: () => {}
      };
      (target as any)[storageKey] = storage;

      if (newConnectedModel === storage.connectedModel) {
        return
      }
      storage.removeConnected();
      storage.connectedModel = newConnectedModel;
      if (newConnectedModel) {
        storage.removeConnected = connectModel<
          Target,
          Value
        >(
          newConnectedModel,
          target,
          name,
          {
            sync,
            lazy
          }
        );
      } else {
        storage.removeConnected = () => {};
      }
    }

    const initClone = (
      target: Target
    ) => {
      const storage: Storage = (target as any)[storageKey] as Storage;
      if (storage && storage.initClone) {
        return;
      }
      const originClone = target.clone;
      target.clone = function (...args) {
        const originCloneResult = originClone.call(this, ...args) as any;
        const contextName = context.name;
        const originContextClone = originCloneResult[contextName];
        if (
          originContextClone
          && Model.isModel(originContextClone)
        ) {
          delete originCloneResult[storageKey];
          originCloneResult[contextName] = originContextClone.clone();
        }
        return originCloneResult;
      }
    }

    if (context.kind === 'accessor') {
      let { get, set } = value as ClassAccessorDecoratorTarget<Target, Value>;
      return {
        get () {
          const storage: Storage = (this as any)[storageKey] as Storage;
          let connectedModel = storage && storage.connectedModel;
          if (
            lazy
            && !connectedModel
          ) {
            connectedModel = lazy.generate(this);
            updateConnectedModel(this, connectedModel);
            initClone(this);
          }
          return connectedModel;
        },
        set (newValue) {
          updateConnectedModel(this, newValue);
          initClone(this);
          // set.call(this, newValue);
        },
        init (initialValue) {
          updateConnectedModel(this, initialValue);
          initClone(this);
          return initialValue;
        }
      } as ClassAccessorDecoratorResult<Target, Value>;
    }

    if (context.kind === 'field') {
      return function (this: Target, initialValue: Value) {
        updateConnectedModel(this, initialValue);
        return initialValue;
      }
    }
  }

  return connectDecorator;
}
