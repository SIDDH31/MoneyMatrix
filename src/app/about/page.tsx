import type { Metadata } from 'next';
import Link from 'next/link';
import { StaticPage } from '@/components/layout/static-page';

export const metadata: Metadata = {
  title: 'About | MoneyMatrix',
  description: 'What MoneyMatrix is and who it is for.',
};

export default function AboutPage() {
  return (
    <StaticPage title="About MoneyMatrix">
      <p>
        MoneyMatrix is a personal finance platform built for students and young professionals in India. It brings your
        income, spending, savings goals and investments into one dashboard, and explains them in plain language.
      </p>
      <h2>What you can do</h2>
      <ul>
        <li>See your net worth, savings rate and a financial health score at a glance.</li>
        <li>Set savings goals and track your progress toward them.</li>
        <li>Log income and expenses to see where your money goes each month.</li>
        <li>Track investments and model growth with the compound-interest simulator.</li>
        <li>Ask the AI Financial Advisor questions about your own numbers.</li>
        <li>Read the latest market headlines from Indian financial newspapers.</li>
        <li>Switch to Student Mode for a simpler view built around stipends and allowances.</li>
      </ul>
      <h2>Not financial advice</h2>
      <p>
        MoneyMatrix is an educational tool. Its calculations, projections and AI answers are informational and are not
        a substitute for advice from a SEBI-registered investment adviser.
      </p>
      <h2>Contact</h2>
      <p>
        MoneyMatrix is an open project. Questions, bugs and ideas are welcome as issues on{' '}
        <Link href="https://github.com/SIDDH31/MoneyMatrix" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
          GitHub
        </Link>
        .
      </p>
    </StaticPage>
  );
}
