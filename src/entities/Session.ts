import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Device } from './Device';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.sessions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Device, device => device.sessions)
  @JoinColumn({ name: 'deviceId' })
  device: Device;

  @Column()
  deviceId: string;

  @Column()
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({ type: 'jsonb', nullable: true })
  gameData: {
    applicationId?: string;
    duration?: number;
    performance?: {
      fps?: number;
      latency?: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  telemetry: {
    batteryLevel?: number;
    temperature?: number;
    errors?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;
}
