import { Logger } from "./logger";
import { McmaTrackerProperties } from "../model/mcma-tracker";

export interface LoggerProvider {
    get(tracker?: McmaTrackerProperties): Logger;
}