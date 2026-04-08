import Link from 'next/link'

export const metadata = {
  title: 'Cervio — Stop managing. Start operating.',
  description: 'Cervio turns decisions into execution and keeps your business moving.',
}

export default function LandingPage() {
  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;400;500;600;700;800&display=swap');

        .lp *, .lp *::before, .lp *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lp {
          font-family: 'DM Sans', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          background: #0a0a0a;
          color: #f0efe9;
        }

        /* ── NAV ─────────────────────────────────── */
        .lp nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 58px; padding: 0 48px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(10,10,10,0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(240,239,233,0.06);
        }
        .lp-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .lp-logo-name { font-weight: 700; font-size: 16px; color: #f0efe9; letter-spacing: -0.3px; }
        .lp-nav-links { display: flex; align-items: center; gap: 32px; }
        .lp-nav-links a { font-size: 14px; color: rgba(240,239,233,0.45); text-decoration: none; transition: color 0.15s; }
        .lp-nav-links a:hover { color: #f0efe9; }
        .lp-nav-cta {
          background: #f0efe9 !important; color: #0a0a0a !important;
          font-weight: 700 !important; font-size: 13px !important;
          padding: 8px 20px !important; border-radius: 100px !important;
          transition: opacity 0.15s !important;
        }
        .lp-nav-cta:hover { opacity: 0.85 !important; }

        /* ── HERO ────────────────────────────────── */
        .lp-hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 100px 40px 80px;
          position: relative; overflow: hidden;
          background: #0a0a0a;
        }

        .lp-hero-radial {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(29,78,216,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 50% 100%, rgba(29,78,216,0.06) 0%, transparent 60%);
        }

        .lp-hero-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(240,239,233,0.28); margin-bottom: 24px;
          animation: lp-rise 0.6s ease both;
        }
        .lp-hero-tag-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #3b82f6;
          animation: lp-breathe 2.5s ease-in-out infinite;
        }

        .lp-h1 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(58px, 8.5vw, 112px);
          font-weight: 400; line-height: 0.94; letter-spacing: -3px;
          color: #f0efe9; max-width: 860px;
          margin-bottom: 22px;
          animation: lp-rise 0.8s ease 0.15s both;
        }
        .lp-h1 em { font-style: italic; color: rgba(240,239,233,0.3); }

        .lp-hero-sub {
          font-size: 18px; font-weight: 300; color: rgba(240,239,233,0.45);
          max-width: 400px; line-height: 1.6; margin-bottom: 40px;
          animation: lp-rise 0.8s ease 0.28s both;
        }

        .lp-hero-actions {
          display: flex; align-items: center; gap: 12px; margin-bottom: 80px;
          animation: lp-rise 0.8s ease 0.38s both;
        }

        .lp-btn-primary {
          background: #f0efe9; color: #0a0a0a;
          padding: 14px 32px; border-radius: 100px;
          font-size: 15px; font-weight: 700; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          transition: opacity 0.15s, transform 0.15s;
          letter-spacing: -0.2px; box-shadow: 0 2px 12px rgba(240,239,233,0.15);
        }
        .lp-btn-primary:hover { opacity: 0.85; transform: translateY(-2px); }

        .lp-btn-ghost {
          font-size: 14px; color: rgba(240,239,233,0.38);
          text-decoration: none; padding: 14px 16px; transition: color 0.15s;
        }
        .lp-btn-ghost:hover { color: #f0efe9; }

        /* ── SCREEN ──────────────────────────────── */
        .lp-screen-wrap {
          width: 100%; max-width: 920px; position: relative;
          animation: lp-screen-in 1s ease 0.5s both;
        }

        .lp-screen-wrap::before {
          content: '';
          position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%);
          width: 80%; height: 60px;
          background: radial-gradient(ellipse, rgba(29,78,216,0.2) 0%, transparent 70%);
          filter: blur(20px); pointer-events: none;
        }

        .lp-screen {
          border-radius: 20px; overflow: hidden;
          border: 1px solid rgba(240,239,233,0.08);
          box-shadow:
            0 0 0 1px rgba(240,239,233,0.03),
            0 32px 80px rgba(0,0,0,0.7),
            0 8px 24px rgba(0,0,0,0.4);
          background: #111113;
        }

        .lp-s-bar {
          background: #0d0d0f; padding: 11px 14px;
          display: flex; align-items: center; gap: 7px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .lp-s-dot { width: 9px; height: 9px; border-radius: 50%; }
        .lp-s-url {
          flex: 1; text-align: center; font-size: 11px;
          color: rgba(255,255,255,0.14); letter-spacing: 0.2px;
        }

        .lp-s-body { display: grid; grid-template-columns: 188px 1fr; }

        .lp-s-nav {
          background: #0a0a0b; border-right: 1px solid rgba(255,255,255,0.04);
          padding: 16px 0; min-height: 360px;
        }
        .lp-s-ni {
          padding: 8px 14px; font-size: 12px; color: rgba(255,255,255,0.24);
          display: flex; align-items: center; gap: 9px;
        }
        .lp-s-ni.on { color: rgba(255,255,255,0.82); background: rgba(255,255,255,0.04); }
        .lp-s-ni-ico {
          width: 15px; height: 15px; border-radius: 4px;
          background: rgba(255,255,255,0.04);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; flex-shrink: 0;
        }
        .lp-s-ni.on .lp-s-ni-ico { background: rgba(29,78,216,0.25); }
        .lp-s-div { height: 1px; background: rgba(255,255,255,0.04); margin: 8px 0; }

        .lp-s-main { padding: 18px; display: flex; flex-direction: column; gap: 10px; }
        .lp-s-lbl {
          font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
          text-transform: uppercase; color: rgba(255,255,255,0.2); margin-bottom: 6px;
        }

        /* Decision card inside screen */
        .lp-s-dec {
          background: #151517; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px; padding: 14px; position: relative; overflow: hidden;
        }
        .lp-s-dec::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #dc2626, transparent 60%);
        }
        .lp-s-dec-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
          color: #f87171; background: rgba(220,38,38,0.12); padding: 2px 7px;
          border-radius: 20px; margin-bottom: 8px;
        }
        .lp-s-dec-tag::before {
          content: ''; width: 4px; height: 4px; border-radius: 50%; background: #f87171;
          animation: lp-breathe 1.5s ease-in-out infinite;
        }
        .lp-s-dec-t { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.9); margin-bottom: 5px; line-height: 1.3; }
        .lp-s-dec-b { font-size: 10px; color: rgba(255,255,255,0.3); margin-bottom: 10px; line-height: 1.5; }
        .lp-s-rec {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 700; color: #4ade80;
          background: rgba(74,222,128,0.1); padding: 4px 9px; border-radius: 7px; margin-bottom: 10px;
        }
        .lp-s-btns { display: flex; gap: 7px; }
        .lp-s-btn { padding: 6px 12px; border-radius: 7px; font-size: 10px; font-weight: 700; cursor: default; border: none; }
        .lp-s-btn-go {
          background: #166534; color: white; position: relative; overflow: hidden;
          box-shadow: 0 1px 4px rgba(22,101,52,0.4);
        }
        .lp-s-btn-go::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: lp-sheen 2.5s ease 2s infinite;
        }
        .lp-s-btn-sk { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.35); }

        /* Execution card */
        .lp-s-exec {
          background: #151517; border: 1px solid rgba(29,78,216,0.25);
          border-radius: 11px; padding: 14px;
        }
        .lp-s-exec-h { display: flex; align-items: center; gap: 7px; margin-bottom: 9px; }
        .lp-s-exec-dot { width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; animation: lp-breathe 1.5s ease-in-out infinite; }
        .lp-s-exec-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #60a5fa; }
        .lp-s-exec-pct { margin-left: auto; font-size: 10px; color: rgba(255,255,255,0.28); }
        .lp-s-task { display: flex; align-items: center; gap: 7px; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 10px; color: rgba(255,255,255,0.45); }
        .lp-s-task:last-of-type { border-bottom: none; }
        .lp-s-chk { width: 13px; height: 13px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.1); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 7px; }
        .lp-s-chk.done { background: #166534; border-color: #166534; color: white; }
        .lp-s-pb { height: 2px; background: rgba(255,255,255,0.07); border-radius: 1px; margin-top: 9px; overflow: hidden; }
        .lp-s-pf { height: 100%; width: 40%; background: linear-gradient(90deg, #1d4ed8, #60a5fa); border-radius: 1px; animation: lp-pb 2s ease 1.5s both; }

        /* Health row */
        .lp-s-health {
          background: #151517; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 11px; padding: 12px; display: flex; align-items: center; gap: 12px;
        }
        .lp-s-score { font-size: 28px; font-weight: 800; color: #4ade80; line-height: 1; }
        .lp-s-score-s { font-size: 9px; color: rgba(255,255,255,0.25); margin-top: 2px; }
        .lp-s-bars { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        .lp-s-bar { display: flex; flex-direction: column; gap: 2px; }
        .lp-s-bar-l { font-size: 8px; color: rgba(255,255,255,0.24); text-transform: uppercase; letter-spacing: 0.4px; }
        .lp-s-bar-t { height: 2px; background: rgba(255,255,255,0.07); border-radius: 1px; overflow: hidden; }
        .lp-s-bar-f { height: 100%; border-radius: 1px; animation: lp-pb 1.5s ease 1.8s both; }

        /* ── KEYFRAMES ───────────────────────────── */
        @keyframes lp-rise { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lp-screen-in { from{opacity:0;transform:translateY(36px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes lp-breathe { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.5)} }
        @keyframes lp-sheen { to { left: 100%; } }
        @keyframes lp-pb { from{width:0} }
        @keyframes lp-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        /* ── SECTION BASE ────────────────────────── */
        .lp-sec { padding: 160px 40px; }
        .lp-sec-inner { max-width: 1080px; margin: 0 auto; }
        .lp-sec-center { text-align: center; }

        .lp-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(240,239,233,0.28); margin-bottom: 20px;
        }

        /* ── TYPOGRAPHY ──────────────────────────── */
        .lp-display {
          font-family: 'Instrument Serif', Georgia, serif;
          font-weight: 400; letter-spacing: -1.5px; line-height: 1.05;
          color: #f0efe9;
        }
        .lp-display em { font-style: italic; color: rgba(240,239,233,0.32); }

        .lp-body-large { font-size: 18px; font-weight: 300; color: rgba(240,239,233,0.48); line-height: 1.65; }
        .lp-body { font-size: 15px; font-weight: 400; color: rgba(240,239,233,0.5); line-height: 1.65; }

        /* ── TENSION ─────────────────────────────── */
        .lp-tension { background: #0a0a0a; padding: 160px 40px; }
        .lp-tension-inner { max-width: 1080px; margin: 0 auto; text-align: center; }

        .lp-contrast {
          display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
          max-width: 780px; margin: 64px auto 0;
          border-radius: 16px; overflow: hidden;
          border: 1px solid rgba(240,239,233,0.07);
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
        }
        .lp-contrast-col { padding: 36px 32px; }
        .lp-contrast-col.bad { background: rgba(185,28,28,0.06); }
        .lp-contrast-col.good { background: rgba(22,101,52,0.07); }
        .lp-contrast-label {
          font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 22px;
        }
        .bad .lp-contrast-label { color: rgba(248,113,113,0.5); }
        .good .lp-contrast-label { color: rgba(74,222,128,0.5); }
        .lp-contrast-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 13px; font-size: 14px; line-height: 1.55; }
        .bad .lp-contrast-item { color: rgba(240,239,233,0.42); }
        .good .lp-contrast-item { color: rgba(240,239,233,0.65); }
        .lp-ci-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; margin-top: 8px; }
        .bad .lp-ci-dot { background: rgba(248,113,113,0.4); }
        .good .lp-ci-dot { background: rgba(74,222,128,0.5); }

        /* ── MAGIC ───────────────────────────────── */
        .lp-magic {
          background: linear-gradient(180deg, #0a0a0a 0%, #070710 45%, #070710 55%, #0a0a0a 100%);
          padding: 180px 40px; text-align: center; position: relative; overflow: hidden;
        }
        .lp-magic::before {
          content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          width: 700px; height: 500px;
          background: radial-gradient(ellipse, rgba(29,78,216,0.1) 0%, transparent 65%);
          pointer-events: none;
        }
        .lp-magic-inner { max-width: 740px; margin: 0 auto; position: relative; }
        .lp-magic-steps {
          display: flex; gap: 0; max-width: 960px; margin: 72px auto 0;
          position: relative;
        }
        .lp-magic-step {
          flex: 1; padding: 32px 22px; background: #111113;
          border: 1px solid rgba(240,239,233,0.08); border-radius: 16px;
          text-align: left; position: relative;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .lp-magic-step:hover {
          border-color: rgba(240,239,233,0.15);
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.5);
        }
        .lp-magic-step + .lp-magic-step { margin-left: 10px; }
        .lp-ms-n {
          font-family: 'Instrument Serif', serif; font-size: 52px; font-weight: 400;
          color: rgba(240,239,233,0.04); position: absolute; top: 12px; right: 16px; line-height: 1;
        }
        .lp-ms-icon { font-size: 24px; margin-bottom: 14px; display: block; }
        .lp-ms-title { font-size: 14px; font-weight: 700; color: #f0efe9; margin-bottom: 8px; line-height: 1.3; }
        .lp-ms-body { font-size: 13px; color: rgba(240,239,233,0.35); line-height: 1.65; }

        /* ── IMPACT ──────────────────────────────── */
        .lp-impact { background: #0a0a0a; padding: 160px 40px; }
        .lp-impact-inner { max-width: 1080px; margin: 0 auto; text-align: center; }
        .lp-impact-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-top: 72px; }
        .lp-impact-card {
          background: #111113; border: 1px solid rgba(240,239,233,0.08);
          border-radius: 18px; padding: 36px 28px;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .lp-impact-card:hover {
          border-color: rgba(240,239,233,0.14);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.5);
        }
        .lp-impact-num {
          font-family: 'Instrument Serif', serif; font-size: 62px; font-weight: 400;
          color: #f0efe9; line-height: 1; letter-spacing: -2px; margin-bottom: 10px;
        }
        .lp-impact-label { font-size: 10px; font-weight: 700; letter-spacing: 1.3px; text-transform: uppercase; color: rgba(240,239,233,0.28); margin-bottom: 10px; }
        .lp-impact-body { font-size: 14px; color: rgba(240,239,233,0.42); line-height: 1.6; }

        /* ── FOR ─────────────────────────────────── */
        .lp-for {
          background: linear-gradient(180deg, #0a0a0a 0%, #0c0c12 100%);
          padding: 160px 40px; text-align: center;
        }
        .lp-for-inner { max-width: 640px; margin: 0 auto; }
        .lp-tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 44px; }
        .lp-tag {
          padding: 10px 20px; border: 1px solid rgba(240,239,233,0.1);
          border-radius: 100px; font-size: 14px; color: rgba(240,239,233,0.42);
          transition: all 0.15s; cursor: default; background: rgba(240,239,233,0.02);
        }
        .lp-tag:hover { border-color: rgba(240,239,233,0.22); color: #f0efe9; }

        /* ── FINALE ──────────────────────────────── */
        .lp-finale {
          background: #0a0a0a; padding: 200px 40px; text-align: center;
          position: relative; overflow: hidden;
        }
        .lp-finale::before {
          content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          width: 900px; height: 500px;
          background: radial-gradient(ellipse, rgba(29,78,216,0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        .lp-finale-inner { max-width: 680px; margin: 0 auto; position: relative; }
        .lp-finale-note { margin-top: 20px; font-size: 12px; color: rgba(240,239,233,0.2); }

        /* ── FOOTER ──────────────────────────────── */
        .lp footer {
          background: #0a0a0a; border-top: 1px solid rgba(240,239,233,0.06);
          padding: 36px 48px; display: flex; align-items: center; justify-content: space-between;
        }
        .lp-footer-copy { font-size: 12px; color: rgba(240,239,233,0.2); }
        .lp-footer-links { display: flex; gap: 24px; list-style: none; }
        .lp-footer-links a { font-size: 12px; color: rgba(240,239,233,0.25); text-decoration: none; transition: color 0.15s; }
        .lp-footer-links a:hover { color: rgba(240,239,233,0.6); }

        /* ── DIVIDER ─────────────────────────────── */
        .lp-divider {
          max-width: 1px; height: 80px; background: rgba(240,239,233,0.08);
          margin: 0 auto;
        }

        /* ── RESPONSIVE ──────────────────────────── */
        @media (max-width: 768px) {
          .lp nav { padding: 0 20px; }
          .lp-nav-links a:not(.lp-nav-cta) { display: none; }
          .lp-hero { padding: 90px 20px 60px; }
          .lp-h1 { letter-spacing: -2px; }
          .lp-s-body { grid-template-columns: 1fr; }
          .lp-s-nav { display: none; }
          .lp-sec, .lp-tension, .lp-magic, .lp-impact, .lp-for, .lp-finale { padding: 100px 20px; }
          .lp-contrast { grid-template-columns: 1fr; }
          .lp-magic-steps { flex-direction: column; }
          .lp-magic-step + .lp-magic-step { margin-left: 0; margin-top: 10px; }
          .lp-impact-grid { grid-template-columns: 1fr; }
          .lp footer { flex-direction: column; gap: 16px; text-align: center; padding: 32px 20px; }
        }
      `}</style>

      <div className="lp">

        {/* NAV */}
        <nav>
          <Link href="/" className="lp-logo">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="12" fill="rgba(29,78,216,0.15)"/>
              <circle cx="13" cy="5" r="2" fill="#60a5fa"/>
              <circle cx="6" cy="18.5" r="2" fill="#60a5fa"/>
              <circle cx="20" cy="18.5" r="2" fill="#60a5fa"/>
              <circle cx="13" cy="13" r="3.2" fill="#3b82f6"/>
              <line x1="13" y1="7" x2="13" y2="9.8" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="7.8" y1="16.8" x2="10.3" y2="14.8" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="18.2" y1="16.8" x2="15.7" y2="14.8" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="13" cy="13" r="1.1" fill="white" fillOpacity="0.95"/>
            </svg>
            <span className="lp-logo-name">Cervio</span>
          </Link>
          <div className="lp-nav-links">
            <a href="#tension">Why Cervio</a>
            <a href="#magic">How it works</a>
            <Link href="/auth/login">Sign in</Link>
            <Link href="/auth/login" className="lp-nav-cta">Get started</Link>
          </div>
        </nav>

        {/* ── HERO ──────────────────────────────────── */}
        <section className="lp-hero">
          <div className="lp-hero-radial"/>

          <div className="lp-hero-tag">
            <div className="lp-hero-tag-dot"/>
            AI Chief of Staff
          </div>

          <h1 className="lp-h1">
            Stop managing.<br/><em>Start operating.</em>
          </h1>

          <p className="lp-hero-sub">
            Cervio turns decisions into execution and keeps your business moving.
          </p>

          <div className="lp-hero-actions">
            <Link href="/auth/login" className="lp-btn-primary">
              Start Operating
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5h9M7 2l4.5 4.5L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="#tension" className="lp-btn-ghost">See why →</a>
          </div>

          {/* Cinematic screen */}
          <div className="lp-screen-wrap">
            <div className="lp-screen">
              <div className="lp-s-bar">
                <div className="lp-s-dot" style={{background:'#ff5f56'}}/>
                <div className="lp-s-dot" style={{background:'#ffbd2e'}}/>
                <div className="lp-s-dot" style={{background:'#27c93f'}}/>
                <div className="lp-s-url">cervio.ai — Command Centre</div>
              </div>
              <div className="lp-s-body">
                <div className="lp-s-nav">
                  {[{i:'⊞',l:'Dashboard',on:true},{i:'⚡',l:'Decisions'},{i:'◎',l:'Goals'},{i:'✦',l:'Coach'},{i:'📅',l:'Calendar'},{i:'★',l:'Weekly Review'}].map(item => (
                    <div key={item.l} className={`lp-s-ni ${item.on?'on':''}`}>
                      <div className="lp-s-ni-ico">{item.i}</div>{item.l}
                    </div>
                  ))}
                  <div className="lp-s-div"/>
                  <div className="lp-s-ni"><div className="lp-s-ni-ico">⚙</div>Settings</div>
                </div>
                <div className="lp-s-main">
                  <div>
                    <div className="lp-s-lbl">AI Decision Required · 2 pending</div>
                    <div className="lp-s-dec">
                      <div className="lp-s-dec-tag">Blocking execution</div>
                      <div className="lp-s-dec-t">Renew agency contract at $18k/month?</div>
                      <div className="lp-s-dec-b">Delivery slipped 3 of 4 months. Two alternatives ready to quote.</div>
                      <div className="lp-s-rec">✗ Reject · 88% confidence</div>
                      <div className="lp-s-btns">
                        <div className="lp-s-btn lp-s-btn-go">✓ Approve & Execute</div>
                        <div className="lp-s-btn lp-s-btn-sk">⏸ Delay</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="lp-s-lbl">Execution in Progress</div>
                    <div className="lp-s-exec">
                      <div className="lp-s-exec-h">
                        <div className="lp-s-exec-dot"/>
                        <div className="lp-s-exec-lbl">Q2 Revenue Plan</div>
                        <div className="lp-s-exec-pct">40%</div>
                      </div>
                      {[{done:true,t:'Define revenue milestone'},{done:true,t:'Select acquisition channel'},{done:false,now:true,t:'Set KPI tracking system'},{done:false,t:'Schedule weekly review'}].map((t,i) => (
                        <div key={i} className="lp-s-task">
                          <div className={`lp-s-chk ${t.done?'done':''}`}>{t.done?'✓':''}</div>
                          <span style={t.now?{color:'rgba(255,255,255,0.75)'}:{}}>{t.t}</span>
                        </div>
                      ))}
                      <div className="lp-s-pb"><div className="lp-s-pf"/></div>
                    </div>
                  </div>
                  <div className="lp-s-health">
                    <div>
                      <div className="lp-s-score">68</div>
                      <div className="lp-s-score-s">/100 health</div>
                    </div>
                    <div className="lp-s-bars">
                      {[{l:'Revenue',w:'54%',c:'#f59e0b'},{l:'Execution',w:'70%',c:'#3b82f6'},{l:'Team',w:'78%',c:'#22c55e'},{l:'Risk',w:'40%',c:'#ef4444'}].map(b => (
                        <div key={b.l} className="lp-s-bar">
                          <div className="lp-s-bar-l">{b.l}</div>
                          <div className="lp-s-bar-t"><div className="lp-s-bar-f" style={{width:b.w,background:b.c}}/></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TENSION ───────────────────────────────── */}
        <section className="lp-tension" id="tension">
          <div className="lp-tension-inner">
            <div className="lp-eyebrow" style={{textAlign:'center'}}>The problem</div>
            <h2 className="lp-display" style={{fontSize:'clamp(40px,5.5vw,68px)',marginBottom:'16px',textAlign:'center'}}>
              Execution is where<br/>companies break.
            </h2>
            <p className="lp-body-large" style={{textAlign:'center',maxWidth:'440px',margin:'0 auto'}}>
              Decisions get made. Nothing happens after. Momentum disappears.
            </p>

            <div className="lp-contrast">
              <div className="lp-contrast-col bad">
                <div className="lp-contrast-label">Without Cervio</div>
                {[
                  'Decisions made in meetings, never executed',
                  'Work disappears after approval',
                  'No visibility into what\'s moving',
                  'Risks noticed too late',
                  'Momentum lost to indecision',
                ].map((t,i) => (
                  <div key={i} className="lp-contrast-item">
                    <div className="lp-ci-dot"/>{t}
                  </div>
                ))}
              </div>
              <div className="lp-contrast-col good">
                <div className="lp-contrast-label">With Cervio</div>
                {[
                  'Every decision creates immediate action',
                  'Execution visible and tracked in real time',
                  'You always know what\'s moving',
                  'Risks surface before they become crises',
                  'Momentum built into the system',
                ].map((t,i) => (
                  <div key={i} className="lp-contrast-item">
                    <div className="lp-ci-dot"/>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── MAGIC ─────────────────────────────────── */}
        <section className="lp-magic" id="magic">
          <div className="lp-magic-inner">
            <div className="lp-eyebrow">The moment</div>
            <h2 className="lp-display" style={{fontSize:'clamp(48px,7vw,88px)',marginBottom:'18px'}}>
              You approve it.<br/><em>Cervio runs it.</em>
            </h2>
            <p className="lp-body-large" style={{maxWidth:'420px',margin:'0 auto'}}>
              No follow-ups. No lost action items. No wondering if it happened.
            </p>
          </div>

          <div className="lp-magic-steps">
            {[
              {icon:'⚡',n:'1',t:'Decision surfaces',b:'Full context, reasoning, and a recommendation ready before you even ask.'},
              {icon:'✓',n:'2',t:'You approve',b:'One tap. Your entire input. Cervio handles everything downstream.'},
              {icon:'⚙',n:'3',t:'Execution starts',b:'Tasks created. Owners assigned. Deadlines set. Messages drafted.'},
              {icon:'📊',n:'4',t:'Outcome tracked',b:'Progress is visible. Cervio scores its own accuracy and learns.'},
            ].map((s,i) => (
              <div key={i} className="lp-magic-step" style={i>0?{marginLeft:'10px'}:{}}>
                <div className="lp-ms-n">{s.n}</div>
                <span className="lp-ms-icon">{s.icon}</span>
                <div className="lp-ms-title">{s.t}</div>
                <div className="lp-ms-body">{s.b}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── IMPACT ────────────────────────────────── */}
        <section className="lp-impact">
          <div className="lp-impact-inner">
            <div className="lp-eyebrow">The impact</div>
            <h2 className="lp-display" style={{fontSize:'clamp(40px,5vw,62px)',marginBottom:'14px'}}>
              Run your company with clarity.
            </h2>
            <p className="lp-body-large" style={{maxWidth:'440px',margin:'0 auto'}}>
              Know what matters. Move faster. See progress.
            </p>

            <div className="lp-impact-grid">
              {[
                {num:'3×',label:'Faster decisions',body:'Context and recommendation already prepared. Decisions that took hours take seconds.'},
                {num:'0',label:'Decisions lost after approval',body:'Every approved decision creates tasks, assigns owners, and tracks to completion.'},
                {num:'84%',label:'Accuracy when following Cervio',body:'Track your own decision quality over time. Improve it systematically.'},
              ].map((c,i) => (
                <div key={i} className="lp-impact-card">
                  <div className="lp-impact-num">{c.num}</div>
                  <div className="lp-impact-label">{c.label}</div>
                  <p className="lp-impact-body">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOR ───────────────────────────────────── */}
        <section className="lp-for">
          <div className="lp-for-inner">
            <div className="lp-eyebrow">Built for</div>
            <h2 className="lp-display" style={{fontSize:'clamp(36px,4.5vw,56px)',marginBottom:'14px'}}>
              Built for operators.
            </h2>
            <p className="lp-body-large" style={{maxWidth:'440px',margin:'0 auto'}}>
              For founders, CEOs, and teams that need execution — not more tools.
            </p>
            <div className="lp-tags">
              {['Founders','CEOs','COOs','Series A — C','Scale-up operators','Executive teams','Anyone who ships'].map(t => (
                <div key={t} className="lp-tag">{t}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINALE ────────────────────────────────── */}
        <section className="lp-finale">
          <div className="lp-finale-inner">
            <h2 className="lp-display" style={{fontSize:'clamp(52px,7.5vw,96px)',marginBottom:'20px'}}>
              Start operating your<br/><em>business properly.</em>
            </h2>
            <p className="lp-body-large" style={{maxWidth:'400px',margin:'0 auto 44px'}}>
              Stop running your company from scattered tools and delayed decisions.
            </p>
            <Link href="/auth/login" className="lp-btn-primary" style={{fontSize:'16px',padding:'16px 40px',display:'inline-flex',margin:'0 auto'}}>
              Start Operating
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <div className="lp-finale-note">Free trial · No credit card required · Built by Morphotech</div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────── */}
        <footer>
          <div className="lp-footer-copy">© 2026 Morphotech Australia Pty Ltd</div>
          <ul className="lp-footer-links">
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/auth/login">Sign in</Link></li>
            <li><Link href="/auth/login">Get started</Link></li>
          </ul>
        </footer>

      </div>
    </>
  )
}
