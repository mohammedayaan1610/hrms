export default function Table({
  headers = [],
  children,
  className = "",
}) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 bg-white ${className}`}>
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50/80">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                scope="col"
                className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
      </table>
    </div>
  );
}
