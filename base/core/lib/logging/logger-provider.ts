import { Logger } from "./logger";
import { McmaTrackerProperties } from "../model";

export interface LoggerProvider {
    get(requestId?: string, tracker?: McmaTrackerProperties): Promise<Logger>;
}
