import { AxiosRequestConfig } from "axios";
import { McmaTracker } from "@mcma/core";

export interface HttpRequestConfig extends AxiosRequestConfig {
    tracker?: McmaTracker;
}