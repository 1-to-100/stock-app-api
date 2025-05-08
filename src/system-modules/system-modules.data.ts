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
const CUSTOMER_MANAGEMENT_MODULE = 'CustomerManagement';
const ROLE_MANAGEMENT_MODULE = 'RoleManagement';
const DOCUMENTS_MODULE = 'Documents';

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
        name: permissionWithPrefix('createUser', USER_MANAGEMENT_MODULE),
        label: 'Create User',
        order: 2,
      },
      {
        name: permissionWithPrefix('inviteUser', USER_MANAGEMENT_MODULE),
        label: 'Invite User',
        order: 3,
      },
      {
        name: permissionWithPrefix('resendInvitation', USER_MANAGEMENT_MODULE),
        label: 'Resend Invitation',
        order: 4,
      },
      {
        name: permissionWithPrefix(
          'setInvitationRules',
          USER_MANAGEMENT_MODULE,
        ),
        label: 'Set Invitation Rules',
        order: 5,
      },
      {
        name: permissionWithPrefix(
          'createRequestForUserInvite',
          USER_MANAGEMENT_MODULE,
        ),
        label: 'Create Request for User Invite',
        order: 6,
      },
      {
        name: permissionWithPrefix('editUser', USER_MANAGEMENT_MODULE),
        label: 'Edit User',
        order: 7,
      },
      {
        name: permissionWithPrefix('getUser', USER_MANAGEMENT_MODULE),
        label: 'Get User',
        order: 8,
      },
      {
        name: permissionWithPrefix('deactivate', USER_MANAGEMENT_MODULE),
        label: 'Deactivate User',
        order: 9,
      },
      {
        name: permissionWithPrefix('impersonate', USER_MANAGEMENT_MODULE),
        label: 'Impersonate',
        order: 10,
      },
    ],
  },
  {
    name: CUSTOMER_MANAGEMENT_MODULE,
    label: 'Customer Management',
    enabled: true,
    permissions: [
      {
        name: permissionWithPrefix(
          'viewCustomerDashboard',
          CUSTOMER_MANAGEMENT_MODULE,
        ),
        label: 'View Customer Dashboard',
        order: 1,
      },
      {
        name: permissionWithPrefix(
          'createCustomer',
          CUSTOMER_MANAGEMENT_MODULE,
        ),
        label: 'Create Customer',
        order: 2,
      },
      {
        name: permissionWithPrefix('editCustomer', CUSTOMER_MANAGEMENT_MODULE),
        label: 'Edit Customer',
        order: 3,
      },
      {
        name: permissionWithPrefix('getCustomer', CUSTOMER_MANAGEMENT_MODULE),
        label: 'Get Customer',
        order: 4,
      },
      {
        name: permissionWithPrefix('listCustomers', CUSTOMER_MANAGEMENT_MODULE),
        label: 'List Customers',
        order: 5,
      },
      {
        name: permissionWithPrefix(
          'deleteCustomer',
          CUSTOMER_MANAGEMENT_MODULE,
        ),
        label: 'Delete Customer',
        order: 6,
      },
    ],
  },
  {
    name: ROLE_MANAGEMENT_MODULE,
    label: 'Role Management',
    enabled: true,
    permissions: [
      {
        name: permissionWithPrefix('viewRoles', ROLE_MANAGEMENT_MODULE),
        label: 'View Roles',
        order: 1,
      },
      {
        name: permissionWithPrefix('createRoles', ROLE_MANAGEMENT_MODULE),
        label: 'Create Roles',
        order: 2,
      },
      {
        name: permissionWithPrefix('editRoles', ROLE_MANAGEMENT_MODULE),
        label: 'Edit Roles',
        order: 3,
      },
      {
        name: permissionWithPrefix('deleteRoles', ROLE_MANAGEMENT_MODULE),
        label: 'Delete Role',
        order: 4,
      },
    ],
  },
  {
    name: DOCUMENTS_MODULE,
    label: 'Documents',
    enabled: true,
    permissions: [
      {
        name: permissionWithPrefix('viewRoles', DOCUMENTS_MODULE),
        label: 'View Roles',
        order: 1,
      },
      {
        name: permissionWithPrefix('createRoles', DOCUMENTS_MODULE),
        label: 'Create Roles',
        order: 2,
      },
      {
        name: permissionWithPrefix('editRoles', DOCUMENTS_MODULE),
        label: 'Edit Roles',
        order: 3,
      },
      {
        name: permissionWithPrefix('deleteRoles', DOCUMENTS_MODULE),
        label: 'Delete Role',
        order: 4,
      },
    ],
  },
];
