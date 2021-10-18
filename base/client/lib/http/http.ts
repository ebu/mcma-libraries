import { HttpRequestConfig } from ".";
import { AxiosResponse } from "axios";

export interface Http {
    get<T extends any>(urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>>;

    post<T extends any>(body: T, urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>>;

    put<T extends any>(body: T, urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>>;

    patch<T extends any>(body: Partial<T>, urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>>;

    delete<T extends any>(urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>>;
}
