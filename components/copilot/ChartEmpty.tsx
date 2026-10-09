import {
  CHART_EMPTY_BODY,
  CHART_EMPTY_TITLE,
} from "@/lib/chart-utils";
import { EmptyState } from "./EmptyState";

export function ChartEmpty({ compact = true }: { compact?: boolean }) {
  return (
    <EmptyState
      compact={compact}
      title={CHART_EMPTY_TITLE}
      body={CHART_EMPTY_BODY}
    />
  );
}
