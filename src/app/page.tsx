import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";

export default function Home() {
  return (
    <main className="min-h-screen bg-dark">
      <Navigation />
      <Hero />
      <Features />
    </main>
  );
}
