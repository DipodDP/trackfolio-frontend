"use client";

interface AllocationSegment {
  label: string;
  value: number;
  color: string;
}

interface AllocationBarProps {
  label: string;
  segments: AllocationSegment[];
}

export function AllocationBar({ label, segments }: AllocationBarProps) {
  return (
    <div className="flex items-center space-x-4">
      <span className="w-32 text-sm text-secondary-text">{label}</span>
      <div className="flex-1 flex h-6 rounded overflow-hidden bg-background-dark">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`${segment.color} flex items-center justify-end pr-2 text-xs font-medium ${
              segment.color.includes("300") ? "text-zinc-800" : "text-white"
            }`}
            style={{ width: `${segment.value}%` }}
          >
            {segment.value}%
          </div>
        ))}
      </div>
    </div>
  );
}

interface AllocationLegendProps {
  items: { label: string; color: string }[];
}

export function AllocationLegend({ items }: AllocationLegendProps) {
  return (
    <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-secondary-text">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <span className={`w-3 h-3 ${item.color} mr-2 rounded-sm`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

export default AllocationBar;
