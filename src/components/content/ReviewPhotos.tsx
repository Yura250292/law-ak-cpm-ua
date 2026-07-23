"use client";

import { useState } from "react";

/** Галерея скріншотів у картці відгуку/кейсу з простим лайтбоксом. */
export function ReviewPhotos({ photos }: { photos: string[] }) {
  const [active, setActive] = useState<string | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {photos.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(p)}
            className="overflow-hidden rounded-lg border border-border transition hover:border-accent/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p}
              alt={`Скріншот ${i + 1}`}
              className="h-20 w-20 object-cover"
            />
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
          />
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl text-white hover:bg-white/30"
            aria-label="Закрити"
          >
            ✕
          </button>
        </div>
      ) : null}
    </>
  );
}

export default ReviewPhotos;
