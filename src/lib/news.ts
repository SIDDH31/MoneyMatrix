/**
 * Market News
 *
 * Pulls the latest headlines from the public RSS feeds of Indian financial newspapers.
 * We only show the headline, source and time, and always link to the original article,
 * so readers go to the publisher for the full story.
 *
 * Feeds are cached for 15 minutes. A feed that is down or malformed is skipped, so one
 * broken source never breaks the page.
 *
 * Server-side only.
 */

export type NewsCategory = 'markets' | 'personal-finance' | 'economy';

export interface NewsSource {
  id: string;
  name: string;
  category: NewsCategory;
  url: string;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceId: string;
  category: NewsCategory;
  publishedAt: string | null; // ISO string
}

export const NEWS_SOURCES: NewsSource[] = [
  { id: 'et-markets', name: 'The Economic Times', category: 'markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
  { id: 'et-wealth', name: 'The Economic Times', category: 'personal-finance', url: 'https://economictimes.indiatimes.com/wealth/rssfeeds/837555174.cms' },
  { id: 'et-economy', name: 'The Economic Times', category: 'economy', url: 'https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms' },
  { id: 'mint-markets', name: 'Mint', category: 'markets', url: 'https://www.livemint.com/rss/markets' },
  { id: 'mint-money', name: 'Mint', category: 'personal-finance', url: 'https://www.livemint.com/rss/money' },
  { id: 'moneycontrol', name: 'Moneycontrol', category: 'markets', url: 'https://www.moneycontrol.com/rss/latestnews.xml' },
  { id: 'bs-markets', name: 'Business Standard', category: 'markets', url: 'https://www.business-standard.com/rss/markets-106.rss' },
];

const REVALIDATE_SECONDS = 15 * 60;
const FETCH_TIMEOUT_MS = 8_000;
const MAX_ITEMS_PER_FEED = 15;

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…', rupee: '₹',
};

/** Decode CDATA, HTML entities and stray tags in a feed field. */
export function cleanText(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return match ? cleanText(match[1]) : '';
}

/** Parse the <item> entries of an RSS 2.0 document. Exported for tests. */
export function parseRss(xml: string, source: NewsSource): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];

  for (const block of blocks.slice(0, MAX_ITEMS_PER_FEED)) {
    const title = tag(block, 'title');
    const link = tag(block, 'link') || tag(block, 'guid');
    if (!title || !/^https:\/\//i.test(link)) continue; // only safe, absolute https links

    const dateRaw = tag(block, 'pubDate') || tag(block, 'dc:date');
    const parsed = dateRaw ? new Date(dateRaw) : null;
    const publishedAt = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : null;

    items.push({
      id: `${source.id}:${link}`,
      title,
      link,
      source: source.name,
      sourceId: source.id,
      category: source.category,
      publishedAt,
    });
  }
  return items;
}

async function fetchFeed(source: NewsSource): Promise<NewsItem[]> {
  try {
    const res = await fetch(source.url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`[news] ${source.id} HTTP ${res.status}`);
      return [];
    }
    return parseRss(await res.text(), source);
  } catch (error) {
    console.warn(`[news] ${source.id} failed:`, (error as Error).message);
    return [];
  }
}

/** Remove duplicate stories (same headline from several feeds) and sort newest first. */
export function mergeNews(lists: NewsItem[][], limit: number): NewsItem[] {
  const seen = new Set<string>();
  const merged: NewsItem[] = [];
  for (const item of lists.flat()) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(key) || seen.has(item.link)) continue;
    seen.add(key);
    seen.add(item.link);
    merged.push(item);
  }
  merged.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
  return merged.slice(0, limit);
}

export interface NewsResult {
  items: NewsItem[];
  /** Names of the newspapers that returned headlines */
  sourcesOk: string[];
  fetchedAt: string;
}

export async function getLatestNews(options: { category?: NewsCategory; limit?: number } = {}): Promise<NewsResult> {
  const sources = options.category ? NEWS_SOURCES.filter((s) => s.category === options.category) : NEWS_SOURCES;
  const lists = await Promise.all(sources.map(fetchFeed));
  const sourcesOk = [...new Set(sources.filter((_, i) => lists[i].length > 0).map((s) => s.name))];
  return {
    items: mergeNews(lists, options.limit ?? 60),
    sourcesOk,
    fetchedAt: new Date().toISOString(),
  };
}
