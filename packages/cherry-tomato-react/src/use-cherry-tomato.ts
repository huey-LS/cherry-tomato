import {
  useState,
  useEffect
} from 'react';

import {
  Model
} from '@cherry-tomato/core';

import autoObserve, { ObserveOptions } from './auto-observe';

export default function useCherryTomato (model: Model, options?:ObserveOptions ) {
  const [, updateState] = useState();

  useEffect(() => {
    let isSubscribed = true;
    let removeListener = autoObserve(
      model,
      () => {
        if (isSubscribed) {
          updateState({});
        }
      },
      options
    );

    return () => {
      isSubscribed = false;
      removeListener();
    }
  }, [model]);
}