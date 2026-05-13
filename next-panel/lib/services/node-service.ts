import { db } from "../db";
import { Node } from "../../types";

export class NodeService {
  static async getNodes(): Promise<Node[]> {
    const nodeIds = (await db.get("nodes")) || [];
    const nodes = await Promise.all(
      nodeIds.map(async (id: string) => await db.get(`${id}_node`))
    );
    return nodes.filter(Boolean);
  }

  static async getNodeById(id: string): Promise<Node | undefined> {
    return await db.get(`${id}_node`);
  }

  static async saveNode(node: Node): Promise<void> {
    await db.set(`${node.id}_node`, node);
    const nodeIds = (await db.get("nodes")) || [];
    if (!nodeIds.includes(node.id)) {
      nodeIds.push(node.id);
      await db.set("nodes", nodeIds);
    }
  }
}
