import { expect } from 'chai';

import graph from '../src';
import { simple, circular, env, simpleLocal } from './fixtures.json'

describe('topic graph', () => {
  describe('with a simple pub/sub', () => {
    const result = graph(simple.services, simple.blocks);

    it('should have two nodes', () => {
      expect(result.nodes).to.have.length(2);
      expect(result.nodes).to.have.members(['PubService', 'SubService']);
    });

    it('should have one edge', () => {
      expect(result.edges).to.deep.equal([
        ['PubService', 'SubService', 'nio.data']
      ]);
    });

    it('should find publishers through `nio.data`', () => {
      const pubs = result.publishersOf('nio.data');
      expect(pubs).to.have.length(1);
      expect(pubs).to.deep.equal([
        ['PubService', 'nio.data']
      ]);
    });

    it('should find subscribers through `nio.data`', () => {
      const subs = result.subscribersOf('nio.data');
      expect(subs).to.have.length(1);
      expect(subs).to.deep.equal([
        ['SubService', 'nio.data']
      ]);
    });
  });

  describe('with a circular pub/sub', () => {
    const result = graph(circular.services, circular.blocks);

    it('should have one node', () => {
      expect(result.nodes).to.have.length(1);
      expect(result.nodes).to.have.members(['CircularService']);
    });

    it('should have one edge', () => {
      expect(result.edges).to.deep.equal([
        ['CircularService', 'CircularService', 'nio.data']
      ]);
    });

    it('should find publishers through `nio.data`', () => {
      const pubs = result.publishersOf('nio.data');
      expect(pubs).to.have.length(1);
      expect(pubs).to.deep.equal([
        ['CircularService', 'nio.data']
      ]);
    });

    it('should find subscribers through `nio.data`', () => {
      const pubs = result.subscribersOf('nio.data');
      expect(pubs).to.have.length(1);
      expect(pubs).to.deep.equal([
        ['CircularService', 'nio.data']
      ]);
    });
  });

  describe('with a environmental variables pub/sub', () => {
    const result = graph(env.services, env.blocks);

    it('should have two nodes', () => {
      expect(result.nodes).to.have.length(2);
      expect(result.nodes).to.have.members(['PubService', 'SubService']);
    });

    it('should have one edge', () => {
      expect(result.edges).to.deep.equal([
        ['PubService', 'SubService', 'nio.[[FOO]]']
      ]);
    });

    it('should find publishers through `nio.[[FOO]]`', () => {
      const pubs = result.publishersOf('nio.[[FOO]]');
      expect(pubs).to.have.length(1);
      expect(pubs).to.deep.equal([
        ['PubService', 'nio.[[FOO]]']
      ]);
    });

    it('should find subscribers through `nio.[[FOO]]`', () => {
      const pubs = result.subscribersOf('nio.[[FOO]]');
      expect(pubs).to.have.length(1);
      expect(pubs).to.deep.equal([
        ['SubService', 'nio.[[FOO]]']
      ]);
    });
  });

  describe('with a pub/sub and local pub/sub', () => {
    const result = graph(simpleLocal.services, simpleLocal.blocks);

    it('should have four nodes', () => {
      expect(result.nodes).to.have.length(4);
      expect(result.nodes).to.have.members([
        'PubService', 'SubService', 'LocalPubService', 'LocalSubService'
      ]);
    });

    it('should have two edges', () => {
      expect(result.edges).to.deep.equal([
        ['PubService', 'SubService', 'nio.data'],
        ['LocalPubService', 'LocalSubService', 'nio.data']
      ]);
    });

    it('should find localPublishers through `nio.data`', () => {
      const localPubs = result.localPublishersOf('nio.data');
      expect(localPubs).to.have.length(1);
      expect(localPubs).to.deep.equal([
        ['LocalPubService', 'nio.data']
      ]);
    });

    it('should find localSubscribers through `nio.data`', () => {
      const localSubs = result.localSubscribersOf('nio.data');
      expect(localSubs).to.have.length(1);
      expect(localSubs).to.deep.equal([
        ['LocalSubService', 'nio.data']
      ]);
    });
  });
});
