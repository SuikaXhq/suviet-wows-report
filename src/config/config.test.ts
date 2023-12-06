import { MidwayConfig } from "@midwayjs/core";

export default {
    koa: {
        port: 60001,
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
    },
} as MidwayConfig;
