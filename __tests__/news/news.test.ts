import { describe, expect, it } from 'vitest';
import { cleanText, mergeNews, parseRss, type NewsSource } from '../../src/lib/news';

const source: NewsSource = { id: 'test', name: 'Test Times', category: 'markets', url: 'https://example.com/rss' };

const xml = `<?xml version="1.0"?><rss><channel><title>Feed</title>
<item><title><![CDATA[Sensex jumps 500 pts &amp; Nifty tops 25,000]]></title><link>https://example.com/a</link><pubDate>Thu, 05 Nov 2026 10:00:00 +0530</pubDate></item>
<item><title>RBI keeps repo rate at 5.5%</title><link>https://example.com/b</link><pubDate>Thu, 05 Nov 2026 12:00:00 +0530</pubDate></item>
<item><title>Unsafe link</title><link>javascript:alert(1)</link></item>
<item><title></title><link>https://example.com/empty</link></item>
</channel></rss>`;

describe('news feed parsing', () => {
  it('decodes CDATA, entities and tags', () => {
    expect(cleanText('<![CDATA[<b>Gold</b> &amp; silver &#8377;100]]>')).toBe('Gold & silver ₹100');
  });

  it('keeps only items with a title and an https link', () => {
    const items = parseRss(xml, source);
    expect(items.map((i) => i.title)).toEqual(['Sensex jumps 500 pts & Nifty tops 25,000', 'RBI keeps repo rate at 5.5%']);
    expect(items[0]).toMatchObject({ link: 'https://example.com/a', source: 'Test Times', category: 'markets' });
    expect(items[0].publishedAt).toBe('2026-11-05T04:30:00.000Z');
  });

  it('removes duplicate headlines and sorts newest first', () => {
    const items = parseRss(xml, source);
    const dupe = { ...items[0], id: 'other', link: 'https://other.com/a', source: 'Other' };
    const merged = mergeNews([items, [dupe]], 10);
    expect(merged).toHaveLength(2);
    expect(merged[0].title).toBe('RBI keeps repo rate at 5.5%');
  });
});
