import Link from 'next/link'

export const metadata = {
  title: 'Cervio — Your business, operated.',
  description: 'Cervio sees problems, recommends decisions, and executes them. The AI operating layer that runs your business.',
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --black: #080808; --white: #f8f7f4; --off-white: #f2f0ec;
          --muted: #9a9690; --blue: #2563eb; --blue-light: rgba(37,99,235,0.08);
          --green: #16a34a; --red: #dc2626; --amber: #d97706;
          --serif: 'Instrument Serif', Georgia, serif;
          --sans: 'DM Sans', system-ui, sans-serif;
        }
        .lp { background: #080808; color: #f8f7f4; font-family: var(--sans); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .lp::before { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); background-size: 200px; pointer-events: none; z-index: 100; opacity: 0.35; }
        .lp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 64px; background: rgba(8,8,8,0.8); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .lp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .lp-wordmark { font-family: var(--sans); font-weight: 600; font-size: 17px; color: #f8f7f4; letter-spacing: -0.3px; }
        .lp-navlinks { display: flex; align-items: center; gap: 28px; list-style: none; }
        .lp-navlinks a { color: rgba(248,247,244,0.5); text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .lp-navlinks a:hover { color: #f8f7f4; }
        .lp-navcta { background: #f8f7f4 !important; color: #080808 !important; font-weight: 500 !important; padding: 8px 20px !important; border-radius: 100px !important; transition: opacity 0.2s !important; }
        .lp-navcta:hover { opacity: 0.85 !important; }
        .lp-hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 140px 48px 100px; position: relative; overflow: hidden; }
        .lp-hero-glow { position: absolute; top: 10%; left: 50%; transform: translateX(-50%); width: 800px; height: 600px; background: radial-gradient(ellipse, rgba(37,99,235,0.1) 0%, transparent 65%); pointer-events: none; }
        .lp-label { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 32px; animation: fadeUp 0.8s ease 0.2s both; }
        .lp-label::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #2563eb; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .lp-h1 { font-family: var(--serif); font-size: clamp(52px, 7vw, 96px); font-weight: 400; line-height: 1.05; letter-spacing: -1px; color: #f8f7f4; max-width: 860px; margin-bottom: 24px; animation: fadeUp 0.9s ease 0.4s both; }
        .lp-h1 em { font-style: italic; color: rgba(248,247,244,0.45); }
        .lp-sub { font-size: 18px; font-weight: 300; color: rgba(248,247,244,0.5); max-width: 480px; line-height: 1.65; margin-bottom: 44px; animation: fadeUp 0.9s ease 0.6s both; }
        .lp-actions { display: flex; gap: 12px; align-items: center; margin-bottom: 80px; animation: fadeUp 0.9s ease 0.75s both; }
        .lp-btn-p { background: #f8f7f4; color: #080808; padding: 14px 32px; border-radius: 100px; font-size: 15px; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: opacity 0.2s, transform 0.2s; }
        .lp-btn-p:hover { opacity: 0.85; transform: translateY(-1px); }
        .lp-btn-g { color: rgba(255,255,255,0.45); padding: 14px 20px; font-size: 15px; text-decoration: none; transition: color 0.2s; }
        .lp-btn-g:hover { color: #f8f7f4; }
        .lp-ui { width: 100%; max-width: 920px; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 40px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05); animation: fadeUp 1.1s ease 0.9s both; background: #0d0d0d; }
        .lp-ui-bar { background: #111; padding: 12px 16px; display: flex; align-items: center; gap: 7px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .lp-dot { width: 10px; height: 10px; border-radius: 50%; }
        .lp-ui-body { display: grid; grid-template-columns: 210px 1fr; min-height: 440px; }
        .lp-sidebar { background: #0a0a0a; border-right: 1px solid rgba(255,255,255,0.05); padding: 16px 0; }
        .lp-si { padding: 8px 16px; font-size: 13px; color: rgba(255,255,255,0.28); display: flex; align-items: center; gap: 9px; }
        .lp-si.on { color: rgba(255,255,255,0.88); background: rgba(255,255,255,0.05); }
        .lp-si-ico { width: 16px; height: 16px; border-radius: 4px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
        .lp-si.on .lp-si-ico { background: rgba(37,99,235,0.25); }
        .lp-main { padding: 22px; display: flex; flex-direction: column; gap: 14px; }
        .lp-st { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 6px; }
        .lp-dec { background: #111; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; position: relative; overflow: hidden; }
        .lp-dec::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #dc2626, transparent); }
        .lp-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #f87171; background: rgba(220,38,38,0.12); padding: 3px 8px; border-radius: 20px; margin-bottom: 9px; }
        .lp-badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #f87171; animation: pulse 1.5s ease-in-out infinite; }
        .lp-dt { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.88); margin-bottom: 5px; line-height: 1.3; }
        .lp-dr { font-size: 11px; color: rgba(255,255,255,0.35); margin-bottom: 10px; line-height: 1.5; }
        .lp-rec { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #4ade80; background: rgba(74,222,128,0.1); padding: 5px 10px; border-radius: 7px; margin-bottom: 11px; }
        .lp-brow { display: flex; gap: 7px; }
        .lp-ba { padding: 6px 12px; border-radius: 7px; font-size: 11px; font-weight: 600; }
        .lp-ba-g { background: #16a34a; color: white; position: relative; overflow: hidden; }
        .lp-ba-g::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); animation: shimmer 2.5s ease 2s infinite; }
        @keyframes shimmer { to { left: 100%; } }
        .lp-ba-d { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.38); }
        .lp-exec { background: #111; border: 1px solid rgba(37,99,235,0.22); border-radius: 12px; padding: 14px; }
        .lp-eh { display: flex; align-items: center; gap: 7px; margin-bottom: 10px; }
        .lp-edot { width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; animation: pulse 1.5s ease-in-out infinite; }
        .lp-el { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #60a5fa; }
        .lp-task { display: flex; align-items: center; gap: 7px; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 11px; color: rgba(255,255,255,0.5); }
        .lp-task:last-of-type { border-bottom: none; }
        .lp-tc { width: 15px; height: 15px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.12); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 7px; }
        .lp-tc.done { background: #16a34a; border-color: #16a34a; color: white; }
        .lp-pb { height: 3px; background: rgba(255,255,255,0.07); border-radius: 2px; margin-top: 10px; overflow: hidden; }
        .lp-pf { height: 100%; width: 40%; background: linear-gradient(90deg, #2563eb, #60a5fa); border-radius: 2px; animation: grow 2s ease 1.5s both; }
        @keyframes grow { from{width:0} to{width:40%} }
        .lp-health { background: #111; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px; }
        .lp-hs { font-size: 30px; font-weight: 800; color: #4ade80; line-height: 1; }
        .lp-hl { font-size: 10px; color: rgba(255,255,255,0.28); }
        .lp-hbars { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        .lp-hb { display: flex; flex-direction: column; gap: 2px; }
        .lp-hbl { font-size: 8px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.5px; }
        .lp-hbt { height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; overflow: hidden; }
        .lp-hbf { height: 100%; border-radius: 1px; animation: grow 1.5s ease 1.8s both; }
        .lp-section { padding: 140px 48px; max-width: 1100px; margin: 0 auto; }
        .lp-problem { padding: 160px 48px; background: #080808; text-align: center; }
        .lp-problem-in { max-width: 760px; margin: 0 auto; }
        .lp-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 20px; }
        .lp-sh { font-family: var(--serif); font-size: clamp(36px, 4.5vw, 58px); font-weight: 400; line-height: 1.1; letter-spacing: -0.5px; color: #f8f7f4; margin-bottom: 18px; }
        .lp-ss { font-size: 17px; font-weight: 300; color: rgba(248,247,244,0.42); line-height: 1.7; max-width: 520px; margin: 0 auto; }
        .lp-chaos { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; max-width: 880px; margin: 60px auto 0; }
        .lp-cc { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 24px; text-align: left; }
        .lp-cn { font-family: var(--serif); font-size: 52px; font-weight: 400; color: rgba(255,255,255,0.07); line-height: 1; margin-bottom: 10px; }
        .lp-ct { font-size: 14px; color: rgba(255,255,255,0.32); line-height: 1.65; }
        .lp-ct strong { color: rgba(255,255,255,0.65); font-weight: 500; }
        .lp-how { text-align: center; padding: 140px 48px; max-width: 1100px; margin: 0 auto; }
        .lp-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-top: 72px; text-align: left; }
        .lp-step { padding: 30px; background: #0d0d0d; border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; position: relative; overflow: hidden; transition: border-color 0.3s; }
        .lp-step:hover { border-color: rgba(255,255,255,0.15); }
        .lp-sn { font-family: var(--serif); font-size: 60px; font-weight: 400; color: rgba(255,255,255,0.03); position: absolute; top: 12px; right: 20px; line-height: 1; }
        .lp-si2 { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; font-size: 17px; }
        .lp-stitle { font-size: 18px; font-weight: 600; color: #f8f7f4; margin-bottom: 10px; letter-spacing: -0.2px; }
        .lp-sbody { font-size: 14px; color: rgba(255,255,255,0.38); line-height: 1.7; }
        .lp-magic { padding: 160px 48px; background: linear-gradient(180deg, #080808 0%, #07070f 50%, #080808 100%); text-align: center; position: relative; overflow: hidden; }
        .lp-magic::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 65%); pointer-events: none; }
        .lp-magic-in { max-width: 740px; margin: 0 auto; position: relative; }
        .lp-flow { display: flex; align-items: stretch; justify-content: center; gap: 0; margin: 72px auto 0; max-width: 900px; position: relative; }
        .lp-fs { flex: 1; text-align: center; padding: 36px 20px; background: #0d0d0d; border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; transition: border-color 0.3s, transform 0.3s; }
        .lp-fs:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-4px); }
        .lp-fs + .lp-fs { margin-left: 10px; }
        .lp-fi { font-size: 28px; margin-bottom: 14px; display: block; }
        .lp-ft { font-size: 14px; font-weight: 600; color: #f8f7f4; margin-bottom: 7px; }
        .lp-fb { font-size: 12px; color: rgba(255,255,255,0.32); line-height: 1.6; }
        .lp-arr { font-size: 18px; color: rgba(255,255,255,0.12); flex-shrink: 0; display: flex; align-items: center; margin: 0 -5px; position: relative; z-index: 1; }
        .lp-feat { padding: 140px 48px; max-width: 1100px; margin: 0 auto; }
        .lp-fg { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 72px; }
        .lp-fc { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 32px; overflow: hidden; transition: border-color 0.3s; }
        .lp-fc:hover { border-color: rgba(255,255,255,0.14); }
        .lp-fc.span2 { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
        .lp-fl { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.22); margin-bottom: 14px; }
        .lp-fh { font-family: var(--serif); font-size: 26px; font-weight: 400; color: #f8f7f4; line-height: 1.2; margin-bottom: 12px; letter-spacing: -0.3px; }
        .lp-fb2 { font-size: 14px; color: rgba(255,255,255,0.38); line-height: 1.7; }
        .lp-fv { background: #111; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 18px; }
        .lp-metrics { padding: 120px 48px; background: #0a0a0a; }
        .lp-mg { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); border-radius: 18px; overflow: hidden; margin-top: 60px; }
        .lp-m { background: #0a0a0a; padding: 36px 28px; text-align: center; }
        .lp-mv { font-family: var(--serif); font-size: 52px; font-weight: 400; color: #f8f7f4; line-height: 1; margin-bottom: 10px; letter-spacing: -1px; }
        .lp-ml { font-size: 13px; color: rgba(255,255,255,0.32); line-height: 1.5; }
        .lp-bf { padding: 140px 48px; background: #080808; text-align: center; position: relative; overflow: hidden; }
        .lp-bf::before { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 800px; height: 400px; background: radial-gradient(ellipse at bottom, rgba(37,99,235,0.06) 0%, transparent 65%); pointer-events: none; }
        .lp-bf-in { max-width: 660px; margin: 0 auto; position: relative; }
        .lp-tags { display: flex; flex-wrap: wrap; gap: 9px; justify-content: center; margin-top: 44px; }
        .lp-tag { padding: 9px 18px; border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; font-size: 14px; color: rgba(255,255,255,0.45); transition: all 0.2s; cursor: default; }
        .lp-tag:hover { border-color: rgba(255,255,255,0.22); color: #f8f7f4; }
        .lp-cta { padding: 180px 48px; text-align: center; position: relative; overflow: hidden; }
        .lp-cta::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 900px; height: 500px; background: radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 65%); pointer-events: none; }
        .lp-cta-in { position: relative; max-width: 680px; margin: 0 auto; }
        .lp-fh2 { font-family: var(--serif); font-size: clamp(44px, 6vw, 78px); font-weight: 400; line-height: 1.08; letter-spacing: -1px; color: #f8f7f4; margin-bottom: 22px; }
        .lp-fh2 em { font-style: italic; color: rgba(255,255,255,0.38); }
        .lp-fs2 { font-size: 17px; color: rgba(255,255,255,0.38); margin-bottom: 44px; line-height: 1.6; }
        .lp-footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 36px 48px; display: flex; align-items: center; justify-content: space-between; }
        .lp-fc2 { font-size: 13px; color: rgba(255,255,255,0.2); }
        .lp-flinks { display: flex; gap: 22px; list-style: none; }
        .lp-flinks a { font-size: 13px; color: rgba(255,255,255,0.22); text-decoration: none; transition: color 0.2s; }
        .lp-flinks a:hover { color: rgba(255,255,255,0.55); }
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        @media (max-width: 768px) {
          .lp-nav { padding: 0 20px; }
          .lp-navlinks { display: none; }
          .lp-hero { padding: 120px 20px 72px; }
          .lp-h1 { font-size: 44px; }
          .lp-ui-body { grid-template-columns: 1fr; }
          .lp-sidebar { display: none; }
          .lp-chaos { grid-template-columns: 1fr; }
          .lp-steps { grid-template-columns: 1fr; }
          .lp-flow { flex-direction: column; }
          .lp-fs + .lp-fs { margin-left: 0; margin-top: 10px; }
          .lp-fg { grid-template-columns: 1fr; }
          .lp-fc.span2 { grid-column: span 1; grid-template-columns: 1fr; }
          .lp-mg { grid-template-columns: 1fr 1fr; }
          .lp-footer { flex-direction: column; gap: 16px; text-align: center; }
          .lp-section, .lp-how, .lp-feat { padding: 80px 20px; }
          .lp-problem, .lp-magic, .lp-bf, .lp-cta { padding: 80px 20px; }
          .lp-metrics { padding: 80px 20px; }
        }
      `}</style>

      <div className="lp">
        {/* Nav */}
        <nav className="lp-nav">
          <Link href="/" className="lp-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" fill="rgba(37,99,235,0.12)"/>
              <circle cx="14" cy="5.5" r="2.2" fill="#60a5fa"/>
              <circle cx="6.5" cy="19.5" r="2.2" fill="#60a5fa"/>
              <circle cx="21.5" cy="19.5" r="2.2" fill="#60a5fa"/>
              <circle cx="14" cy="14" r="3.5" fill="#3b82f6"/>
              <line x1="14" y1="7.7" x2="14" y2="10.5" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="8.4" y1="17.8" x2="11.2" y2="15.6" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="19.6" y1="17.8" x2="16.8" y2="15.6" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="1.2" fill="white" fillOpacity="0.9"/>
            </svg>
            <span className="lp-wordmark">Cervio</span>
          </Link>
          <ul className="lp-navlinks">
            <li><a href="#how">How it works</a></li>
            <li><a href="#features">Features</a></li>
            <li><Link href="/auth/login">Sign in</Link></li>
            <li><Link href="/auth/login" className="lp-navcta">Get started</Link></li>
          </ul>
        </nav>

        {/* Hero */}
        <div className="lp-hero">
          <div className="lp-hero-glow" />
          <div className="lp-label">AI Chief of Staff</div>
          <h1 className="lp-h1">Your business,<br /><em>operated.</em></h1>
          <p className="lp-sub">Cervio sees what's breaking, decides what to do, and executes — before you even ask.</p>
          <div className="lp-actions">
            <Link href="/auth/login" className="lp-btn-p">
              Start operating
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <a href="#how" className="lp-btn-g">See how it works →</a>
          </div>

          {/* Product UI mockup */}
          <div className="lp-ui">
            <div className="lp-ui-bar">
              <div className="lp-dot" style={{background:'#ff5f56'}} />
              <div className="lp-dot" style={{background:'#ffbd2e'}} />
              <div className="lp-dot" style={{background:'#27c93f'}} />
              <div style={{flex:1,textAlign:'center',fontSize:'12px',color:'rgba(255,255,255,0.18)'}}>cervio.ai — Command Centre</div>
            </div>
            <div className="lp-ui-body">
              <div className="lp-sidebar">
                {[{icon:'⊞',label:'Dashboard',on:true},{icon:'⚡',label:'Decisions'},{icon:'◎',label:'Goals'},{icon:'✦',label:'Coach'},{icon:'📅',label:'Calendar'},{icon:'★',label:'Weekly Review'}].map(item => (
                  <div key={item.label} className={`lp-si ${item.on ? 'on' : ''}`}>
                    <div className="lp-si-ico">{item.icon}</div>
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="lp-main">
                <div>
                  <div className="lp-st">AI Decisions Required · 2</div>
                  <div className="lp-dec">
                    <div className="lp-badge">Blocking execution</div>
                    <div className="lp-dt">Renew agency contract at $18k/month?</div>
                    <div className="lp-dr">Delivery slipped 3 of 4 months. Two alternatives in your network.</div>
                    <div className="lp-rec">✗ Cervio recommends: Reject · 88% confidence</div>
                    <div className="lp-brow">
                      <div className="lp-ba lp-ba-g">✓ Approve & Execute</div>
                      <div className="lp-ba lp-ba-d">⏸ Delay</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="lp-st">Execution in Progress</div>
                  <div className="lp-exec">
                    <div className="lp-eh">
                      <div className="lp-edot" />
                      <div className="lp-el">Executing — Q2 Revenue Plan</div>
                      <div style={{marginLeft:'auto',fontSize:'11px',color:'rgba(255,255,255,0.28)'}}>40%</div>
                    </div>
                    {[{done:true,text:'Define revenue milestone'},{done:true,text:'Select acquisition channel'},{done:false,text:'Set KPI tracking system',active:true},{done:false,text:'Schedule weekly review'}].map((t,i) => (
                      <div key={i} className="lp-task">
                        <div className={`lp-tc ${t.done ? 'done' : ''}`} style={t.active && !t.done ? {borderColor:'rgba(37,99,235,0.5)',background:'rgba(37,99,235,0.1)'} : {}}>{t.done ? '✓' : ''}</div>
                        <span style={t.active ? {color:'rgba(255,255,255,0.75)'} : {}}>{t.text}</span>
                      </div>
                    ))}
                    <div className="lp-pb"><div className="lp-pf" /></div>
                  </div>
                </div>
                <div className="lp-health">
                  <div>
                    <div className="lp-hs">68</div>
                    <div className="lp-hl">/100 health</div>
                  </div>
                  <div className="lp-hbars">
                    {[{label:'Revenue',w:'54%',c:'#f59e0b'},{label:'Execution',w:'70%',c:'#3b82f6'},{label:'Team',w:'80%',c:'#22c55e'},{label:'Risk',w:'42%',c:'#ef4444'}].map(b => (
                      <div key={b.label} className="lp-hb">
                        <div className="lp-hbl">{b.label}</div>
                        <div className="lp-hbt"><div className="lp-hbf" style={{width:b.w,background:b.c}} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Problem */}
        <div className="lp-problem">
          <div className="lp-problem-in reveal">
            <div className="lp-eyebrow">The reality</div>
            <h2 className="lp-sh">Companies don't fail from lack of ideas.<br />They fail from lack of execution.</h2>
            <p className="lp-ss">Decisions pile up. Risks go undetected. Work stalls. By the time you notice, you're already behind.</p>
          </div>
          <div className="lp-chaos reveal">
            {[
              {n:'73%',t:<>of strategic decisions are made with <strong>incomplete information</strong> — or delayed until it's too late.</>},
              {n:'4.2h',t:<>The average CEO loses <strong>4.2 hours per day</strong> to reactive decision-making and status checks.</>},
              {n:'60%',t:<>of approved decisions are <strong>never properly executed.</strong> The work simply doesn't happen.</>},
            ].map((c,i) => (
              <div key={i} className="lp-cc">
                <div className="lp-cn">{c.n}</div>
                <div className="lp-ct">{c.t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How */}
        <div id="how" className="lp-how">
          <div className="reveal">
            <div className="lp-eyebrow">How Cervio works</div>
            <h2 className="lp-sh">Sees. Decides. Executes.</h2>
            <p className="lp-ss">Three systems working continuously so your business actually moves forward.</p>
          </div>
          <div className="lp-steps">
            {[
              {n:'1',icon:'🔍',bg:'rgba(220,38,38,0.1)',title:'Sees what\'s wrong',body:'Cervio monitors your goals, decisions, pipeline, and relationships — detecting risks and bottlenecks before they become crises.'},
              {n:'2',icon:'⚡',bg:'rgba(37,99,235,0.1)',title:'Tells you what to do',body:'Every decision comes with a recommendation, confidence score, and consequence model. Approve or override in seconds.'},
              {n:'3',icon:'✓',bg:'rgba(22,163,74,0.1)',title:'Executes and tracks it',body:'One tap. Tasks created, owners assigned, follow-ups scheduled. Cervio tracks until done and scores its own accuracy.'},
            ].map((s,i) => (
              <div key={i} className="lp-step reveal" style={{transitionDelay:`${(i+1)*0.1}s`}}>
                <div className="lp-sn">{s.n}</div>
                <div className="lp-si2" style={{background:s.bg}}>{s.icon}</div>
                <div className="lp-stitle">{s.title}</div>
                <div className="lp-sbody">{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Magic */}
        <div className="lp-magic">
          <div className="lp-magic-in reveal">
            <div className="lp-eyebrow">The moment</div>
            <h2 className="lp-sh">You click approve.<br />Cervio does the rest.</h2>
            <p className="lp-ss">No follow-up emails. No lost action items. No wondering if it happened.</p>
          </div>
          <div className="lp-flow reveal">
            {[
              {icon:'⚡',title:'Decision surfaces',body:'Identified with full context and a recommendation ready.'},
              {icon:'✓',title:'You approve',body:'One tap. Your entire input. Cervio handles everything downstream.'},
              {icon:'⚙',title:'Execution starts',body:'Tasks created. Owners assigned. Messages drafted.'},
              {icon:'📊',title:'Outcome tracked',body:'Scored against prediction. Cervio learns your patterns.'},
            ].map((s,i) => (
              <>
                <div key={`s${i}`} className="lp-fs">
                  <span className="lp-fi">{s.icon}</span>
                  <div className="lp-ft">{s.title}</div>
                  <div className="lp-fb">{s.body}</div>
                </div>
                {i < 3 && <div key={`a${i}`} className="lp-arr">›</div>}
              </>
            ))}
          </div>
        </div>

        {/* Features */}
        <div id="features" className="lp-feat">
          <div className="reveal">
            <div className="lp-eyebrow">What's inside</div>
            <h2 className="lp-sh">Every system your business needs.</h2>
          </div>
          <div className="lp-fg">
            <div className="lp-fc span2 reveal">
              <div>
                <div className="lp-fl">Decision Engine</div>
                <h3 className="lp-fh">Every decision comes with a recommendation.</h3>
                <p className="lp-fb2">Approve, reject, or delay — with full reasoning, confidence scores, and consequence modelling. Cervio tracks your accuracy over time and identifies where your instincts are costing you.</p>
              </div>
              <div className="lp-fv">
                <div style={{fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'12px'}}>Decision Required</div>
                <div style={{fontSize:'14px',fontWeight:600,color:'rgba(255,255,255,0.88)',marginBottom:'7px',lineHeight:1.3}}>Expand into the UK market this quarter?</div>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,0.32)',marginBottom:'12px',lineHeight:1.6}}>Cash position 4.2 months runway. Market timing strong, execution resources stretched.</div>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:'11px',fontWeight:700,color:'#fbbf24',background:'rgba(251,191,36,0.1)',padding:'5px 10px',borderRadius:7,marginBottom:12}}>⏸ Delay · 76% confidence</div>
                <div style={{display:'flex',gap:8}}>
                  <div style={{padding:'6px 12px',background:'#16a34a',color:'white',borderRadius:8,fontSize:'11px',fontWeight:600}}>Approve anyway</div>
                  <div style={{padding:'6px 12px',background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.4)',borderRadius:8,fontSize:'11px'}}>Follow recommendation</div>
                </div>
              </div>
            </div>
            {[
              {label:'Business Health',title:'One number. Everything it takes to fix it.',body:'Revenue, execution, team, and risk — scored in real time. Every red component has a specific intervention.',delay:'0.1s'},
              {label:'Accountability System',title:'Cervio doesn\'t let things slide.',body:'"You\'ve delayed this 3 times. This is blocking execution." It detects avoidance patterns and names them directly.',delay:'0.2s'},
              {label:'Predictive Intelligence',title:'Knows what will break before it does.',body:'Revenue risk, execution bottlenecks, cold relationships — surfaced while you still have time to act.',delay:'0.3s'},
              {label:'Execution Layer',title:'Decisions create immediate motion.',body:'Approve a decision. Tasks created, owners assigned, messages drafted, meetings scheduled — automatically.',delay:'0.4s'},
            ].map((f,i) => (
              <div key={i} className="lp-fc reveal" style={{transitionDelay:f.delay}}>
                <div className="lp-fl">{f.label}</div>
                <h3 className="lp-fh">{f.title}</h3>
                <p className="lp-fb2">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="lp-metrics">
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div className="reveal" style={{textAlign:'center',maxWidth:560,margin:'0 auto'}}>
              <div className="lp-eyebrow">The impact</div>
              <h2 className="lp-sh">Run your company with clarity.</h2>
            </div>
            <div className="lp-mg reveal">
              {[
                {v:'3×',l:'Faster decision-making with AI recommendations'},
                {v:'84%',l:'Decision accuracy tracked and improved over time'},
                {v:'4h',l:'Average daily time saved on status checks'},
                {v:'0',l:'Decisions lost, stalled, or forgotten after approval'},
              ].map((m,i) => (
                <div key={i} className="lp-m">
                  <div className="lp-mv">{m.v}</div>
                  <div className="lp-ml">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Built for */}
        <div className="lp-bf">
          <div className="lp-bf-in reveal">
            <div className="lp-eyebrow">Built for</div>
            <h2 className="lp-sh">Operators who move fast and hate excuses.</h2>
            <p className="lp-ss" style={{marginTop:14}}>Not a tool for thinking about your business. A system for running it.</p>
            <div className="lp-tags">
              {['Founders','CEOs','COOs','Series A — C','Scale-up operators','Executive teams','Anyone who ships'].map(t => (
                <div key={t} className="lp-tag">{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="lp-cta">
          <div className="lp-cta-in reveal">
            <h2 className="lp-fh2">Stop managing.<br /><em>Start operating.</em></h2>
            <p className="lp-fs2">Your business is ready to run properly. Cervio is ready when you are.</p>
            <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
              <Link href="/auth/login" className="lp-btn-p" style={{fontSize:16,padding:'16px 36px'}}>
                Start operating your business
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
            <p style={{marginTop:18,fontSize:13,color:'rgba(255,255,255,0.18)'}}>Free trial · No credit card · Built by Morphotech</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="lp-footer">
          <div className="lp-fc2">© 2026 Morphotech Australia Pty Ltd</div>
          <ul className="lp-flinks">
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/auth/login">Sign in</Link></li>
            <li><Link href="/auth/login">Get started</Link></li>
          </ul>
        </footer>
      </div>

      <script dangerouslySetInnerHTML={{__html:`
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              const d = parseFloat(e.target.style.transitionDelay || '0') * 1000
              setTimeout(() => e.target.classList.add('visible'), d)
              obs.unobserve(e.target)
            }
          })
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
      `}} />
    </>
  )
}
