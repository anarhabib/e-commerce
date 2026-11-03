import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Keep the existing catalog shell while the new homepage is reviewed independently.
export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
