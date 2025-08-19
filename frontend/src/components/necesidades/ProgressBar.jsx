// src/components/necesidades/ProgressBar.jsx
export default function ProgressBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-[6px] rounded-full bg-[#EFE9FD] overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background:
            "linear-gradient(90deg, #A855F7 0%, #8B5CF6 100%)",
        }}
      />
    </div>
  );
}
