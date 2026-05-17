import fs from 'node:fs';

const registry = JSON.parse(fs.readFileSync(new URL('../fixtures/token-depot-known-cas.json', import.meta.url), 'utf8'));
const mainnet = registry.mainnet || {};
const required = [
  '6f685f85d679d5b7b5d702ebe4a249fb31ddc9edbb7c9f49971daef7cc7fe48f',
  '2d6fc4377f2fb2a5d051e6c99b6d784960b45edc2f6d268bfc432b5ee5dee3dc'
];

for (const ca of required) {
  if (!mainnet[ca]) {
    throw new Error(`Missing required mainnet CA fixture: ${ca}`);
  }
}

console.log('fixture verification passed');
