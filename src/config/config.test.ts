import { MidwayConfig } from "@midwayjs/core";

export default {
    koa: {
        port: null,
    },
    midwayLogger: {
        default: {
            level: "debug",
        },
        clients: {
            appLogger: {
                level: "debug",
            },
        },
    },
    typeorm: {
        logging: "all",
        logger: "file"
    }
} as MidwayConfig;
