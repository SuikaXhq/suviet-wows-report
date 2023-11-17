import { MidwayConfig } from '@midwayjs/core';
import path from 'node:path';
import { Account } from '../model/account.model';
import { Battle } from '../model/battle.model';
import { Group } from '../model/group.model';
import { GroupDailyReport } from '../model/groupDailyReport.model';
import { Ship } from '../model/ship.model';
import { APIRequestRealmEnum } from '../types/apiRequest.types';
import { getRequestURLByRealm } from '../types/apiRequest.types';

export default {
  // ORM
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: path.join(__dirname, '../db/suviet-wows-report.sqlite'),
        synchronize: true,
        logging: false,
        entities: [
            Account,
            Battle,
            Ship,
            Group,
            GroupDailyReport
        ],
      }
    }
  },

  // Wargaming API
  wargamingAPI: {
    application_id: process.env.APPLICATION_ID, // Wargaming API Application ID
  },

  // Axios
  axios: {
    default: {

    },
    clients: {
      default: {
        realm: APIRequestRealmEnum.ASIA,
        baseURL: getRequestURLByRealm(APIRequestRealmEnum.ASIA),
      },
      asia: {
        realm: APIRequestRealmEnum.ASIA,
        baseURL: getRequestURLByRealm(APIRequestRealmEnum.ASIA),
      },
      eu: {
        realm: APIRequestRealmEnum.EU,
        baseURL: getRequestURLByRealm(APIRequestRealmEnum.EU),
      },
      na: {
        realm: APIRequestRealmEnum.NA,
        baseURL: getRequestURLByRealm(APIRequestRealmEnum.NA),
      },
    },
  },
  // use for cookie sign key, should change to your own and keep security
  keys: '123456',
  koa: {
    port: 7001,
  },
  view: {
    defaultViewEngine: 'nunjucks',
  },
} as MidwayConfig;
