import {
  MODEL_DID_UPDATE,
  CONNECT_MODEL_DID_UPDATE,
  COLLECTION_UPDATE_LIFE_CYCLES
} from '../../constants/life-cycle';

import Model, {
  CommonModelEventConfig,
} from '../model';
import type {
  Event
} from '../event-emitter';
import Collection from '../collection';
import {
  throttle
} from '../../shared/throttle';

export type WillConnectChildM = Model | undefined | null;


type ShouldSyncToConnected<
ConnectedM extends WillConnectChildM = WillConnectChildM,
M extends Model = Model> = (
  event: Event,
  connectedModel: ConnectedM,
  target: M,
  key: string
) => boolean;

type TransformToConnected<
ConnectedM extends WillConnectChildM = WillConnectChildM,
M extends Model = Model> = (connectedModel: ConnectedM, target: M, key: string) => boolean;

type ShouldSyncToTarget<
ConnectedM extends WillConnectChildM = WillConnectChildM,
M extends Model = Model> = (
    event: Event,
    connectedModel: ConnectedM,
    target: M,
    key: string
  ) => boolean;
type TransformToTarget<
ConnectedM extends WillConnectChildM = WillConnectChildM,
M extends Model = Model> = (connectedModel: ConnectedM, target: M, key: string) => boolean;

export interface SyncParams<
ConnectedM extends WillConnectChildM = WillConnectChildM,
M extends Model = Model> {
  /**
   * 节流同步
   */
  shouldSyncToConnected?: ShouldSyncToConnected<ConnectedM, M>;
  transformToConnected?: TransformToConnected<ConnectedM, M>,
  throttle?: boolean;
  shouldSyncToTarget?: ShouldSyncToTarget<ConnectedM, M>;
  transformToTarget?: TransformToTarget<ConnectedM, M>;
}

export interface ConnectOptions<
ConnectedM extends WillConnectChildM = WillConnectChildM,
M extends Model = Model> {
  sync?: boolean | SyncParams<ConnectedM, M>;
  /**
   * 开启 lazy 可以在第一次访问的时候才初始化，可以减少一些消耗
   * 需要配合 accessor 装饰器使用
   */
  lazy?: {
    generate: (parent: M) => ConnectedM;
  }
}


const defaultShouldSyncToConnected: ShouldSyncToConnected = (
  event,
  connectedModel,
  target,
  key
) => {
  if (event.type !== MODEL_DID_UPDATE) {
    return false;
  }
  const { data } = event;
  const [prevAttributes, nextAttributes] = data
  return prevAttributes.get(key) !== nextAttributes.get(key);
}

const defaultTransformToConnected: TransformToConnected = (
  connectedModel,
  target,
  key
) => {
  if (Collection.isCollection(connectedModel)) {
    connectedModel.resetChildren(target.get(key))
    return true;
  }
  if (Model.isModel(connectedModel)) {
    connectedModel.reset(target.get(key));
    return true;
  }
  return false;
}

const defaultShouldSyncToTarget: ShouldSyncToTarget = (
  event
) => {
  return !!(~COLLECTION_UPDATE_LIFE_CYCLES.indexOf(event.type));
}

const defaultTransformToTarget: TransformToTarget = (
  connectedModel,
  target,
  key
) => {
  if (!connectedModel) {
    return false;
  }
  target.set(key, connectedModel.toJSON())
  return true;
}

export const defaultConnectSyncParams: SyncParams = {
  throttle: false,
  shouldSyncToConnected: defaultShouldSyncToConnected,
  transformToConnected: defaultTransformToConnected,
  shouldSyncToTarget: defaultShouldSyncToTarget,
  transformToTarget: defaultTransformToTarget
}


function connectModel<
  M extends Model = Model,
  ConnectedM extends WillConnectChildM = WillConnectChildM
> (
  connectedModel: ConnectedM,
  target: M,
  key: string,
  options: ConnectOptions<ConnectedM, M>
) {
  let transformToConnected: TransformToConnected<ConnectedM, M> = defaultTransformToConnected;
  let shouldSyncToConnected: ShouldSyncToConnected<ConnectedM, M> = defaultShouldSyncToConnected;

  let transformToTarget: TransformToTarget<ConnectedM, M> = defaultTransformToTarget;
  let shouldSyncToTarget: ShouldSyncToTarget<ConnectedM, M> = defaultShouldSyncToTarget;

  if (typeof options.sync === 'object') {
    if (options.sync.transformToConnected) {
      transformToConnected = options.sync.transformToConnected;
    }
    if (options.sync.shouldSyncToConnected) {
      shouldSyncToConnected = options.sync.shouldSyncToConnected;
    }
    if (options.sync.transformToTarget) {
      transformToTarget = options.sync.transformToTarget;
    }
    if (options.sync.shouldSyncToTarget) {
      shouldSyncToTarget = options.sync.shouldSyncToTarget;
    }
  }

  // 设置初始化值
  if (target.get(key) && connectedModel) {
    transformToConnected(connectedModel, target, key);
  }

  let removeListener = () => {};


  if (
    options.sync
  ) {
    const syncParams = {
      ...defaultConnectSyncParams,
      ...(
        typeof options.sync !== 'boolean'
        ? options.sync
        : {}
      )
    };
    let syncing = false;
    const connectedModelCallback: Parameters<Model['addAllListener']>[0] = (event) => {
      if (
        !syncing
        && shouldSyncToTarget(event, connectedModel, target, key)
      ) {
        syncing = true;
        const changed = transformToTarget(connectedModel, target, key);
        syncing = false;
        if (changed && connectedModel) {
          target.emit(
            CONNECT_MODEL_DID_UPDATE,
            {
              key,
              modal: connectedModel
            }
          )
        }
      }
    }

    let removeConnectedModelDidUpdateListener = connectedModel?.addAllListener(
      syncParams.throttle ? throttle(connectedModelCallback).run : connectedModelCallback
    );

    const targetModelCallback: Parameters<Model['addAllListener']>[0] = (event) => {
      if (
        !syncing
        && shouldSyncToConnected(event, connectedModel, target, key)
      ) {
        syncing = true;
        transformToConnected(connectedModel, target, key);
        syncing = false;
      }
    }

    let removeTargetDidUpdateListener = target.addAllListener(
      syncParams.throttle ? throttle(targetModelCallback).run : targetModelCallback
    );

    let prevRemoveListener = removeListener;

    removeListener = () => {
      removeConnectedModelDidUpdateListener?.();
      removeTargetDidUpdateListener();
      prevRemoveListener();
    }
  } else {
    const connectedModelCallback: Parameters<Model['addAllListener']>[0] = (event) => {
      if (
        shouldSyncToConnected(event, connectedModel, target, key)
        && connectedModel
      ) {
        target.emit(
          CONNECT_MODEL_DID_UPDATE,
          {
            key,
            modal: connectedModel
          }
        )
      }
    };

    let removeConnectedModelDidUpdateListener = connectedModel?.addAllListener(
      connectedModelCallback
    );

    let prevRemoveListener = removeListener;
    removeListener = () => {
      removeConnectedModelDidUpdateListener?.();
      prevRemoveListener();
    }
  }

  target.addListener('willDestroy', () => {
    removeListener();
  });

  connectedModel?.addListener('willDestroy', () => {
    removeListener();
  })

  return () => {
    removeListener();
  }
}

export function connect<
Value extends WillConnectChildM = Model,
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
