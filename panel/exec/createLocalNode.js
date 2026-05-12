const { db } = require("../handlers/db.js");
const { v4: uuidv4 } = require("uuid");

async function createLocalNode() {
  const nodeId = uuidv4();
  const configureKey = uuidv4();

  const node = {
    id: nodeId,
    name: "Local Node",
    description: "Auto-generated local node",
    address: "localhost",
    port: 3002,
    sftpPort: 2022,
    ftp: {
      ip: "0.0.0.0",
      port: 3003
    },
    location: null,
    category: "Default",
    ram: 0,
    disk: 0,
    memoryOverallocate: 0,
    diskOverallocate: 0,
    uploadSize: 500,
    behindProxy: false,
    connectionProtocol: "http",
    resourceMode: "auto",
    serverFileDirectory: "/var/lib/ksedge/volumes",
    publicIp: "localhost",
    maintenanceMode: false,
    connectionType: "Direct",
    maxServers: 50,
    healthCheckUrl: "",
    tags: [],
    trustedProxies: [],
    apiKey: null,
    configureKey,
    status: "Unconfigured",
    createdAt: Date.now()
  };

  await db.set(`${nodeId}_node`, node);
  const nodes = (await db.get("nodes")) || [];
  nodes.push(nodeId);
  await db.set("nodes", nodes);

  console.log("Node Created Successfully!");
  console.log("Node ID:", nodeId);
  console.log("Configure Key:", configureKey);
  process.exit(0);
}

createLocalNode();
