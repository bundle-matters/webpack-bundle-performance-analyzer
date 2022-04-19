#!/usr/bin/env node

import { Cli } from 'clipanion';
import { PackageJson } from 'type-fest';

import { PrintCommand } from './commands/print';

const [node, app, ...args] = process.argv;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg: PackageJson = require('../package.json');

const cli = new Cli({
  binaryName: `${node} ${app}`,
  binaryLabel: pkg.name,
  binaryVersion: pkg.version,
});

cli.register(PrintCommand);

cli.runExit(args);
