import React from 'react';
import {
  Model,
  Collection
} from '@cherry-tomato/core';

interface ObserverOptions {
  autoUpdateEvents?: AutoUpdateEvents
}

interface AutoUpdateEventNameCreator {
  (model: any, key: string): string[];
}
type AutoUpdateEvents = string[] | AutoUpdateEventNameCreator;
export default function observer (options: ObserverOptions = {}) {
  let autoUpdateEvents = options.autoUpdateEvents;

  return function (Component: any) {
    return class CherryTomatoObserverComponent extends React.Component<any> {
      __listeners: any;
      constructor (props: any) {
        super(props);

        this.__listeners = {};
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

      updateView = () => {
        this.forceUpdate();
      }

      observe = (props: any) => {
        Object.keys(props).forEach((key) => {
          let model = props[key];
          if (Model.isModel(model)) {
            let currentUpdateEvents: string[] = [];
            if (!autoUpdateEvents) {
              if (Collection.isCollection(model)) {
                currentUpdateEvents = [
                  'modelDidUpdate',
                  'collectionDidUpdateChildren'
                ]
              } else if (Model.isModel(model)) {
                currentUpdateEvents = [
                  'modelDidUpdate'
                ]
              }
            } else if (typeof autoUpdateEvents === 'function') {
              currentUpdateEvents = autoUpdateEvents(model, key);
            } else {
              autoUpdateEvents = autoUpdateEvents;
            }
            this.__listeners[key] = currentUpdateEvents.map((eventName) => {
              return model.addListener(eventName, () => {
                this.updateView()
              })
            })
          }
        })
      }

      removeListener () {
        let listeners = this.__listeners;
        Object.keys(listeners).forEach((key) => {
          let removeListeners = listeners[key];
          removeListeners.forEach((removeListener: any) => {
            removeListener();
          });
        })
        this.__listeners = {};
      }
    }
  }
}