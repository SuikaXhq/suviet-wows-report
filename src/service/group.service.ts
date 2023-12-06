import { ILogger, Inject, Provide } from "@midwayjs/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Group } from "../model/group.model";
import { Repository } from "typeorm";
import { Account } from "../model/account.model";

@Provide()
export class GroupService {
    @Inject()
    logger: ILogger;

    @InjectEntityModel(Group)
    groupModel: Repository<Group>;

    async createGroup(groupName: string): Promise<Group> {
        // 检查是否已经存在
        const group = await this.groupModel.findOne({
            where: {
                groupName,
            }
        });
        if (group) {
            this.logger.warn(`GroupService: Group ${groupName} already exists during createGroup().`);
            return group;
        }
        const newGroup = new Group();
        newGroup.groupName = groupName;
        return await this.groupModel.save(newGroup);
    }

    async getGroupList(): Promise<number[]> {
        return await this.groupModel.find({
            select: ['groupId']
        }).then(groups => {
            return groups.map(group => group.groupId);
        });
    }

    async getGroupByName(groupName: string): Promise<Group> {
        return await this.groupModel.findOne({
            where: {
                groupName
            }
        });
    }

    async getGroup(groupId: number, memberRelation?: boolean): Promise<Group> {
        return await this.groupModel.findOne({
            where: {
                groupId
            },
            relations: {
                accounts: memberRelation ?? false
            }
        });
    }

    async addMember(group: Group, account: Account): Promise<void> {
        if (group === null
            || group === undefined
            || account === null
            || account === undefined) {
            this.logger.warn(`GroupService: Null group or account during addMember().`);
            this.logger.debug(`group: ${group}, account: ${account}`);
            return;
        }
        if (group.accounts.includes(account)) {
            this.logger.warn(`GroupService: Account ${account.accountId} already in group ${group.groupName} during addMember().`);
            return;
        }
        group.accounts.push(account);
        await this.groupModel.save(group);
    }
}
