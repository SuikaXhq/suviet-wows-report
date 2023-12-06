import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import * as view from '@midwayjs/view-nunjucks';
import * as dotenv from 'dotenv'
import * as axios from '@midwayjs/axios';
import * as orm from '@midwayjs/typeorm';
import * as crossDomain from '@midwayjs/cross-domain';

dotenv.config()

@Configuration({
  imports: [
    koa,
    orm,
    validate,
    axios,
    crossDomain,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    view,
  ],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    // add middleware
    // this.app.useMiddleware([ReportMiddleware]);
    // // add filter
    // this.app.useFilter([WeatherErrorFilter]);
  }
}
