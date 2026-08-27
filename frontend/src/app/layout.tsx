import type { Metadata } from 'next';
import './globals.css';
import AppLayoutContainer from '@/components/layout/AppLayoutContainer';

export const metadata: Metadata = {
  title: 'GigPilot AI — Autonomous Fiverr Gig Promotion System',
  description: 'AI-powered gig promotion, campaign execution, and traffic analytics dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppLayoutContainer>{children}</AppLayoutContainer>
      </body>
    </html>
  );
}
