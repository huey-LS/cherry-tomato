# cherry-tomato
[![npm version](https://img.shields.io/npm/v/@cherry-tomato/core.svg?maxAge=3600)](https://www.npmjs.org/package/@cherry-tomato/core)

# 介绍
`cherry-tomato` 是一个使用js做序列化和分序列化的框架，专注于 `js` 的 `model` 层代码。

`cherry-tomato` 基于 `typescript` 开发，可以提供良好的校验和提示效果。

`cherry-tomato` 是纯粹的 `js` 代码，可以用于各个平台，比如 浏览器和nodejs。

在复杂的应用中，使用`cherry-tomato` 构建完善的 `Model` 可以进一步提高项目代码的可复用性。面向对象的方式也能更好的帮助你理清项目逻辑。

## 安装
```
npm install --save @cherry-tomato/core
```

# API目录
- [API](#api)
  - [Model](#Model%20模型) 基础`Model`类
  - [Collection](#Collection%20集合) 基础`Collection`类，是多个`Model`的集合（类似数组）
  - [EventEmitter](#EventEmitter%20事件订阅基类) 事件订阅基类，`Model` 事件基于此
  - [KeyCreators](#KeyCreators%20内置的key自动生成工具) 内置的key生成工具
    - [randomCreator](#randomCreator) 随机数key生成
    - [incrementCreator](#incrementCreator) 递增的key生成
  - [serialize & output](#serialize%20%26%20output%20自动序列化&反序列化输出) 用于反序列化提取数据的装饰器
  - [connect](#connect%20模型关联方法) 自动关联2个`Model`的装饰器
- [Usage with react](https://github.com/huey-LS/cherry-tomato/tree/master/packages/cherry-tomato-react)

## API 介绍
### Model 模型
基础模型类， 都继承于这个开发

#### Usage 用法
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

##### Static Attributes 静态函数
- [initialAttributes] {Function} - 建议`Function`
  设置为`Function`时，将会把返回值作为初始化的属性
- key - key生成函数 默认使用

#### Hooks 生命周期
- modelWillUpdate {Function(prevAttributes, nextAttributes)} - 调用了`set`, 但还没有执行`set` 操作时，此时 `this.get(attributeName) === prevAttributes.get(attributeName)`
- modelDidUpdate {Function(prevAttributes, nextAttributes)} - 调用了`set`, `set`执行成功, 此时 `this.get(attributeName) === nextAttributes.get(attributeName)`

##### Arguments 实例化时的可选参数
- `[attributes]` 初始化属性 会和 `static initialAttributes`合并

##### Method 内置函数（同时包含 EventEmitter 的内容）
- `get`
- `set`
- `EventEmitter` 所有函数

实例化后可以通过 `get`,`set`对属性进行读写
```js
var m = new CustomModel();
m.get('test') // 1
m.set({ test: 2 })
m.get('test') // 2

var m = new CustomModel({ test: 3 });
m.get('test') // 3
```

### Collection 集合
对`Model`集合的一层包装
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
##### Static Attributes 静态函数
- [Model] - 用于自动生成子元素的构造函数
- `Model` 所有函数

#### Hooks 生命周期
- `Model`的所有hooks
- collectionWillUpdateChildren {Function(prevChildren: Array<Model>, nextChildren: Array<Model>)} - 添加/删除子元素之前后触发
- collectionDidUpdateChildren {Function(prevChildren: Array<Model>, nextChildren: Array<Model>)} - 添加/删除子元素后触发
- collectionChildDidUpdate - 任一子模型 进行 `modelDidUpdate`, `collectionDidUpdateChildren`, `collectionDidUpdateChildren` 后被唤起

##### Arguments 实例化时的可选参数
- `[initialAttributes]` 同`Model`的`initialAttributes`

##### Method 内置函数（同时包含 Model 的内容）
- `EventEmitter` 所有函数
- `Model` 所有函数
- 可以使用`Array`的各种方法 已支持`forEach`, `map`, `reduce`, `reduceRight`, `slice`, `filter`, `find`, `findIndex`, `some`, `every`, `includes`, `indexOf`
  ```
    collection.forEach((item) => {
      console.log(item.get('attr3'))
    })
    // 3
    // 3
  ```
- `addChild` - 添加一个子元素到最后，并添加监听，会自动使用设置的 `Static Model` 去创建
  - @params item {Object} - 子元素属性内容
- `removeChild` - 移除一个子元素，并取消监听，会自动使用设置的 `Static Model` 去创建
  - @params item {Model} - 子元素实例
- `resetChildren` - 重设所有子元素，并添加监听，会自动使用设置的 `Static Model` 去创建
  - @params items {Array} - 子元素数据数组


## EventEmitter 事件订阅基类
待补充


## serialize & output 自动序列化&反序列化输出
```js
class MyModel extends Model {
  @serialize('xxxCount')
  get count () { return 0; }
  set count (arg) {}

  @output()
  getFormated () {
    return [
      'count'
    ]
  }
}
const myModel = new MyModel();
myModel.count // 0, 自定义的getter将作为默认内容输出
myModel.count = 1 //
myModel.count // 1， 能通过 setter 更新
myModel.getFormated() // { xxxCount: 1 } 还能导出原样格式的

const myModel2 = new MyModel({ xxxCount: 3 });
myModel2.count // 3, 可以初始化
```

## connect 模型关联方法
`model`高级用法，关联2个不同的 `model`

### 使用方法
```js
import { Model, connect } from '@cherry-tomato/core';

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
### KeyCreators 内置的key自动生成工具
现在提供以下几种key生成规则

<a id="randomCreator"></a>

#### `randomCreator([length = 32], [radix = 16])` 生成一个随机数作为key

##### Arguments
- `[length = 32]` 以`2^length`的方式生成一个随机数
- `[radix = 16]`  输出的结果的数字基数，默认转换为16进制

<a id="incrementCreator"></a>

#### `incrementCreator(prefix = '')` 以递增方式返回key

