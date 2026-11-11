import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { cn } from "@/lib/cn";

type AdminNoticeProps = {
  tone?: "success" | "error" | "info" | "warning";
  title?: string;
  children: React.ReactNode;
};

export function AdminNotice({
  tone = "info",
  title,
  children,
}: AdminNoticeProps) {
  const Icon =
    tone === "success"
      ? CircleCheck
      : tone === "error"
        ? CircleAlert
        : tone === "warning"
          ? CircleAlert
          : Info;

  return (
    <div
      className={cn(
        "flex items-start gap-3 border px-4 py-3.5 text-xs leading-relaxed",
        tone === "success" && "border-success/30 bg-success/5 text-success",
        tone === "error" && "border-danger/30 bg-danger/5 text-danger",
        tone === "warning" && "border-warning/30 bg-warning/5 text-warning",
        tone === "info" && "border-line bg-surface text-muted",
      )}
    >
      <Icon
        size={15}
        className={cn(
          "mt-0.5 shrink-0",
          tone === "success" && "text-success",
          tone === "error" && "text-danger",
          tone === "warning" && "text-warning",
          tone === "info" && "text-lime",
        )}
      />
      <div>
        {title ? <p className="font-semibold text-white">{title}</p> : null}
        <div className={title ? "mt-1" : ""}>{children}</div>
      </div>
    </div>
  );
}
