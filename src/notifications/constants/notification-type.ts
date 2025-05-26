export const NotificationType = {
  EMAIL: 'EMAIL',
  IN_APP: 'IN_APP',
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationTypeList = Object.values(
  NotificationType,
) as NotificationType[];
