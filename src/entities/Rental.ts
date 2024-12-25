import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Device } from './Device';

@Entity('rentals')
export class Rental {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.rentals)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Device, device => device.rentals)
  @JoinColumn({ name: 'deviceId' })
  device: Device;

  @Column()
  deviceId: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  depositAmount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'returned', 'overdue'],
    default: 'pending'
  })
  status: 'pending' | 'active' | 'returned' | 'overdue';

  @Column({ type: 'jsonb', nullable: true })
  returnCondition: {
    status: 'undamaged' | 'damaged' | 'lost';
    notes?: string;
    damageDetails?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
