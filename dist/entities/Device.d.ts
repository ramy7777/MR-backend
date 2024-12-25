import { Rental } from './Rental';
import { Session } from './Session';
export declare class Device {
    id: string;
    serialNumber: string;
    status: 'available' | 'rented' | 'maintenance' | 'retired';
    currentUserId: string;
    lastMaintenance: Date;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    specifications: {
        model?: string;
        manufacturer?: string;
        firmware?: string;
        hardware?: string;
    };
    rentals: Rental[];
    sessions: Session[];
    createdAt: Date;
    updatedAt: Date;
}
