import { LoadingBar } from "@/components/ui/loading-bar";

export default function Loading() {
  return (
    <main className="section w-full flex-1" aria-busy="true">
      <LoadingBar fixed label="Loading page" />
    </main>
  );
}
