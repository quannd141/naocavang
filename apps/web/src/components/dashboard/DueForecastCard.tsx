'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type DueForecast, flashcardApi } from '@/lib/api-client';

const WINDOW_DAYS = 7;
const TRACK_PX = 56;
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** Weekday label from 'YYYY-MM-DD' (local), first bucket shown as "Hôm nay". */
function dayLabel(iso: string, isToday: boolean): string {
  if (isToday) return 'Hôm nay';
  const [y, m, d] = iso.split('-').map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

/**
 * Dashboard widget: upcoming flashcard reviews for the next 7 days plus an
 * overdue callout. Self-fetching, non-blocking (renders a subtle note on error).
 */
export function DueForecastCard() {
  const [forecast, setForecast] = useState<DueForecast | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    flashcardApi
      .getForecast(WINDOW_DAYS)
      .then(setForecast)
      .catch(() => setFailed(true));
  }, []);

  const maxCount = forecast ? Math.max(1, ...forecast.buckets.map((b) => b.count)) : 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4 text-brand-600" />
          Lịch ôn sắp tới
          <span className="ml-auto text-xs font-normal text-muted-foreground">7 ngày tới</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {failed ? (
          <p className="text-sm text-muted-foreground">Chưa tải được lịch ôn.</p>
        ) : forecast === null ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : (
          <>
            {forecast.overdue > 0 && (
              <Link
                href="/flashcards"
                className="mb-3 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-100"
              >
                <span>
                  ⏰ <strong>{forecast.overdue}</strong> thẻ quá hạn cần ôn bù
                </span>
                <span className="text-xs font-medium">Ôn ngay →</span>
              </Link>
            )}

            {forecast.total === 0 && forecast.overdue === 0 ? (
              <p className="text-sm text-muted-foreground">
                Không có thẻ nào đến hạn trong 7 ngày tới. Thong thả nhé! ✨
              </p>
            ) : (
              <div className="flex items-end justify-between gap-1" style={{ height: TRACK_PX + 24 }}>
                {forecast.buckets.map((b, i) => {
                  const h = b.count > 0 ? Math.max(4, Math.round((b.count / maxCount) * TRACK_PX)) : 2;
                  return (
                    <div key={b.date} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-medium text-foreground">{b.count || ''}</span>
                      <div
                        title={`${b.count} thẻ đến hạn`}
                        className={`w-full rounded-t-sm ${b.count > 0 ? 'bg-brand-500' : 'bg-muted'}`}
                        style={{ height: h }}
                      />
                      <span className="text-[10px] text-muted-foreground">{dayLabel(b.date, i === 0)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {forecast.total > 0 && (
              <div className="mt-3 text-xs text-muted-foreground">
                <strong className="text-foreground">{forecast.total}</strong> thẻ đến hạn trong 7
                ngày tới
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
