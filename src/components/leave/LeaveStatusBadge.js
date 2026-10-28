import Badge from "@/components/ui/Badge";

export default function LeaveStatusBadge({ status, size = "md" }) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "approved") {
    return (
      <Badge variant="success" size={size} dot>
        Approved
      </Badge>
    );
  }

  if (normalized === "rejected") {
    return (
      <Badge variant="danger" size={size} dot>
        Rejected
      </Badge>
    );
  }

  return (
    <Badge variant="warning" size={size} dot>
      Pending
    </Badge>
  );
}
