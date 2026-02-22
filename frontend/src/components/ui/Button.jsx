export default function Button({
  children,
  variant = "primary",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-indigo-700",
    outline:
      "border border-slate-300 text-slate-700 hover:bg-slate-100",
  };

  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}