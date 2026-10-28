import Table from "@/components/ui/Table";
import LeaveStatusBadge from "./LeaveStatusBadge";
import EmptyState from "@/components/ui/EmptyState";

export default function LeaveRequestTable({
  requests = [],
  showReason = true,
  showAppliedOn = true,
  onRowClick = null,
  emptyMessage = "No leave requests found.",
}) {
  if (!requests || requests.length === 0) {
    return <EmptyState title="No leave requests" description={emptyMessage} />;
  }

  const headers = [
    "Leave Type",
    "Start Date",
    "End Date",
    "Duration",
    ...(showReason ? ["Reason"] : []),
    "Status",
    ...(showAppliedOn ? ["Applied On"] : []),
  ];

  return (
    <div>
      {/* Desktop & Tablet Table */}
      <div className="hidden sm:block">
        <Table headers={headers}>
          {requests.map((req) => (
            <tr
              key={req.id}
              onClick={() => onRowClick && onRowClick(req)}
              className={`hover:bg-slate-50/80 transition-colors ${
                onRowClick ? "cursor-pointer" : ""
              }`}
            >
              <td className="px-5 py-3.5 whitespace-nowrap">
                <span className="font-medium text-slate-900">{req.leaveType}</span>
                <span className="block text-xs text-slate-400 sm:hidden">
                  {req.id}
                </span>
              </td>
              <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-mono text-xs">
                {req.startDate}
              </td>
              <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-mono text-xs">
                {req.endDate}
              </td>
              <td className="px-5 py-3.5 whitespace-nowrap text-slate-700 font-medium text-xs">
                {req.days} {req.days === 1 ? "day" : "days"}
              </td>
              {showReason && (
                <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate text-xs">
                  {req.reason}
                </td>
              )}
              <td className="px-5 py-3.5 whitespace-nowrap">
                <LeaveStatusBadge status={req.status} size="sm" />
              </td>
              {showAppliedOn && (
                <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 font-mono text-xs">
                  {req.appliedOn}
                </td>
              )}
            </tr>
          ))}
        </Table>
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden space-y-3">
        {requests.map((req) => (
          <div
            key={req.id}
            onClick={() => onRowClick && onRowClick(req)}
            className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-900">
                {req.leaveType}
              </span>
              <LeaveStatusBadge status={req.status} size="sm" />
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Duration:</span>
                <span className="font-medium text-slate-800">
                  {req.startDate} → {req.endDate} ({req.days} {req.days === 1 ? "day" : "days"})
                </span>
              </div>
              {showReason && (
                <div className="py-1">
                  <span className="text-slate-500 block mb-0.5">Reason:</span>
                  <p className="text-slate-700 italic text-xs line-clamp-2">
                    "{req.reason}"
                  </p>
                </div>
              )}
              {showAppliedOn && (
                <div className="flex justify-between pt-1 text-slate-400 text-[11px]">
                  <span>Ref: {req.id}</span>
                  <span>Applied: {req.appliedOn}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
