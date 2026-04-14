import { db } from "../../lib/firebaseAdmin.js";
import { verifyToken } from "../../lib/authMiddleware.js";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  try {
    const user = await verifyToken(req);
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    await db.collection("expenses").doc(id).delete();

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}
