'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NewsFeedItem {
  id: string;
  title: string;
  link: string;
  source: string;
  category: 'markets' | 'personal-finance' | 'economy';
  publishedAt: string | null;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'markets', label: 'Markets' },
  { id: 'personal-finance', label: 'Personal Finance' },
  { id: 'economy', label: 'Economy' },
] as const;

type FilterId = (typeof FILTERS)[number]['id'];

export function timeAgo(iso: string | null, now = Date.now()): string {
  if (!iso) return '';
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

export function NewsFeed({ items, compact = false }: { items: NewsFeedItem[]; compact?: boolean }) {
  const [filter, setFilter] = useState<FilterId>('all');
  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.category === filter)),
    [items, filter]
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
        <Newspaper className="h-6 w-6" />
        <p>Couldn&apos;t load the latest headlines right now. Check your internet connection and refresh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter news">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filter === f.id ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <ul className="divide-y">
        {visible.map((item) => (
          <li key={item.id}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className={cn('font-medium leading-snug group-hover:text-primary transition-colors', compact ? 'text-sm' : 'text-[15px]')}>
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.source}
                  {item.publishedAt && <> · {timeAgo(item.publishedAt)}</>}
                </p>
              </div>
              <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">No headlines in this category right now.</li>
        )}
      </ul>
    </div>
  );
}
