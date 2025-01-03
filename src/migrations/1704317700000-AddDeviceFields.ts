import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeviceFields1704317700000 implements MigrationInterface {
    name = 'AddDeviceFields1704317700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, delete any existing devices since we're adding required fields
        await queryRunner.query(`
            DELETE FROM "devices";
        `);

        // Add new columns to devices table with default values
        await queryRunner.query(`
            ALTER TABLE "devices"
            ADD COLUMN IF NOT EXISTS "name" character varying NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS "model" character varying NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS "currentSubscriptionId" uuid,
            ADD COLUMN IF NOT EXISTS "maintenanceHistory" jsonb;
        `);

        // Remove the default constraints after adding the columns
        await queryRunner.query(`
            ALTER TABLE "devices"
            ALTER COLUMN "name" DROP DEFAULT,
            ALTER COLUMN "model" DROP DEFAULT;
        `);

        // Update specifications column
        await queryRunner.query(`
            ALTER TABLE "devices"
            ALTER COLUMN "specifications" SET NOT NULL,
            ALTER COLUMN "specifications" SET DEFAULT '{}'::jsonb;
        `);

        // Add new columns to subscriptions table
        await queryRunner.query(`
            ALTER TABLE "subscriptions"
            ADD COLUMN IF NOT EXISTS "maxDevices" integer NOT NULL DEFAULT 1,
            ADD COLUMN IF NOT EXISTS "currentDeviceCount" integer NOT NULL DEFAULT 0;
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "devices"
            ADD CONSTRAINT "FK_device_subscription"
            FOREIGN KEY ("currentSubscriptionId")
            REFERENCES "subscriptions"("id")
            ON DELETE SET NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "devices"
            DROP CONSTRAINT IF EXISTS "FK_device_subscription";
        `);

        // Remove new columns from devices table
        await queryRunner.query(`
            ALTER TABLE "devices"
            DROP COLUMN IF EXISTS "name",
            DROP COLUMN IF EXISTS "model",
            DROP COLUMN IF EXISTS "currentSubscriptionId",
            DROP COLUMN IF EXISTS "maintenanceHistory",
            ALTER COLUMN "specifications" DROP NOT NULL,
            ALTER COLUMN "specifications" DROP DEFAULT;
        `);

        // Remove new columns from subscriptions table
        await queryRunner.query(`
            ALTER TABLE "subscriptions"
            DROP COLUMN IF EXISTS "maxDevices",
            DROP COLUMN IF EXISTS "currentDeviceCount";
        `);
    }
}