import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly'],
    default: 'monthly'
  })
  planType: 'daily' | 'weekly' | 'monthly';

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  })
  status: 'active' | 'expired' | 'cancelled';

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  })
  paymentStatus: 'pending' | 'paid' | 'failed';

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp', nullable: true })
  nextBillingDate: Date;

  @Column({ type: 'float', default: 0 })
  currentUsage: number;

  @Column({ type: 'float', nullable: true })
  usageLimit: number;

  @Column('jsonb', { nullable: true })
  features: {
    maxDevices: number;
    supportLevel: string;
    additionalServices: string[];
  };

  @Column('jsonb', { nullable: true })
  billingHistory: {
    date: Date;
    amount: number;
    status: string;
  }[];

  @Column('jsonb', { nullable: true })
  usageHistory: {
    date: Date;
    usage: number;
    type: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
