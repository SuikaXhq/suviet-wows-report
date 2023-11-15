import { MidwayConfig } from '@midwayjs/core';
import path = require('node:path');

export default {
  // ORM
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: path.join(__dirname, '../db/suviet-wows-report.sqlite'),
        synconize: true,
      }
    }
  },
  // use for cookie sign key, should change to your own and keep security
  keys: '1700050533403_6420',
  koa: {
    port: 7001,
  },
  view: {
    defaultViewEngine: 'nunjucks',
  },
} as MidwayConfig;
