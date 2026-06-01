import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { CookieConsent } from '@/components/CookieConsent';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Não Cá Vàng — Học một lần, nhớ cả đời',
    template: '%s | Não Cá Vàng',
  },
  description:
    'Nền tảng học bằng AI all-in-one cho người Việt — biến PDF, slide, text thành mind map + flashcard + quiz tự động.',
  keywords: ['mind map', 'flashcard', 'AI học tập', 'sơ đồ tư duy', 'spaced repetition', 'IELTS', 'ôn thi'],
  authors: [{ name: 'Quân Nguyễn' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Não Cá Vàng',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
