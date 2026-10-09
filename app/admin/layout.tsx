import { PasscodeActivityListener } from "@/components/copilot/PasscodeActivityListener";
import { isPasscodeEnabled } from "@/lib/passcode/enabled";

export const instant = false;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const passcodeOn = isPasscodeEnabled();

  return (
    <>
      {passcodeOn ? <PasscodeActivityListener /> : null}
      {children}
    </>
  );
}
