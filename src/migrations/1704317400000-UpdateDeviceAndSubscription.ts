import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDeviceAndSubscription1704317400000 implements MigrationInterface {
    name = 'UpdateDeviceAndSubscription1704317400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns to devices table
        await queryRunner.query(`
            ALTER TABLE "devices"
            ADD COLUMN IF NOT EXISTS "name" varchar NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS "model" varchar NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS "currentSubscriptionId" uuid,
            ADD COLUMN IF NOT EXISTS "maintenanceHistory" jsonb,
            ALTER COLUMN "specifications" SET NOT NULL,
            ALTER COLUMN "specifications" SET DEFAULT '{}'::jsonb
        `);

        // Update specifications column to include all required fields
        await queryRunner.query(`
            UPDATE "devices"
            SET "specifications" = jsonb_build_object(
                'manufacturer', '',
                'modelNumber', '',
                'firmware', '',
                'hardware', '',
                'displayType', '',
                'resolution', '',
                'refreshRate', '',
                'fieldOfView', '',
                'tracking', '',
                'controllers', '',
                'connectivity', '[]'::jsonb,
                'sensors', '[]'::jsonb
            )
            WHERE "specifications" IS NULL OR "specifications" = '{}'::jsonb
        `);

        // Add new columns to subscriptions table
        await queryRunner.query(`
            ALTER TABLE "subscriptions"
            ADD COLUMN IF NOT EXISTS "maxDevices" integer NOT NULL DEFAULT 1,
            ADD COLUMN IF NOT EXISTS "currentDeviceCount" integer NOT NULL DEFAULT 0,
            ALTER COLUMN "features" TYPE jsonb USING features::jsonb
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "devices"
            ADD CONSTRAINT "FK_device_subscription"
            FOREIGN KEY ("currentSubscriptionId")
            REFERENCES "subscriptions"("id")
            ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "devices"
            DROP CONSTRAINT IF EXISTS "FK_device_subscription"
        `);

        // Remove new columns from devices table
        await queryRunner.query(`
            ALTER TABLE "devices"
            DROP COLUMN IF EXISTS "name",
            DROP COLUMN IF EXISTS "model",
            DROP COLUMN IF EXISTS "currentSubscriptionId",
            DROP COLUMN IF EXISTS "maintenanceHistory",
            ALTER COLUMN "specifications" DROP NOT NULL,
            ALTER COLUMN "specifications" DROP DEFAULT
        `);

        // Remove new columns from subscriptions table
        await queryRunner.query(`
            ALTER TABLE "subscriptions"
            DROP COLUMN IF EXISTS "maxDevices",
            DROP COLUMN IF EXISTS "currentDeviceCount"
        `);
    }
}
