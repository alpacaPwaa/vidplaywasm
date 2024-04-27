import SuspendedPage from "@/components/SuspendedPage";
import { Suspense } from "react";

const Page = () => {
  return (
    <Suspense>
      <SuspendedPage />
    </Suspense>
  );
};

export default Page;
