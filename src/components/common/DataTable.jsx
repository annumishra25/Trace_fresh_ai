import React from "react";
import EmptyState from "./EmptyState";

export function DataTable({
  columns = [],
  data = [],
  keyField = "id",
  onRowClick,
  emptyMessage = "No data records available",
  className = ""
}) {
  if (!data || data.length === 0) {
    return <EmptyState description={emptyMessage} />;
  }

  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">
            {columns.map((col, idx) => (
              <th key={col.key || idx} className={`py-3.5 px-4 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
          {data.map((row, rowIndex) => (
            <tr
              key={row[keyField] || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-blue-50/40" : "hover:bg-slate-50/60"}`}
            >
              {columns.map((col, colIndex) => (
                <td key={col.key || colIndex} className={`py-3 px-4 ${col.cellClassName || ""}`}>
                  {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
