"use client";
import { useState } from "react";
import { finishes, type Finish } from "../types";

export function MaterialSelector() {
  const [pattern, setPattern] = useState("woven");
  const [finish, setFinish] = useState<Finish>("Gloss");
  return (
    <section className="material-section" id="material">
      <div
        className="material-art"
        data-pattern={pattern}
        data-finish={finish}
        role="img"
        aria-label={`Generated material study of ${pattern} carbon fiber in ${finish.toLowerCase()} finish`}
      >
        <span className="texture-note">MATERIAL VISUALIZATION</span>
        <span className="material-code">
          CF / {pattern === "woven" ? "01" : "02"}
          <br />
          {pattern === "woven" ? "2 × 2 TWILL" : "FORGED CARBON"}
        </span>
        <span className="material-stamp">
          A MATERIAL.
          <br />
          AN OBSESSION.
        </span>
      </div>
      <div className="material-copy">
        <div className="eyebrow">THE MATERIAL / YOUR SIGNATURE</div>
        <h2>
          Same element.
          <br />
          Different character.
        </h2>
        <p>
          From the precision of a woven pattern to the individuality of forged
          carbon. Choose the texture. Set the finish. Make the detail your own.
        </p>
        <div className="material-tabs" role="group" aria-label="Carbon pattern">
          {["woven", "forged"].map((value, index) => (
            <button
              key={value}
              className={pattern === value ? "active" : ""}
              aria-pressed={pattern === value}
              onClick={() => setPattern(value)}
            >
              0{index + 1} / {value === "woven" ? "Woven" : "Forged"}
            </button>
          ))}
        </div>
        <p className="pattern-description">
          {pattern === "woven"
            ? "An ordered, repeating weave. The unmistakable rhythm of carbon fiber."
            : "Scattered fibers. An organic pattern with an individual character."}
        </p>
        <div className="finish-line">
          <span>THE FINISH</span>
          <div>
            {finishes.map((value) => (
              <button
                key={value}
                className={`finish ${finish === value ? "active" : ""}`}
                aria-pressed={finish === value}
                onClick={() => setFinish(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
