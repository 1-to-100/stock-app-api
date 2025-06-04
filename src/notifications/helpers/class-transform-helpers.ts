import { NotificationChannel } from '../constants/notification-channel';
import { NotificationType } from '../constants/notification-types';

export const eachNotificationTypeTransformer = ({
  value,
}: {
  value: unknown;
}): NotificationType[] => {
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === 'string') as NotificationType[];
  } else if (typeof value === 'string') {
    return [value as NotificationType];
  }
  return [];
};

export const eachNotificationChannelTransformer = ({
  value,
}: {
  value: unknown;
}): NotificationChannel[] => {
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === 'string') as NotificationChannel[];
  } else if (typeof value === 'string') {
    return [value as NotificationChannel];
  }
  return [];
};
