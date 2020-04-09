import { McmaResource } from "@mcma/core";
import { DefaultRouteCollection } from "./default-route-collection";
import { DefaultRouteCollectionBuilder } from "./default-route-collection-builder";
import { DefaultRouteBuilder } from "./default-route-builder";

export class DefaultRouteConfigurator<TResource extends McmaResource, TResult> {
    constructor(
        private builder: DefaultRouteCollectionBuilder<TResource>,
        private routes: DefaultRouteCollection<TResource>,
        private routeBuilder: DefaultRouteBuilder<TResult>
    ) { }

    configure(configureRoute: (defaultRouteBuilder: DefaultRouteBuilder<TResult>) => void): DefaultRouteCollectionBuilder<TResource> {
        if (!this.routes.included.includes(this.routeBuilder)) {
            this.routes.included.push(this.routeBuilder);
        }
        configureRoute(this.routeBuilder);
        return this.builder;
    }

    add(): this {
        if (!this.routes.included.includes(this.routeBuilder)) {
            this.routes.included.push(this.routeBuilder);
        }
        return this;
    }
    
    remove(): this {
        const index = this.routes.included.indexOf(this.routeBuilder);
        if (index >= 0) {
            this.routes.included.splice(index, 1);
        }
        return this;
    }
}
