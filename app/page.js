import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '0.75rem', color: '#ffffff', lineHeight: 1.2, letterSpacing: '-1px' }}>
        CodePulse
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#a0a0a0', maxWidth: '550px', margin: '0 auto 0.5rem' }}>
        Your unified developer analytics platform.
      </p>
      <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '2.5rem' }}>
        GitHub · LeetCode · Codeforces · GeeksForGeeks · CodeChef · HackerRank
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '4rem' }}>
        <Link href="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.85rem 2rem' }}>
          Get Started Free
        </Link>
        <Link href="/login" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '0.85rem 2rem' }}>
          Sign In
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        {[
          { icon: '📊', title: 'Unified Dashboard', desc: 'All your coding stats — GitHub, LeetCode, Codeforces, GFG — in one place.' },
          { icon: '🧠', title: 'AI-Powered Insights', desc: 'Personalized recommendations based on your strengths and weaknesses.' },
          { icon: '🎯', title: 'DSA Skill Analysis', desc: 'Topic-wise breakdown with progress tracking and improvement plans.' },
        ].map((f, i) => (
          <div key={i} className="card">
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{f.title}</h3>
            <p style={{ color: '#a0a0a0', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {[
          { icon: '🏢', title: 'Company Matching', desc: 'Know which top companies match your DSA skills — Google, Amazon, Meta & more.' },
          { icon: '📈', title: 'Track Progress', desc: 'Monitor your consistency, growth, and get a clear path to improvement.' },
        ].map((f, i) => (
          <div key={i} className="card">
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{f.title}</h3>
            <p style={{ color: '#a0a0a0', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
