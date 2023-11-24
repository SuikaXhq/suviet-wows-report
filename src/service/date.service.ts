import { Provide, Scope, ScopeEnum } from "@midwayjs/core";

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class DateService {
    getStartDate(date: Date): Date {
        let startDate: Date;
        if (date.getHours() < 3) {
            startDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
        } else {
            startDate = new Date(date.getTime());
        }
        startDate.setHours(3, 0, 0, 0);
        return startDate;
    }

    getEndDate(date: Date): Date {
        let endDate: Date;
        if (date.getHours() < 3) {
            endDate = new Date(date.getTime());
        } else {
            endDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        }
        endDate.setHours(2, 59, 59, 0);
        return endDate;
    }

    getBothEnds(date: Date): [Date, Date] {
        return [this.getStartDate(date), this.getEndDate(date)];
    }
}
