import { expect } from 'chai';

import graph from '../src';
import { simple, circular, env } from './fixtures.json'

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
      const pubs = result.subscribersOf('nio.data');
      expect(pubs).to.have.length(1);
      expect(pubs).to.deep.equal([
        ['SubService', 'nio.data']
      ]);
    });
  });

  describe('with a circular pub/sub', () => {
    const result = graph(circular.services, circular.blocks);

    it('should have one nodes', () => {
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
});
