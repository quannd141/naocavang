'use client';

import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ReviewActivity, statsApi } from '@/lib/api-client';

const WINDOW_DAYS = 30;

/** Intensity buckets → Tailwind background. 0 reviews = muted, more = brighter gold. */
const LEVEL_BG = ['bg-muted', 'bg-brand-200', 'bg-brand-400', 'bg-brand-600', 'bg-brand-700'];

function level(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

/** 'YYYY-MM-DD' → 'DD/MM' without timezone surprises. */
function shortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/**
 * Dashboard widget: last-30-day review heatmap. Self-fetching and
 * non-blocking — on error it renders a subtle note instead of breaking the
 * dashboard, matching the page's "never block on stats" philosophy.
 */
export function ReviewActivityCard() {
  const [activity, setActivity] = useState<ReviewActivity | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    statsApi
      .activity(WINDOW_DAYS)
      .then(setActivity)
      .catch(() => setFailed(true));
  }, []);

  const activeDays = activity?.buckets.filter((b) => b.count > 0).length ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-brand-600" />
          Hoạt động ôn tập
          <span className="ml-auto text-xs font-normal text-muted-foreground">30 ngày qua</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {failed ? (
          <p className="text-sm text-muted-foreground">Chưa tải được hoạt động ôn tập.</p>
        ) : activity === null ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : activity.total === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có lượt ôn nào trong 30 ngày qua — ôn thẻ đầu tiên để bắt đầu chuỗi nhé! 🔥
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1">
              {activity.buckets.map((b) => (
                <div
                  key={b.date}
                  title={`${shortDate(b.date)}: ${b.count} lượt ôn`}
                  className={`h-4 w-4 rounded-sm ${LEVEL_BG[level(b.count)]}`}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground">{activity.total}</strong> lượt ôn •{' '}
                <strong className="text-foreground">{activeDays}</strong>/30 ngày có học
              </span>
              <span className="flex items-center gap-1">
                Ít
                {LEVEL_BG.map((bg, i) => (
                  <span key={bg} className={`h-3 w-3 rounded-sm ${LEVEL_BG[i]}`} />
                ))}
                Nhiều
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
