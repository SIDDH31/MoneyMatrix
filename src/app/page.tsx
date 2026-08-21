import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/home/hero';
import { Features } from '@/components/home/features';
import { HowItWorks } from '@/components/home/how-it-works';
import { DashboardPreview } from '@/components/home/dashboard-preview';
import { AiAdvisor } from '@/components/home/ai-advisor';
import { StudentMode } from '@/components/home/student-mode';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        <Features />
        <DashboardPreview />
        <HowItWorks />
        <AiAdvisor />
        <StudentMode />
      </main>
      
      <Footer />
    </div>
  );
}

