import { Logger } from "./logger.js";
import { McmaTrackerProperties } from "../model/index.js";

export interface LoggerProvider {
    get(requestId?: string, tracker?: McmaTrackerProperties): Promise<Logger>;
}
