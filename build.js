require('babel-polyfill');

const compile = require('./src').default;

const fs = require('fs');
const Promise = require('bluebird');
const readFile = Promise.promisify(fs.readFile);

const sources = {
  services: readFile(`${process.argv[2]}.json`).then(x => JSON.parse(x)),
  blocks: readFile(`${process.argv[2]}:blocks.json`).then(x => JSON.parse(x)),
};

Promise.props(sources)
  .then(({ services, blocks }) => {
    const { nodes, edges } = compile(services, blocks);
    console.log(JSON.stringify({
      nodes: nodes.sort(),
      edges: edges.sort().map(([a,b,c])=>`${a} => ${b} (${c})`),
    }));
  })
