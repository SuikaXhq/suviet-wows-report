import { Config, ILogger, Inject, Provide, Scope, ScopeEnum } from "@midwayjs/core";
import { readFile } from "fs/promises";

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class ShipNameConvertService {
    @Config("shipNameConvert")
    private readonly config: {
        convertFile: string;
    };

    @Inject()
    logger: ILogger;

    private shipNameConvertMap: {
        [zh_name: string]: string;
    };

    async convertShipName(zh_name: string): Promise<string> {
        if (this.shipNameConvertMap === undefined || this.shipNameConvertMap === null) {
            await this.initShipNameConvertMap();
        }
        if (this.shipNameConvertMap[zh_name] === undefined || this.shipNameConvertMap[zh_name] === null) {
            this.logger.debug(`ShipNameConvertService: shipNameConvertMap does not contain ${zh_name}.`);
            return zh_name;
        }
        return this.shipNameConvertMap[zh_name];
    }

    async initShipNameConvertMap(): Promise<void> {
        try {
            const convertFile = await readFile(this.config.convertFile, { encoding: "utf-8" });
            this.shipNameConvertMap = JSON.parse(convertFile);
        } catch (error) {
            this.logger.error("ShipNameConvertService: init shipNameConvertMap failed.");
            this.logger.error(error);
            throw error;
        }
    }
}
