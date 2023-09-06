export function spread () {}

export function respond (
  name: string,
  ctx: any,
  data?: any,
) {
  let spread = ctx[name];
  if (typeof spread === 'function') {
    spread.call(ctx, data);
  }

  if (typeof ctx.emit === 'function') {
    ctx.emit(name, data);
  }
}
