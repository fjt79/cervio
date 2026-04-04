import Link from 'next/link'

export const metadata = {
  title: 'Cervio — Stop managing. Start operating.',
  description: 'Cervio sees what is breaking, tells you what to do, and executes it. The operating layer for your business.',
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;400;500;600;700&display=swap');

        .lp *, .lp *::before, .lp *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp {
          background: #f9f8f5;
          color: #0f0f10;
          font-family: 'DM Sans', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* NAV */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 60px; padding: 0 52px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(249,248,245,0.85);
          backdrop-filter: blur(24px) saturate(160%);
          border-bottom: 1px solid rgba(15,15,16,0.07);
        }

        .lp-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .lp-logo-name { font-weight: 650; font-size: 16px; color: #0f0f10; letter-spacing: -0.3px; }

        .lp-nav-r { display: flex; align-items: center; gap: 28px; }
        .lp-nav-r a { font-size: 14px; color: rgba(15,15,16,0.5); text-decoration: none; transition: color 0.2s; }
        .lp-nav-r a:hover { color: #0f0f10; }

        .lp-nav-pill {
          background: #0f0f10 !important; color: #f9f8f5 !important;
          font-weight: 600 !important; padding: 8px 20px !important;
          border-radius: 100px !important; font-size: 13px !important;
          transition: opacity 0.2s !important; letter-spacing: -0.1px !important;
        }
        .lp-nav-pill:hover { opacity: 0.82 !important; }

        /* HERO */
        .lp-hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 120px 40px 80px;
          position: relative; overflow: hidden;
          background: #f9f8f5;
        }

        .lp-hero-glow {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 900px; height: 500px;
          background: radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .lp-hero-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 600; letter-spacing: 1.8px; text-transform: uppercase;
          color: rgba(15,15,16,0.35); margin-bottom: 28px;
          animation: lpUp 0.7s ease 0.1s both;
        }
        .lp-hero-tag-dot { width: 5px; height: 5px; border-radius: 50%; background: #2563eb; animation: lpBreathe 2.5s ease-in-out infinite; }
        @keyframes lpBreathe { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.5)} }

        .lp-h1 {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(56px, 8vw, 104px);
          font-weight: 400; line-height: 0.97; letter-spacing: -2.5px;
          color: #0f0f10; max-width: 820px; margin-bottom: 26px;
          animation: lpUp 0.9s ease 0.25s both;
        }
        .lp-h1 em { font-style: italic; color: rgba(15,15,16,0.35); }

        .lp-hero-sub {
          font-size: 19px; font-weight: 300; color: rgba(15,15,16,0.52);
          max-width: 420px; line-height: 1.65; margin-bottom: 44px;
          animation: lpUp 0.9s ease 0.42s both;
        }

        .lp-hero-cta {
          display: flex; gap: 12px; align-items: center; margin-bottom: 88px;
          animation: lpUp 0.9s ease 0.56s both;
        }

        .lp-btn-dark {
          background: #0f0f10; color: #f9f8f5;
          padding: 14px 32px; border-radius: 100px;
          font-size: 15px; font-weight: 600; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          transition: opacity 0.2s, transform 0.2s; letter-spacing: -0.2px;
          box-shadow: 0 2px 8px rgba(15,15,16,0.2);
        }
        .lp-btn-dark:hover { opacity: 0.84; transform: translateY(-2px); }

        .lp-btn-ghost { font-size: 14px; color: rgba(15,15,16,0.45); text-decoration: none; padding: 14px 16px; transition: color 0.2s; }
        .lp-btn-ghost:hover { color: #0f0f10; }

        @keyframes lpUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        /* HERO SCREEN */
        .lp-screen {
          width: 100%; max-width: 980px;
          border-radius: 20px; overflow: hidden;
          border: 1px solid rgba(15,15,16,0.1);
          box-shadow: 0 2px 4px rgba(15,15,16,0.04), 0 8px 24px rgba(15,15,16,0.08), 0 40px 80px rgba(15,15,16,0.12);
          animation: lpScreenIn 1.1s ease 0.7s both;
          background: #1a1a1d;
        }

        @keyframes lpScreenIn {
          from { opacity: 0; transform: translateY(40px) scale(0.978); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .lp-s-bar { background: #101012; padding: 11px 14px; display: flex; align-items: center; gap: 7px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .lp-s-dot { width: 9px; height: 9px; border-radius: 50%; }
        .lp-s-title { flex: 1; text-align: center; font-size: 11px; color: rgba(255,255,255,0.14); }
        .lp-s-body { display: grid; grid-template-columns: 192px 1fr; min-height: 380px; }
        .lp-s-nav { background: #0d0d0f; border-right: 1px solid rgba(255,255,255,0.04); padding: 14px 0; }
        .lp-s-item { padding: 8px 14px; font-size: 12px; color: rgba(255,255,255,0.24); display: flex; align-items: center; gap: 9px; }
        .lp-s-item.on { color: rgba(255,255,255,0.82); background: rgba(255,255,255,0.04); }
        .lp-s-ico { width: 15px; height: 15px; border-radius: 4px; background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; }
        .lp-s-item.on .lp-s-ico { background: rgba(37,99,235,0.22); }
        .lp-s-div { height: 1px; background: rgba(255,255,255,0.04); margin: 8px 0; }
        .lp-s-main { padding: 18px; display: flex; flex-direction: column; gap: 11px; }
        .lp-s-lbl { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255,255,255,0.2); margin-bottom: 5px; }
        .lp-s-card { background: #111113; border: 1px solid rgba(255,255,255,0.07); border-radius: 11px; padding: 13px; position: relative; overflow: hidden; }
        .lp-s-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #dc2626 0%, transparent 65%); }
        .lp-s-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #f87171; background: rgba(220,38,38,0.1); padding: 2px 7px; border-radius: 20px; margin-bottom: 7px; }
        .lp-s-badge::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: #f87171; animation: lpBreathe 1.5s ease-in-out infinite; }
        .lp-s-ct { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.86); margin-bottom: 5px; line-height: 1.3; }
        .lp-s-cb { font-size: 10px; color: rgba(255,255,255,0.3); margin-bottom: 9px; line-height: 1.5; }
        .lp-s-rec { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; color: #4ade80; background: rgba(74,222,128,0.1); padding: 4px 9px; border-radius: 7px; margin-bottom: 10px; }
        .lp-s-btns { display: flex; gap: 7px; }
        .lp-s-btn { padding: 5px 11px; border-radius: 7px; font-size: 10px; font-weight: 600; cursor: default; border: none; }
        .lp-s-btn-go { background: #16a34a; color: white; position: relative; overflow: hidden; }
        .lp-s-btn-go::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent); animation: lpSheen 2.8s ease 1.5s infinite; }
        @keyframes lpSheen { to { left: 100%; } }
        .lp-s-btn-sk { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.35); }
        .lp-s-exec { background: #111113; border: 1px solid rgba(37,99,235,0.2); border-radius: 11px; padding: 13px; }
        .lp-s-exec-h { display: flex; align-items: center; gap: 7px; margin-bottom: 9px; }
        .lp-s-exec-dot { width: 5px; height: 5px; border-radius: 50%; background: #60a5fa; animation: lpBreathe 1.5s ease-in-out infinite; }
        .lp-s-exec-lbl { font-size: 9px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #60a5fa; }
        .lp-s-exec-pct { margin-left: auto; font-size: 9px; color: rgba(255,255,255,0.24); }
        .lp-s-task { display: flex; align-items: center; gap: 7px; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 10px; color: rgba(255,255,255,0.44); }
        .lp-s-task:last-of-type { border-bottom: none; }
        .lp-s-chk { width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.1); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 7px; }
        .lp-s-chk.done { background: #16a34a; border-color: #16a34a; color: white; }
        .lp-s-pb { height: 2px; background: rgba(255,255,255,0.06); border-radius: 1px; margin-top: 9px; overflow: hidden; }
        .lp-s-pf { height: 100%; width: 40%; background: linear-gradient(90deg, #2563eb, #60a5fa); border-radius: 1px; animation: lpPb 2s ease 1.5s both; }
        @keyframes lpPb { from{width:0} to{width:40%} }
        .lp-s-health { background: #111113; border: 1px solid rgba(255,255,255,0.05); border-radius: 11px; padding: 11px; display: flex; align-items: center; gap: 11px; }
        .lp-s-score { font-size: 26px; font-weight: 800; color: #4ade80; line-height: 1; font-family: 'Instrument Serif', serif; }
        .lp-s-score-s { font-size: 9px; color: rgba(255,255,255,0.24); margin-top: 2px; }
        .lp-s-bars { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        .lp-s-bar { display: flex; flex-direction: column; gap: 2px; }
        .lp-s-bar-l { font-size: 8px; color: rgba(255,255,255,0.22); text-transform: uppercase; letter-spacing: 0.4px; }
        .lp-s-bar-t { height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; overflow: hidden; }
        .lp-s-bar-f { height: 100%; border-radius: 1px; animation: lpPb 1.5s ease 1.8s both; }

        /* SECTIONS - light background */
        .lp-section { padding: 140px 40px; max-width: 1100px; margin: 0 auto; }
        .lp-full { padding: 140px 40px; background: #f9f8f5; }
        .lp-full-alt { padding: 140px 40px; background: #f2f1ee; }

        .lp-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 1.8px; text-transform: uppercase; color: rgba(15,15,16,0.3); margin-bottom: 18px; }

        /* TENSION */
        .lp-tension-in { max-width: 760px; margin: 0 auto; text-align: center; }
        .lp-tension-h { font-family: 'Instrument Serif', serif; font-size: clamp(38px, 5vw, 62px); font-weight: 400; line-height: 1.08; letter-spacing: -1px; color: #0f0f10; margin-bottom: 18px; }
        .lp-tension-h em { font-style: italic; color: rgba(15,15,16,0.35); }
        .lp-tension-sub { font-size: 18px; font-weight: 300; color: rgba(15,15,16,0.5); line-height: 1.68; max-width: 480px; margin: 0 auto 64px; }

        .lp-contrast { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; max-width: 740px; margin: 0 auto; border-radius: 18px; overflow: hidden; border: 1px solid rgba(15,15,16,0.08); box-shadow: 0 4px 24px rgba(15,15,16,0.06); }
        .lp-col { padding: 36px 32px; }
        .lp-col-bad { background: #fff8f8; }
        .lp-col-good { background: #f5fdf7; }
        .lp-col-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 22px; }
        .lp-col-bad .lp-col-label { color: rgba(185,28,28,0.5); }
        .lp-col-good .lp-col-label { color: rgba(22,163,74,0.6); }
        .lp-col-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 14px; font-size: 14px; line-height: 1.55; }
        .lp-col-bad .lp-col-item { color: rgba(15,15,16,0.55); }
        .lp-col-good .lp-col-item { color: rgba(15,15,16,0.7); }
        .lp-col-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; margin-top: 8px; }
        .lp-col-bad .lp-col-dot { background: rgba(185,28,28,0.4); }
        .lp-col-good .lp-col-dot { background: rgba(22,163,74,0.5); }

        /* SHIFT */
        .lp-shift-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; max-width: 1100px; margin: 0 auto; align-items: center; }
        .lp-shift-h { font-family: 'Instrument Serif', serif; font-size: clamp(34px, 3.8vw, 50px); font-weight: 400; line-height: 1.1; letter-spacing: -0.7px; color: #0f0f10; margin-bottom: 18px; }
        .lp-shift-body { font-size: 16px; color: rgba(15,15,16,0.5); line-height: 1.75; margin-bottom: 28px; }
        .lp-shift-list { display: flex; flex-direction: column; gap: 14px; }
        .lp-shift-item { display: flex; align-items: flex-start; gap: 12px; font-size: 15px; color: rgba(15,15,16,0.65); line-height: 1.55; }
        .lp-shift-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 8px; }
        .lp-shift-vis { background: white; border: 1px solid rgba(15,15,16,0.08); border-radius: 20px; padding: 28px; box-shadow: 0 8px 32px rgba(15,15,16,0.06), 0 2px 8px rgba(15,15,16,0.04); }

        /* MAGIC */
        .lp-magic-in { max-width: 700px; margin: 0 auto; text-align: center; }
        .lp-magic-h { font-family: 'Instrument Serif', serif; font-size: clamp(44px, 6.5vw, 84px); font-weight: 400; line-height: 1.02; letter-spacing: -2px; color: #0f0f10; margin-bottom: 18px; }
        .lp-magic-h em { font-style: italic; color: rgba(15,15,16,0.3); }
        .lp-magic-sub { font-size: 18px; font-weight: 300; color: rgba(15,15,16,0.48); line-height: 1.65; margin-bottom: 72px; }

        .lp-magic-seq { display: flex; max-width: 960px; margin: 0 auto; gap: 0; }
        .lp-magic-step { flex: 1; padding: 32px 22px; background: white; border: 1px solid rgba(15,15,16,0.08); border-radius: 18px; text-align: left; position: relative; overflow: hidden; transition: box-shadow 0.25s, transform 0.25s; box-shadow: 0 2px 8px rgba(15,15,16,0.05); }
        .lp-magic-step:hover { box-shadow: 0 8px 28px rgba(15,15,16,0.1); transform: translateY(-3px); }
        .lp-magic-step + .lp-magic-step { margin-left: 10px; }
        .lp-magic-n { font-family: 'Instrument Serif', serif; font-size: 48px; font-weight: 400; color: rgba(15,15,16,0.04); position: absolute; top: 12px; right: 16px; line-height: 1; }
        .lp-magic-icon { font-size: 22px; margin-bottom: 14px; display: block; }
        .lp-magic-t { font-size: 14px; font-weight: 650; color: #0f0f10; margin-bottom: 8px; }
        .lp-magic-b { font-size: 13px; color: rgba(15,15,16,0.45); line-height: 1.65; }

        /* IMPACT */
        .lp-impact-head { text-align: center; margin-bottom: 72px; }
        .lp-impact-h { font-family: 'Instrument Serif', serif; font-size: clamp(36px, 4vw, 54px); font-weight: 400; line-height: 1.1; letter-spacing: -0.8px; color: #0f0f10; margin-bottom: 14px; }
        .lp-impact-sub { font-size: 17px; font-weight: 300; color: rgba(15,15,16,0.48); line-height: 1.65; }

        .lp-impact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .lp-ic { background: white; border: 1px solid rgba(15,15,16,0.08); border-radius: 20px; padding: 32px; overflow: hidden; transition: box-shadow 0.25s, transform 0.25s; box-shadow: 0 2px 8px rgba(15,15,16,0.04); }
        .lp-ic:hover { box-shadow: 0 8px 28px rgba(15,15,16,0.09); transform: translateY(-2px); }
        .lp-ic.span2 { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
        .lp-ic-label { font-size: 10px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: rgba(15,15,16,0.3); margin-bottom: 12px; }
        .lp-ic-h { font-family: 'Instrument Serif', serif; font-size: 24px; font-weight: 400; color: #0f0f10; line-height: 1.25; margin-bottom: 12px; letter-spacing: -0.3px; }
        .lp-ic-b { font-size: 14px; color: rgba(15,15,16,0.48); line-height: 1.7; }
        .lp-ic-num { font-family: 'Instrument Serif', serif; font-size: 64px; font-weight: 400; color: #0f0f10; line-height: 1; letter-spacing: -2px; margin-bottom: 10px; }
        .lp-ic-vis { background: #f9f8f5; border: 1px solid rgba(15,15,16,0.07); border-radius: 14px; padding: 20px; }

        /* FOR */
        .lp-for-in { max-width: 640px; margin: 0 auto; text-align: center; }
        .lp-for-h { font-family: 'Instrument Serif', serif; font-size: clamp(34px, 4vw, 52px); font-weight: 400; line-height: 1.1; letter-spacing: -0.8px; color: #0f0f10; margin-bottom: 14px; }
        .lp-for-sub { font-size: 17px; font-weight: 300; color: rgba(15,15,16,0.48); line-height: 1.65; margin-bottom: 44px; }
        .lp-tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
        .lp-tag { padding: 9px 18px; border: 1px solid rgba(15,15,16,0.12); border-radius: 100px; font-size: 14px; color: rgba(15,15,16,0.5); transition: all 0.2s; cursor: default; background: white; }
        .lp-tag:hover { border-color: rgba(15,15,16,0.25); color: #0f0f10; box-shadow: 0 2px 8px rgba(15,15,16,0.06); }

        /* FINALE */
        .lp-finale-in { max-width: 680px; margin: 0 auto; text-align: center; }
        .lp-finale-h { font-family: 'Instrument Serif', serif; font-size: clamp(52px, 7vw, 92px); font-weight: 400; line-height: 0.97; letter-spacing: -2.5px; color: #0f0f10; margin-bottom: 22px; }
        .lp-finale-h em { font-style: italic; color: rgba(15,15,16,0.3); }
        .lp-finale-sub { font-size: 17px; font-weight: 300; color: rgba(15,15,16,0.48); line-height: 1.65; margin-bottom: 44px; max-width: 420px; margin-left: auto; margin-right: auto; }
        .lp-finale-note { margin-top: 20px; font-size: 12px; color: rgba(15,15,16,0.28); }

        /* FOOTER */
        .lp-footer { border-top: 1px solid rgba(15,15,16,0.08); padding: 36px 52px; display: flex; align-items: center; justify-content: space-between; background: #f9f8f5; }
        .lp-footer-copy { font-size: 12px; color: rgba(15,15,16,0.3); }
        .lp-footer-links { display: flex; gap: 24px; list-style: none; }
        .lp-footer-links a { font-size: 12px; color: rgba(15,15,16,0.35); text-decoration: none; transition: color 0.2s; }
        .lp-footer-links a:hover { color: #0f0f10; }

        /* Health vis light mode */
        .lp-health-vis { background: white; border: 1px solid rgba(15,15,16,0.08); border-radius: 12px; padding: 18px; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .lp-nav { padding: 0 20px; }
          .lp-nav-r a:not(.lp-nav-pill) { display: none; }
          .lp-hero { padding: 100px 20px 60px; }
          .lp-h1 { letter-spacing: -1.5px; }
          .lp-screen .lp-s-body { grid-template-columns: 1fr; }
          .lp-screen .lp-s-nav { display: none; }
          .lp-full, .lp-full-alt { padding: 80px 20px; }
          .lp-section { padding: 80px 20px; }
          .lp-contrast { grid-template-columns: 1fr; }
          .lp-shift-grid { grid-template-columns: 1fr; gap: 40px; }
          .lp-magic-seq { flex-direction: column; }
          .lp-magic-step + .lp-magic-step { margin-left: 0; margin-top: 10px; }
          .lp-impact-grid { grid-template-columns: 1fr; }
          .lp-ic.span2 { grid-column: span 1; grid-template-columns: 1fr; }
          .lp-footer { flex-direction: column; gap: 16px; text-align: center; padding: 32px 20px; }
        }
      `}</style>

      <div className="lp">

        {/* NAV */}
        <nav className="lp-nav">
          <Link href="/" className="lp-logo">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="12" fill="rgba(37,99,235,0.1)"/>
              <circle cx="13" cy="5" r="2" fill="#3b82f6"/>
              <circle cx="6" cy="18.5" r="2" fill="#3b82f6"/>
              <circle cx="20" cy="18.5" r="2" fill="#3b82f6"/>
              <circle cx="13" cy="13" r="3.2" fill="#2563eb"/>
              <line x1="13" y1="7" x2="13" y2="9.8" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="7.8" y1="16.8" x2="10.3" y2="14.8" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="18.2" y1="16.8" x2="15.7" y2="14.8" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="13" cy="13" r="1.1" fill="white" fillOpacity="0.95"/>
            </svg>
            <span className="lp-logo-name">Cervio</span>
          </Link>
          <div className="lp-nav-r">
            <a href="#how">How it works</a>
            <Link href="/auth/login">Sign in</Link>
            <Link href="/auth/login" className="lp-nav-pill">Get started</Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-hero-glow"/>
          <div className="lp-hero-tag"><div className="lp-hero-tag-dot"/>AI Chief of Staff</div>
          <h1 className="lp-h1">Stop managing.<br/><em>Start operating.</em></h1>
          <p className="lp-hero-sub">Cervio sees what's broken, tells you what to do, and executes it with you.</p>
          <div className="lp-hero-cta">
            <Link href="/auth/login" className="lp-btn-dark">
              Start operating
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7 2l4.5 4.5L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <a href="#how" className="lp-btn-ghost">See how it works →</a>
          </div>

          <div className="lp-screen">
            <div className="lp-s-bar">
              <div className="lp-s-dot" style={{background:'#ff5f56'}}/>
              <div className="lp-s-dot" style={{background:'#ffbd2e'}}/>
              <div className="lp-s-dot" style={{background:'#27c93f'}}/>
              <div className="lp-s-title">cervio.ai — Command Centre</div>
            </div>
            <div className="lp-s-body">
              <div className="lp-s-nav">
                {[{i:'⊞',l:'Dashboard',on:true},{i:'⚡',l:'Decisions'},{i:'◎',l:'Goals'},{i:'✦',l:'Coach'},{i:'📅',l:'Calendar'},{i:'★',l:'Weekly Review'}].map(item => (
                  <div key={item.l} className={`lp-s-item ${item.on?'on':''}`}>
                    <div className="lp-s-ico">{item.i}</div>{item.l}
                  </div>
                ))}
                <div className="lp-s-div"/>
                <div className="lp-s-item"><div className="lp-s-ico">⚙</div>Settings</div>
              </div>
              <div className="lp-s-main">
                <div>
                  <div className="lp-s-lbl">AI Decision Required · 2 pending</div>
                  <div className="lp-s-card">
                    <div className="lp-s-badge">Blocking execution</div>
                    <div className="lp-s-ct">Renew agency contract at $18k/month?</div>
                    <div className="lp-s-cb">Delivery slipped 3 of 4 months. Two alternatives ready to quote.</div>
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
                      <div className="lp-s-exec-dot"/><div className="lp-s-exec-lbl">Q2 Revenue Plan</div>
                      <div className="lp-s-exec-pct">40%</div>
                    </div>
                    {[{done:true,t:'Define revenue milestone'},{done:true,t:'Select acquisition channel'},{done:false,now:true,t:'Set KPI tracking system'},{done:false,t:'Schedule weekly review'}].map((t,i) => (
                      <div key={i} className="lp-s-task">
                        <div className={`lp-s-chk ${t.done?'done':''}`}>{t.done?'✓':''}</div>
                        <span style={t.now?{color:'rgba(255,255,255,0.72)'}:{}}>{t.t}</span>
                      </div>
                    ))}
                    <div className="lp-s-pb"><div className="lp-s-pf"/></div>
                  </div>
                </div>
                <div className="lp-s-health">
                  <div><div className="lp-s-score">68</div><div className="lp-s-score-s">/100 health</div></div>
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
        </section>

        {/* TENSION */}
        <div className="lp-full">
          <div className="lp-tension-in">
            <div className="lp-eyebrow" style={{textAlign:'center'}}>The reality</div>
            <h2 className="lp-tension-h">Most companies don't fail from lack of ideas.<br/><em>They fail from lack of execution.</em></h2>
            <p className="lp-tension-sub">Decisions get made. Work doesn't happen. By the time you notice, momentum is already gone.</p>
            <div className="lp-contrast">
              <div className="lp-col lp-col-bad">
                <div className="lp-col-label">Without Cervio</div>
                {['Decisions made in meetings, never executed','Work disappears after approval','No one knows what\'s actually moving','Risks noticed too late to fix','Momentum lost to indecision'].map((t,i) => (
                  <div key={i} className="lp-col-item"><div className="lp-col-dot"/>{t}</div>
                ))}
              </div>
              <div className="lp-col lp-col-good">
                <div className="lp-col-label">With Cervio</div>
                {['Every decision creates immediate action','Execution is visible and tracked','You always know what\'s moving','Risks surface before they become crises','Momentum is built into the system'].map((t,i) => (
                  <div key={i} className="lp-col-item"><div className="lp-col-dot"/>{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SHIFT */}
        <div className="lp-full-alt" id="how">
          <div className="lp-shift-grid">
            <div>
              <div className="lp-eyebrow">The shift</div>
              <h2 className="lp-shift-h">Cervio closes the gap between decision and execution.</h2>
              <p className="lp-shift-body">Not another tool. Not another dashboard. An operating layer that sees problems, recommends actions, and executes the moment you approve.</p>
              <div className="lp-shift-list">
                {[
                  {c:'#dc2626', t:'Sees risks and bottlenecks before they cost you'},
                  {c:'#2563eb', t:'Recommends decisions with confidence scores and reasoning'},
                  {c:'#16a34a', t:'Executes when you approve — tasks, owners, deadlines'},
                  {c:'#d97706', t:'Tracks outcomes and scores its own accuracy over time'},
                ].map((item,i) => (
                  <div key={i} className="lp-shift-item">
                    <div className="lp-shift-dot" style={{background:item.c}}/>
                    {item.t}
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-shift-vis">
              <div style={{fontSize:'11px',fontWeight:700,color:'rgba(15,15,16,0.3)',letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:'14px'}}>Business Health</div>
              <div style={{fontFamily:'Instrument Serif, serif',fontSize:'48px',fontWeight:400,color:'#16a34a',lineHeight:1,marginBottom:'5px'}}>68</div>
              <div style={{fontSize:'12px',color:'rgba(15,15,16,0.35)',marginBottom:'16px'}}>/100 · Needs attention</div>
              {[{l:'Revenue',w:'54%',c:'#d97706',v:54},{l:'Execution',w:'70%',c:'#2563eb',v:70},{l:'Team',w:'78%',c:'#16a34a',v:78},{l:'Risk',w:'40%',c:'#dc2626',v:40}].map(b => (
                <div key={b.l} style={{marginBottom:'10px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
                    <span style={{fontSize:'13px',color:'rgba(15,15,16,0.45)'}}>{b.l}</span>
                    <span style={{fontSize:'13px',fontWeight:700,color:b.c}}>{b.v}</span>
                  </div>
                  <div style={{height:'3px',background:'rgba(15,15,16,0.06)',borderRadius:'2px',overflow:'hidden'}}>
                    <div style={{height:'100%',width:b.w,background:b.c,borderRadius:'2px'}}/>
                  </div>
                </div>
              ))}
              <div style={{marginTop:'16px',paddingTop:'14px',borderTop:'1px solid rgba(15,15,16,0.07)'}}>
                <div style={{fontSize:'10px',color:'rgba(15,15,16,0.28)',marginBottom:'8px',letterSpacing:'1px',textTransform:'uppercase'}}>Blocking your score</div>
                {['Q2 revenue at 34% — 67 days left','Agency contract decision overdue'].map((f,i) => (
                  <div key={i} style={{fontSize:'12px',color:'rgba(15,15,16,0.5)',paddingLeft:'10px',borderLeft:'2px solid #dc2626',marginBottom:'6px',lineHeight:1.5}}>{f}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MAGIC */}
        <div className="lp-full">
          <div className="lp-magic-in" style={{maxWidth:'700px',margin:'0 auto',textAlign:'center'}}>
            <div className="lp-eyebrow" style={{textAlign:'center'}}>The moment</div>
            <h2 className="lp-magic-h">You click approve.<br/><em>Cervio does the rest.</em></h2>
            <p className="lp-magic-sub">No follow-up emails. No lost action items. No wondering if it happened.</p>
          </div>
          <div className="lp-magic-seq" style={{maxWidth:'960px',margin:'0 auto'}}>
            {[
              {icon:'⚡',n:'1',t:'Decision surfaces',b:'Full context, consequences, and a recommendation — already prepared.'},
              {icon:'✓',n:'2',t:'You approve',b:'One tap. Your entire input. Everything else handled automatically.'},
              {icon:'⚙',n:'3',t:'Execution starts',b:'Tasks created. Owners assigned. Deadlines set. Messages drafted.'},
              {icon:'📊',n:'4',t:'Outcome tracked',b:'Cervio scores its own recommendation and learns your patterns.'},
            ].map((s,i) => (
              <div key={i} className="lp-magic-step" style={i>0?{marginLeft:'10px'}:{}}>
                <div className="lp-magic-n">{s.n}</div>
                <span className="lp-magic-icon">{s.icon}</span>
                <div className="lp-magic-t">{s.t}</div>
                <div className="lp-magic-b">{s.b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* IMPACT */}
        <div className="lp-full-alt">
          <div style={{maxWidth:'1100px',margin:'0 auto'}}>
            <div className="lp-impact-head">
              <div className="lp-eyebrow" style={{textAlign:'center'}}>The impact</div>
              <h2 className="lp-impact-h">Momentum becomes visible.</h2>
              <p className="lp-impact-sub">Work doesn't disappear after meetings. Decisions don't stall. Progress moves.</p>
            </div>
            <div className="lp-impact-grid">
              <div className="lp-ic span2">
                <div>
                  <div className="lp-ic-label">Decision Engine</div>
                  <h3 className="lp-ic-h">Every decision comes with a recommendation, confidence score, and consequence model.</h3>
                  <p className="lp-ic-b">Approve, reject, or delay — with full reasoning. Cervio tracks your accuracy and identifies where your instincts are costing you.</p>
                </div>
                <div className="lp-ic-vis">
                  <div style={{fontSize:'11px',fontWeight:700,color:'rgba(15,15,16,0.3)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'12px'}}>Decision Required</div>
                  <div style={{fontSize:'14px',fontWeight:650,color:'#0f0f10',marginBottom:'7px',lineHeight:1.35}}>Expand into the UK market this quarter?</div>
                  <div style={{fontSize:'12px',color:'rgba(15,15,16,0.45)',marginBottom:'12px',lineHeight:1.6}}>Cash 4.2 months. Market timing strong. Execution stretched.</div>
                  <div style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:'12px',fontWeight:700,color:'#b45309',background:'rgba(180,83,9,0.08)',padding:'5px 11px',borderRadius:8,marginBottom:12,border:'1px solid rgba(180,83,9,0.15)'}}>⏸ Delay · 76% confidence</div>
                  <div style={{display:'flex',gap:8}}>
                    <div style={{padding:'7px 13px',background:'#16a34a',color:'white',borderRadius:8,fontSize:'12px',fontWeight:600}}>Approve anyway</div>
                    <div style={{padding:'7px 13px',background:'rgba(15,15,16,0.06)',color:'rgba(15,15,16,0.5)',borderRadius:8,fontSize:'12px',border:'1px solid rgba(15,15,16,0.08)'}}>Follow recommendation</div>
                  </div>
                </div>
              </div>
              {[
                {label:'Your accuracy rate',num:'71%',body:'Following Cervio: 84%. Overriding: 52%. The data makes the case.',},
                {label:'Decisions lost after approval',num:'0',body:'Every approved decision creates tasks, assigns owners, and tracks to completion.',},
                {label:'Predictive intelligence',h:'Knows what will break before it does.',body:'Revenue risk, bottlenecks, cold relationships — surfaced while you still have time.',},
                {label:'Accountability system',h:"Cervio doesn't let things slide.",body:'"You\'ve delayed this 3 times. This is blocking execution." Avoidance detected and named.',},
              ].map((c,i) => (
                <div key={i} className="lp-ic">
                  <div className="lp-ic-label">{c.label}</div>
                  {c.num && <div className="lp-ic-num">{c.num}</div>}
                  {c.h && <h3 className="lp-ic-h">{c.h}</h3>}
                  <p className="lp-ic-b">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOR */}
        <div className="lp-full">
          <div className="lp-for-in">
            <div className="lp-eyebrow" style={{textAlign:'center'}}>Built for</div>
            <h2 className="lp-for-h">Operators who move fast and hate excuses.</h2>
            <p className="lp-for-sub">Not a tool for thinking about your business. A system for running it.</p>
            <div className="lp-tags">
              {['Founders','CEOs','COOs','Series A — C','Scale-up operators','Executive teams','Anyone who ships'].map(t => (
                <div key={t} className="lp-tag">{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* FINALE */}
        <div className="lp-full-alt" style={{paddingTop:'160px',paddingBottom:'160px'}}>
          <div className="lp-finale-in">
            <h2 className="lp-finale-h">Stop managing.<br/><em>Start operating.</em></h2>
            <p className="lp-finale-sub">Your business is ready to run properly. Cervio is ready when you are.</p>
            <Link href="/auth/login" className="lp-btn-dark" style={{fontSize:'16px',padding:'16px 40px',display:'inline-flex',margin:'0 auto'}}>
              Start running your business
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <div className="lp-finale-note">Free trial · No credit card · Built by Morphotech</div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="lp-footer">
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
