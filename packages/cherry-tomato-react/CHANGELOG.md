# @cherry-tomato/react

## 3.1.2

### Patch Changes

- f291d21: react 的自动监听节流会立即触发一次，以改善用户输入时的体验

## 3.1.1

### Patch Changes

- d4a2434: field 类型装饰设置 configurable:true
- Updated dependencies [d4a2434]
  - @cherry-tomato/core@3.1.1

## 3.1.0

### Minor Changes

- 9690200: connect 同步和 useCherryTomato 的监听增加 20ms 的节流控制，减少 react 多次重复 render 导致的性能问题

### Patch Changes

- Updated dependencies [9690200]
  - @cherry-tomato/core@3.1.0

## 3.0.0

### Major Changes

- 8c8db4a: 更新到 typescript5,使用最新的装饰器https://github.com/tc39/proposal-decorators

### Patch Changes

- 020c7a1: 简化事件范型写法；use-cherry-tomato 第一个参数支持 null，不必创建空的 model；model 上自动响应的生命周期函数，参数和 event 保持一致；补充一些测试用例
- 40c0bf1: @cherry-tomato/react 的 jsx 编译结果为 react
- b496bbf: 修复 babel 编译后，field 的装饰器没有 addInitializer 的问题
- Updated dependencies [05c2e3e]
- Updated dependencies [020c7a1]
- Updated dependencies [979e54f]
- Updated dependencies [0f803a1]
- Updated dependencies [b496bbf]
- Updated dependencies [8c8db4a]
  - @cherry-tomato/core@3.0.0

## 3.0.0-beta.3

### Patch Changes

- b496bbf: 修复 babel 编译后，field 的装饰器没有 addInitializer 的问题
- Updated dependencies [b496bbf]
  - @cherry-tomato/core@3.0.0-beta.3

## 3.0.0-beta.2

### Patch Changes

- 40c0bf1: @cherry-tomato/react 的 jsx 编译结果为 react

## 3.0.0-beta.1

### Patch Changes

- 020c7a1: 简化事件范型写法；use-cherry-tomato 第一个参数支持 null，不必创建空的 model；model 上自动响应的生命周期函数，参数和 event 保持一致；补充一些测试用例
- Updated dependencies [020c7a1]
  - @cherry-tomato/core@3.0.0-beta.1

## 3.0.0-beta.0

### Major Changes

- 8c8db4a: 更新到 typescript5,使用最新的装饰器https://github.com/tc39/proposal-decorators

### Patch Changes

- Updated dependencies [8c8db4a]
  - @cherry-tomato/core@3.0.0-beta.0

## 2.1.1

### Patch Changes

- c41cd27: ts 构建使用 react 作为 jsx 配置，target 改为 es5 以提供更多兼容
- Updated dependencies [c41cd27]
  - @cherry-tomato/core@2.1.1

## 2.1.0

### Minor Changes

- 1. 版本管理工具、依赖管理工具、测试工具调整，调整为 pnpm+changeset+jest
  2. 移除@cherry-tomato/core 中对 core-js 的依赖

### Patch Changes

- Updated dependencies
  - @cherry-tomato/core@2.1.0
