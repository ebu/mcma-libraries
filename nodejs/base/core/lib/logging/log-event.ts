export interface LogEvent {
    timestamp: Date;
    level: number;
    type: string;
    trackerId?: string;
    trackerLabel?: string;
    source?: string;
    message?: string;
    args?: any[];
}