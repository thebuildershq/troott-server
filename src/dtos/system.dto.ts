export type LogRequestType = 'warning' | 'success' | 'error' | 'info'

export interface LogRequestDTO {
    type?: LogRequestType,
    label?: string,
    data: any
}
export interface EncryptDataDTO{
    payload: any,
    password: string,
    separator: string
}

export interface DecryptDataDTO{
    payload: any,
    password: string,
    separator: string
}

export interface IPermissionDTO {
    user: string;
    permissions: Array<string>;
    role: string;
  }
