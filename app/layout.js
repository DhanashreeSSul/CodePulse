import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata = {
  title: 'CodePulse — Developer Analytics Platform',
  description: 'Unified dashboard integrating GitHub, LeetCode, Codeforces, GFG & more. Track progress, get AI-powered insights, and collaborate with teachers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="layout-container">
            <Navbar />
            <main className="container">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
