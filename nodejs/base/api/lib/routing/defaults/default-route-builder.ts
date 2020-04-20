import { McmaApiRoute } from "../route";
import { McmaApiRouteHandler } from "../route-handler";
import { DefaultRouteHandlerConfigurator } from "./default-route-handler-configurator";
import { RouteStartedHandler } from "./route-started-handler";
import { RouteCompletedHandler } from "./route-completed-handler";
import { DefaultRouteBuilderType } from "./default-route-builder-type";

export class DefaultRouteBuilder<T> implements DefaultRouteBuilderType {
    private handler: McmaApiRouteHandler = null;
    
    constructor(private httpMethod: string, private path: string, private defaultRouteHandlerConfigurator: DefaultRouteHandlerConfigurator<T>) {}

    overrideHandler(handler: McmaApiRouteHandler): this {
        this.handler = handler;
        return this;
    }

    onStarted(handleOnStarted: RouteStartedHandler): this {
        this.defaultRouteHandlerConfigurator.onStarted = handleOnStarted;
        return this;
    }

    onCompleted(handleOnCompleted: RouteCompletedHandler<T>): this {
        this.defaultRouteHandlerConfigurator.onCompleted = handleOnCompleted;
        return this;
    }

    build(): McmaApiRoute {
        return new McmaApiRoute(this.httpMethod, this.path, this.handler ?? this.defaultRouteHandlerConfigurator.create());
    }
}