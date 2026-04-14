import { db } from "../../lib/firebaseAdmin";
import { verifyToken } from "../../lib/authMiddleware";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  try {
    const user = await verifyToken(req);
    const { id } = req.body;

    const doc = await db.collection("operations").doc(id).get();

    if (doc.data()?.userId !== user.uid) {
      return res.status(403).json({ error: "Não autorizado" });
    }

    await db.collection("operations").doc(id).delete();

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
