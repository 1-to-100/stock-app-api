export type SystemModule = {
  name: string;
  label: string;
  enabled?: boolean;
};

export const SYSTEM_MODULES: SystemModule[] = [
  { name: 'UserManagement', label: 'User Management', enabled: true },
  { name: 'CustomerManagement', label: 'Customer Management', enabled: true },
  { name: 'RoleSettings', label: 'Role Settings', enabled: true },
];
