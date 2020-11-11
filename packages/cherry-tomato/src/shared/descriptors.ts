import {
  createThunkAttributeDecorator
} from './utils';

export const enumerable = createThunkAttributeDecorator<
  boolean
>(function (
  target,
  key,
  descriptor,
  isEnumerable
) {
  if (descriptor) {
    descriptor.enumerable = isEnumerable;
  }
})


export const writable = createThunkAttributeDecorator<
  boolean
>(function (
  target,
  key,
  descriptor,
  isWritable
) {
  if (descriptor) {
    descriptor.writable = isWritable;
  }
})
