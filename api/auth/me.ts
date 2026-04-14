import { db } from "../../lib/firebaseAdmin";
import { verifyToken } from "../../lib/authMiddleware";

export default async function handler(req, res) {
  try {
    const user = await verifyToken(req);

    const doc = await db.collection("users").doc(user.uid).get();

    res.status(200).json(doc.data());
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}
