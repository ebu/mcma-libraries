export class McmaApiResponse {
    public statusCode = 0;
    public errorMessage: string = null;
    public headers: {
        [key: string]: string;
    } = {};
    public body: any;
}
