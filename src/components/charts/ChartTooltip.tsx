import React from 'react';

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string; dataKey?: string }>;
  label?: string | number;
  valueSuffix?: string;
}

/** Shared tooltip styling for Recharts across Performance dashboards. */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  valueSuffix = ''
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="pms-chart-tooltip">
      {label != null && label !== '' && <div className="pms-chart-tooltip-label">{label}</div>}
      {payload.map((entry, idx) => (
        <div key={idx} className="pms-chart-tooltip-row">
          <span className="pms-chart-tooltip-swatch" style={{ background: entry.color }} />
          <span>{entry.name ?? entry.dataKey}</span>
          <strong>
            {entry.value}
            {valueSuffix}
          </strong>
        </div>
      ))}
    </div>
  );
};
