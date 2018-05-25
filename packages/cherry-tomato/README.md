# cherry-tomato
[![npm version](https://img.shields.io/npm/v/@cherry-tomato/core.svg?maxAge=3600)](https://www.npmjs.org/package/@cherry-tomato/core)

# Description
`cherry-tomato` 是一个使用js做序列化和分序列化的框架，专注于 `js` 的 `model` 层代码

# Installation
```
npm install --save @cherry-tomato/core
```

# Documentation
- [API](#api)
  - [Model](#Model) 基础`Model`类
  - [Collection](#Collection) 基础`Collection`类，是多个`Model`的组合（类似数组）
  - [EventEmitter](#EventEmitter) 事件订阅基类，`Model` 事件基于此
  - [KeyCreators](#KeyCreators) 内置的key生成工具
    - [randomCreator](#randomCreator) 随机数key生成
    - [incrementCreator](#incrementCreator) 递增的key生成
  - [connect] 自动关联2个`Model`的装饰器
  - [serialize] 用于反序列化提取数据的装饰器
  - [output] 用于自动整合数据导出的装饰器
- [Usage with react](https://github.com/huey-LS/cherry-tomato/tree/master/packages/cherry-tomato-react/README.md)

## API
### Model
构建一个自己的model

#### Usage
```js
import { Model } from '@cherry-tomato/core';

class CustomModel extends Model {
  static key; // key生成函数 默认使用 key-creators.incrementCreator
  static initialAttributes = () => ({ test: 1 }); // 每次实例初始化的属性

  // attributes set 前的 hook
  modelWillUpdate () {}

  // attributes set 后的 hook
  modelDidUpdate () {}
}
```

##### Static Attributes
- [initialAttributes] {Function} - 建议`Function`
  设置为`Function`时，将会把返回值作为初始化的属性
- key - key生成函数 默认使用

#### Hooks
- modelWillUpdate {Function(prevAttributes, nextAttributes)} - 调用了`set`, 但还没有执行`set` 操作时，此时 `this.get(attributeName) === prevAttributes.get(attributeName)`
- modelDidUpdate {Function(prevAttributes, nextAttributes)} - 调用了`set`, `set`执行成功, 此时 `this.get(attributeName) === nextAttributes.get(attributeName)`

##### Arguments
- `[attributes]` 初始化属性 会和 `static initialAttributes`合并

##### Method
实例化后可以通过 `get`,`set`对属性进行读写
```js
var m = new CustomModel();
m.get('test') // 1
m.set({ test: 2 })
m.get('test') // 2

var m = new CustomModel({ test: 3 });
m.get('test') // 3
```

### Collection
对`Model`集合的一层包装, 同时会自动监听所有子`Model`的`update`事件
```js
import { Collection } from '@cherry-tomato/core';
class CustomCollection extends Collection {
  static Model = CustomModel;
  static key;
  static initialAttributes = { test: 1 };

  // hook: before update children (includes remove, add)
  collectionWillUpdateChildren () {}
  // hook: after update children (includes remove, add)
  collectionDidUpdateChildren () {}
}

// new CustomCollection([initialAttributes], [initialAttributes[]]);
var collection = new CustomCollection(
  { attr2: 2 }
)
```
##### Static Attributes
- key - 和`model`相同
- [initialAttributes] - 和`model`相同
- [Model] - 用于自动生成子元素的构造函数

#### Hooks
- `model`的所有hooks
- collectionDidUpdateChildren {Function(prevChildren: Array<Model>, nextChildren: Array<Model>)} - 添加/删除子元素之前触发
- collectionDidAddChild {Function(prevChildren: Array<Model>, nextChildren: Array<Model>)} - 添加/删除子元素成功后触发

##### Arguments
- `[initialAttributes]` 同`Model`的`initialAttributes`

##### Method
- 可以使用`Array`的各种方法 已支持`forEach`, `map`, `reduce`, `reduceRight`, `slice`, `filter`, `find`, `findIndex`, `some`, `every`, `includes`, `indexOf`
  ```
    collection.forEach((item) => {
      console.log(item.get('attr3'))
    })
    // 3
    // 3
  ```
- `addChild` - 添加一个子元素到最后，并添加监听
  - @params item {Object} - 子元素属性内容
- `removeChild` - 移除一个子元素，并取消监听
  - @params item {Model} - 子元素实例
- `resetChildren` - 重设所有子元素，并添加监听
  - @params items {Array<Object>}


## connect
`model`高级用法，关联2个不同的 `model`

### usage
```js
import { Model, connect } from '@cartons/core';

import ModelA from './model-a';

class ModelB extends Model {
  @connect({
    modelDidUpdate: function (self, connectedModel) {
      self.set('connectedCount', connectedModel.get('count'));
    }
  })
  a = new ModelA();
}

let b = new ModelB();
```
这样`a`被修改的时候，会关联触发`connect`中的`modelDidUpdate`，已同步更闹心

## 其他可用的功能
### KeyCreators
现在提供以下几种key生成规则

<a id="randomCreator"></a>

#### `randomCreator([length = 32], [radix = 16])` 生成一个随机数作为key

##### Arguments
- `[length = 32]` 以`2^length`的方式生成一个随机数
- `[radix = 16]`  输出的结果的数字基数，默认转换为16进制

<a id="incrementCreator"></a>

#### `incrementCreator(prefix = '')` 以递增方式返回key


### actions

#### `bindAction(filter: Function|Object)))`
##### usage
```js
class A {
  @bindAction((_self) => (_self.model)) action1 = action1;
  model = new CustomModel();
}

var a = new A();
a.action1(1);

function action1 (param) {
  // param === 1
  return function (model) {
    // model === a.model
  }
}
```

