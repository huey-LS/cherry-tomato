interface LastCall {
  args: any[];
  timer: number;
  self: any;
  first: boolean;
}

type FC<F extends (...args: any) => any> = (...args: Parameters<F>) => void;

export interface ThrottleParams {
  /**
   * 只是减少同步操作导致的多次更新
   * default: 20
   */
  wait?: number;
  /**
   * 是否立即响应
   * default: false
   */
  leading?: boolean;
  /**
   * wait后是否响应
   * default: true
   */
  trailing?: boolean;
}

// throttle
export function throttle<
  T extends (
    ...args: any
  ) => any
> (
  fn: T,
  {
    wait = 20,
    leading = false,
    trailing = true,
  }: ThrottleParams = {}
) {
  let lastCall: LastCall | null = null;

  const createTimer = () => {
    return setTimeout(() => {
      if (
        lastCall
        && trailing
        && !(lastCall.first && leading)
      ) {
        fn.call(lastCall.self, ...lastCall.args)
      }
      lastCall = null;
    }, wait);
  }

  const run: FC<T> = function (this: any, ...args: any) {
    if (lastCall) {
      lastCall.self = this;
      lastCall.args = args;
      lastCall.first = false;
      return;
    }

    if (leading) {
      fn.call(this, ...args);
    }

    lastCall = {
      args,
      self: this,
      first: true,
      timer: createTimer()
    }
  } as any;

  return {
    run,
    stop: () => {
      if (lastCall) {
        clearTimeout(lastCall.timer);
        lastCall = null;
      }
    }
  }
}
