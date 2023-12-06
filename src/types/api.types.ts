/**
 * API接口返回JSON的类型定义
 */
export interface APIResponseSuccess<T> {
    status: 'success';
    data: T;
}

export interface APIResponseError {
    status: 'failed';
    error: string;
}
export type APIResponse<T> = APIResponseSuccess<T> | APIResponseError;
