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
}

export const processFile = ({ input, output, vhost }: Options): string => {
  process.env.UPLOAD_PATH = '/tmp/upload';
  const { AppModule } = require(input) as { AppModule: NestModule };

  const { dispatchers, handlers, publishers } = NestScrapper(AppModule);
  const generator = new RabbitDataGenerator({ dispatchers, handlers, publishers });

  if (output === 'json') {
    return jsonExporter(generator, {
      globalParameters: [],
      user: {
        name: 'rabbitmq',
        password: 'rabbitmq',
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
