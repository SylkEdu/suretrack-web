import { db } from "../../lib/firebaseAdmin";
import { verifyToken } from "../../lib/authMiddleware";

export default async function handler(req, res) {
  try {
    const user = await verifyToken(req);

    const userDoc = await db.collection("users").doc(user.uid).get();
    const bancaInicial = userDoc.data()?.bancaInicial || 0;

    const operationsSnap = await db
      .collection("operations")
      .where("userId", "==", user.uid)
      .get();

    const expensesSnap = await db
      .collection("expenses")
      .where("userId", "==", user.uid)
      .get();

    let totalLucro = 0;
    let totalOperacoes = 0;

    operationsSnap.forEach(doc => {
      const data = doc.data();
      totalLucro += Math.max(data.lucroA, data.lucroB);
      totalOperacoes++;
    });

    let totalGastos = 0;

    expensesSnap.forEach(doc => {
      totalGastos += doc.data().value;
    });

    const bancaAtual = bancaInicial + totalLucro - totalGastos;
    const saldoLiquido = totalLucro - totalGastos;
    const lucroMedio =
      totalOperacoes > 0 ? totalLucro / totalOperacoes : 0;

    res.status(200).json({
      bancaInicial,
      bancaAtual,
      totalLucro,
      totalGastos,
      saldoLiquido,
      lucroMedio,
      totalOperacoes,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}
