import { Subscription } from './Subscription';
import { Rental } from './Rental';
import { Session } from './Session';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    contactInfo: {
        phone?: string;
        address?: string;
    };
    role: 'user' | 'admin';
    status: 'active' | 'inactive' | 'suspended';
    subscriptions: Subscription[];
    rentals: Rental[];
    sessions: Session[];
    createdAt: Date;
    updatedAt: Date;
}
