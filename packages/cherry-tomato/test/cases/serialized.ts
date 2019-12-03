import assert from 'assert';

import {
  Model,
  serialize,
  output
} from '../../src/index';

class InitialAttributesModel extends Model {
  static initialAttributes = () => ({
    count: 1
  })

  @serialize('count')
  get count () { return 0;}
  set count (arg) {}


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

  @serialize({
    name: 'count2'
  })
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

  it ('should serialize don\'t interact with different model', () => {
    var testModel = new TestModel();
    assert.deepStrictEqual(
      { count2: 2 },
      testModel.getFormated()
    );
  })
})

