import { McmaApiController, McmaApiRouteCollection } from "@mcma/api";

export class AzureFunctionApiController {
    private apiController: McmaApiController;

    constructor(routes: McmaApiRouteCollection) {
        this.apiController = new McmaApiController(routes);
    }
}