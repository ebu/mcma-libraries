export class McmaApiResponse {
    public statusCode = 0;
    public statusMessage: string = null;
    public headers: {
        [key: string]: string;
    } = {};
    public body: any;
}
