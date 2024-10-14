import {
  Model,
  connect,
  attribute
} from '../../src/index';


class ConnectedModel extends Model {
  @attribute()
  accessor count = 0;
}

class LazyModel1 extends Model {
  type = 1;

  @attribute()
  accessor count = 1;
}

class LazyModel2 extends Model {
  type = 2

  @attribute()
  accessor count = 2;
}


class InitialModel extends Model {
  lazyType = 1;

  @connect()
  connected = new ConnectedModel();

  @connect()
  accessor accessorConnected = new ConnectedModel();

  @connect({
    lazy: {
      generate(parent) {
        if (parent.lazyType === 1) {
          return new LazyModel1()
        }
        return new LazyModel2()
      },
    }
  })
  accessor lazyConnected!: LazyModel1 | LazyModel2;
}


describe('connect model', function () {
  var model = new InitialModel({
    connected: {
      count: 1
    }
  });

  test('should get connectedModel success', () => {
    expect(model.connected instanceof ConnectedModel).toBe(true);
  })

  test('should init connectedModel data success', () => {
    expect(model.connected.count).toBe(1);
    expect(model.get('connected')).toEqual({ count: 1 });
  })

  test('should auto update after connectedModel update success', () => {
    model.connected.count = 2;
    expect(model.connected.count).toBe(2);
    expect(model.get('connected')).toEqual({ count: 2 });
  })

  test('should auto update connectedModel after model update success', () => {
    model.set('connected', { count: 3 });
    expect(model.connected.count).toBe(3);
    expect(model.get('connected')).toEqual({ count: 3 });
  })
})

describe('accessor connect model', function () {
  var model = new InitialModel({
    accessorConnected: {
      count: 1
    }
  });

  test('should get accessor connectedModel success', () => {
    expect(model.accessorConnected instanceof ConnectedModel).toBe(true);
  })

  test('should init accessor connectedModel data success', () => {
    expect(model.accessorConnected.count).toBe(1);
    expect(model.get('accessorConnected')).toEqual({ count: 1 });
  })

  test('should auto update after accessor connectedModel update success', () => {
    model.accessorConnected.count = 2;
    expect(model.accessorConnected.count).toBe(2);
    expect(model.get('accessorConnected')).toEqual({ count: 2 });
  })

  test('should auto update accessor connectedModel after model update success', () => {
    model.set('accessorConnected', { count: 3 });
    expect(model.accessorConnected.count).toBe(3);
    expect(model.get('accessorConnected')).toEqual({ count: 3 });
  })

  test('should clone connect deep success', () => {
    const clonedModel = model.clone();
    expect(model.accessorConnected.count).toBe(3);
    expect(clonedModel.accessorConnected.count).toBe(3);
    expect(clonedModel.accessorConnected).not.toBe(model.accessorConnected);
    clonedModel.accessorConnected.count = 4;
    expect(clonedModel.accessorConnected.count).toBe(4);
    expect(model.accessorConnected.count).toBe(3);
    model.accessorConnected.count = 5;
    expect(clonedModel.accessorConnected.count).toBe(4);
    expect(model.accessorConnected.count).toBe(5);
  })
})

describe('accessor lazy model', function () {
  var model1 = new InitialModel({});
  model1.lazyType = 1;
  var model2 = new InitialModel({});
  model2.lazyType = 2;

  test('should lazy init auto switch by type', () => {
    expect(model1.lazyType).toBe(1);
    expect(
      model1.lazyConnected
    ).toBeInstanceOf(LazyModel1);
    expect(
      model1.lazyConnected
    ).toBe(model1.lazyConnected);
    expect(
      model1.lazyConnected.count
    ).toBe(1);
    model1.lazyConnected.count += 2;
    expect(
      model1.lazyConnected.count
    ).toBe(3);

    expect(model2.lazyType).toBe(2);
    expect(
      model2.lazyConnected
    ).toBeInstanceOf(LazyModel2);
    expect(
      model2.lazyConnected.count
    ).toBe(2);

    /**
     * 修改type暂时不会重新初始化
     */
    model1.lazyType = 2
    expect(
      model1.lazyConnected
    ).toBeInstanceOf(LazyModel1);
  })
})
