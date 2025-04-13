export type FirebaseDecodedToken = {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  role?: string;
  permissions?: string[];
  [key: string]: any;
};
