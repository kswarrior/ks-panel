import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { auth } from '@/lib/auth';

const createInstanceSchema = z.object({
  name: z.string().min(1, "Instance name is required"),
  template: z.string().min(1, "Template is required"),
  nodeId: z.string().min(1, "Node ID is required"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { name, template: templateFile, nodeId } = createInstanceSchema.parse(body);

    const settings = (await db.get("settings")) || {};
    const userInstances = (await db.get(`${userId}_instances`)) || [];

    const defaultSlots = settings.defaultSlots || 3;

    if (userInstances.length >= defaultSlots) {
      return NextResponse.json({ error: "No slots available. You have reached your limit." }, { status: 400 });
    }

    const node = await db.get(`${nodeId}_node`);
    if (!node || node.status !== "Online") {
      return NextResponse.json({ error: "The selected node is currently unavailable or offline." }, { status: 400 });
    }

    const TEMPLATES_DIR = path.join(process.cwd(), "../panel/database/templates");
    const templatePath = path.join(TEMPLATES_DIR, templateFile, "main.json");

    if (!fs.existsSync(templatePath)) {
        return NextResponse.json({ error: "Template configuration not found." }, { status: 404 });
    }

    const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));

    const allocations = (await db.get(`${nodeId}_allocations`)) || [];
    const alloc = allocations.find((a: any) => !a.assignedTo);
    if (!alloc) {
      return NextResponse.json({ error: "No available ports on this node. Please contact an administrator." }, { status: 400 });
    }

    const Id = uuidv4().split("-")[0];

    const memory = settings.defaultRam || 1024;
    const cpu = settings.defaultCpu || 100;
    const disk = settings.defaultDisk || 5120;

    const wingsPayload = {
      Id, Name: name, InstanceType: 'docker',
      Image: template.environment?.docker_image || "ghcr.io/parkervcp/yolks:debian",
      Memory: memory, Cpu: cpu, Disk: disk,
      ExposedPorts: { [`${alloc.port}/tcp`]: {} },
      PortBindings: { [`${alloc.port}/tcp`]: [{ HostIp: alloc.ip, HostPort: alloc.port }] },
      Env: [`PRIMARY_PORT=${alloc.port}`]
    };

    // Forwarding to wings daemon
    await axios.post(`http://${node.address}:${node.port}/instances/create`, wingsPayload, {
      auth: { username: "kspanel", password: node.apiKey },
      timeout: 30000
    });

    const instanceData = {
      Name: name, Id, Node: node, User: userId,
      InternalState: "STOPPED", ContainerId: Id, VolumeId: Id,
      Memory: memory, Cpu: cpu, Disk: disk,
      Allocation: { IP: alloc.ip, Port: alloc.port },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    alloc.assignedTo = Id;
    await db.set(`${nodeId}_allocations`, allocations);

    userInstances.push(instanceData);
    await db.set(`${userId}_instances`, userInstances);

    const globalInstances = (await db.get("instances")) || [];
    globalInstances.push(instanceData);
    await db.set("instances", globalInstances);

    await db.set(`${Id}_instance`, instanceData);

    return NextResponse.json({ success: true, id: Id });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    console.error("Instance creation error:", err);
    return NextResponse.json({ error: err.message || "An unexpected error occurred during instance creation." }, { status: 500 });
  }
}

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const userInstances = (await db.get(`${userId}_instances`)) || [];
    return NextResponse.json(userInstances);
}
