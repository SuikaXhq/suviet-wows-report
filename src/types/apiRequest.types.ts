export enum APIRequestRealmEnum {
    ASIA = "asia",
    NA = "na",
    EU = "eu",
}

export enum APIRequestTargetEnum {
    Players,
    PlayerPersonalData,
    PlayerAchievements,
    PlayerStatisticsByDate,
    StatisticsOfPlayerShips,
    Warships,
}

export function getRequestURLByRealm(realm: APIRequestRealmEnum): string {
    let domain = realm as string;
    if (realm === APIRequestRealmEnum.NA) {
        domain = "com";
    }
    return `https://api.worldofwarships.${domain}`;
}

export interface PlayersRequestResult<T> {
    status: string;
    meta?: {
        count: number;
        hidden: number;
    };
    data?: T;
    error?: {
        message: string;
        code: number;
        value?: string;
        field?: string | string[];
    }
}

export interface APIRequestParameters {
    requestTarget: APIRequestTargetEnum;
    application_id?: string;
    fields?: string | string[];
    language?: string;
    realm?: string;
}

export interface APIRequestParametersWithExtra extends APIRequestParameters {
    extra?: string | string[];
}

export interface PlayersRequestParameters extends APIRequestParameters {
    search: string;
    limit?: number;
    type?: string;
}

export interface PlayerPersonalDataRequestParameters extends APIRequestParametersWithExtra {
    account_id: number | number[];
    access_token?: string;
}

export interface PlayerAchievementsRequestParameters extends APIRequestParameters {
    account_id: number;
    access_token?: string;
}

export interface PlayerStatisticsByDateRequestParameters extends PlayerPersonalDataRequestParameters {
    dates?: string | string[];
}

export interface StatisticsOfPlayerShipsRequestParameters extends PlayerPersonalDataRequestParameters {
    ship_id?: number | number[];
    in_garage?: boolean;
}

export interface WarshipsRequestParameters extends APIRequestParameters {
    ship_id?: number | number[];
    nation?: string | string[];
    type?: string | string[];
    limit?: number;
    page_no?: number;
}

export type APIRequestParametersType =
    | PlayersRequestParameters
    | PlayerPersonalDataRequestParameters
    | PlayerAchievementsRequestParameters
    | PlayerStatisticsByDateRequestParameters
    | StatisticsOfPlayerShipsRequestParameters
    | WarshipsRequestParameters;

export interface APIRequestQuery<P extends APIRequestParametersType, R> {
    queryParams: P;
    query: () => Promise<R>;
}

