import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: 'Đăng ký',
};

export default async function RegisterPage() {
  const t = await getTranslations('auth');

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{t('registerTitle')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('hasAccount')}{' '}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            {t('switchToLogin')}
          </Link>
        </p>

        {/* TODO(NS-07): wire up POST /api/auth/register endpoint */}
        <form className="mt-8 space-y-4" action="/api/auth/register" method="POST">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Họ và tên
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              {t('emailLabel')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium">
              {t('passwordLabel')} (tối thiểu 8 ký tự)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-brand-500 px-4 py-2 font-semibold hover:bg-brand-400"
          >
            {t('submitRegister')}
          </button>
        </form>
      </div>
    </main>
  );
}
