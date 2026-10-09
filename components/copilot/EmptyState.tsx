import { CopilotIcon } from "./icons";

export function EmptyState({
  title,
  body,
  compact,
}: {
  title: string;
  body: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="empty empty--compact">
        <b>{title}</b>
        <span>{body}</span>
      </div>
    );
  }
  return (
    <div className="empty">
      <div className="ci">
        <CopilotIcon name="spark" />
      </div>
      <b>{title}</b>
      <span>{body}</span>
    </div>
  );
}
