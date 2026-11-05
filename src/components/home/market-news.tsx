import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getLatestNews } from '@/lib/news';
import { NewsFeed } from '@/components/dashboard/news/news-feed';

/** Public home-page section with the latest headlines from Indian financial newspapers. */
export async function MarketNews() {
  const { items, sourcesOk } = await getLatestNews({ limit: 6 });
  if (items.length === 0) return null; // don't show an empty section if the feeds are unreachable

  return (
    <section id="news" className="py-24 bg-muted/30">
      <div className="container max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Latest market headlines</h2>
            <p className="text-muted-foreground mt-2">Live from {sourcesOk.join(', ')}. Updated every 15 minutes.</p>
          </div>
          <Link href="/dashboard/news" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            All news <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-xl border bg-card px-5">
          <NewsFeed items={items} compact />
        </div>
      </div>
    </section>
  );
}
