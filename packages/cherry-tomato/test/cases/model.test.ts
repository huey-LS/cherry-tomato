import {
  Attributes,
  Model
} from '../../src/index';

class InitialAttributesModel extends Model {
  static initialAttributes = () => ({
    count: 1
  })
}

class InitialAttributesByFunctionModel extends Model {
  static initialAttributes = () => ({count: 1});
}


class AutoKeyModel extends Model {
  static key = 'id';
}

describe('Model', function () {
  var model = new InitialAttributesModel();
  test('should isInstance success', () => {
    expect(
      InitialAttributesModel.isInstance(model)
    ).toBe(true);
  })

  test('should get initialAttributes success', () => {
    expect(model.get('count')).toBe(1);
  })

  test('should get initialAttributes by function success', () => {
    let fnModel = new InitialAttributesByFunctionModel();
    expect(fnModel.get('count')).toBe(1);
  })


  test('should set attribute success', () => {
    model.set('count', 2);
    expect(model.get('count')).toBe(2);
  })

  test('should set attribute obj success', () => {
    model.set({ count: 3 });
    expect(model.get('count')).toBe(3);
  })

  test('should remove attribute success', () => {
    model.remove('count');
    expect(model.get('count')).toBeUndefined();
  })

  test('should set attribute with obj path success', () => {
    model.set('a.b', 1);
    expect(model.get('a.b')).toBe(1);
    expect(model.get('a').b).toBe(1);
  })

  test('should set one array attribute success', () => {
    model.set('testArray[0]', 0);
    model.set('testArray.1', 1);
    expect(Array.isArray(model.get('testArray'))).toBe(true);
    expect(model.get('testArray[0]')).toBe(0);
    expect(model.get('testArray.1')).toBe(1);
    expect(JSON.stringify(model.get('testArray'))).toBe('[0,1]');
  })

  test('should auto get key from attribute success', () => {
    const testKeyModel = new AutoKeyModel();
    testKeyModel.set('id', 1);
    expect(testKeyModel.get('id')).toBe(1);
    expect(testKeyModel.key).toBe(1);
  })


  test('should life-cycle call success', (done) => {
    class LifeCycleModel extends Model<{}, { count: number }> {
      static initialAttributes = () => ({
        count: 1
      })

      modelWillUpdate ([prevAttribute, nextAttribute]: Attributes[]) {
        try {
          expect(prevAttribute).toBe(this._attributes);
          expect(prevAttribute.get('count')).toBe(1);
          expect(nextAttribute.get('count')).toBe(2);
        } catch (e) {
          done(e);
        }
      }

      modelDidUpdate ([prevAttribute, nextAttribute]: Attributes[]) {
        try {
          expect(nextAttribute).toBe(this._attributes);
          expect(prevAttribute.get('count')).toBe(1);
          expect(nextAttribute.get('count')).toBe(2);
          done();
        } catch (e) {
          done(e);
        }
      }
    }

    const lifeCycleModel = new LifeCycleModel();
    lifeCycleModel.set('count', 2);
  })

  test('should event: modelWillUpdate listener success', (done) => {
    const testModel = new InitialAttributesModel();
    testModel.addListener('modelWillUpdate', (event) => {
      try {
        const [ prevAttribute, nextAttribute ] = event.data;
        expect(event.type).toBe('modelWillUpdate');
        expect(event.target).toBe(testModel);
        expect(testModel).toBe(event.target);
        expect(prevAttribute).toBe(testModel._attributes);
        expect(prevAttribute.get('count')).toBe(1);
        expect(nextAttribute.get('count')).toBe(2);
        done();
      } catch (e) {
        done(e)
      }
    })
    testModel.set('count', 2);
  })

  test('should event: modelDidUpdate listener success', (done) => {
    const testModel = new InitialAttributesModel();
    testModel.addListener('modelDidUpdate', (event) => {
      try {
        const [ prevAttribute, nextAttribute ] = event.data;
        expect(event.type).toBe('modelDidUpdate');
        expect(testModel).toBe(event.target);
        expect(nextAttribute).toBe(testModel._attributes);
        expect(prevAttribute.get('count')).toBe(1);
        expect(nextAttribute.get('count')).toBe(2);
        done();
      } catch (e) {
        done(e)
      }
    })
    testModel.set('count', 2);
  })
})
