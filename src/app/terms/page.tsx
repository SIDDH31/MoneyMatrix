import type { Metadata } from 'next';
import { StaticPage } from '@/components/layout/static-page';

export const metadata: Metadata = {
  title: 'Terms of Service | MoneyMatrix',
  description: 'The terms for using MoneyMatrix.',
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms of Service" updated="November 2026">
      <p>By using MoneyMatrix you agree to these terms.</p>
      <h2>Informational use only</h2>
      <p>
        MoneyMatrix provides budgeting tools, calculations, projections and AI-generated explanations for educational
        purposes. Nothing in the app is investment, tax or legal advice, and past or projected returns are not guaranteed.
        Consult a qualified, SEBI-registered adviser before making investment decisions.
      </p>
      <h2>Your account</h2>
      <p>Keep your password private and make sure the information you enter is accurate. You are responsible for activity on your account.</p>
      <h2>Third-party content</h2>
      <p>News headlines belong to their publishers and link to the original articles. MoneyMatrix does not endorse or verify third-party content.</p>
      <h2>Availability</h2>
      <p>The service is provided &quot;as is&quot;, without warranties. Features may change, and the AI Advisor depends on an external provider that may occasionally be unavailable.</p>
    </StaticPage>
  );
}
