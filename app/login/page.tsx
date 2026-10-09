import { LoginHero } from "@/components/copilot/LoginHero";
import { SvgDefs } from "@/components/copilot/SvgDefs";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <>
      <SvgDefs />
      <Suspense fallback={null}>
        <LoginHero />
      </Suspense>
    </>
  );
}
