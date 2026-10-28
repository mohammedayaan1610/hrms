import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";

export default function EmployeeTable({
  employees = [],
  onViewEmployee = null,
  emptyMessage = "No employees found matching the criteria.",
}) {
  if (!employees || employees.length === 0) {
    return <EmptyState title="No employees found" description={emptyMessage} />;
  }

  const headers = [
    "Employee",
    "Employee ID",
    "Department",
    "Designation",
    "Leave Balance",
    "Status",
    "Actions",
  ];

  return (
    <div>
      {/* Desktop & Tablet Table */}
      <div className="hidden md:block">
        <Table headers={headers}>
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-5 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  {emp.avatar ? (
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-slate-700">
                      {emp.name?.charAt(0) || "E"}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-slate-900 block text-sm">
                      {emp.name}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      {emp.email}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap font-mono text-xs font-medium text-slate-700">
                {emp.id}
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-700">
                {emp.department}
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">
                {emp.designation}
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 text-sm">
                    {emp.leaveBalance?.totalRemaining ?? 15}
                  </span>
                  <span className="text-xs text-slate-400">/ 15 days</span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  C:{emp.leaveBalance?.casual ?? 5} S:{emp.leaveBalance?.sick ?? 5} M:{emp.leaveBalance?.medical ?? 5}
                </span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <Badge
                  variant={emp.status === "Active" ? "success" : "neutral"}
                  size="sm"
                  dot
                >
                  {emp.status}
                </Badge>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                {onViewEmployee && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewEmployee(emp)}
                  >
                    View Details
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {emp.avatar ? (
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-sm flex items-center justify-center border border-slate-700">
                    {emp.name?.charAt(0) || "E"}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">{emp.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">{emp.id} • {emp.department}</p>
                </div>
              </div>
              <Badge
                variant={emp.status === "Active" ? "success" : "neutral"}
                size="sm"
                dot
              >
                {emp.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block">Designation</span>
                <span className="font-medium text-slate-700">{emp.designation}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Leave Balance</span>
                <span className="font-semibold text-slate-900">
                  {emp.leaveBalance?.totalRemaining ?? 15} / 15 days
                </span>
              </div>
            </div>

            {onViewEmployee && (
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => onViewEmployee(emp)}
                >
                  View Details
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
