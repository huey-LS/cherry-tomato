import {
  useState,
  useLayoutEffect
} from 'react';

import {
  Model
} from '@cherry-tomato/core';

import autoObserve, { ObserveOptions } from './auto-observe';

export default function useCherryTomato (model: Model | null, options: UseCherryTomatoOptions = {}) {
  const [, updateState] = useState<any>();

  useLayoutEffect(() => {
    let isSubscribed = true;
    let removeListener = () => {};
    if (model) {
      removeListener = autoObserve(
        model,
        () => {
          if (isSubscribed) {
            updateState({});
          }
        },
        options
      );
    }

    return () => {
      isSubscribed = false;
      removeListener();
    }
  }, [model]);
}

interface UseCherryTomatoOptions extends ObserveOptions {
  /**
   * @params updateFirstRender
   * 使用 useLayoutEffect 同步运行应该不在需要了
   * react useEffect hooks 不是在函数施行时or执行后立刻执行的，是在挂载后才第一次执行，中间可能存在被插入意外更新的可能
   * 如果 model可能在其他地方被更新，建议设置 updateOnMount: true 来更新一次，保证数据的正确性
   * */
  // updateOnMount?: boolean
}
