"use client";

import { BUDGET_FILTER_OPTIONS, type BudgetFilterId } from "@/lib/budgetFilters";

interface JobBudgetFilterProps {
  value: BudgetFilterId;
  onChange: (value: BudgetFilterId) => void;
  disabled?: boolean;
}

export function JobBudgetFilter({ value, onChange, disabled }: JobBudgetFilterProps) {
  const fixedOptions = BUDGET_FILTER_OPTIONS.filter((o) => o.group === "fixed");

  return (
    <div className="workana-panel mb-4 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold" style={{ color: "var(--workana-navy)" }}>
          Filter by budget
        </h3>
        {value !== "all" && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange("all")}
            className="text-xs font-medium hover:underline disabled:opacity-50"
            style={{ color: "var(--accent)" }}
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="All budgets"
          active={value === "all"}
          disabled={disabled}
          onClick={() => onChange("all")}
        />
        <FilterChip
          label="Hourly budget"
          active={value === "hourly"}
          disabled={disabled}
          onClick={() => onChange("hourly")}
        />
      </div>

      <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        Fixed budget (USD)
      </p>
      <div className="flex flex-wrap gap-2">
        {fixedOptions.map((option) => (
          <FilterChip
            key={option.id}
            label={option.label}
            active={value === option.id}
            disabled={disabled}
            onClick={() => onChange(option.id)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm ${
        active ? "shadow-sm" : "hover:border-[var(--accent)]"
      }`}
      style={
        active
          ? {
              background: "var(--accent)",
              borderColor: "var(--accent)",
              color: "#fff",
            }
          : {
              background: "#fff",
              borderColor: "var(--header-border)",
              color: "var(--workana-navy)",
            }
      }
    >
      {label}
    </button>
  );
}
