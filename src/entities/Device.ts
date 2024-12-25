import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Rental } from './Rental';
import { Session } from './Session';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  serialNumber: string;

  @Column({
    type: 'enum',
    enum: ['available', 'rented', 'maintenance', 'retired'],
    default: 'available'
  })
  status: 'available' | 'rented' | 'maintenance' | 'retired';

  @Column({ nullable: true })
  currentUserId: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenance: Date;

  @Column({
    type: 'enum',
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'excellent'
  })
  condition: 'excellent' | 'good' | 'fair' | 'poor';

  @Column({ type: 'jsonb', nullable: true })
  specifications: {
    model?: string;
    manufacturer?: string;
    firmware?: string;
    hardware?: string;
  };

  @OneToMany(() => Rental, rental => rental.device)
  rentals: Rental[];

  @OneToMany(() => Session, session => session.device)
  sessions: Session[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
