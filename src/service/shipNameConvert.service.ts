import { Config, Provide, Scope, ScopeEnum } from "@midwayjs/core";
import { readFile } from "fs/promises";

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class ShipNameConvertService {
    @Config("shipNameConvert")
    private readonly config: {
        convertFile: string;
    };

    private shipNameConvertMap: {
        [zh_name: string]: string;
    };

    async convertShipName(zh_name: string): Promise<string> {
        if (this.shipNameConvertMap === undefined || this.shipNameConvertMap === null) {
            await this.initShipNameConvertMap();
        }
        return this.shipNameConvertMap[zh_name] ?? zh_name;
    }

    async initShipNameConvertMap(): Promise<void> {
        try {
            const convertFile = await readFile(this.config.convertFile, { encoding: "utf-8" });
            this.shipNameConvertMap = JSON.parse(convertFile);
        } catch (error) {
            throw error;
        }
    }
}
