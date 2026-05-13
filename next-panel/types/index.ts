export interface User {
  userId: string;
  username: string;
  email: string;
  password?: string;
  admin: boolean;
  owner: boolean;
  verified: boolean;
  roleId: string | null;
  accessTo: string[];
  permissions: Record<string, any>;
  image?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Node {
  id: string;
  name: string;
  address: string;
  port: number;
  key: string;
  status?: 'online' | 'offline';
}

export interface Instance {
  id: string;
  name: string;
  nodeId: string;
  userId: string;
  templateId: string;
  status: string;
  memory: number;
  cpu: number;
  disk: number;
  port: number;
  // Support legacy fields from KS Panel
  Id?: string;
  Name?: string;
  Node?: any;
  Allocation?: any;
  InternalState?: string;
}

export interface AuditLog {
  userId: string;
  username: string;
  action: string;
  ip: string;
  timestamp: string;
}
