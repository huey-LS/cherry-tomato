# @cherry-tomato/core

## 3.1.0

### Minor Changes

- 9690200: connect 同步和 useCherryTomato 的监听增加 20ms 的节流控制，减少 react 多次重复 render 导致的性能问题

## 3.0.4

### Patch Changes

- 5d370e4: 修复使用 accessor 时未正确设置初始化值的问题

## 3.0.3

### Patch Changes

- c6dce27: 添加 generateCollection 函数，快速的创建临时的无额外功能的 Collection

## 3.0.2

### Patch Changes

- 1b461c9: connect 装饰的属性将会自动 clone

## 3.0.1

### Patch Changes

- 0f27677: 更新 README 文档。完善 Collection 的 reduce 和 reduceRight 的 ts。attribute 装饰器 accessor 时不在调用老的 setter

## 3.0.0

### Major Changes

- 8c8db4a: 更新到 typescript5,使用最新的装饰器https://github.com/tc39/proposal-decorators

### Patch Changes

- 05c2e3e: collection 的 filter、slice 提供更准确的 ts 声明；removeChild 和 resetChildren 支持 model 对象
- 020c7a1: 简化事件范型写法；use-cherry-tomato 第一个参数支持 null，不必创建空的 model；model 上自动响应的生命周期函数，参数和 event 保持一致；补充一些测试用例
- 979e54f: 修复 connect 装饰器初始化数据错误及增加 model.reset
- 0f803a1: 修复 clone 后 attribute 装饰器错误
- b496bbf: 修复 babel 编译后，field 的装饰器没有 addInitializer 的问题

## 3.0.0-beta.5

### Patch Changes

- 979e54f: 修复 connect 装饰器初始化数据错误及增加 model.reset

## 3.0.0-beta.4

### Patch Changes

- 0f803a1: 修复 clone 后 attribute 装饰器错误

## 3.0.0-beta.3

### Patch Changes

- b496bbf: 修复 babel 编译后，field 的装饰器没有 addInitializer 的问题

## 3.0.0-beta.2

### Patch Changes

- 05c2e3e: collection 的 filter、slice 提供更准确的 ts 声明；removeChild 和 resetChildren 支持 model 对象

## 3.0.0-beta.1

### Patch Changes

- 020c7a1: 简化事件范型写法；use-cherry-tomato 第一个参数支持 null，不必创建空的 model；model 上自动响应的生命周期函数，参数和 event 保持一致；补充一些测试用例

## 3.0.0-beta.0

### Major Changes

- 8c8db4a: 更新到 typescript5,使用最新的装饰器https://github.com/tc39/proposal-decorators

## 2.1.1

### Patch Changes

- c41cd27: ts 构建使用 react 作为 jsx 配置，target 改为 es5 以提供更多兼容

## 2.1.0

### Minor Changes

- 1. 版本管理工具、依赖管理工具、测试工具调整，调整为 pnpm+changeset+jest
  2. 移除@cherry-tomato/core 中对 core-js 的依赖
