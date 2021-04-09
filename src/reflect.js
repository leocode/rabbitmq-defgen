process.env.UPLOAD_PATH = '/tmp/upload';
const { AppModule } = require('/home/leocode/Advisero/advisero-saas-api/dist/app.module');

const modules = Reflect.getMetadata('imports', AppModule);

