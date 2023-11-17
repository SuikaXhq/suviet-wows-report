import { Framework } from '@midwayjs/koa'
import { APIRequestService } from '../../src/service/apiRequest.service'
import { createApp, close } from '@midwayjs/mock'
import { APIRequestTargetEnum } from '../../src/types/apiRequest.types';

describe('test/service/apiRequest.test.ts', () => {
    it('should test Players query', async () => {
        const app = await createApp<Framework>()
        const service = await app.getApplicationContext().getAsync<APIRequestService>(APIRequestService)
        service.createQuery({
            requestTarget: APIRequestTargetEnum.Players,
            search: 'SuikaXhq',
            type: 'startswith',
        })
        await close(app)
    });
});
