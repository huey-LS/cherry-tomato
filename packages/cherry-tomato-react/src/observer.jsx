import * as React from 'react';
import { Model, Collection } from '@cherry-tomato/core';

export default function observer (options = {}) {
  let autoUpdateEvents = options.autoUpdateEvents;

  return function (Component) {
    return class CherryTomatoObserverComponent extends React.Component {
      constructor (props) {
        super(props);

        this.__listeners = {};
      }

      componentDidMount () {
        this.observe(this.props);
      }

      componentWillUnmount () {
        this.removeListener();
      }

      componentWillReceiveProps (nextProps) {
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

      observe = (props) => {
        Object.keys(props).forEach((key) => {
          let model = props[key];
          if (Model.isModel(model)) {
            let currentUpdateEvents = autoUpdateEvents;
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
          removeListeners.forEach((removeListener) => {
            removeListener();
          });
        })
        this.__listeners = {};
      }
    }
  }
}