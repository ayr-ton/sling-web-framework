import { pickBy, isFunction } from 'sling-helpers';
import { LitElement } from '../../../lib/lit-element.bundle.js';

export const withObservedProperties = (Base = LitElement) =>
  class extends Base {
    static get observedProperties() {
      return pickBy(this.properties || {},
        ({ observer }) => observer != null);
    }

    _propertiesChanged(props, changedProps, oldProps, ...lastArgs) {
      super._propertiesChanged(props, changedProps, oldProps, ...lastArgs);

      const { observedProperties } = this.constructor;
      const observedPropertyNames = Object.keys(observedProperties);

      Object
        .entries(changedProps || {})
        .filter(([propName]) => observedPropertyNames.includes(propName))
        .forEach(([propName, propValue]) => {
          const newValue = propValue;
          const oldValue = oldProps[propName];
          const callback = observedProperties[propName].observer;

          const fn = isFunction(callback)
            ? callback.bind(this)
            : this[callback].bind(this);

          fn(newValue, oldValue);
        });
    }
  };
