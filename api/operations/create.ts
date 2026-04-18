import { db } from "../../lib/firebaseAdmin.js";
import { verifyToken } from "../../lib/authMiddleware.js";

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
      casaC,
      oddA,
      oddB,
      oddC,
      apostaA,
      apostaB,
      apostaC,
      notes,
    } = req.body;

    const apostaTotal = apostaA + apostaB + (Number(apostaC) || 0);

    const retornoA = apostaA * oddA;
    const retornoB = apostaB * oddB;
    const retornoC = (Number(apostaC) || 0) * (Number(oddC) || 0);

    const lucroA = retornoA - apostaTotal;
    const lucroB = retornoB - apostaTotal;
    
    let maxLucro = Math.max(lucroA, lucroB);
    if ((Number(apostaC) || 0) > 0) {
      const lucroC = retornoC - apostaTotal;
      maxLucro = Math.max(maxLucro, lucroC);
    }

    const roi = (maxLucro / apostaTotal) * 100;

    const doc = await db.collection("operations").add({
      userId: user.uid,
      date,
      time,
      event,
      casaA,
      casaB,
      casaC: casaC || "",
      oddA,
      oddB,
      oddC: oddC || 0,
      apostaA,
      apostaB,
      apostaC: apostaC || 0,
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
