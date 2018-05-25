# @cherry-tomato/react

[![npm version](https://img.shields.io/npm/v/@cherry-tomato/react.svg?maxAge=3600)](https://www.npmjs.org/package/@cherry-tomato/react)

# Description
`cherry-tomato` 配合 `react` 使用，使页面自动更新的框架

# Installation
```
npm install --save @cherry-tomato/react
```

# Documentation
- [API](#api)
  - [observer](#observer)
  - [observe](#observe)


## API
### observer

绑定方法1: 作为 `Component` 类的装饰其，会自监听`Props`中传入的 `Model` 并响应更新
```js
  import { Model } from '@cherry-tomato/core';
  import { observer } from '@cherry-tomato/react';

  class Item extend Model {
    ...
  }

  @observer()
  class CustomComponent extends React.Component {
    render () {
      const item = this.props.item;
      return (
        <div>{item.title}</div>
      )
    }
  }

  (
    <CustomComponent item={new Item()} />
  )
```

### observe

绑定方法2: 作为 `Component` 属性的装饰其，会自监听`item`并响应更新
```js
  import { Model } from '@cherry-tomato/core';
  import { observer } from '@cherry-tomato/react';

  class Item extend Model {
    ...
  }

  class CustomComponent extends React.Component {
    @observe
    item = new Item();

    render () {
      const item = this.item;
      return (
        <div>{item.title}</div>
      )
    }
  }
```


