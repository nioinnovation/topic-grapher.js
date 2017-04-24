// @flow
import matcher from '@nio/topic-matcher';

import partitionBlocks from './partition-blocks';
import type {
  Blocks,
  Services,
  ServiceShape,
  ExecutionStep,
  GraphResult,
  TopicServiceList,
  Mapping,
} from './types.js.flow';

const getName = (step: ExecutionStep) => step.name;
const exists = topic => !!topic;

const permute = (left: Array<string>, right: Array<string>, ...rest) => (
  left.reduce((l0, l) => (
    right.reduce((l1, r) => (
      [...l1, [l, r, ...rest]]
    ), l0)
  ), [])
);

const createAdder = (list: TopicServiceList) =>
  (service: string, topic: string) => (
    /* eslint-disable no-param-reassign */
    (list[topic] || (list[topic] = [])).push(service)
  );

export default function compile(services: Services, blocks: Blocks): GraphResult {
  const nodes = new Set();

  const [pubs, subs] = partitionBlocks(blocks);
  const topicToPubs: TopicServiceList = {};
  const topicToSubs: TopicServiceList = {};

  const addPublisher = createAdder(topicToPubs);
  const addSubscriber = createAdder(topicToSubs);

  Object.keys(services).forEach((key) => {
    const {
      name,
      execution,
      mapping,
    }: ServiceShape = services[key];

    nodes.add(name);

    const mappings: Mapping = mapping ?
      mapping.reduce((rest, { name: alias, mapping: block }) => ({
        ...rest,
        [alias]: block,
      }), {}) : {};

    const resolveName = alias => (mappings[alias] || alias);

    const resolvedBlockNames = [...new Set(
      execution.map(getName).map(resolveName),
    )];

    // Publishers
    resolvedBlockNames
      .map(b => pubs[b])
      .filter(exists)
      .forEach((topic) => {
        addPublisher(name, topic);
      });

    // Subscribers
    resolvedBlockNames
      .map(b => subs[b])
      .filter(exists)
      .forEach((topic) => {
        addSubscriber(name, topic);
      });
  });

  const pubTopics = Object.keys(topicToPubs);
  const subTopics = Object.keys(topicToSubs);

  const edges = subTopics.reduce((l0, subTopic) => (
    pubTopics.reduce((l1, pubTopic) => (
      matcher(subTopic, pubTopic) ? [
        ...l1,
        ...permute(topicToPubs[pubTopic], topicToSubs[subTopic], pubTopic),
      ] : l1), l0)
  ), []);

  return {
    nodes: [...nodes],
    edges,
    publishersOf(sub) {
      return pubTopics
        .filter(pub => matcher(sub, pub))
        .reduce((list, topic) => (
          [...list, ...topicToPubs[topic].map(service => [service, topic])]
        ), []);
    },
    subscribersOf(pub) {
      return subTopics
        .filter(sub => matcher(sub, pub))
        .reduce((list, topic) => (
          [...list, ...topicToSubs[topic].map(service => [service, topic])]
        ), []);
    },
  };
}
