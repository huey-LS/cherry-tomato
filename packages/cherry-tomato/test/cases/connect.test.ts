import {
  Model,
  connect,
  attribute
} from '../../src/index';


class ConnectedModel extends Model {
  @attribute()
  count = 1;
}

class InitialModel extends Model {
  @connect()
  connected = new ConnectedModel();
}


describe('connect model', function () {
  var model = new InitialModel();

  test('should get connectedModel success', () => {
    expect(
      model.connected instanceof ConnectedModel
    ).toBe(
      true
    )
  })

  test('should auto update after connectedModel update success', () => {
    expect(model.connected.count).toBe(1);
    expect(model.get('connected')).toEqual({ count: 1 });
    model.connected.count = 2;
    expect(model.connected.count).toBe(2);
    expect(model.get('connected')).toEqual({ count: 2 });
  })

  test('should auto update connectedModel after model update success', () => {
    expect(model.connected.count).toBe(2);
    // expect(model.get('connected')).toEqual({ count: 2 });
    model.set('connected', { count: 3 });
    expect(model.connected.count).toBe(3);
    expect(model.get('connected')).toEqual({ count: 3 });
  })
})
