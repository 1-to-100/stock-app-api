import { StatusType, StatusList } from 'src/common/constants/status';

export const eachNumberTransformer = ({
  value,
}: {
  value: unknown;
}): number[] => {
  if (Array.isArray(value)) {
    return value.filter((v) => !isNaN(Number(v))).map((v) => Number(v));
  } else if (typeof value === 'string' && !isNaN(Number(value))) {
    return [Number(value)];
  } else if (typeof value === 'number') {
    return [value];
  }
  return [];
};

export const eachStatusTransformer = ({
  value,
}: {
  value: unknown;
}): StatusType[] => {
  if (Array.isArray(value)) {
    return value.filter(
      (v) => typeof v === 'string' && StatusList.includes(v as StatusType),
    ) as StatusType[];
  } else if (
    typeof value === 'string' &&
    StatusList.includes(value as StatusType)
  ) {
    return [value as StatusType];
  }
  return [];
};
