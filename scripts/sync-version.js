#!/usr/bin/env node
// package.json 버전을 플러그인·마켓플레이스 매니페스트에 동기화한다.

import fs from 'fs-extra';

const version = fs.readJsonSync('package.json').version;

const targets = [
  '.claude-plugin/plugin.json',
  '.github/plugin/plugin.json',
  '.claude-plugin/marketplace.json',
];

for (const file of targets) {
  const json = fs.readJsonSync(file);
  if (json.version === version) continue;
  json.version = version;
  fs.writeJsonSync(file, json, { spaces: 2 });
  console.log(`synced ${file} → ${version}`);
}
