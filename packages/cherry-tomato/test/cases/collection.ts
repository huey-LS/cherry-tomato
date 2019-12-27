
import assert from 'assert';

import {
  Model,
  Collection
} from '../../src/index';


class InitialAttributesModel extends Model {
  static initialAttributes = () => ({
    count: 1
  })
}

class TestCollection extends Collection {
  static Model = InitialAttributesModel;
}

describe('Collection', function () {
  it ('should addChild success', () => {
    let testCollection = new TestCollection();
    assert.strictEqual(0, testCollection.length);
    testCollection.addChild({ text: 'abc' });
    assert.strictEqual(1, testCollection.length);
    assert.strictEqual(true, testCollection.children[0] instanceof InitialAttributesModel);
    let testModel = testCollection.children[0];
    assert.strictEqual(1, testModel.get('count'));
    assert.strictEqual('abc', testModel.get('text'));
  })

  it ('should removeChild success', () => {
    let testCollection = new TestCollection();
    assert.strictEqual(0, testCollection.length);
    testCollection.addChild({ text: 'abc' });
    assert.strictEqual(1, testCollection.length);
    let testModel = testCollection.children[0];
    testCollection.removeChild(testModel.key);
    assert.strictEqual(0, testCollection.length);
  })

  it ('should merge success', () => {
    let testCollection1 = new TestCollection();
    let testCollection2 = new TestCollection();
    testCollection1.addChild({ text: 'abc1' });
    testCollection2.addChild({ text: 'abc2' });
    testCollection1.merge(testCollection2);
    assert.strictEqual(2, testCollection1.length);
    assert.strictEqual(1, testCollection2.length);
    let testModel1 = testCollection1.children[0];
    assert.strictEqual('abc1', testModel1.get('text'))
    let testModel2 = testCollection1.children[1];
    assert.strictEqual('abc2', testModel2.get('text'))
    let testModel2From2 = testCollection2.children[0];
    assert.strictEqual(testModel2From2, testModel2);
  })

  it ('should concat success', () => {
    let testCollection1 = new TestCollection();
    let testCollection2 = new TestCollection();
    testCollection1.addChild({ text: 'abc1' });
    testCollection2.addChild({ text: 'abc2' });
    let testCollection3 = testCollection1.concat(testCollection2);
    assert.strictEqual(1, testCollection1.length);
    assert.strictEqual(1, testCollection2.length);
    assert.strictEqual(2, testCollection3.length);
    let testModel1 = testCollection3.children[0];
    assert.strictEqual('abc1', testModel1.get('text'))
    let testModel2 = testCollection3.children[1];
    assert.strictEqual('abc2', testModel2.get('text'))
    let testModel1From1 = testCollection1.children[0];
    assert.strictEqual(testModel1From1, testModel1);
    let testModel2From2 = testCollection2.children[0];
    assert.strictEqual(testModel2From2, testModel2);
  })

  it ('should life-cycle collectionWillUpdateChildren call success', (done) => {
    class WillUpdateChildrenTestCollection extends Collection {
      static Model = InitialAttributesModel;

      collectionWillUpdateChildren (prevChildren: any[], nextChildren: any[]) {
        try {
          assert.strictEqual(prevChildren.length, 0);
          assert.strictEqual(nextChildren.length, 1);
          assert.strictEqual(this.children, prevChildren);
          assert.strictEqual(nextChildren[0].get('text'), 'abc');
          done();
        } catch (e) {
          done(e);
        }
      }
    }

    const willUpdateChildrenTestCollection = new WillUpdateChildrenTestCollection();
    willUpdateChildrenTestCollection.addChild({ text: 'abc' });
  })
  it ('should life-cycle collectionDidUpdateChildren call success', (done) => {
    class DidUpdateChildrenTestCollection extends Collection {
      static Model = InitialAttributesModel;

      collectionDidUpdateChildren (prevChildren: any[], nextChildren: any[]) {
        try {
          assert.strictEqual(prevChildren.length, 0);
          assert.strictEqual(nextChildren.length, 1);
          assert.strictEqual(this.children, nextChildren);
          assert.strictEqual(this.children[0].get('text'), 'abc');
          done();
        } catch (e) {
          done(e);
        }
      }
    }

    const didUpdateChildrenTestCollection = new DidUpdateChildrenTestCollection();
    didUpdateChildrenTestCollection.addChild({ text: 'abc' });
  })
  it ('should life-cycle collectionChildDidUpdate call success', (done) => {
    class ChildDidUpdateTestCollection extends Collection {
      static Model = InitialAttributesModel;

      collectionChildDidUpdate (event: any) {
        const { type, data, target } = event;
        try {
          assert.strictEqual(type, 'modelDidUpdate');
          assert.strictEqual(data.length, 2);
          assert.strictEqual(data[0].get('text'), 'abc');
          assert.strictEqual(data[1].get('text'), 'def');
          assert.strictEqual(target.get('text'), 'def');
          done();
        } catch (e) {
          done(e);
        }
      }
    }

    const childDidUpdateTestCollection = new ChildDidUpdateTestCollection();
    childDidUpdateTestCollection.addChild({ text: 'abc' });
    childDidUpdateTestCollection.children[0].set({ text: 'def' });
  })
})
