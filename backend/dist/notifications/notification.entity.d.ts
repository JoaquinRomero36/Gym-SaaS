import { User } from '../users/user.entity';
import { Gym } from '../gyms/gym.entity';
export declare enum NotificationChannel {
    WHATSAPP = "whatsapp",
    EMAIL = "email",
    IN_APP = "in-app"
}
export declare enum NotificationTrigger {
    INACTIVITY = "inactivity",
    LOW_FEEDBACK = "low_feedback",
    HIGH_RISK = "high_risk",
    MILESTONE = "milestone",
    MANUAL = "manual"
}
export declare enum NotificationStatus {
    PENDING = "pending",
    SENT = "sent",
    FAILED = "failed"
}
export declare class Notification {
    id: string;
    user: User;
    user_id: string;
    gym: Gym;
    gym_id: string;
    channel: NotificationChannel;
    message: string;
    trigger: NotificationTrigger;
    status: NotificationStatus;
    sentAt?: Date;
    createdAt: Date;
}
