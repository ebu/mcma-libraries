import { McmaApiRouteHandler } from "../route-handler";
import { RouteStartedHandler } from "./route-started-handler";
import { RouteCompletedHandler } from "./route-completed-handler";

export type DefaultRouteHandlerBuilder<T> = (onStarted?: RouteStartedHandler, onCompleted?: RouteCompletedHandler<T>) => McmaApiRouteHandler;
