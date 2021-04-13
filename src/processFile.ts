import 'reflect-metadata';
import { definitionsJsonExporter } from './exporters/definitionsJsonExporter';
import { RabbitDataGenerator } from './generators/RabbitDataGenerator';
import { NestScrapper } from './scrappers/NestScrapper';
import type { NestModule } from './types';

export const processFile = (inputPath: string, outputType: 'json' | 'terraform'): string => {
  process.env.UPLOAD_PATH = '/tmp/upload';
  const { AppModule } = require(inputPath) as { AppModule: NestModule };

  const { dispatchers, handlers, publishers } = NestScrapper(AppModule);
  const generator = new RabbitDataGenerator({ dispatchers, handlers, publishers });

  if (outputType === 'json') {
    return definitionsJsonExporter(generator, {
      globalParameters: [],
      user: {
        name: 'rabbitmq',
        password: 'rabbitmq',
      },
      vhost: 'dev',
    });
  } else if (outputType === 'terraform') {
    throw new Error('terraform not supported yet');
  } else {
    throw new Error(`Unknown output type: ${outputType}`);
  }
};
