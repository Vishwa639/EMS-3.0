export default function Card({ children }) {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200">
      {children}
    </div>
  );
}