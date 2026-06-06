import { SetMetadata } from '@nestjs/common';

export interface RequiredPermission {
    function: string;
    permission: string;
}

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermission = (functionName: string, permission: string) =>
    SetMetadata(PERMISSIONS_KEY, { function: functionName, permission } as RequiredPermission);
