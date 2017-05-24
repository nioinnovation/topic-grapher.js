import { expect } from 'chai';

import graph from '../src';
import { tracePath } from './fixtures.json'

describe('path tracing', () => {
  it('should be able to trace from A -> B', () => {
    const result = graph(tracePath.services, tracePath.blocks);
    const traceResult = result.trace('A', 'B');
    assertSet(traceResult.services, new Set(['A', 'B']));
  });

  it('should be able to trace A -> C', () => {
    const result = graph(tracePath.services, tracePath.blocks);
    const traceResult = result.trace('A', 'C');
    assertSet(traceResult.services, new Set(['A', 'B', 'C']));
  });

  it('should be able to trace A -> D', () => {
    const result = graph(tracePath.services, tracePath.blocks);
    const traceResult = result.trace('A', 'D');
    assertSet(traceResult.services, new Set(['A', 'B', 'C', 'D']));
  });

  it('should be able to trace E -> F', () => {
    const result = graph(tracePath.services, tracePath.blocks);
    const traceResult = result.trace('E', 'F');
    assertSet(traceResult.services, new Set(['E', 'F']));
  });

  it('should be able to trace F -> E', () => {
    const result = graph(tracePath.services, tracePath.blocks);
    const traceResult = result.trace('F', 'E');
    assertSet(traceResult.services, new Set(['E', 'F']));
  });
});

function assertSet(actual, expected) {
  expected.forEach(val => (
    expect(actual.has(val)).to.equal(true, `Expected '${val}' in actual`)
  ));
  actual.forEach(val => (
    expect(expected.has(val)).to.equal(true, `Unexpected '${val}' in actual`)
  ));
}
