import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCustomerOrientedFields1703755892000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns to subscriptions table
        await queryRunner.addColumns("subscriptions", [
            new TableColumn({
                name: "nextBillingDate",
                type: "timestamp",
                isNullable: true
            }),
            new TableColumn({
                name: "currentUsage",
                type: "float",
                default: 0
            }),
            new TableColumn({
                name: "usageLimit",
                type: "float",
                isNullable: true
            }),
            new TableColumn({
                name: "features",
                type: "jsonb",
                isNullable: true
            }),
            new TableColumn({
                name: "billingHistory",
                type: "jsonb",
                isNullable: true
            }),
            new TableColumn({
                name: "usageHistory",
                type: "jsonb",
                isNullable: true
            })
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the columns in reverse order
        await queryRunner.dropColumns("subscriptions", [
            "usageHistory",
            "billingHistory",
            "features",
            "usageLimit",
            "currentUsage",
            "nextBillingDate"
        ]);
    }
}
