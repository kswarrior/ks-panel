import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth';
import { User } from '@/types';

const nodeSchema = z.object({
  name: z.string().min(1, "Node name is required"),
  address: z.string().min(1, "Node address is required"),
  port: z.number().int().positive("Port must be a positive integer"),
  sftpPort: z.number().int().positive().optional().default(2022),
  resourceMode: z.enum(['auto', 'manual']),
  ram: z.number().nonnegative().optional().default(0),
  disk: z.number().nonnegative().optional().default(0),
  connectionType: z.string().optional().default("Direct"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users: User[] = await db.get("users") || [];
  const user = users.find(u => u.userId === session.user?.id);

  if (!user || (!user.admin && !user.owner)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = nodeSchema.parse(body);

    const nodeId = uuidv4();
    const configureKey = uuidv4();
    const isTunnel = data.connectionType === "Tunnel" || data.connectionType === "KS Smart";

    const node = {
      id: nodeId,
      name: data.name.trim(),
      description: "",
      address: data.address.trim(),
      port: data.port,
      sftpPort: data.sftpPort,
      ftp: {
        ip: "0.0.0.0",
        port: 3003
      },
      location: null,
      category: "Default",
      ram: data.ram,
      disk: data.disk,
      memoryOverallocate: 0,
      diskOverallocate: 0,
      uploadSize: 500,
      behindProxy: isTunnel,
      connectionProtocol: isTunnel ? "https" : "http",
      resourceMode: data.resourceMode,
      serverFileDirectory: "/var/lib/kswings/volumes",
      publicIp: data.address.trim(),
      maintenanceMode: false,
      connectionType: data.connectionType,
      maxServers: 50,
      healthCheckUrl: "",
      tags: [],
      trustedProxies: isTunnel ? ["127.0.0.1"] : [],
      apiKey: null,
      configureKey,
      status: "Unconfigured",
      createdAt: Date.now()
    };

    await db.set(`${nodeId}_node`, node);
    const nodes = (await db.get("nodes")) || [];
    nodes.push(nodeId);
    await db.set("nodes", nodes);

    return NextResponse.json(node, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const nodeIds = (await db.get("nodes")) || [];
  const nodes = await Promise.all(nodeIds.map((id: string) => db.get(`${id}_node`)));
  return NextResponse.json(nodes.filter(Boolean));
}
