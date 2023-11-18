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
    };
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

export interface PlayerPersonalDataRequestParameters
    extends APIRequestParametersWithExtra {
    account_id: number | number[];
    access_token?: string;
}

export interface PlayerAchievementsRequestParameters
    extends APIRequestParameters {
    account_id: number;
    access_token?: string;
}

export interface PlayerStatisticsByDateRequestParameters
    extends PlayerPersonalDataRequestParameters {
    dates?: string | string[];
}

export interface StatisticsOfPlayerShipsRequestParameters
    extends PlayerPersonalDataRequestParameters {
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

/**
 * 待执行的官方API请求对象。
 */
export interface APIRequestQuery<P extends APIRequestParametersType, R> {
    /**
     * 请求参数
     */
    queryParams: P;
    query: () => Promise<R>;
}

// TypeScript interface for pvp statistics
export interface PvpStats {
    art_agro: number; // Potential damage caused by shells
    battles: number; // Total battles fought
    battles_since_510: number; // Number of battles, starting from version 5.10
    battles_since_512: number; // Number of battles, starting from version 5.12
    capture_points: number; // Base capture points
    damage_dealt: number; // Damage caused
    damage_scouting: number; // Damage caused by allies
    damage_to_buildings: number; // Damage dealt to installations, starting from version 5.12
    draws: number; // Draws
    dropped_capture_points: number; // Base defense points
    frags: number; // Warships destroyed
    losses: number; // Defeats
    max_damage_dealt: number; // Maximum damage caused per battle
    max_damage_dealt_to_buildings: number; // Most damage caused to installations in a battle
    max_damage_scouting: number; // Most damage caused by allies to enemy ships spotted by the player
    max_frags_battle: number; // Maximum number of enemy warships destroyed per battle
    max_planes_killed: number; // Maximum number of aircraft destroyed per battle
    max_ships_spotted: number; // Most ships detected
    max_suppressions_count: number; // Most installations surpressed in a battle
    max_total_agro: number; // Most potential damage caused by ammunition that hit or fell near the ship
    max_xp: number; // Maximum Experience Points per battle (including XP earned with Premium Account)
    planes_killed: number; // Enemy aircraft destroyed
    ships_spotted: number; // Ships spotted by the player first
    suppressions_count: number; // Number of installations surpressed, starting from version 5.12
    survived_battles: number; // Battles survived
    survived_wins: number; // Victories in battles survived
    team_capture_points: number; // Total number of base capture points earned by the player's team
    team_dropped_capture_points: number; // Total number of base defense points earned by the player's team
    torpedo_agro: number; // Potential damage caused by torpedoes
    wins: number; // Victories
    xp: number; // Total Experience Points , including XP earned with Premium Account
    aircraft: Partial<FragWeaponStats>; // Statistics of aircraft used
    main_battery: Partial<GunStats>; // Main battery firing statistics
    ramming: Partial<FragWeaponStats>; // Statistics of ramming enemy warships
    second_battery: Partial<GunStats>; // Secondary armament firing statistics
    torpedoes: Partial<GunStats>; // Statistics of attacking targets with torpedoes
}

export interface FragWeaponStats {
    frags: number; // Warships destroyed
    max_frags_battle: number; // Maximum number of enemy warships destroyed per battle
}

// Main battery firing statistics interface
export interface GunStats extends FragWeaponStats {
    hits: number; // Hits
    shots: number; // Shots fired
}

export interface StatisticsOfPlayerShipQueryData {
    [accound_id: number]: {
        account_id: number; // User ID
        battles: number; // Battles fought
        distance: number; // Miles travelled
        last_battle_time: number; // Last battle time
        ship_id: number; // Ship ID
        updated_at: number; // Date when details on ships were updated
        // club?: ClubStatsQueryData; // Statistics in Team battles. An extra field.
        // oper_div?: OperQueryData; // Player's statistics for playing the Operation mode, normal difficulty, in a Division[^1^][1]. An extra field.
        // oper_div_hard?: OperQueryData; // Player's statistics for playing the Operation mode, hard difficulty, in a Division[^1^][1]. An extra field.
        // oper_solo?: OperQueryData; // Player's statistics for playing solo the Operation mode, normal difficulty[^2^][2]. An extra field.
        // private?: PrivateStats; // Private data on the player's ships
        // pve?: PveStats; // Player statistics in all Co-op Battles. An extra field.
        // pve_div2?: PveDiv2Stats; // Player statistics in Co-op Battles in Division of 2 players. An extra field.
        // pve_div3?: PveDiv3Stats; // Player statistics in Co-op Battles in Division of 3 players. An extra field.
        // pve_solo?: PveSoloStats; // Player statistics in solo battles fought in Co-op mode. An extra field.
        pvp: Partial<PvpStats>; // Player statistics in all Random Battles
        pvp_div2?: Partial<PvpStats>; // Player statistics in Random Battles in Division of 2 players. An extra field.
        pvp_div3?: Partial<PvpStats>; // Player statistics in Random Battles in Division of 3 players. An extra field.
        pvp_solo?: Partial<PvpStats>; // Player statistics in solo battles fought in Random mode. An extra field.
    }[];
}
