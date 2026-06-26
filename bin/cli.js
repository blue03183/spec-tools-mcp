#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';

const MCP_CONFIG = {
  command: 'npx',
  args: ['-y', 'spec-tools-mcp'],
};

const VSCODE_SERVER_CONFIG = {
  type: 'stdio',
  command: 'npx',
  args: ['-y', 'spec-tools-mcp'],
};

async function init() {
  const cwd = process.cwd();
  console.log('spec-tools-mcp init\n');

  const tasks = [
    {
      label: 'Claude Code',
      file: path.join(cwd, '.mcp.json'),
      build: () => ({ mcpServers: { 'spec-tools-mcp': MCP_CONFIG } }),
      merge: (obj) => { (obj.mcpServers ??= {})['spec-tools-mcp'] = MCP_CONFIG; return obj; },
      hasEntry: (obj) => !!obj.mcpServers?.['spec-tools-mcp'],
    },
  ];

  if (await fs.pathExists(path.join(cwd, '.cursor'))) {
    tasks.push({
      label: 'Cursor',
      file: path.join(cwd, '.cursor', 'mcp.json'),
      build: () => ({ mcpServers: { 'spec-tools-mcp': MCP_CONFIG } }),
      merge: (obj) => { (obj.mcpServers ??= {})['spec-tools-mcp'] = MCP_CONFIG; return obj; },
      hasEntry: (obj) => !!obj.mcpServers?.['spec-tools-mcp'],
    });
  }

  if (await fs.pathExists(path.join(cwd, '.vscode'))) {
    tasks.push({
      label: 'VS Code',
      file: path.join(cwd, '.vscode', 'mcp.json'),
      build: () => ({ servers: { 'spec-tools-mcp': VSCODE_SERVER_CONFIG } }),
      merge: (obj) => { (obj.servers ??= {})['spec-tools-mcp'] = VSCODE_SERVER_CONFIG; return obj; },
      hasEntry: (obj) => !!obj.servers?.['spec-tools-mcp'],
    });
  }

  for (const task of tasks) {
    const rel = path.relative(cwd, task.file);
    try {
      if (await fs.pathExists(task.file)) {
        const existing = JSON.parse(await fs.readFile(task.file, 'utf-8'));
        if (task.hasEntry(existing)) {
          console.log(`⏭  ${task.label}: already configured (${rel})`);
          continue;
        }
        await fs.writeFile(task.file, JSON.stringify(task.merge(existing), null, 2) + '\n');
        console.log(`✅  ${task.label}: updated ${rel}`);
      } else {
        await fs.outputFile(task.file, JSON.stringify(task.build(), null, 2) + '\n');
        console.log(`✅  ${task.label}: created ${rel}`);
      }
    } catch (err) {
      console.log(`❌  ${task.label}: failed — ${err.message}`);
    }
  }

  console.log('\nDone. Restart your AI agent to pick up the new server.');
}

function printHelp() {
  console.log([
    'Usage:',
    '  npx spec-tools-mcp          Start the MCP server',
    '  npx spec-tools-mcp init     Write MCP config for detected IDEs',
    '  npx spec-tools-mcp --help   Show this message',
  ].join('\n'));
}

const cmd = process.argv[2];

if (cmd === 'init') {
  await init();
} else if (cmd === '--help' || cmd === '-h') {
  printHelp();
} else {
  const { startServer } = await import('../mcp-server/index.js');
  await startServer();
}
