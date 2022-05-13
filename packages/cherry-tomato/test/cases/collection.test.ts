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
    class WillUpdateChildrenTestCollection extends Collection {
      static Model = InitialAttributesModel;

      collectionWillUpdateChildren (prevChildren: any[], nextChildren: any[]) {
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
    class DidUpdateChildrenTestCollection extends Collection {
      static Model = InitialAttributesModel;

      collectionDidUpdateChildren (prevChildren: any[], nextChildren: any[]) {
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
    class ChildDidUpdateTestCollection extends Collection {
      static Model = InitialAttributesModel;

      collectionChildDidUpdate (event: any) {
        const { type, data, target } = event;
        try {
          expect(type).toBe('modelDidUpdate');
          expect(data.length).toBe(2);
          expect(data[0].get('text')).toBe('abc');
          expect(data[1].get('text')).toBe('def');
          expect(target.get('text')).toBe('def');
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
