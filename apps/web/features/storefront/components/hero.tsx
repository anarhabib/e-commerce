import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="orange-dot"></span> INDEPENDENT CARBON ATELIER
        </div>
        <h1>
          Less weight.
          <br />
          More <em>presence.</em>
        </h1>
        <p>
          Extraordinary material. Everyday connection.
          <br />
          Carbon fiber parts for the details that make it yours.
        </p>
        <Button href="#collection" endIcon={<ArrowUpRight size={16} />}>
          Explore the collection
        </Button>
        <div className="hero-foot">
          <span>
            DESIGNED WITH INTENT.
            <br />
            MADE TO REPLACE.
          </span>
          <span className="scroll-note">SCROLL TO DISCOVER ↓</span>
        </div>
      </div>
      <div className="hero-visual">
        <Image
          fill
          preload
          sizes="(max-width: 700px) 100vw, 50vw"
          src="/carbignite/hero.webp"
          alt="Concept studio photograph of sculptural woven carbon fiber paddle shifters and a console panel"
        />
        <span className="image-index">MATERIAL STUDY — 001</span>
        <div className="image-caption">
          <span>THE BEAUTY IS IN THE FIBER.</span>
          <span>2 × 2 TWILL / GLOSS</span>
        </div>
        <span className="vertical-label">CARBON, CONSIDERED.</span>
      </div>
    </section>
  );
}
