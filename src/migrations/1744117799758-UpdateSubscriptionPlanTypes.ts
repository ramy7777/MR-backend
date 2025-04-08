import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSubscriptionPlanTypes1744117799758 implements MigrationInterface {
    name = 'UpdateSubscriptionPlanTypes1744117799758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First update existing values to 'monthly' to avoid enum constraint issues
        await queryRunner.query(`
            UPDATE subscriptions 
            SET "planType" = 'monthly' 
            WHERE "planType" IN ('daily', 'weekly')
        `);

        // Drop the default constraint
        await queryRunner.query(`
            ALTER TABLE "subscriptions" 
            ALTER COLUMN "planType" DROP DEFAULT
        `);

        // Now we can safely update the enum type
        // Create a new enum type
        await queryRunner.query(`
            CREATE TYPE "public"."subscriptions_plantype_enum_new" AS ENUM('monthly', 'yearly')
        `);

        // Update the column to use the new enum type
        await queryRunner.query(`
            ALTER TABLE "subscriptions" 
            ALTER COLUMN "planType" TYPE "subscriptions_plantype_enum_new" 
            USING "planType"::text::"subscriptions_plantype_enum_new"
        `);

        // Set the default value again
        await queryRunner.query(`
            ALTER TABLE "subscriptions" 
            ALTER COLUMN "planType" SET DEFAULT 'monthly'
        `);

        // Drop the old enum type
        await queryRunner.query(`
            DROP TYPE "public"."subscriptions_plantype_enum"
        `);

        // Rename the new enum type to the original name
        await queryRunner.query(`
            ALTER TYPE "subscriptions_plantype_enum_new" RENAME TO "subscriptions_plantype_enum"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the default constraint first
        await queryRunner.query(`
            ALTER TABLE "subscriptions" 
            ALTER COLUMN "planType" DROP DEFAULT
        `);
        
        // Create a new enum type with the original values
        await queryRunner.query(`
            CREATE TYPE "public"."subscriptions_plantype_enum_old" AS ENUM('daily', 'weekly', 'monthly')
        `);

        // Update the column to use the old enum type
        await queryRunner.query(`
            ALTER TABLE "subscriptions" 
            ALTER COLUMN "planType" TYPE "subscriptions_plantype_enum_old" 
            USING CASE 
                WHEN "planType" = 'yearly' THEN 'monthly'::text 
                ELSE "planType"::text 
            END::"subscriptions_plantype_enum_old"
        `);

        // Set the default value again
        await queryRunner.query(`
            ALTER TABLE "subscriptions" 
            ALTER COLUMN "planType" SET DEFAULT 'monthly'
        `);

        // Drop the new enum type
        await queryRunner.query(`
            DROP TYPE "public"."subscriptions_plantype_enum"
        `);

        // Rename the old enum type back to the original name
        await queryRunner.query(`
            ALTER TYPE "subscriptions_plantype_enum_old" RENAME TO "subscriptions_plantype_enum"
        `);
    }
}
