// @flow
import type {
  PartitionResult,
  Blocks,
  BlockShape,
} from './types.js.flow';

export default (blocks: Blocks): PartitionResult => (
  Object.keys(blocks).reduce((state: PartitionResult, key: string) => {
    const { type, topic }: BlockShape = blocks[key];
    const [pubMap, subMap, pubList, subList] = state;
    switch (type) {
      case 'LocalPublisher': return [
        { ...pubMap, [key]: topic },
        subMap,
        [...pubList, key],
        subList,
      ];
      case 'LocalSubscriber': return [
        pubMap,
        { ...subMap, [key]: topic },
        pubList,
        [...subList, key],
      ];
      default: return state;
    }
  }, [{}, {}, [], []])
);
