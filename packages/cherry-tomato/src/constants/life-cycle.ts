export const MODEL_WILL_UPDATE = 'modelWillUpdate';

export const MODEL_DID_UPDATE = 'modelDidUpdate';

export const COLLECTION_WILL_UPDATE_CHILDREN = 'collectionWillUpdateChildren';
export const COLLECTION_DID_UPDATE_CHILDREN = 'collectionDidUpdateChildren';
export const COLLECTION_CHILD_DID_UPDATE = 'collectionChildDidUpdate';

export const WILL_DESTROY = 'willDestroy';

export const DID_DESTROY = 'didDestroy';

export const CONNECT_MODEL_DID_UPDATE = 'connectModelDidUpdate';


export const MODEL_UPDATE_LIFE_CYCLES = [
  MODEL_DID_UPDATE,
  CONNECT_MODEL_DID_UPDATE
];
export const COLLECTION_UPDATE_LIFE_CYCLES = [
  ...MODEL_UPDATE_LIFE_CYCLES,
  COLLECTION_DID_UPDATE_CHILDREN,
  COLLECTION_CHILD_DID_UPDATE
];