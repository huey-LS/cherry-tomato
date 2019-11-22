import {
  createThunkAttributeDecorator
} from './utils';

export const enumerable = createThunkAttributeDecorator<
  boolean
>(function (
  isEnumerable,
  target,
  key,
  descriptor
) {
  if (descriptor) {
    descriptor.enumerable = isEnumerable;
  }
})


export const writable = createThunkAttributeDecorator<
  boolean
>(function (
  isWritable,
  target,
  key,
  descriptor
) {
  if (descriptor) {
    descriptor.writable = isWritable;
  }
})
