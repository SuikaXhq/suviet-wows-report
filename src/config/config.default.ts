import { MidwayConfig } from "@midwayjs/core";
import path from "node:path";
import { APIRequestRealmEnum } from "../types/apiRequest.types";
import { getRequestURLByRealm } from "../types/apiRequest.types";

export default {
    // ORM
    typeorm: {
        dataSource: {
            default: {
                type: "sqlite",
                database: path.join(
                    __dirname,
                    "../../db/suviet-wows-report.sqlite"
                ),
                synchronize: true,
                logging: false,
                entities: ["**/model/*.model{.ts,.js}"],
            },
        },
        logging: "all",
    },

    // Wargaming API
    wargamingAPI: {
        application_id: process.env.APPLICATION_ID, // Wargaming API Application ID
    },

    // Axios
    axios: {
        default: {},
        clients: {
            default: {},
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
    keys: "123456",
    koa: {
        port: 60000,
    },
    view: {
        defaultViewEngine: "nunjucks",
    },
    // Ship name convert service
    shipNameConvert: {
        convertFile: path.join(__dirname, "../../static/nameConvert.json"),
    },

    // Logger
    midwayLogger: {
        default: {
            format: info => {
                return `[${info.timestamp}] ${info.LEVEL} pid:${info.pid} ${info.message}`
            }
        },
        clients: {
            typeormLogger: {
                fileLogName: 'midway-typeorm.log',
            }
        }
    }
} as MidwayConfig;
