import {
  Model,
  Collection,
  attribute
} from '../../src/index';


class InitialAttributesModel extends Model {
  @attribute()
  count = 1;
}

class TestCollection extends Collection<InitialAttributesModel> {
  static Model = InitialAttributesModel;

  @attribute()
  count = 1;
}

describe('Collection', function () {
  test('should addChild success', () => {
    let testCollection = new TestCollection();
    expect(testCollection.length).toBe(0);
    testCollection.addChild({ text: 'abc' });
    expect(testCollection.length).toBe(1);
    let testModel = testCollection.children[0];
    expect(testModel).toBeInstanceOf(InitialAttributesModel);
    expect(testModel.get('count')).toBe(1);
    expect(testModel.get('text')).toBe('abc');
  })

  test('should removeChild success', () => {
    let testCollection = new TestCollection();
    expect(testCollection.length).toBe(0);
    testCollection.addChild({ text: 'abc' });
    expect(testCollection.length).toBe(1);
    let testModel = testCollection.children[0];
    testCollection.removeChild(testModel.key);
    expect(testCollection.length).toBe(0);
  })

  test('should clone success', () => {
    let testCollection1 = new TestCollection();
    testCollection1.set('text', 1);
    testCollection1.addChild({ text: 'abc1' });
    let testCollection2 = testCollection1.clone();
    expect(testCollection1.get('text')).toBe(1);
    expect(testCollection1.count).toBe(1);
    expect(testCollection1.length).toBe(1);
    expect(testCollection1.children[0].get('text')).toBe('abc1');
    expect(testCollection2.get('text')).toBe(1);
    expect(testCollection2.length).toBe(1);
    expect(testCollection2.count).toBe(1);
    expect(testCollection2.children[0].get('text')).toBe('abc1');
    expect(testCollection2.children[0]).toBe(testCollection1.children[0]);
    testCollection1.set('text', 2);
    testCollection1.count = 2;
    testCollection1.addChild({ text: 'abc2' });
    expect(testCollection1.get('text')).toBe(2);
    expect(testCollection1.count).toBe(2);
    expect(testCollection1.length).toBe(2);
    expect(testCollection1.children[1].get('text')).toBe('abc2');
    expect(testCollection2.get('text')).toBe(1);
    expect(testCollection2.count).toBe(1);
    expect(testCollection2.length).toBe(1);
    expect(testCollection2.children[0]).toBe(testCollection1.children[0]);
  })

  test('should slice success', () => {
    let testCollection1 = new TestCollection();
    testCollection1.addChild({ text: 'abc1' });
    testCollection1.addChild({ text: 'abc2' });
    let testCollection2 = testCollection1.slice(0, 1);
    let testCollection3 = testCollection1.slice(1, 2);
    expect(testCollection1.length).toBe(2);
    expect(testCollection2.length).toBe(1);
    expect(testCollection3.length).toBe(1);
    expect(testCollection1.children[0].get('text')).toBe('abc1');
    expect(testCollection2.children[0].get('text')).toBe('abc1');
    expect(testCollection3.children[0].get('text')).toBe('abc2');
    expect(testCollection2.children[0]).toBe(testCollection1.children[0]);
    expect(testCollection3.children[0]).toBe(testCollection1.children[1]);
  })

  test('should filter success', () => {
    let testCollection1 = new TestCollection();
    testCollection1.addChild({ text: 'abc1' });
    testCollection1.addChild({ text: 'abc2' });
    let testCollection2 = testCollection1.filter((model) => {
      return model.get('text') === 'abc1';
    });
    expect(testCollection1.length).toBe(2);
    expect(testCollection2.length).toBe(1);
    expect(testCollection1.children[0].get('text')).toBe('abc1');
    expect(testCollection2.children[0].get('text')).toBe('abc1');
    expect(testCollection2.children[0]).toBe(testCollection1.children[0]);
  })

  test('should merge success', () => {
    let testCollection1 = new TestCollection();
    let testCollection2 = new TestCollection();
    testCollection1.addChild({ text: 'abc1' });
    testCollection2.addChild({ text: 'abc2' });
    testCollection1.merge(testCollection2);
    expect(testCollection1.length).toBe(2);
    expect(testCollection2.length).toBe(1);
    let testModel1 = testCollection1.children[0];
    expect(testModel1.get('text')).toBe('abc1');
    let testModel2 = testCollection1.children[1];
    expect(testModel2.get('text')).toBe('abc2');
    let testModel2From2 = testCollection2.children[0];
    expect(testModel2From2).toBe(testModel2);
  })

  test('should concat success', () => {
    let testCollection1 = new TestCollection();
    let testCollection2 = new TestCollection();
    testCollection1.addChild({ text: 'abc1' });
    testCollection2.addChild({ text: 'abc2' });
    let testCollection3 = testCollection1.concat(testCollection2);
    expect(testCollection1.length).toBe(1);
    expect(testCollection2.length).toBe(1);
    expect(testCollection3.length).toBe(2);
    let testModel1 = testCollection3.children[0];
    expect(testModel1.get('text')).toBe('abc1');
    let testModel2 = testCollection3.children[1];
    expect(testModel2.get('text')).toBe('abc2');
    let testModel1From1 = testCollection1.children[0];
    expect(testModel1From1).toBe(testModel1);
    let testModel2From2 = testCollection2.children[0];
    expect(testModel2From2).toBe(testModel2);
  })

  test('should life-cycle collectionWillUpdateChildren call success', (done) => {
    class WillUpdateChildrenTestCollection extends Collection<InitialAttributesModel> {
      static Model = InitialAttributesModel;

      collectionWillUpdateChildren ([prevChildren, nextChildren]: InitialAttributesModel[][]) {
        try {
          expect(prevChildren.length).toBe(0);
          expect(nextChildren.length).toBe(1);
          expect(this.children).toBe(prevChildren);
          expect(nextChildren[0].get('text')).toBe('abc');
          done();
        } catch (e) {
          done(e);
        }
      }
    }

    const willUpdateChildrenTestCollection = new WillUpdateChildrenTestCollection();
    willUpdateChildrenTestCollection.addChild({ text: 'abc' });
  })
  test('should life-cycle collectionDidUpdateChildren call success', (done) => {
    class DidUpdateChildrenTestCollection extends Collection<InitialAttributesModel> {
      static Model = InitialAttributesModel;

      collectionDidUpdateChildren ([prevChildren, nextChildren]: InitialAttributesModel[][]) {
        try {
          expect(prevChildren.length).toBe(0);
          expect(nextChildren.length).toBe(1);
          expect(this.children).toBe(nextChildren);
          expect(this.children[0].get('text')).toBe('abc');
          done();
        } catch (e) {
          done(e);
        }
      }
    }

    const didUpdateChildrenTestCollection = new DidUpdateChildrenTestCollection();
    didUpdateChildrenTestCollection.addChild({ text: 'abc' });
  })
  test('should life-cycle collectionChildDidUpdate call success', (done) => {
    class ChildDidUpdateTestCollection extends Collection<InitialAttributesModel> {
      static Model = InitialAttributesModel;

      collectionChildDidUpdate (data: { child: InitialAttributesModel }) {
        try {
          const childModel = data.child;
          expect(childModel).toBeInstanceOf(InitialAttributesModel);
          expect(childModel.get('text')).toBe('def');
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
