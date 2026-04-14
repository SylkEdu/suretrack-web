import { db } from "../../lib/firebaseAdmin";
import { verifyToken } from "../../lib/authMiddleware";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const user = await verifyToken(req);

    const {
      date,
      time,
      event,
      casaA,
      casaB,
      oddA,
      oddB,
      apostaA,
      apostaB,
      notes,
    } = req.body;

    const apostaTotal = apostaA + apostaB;

    const retornoA = apostaA * oddA;
    const retornoB = apostaB * oddB;

    const lucroA = retornoA - apostaTotal;
    const lucroB = retornoB - apostaTotal;

    const roi = (Math.max(lucroA, lucroB) / apostaTotal) * 100;

    const doc = await db.collection("operations").add({
      userId: user.uid,
      date,
      time,
      event,
      casaA,
      casaB,
      oddA,
      oddB,
      apostaA,
      apostaB,
      apostaTotal,
      lucroA,
      lucroB,
      roi,
      notes: notes || "",
      createdAt: new Date(),
    });

    res.status(200).json({ id: doc.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
