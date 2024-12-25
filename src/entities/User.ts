import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Subscription } from './Subscription';
import { Rental } from './Rental';
import { Session } from './Session';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  contactInfo: {
    phone?: string;
    address?: string;
  };

  @Column({ default: 'active' })
  status: 'active' | 'inactive' | 'suspended';

  @OneToMany(() => Subscription, subscription => subscription.user)
  subscriptions: Subscription[];

  @OneToMany(() => Rental, rental => rental.user)
  rentals: Rental[];

  @OneToMany(() => Session, session => session.user)
  sessions: Session[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
