import { Controller, Inject, Get } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";

@Controller('/view')
export class ViewController {
    @Inject()
    ctx: Context;

    @Get('/battle')
    async getBattle(): Promise<void> {

        await this.ctx.render('battleInfo');
    }
}
