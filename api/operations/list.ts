import { db } from "../../lib/firebaseAdmin";
import { verifyToken } from "../../lib/authMiddleware";

export default async function handler(req, res) {
  try {
    const user = await verifyToken(req);

    const snapshot = await db
      .collection("operations")
      .where("userId", "==", user.uid)
      .orderBy("date", "desc")
      .get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(data);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}
