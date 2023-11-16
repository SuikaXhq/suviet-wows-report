export enum APIRequestRealmEnum {
    ASIA = "asia",
    NA = "na",
    EU = "eu",
}

export interface PlayersRequestResult {
    status: string;
    meta: {
        count: number;
    };
    data: {
        account_id: number;
        nickname: string;
    }[];
}

export interface PlayerPersonalDataRequestResult {

}

export interface APIRequestQuery<T> {

}
