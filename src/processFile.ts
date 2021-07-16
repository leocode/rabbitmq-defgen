import 'reflect-metadata';
import { jsonExporter } from './exporters/jsonExporter';
import { terraformExporter } from './exporters/terraformExporter';
import { RabbitDataGenerator } from './generators/RabbitDataGenerator';
import { NestScrapper } from './scrappers/NestScrapper';
import type { NestModule } from './types';

interface Options {
  input: string;
  vhost: string;
  output: 'json' | 'terraform';
  jsonOptions: { username: string; password: string };
}

export const processFile = ({ input, output, vhost, jsonOptions }: Options): string => {
  const { AppModule } = require(input) as { AppModule: NestModule };

  const { dispatchers, handlers, publishers } = NestScrapper(AppModule);
  const generator = new RabbitDataGenerator({ dispatchers, handlers, publishers });

  if (output === 'json') {
    return jsonExporter(generator, {
      globalParameters: [],
      user: {
        name: jsonOptions.username,
        password: jsonOptions.password,
      },
      vhost,
    });
  } else if (output === 'terraform') {
    return terraformExporter(generator, {
      globalParameters: [],
      vhost,
    });
  } else {
    throw new Error(`Unknown output type: ${output}`);
  }
};
