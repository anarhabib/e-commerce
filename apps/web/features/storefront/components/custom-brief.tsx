"use client";
import { useState, type FormEvent } from "react";
import { Dialog } from "./dialog";
import { ArrowUpRight } from "lucide-react";

export function CustomBrief({ notify }: { notify: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = `CARBIGNITE — CUSTOM PART BRIEF\n\nName: ${data.get("name")}\nVehicle / application: ${data.get("vehicle")}\n\nProject idea:\n${data.get("idea")}\n\nPrepared from the CARBIGNITE design preview. This brief has not been submitted.\n`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "carbignite-custom-part-brief.txt";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    notify("Your project brief is ready to save");
  }
  return (
    <>
      <section className="custom">
        <div className="eyebrow">YOUR IDEA. OUR NEXT CHALLENGE.</div>
        <h2>
          Something more <em>personal?</em>
        </h2>
        <div>
          <p>
            Have a part in mind? Tell us what you&apos;re building.
            <br />
            Let&apos;s explore the possibilities in carbon.
          </p>
          <button className="button primary" onClick={() => setOpen(true)}>
            Discuss a custom part{" "}
            <span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </button>
        </div>
      </section>
      {open && (
        <Dialog
          id="inquiry-dialog"
          title="custom inquiry"
          onClose={() => setOpen(false)}
        >
          <div className="eyebrow">A NEW POSSIBILITY</div>
          <h2>Make it personal.</h2>
          <p>Describe your part to prepare a brief you can save and share.</p>
          <form onSubmit={download}>
            <label>
              Your name
              <input name="name" required maxLength={100} autoComplete="name" />
            </label>
            <label>
              Vehicle / application
              <input
                name="vehicle"
                placeholder="e.g. Ferrari 488 — center console"
                required
                maxLength={200}
              />
            </label>
            <label>
              Tell us about your idea
              <textarea name="idea" rows={4} required maxLength={3000} />
            </label>
            <button className="button primary" type="submit">
              Download your project brief <span>↓</span>
            </button>
            <p className="preview-note">
              Creates a text file on your device. Nothing is submitted.
            </p>
          </form>
        </Dialog>
      )}
    </>
  );
}
