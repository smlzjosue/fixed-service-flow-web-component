export interface HttpRequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    body?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
    isFormData?: boolean;
}
export interface HttpResponse<T = unknown> {
    data: T;
    status: number;
    ok: boolean;
}
export declare class HttpError extends Error {
    status: number;
    response?: unknown;
    constructor(message: string, status: number, response?: unknown);
}
export declare class HttpService {
    private baseUrl;
    private defaultTimeout;
    setBaseUrl(url: string): void;
    getBaseUrl(): string;
    setTimeout(timeout: number): void;
    private getHeaders;
    request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
    get<T>(endpoint: string, headers?: Record<string, string>): Promise<T>;
    post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T>;
    postFormData<T>(endpoint: string, formData: FormData, headers?: Record<string, string>): Promise<T>;
    put<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T>;
    delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T>;
}
export declare const httpService: HttpService;
export default httpService;
