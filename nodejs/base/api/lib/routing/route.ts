import * as uriTemplates from "uri-templates";
import { McmaApiRouteHandler } from "./route-handler";

declare module "uri-templates" {
    interface URITemplate {
        test(url: string, opts?: { [key: string]: any }): boolean;
        fromUri(url: string, opts?: { [key: string]: any }): { [key: string]: string };
    }
}

export class McmaApiRoute {
    template: uriTemplates.URITemplate;

    constructor(public httpMethod: string, public path: string, public handler: McmaApiRouteHandler) {
        this.path = this.path || "";
        if (!this.path.startsWith("/")) {
            this.path = "/" + this.path;
        }

        this.template = uriTemplates(path);
    }
}
