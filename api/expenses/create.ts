import { db } from "../../lib/firebaseAdmin";
import { verifyToken } from "../../lib/authMiddleware";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const user = await verifyToken(req);

    const { date, description, value } = req.body;

    const doc = await db.collection("expenses").add({
      userId: user.uid,
      date,
      description,
      value: Number(value),
      createdAt: new Date(),
    });

    res.status(200).json({ id: doc.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
