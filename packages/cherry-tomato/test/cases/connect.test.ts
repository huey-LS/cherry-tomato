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
