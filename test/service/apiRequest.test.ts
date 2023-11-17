import { Framework, Application } from '@midwayjs/koa'
import { APIRequestService } from '../../src/service/apiRequest.service'
import { createApp, close } from '@midwayjs/mock'
import { APIRequestTargetEnum } from '../../src/types/apiRequest.types';

describe('test/service/apiRequest.test.ts', () => {
    let app: Application;
    let service: APIRequestService;

    beforeAll(async () => {
        app = await createApp<Framework>();
        service = await app.getApplicationContext().getAsync<APIRequestService>(APIRequestService)
    });

    afterAll(async () => {
        close(app);
    });

    it('should test Players query', async () => {
        const result = await service.createQuery<{
            nickname: string,
            account_id: number,
        }[]>({
            requestTarget: APIRequestTargetEnum.Players,
            search: 'SuikaXhq',
            type: 'startswith',
        }).query();
        expect(result.status).toBe('ok');
        expect(result.meta!.count).toBe(1);
        expect(result.data![0].nickname).toBe('SuikaXhq');
        expect(result.data![0].account_id).toBe(2020341580);
    });

    it('should test PlayerPersonalData query', async () => {
        const result = await service.createQuery<{
            last_battle_time: number,
        }>({
            requestTarget: APIRequestTargetEnum.PlayerPersonalData,
            account_id: 2020341580,
            fields: ['last_battle_time'],
        }).query();
        expect(result.status).toBe('ok');
        console.log(`Last battle time is ${result.data![2020341580].last_battle_time}.`);
    });

    it('should test PlayerStatisticsByDate query', async () => {
        const result = await service.createQuery<{
            "2020341580": {
                pvp: {
                    [date: number]: {
                        battles: number,
                        damage_dealt: number,
                        date: string,
                    }
                }
            }
        }>({
            requestTarget: APIRequestTargetEnum.PlayerStatisticsByDate,
            account_id: 2020341580,
            dates: ['20231113', '20231114'],
            fields: ['pvp.battles', 'pvp.damage_dealt', 'pvp.date'],
        }).query();
        expect(result.status).toBe('ok');
        console.log(`Battles: ${result.data![2020341580].pvp[20231113].battles}`);
    });

    it('should test StatisticsOfPlayerShip query', async () => {
        const result = await service.createQuery<{
            "2020341580": {
                pvp: {
                    main_battery: {
                        frags: number,
                    },
                },
                battles: number,
                ship_id: number,
            }[]
        }>({
            requestTarget: APIRequestTargetEnum.StatisticsOfPlayerShips,
            account_id: 2020341580,
            ship_id: [4282267344, 3751786192],
            fields: ['pvp.main_battery.frags', 'battles', 'ship_id'],
        }).query();
        expect(result.status).toBe('ok');
        expect(result.data![2020341580].map((item) => item.ship_id)).toContain(3751786192);
        expect(result.data![2020341580].map((item) => item.ship_id)).toContain(4282267344);
    });
});
