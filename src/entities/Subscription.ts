import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Device } from './Device';

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

  @Column({ type: 'integer', default: 1 })
  maxDevices: number;

  @Column({ type: 'integer', default: 0 })
  currentDeviceCount: number;

  @OneToMany(() => Device, device => device.currentSubscription)
  devices: Device[];

  @Column({ type: 'jsonb', nullable: true })
  features: {
    maxDevices: number;
    supportLevel: 'basic' | 'premium';
    additionalServices?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  billingHistory: {
    date: string;
    amount: number;
    status: 'pending' | 'paid' | 'failed';
  }[];

  @Column({ type: 'jsonb', nullable: true })
  usageHistory: {
    date: string;
    type: string;
    usage: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
