import partitionBlocks from '../src/partition-blocks';

import { simple } from './fixtures.json'
import { expect } from 'chai';

describe('partition blocks', () => {
  it('should build a Map<Name, Topic> of publishers ', () => {
    const [publishers] = partitionBlocks(simple.blocks);
    expect(publishers['PubData']).to.exist;
    expect(publishers['PubData']).to.equal('nio.data');
  });

  it('should build a Map<Name, Topic> of subscribers', () => {
    const [,subscribers] = partitionBlocks(simple.blocks);
    expect(subscribers['SubData']).to.exist;
    expect(subscribers['SubData']).to.equal('nio.data');
  });

  it('should build a List<Name> of publishers', () => {
    const [,,pubList] = partitionBlocks(simple.blocks);
    expect(pubList).to.have.length(2);
    expect(pubList[0]).to.equal('PubData');
    expect(pubList[1]).to.equal('LocalPubData');
  });

  it('should build a List<Name> of subscribers', () => {
    const [,,,subList] = partitionBlocks(simple.blocks);
    expect(subList).to.have.length(2);
    expect(subList[0]).to.equal('SubData');
    expect(subList[1]).to.equal('LocalSubData');
  });
});
