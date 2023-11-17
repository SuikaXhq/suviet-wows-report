import { Config, InjectClient, Singleton } from "@midwayjs/core";
import { APIRequestParametersType, APIRequestQuery, APIRequestRealmEnum, APIRequestTargetEnum, PlayersRequestResult } from "../types/apiRequest.types";
import { HttpService, HttpServiceFactory } from "@midwayjs/axios";
import qs from "qs";

/**
 * 用于发送对官方API接口的请求并返回结果。
 * @class APIRequestService
 */
@Singleton()
export class APIRequestService {

    @Config("wargamingAPI")
    wargamingAPIConfig: {
        application_id: string;
    };

    @InjectClient(HttpServiceFactory, 'asia')
    asiaHttpService: HttpService;

    @InjectClient(HttpServiceFactory, 'eu')
    euHttpService: HttpService;

    @InjectClient(HttpServiceFactory, 'na')
    naHttpService: HttpService;

    /**
     * 创建一个查询对象，用于发送对官方API接口的请求并返回结果。
     * @param queryParams GET对应的请求参数，JSON格式
     * @param realm 服务器
     * @param url API路径
     */
    createQuery<P extends APIRequestParametersType, R>(
        queryParams: P,
        realm: APIRequestRealmEnum = APIRequestRealmEnum.ASIA,
        url?: string
    ): APIRequestQuery<P, PlayersRequestResult<R>> {
        queryParams = this._validateApplicationId(queryParams);

        // 试图推断query URL
        if (!url) {
            url = this._getQueryURL(queryParams);
        }

        let httpService: HttpService;
        switch (realm) {
            case APIRequestRealmEnum.ASIA:
                httpService = this.asiaHttpService;
                break;
            case APIRequestRealmEnum.EU:
                httpService = this.euHttpService;
                break;
            case APIRequestRealmEnum.NA:
                httpService = this.naHttpService;
                break;
            default:
                throw new Error(`Invalid realm: ${realm}`);
        }

        return {
            queryParams,
            query: async () => {
                try {
                    const response = await httpService.get<PlayersRequestResult<R>>(url, {
                        params: queryParams,
                        paramsSerializer: (params_1) => {
                            return qs.stringify(params_1, { arrayFormat: 'comma' });
                        }
                    });
                    return response.data;
                } catch (error) {
                    throw error;
                }
            }
        };
    }

    private _getQueryURL<P extends APIRequestParametersType>(queryParams: P): string {
        let url: string;
        if (queryParams.requestTarget === APIRequestTargetEnum.Players) {
            url = `/wows/account/list/`;
        } else if (queryParams.requestTarget === APIRequestTargetEnum.PlayerPersonalData) {
            url = `/wows/account/info/`;
        } else if (queryParams.requestTarget === APIRequestTargetEnum.PlayerAchievements) {
            url = `/wows/account/achievements/`;
        } else if (queryParams.requestTarget === APIRequestTargetEnum.PlayerStatisticsByDate) {
            url = `/wows/account/statsbydate/`;
        } else if (queryParams.requestTarget === APIRequestTargetEnum.StatisticsOfPlayerShips) {
            url = `/wows/ships/stats/`;
        } else if (queryParams.requestTarget === APIRequestTargetEnum.Warships) {
            url = `/wows/encyclopedia/ships/`;
        } else {
            throw new Error(`Invalid request target from: ${queryParams}`);
        }
        return url;
    }

    private _validateApplicationId<T extends APIRequestParametersType>(queryParams: T): T {
        if (!queryParams.application_id) {
            queryParams.application_id = this.wargamingAPIConfig.application_id;
        }
        return queryParams;
    }
}

