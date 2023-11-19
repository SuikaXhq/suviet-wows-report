/**
 * API接口返回JSON的类型定义
 */
export interface APIResponse<T> {
    status: string;
    data?: T;
    error?: string;
}
