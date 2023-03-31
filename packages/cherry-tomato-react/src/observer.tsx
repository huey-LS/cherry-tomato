import React from 'react';
import {
  Model
} from '@cherry-tomato/core';

import autoObserve, { ObserveOptions } from './auto-observe';

export default function observer (options?: ObserveOptions) {
  return function (Component: any) {
    return class CherryTomatoObserverComponent extends React.Component<any> {
      __removeListeners: any;
      constructor (props: any) {
        super(props);
        this.__removeListeners = {};
      }

      componentDidMount () {
        this.observe(this.props);
      }

      componentWillUnmount () {
        this.removeListener();
      }

      componentWillReceiveProps (nextProps: any) {
        this.removeListener();
        this.observe(nextProps);
      }

      render () {
        return (
          <Component
            {...this.props}
          />
        )
      }

      willNextUpdate = false;

      updateView = () => {
        this.willNextUpdate = true;
        setTimeout(() => {
          this.forceUpdate();
          this.willNextUpdate = false;
        }, 0);
      }

      observe = (props: any) => {
        Object.keys(props).forEach((key) => {
          let model = props[key];
          if (Model.isModel(model)) {
            this.__removeListeners[key] = autoObserve(
              model,
              () => {
                this.updateView()
              },
              options
            )
          }
        })
      }

      removeListener () {
        let removeListeners = this.__removeListeners;
        Object.keys(removeListeners).forEach((key) => {
          removeListeners[key]();
        })
        this.__removeListeners = {};
      }
    }
  }
}