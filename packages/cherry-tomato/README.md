# cherry-tomato
[![npm version](https://img.shields.io/npm/v/@cherry-tomato/core.svg?maxAge=3600)](https://www.npmjs.org/package/@cherry-tomato/core)

# 介绍
`cherry-tomato` 基于面向对象的设计理念，主要专注于在前端领域里，抽象数据模型和业务逻辑。让逻辑和视图解耦，提高项目代码的可复用性。

`cherry-tomato` 基于 `typescript` 开发，是纯粹的 `js` 代码。


## 安装
```
npm install --save @cherry-tomato/core
```

## 目录
- [核心API](#核心API)
  - [Model模型](#Model模型) 基础`Model`类
  - [Collection集合](#Collection集合) 基础`Collection`类，是多个`Model`的集合（类似数组）
  - [attribute属性装饰器](#attribute属性装饰器) 事件订阅基类，`Model` 事件基于此
  - [connect关联模型装饰器](#connect关联模型装饰器) 自动关联2个`Model`的装饰器
  - [自定义event事件](#自定义event事件) 自定义event事件
- [Usage with react](https://github.com/huey-LS/cherry-tomato/tree/master/packages/cherry-tomato-react)

## 核心API

### Model模型
基础模型类。最基础也是重要的，一般需要配合 attribute 装饰器使用

#### Usage用法
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


### Collection集合
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
- `merge` 效果同 concat，同时会修改自身

#### Hooks 生命周期
- `Model`的所有hooks
- collectionWillUpdateChildren {Function([prevChildren: Array<Model>, nextChildren: Array<Model>])} - 添加/删除子元素之前后触发
- collectionDidUpdateChildren {Function([prevChildren: Array<Model>, nextChildren: Array<Model>])} - 添加/删除子元素后触发
- collectionChildDidUpdate - 任一子元素发生`modelDidUpdate`, `collectionDidUpdateChildren`, `collectionDidUpdateChildren`事件后触发


## attribute属性装饰器
参考Model就可以了

## connect关联模型装饰器
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

## 自定义event事件
待补充
