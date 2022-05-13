import {
  Model,
  serialize,
  output
} from '../../src/index';

class InitialAttributesModel extends Model {
  static initialAttributes = () => ({
    count: 1,
    text: 'a'
  })

  @serialize()
  get count () { return 0;}
  set count (arg) {}

  @serialize()
  text!: string;

  @serialize()
  text2 = 'b2';


  @serialize({
    name: 'testDefault'
  })
  get testDefault () { return 'default value'; };

  @serialize({
    name: 'count'
  })
  get differentKey () { return 0; };

  @output({})
  getFormated () {
    return [
      'testDefault',
      'count'
    ]
  }

  @output({})
  getDifferentFormated () {
    return [
      'testDefault',
      'differentKey'
    ]
  }
}

class TestModel extends Model {
  static initialAttributes = () => ({
    count2: 2
  })

  @serialize('count2')
  get count () { return 0;}

  @output({})
  getFormated () {
    return [
      'count'
    ]
  }
}

describe('serialized', function () {
  var model = new InitialAttributesModel();

  test('should get serialized attribute success', () => {
    expect(model.count).toBe(1);
    expect(model.text).toBe('a');
  })

  test('should get default serialized attribute success', () => {
    expect(model.testDefault).toBe('default value');
  })

  test('should get serialize output success', () => {
    expect(model.getFormated()).toEqual({ count: 1, testDefault: 'default value' });
  })

  test('should get serialize output with different key success', () => {
    expect(
      model.getDifferentFormated()
    ).toEqual(
      { count: 1, testDefault: 'default value' }
    );
  })

  test('should update count by setter success', () => {
    model.count = 2;
    expect(
      model.count
    ).toBe(
      2
    )
    expect(
      model.differentKey
    ).toBe(
      2
    )
  })

  test('should update count by init success', () => {
    model.text = 'abc';
    expect(
      model.text
    ).toBe(
      'abc'
    );
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

  test('should serialize don\'t interact with different model', () => {
    var testModel = new TestModel();
    expect(testModel.getFormated()).toEqual({ count2: 2 });
  })
})

