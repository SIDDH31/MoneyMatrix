import type { Metadata } from 'next';
import { StaticPage } from '@/components/layout/static-page';

export const metadata: Metadata = {
  title: 'Privacy Policy | MoneyMatrix',
  description: 'How MoneyMatrix handles your data.',
};

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy Policy" updated="November 2026">
      <p>This page explains what MoneyMatrix stores and how it is used.</p>
      <h2>What we store</h2>
      <ul>
        <li><strong>Account:</strong> your name, email and a hashed password (passwords are never stored in plain text).</li>
        <li><strong>Financial profile:</strong> the income, expenses, balances, assets, debts, goals, transactions and risk-quiz answers you enter.</li>
        <li><strong>Preferences:</strong> currency and Student Mode.</li>
      </ul>
      <p>MoneyMatrix does not connect to your bank and never asks for bank, card or UPI credentials.</p>
      <h2>The AI Financial Advisor</h2>
      <p>
        When you send a message to the AI Advisor, your question and a summary of your financial figures are sent to the
        configured AI provider (Google Gemini or NVIDIA) to generate the answer. Chats are not saved by MoneyMatrix. Don&apos;t
        include sensitive details such as account numbers in your messages.
      </p>
      <h2>Market news</h2>
      <p>Headlines come from publishers&apos; public RSS feeds. Opening a story takes you to the publisher&apos;s website, whose own privacy policy applies.</p>
      <h2>Sharing</h2>
      <p>Your data is not sold or shared with advertisers. It is used only to run the features described above.</p>
      <h2>Your choices</h2>
      <p>You can edit your profile and income in Settings, and delete goals and transactions at any time.</p>
    </StaticPage>
  );
}
