export default function Card({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow">
      <p className="text-gray-400">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}
