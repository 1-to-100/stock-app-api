export const Status = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type StatusType = (typeof Status)[keyof typeof Status];

export const StatusList = Object.values(Status) as StatusType[];
