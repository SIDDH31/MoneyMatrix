import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/** Simple layout for text pages such as About, Privacy and Terms. */
export function StaticPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-16">
        <article className="container max-w-3xl space-y-6 text-[15px] leading-relaxed text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:pt-4 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{title}</h1>
            {updated && <p className="text-sm">Last updated {updated}</p>}
          </header>
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
}
