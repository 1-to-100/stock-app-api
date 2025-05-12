export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];

export const UserStatusList = Object.values(UserStatus) as UserStatusType[];
