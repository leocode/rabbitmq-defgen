import { Option, program } from 'commander';
import { processFile } from './processFile';
const packageJson = require('../package.json');

program
  .version(packageJson.version)
  .addOption(new Option('-o, --output <outputType>', 'output needs to be defined').choices(['json', 'terraform']))
  .addOption(new Option('-i, --input <inputPath>', 'input path needs to be defined'))
  .parse();

const options = program.opts();

process.stdout.write(processFile(options.input, options.output));
