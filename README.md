# Installation

```bash
$ npm install @nio/topic-grapher
```

# Usage

```js
import graph from '@nio/topic-grapher';

type ServiceName = string;
type Topic = string;

const services = await fetch(servicesUrl).then(r => r.json());
const blocks = await fetch(blocksUrl).then(r => r.json());

const result = graph(services, blocks)
result.nodes // => Array<ServiceName>
result.edges // => Array<[ServiceName, ServiceName, Topic]>
```
