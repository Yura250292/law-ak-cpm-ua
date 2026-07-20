"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Фото адвоката для головної сторінки.
 * Показує завантажене фото з /public/about/anastasia.jpg.
 * Доки файл не завантажено (або якщо він недоступний) — показує елегантну
 * заглушку, тож сторінка ніколи не має «битого» зображення.
 */
export function LawyerPhoto() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <svg
              className="h-10 w-10 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-muted">Фото адвоката</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src="/about/anastasia.jpg"
      alt="Кабаль Анастасія Ігорівна — адвокат у Львові"
      fill
      sizes="(max-width: 1024px) 100vw, 40vw"
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
