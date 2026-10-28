import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function EmployeeCard({ employee, onViewDetails }) {
  if (!employee) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={employee.avatar}
            alt={employee.name}
            className="w-12 h-12 rounded-full object-cover border border-slate-200"
          />
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{employee.name}</h4>
            <p className="text-xs text-slate-500 font-mono">{employee.id}</p>
          </div>
        </div>
        <Badge
          variant={employee.status === "Active" ? "success" : "neutral"}
          size="sm"
          dot
        >
          {employee.status}
        </Badge>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Department:</span>
          <span className="font-medium text-slate-800">{employee.department}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Designation:</span>
          <span className="font-medium text-slate-800">{employee.designation}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total Available:</span>
          <span className="font-semibold text-slate-900">
            {employee.leaveBalance?.totalRemaining ?? 15} / 15 days
          </span>
        </div>
      </div>

      {onViewDetails && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => onViewDetails(employee)}
          >
            View Full Profile
          </Button>
        </div>
      )}
    </div>
  );
}
