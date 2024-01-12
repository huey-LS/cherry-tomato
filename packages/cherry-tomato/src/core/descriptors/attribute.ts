import Model from '../model';


const SHOULD_NOT_SET = Symbol('should_not_set');

export function attribute (
  params?: string | {
    name?: string;
  }
) {
  let name: string = '';
  if (params) {
    if (typeof params === 'string') {
      name = params
    } else {
      if (params.name) {
        name = params.name;
      }
    }
  }

  function attributeDecorator<This extends Model, Value> (
    value: ClassAccessorDecoratorTarget<This, Value>,
    context: ClassAccessorDecoratorContext<This, Value>
  ): ClassAccessorDecoratorResult<This, Value>;
  function attributeDecorator<This extends Model, Value> (
    value: undefined,
    context: ClassFieldDecoratorContext<This, Value>
  ): void | ((initialValue: Value) => Value);
  function attributeDecorator<This extends Model, Value> (
    value: () => Value,
    context: ClassGetterDecoratorContext<This, Value>
  ): () => Value;
  function attributeDecorator<This extends Model, Value> (
    value: (newValue: Value) => void,
    context: ClassSetterDecoratorContext<This, Value>
  ): (newValue: Value) => void;
  function attributeDecorator<This extends Model, Value> (
    value: ClassAccessorDecoratorTarget<This, Value>
      | undefined
      | (() => Value)
      | ((newValue: Value) => void),
    context:
      ClassAccessorDecoratorContext<This, Value>
      | ClassFieldDecoratorContext<This, Value>
      | ClassGetterDecoratorContext<This, Value>
      | ClassSetterDecoratorContext<This, Value>
  ): (ClassAccessorDecoratorResult<This, Value>
    | void
    | (() => Value)
    | ((newValue: Value) => void)
  ) {
    if (!name && typeof context.name === 'string') {
      name = context.name;
    }

    if (context.kind === 'accessor') {
      return {
        get () {
          return this.get(name);
        },
        set (newValue) {
          if (newValue !== SHOULD_NOT_SET) {
            this.set(name, newValue);
          }
        },
        init (initialValue) {
          if (typeof this.get(name) !== 'undefined') {
            return SHOULD_NOT_SET;
          }
          this.set(name, initialValue);
          return initialValue;
        }
      } as ClassAccessorDecoratorResult<This, Value>;
    }

    if (context.kind === 'getter') {
      return function attributeGetter (this: This) {
        let ret = this.get(name);
        if (typeof ret === 'undefined') {
          ret = (value as () => Value).call(this);
        }
        return ret;
      }
    }

    if (context.kind === 'setter') {
      return function attributeSetter (this: This, newValue) {
        this.set(name, newValue);
      }
    }

    if (context.kind === 'field') {
      let propertyDescriptor: PropertyDescriptor = {
        get (this: This) {
          return this.get(name);
        },
        set (this: This, newValue) {
          if (newValue !== SHOULD_NOT_SET) {
            this.set(name, newValue);
          }
        }
      };
      context.addInitializer && context.addInitializer(function () {
        if (
          Object.getOwnPropertyDescriptor(this, context.name) !== propertyDescriptor
        ) {
          Object.defineProperty(
            this,
            context.name,
            propertyDescriptor
          )
        }
      });
      return function (this: This, initialValue: Value) {
        if (
          Object.getOwnPropertyDescriptor(this, context.name) !== propertyDescriptor
        ) {
          Object.defineProperty(
            this,
            context.name,
            propertyDescriptor
          )
        }
        if (typeof this.get(name) !== 'undefined') {
          return SHOULD_NOT_SET
        }
        return initialValue;
      }
    }
  }

  return attributeDecorator
}
