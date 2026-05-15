'use strict';

const SUPABASE_URL  = 'https://jnwnigwyyasdtsgliypa.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impud25pZ3d5eWFzZHRzZ2xpeXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjkzOTMsImV4cCI6MjA5MjQwNTM5M30.62cJEKNqTt6P6bZMrVVcp_xLbD6tIuTjKgOI-SmSMAY';

function escXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = async function handler(req, res) {
  const apiRes = await fetch(
    `${SUPABASE_URL}/rest/v1/journal_entries?published=eq.true&order=date.desc&limit=20&select=id,date,type,title,content,tags`,
    {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
      },
    }
  );

  const entries = await apiRes.json();

  const items = Array.isArray(entries)
    ? entries.map(e => {
        const pubDate = new Date(e.date + 'T00:00:00Z').toUTCString();
        const link = `https://www.jaeggerjose.com/journal.html`;
        const desc = e.content ? escXml(e.content.slice(0, 280)) : '';
        const tags = Array.isArray(e.tags)
          ? e.tags.map(t => `<category>${escXml(t)}</category>`).join('')
          : '';
        return `
    <item>
      <title>${escXml(e.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${escXml(e.id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${desc}</description>
      ${tags}
    </item>`;
      }).join('')
    : '';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>廖洺玄の日常</title>
    <link>https://www.jaeggerjose.com/journal.html</link>
    <description>廖洺玄的生活日記與照片記錄 — 日常、旅行、攝影</description>
    <language>zh-TW</language>
    <atom:link href="https://www.jaeggerjose.com/api/feed" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
};
