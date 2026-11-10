"use client";
import { ArrowUpRight } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { adminApi } from "./api";
import { productImageStyle } from "@/features/products/utils";

export function ProductGallery({
  images,
  setImages,
  photoIndex,
  changeCover,
  busy,
  setUploading,
}: {
  images: string[];
  setImages: (images: string[]) => void;
  photoIndex: number | null;
  changeCover: () => void;
  busy: boolean;
  setUploading: (value: boolean) => void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setError("");
    if (images.length + files.length > 12) {
      setError("A product can have up to 12 images.");
      return;
    }
    if (
      files.some(
        (file) =>
          file.size > 5 * 1024 * 1024 ||
          !["image/jpeg", "image/png", "image/webp"].includes(file.type),
      )
    ) {
      setError("Choose JPEG, PNG or WebP files, each 5 MB or smaller.");
      return;
    }
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.onerror = () => reject(new Error("Could not read image"));
          reader.readAsDataURL(file);
        });
        const result = await adminApi<{ url: string }>("images", "POST", {
          data,
        });
        uploaded.push(result.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setImages([...images, ...uploaded]);
      setUploading(false);
    }
  }
  function addUrl() {
    const value = url.trim();
    setError("");
    let valid =
      value.startsWith("/") && !value.startsWith("//") && !value.includes("\\");
    try {
      valid ||= ["http:", "https:"].includes(new URL(value).protocol);
    } catch {}
    if (!valid) {
      setError("Enter a local asset path or an HTTP(S) image URL.");
      return;
    }
    if (images.length >= 12 || images.includes(value)) {
      setError("Use up to 12 different images.");
      return;
    }
    setImages([...images, value]);
    setUrl("");
  }
  return (
    <section className="product-gallery-editor" aria-label="Product images">
      <h3>Product images</h3>
      <p>
        Upload up to 12 images. The first image is the cover. Save the product
        to keep gallery changes.
      </p>
      <div className="gallery-previews">
        {images.map((image, index) => (
          <article key={image}>
            <div
              className="gallery-image"
              role="img"
              aria-label={`Product image ${index + 1}`}
              style={productImageStyle({
                imageUrl: image,
                photoIndex: index === 0 ? photoIndex : null,
              })}
            />
            <span>{index === 0 ? "Cover image" : `Image ${index + 1}`}</span>
            <div className="gallery-image-actions">
              {index > 0 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setImages([
                      image,
                      ...images.filter((item) => item !== image),
                    ]);
                    changeCover();
                  }}
                >
                  Make cover
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setImages(images.filter((item) => item !== image));
                  if (index === 0) changeCover();
                }}
              >
                Remove
              </button>
              <a href={image} target="_blank" rel="noreferrer">
                View{" "}
                <ArrowUpRight
                  className="admin-arrow"
                  size={16}
                  aria-hidden="true"
                />
              </a>
            </div>
          </article>
        ))}
      </div>
      {!images.length && (
        <p className="gallery-empty">
          No images yet. Upload photos or add an image URL below.
        </p>
      )}
      <label>
        Upload photos
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy || images.length >= 12}
          onChange={upload}
        />
      </label>
      <label>
        Or add an image URL
        <input
          type="text"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://… or /carbignite/products.webp"
          disabled={busy}
        />
      </label>
      <button
        type="button"
        className="text-button"
        onClick={addUrl}
        disabled={busy || !url.trim()}
      >
        Add image{" "}
        <ArrowUpRight className="admin-arrow" size={16} aria-hidden="true" />
      </button>
      <p className="form-error" role="alert">
        {error}
      </p>
    </section>
  );
}
