import {
  Model,
  connect,
  attribute
} from '../../src/index';


class ConnectedModel extends Model {
  @attribute()
  accessor count = 0;
}

class InitialModel extends Model {
  @connect()
  connected = new ConnectedModel();

  @connect()
  accessor accessorConnected = new ConnectedModel();
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
