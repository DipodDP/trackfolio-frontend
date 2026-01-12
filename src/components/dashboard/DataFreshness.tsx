"use client";

interface DataFreshnessProps {
  lastUpdated?: Date | string | null;
  isStale?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function formatTimestamp(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

export function DataFreshness({
  lastUpdated,
  isStale = false,
  onRefresh,
  isRefreshing = false,
}: DataFreshnessProps) {
  return (
    <footer className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-secondary-text">
      <div className="flex items-center">
        Last updated:{" "}
        {lastUpdated ? `[${formatTimestamp(lastUpdated)}]` : "Never"}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="ml-2 inline-flex items-center hover:text-primary-text transition-colors disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-sm mr-1 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            >
              refresh
            </span>
            Refresh
          </button>
        )}
      </div>

      {isStale && (
        <div className="flex items-center text-warning">
          <span className="material-symbols-outlined text-base mr-1">warning</span>
          Stale data: Data is over 5 minutes old
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="ml-2 inline-flex items-center text-secondary-text hover:text-primary-text transition-colors disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-sm mr-1 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              >
                refresh
              </span>
              Refresh
            </button>
          )}
        </div>
      )}
    </footer>
  );
}

export default DataFreshness;
