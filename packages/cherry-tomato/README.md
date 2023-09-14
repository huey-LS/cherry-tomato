.# cherry-tomato
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

### 最常用的个API
1. Model
2. Collection
3. attribute 装饰器

### Model 模型
基础模型类。最基础也是重要的，一般需要配合 attribute 装饰器使用

#### Usage 用法
```ts
import {
  Model,
  attribute
} from '@cherry-tomato/core';

class CustomModel extends Model {
  @attribute()
  accessor text = 'a'; // 设置默认值为a
}

const custom = new CustomModel();
custom.text === 'a';
```

##### Arguments 实例化时的可选参数
- `[attributes]` 初始化属性
```ts
const custom = new CustomModel({ text: 'b' });
custom.text === 'b';
```


##### Method 内置函数（同时包含 EventEmitter 的内容）
- `get(key)` 获取属性，设置过的属性可以被通过**attribute**装饰过的属性直接获取
- `set(key, value)` 设置属性
- `reset(value)` 重设所有属性
- `remove(key)` 删除对应属性

使用例子如下
```ts
custom.set('text', 'c');
custom.text === 'c';
custom.get('text') === 'c';
```


##### Static Attributes 静态函数
- [initialAttributes] {Function} - 将会把返回值作为初始化的属性。现在更推荐使用`class fields`的方式设置默认值
- key - key生成函数，默认无需设置，会自动生成

#### Hooks 生命周期
model设置了2个生命周期，同时会抛出同名的Event
1. modelWillUpdate {Function([prevAttribute, nextAttribute])} - 调用了`set`, 但还没有执行`set` 操作时，此时 `this.get(attributeName) === prevAttributes.get(attributeName)`
2. modelDidUpdate {Function([prevAttribute, nextAttribute])} - 调用了`set`, `set`执行成功, 此时 `this.get(attributeName) === nextAttributes.get(attributeName)`


### Collection 集合
继承自Model, 扩充对数组类型的支持。会更具`static Model`的静态属性自动转换children对对应的对象实例
```ts
import {
  Collection
  } from '@cherry-tomato/core';
class CustomCollection extends Collection<CustomModel> {
  static Model = CustomModel;

  // hook: before update children (includes remove, add)
  collectionWillUpdateChildren () {}
  // hook: after update children (includes remove, add)
  collectionDidUpdateChildren () {}
}

const customCollection = new CustomCollection();
customCollection.resetChildren(
  [
    {
      text: 'a'
    },
    {
      text: 'b'
    }
  ]
);

customCollection.children[0] instanceof CustomModel;
customCollection.children[0].text === 'a';
customCollection.children[1].text === 'b';
```

##### Arguments 实例化时的可选参数
- `[initialAttributes]` 同`Model`的`initialAttributes`

##### Static Attributes 静态函数
- `Model` - 用于自动生成子元素的构造函数
- 其他继承于 Model

##### Method 内置函数（同时包含 Model 的内容）
- `Model` 所有函数
- 可以使用`Array`的各种方法 已支持`forEach`, `map`, `reduce`, `reduceRight`, `slice`, `filter`, `find`, `findIndex`, `some`, `every`, `includes`, `indexOf`
  ```ts
    customCollection.forEach((custom) => {
      console.log(custom.text)
    })
    // 'a'
    // 'b'
  ```
  特别注意：filter、slice、concat 返回的是一个collection实力
- `addChild` - 添加一个子元素到最后，并添加监听，会自动使用设置的 `Static Model` 去创建
  - @params item {Object} - 子元素属性内容
- `removeChild` - 移除一个子元素，并取消监听，会自动使用设置的 `Static Model` 去创建
  - @params item {Model} - 子元素实例
- `resetChildren` - 重设所有子元素，并添加监听，会自动使用设置的 `Static Model` 去创建
  - @params items {Array} - 子元素数据数组
- `merge` 效果同 concat 但是会修改自身

#### Hooks 生命周期
- `Model`的所有hooks
- collectionWillUpdateChildren {Function([prevChildren: Array<Model>, nextChildren: Array<Model>])} - 添加/删除子元素之前后触发
- collectionDidUpdateChildren {Function([prevChildren: Array<Model>, nextChildren: Array<Model>])} - 添加/删除子元素后触发
- collectionChildDidUpdate - 任一子元素发生`modelDidUpdate`, `collectionDidUpdateChildren`, `collectionDidUpdateChildren`事件后触发



## 其他额外辅助API
## EventEmitter 事件订阅基类
待补充


## attribute 自动序列化&反序列化输出
参考Model就可以了

## connect 模型关联方法
高级用法，关联不同的实例

### 使用方法
```js
import {
  Model,
  connect,
  attribute
} from '@cherry-tomato/core';

class ModelA extends Model {
  @attribute()
  accessor text = 'a';
}

class ModelB extends Model {
  @connect()
  a = new ModelA();
}

const b = new ModelB({
  a: {
    text: 'aa'
  }
});

b.a instanceof ModelA;
b.a.text === 'aa';
```



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

