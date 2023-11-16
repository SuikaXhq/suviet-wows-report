import { Config, InjectClient, Singleton } from "@midwayjs/core";
import { APIRequestParametersType, APIRequestQuery, APIRequestRealmEnum, APIRequestTargetEnum, PlayersRequestParameters } from "../types/apiRequest.types";
import { HttpService, HttpServiceFactory } from "@midwayjs/axios";
import qs from "qs";

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

    @InjectClient(HttpServiceFactory, 'asia')
    asiaHttpService: HttpService;

    @InjectClient(HttpServiceFactory, 'eu')
    euHttpService: HttpService;

    @InjectClient(HttpServiceFactory, 'na')
    naHttpService: HttpService;

    createQuery<P extends APIRequestParametersType, R>(
        queryParams: P,
        realm: APIRequestRealmEnum = APIRequestRealmEnum.ASIA,
        url?: string
    ): APIRequestQuery<P, R> {
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
            query: () => {
                return httpService.get(url, {
                    params: queryParams,
                    paramsSerializer: (params) => {
                        return qs.stringify(params, { arrayFormat: 'comma' });
                    }
                });
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

