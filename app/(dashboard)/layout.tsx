import { PasscodeActivityListener } from "@/components/copilot/PasscodeActivityListener";
import { isPasscodeEnabled } from "@/lib/passcode/enabled";
import { Suspense } from "react";

export const instant = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const passcodeOn = isPasscodeEnabled();

  return (
    <Suspense fallback={null}>
      {passcodeOn ? <PasscodeActivityListener /> : null}
      {children}
    </Suspense>
  );
}
