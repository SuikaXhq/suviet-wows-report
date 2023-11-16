import { Config, Singleton } from "@midwayjs/core";



/**
 * @class APIRequestService
 * 用于发送对官方API接口的请求并返回结果的类。
 */
@Singleton()
export class APIRequestService {

    @Config("wargamingAPI")
    wargamingAPIConfig: {
        application_id: string;
    };

    async request()


}

