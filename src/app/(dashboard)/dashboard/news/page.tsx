import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsFeed } from '@/components/dashboard/news/news-feed';
import { getLatestNews } from '@/lib/news';

export const metadata: Metadata = {
  title: 'Market News | MoneyMatrix',
  description: 'Latest market, economy and personal finance headlines from Indian newspapers.',
};

// Headlines are cached for 15 minutes inside getLatestNews
export default async function NewsPage() {
  const { items, sourcesOk, fetchedAt } = await getLatestNews({ limit: 60 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Market News</h1>
        <p className="text-muted-foreground mt-1">
          The latest headlines on markets, the economy and personal finance. Tap a story to read it on the publisher&apos;s site.
        </p>
      </div>

      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle>Latest headlines</CardTitle>
          <CardDescription>
            {sourcesOk.length > 0 ? `From ${sourcesOk.join(', ')}` : 'Sources unavailable right now'} · updated{' '}
            {new Date(fetchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewsFeed items={items} />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Headlines and links belong to their publishers. MoneyMatrix does not endorse any article and this is not financial advice.
      </p>
    </div>
  );
}
