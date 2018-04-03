// @flow
import matcher from '@nio/topic-matcher';

import partitionBlocks from './partition-blocks';
import trace from './trace';
import type {
  Blocks,
  Services,
  ServiceShape,
  ExecutionStep,
  GraphResult,
  TopicServiceList,
  Mapping,
} from './types.js.flow';

const getId = (step: ExecutionStep) => step.id;

const exists = topic => !!topic;

const permute = (left: Array<string>, right: Array<string>, ...rest) => (
  left.reduce((l0, l) => (
    right.reduce((l1, r) => (
      [...l1, [l, r, ...rest]]
    ), l0)
  ), [])
);

const createAdder = (list: TopicServiceList) =>
  (service: string, topic: string) => {
    /* eslint-disable no-param-reassign */
    const topicList = list[topic] || (list[topic] = []);
    return topicList.push(service);
  };

const matcherOptions = {
  resolver: t => t.replace(/\[\[([^\]]+)\]\]/g, '__$1__'),
};

export default function compile(services: Services, blocks: Blocks): GraphResult {
  const nodes = new Set();

  const [pubs, subs] = partitionBlocks(blocks);
  const [localPubs, localSubs] = partitionBlocks(blocks, { local: true });
  const topicToPubs: TopicServiceList = {};
  const topicToSubs: TopicServiceList = {};
  const topicToLocalPubs: TopicServiceList = {};
  const topicToLocalSubs: TopicServiceList = {};

  const addPublisher = createAdder(topicToPubs);
  const addSubscriber = createAdder(topicToSubs);
  const addLocalPublisher = createAdder(topicToLocalPubs);
  const addLocalSubscriber = createAdder(topicToLocalSubs);

  Object.keys(services).forEach((key) => {
    const {
      id,
      name,
      execution,
      mapping,
    }: ServiceShape = services[key];

    nodes.add(id);

    const mappings: Mapping = mapping ?
      mapping.reduce((rest, { id, mapping: block }) => ({
        ...rest,
        [id]: block,
      }), {}) : {};

    const resolveId = id => (mappings[id] || id);

    const resolvedBlockNames = [...new Set(
      execution.map(getId).map(resolveId),
    )];

    // Publishers
    resolvedBlockNames
      .map(b => pubs[b])
      .filter(exists)
      .forEach((topic) => {
        addPublisher(id, topic);
      });

    // Subscribers
    resolvedBlockNames
      .map(b => subs[b])
      .filter(exists)
      .forEach((topic) => {
        addSubscriber(id, topic);
      });

    // LocalPublishers
    resolvedBlockNames
    .map(b => localPubs[b])
    .filter(exists)
    .forEach((topic) => {
      addLocalPublisher(id, topic);
    });

    // LocalSubscribers
    resolvedBlockNames
      .map(b => localSubs[b])
      .filter(exists)
      .forEach((topic) => {
        addLocalSubscriber(id, topic);
      });
  });

  const pubTopics = Object.keys(topicToPubs);
  const subTopics = Object.keys(topicToSubs);
  const localPubTopics = Object.keys(topicToLocalPubs);
  const localSubTopics = Object.keys(topicToLocalSubs);

  const edges = subTopics.reduce((l0, subTopic) => (
    pubTopics.reduce((l1, pubTopic) => (
      matcher(subTopic, pubTopic, matcherOptions) ? [
        ...l1,
        ...permute(topicToPubs[pubTopic], topicToSubs[subTopic], pubTopic),
      ] : l1), l0)
  ), []);

  const localEdges = localSubTopics.reduce((l0, localSubTopic) => (
    localPubTopics.reduce((l1, localPubTopic) => (
      matcher(localSubTopic, localPubTopic, matcherOptions) ? [
        ...l1,
        ...permute(
            topicToLocalPubs[localPubTopic],
            topicToLocalSubs[localSubTopic],
            localPubTopic,
          ),
      ] : l1), l0)
  ), []);

  return {
    nodes: [...nodes],
    edges: edges.concat(localEdges),
    publishersOf(sub) {
      return pubTopics
        .filter(pub => matcher(sub, pub, matcherOptions))
        .reduce((list, topic) => (
          [...list, ...topicToPubs[topic].map(service => [service, topic])]
        ), []);
    },
    subscribersOf(pub) {
      return subTopics
      .filter(sub => matcher(sub, pub, matcherOptions))
      .reduce((list, topic) => (
        [...list, ...topicToSubs[topic].map(service => [service, topic])]
      ), []);
    },
    localPublishersOf(localSub) {
      return localPubTopics
        .filter(localPub => matcher(localSub, localPub, matcherOptions))
        .reduce((list, topic) => (
          [...list, ...topicToLocalPubs[topic].map(service => [service, topic])]
        ), []);
    },
    localSubscribersOf(localPub) {
      return localSubTopics
        .filter(localSub => matcher(localSub, localPub, matcherOptions))
        .reduce((list, topic) => (
          [...list, ...topicToLocalSubs[topic].map(service => [service, topic])]
        ), []);
    },
    trace(start, end) {
      return trace(edges, start, end);
    },
  };
}
