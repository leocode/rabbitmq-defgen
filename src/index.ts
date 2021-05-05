#!/usr/bin/env node
import { Option, program } from 'commander';
import { processFile } from './processFile';
const packageJson = require('../package.json');

program
  .version(packageJson.version)
  .addOption(new Option('-o, --output <outputType>', 'output needs to be defined').choices(['json', 'terraform']).makeOptionMandatory())
  .addOption(new Option('-i, --input <inputPath>', 'input path needs to be defined').makeOptionMandatory())
  .addOption(new Option('--vhost <vhost_name>', 'vhost name needs to be defined').makeOptionMandatory())
  .parse();

const options = program.opts();

process.stdout.write(processFile({
  input: options.input,
  output: options.output,
  vhost: options.vhost,
}));
