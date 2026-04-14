import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { apiFetch } from "../lib/api";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const res = await apiFetch("/api/dashboard/summary", token);
      setData(res);
    }

    load();
  }, []);

  if (!data) return <p className="p-4 text-center">Carregando...</p>;

  return (
    <div>
      <Navbar />

      <div className="p-6 grid grid-cols-3 gap-4">
        <Card title="Banca Inicial" value={data.bancaInicial} />
        <Card title="Banca Atual" value={data.bancaAtual} />
        <Card title="Lucro" value={data.totalLucro} />
        <Card title="Gastos" value={data.totalGastos} />
        <Card title="Saldo" value={data.saldoLiquido} />
        <Card title="Lucro Médio" value={data.lucroMedio} />
      </div>
    </div>
  );
}
