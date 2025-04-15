export type SystemModulePermission = {
  name: string;
  label: string;
  order: number;
};

export type SystemModule = {
  name: string;
  label: string;
  enabled?: boolean;
  permissions?: SystemModulePermission[];
};

const USER_MANAGEMENT_MODULE = 'UserManagement';

const permissionWithPrefix = (permission: string, module: string): string => {
  return `${module}:${permission}`;
};

export const SYSTEM_MODULES: SystemModule[] = [
  {
    name: USER_MANAGEMENT_MODULE,
    label: 'User Management',
    enabled: true,
    permissions: [
      {
        name: permissionWithPrefix('viewUsers', USER_MANAGEMENT_MODULE),
        label: 'View Users',
        order: 1,
      },
      {
        name: permissionWithPrefix('viewOwnUsers', USER_MANAGEMENT_MODULE),
        label: 'View Own Users',
        order: 2,
      },
      {
        name: permissionWithPrefix('createUser', USER_MANAGEMENT_MODULE),
        label: 'Create User',
        order: 3,
      },
      {
        name: permissionWithPrefix('createOwnUser', USER_MANAGEMENT_MODULE),
        label: 'Create User (Own)',
        order: 4,
      },
      {
        name: permissionWithPrefix('inviteUser', USER_MANAGEMENT_MODULE),
        label: 'Invite User',
        order: 5,
      },
      {
        name: permissionWithPrefix('inviteUser:own', USER_MANAGEMENT_MODULE),
        label: 'Invite User (Own)',
        order: 6,
      },
      {
        name: permissionWithPrefix('resendInvitation', USER_MANAGEMENT_MODULE),
        label: 'Resend Invitation',
        order: 7,
      },
      {
        name: permissionWithPrefix(
          'resendInvitation:own',
          USER_MANAGEMENT_MODULE,
        ),
        label: 'Resend Invitation (Own)',
        order: 8,
      },
      {
        name: permissionWithPrefix(
          'setInvitationRules',
          USER_MANAGEMENT_MODULE,
        ),
        label: 'Set Invitation Rules',
        order: 9,
      },
      {
        name: permissionWithPrefix(
          'setInvitationRules:own',
          USER_MANAGEMENT_MODULE,
        ),
        label: 'Set Invitation Rules (Own)',
        order: 10,
      },
      {
        name: permissionWithPrefix(
          'createRequestForUserInvite',
          USER_MANAGEMENT_MODULE,
        ),
        label: 'Create Request for User Invite',
        order: 11,
      },
      {
        name: permissionWithPrefix(
          'createRequestForUserInvite:own',
          USER_MANAGEMENT_MODULE,
        ),
        label: 'Create Request for User Invite (Own)',
        order: 12,
      },
      {
        name: permissionWithPrefix('editUser', USER_MANAGEMENT_MODULE),
        label: 'Edit User',
        order: 13,
      },
      {
        name: permissionWithPrefix('editUser:own', USER_MANAGEMENT_MODULE),
        label: 'Edit User (Own)',
        order: 14,
      },
      {
        name: permissionWithPrefix('editUser:self', USER_MANAGEMENT_MODULE),
        label: 'Edit User (Self)',
        order: 14,
      },
      {
        name: permissionWithPrefix('getUser', USER_MANAGEMENT_MODULE),
        label: 'Get User',
        order: 15,
      },
      {
        name: permissionWithPrefix('getUser:own', USER_MANAGEMENT_MODULE),
        label: 'Get User (Own)',
        order: 16,
      },
      {
        name: permissionWithPrefix('getUser:self', USER_MANAGEMENT_MODULE),
        label: 'Get User (Self)',
        order: 17,
      },
      {
        name: permissionWithPrefix('deactivate', USER_MANAGEMENT_MODULE),
        label: 'Deactivate',
        order: 18,
      },
      {
        name: permissionWithPrefix('deactivate:own', USER_MANAGEMENT_MODULE),
        label: 'Deactivate (Own)',
        order: 19,
      },
      {
        name: permissionWithPrefix('impersonate', USER_MANAGEMENT_MODULE),
        label: 'Impersonate',
        order: 20,
      },
      {
        name: permissionWithPrefix('impersonate:own', USER_MANAGEMENT_MODULE),
        label: 'Impersonate (Own)',
        order: 21,
      },
    ],
  },
  {
    name: 'CustomerManagement',
    label: 'Customer Management',
    enabled: true,
    permissions: [
      {
        name: permissionWithPrefix(
          'viewCustomerDashboard',
          'CustomerManagement',
        ),
        label: 'View Customer Dashboard',
        order: 1,
      },
      {
        name: permissionWithPrefix(
          'viewCustomerDashboard:own',
          'CustomerManagement',
        ),
        label: 'View Customer Dashboard (Own)',
        order: 2,
      },
      {
        name: permissionWithPrefix('createCustomer', 'CustomerManagement'),
        label: 'Create Customer',
        order: 3,
      },
      {
        name: permissionWithPrefix('createCustomer:own', 'CustomerManagement'),
        label: 'Create Customer (Own)',
        order: 4,
      },
      {
        name: permissionWithPrefix('editCustomer', 'CustomerManagement'),
        label: 'Edit Customer',
        order: 5,
      },
      {
        name: permissionWithPrefix('editCustomer:own', 'CustomerManagement'),
        label: 'Edit Customer (Own)',
        order: 6,
      },
      {
        name: permissionWithPrefix('getCustomer', 'CustomerManagement'),
        label: 'Get Customer',
        order: 7,
      },
      {
        name: permissionWithPrefix('getCustomer:own', 'CustomerManagement'),
        label: 'Get Customer (Own)',
        order: 8,
      },
      {
        name: permissionWithPrefix('listCustomers', 'CustomerManagement'),
        label: 'List Customers',
        order: 9,
      },
      {
        name: permissionWithPrefix('listCustomers:own', 'CustomerManagement'),
        label: 'List Customers (Own)',
        order: 10,
      },
      {
        name: permissionWithPrefix('deleteCustomer', 'CustomerManagement'),
        label: 'Delete Customer',
        order: 11,
      },
      {
        name: permissionWithPrefix('deleteCustomer:own', 'CustomerManagement'),
        label: 'Delete Customer (Own)',
        order: 12,
      },
    ],
  },
  // { name: 'RoleSettings', label: 'Role Settings', enabled: true },
];
