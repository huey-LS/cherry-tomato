import Model from './model';
import {
  Event
} from './event-emitter';
import {
  MODEL_DID_UPDATE,
  COLLECTION_WILL_UPDATE_CHILDREN,
  COLLECTION_DID_UPDATE_CHILDREN,
  COLLECTION_CHILD_DID_UPDATE
} from '../constants/life-cycle';
import { respond } from '../shared/spread';


type prevChildren<ModelClass> = ModelClass[];
type nextChildren<ModelClass> = ModelClass[];
type CollectionUpdateChildrenEventData<ModelClass> = [
  prevChildren<ModelClass>,
  nextChildren<ModelClass>
]

export interface CommonCollectionEventConfig<ModelClass> {
  [COLLECTION_WILL_UPDATE_CHILDREN]: CollectionUpdateChildrenEventData<ModelClass>;
  [COLLECTION_DID_UPDATE_CHILDREN]: CollectionUpdateChildrenEventData<ModelClass>;
}

class Collection<
CM extends Model = Model,
ED = {},
Attrs = any,
> extends Model<
ED & CommonCollectionEventConfig<CM> & {
  [COLLECTION_CHILD_DID_UPDATE]: {
    child: CM
  }
},
Attrs
> {
  static isCollection = function (obj: any): obj is Collection {
    return obj &&
        (
          obj instanceof Collection
          || obj.__cherry_tomato_collection
        )
  };

  static Model: (typeof Model<any>)|(() => Model<any>);

  static isChildModel?: (model: any) => boolean;

  static childrenJSONKey: string = 'children';

  readonly __cherry_tomato_collection = true;

  get _Model () {
    const constructor = this.constructor as typeof Collection;
    return constructor.Model;
  }

  get _isChildModel () {
    const constructor = this.constructor as typeof Collection;
    return constructor.isChildModel || ((model) => (model instanceof this._Model));
  }

  _children: CM[] = [];

  _childListener = (event: Event) => {
    if (
      ~[
        MODEL_DID_UPDATE,
        COLLECTION_CHILD_DID_UPDATE,
        COLLECTION_DID_UPDATE_CHILDREN
      ].indexOf(event.type)
    ) {
      respond(
        COLLECTION_CHILD_DID_UPDATE,
        this,
        { child: event.target }
      );
    }
  }

  callFromArray<
    ArrayMethod extends keyof typeof Array.prototype
  > (
    method: ArrayMethod,
    ...args: Parameters<typeof Array.prototype[ArrayMethod]>
  ): ReturnType<typeof Array.prototype[ArrayMethod]> {
    return Array.prototype[method].call(this.getChildren(), ...args);
  }

  // transformFromArrayMap
  forEach (...args: Parameters<Array<CM>["forEach"]>) {
    return this.callFromArray('forEach', ...args);
  }
  // map: Array<CM>["map"] = (...args) => {
  //   return this.callFromArray('map', ...args) as any;
  // };
  map<U> (
    callback: (value: CM, index: number, array: CM[]) => U
  ) {
    return this.callFromArray('map', callback) as U[];
  }
  reduce<U> (
    callbackfn: (
      previousValue: U,
      currentValue: CM,
      currentIndex: number,
      array: CM[]
    ) => U,
    initialValue: U
  ): U {
    return this.callFromArray('reduce', callbackfn as any, initialValue) as U;
  }

  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: CM,
      currentIndex: number,
      array: CM[]
    ) => U,
    initialValue: U
  ): U {
    return this.callFromArray('reduceRight', callbackfn as any, initialValue) as U;
  }
  find (...args: Parameters<Array<CM>["find"]>): ReturnType<Array<CM>["find"]> {
    return this.callFromArray('find', ...args);
  }
  findIndex (...args: Parameters<Array<CM>["findIndex"]>) {
    return this.callFromArray('findIndex', ...args);
  }
  some (...args: Parameters<Array<CM>["some"]>): ReturnType<Array<CM>["some"]> {
    return this.callFromArray('some', ...args);
  }
  every (...args: Parameters<Array<CM>["every"]>): ReturnType<Array<CM>["every"]> {
    return this.callFromArray('every', ...args);
  }
  includes (...args: Parameters<Array<CM>["includes"]>): ReturnType<Array<CM>["includes"]> {
    return this.callFromArray('includes', ...args);
  }
  indexOf (...args: Parameters<Array<CM>["indexOf"]>) {
    return this.callFromArray('indexOf', ...args);
  }

  filter (...args: Parameters<Array<CM>["filter"]>) {
    const newChildren = this.callFromArray('filter', ...args);
    const constructor = this.constructor as typeof Collection;
    let newCollection = new constructor() as this;
    newCollection.resetChildren(
      newChildren
    );
    return newCollection;
  }

  slice (...args: Parameters<Array<CM>["slice"]>) {
    const newChildren = this.callFromArray('slice', ...args);
    const constructor = this.constructor as typeof Collection;
    let newCollection = new constructor() as this;
    newCollection.resetChildren(
      newChildren
    );
    return newCollection;
  }

  merge (...args: Collection<CM>[]) {
    const constructor = this.constructor as typeof Collection;
    if (
      args.some((collection) => {
        return !(collection instanceof constructor);
      })
    ) {
      throw new Error('collection.concat must be the same collection');
    }
    this.resetChildren(
      this.children.concat(...args.map(({ children })=> children))
    );
  }

  concat (...args: Collection<CM>[]) {
    const constructor = this.constructor as typeof Collection;
    if (
      args.some((collection) => {
        return !(collection instanceof constructor);
      })
    ) {
      throw new Error('collection.concat must be the same collection');
    }
    let newCollection = new constructor() as this;
    newCollection.resetChildren(
      this.children.concat(...args.map(({ children })=> children))
    );
    return newCollection;
  }

  // before children change
  [COLLECTION_WILL_UPDATE_CHILDREN]? (data: CollectionUpdateChildrenEventData<CM>): void;
  // after children change
  [COLLECTION_DID_UPDATE_CHILDREN]? (data: CollectionUpdateChildrenEventData<CM>): void;
  // after one child change
  [COLLECTION_CHILD_DID_UPDATE]? (data: {
    child: CM
  }): void;

  clone () {
    const newThis = super.clone.call(this);

    newThis._children = this._children.slice(0);
    return newThis;
  }

  toJSON () {
    const constructor = this.constructor as typeof Collection;

    return {
      ...super.toJSON(),
      [constructor.childrenJSONKey]: this.toArray()
    };
  }

  toArray () {
    return this._children.map((item) => (item.toJSON()));
  }

  get children () {
    return this._children;
  }


  get length () {
    return this._children.length;
  }

  getChildren() {
    return this._children.slice(0);
  }

  addChild (item: CM | any) {
    this._addChild(
      this._createModal(item)
    );
    return this;
  }

  removeChild (itemKey: string | CM) {
    if (Model.isModel(itemKey)) {
      itemKey = itemKey.key;
    }
    itemKey && this._removeChildByKey(
      itemKey
    );
    return this;
  }

  resetChildren (items?:  (CM|any)[] | this) {
    this._resetChild(
      (items || []).map((item) => (
        this._createModal(item)
      ))
    );
    return this;
  }

  destroy () {
    super.destroy();
    this._unsubscribeChildren();
    this._children = [];
  }

  _addChild (newChild: CM) {
    const prevChildren = this._children;
    const nextChildren = [
      ...prevChildren,
      newChild
    ];
    this._resetChild(nextChildren);

    return this;
  }

  _removeChildByKey (key: any) {
    let currentChildIndex = this.findIndex((i) => i.key === key);
    if (currentChildIndex > -1) {
      const prevChildren = this._children;
      const nextChildren = [
        ...prevChildren.slice(0, currentChildIndex),
        ...prevChildren.slice(currentChildIndex + 1)
      ];
      this._resetChild(nextChildren);
    }

    return this;
  }

  _resetChild (nextChildren: CM[]) {
    const prevChildren = this._children;
    respond(COLLECTION_WILL_UPDATE_CHILDREN, this, [prevChildren, nextChildren]);
    this._unsubscribeChildren();
    this._children = nextChildren;
    this._subscribeChildren();
    respond(COLLECTION_DID_UPDATE_CHILDREN, this, [prevChildren, nextChildren]);
    return this;
  }

  _unsubscribeChildren () {
    this._children.map((model) => {
      model.removeAllListener(this._childListener);
    })
  }

  _subscribeChildren () {
    this._children.map((model) => {
      model.addAllListener(this._childListener);
    })
  }

  _createModal (item: any) {
    let current: CM;
    if (this._isChildModel(item)) {
      current = item;
    } else {
      current = new (this._Model as any)(item) as CM;
    }

    return current;
  }
}

export default Collection;

export function generateCollection<
MC extends typeof Model,
CustomEvent = {},
M extends Model = InstanceType<MC>,
> (
  ModelClass: MC
) {
  class CustomCollection extends Collection<M, CustomEvent> {
    static Model = ModelClass
  }

  return (
    params: Parameters<CustomCollection['resetChildren']>[0]
  ) => {
    const collection = new CustomCollection();
    collection.resetChildren(params);
    return collection;
  }
}