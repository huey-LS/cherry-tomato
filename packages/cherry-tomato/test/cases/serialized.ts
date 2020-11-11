import assert from 'assert';

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

  it ('should get serialized attribute success', () => {
    assert.strictEqual(1, model.count);
    assert.strictEqual('a', model.text);
  })

  it ('should get default serialized attribute success', () => {
    assert.strictEqual('default value', model.testDefault);
  })

  it ('should get serialize output success', () => {
    assert.deepStrictEqual(
      { count: 1, testDefault: 'default value' },
      model.getFormated()
    );
  })

  it ('should get serialize output with different key success', () => {
    assert.deepStrictEqual(
      { count: 1, testDefault: 'default value' },
      model.getDifferentFormated()
    );
  })

  it ('should update count by setter success', () => {
    model.count = 2;
    assert.strictEqual(
      2,
      model.count
    );
    assert.strictEqual(
      2,
      model.differentKey
    );
  })

  it ('should update count by init success', () => {
    model.text = 'abc';
    assert.strictEqual(
      'abc',
      model.text
    );
  })

  it ('should attribute update when Instantiate', () => {
    var model2 = new InitialAttributesModel({
      count: 10,
      text: 'c',
      text2: 'c2'
    });
    assert.strictEqual(10, model2.count);
    assert.strictEqual('c', model2.text);
    // assert.strictEqual('c2', model2.text2);
    model2.set('text', 'd');
    model2.set('text2', 'd2');
    assert.strictEqual('d', model2.text);
    assert.strictEqual('d2', model2.text2);
    assert.strictEqual('d', model2.get('text'));
    assert.strictEqual('d2', model2.get('text2'));
    model2.text = 'e';
    model2.text2 = 'e2';
    assert.strictEqual('e', model2.text);
    assert.strictEqual('e2', model2.text2);
    assert.strictEqual('e', model2.get('text'));
    assert.strictEqual('e2', model2.get('text2'));
  })

  it ('should serialize don\'t interact with different model', () => {
    var testModel = new TestModel();
    assert.deepStrictEqual(
      { count2: 2 },
      testModel.getFormated()
    );
  })
})

