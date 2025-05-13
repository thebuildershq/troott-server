import { EUserType } from "./enums.util";

export const rolePermissionMap: Record<string, string[]> = {
    [EUserType.SUPERADMIN]: [
      // System Management
      "system:read", "system:update", "system:configure", "system:restart",

      // User Management
      "user:create", "user:read", "user:update", "user:delete", "user:disable",

      // Role & Permission Management
      "role:create", "role:read", "role:update", "role:delete", "role:disable",
      "permission:create", "permission:read", "permission:update", "permission:delete", "permission:disable",

      // Content Management
      "sermon:create", "sermon:read", "sermon:update", "sermon:delete", "sermon:destroy",
      "sermonbite:create", "sermonbite:read", "sermonbite:update", "sermonbite:delete", "sermonbite:destroy",
      "playlist:create", "playlist:read", "playlist:update", "playlist:delete", "playlist:destroy", "playlist:disable",

      // Subscription & Transaction Management
      "subscription:create", "subscription:read", "subscription:update", "subscription:cancel",
      "transaction:create", "transaction:read", "transaction:update", "transaction:refund",
      "plan:create", "plan:read", "plan:update", "plan:delete",

      // API Management
      "apikey:create", "apikey:read", "apikey:update", "apikey:disable", "apikey:delete",

      // Analytics & Revenue
      "analytics:read", "analytics:update", "analytics:export",
      "revenue:read", "revenue:update",

      // Advertisement Management
      "ads:create", "ads:read", "ads:update", "ads:delete"
    ],
    [EUserType.STAFF]: [
      "user:create", "user:read", "user:update", "user:delete", "user:disable",
      "role:create", "role:read", "role:update", "role:delete", "role:disable",
      "permission:create", "permission:read", "permission:update", "permission:delete", "permission:disable",
      "sermon:create", "sermon:read", "sermon:update", "sermon:delete", "sermon:destroy",
      "sermonbite:create", "sermonbite:read", "sermonbite:update", "sermonbite:delete", "sermonbite:destroy",
      "playlist:create", "playlist:read", "playlist:update", "playlist:delete", "playlist:destroy", "playlist:disable",
      "subscription:create", "subscription:read", "subscription:update", "subscription:cancel",
      "transaction:create", "transaction:read", "transaction:update", "transaction:refund",
      "plan:create", "plan:read", "plan:update", "plan:delete",
      "apikey:create", "apikey:read", "apikey:update", "apikey:disable", "apikey:delete",
      "analytics:read", "analytics:update", "analytics:export",
      "revenue:read", "revenue:update",
      "ads:create", "ads:read", "ads:update", "ads:delete"
    ],
    [EUserType.PREACHER]: [
      "sermon:create", "sermon:read", "sermon:update", "sermon:delete", "sermon:destroy",
      "sermonbite:create", "sermonbite:read", "sermonbite:update", "sermonbite:delete", "sermonbite:destroy",
      "playlist:create", "playlist:read", "playlist:update", "playlist:delete", "playlist:destroy", "playlist:disable",
      "analytics:read", "analytics:export",
      "user:read", "user:update"
    ],
    [EUserType.CREATOR]: [
      "sermonbite:create", "sermonbite:read", "sermonbite:update", "sermonbite:delete",
      "playlist:create", "playlist:read", "playlist:update", "playlist:delete", "playlist:destroy",
      "analytics:read", "analytics:export",
      "user:read", "user:update",
      "sermon:read", "sermonbite:read"
    ],
    [EUserType.LISTENER]: [
      "user:read", "user:update",
      "sermon:read", "sermonbite:read",
      "playlist:create", "playlist:read", "playlist:update", "playlist:delete"
    ],
    [EUserType.USER]: [
      "user:read",
      "sermon:read",
      "sermonbite:read"
    ]
  }