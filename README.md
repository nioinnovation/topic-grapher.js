# Installation

```bash
$ npm install @nio/topic-graph
```

# Usage

```js
import graph from '@nio/topic-graph';

type ServiceName = string;
type Topic = string;

const services = await fetch(servicesUrl).then(r => r.json());
const blocks = await fetch(blocksUrl).then(r => r.json());

const result = graph(services, blocks)
result.nodes // => Array<ServiceName>
result.edges // => Array<[ServiceName, ServiceName, Topic]>
````
