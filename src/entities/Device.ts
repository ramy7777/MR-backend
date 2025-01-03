import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Rental } from './Rental';
import { Session } from './Session';
import { Subscription } from './Subscription';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  serialNumber: string;

  @Column()
  name: string;

  @Column()
  model: string;

  @Column({
    type: 'enum',
    enum: ['available', 'rented', 'maintenance', 'retired'],
    default: 'available'
  })
  status: 'available' | 'rented' | 'maintenance' | 'retired';

  @Column({ nullable: true })
  currentUserId: string;

  @Column({ nullable: true })
  currentSubscriptionId: string;

  @ManyToOne(() => Subscription, subscription => subscription.devices)
  @JoinColumn({ name: 'currentSubscriptionId' })
  currentSubscription: Subscription;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenance: Date;

  @Column({
    type: 'enum',
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'excellent'
  })
  condition: 'excellent' | 'good' | 'fair' | 'poor';

  @Column({ type: 'jsonb', nullable: false, default: {} })
  specifications: {
    manufacturer: string;
    modelNumber: string;
    firmware: string;
    hardware: string;
    displayType: string;
    resolution: string;
    refreshRate: string;
    fieldOfView: string;
    tracking: string;
    controllers: string;
    connectivity: string[];
    sensors: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  maintenanceHistory: {
    date: Date;
    type: 'routine' | 'repair' | 'upgrade';
    description: string;
    technician: string;
    notes?: string;
  }[];

  @OneToMany(() => Rental, rental => rental.device)
  rentals: Rental[];

  @OneToMany(() => Session, session => session.device)
  sessions: Session[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
