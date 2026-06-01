import type { ReactNode } from 'react';

interface LegalShellProps {
  title: string;
  /** Display date dd/mm/yyyy. */
  updatedAt: string;
  children: ReactNode;
}

/**
 * Shared wrapper for legal pages (Privacy, Terms): centered prose column,
 * title + last-updated, and a draft notice. Styling uses plain Tailwind utility
 * classes on headings/paragraphs (no @tailwindcss/typography dependency).
 */
export function LegalShell({ title, updatedAt, children }: LegalShellProps) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Cập nhật lần cuối: {updatedAt}</p>

      <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        ⚠️ <strong>Bản nháp</strong> — nội dung pháp lý này là bản soạn thảo ban đầu, cần luật sư
        rà soát trước khi phát hành chính thức.
      </div>

      <div
        className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/90
          [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground
          [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6
          [&_a]:text-brand-700 [&_a]:underline"
      >
        {children}
      </div>
    </div>
  );
}
