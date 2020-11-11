export function clone<T = any> (obj: T): T {
  let newModel = { ...obj };
  (newModel as any).__proto__ = (obj as any).__proto__;
  return newModel;
}

export const mixinFunctionFromArray = (
  map: string[],
  transform: (target: any) => any
) => (target: any) => {
  if (Array.isArray(map) && 'function' === typeof transform) {
    map.forEach((key) => {
      if('function' === typeof (Array.prototype as any)[key]) {
        Object.defineProperty(target.prototype, key, {
          value: function (
            ...args: any[]
          ) {
            let currentTarget = transform(this);
            return currentTarget && currentTarget[key] && currentTarget[key](...args)
          },
          writable: true,
          enumerable: false,
          configurable: true
        });
      }
    })
  }
  return target;
}

interface ThunkAttributeDecorator<OptionsType> {
  (
    target: any,
    key: string,
    descriptor?: PropertyDescriptor,
    options?: OptionsType
  ): void;
}

export function createThunkAttributeDecorator<
  OptionsType
> (
  callback: ThunkAttributeDecorator<OptionsType>
) {
  return function (
    options?: OptionsType
  ) {
    return function (
      target: any,
      key: string,
      descriptor?: PropertyDescriptor
    ): any {
      return mixinDescriptor<OptionsType>(
        callback, target, key, descriptor, options
      );
    }
  }
}

function mixinDescriptor<OptionsType> (
  callback: ThunkAttributeDecorator<OptionsType>,
  target: any,
  key: string,
  descriptor?: PropertyDescriptor,
  options?: OptionsType
) {
  if (!descriptor) {
    descriptor = Object.create(null) as PropertyDescriptor;
  }


  const newValue = callback.call(
    target,
    target,
    key,
    descriptor,
    options
  )

  if (typeof newValue !== 'undefined') {
    descriptor.value = newValue;
  }

  return descriptor;
}
