import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUserRoles1744115207719 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Swap the roles for the two users
        await queryRunner.query(`
            UPDATE users 
            SET role = CASE 
                WHEN email = 'admin@example.com' THEN 'admin'
                WHEN email = 'user@example.com' THEN 'user'
                ELSE role
            END
            WHERE email IN ('admin@example.com', 'user@example.com')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the role swap
        await queryRunner.query(`
            UPDATE users 
            SET role = CASE 
                WHEN email = 'admin@example.com' THEN 'user'
                WHEN email = 'user@example.com' THEN 'admin'
                ELSE role
            END
            WHERE email IN ('admin@example.com', 'user@example.com')
        `);
    }

}
