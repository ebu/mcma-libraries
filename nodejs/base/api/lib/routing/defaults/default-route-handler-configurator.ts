import { McmaApiRouteHandler } from "../route-handler";
import { RouteStartedHandler } from "./route-started-handler";
import { RouteCompletedHandler } from "./route-completed-handler";
import { DefaultRouteHandlerBuilder } from "./default-route-handler-builder";

export class DefaultRouteHandlerConfigurator<T> {
    onStarted: RouteStartedHandler;
    onCompleted: RouteCompletedHandler<T>;
    
    constructor(private handlerBuilder: DefaultRouteHandlerBuilder<T>) { }

    create(): McmaApiRouteHandler {
        return this.handlerBuilder(this.onStarted, this.onCompleted);
    }
}
