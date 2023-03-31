export function clone<T = any> (obj: T): T {
  let newModel = { ...obj };
  (newModel as any).__proto__ = (obj as any).__proto__;
  return newModel;
}
