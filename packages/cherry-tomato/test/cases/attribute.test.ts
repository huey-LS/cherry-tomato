import {
  Model,
  attribute
} from '../../src/index';

class InitialAttributesModel extends Model {
  @attribute()
  count = 1;

  @attribute()
  text: string = 'a';

  @attribute()
  accessor text2: string = '';

  @attribute()
  get differentKey () { return 0; };
}

describe('attribute', function () {
  var model = new InitialAttributesModel();
  var model2 = new InitialAttributesModel({ count: 20, text: 'ba' });

  test('should get default attribute success', () => {
    expect(model.count).toBe(1);
    expect(model.text).toBe('a');
    expect(model.differentKey).toBe(0);

    expect(model2.count).toBe(20);
    expect(model2.text).toBe('ba');
  })


  test('should update count by setter success', () => {
    model.count = 2;
    expect(model.count).toBe(2);

    model.text = 'abc';
    expect(model.text).toBe('abc');
  })

  test('should attribute update when Instantiate', () => {
    var model2 = new InitialAttributesModel({
      count: 10,
      text: 'c',
      text2: 'c2'
    });
    expect(model2.count).toBe(10);
    expect(model2.text).toBe('c');
    // assert.strictEqual('c2', model2.text2);
    model2.set('text', 'd');
    model2.set('text2', 'd2');
    expect(model2.text).toBe('d');
    expect(model2.text2).toBe('d2');
    expect(model2.get('text')).toBe('d');
    expect(model2.get('text2')).toBe('d2');
    model2.text = 'e';
    model2.text2 = 'e2';
    expect(model2.text).toBe('e');
    expect(model2.text2).toBe('e2');
    expect(model2.get('text')).toBe('e');
    expect(model2.get('text2')).toBe('e2');
  })
})

