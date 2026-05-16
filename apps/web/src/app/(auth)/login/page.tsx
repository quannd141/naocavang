import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: 'Đăng nhập',
};

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">{t('loginTitle')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('noAccount')}{' '}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">
            {t('switchToRegister')}
          </Link>
        </p>

        {/* TODO(NS-07): wire up NextAuth credentials provider when Google OAuth credentials available */}
        <form className="mt-8 space-y-4" action="/api/auth/callback/credentials" method="POST">
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
              {t('passwordLabel')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-brand-500 px-4 py-2 font-semibold hover:bg-brand-400"
          >
            {t('submitLogin')}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">hoặc</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* TODO(NS-07): wire up Google OAuth when credentials provisioned (xem PENDING_HUMAN) */}
        <button
          type="button"
          className="w-full rounded-md border border-border px-4 py-2 font-medium hover:bg-muted"
          disabled
          title="Google OAuth chưa cấu hình — cần credentials Google Cloud"
        >
          {t('googleButton')} (chưa cấu hình)
        </button>

        <p className="mt-6 text-center text-sm">
          <Link href="/forgot-password" className="text-muted-foreground hover:underline">
            {t('forgotPassword')}
          </Link>
        </p>
      </div>
    </main>
  );
}
