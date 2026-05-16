import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('landing');

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
          🧠🐠 <span className="text-brand-500">Não Cá Vàng</span>
        </h1>
        <p className="mt-4 text-2xl text-muted-foreground">{t('tagline')}</p>
        <p className="mt-8 mx-auto max-w-2xl text-lg">{t('description')}</p>

        <div className="mt-12 flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-md bg-brand-500 px-8 py-3 font-semibold text-foreground hover:bg-brand-400"
          >
            {t('ctaPrimary')}
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-border px-8 py-3 font-semibold hover:bg-muted"
          >
            {t('ctaSecondary')}
          </Link>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon="🗺️"
            title={t('feature1Title')}
            description={t('feature1Description')}
          />
          <FeatureCard
            icon="🎴"
            title={t('feature2Title')}
            description={t('feature2Description')}
          />
          <FeatureCard
            icon="🧪"
            title={t('feature3Title')}
            description={t('feature3Description')}
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-left">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
