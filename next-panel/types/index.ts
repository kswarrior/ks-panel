export interface User {
  userId: string;
  username: string;
  email: string;
  password?: string;
  accessTo: string[];
  admin: boolean;
  verified: boolean;
  roleId: string | null;
  owner: boolean;
  permissions: Record<string, any>;
}

export interface Node {
  id: string;
  name: string;
  description: string;
  address: string;
  port: number;
  sftpPort: number;
  ftp: {
    ip: string;
    port: number;
  };
  location: string | null;
  category: string;
  ram: number;
  disk: number;
  memoryOverallocate: number;
  diskOverallocate: number;
  uploadSize: number;
  behindProxy: boolean;
  connectionProtocol: "http" | "https";
  resourceMode: "auto" | "manual";
  serverFileDirectory: string;
  publicIp: string;
  maintenanceMode: boolean;
  connectionType: string;
  maxServers: number;
  healthCheckUrl: string;
  tags: string[];
  trustedProxies: string[];
  apiKey: string | null;
  configureKey: string;
  status: string;
  createdAt: number;
}

export interface Instance {
  Name: string;
  Id: string;
  Node: Node;
  User: string;
  InternalState: string;
  ContainerId: string;
  VolumeId: string;
  Memory: number;
  Cpu: number;
  Disk: number;
  Allocation: {
    IP: string;
    Port: number;
  };
  expiresAt: string;
  suspended?: boolean;
  suspendedFlag?: string;
}

export interface Settings {
  name: string;
  logo: string;
  footer: string;
  defaultSlots: number;
  defaultRam: number;
  defaultCpu: number;
  defaultDisk: number;
}
