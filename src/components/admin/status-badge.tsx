import { statusLabels, type OrderStatus } from "@/config/site";
import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "tag",
        status === "pending_payment" && "tag-warning",
        status === "confirmed" && "tag-lime",
        status === "processing" && "tag-lime",
        status === "shipped" && "tag-lime",
        status === "delivered" && "tag-success",
        status === "canceled" && "tag-danger",
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function ProductStatusBadge({ active }: { active: boolean }) {
  return (
    <span className={cn("tag", active ? "tag-success" : "tag-danger")}>
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}
