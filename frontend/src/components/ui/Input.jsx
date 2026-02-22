export default function Input(props) {
  return (
    <input
      className="
        w-full rounded-md border border-slate-300
        px-3 py-2 text-sm
        focus:outline-none focus:ring-2 focus:ring-primary
      "
      {...props}
    />
  );
}