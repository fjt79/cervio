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

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #080808;
          --ink2: #0f0f10;
          --ink3: #141416;
          --white: #f9f8f5;
          --muted: rgba(249,248,245,0.42);
          --dim: rgba(249,248,245,0.2);
          --blue: #2563eb;
          --green: #16a34a;
          --red: #dc2626;
          --amber: #d97706;
          --serif: 'Instrument Serif', Georgia, serif;
          --sans: 'DM Sans', -apple-system, sans-serif;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--ink);
          color: var(--white);
          font-family: var(--sans);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        body::after {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          background-size: 256px;
          pointer-events: none; z-index: 9999; opacity: 0.45;
        }

        /* NAV */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 58px; padding: 0 52px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(8,8,8,0.75);
          backdrop-filter: blur(28px) saturate(160%);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .logo-name { font-weight: 600; font-size: 16px; color: var(--white); letter-spacing: -0.2px; }

        .nav-r { display: flex; align-items: center; gap: 26px; }
        .nav-r a { font-size: 14px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
        .nav-r a:hover { color: var(--white); }
        .nav-pill { background: var(--white) !important; color: var(--ink) !important; font-weight: 600 !important; padding: 7px 18px !important; border-radius: 100px !important; font-size: 13px !important; transition: opacity 0.2s !important; }
        .nav-pill:hover { opacity: 0.85 !important; }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 120px 40px 80px;
          position: relative; overflow: hidden;
        }

        .hero-bg {
          position: absolute; top: -5%; left: 50%; transform: translateX(-50%);
          width: 1000px; height: 700px;
          background: radial-gradient(ellipse at 50% 25%, rgba(37,99,235,0.11) 0%, rgba(37,99,235,0.03) 40%, transparent 68%);
          pointer-events: none;
        }

        .hero-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;
          color: var(--dim); margin-bottom: 32px;
          opacity: 0; animation: up 0.7s ease 0.1s forwards;
        }
        .hero-tag-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--blue); animation: breathe 2.5s ease-in-out infinite; }
        @keyframes breathe { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.55)} }

        .hero-h1 {
          font-family: var(--serif);
          font-size: clamp(60px, 8.5vw, 112px);
          font-weight: 400; line-height: 0.95; letter-spacing: -2.5px;
          color: var(--white); max-width: 800px; margin-bottom: 28px;
          opacity: 0; animation: up 0.9s ease 0.25s forwards;
        }
        .hero-h1 em { font-style: italic; color: var(--muted); }

        .hero-sub {
          font-size: 19px; font-weight: 300; color: var(--muted);
          max-width: 420px; line-height: 1.6; margin-bottom: 48px;
          opacity: 0; animation: up 0.9s ease 0.45s forwards;
        }

        .hero-cta {
          display: flex; gap: 12px; align-items: center; margin-bottom: 96px;
          opacity: 0; animation: up 0.9s ease 0.6s forwards;
        }

        .btn-w {
          background: var(--white); color: var(--ink);
          padding: 14px 32px; border-radius: 100px;
          font-size: 15px; font-weight: 600; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          transition: opacity 0.2s, transform 0.2s; letter-spacing: -0.2px;
        }
        .btn-w:hover { opacity: 0.85; transform: translateY(-2px); }

        .btn-g { font-size: 14px; color: var(--muted); text-decoration: none; padding: 14px 16px; transition: color 0.2s; }
        .btn-g:hover { color: var(--white); }

        @keyframes up { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

        /* HERO SCREEN */
        .hero-screen {
          width: 100%; max-width: 980px;
          border-radius: 22px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.025), 0 70px 150px rgba(0,0,0,0.7), 0 24px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.055);
          opacity: 0; animation: screenIn 1.2s ease 0.75s forwards;
          background: #0c0c0e;
        }

        @keyframes screenIn {
          from { opacity: 0; transform: translateY(48px) scale(0.975); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .s-bar {
          background: #101012; padding: 11px 14px;
          display: flex; align-items: center; gap: 7px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .s-dot { width: 9px; height: 9px; border-radius: 50%; }
        .s-title { flex: 1; text-align: center; font-size: 11px; color: rgba(255,255,255,0.15); }

        .s-body { display: grid; grid-template-columns: 196px 1fr; min-height: 400px; }

        .s-nav { background: #090909; border-right: 1px solid rgba(255,255,255,0.04); padding: 14px 0; }
        .s-nav-item { padding: 8px 16px; font-size: 12px; color: rgba(255,255,255,0.24); display: flex; align-items: center; gap: 9px; }
        .s-nav-item.on { color: rgba(255,255,255,0.84); background: rgba(255,255,255,0.04); }
        .s-nav-ico { width: 15px; height: 15px; border-radius: 4px; background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; }
        .s-nav-item.on .s-nav-ico { background: rgba(37,99,235,0.22); }
        .s-div { height: 1px; background: rgba(255,255,255,0.04); margin: 8px 0; }

        .s-main { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .s-lbl { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255,255,255,0.2); margin-bottom: 6px; }

        .s-card { background: #111113; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px; position: relative; overflow: hidden; }
        .s-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #dc2626 0%, transparent 65%); }

        .s-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #f87171; background: rgba(220,38,38,0.1); padding: 2px 7px; border-radius: 20px; margin-bottom: 8px; }
        .s-badge::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: #f87171; animation: breathe 1.5s ease-in-out infinite; }

        .s-card-t { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.86); margin-bottom: 5px; line-height: 1.3; }
        .s-card-b { font-size: 11px; color: rgba(255,255,255,0.3); margin-bottom: 10px; line-height: 1.5; }

        .s-rec { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #4ade80; background: rgba(74,222,128,0.1); padding: 4px 10px; border-radius: 7px; margin-bottom: 11px; }

        .s-btns { display: flex; gap: 7px; }
        .s-btn { padding: 6px 12px; border-radius: 7px; font-size: 11px; font-weight: 600; cursor: default; border: none; }
        .s-btn-go { background: #16a34a; color: white; position: relative; overflow: hidden; }
        .s-btn-go::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent); animation: sheen 2.8s ease 1.5s infinite; }
        @keyframes sheen { to { left: 100%; } }
        .s-btn-sk { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.35); }

        .s-exec { background: #111113; border: 1px solid rgba(37,99,235,0.2); border-radius: 12px; padding: 14px; }
        .s-exec-h { display: flex; align-items: center; gap: 7px; margin-bottom: 10px; }
        .s-exec-dot { width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; animation: breathe 1.5s ease-in-out infinite; }
        .s-exec-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #60a5fa; }
        .s-exec-pct { margin-left: auto; font-size: 10px; color: rgba(255,255,255,0.24); }

        .s-task { display: flex; align-items: center; gap: 7px; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 11px; color: rgba(255,255,255,0.44); }
        .s-task:last-of-type { border-bottom: none; }
        .s-chk { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.1); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 7px; }
        .s-chk.done { background: #16a34a; border-color: #16a34a; color: white; }
        .s-chk.now { border-color: rgba(37,99,235,0.5); background: rgba(37,99,235,0.1); }

        .s-pb { height: 2px; background: rgba(255,255,255,0.06); border-radius: 1px; margin-top: 10px; overflow: hidden; }
        .s-pf { height: 100%; width: 40%; background: linear-gradient(90deg, #2563eb, #60a5fa); border-radius: 1px; animation: pbg 2s ease 1.5s both; }
        @keyframes pbg { from{width:0} to{width:40%} }

        .s-health { background: #111113; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px; }
        .s-score { font-size: 30px; font-weight: 800; color: #4ade80; line-height: 1; font-family: var(--serif); }
        .s-score-s { font-size: 9px; color: rgba(255,255,255,0.24); margin-top: 2px; }
        .s-bars { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        .s-bar { display: flex; flex-direction: column; gap: 2px; }
        .s-bar-l { font-size: 8px; color: rgba(255,255,255,0.22); text-transform: uppercase; letter-spacing: 0.4px; }
        .s-bar-t { height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; overflow: hidden; }
        .s-bar-f { height: 100%; border-radius: 1px; animation: pbg 1.5s ease 1.8s both; }

        /* SECTIONS */
        .reveal { opacity: 1; transform: translateY(0); transition: opacity 0.85s ease, transform 0.85s ease; }
        .reveal.in { opacity: 1; transform: translateY(0); }

        /* TENSION */
        .tension { padding: 180px 40px; text-align: center; position: relative; overflow: hidden; }
        .tension-in { max-width: 720px; margin: 0 auto; }

        .t-h { font-family: var(--serif); font-size: clamp(40px, 5.5vw, 68px); font-weight: 400; line-height: 1.06; letter-spacing: -1.2px; color: var(--white); margin-bottom: 20px; }
        .t-h em { font-style: italic; color: var(--muted); }

        .t-sub { font-size: 18px; font-weight: 300; color: var(--muted); line-height: 1.65; max-width: 460px; margin: 0 auto 72px; }

        .t-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; overflow: hidden; max-width: 720px; margin: 0 auto; }

        .t-col { background: var(--ink2); padding: 36px 32px; }

        .t-col-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 24px; }
        .t-col.bad .t-col-label { color: rgba(220,38,38,0.6); }
        .t-col.good .t-col-label { color: rgba(52,199,89,0.6); }

        .t-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 16px; font-size: 14px; color: rgba(249,248,245,0.5); line-height: 1.5; }
        .t-item-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; margin-top: 8px; }
        .t-col.bad .t-item-dot { background: rgba(220,38,38,0.5); }
        .t-col.good .t-item-dot { background: rgba(52,199,89,0.5); }
        .t-col.good .t-item { color: rgba(249,248,245,0.7); }

        /* SHIFT */
        .shift { padding: 160px 40px; max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }

        .shift-label { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--dim); margin-bottom: 20px; }

        .shift-h { font-family: var(--serif); font-size: clamp(36px, 4vw, 52px); font-weight: 400; line-height: 1.1; letter-spacing: -0.7px; color: var(--white); margin-bottom: 20px; }

        .shift-body { font-size: 16px; color: var(--muted); line-height: 1.75; margin-bottom: 32px; }

        .shift-list { display: flex; flex-direction: column; gap: 14px; }
        .shift-item { display: flex; align-items: flex-start; gap: 12px; font-size: 15px; color: rgba(249,248,245,0.6); line-height: 1.5; }
        .shift-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 8px; }

        .shift-vis { background: var(--ink2); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 32px; box-shadow: 0 32px 80px rgba(0,0,0,0.35); }

        /* MAGIC */
        .magic { padding: 200px 40px; text-align: center; position: relative; overflow: hidden; background: linear-gradient(180deg, var(--ink) 0%, #07070d 40%, #07070d 60%, var(--ink) 100%); }
        .magic-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 700px; height: 500px; background: radial-gradient(ellipse, rgba(37,99,235,0.09) 0%, transparent 65%); pointer-events: none; }

        .magic-in { max-width: 680px; margin: 0 auto; position: relative; }
        .magic-label { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--dim); margin-bottom: 20px; }

        .magic-h { font-family: var(--serif); font-size: clamp(48px, 7vw, 88px); font-weight: 400; line-height: 1.02; letter-spacing: -2px; color: var(--white); margin-bottom: 20px; }
        .magic-h em { font-style: italic; color: var(--muted); }

        .magic-sub { font-size: 18px; font-weight: 300; color: var(--muted); line-height: 1.65; margin-bottom: 80px; }

        .magic-seq { display: flex; max-width: 960px; margin: 0 auto; position: relative; }
        .magic-step { flex: 1; padding: 34px 22px; background: var(--ink2); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; text-align: left; position: relative; transition: border-color 0.3s, transform 0.3s; }
        .magic-step:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-3px); }
        .magic-step + .magic-step { margin-left: 10px; }
        .magic-step-n { font-family: var(--serif); font-size: 52px; font-weight: 400; color: rgba(255,255,255,0.03); position: absolute; top: 12px; right: 16px; line-height: 1; }
        .magic-icon { font-size: 24px; margin-bottom: 16px; display: block; }
        .magic-step-t { font-size: 14px; font-weight: 600; color: var(--white); margin-bottom: 8px; line-height: 1.3; }
        .magic-step-b { font-size: 12px; color: rgba(249,248,245,0.32); line-height: 1.65; }

        /* IMPACT */
        .impact { padding: 160px 40px; max-width: 1100px; margin: 0 auto; }
        .impact-head { text-align: center; margin-bottom: 80px; }
        .impact-h { font-family: var(--serif); font-size: clamp(36px, 4.5vw, 58px); font-weight: 400; line-height: 1.1; letter-spacing: -0.8px; color: var(--white); margin-bottom: 16px; }
        .impact-sub { font-size: 17px; font-weight: 300; color: var(--muted); line-height: 1.65; }

        .impact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .impact-card { background: var(--ink2); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 36px 32px; position: relative; overflow: hidden; transition: border-color 0.3s; }
        .impact-card:hover { border-color: rgba(255,255,255,0.12); }
        .impact-card.span2 { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }

        .ic-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--dim); margin-bottom: 14px; }
        .ic-h { font-family: var(--serif); font-size: 26px; font-weight: 400; color: var(--white); line-height: 1.2; margin-bottom: 12px; letter-spacing: -0.3px; }
        .ic-b { font-size: 14px; color: rgba(249,248,245,0.36); line-height: 1.7; }
        .ic-num { font-family: var(--serif); font-size: 70px; font-weight: 400; color: var(--white); line-height: 1; letter-spacing: -2px; margin-bottom: 10px; }
        .ic-vis { background: #111113; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 20px; }

        /* FOR */
        .for-s { padding: 160px 40px; background: var(--ink2); text-align: center; position: relative; overflow: hidden; }
        .for-s::before { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 800px; height: 300px; background: radial-gradient(ellipse at bottom, rgba(37,99,235,0.06) 0%, transparent 65%); pointer-events: none; }
        .for-in { max-width: 640px; margin: 0 auto; position: relative; }
        .for-h { font-family: var(--serif); font-size: clamp(36px, 4.5vw, 56px); font-weight: 400; line-height: 1.1; letter-spacing: -0.8px; color: var(--white); margin-bottom: 16px; }
        .for-sub { font-size: 17px; font-weight: 300; color: var(--muted); line-height: 1.65; margin-bottom: 48px; }
        .for-tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
        .for-tag { padding: 9px 18px; border: 1px solid rgba(255,255,255,0.09); border-radius: 100px; font-size: 14px; color: rgba(249,248,245,0.4); transition: all 0.2s; cursor: default; }
        .for-tag:hover { border-color: rgba(255,255,255,0.2); color: var(--white); }

        /* FINALE */
        .finale { padding: 220px 40px; text-align: center; position: relative; overflow: hidden; }
        .finale-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 1000px; height: 600px; background: radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 60%); pointer-events: none; }
        .finale-in { max-width: 680px; margin: 0 auto; position: relative; }
        .finale-h { font-family: var(--serif); font-size: clamp(52px, 7.5vw, 96px); font-weight: 400; line-height: 0.98; letter-spacing: -2.5px; color: var(--white); margin-bottom: 24px; }
        .finale-h em { font-style: italic; color: var(--muted); }
        .finale-sub { font-size: 17px; font-weight: 300; color: var(--muted); line-height: 1.65; margin-bottom: 48px; max-width: 420px; margin-left: auto; margin-right: auto; }
        .finale-note { margin-top: 22px; font-size: 12px; color: var(--dim); }

        /* FOOTER */
        footer { border-top: 1px solid rgba(255,255,255,0.05); padding: 36px 52px; display: flex; align-items: center; justify-content: space-between; }
        .f-copy { font-size: 12px; color: rgba(255,255,255,0.17); }
        .f-links { display: flex; gap: 24px; }
        .f-links a { font-size: 12px; color: rgba(255,255,255,0.2); text-decoration: none; transition: color 0.2s; }
        .f-links a:hover { color: rgba(255,255,255,0.55); }

        @media (max-width: 768px) {
          nav { padding: 0 20px; }
          .nav-r a:not(.nav-pill) { display: none; }
          .hero { padding: 100px 20px 64px; }
          .hero-h1 { letter-spacing: -1.5px; }
          .s-body { grid-template-columns: 1fr; }
          .s-nav { display: none; }
          .tension { padding: 100px 20px; }
          .t-grid { grid-template-columns: 1fr; }
          .shift { grid-template-columns: 1fr; padding: 100px 20px; gap: 48px; }
          .magic { padding: 120px 20px; }
          .magic-seq { flex-direction: column; }
          .magic-step + .magic-step { margin-left: 0; margin-top: 10px; }
          .impact { padding: 100px 20px; }
          .impact-grid { grid-template-columns: 1fr; }
          .impact-card.span2 { grid-column: span 1; grid-template-columns: 1fr; }
          .for-s { padding: 100px 20px; }
          .finale { padding: 120px 20px; }
          footer { flex-direction: column; gap: 16px; text-align: center; padding: 32px 20px; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <Link href="/" className="logo">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="12" fill="rgba(37,99,235,0.14)"/>
            <circle cx="13" cy="5" r="2" fill="#60a5fa"/>
            <circle cx="6" cy="18.5" r="2" fill="#60a5fa"/>
            <circle cx="20" cy="18.5" r="2" fill="#60a5fa"/>
            <circle cx="13" cy="13" r="3.2" fill="#3b82f6"/>
            <line x1="13" y1="7" x2="13" y2="9.8" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="7.8" y1="16.8" x2="10.3" y2="14.8" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="18.2" y1="16.8" x2="15.7" y2="14.8" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="13" cy="13" r="1.1" fill="white" fillOpacity="0.9"/>
          </svg>
          <span className="logo-name">Cervio</span>
        </Link>
        <div className="nav-r">
          <a href="#how">How it works</a>
          <Link href="/auth/login">Sign in</Link>
          <Link href="/auth/login" className="nav-pill">Get started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"/>
        <div className="hero-tag"><div className="hero-tag-dot"/>AI Chief of Staff</div>
        <h1 className="hero-h1">Stop managing.<br/><em>Start operating.</em></h1>
        <p className="hero-sub">Cervio sees what's broken, tells you what to do, and executes it with you.</p>
        <div className="hero-cta">
          <Link href="/auth/login" className="btn-w">
            Start operating
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7 2l4.5 4.5L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <a href="#how" className="btn-g">See how it works →</a>
        </div>

        {/* Product screen */}
        <div className="hero-screen">
          <div className="s-bar">
            <div className="s-dot" style={{background:'#ff5f56'}}/>
            <div className="s-dot" style={{background:'#ffbd2e'}}/>
            <div className="s-dot" style={{background:'#27c93f'}}/>
            <div className="s-title">cervio.ai — Command Centre</div>
          </div>
          <div className="s-body">
            <div className="s-nav">
              {[{i:'⊞',l:'Dashboard',on:true},{i:'⚡',l:'Decisions'},{i:'◎',l:'Goals'},{i:'✦',l:'Coach'},{i:'📅',l:'Calendar'},{i:'★',l:'Weekly Review'}].map(item => (
                <div key={item.l} className={`s-nav-item ${item.on ? 'on' : ''}`}>
                  <div className="s-nav-ico">{item.i}</div>{item.l}
                </div>
              ))}
              <div className="s-div"/>
              <div className="s-nav-item"><div className="s-nav-ico">⚙</div>Settings</div>
            </div>
            <div className="s-main">
              <div>
                <div className="s-lbl">AI Decision Required · 2 pending</div>
                <div className="s-card">
                  <div className="s-badge">Blocking execution</div>
                  <div className="s-card-t">Renew agency contract at $18k/month?</div>
                  <div className="s-card-b">Delivery slipped 3 of 4 months. Two alternatives ready to quote.</div>
                  <div className="s-rec">✗ Reject · 88% confidence</div>
                  <div className="s-btns">
                    <div className="s-btn s-btn-go">✓ Approve & Execute</div>
                    <div className="s-btn s-btn-sk">⏸ Delay</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="s-lbl">Execution in Progress</div>
                <div className="s-exec">
                  <div className="s-exec-h">
                    <div className="s-exec-dot"/><div className="s-exec-lbl">Q2 Revenue Plan</div>
                    <div className="s-exec-pct">40%</div>
                  </div>
                  {[{done:true,t:'Define revenue milestone'},{done:true,t:'Select acquisition channel'},{done:false,now:true,t:'Set KPI tracking system'},{done:false,t:'Schedule weekly review'}].map((t,i) => (
                    <div key={i} className="s-task">
                      <div className={`s-chk ${t.done?'done':t.now?'now':''}`}>{t.done?'✓':''}</div>
                      <span style={t.now?{color:'rgba(255,255,255,0.72)'}:{}}>{t.t}</span>
                    </div>
                  ))}
                  <div className="s-pb"><div className="s-pf"/></div>
                </div>
              </div>
              <div className="s-health">
                <div><div className="s-score">68</div><div className="s-score-s">/100 health</div></div>
                <div className="s-bars">
                  {[{l:'Revenue',w:'54%',c:'#f59e0b'},{l:'Execution',w:'70%',c:'#3b82f6'},{l:'Team',w:'78%',c:'#22c55e'},{l:'Risk',w:'40%',c:'#ef4444'}].map(b => (
                    <div key={b.l} className="s-bar">
                      <div className="s-bar-l">{b.l}</div>
                      <div className="s-bar-t"><div className="s-bar-f" style={{width:b.w,background:b.c}}/></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TENSION */}
      <section className="tension">
        <div className="tension-in reveal">
          <h2 className="t-h">Most companies don't fail<br/>from lack of ideas.<br/><em>They fail from lack of execution.</em></h2>
          <p className="t-sub">Decisions get made. Work doesn't happen. By the time you notice, momentum is already gone.</p>
        </div>
        <div className="t-grid reveal" style={{transitionDelay:'0.15s'}}>
          <div className="t-col bad">
            <div className="t-col-label">Without Cervio</div>
            {['Decisions made in meetings, never executed','Work disappears after approval','No one knows what\'s actually moving','Risks noticed too late to fix','Momentum lost to indecision'].map((t,i) => (
              <div key={i} className="t-item"><div className="t-item-dot"/>{t}</div>
            ))}
          </div>
          <div className="t-col good">
            <div className="t-col-label">With Cervio</div>
            {['Every decision creates immediate action','Execution is visible and tracked','You always know what\'s moving and what\'s stalled','Risks surface before they become crises','Momentum is built into the system'].map((t,i) => (
              <div key={i} className="t-item"><div className="t-item-dot"/>{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* SHIFT */}
      <section className="shift" id="how">
        <div className="reveal">
          <div className="shift-label">The shift</div>
          <h2 className="shift-h">Cervio closes the gap between decision and execution.</h2>
          <p className="shift-body">Not another tool. Not another dashboard. An operating layer that sees problems, recommends actions, and executes the moment you approve.</p>
          <div className="shift-list">
            {[
              {c:'#dc2626', t:'Sees risks and bottlenecks before they cost you'},
              {c:'#2563eb', t:'Recommends decisions with confidence scores and reasoning'},
              {c:'#16a34a', t:'Executes when you approve — tasks, owners, deadlines'},
              {c:'#d97706', t:'Tracks outcomes and scores its own accuracy over time'},
            ].map((item,i) => (
              <div key={i} className="shift-item">
                <div className="shift-dot" style={{background:item.c}}/>
                {item.t}
              </div>
            ))}
          </div>
        </div>
        <div className="shift-vis reveal" style={{transitionDelay:'0.2s'}}>
          <div style={{fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:'14px'}}>Business Health</div>
          <div style={{fontFamily:'var(--serif)',fontSize:'52px',fontWeight:400,color:'#4ade80',lineHeight:1,marginBottom:'6px'}}>68</div>
          <div style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',marginBottom:'18px'}}>/100 · Needs attention</div>
          {[{l:'Revenue',w:'54%',c:'#f59e0b',v:54},{l:'Execution',w:'70%',c:'#3b82f6',v:70},{l:'Team',w:'78%',c:'#22c55e',v:78},{l:'Risk',w:'40%',c:'#ef4444',v:40}].map(b => (
            <div key={b.l} style={{marginBottom:'10px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                <span style={{fontSize:'12px',color:'rgba(255,255,255,0.32)'}}>{b.l}</span>
                <span style={{fontSize:'12px',fontWeight:700,color:b.c}}>{b.v}</span>
              </div>
              <div style={{height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',overflow:'hidden'}}>
                <div style={{height:'100%',width:b.w,background:b.c,borderRadius:'2px'}}/>
              </div>
            </div>
          ))}
          <div style={{marginTop:'18px',paddingTop:'14px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.2)',marginBottom:'8px',letterSpacing:'1px',textTransform:'uppercase'}}>Blocking your score</div>
            {['Q2 revenue at 34% — 67 days left','Agency contract decision 12 days overdue'].map((f,i) => (
              <div key={i} style={{fontSize:'12px',color:'rgba(255,255,255,0.36)',paddingLeft:'10px',borderLeft:'2px solid #dc2626',marginBottom:'6px',lineHeight:1.5}}>{f}</div>
            ))}
          </div>
        </div>
      </section>

      {/* MAGIC */}
      <section className="magic" id="magic">
        <div className="magic-glow"/>
        <div className="magic-in reveal">
          <div className="magic-label">The moment</div>
          <h2 className="magic-h">You click approve.<br/><em>Cervio does the rest.</em></h2>
          <p className="magic-sub">No follow-up emails. No lost action items. No wondering if it happened.</p>
        </div>
        <div className="magic-seq reveal" style={{transitionDelay:'0.2s',maxWidth:'960px',margin:'0 auto'}}>
          {[
            {icon:'⚡',n:'1',t:'Decision surfaces',b:'Full context, consequences, and a recommendation — already prepared and waiting.'},
            {icon:'✓',n:'2',t:'You approve',b:'One tap. That is your entire input. Everything else is handled automatically.'},
            {icon:'⚙',n:'3',t:'Execution starts',b:'Tasks created. Owners assigned. Deadlines set. Messages drafted and queued.'},
            {icon:'📊',n:'4',t:'Outcome tracked',b:'Cervio scores its own recommendation. Over time, it learns and sharpens.'},
          ].map((s,i) => (
            <div key={i} className="magic-step" style={{transitionDelay:`${0.2+i*0.1}s`}}>
              <div className="magic-step-n">{s.n}</div>
              <span className="magic-icon">{s.icon}</span>
              <div className="magic-step-t">{s.t}</div>
              <div className="magic-step-b">{s.b}</div>
            </div>
          ))}
        </div>
      </section>

      {/* IMPACT */}
      <section className="impact">
        <div className="impact-head reveal">
          <div style={{fontSize:'11px',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(249,248,245,0.22)',marginBottom:'16px'}}>The impact</div>
          <h2 className="impact-h">Momentum becomes visible.</h2>
          <p className="impact-sub">Work doesn't disappear after meetings. Decisions don't stall. Progress moves.</p>
        </div>
        <div className="impact-grid">
          <div className="impact-card span2 reveal">
            <div>
              <div className="ic-label">Decision Engine</div>
              <h3 className="ic-h">Every decision comes with a recommendation, confidence score, and consequence model.</h3>
              <p className="ic-b">Approve, reject, or delay — with full reasoning. Cervio tracks your accuracy over time and identifies where your instincts are costing you money.</p>
            </div>
            <div className="ic-vis">
              <div style={{fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'12px'}}>Decision Required</div>
              <div style={{fontSize:'14px',fontWeight:600,color:'rgba(255,255,255,0.86)',marginBottom:'7px',lineHeight:1.3}}>Expand into the UK market this quarter?</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',marginBottom:'12px',lineHeight:1.6}}>Cash position 4.2 months. Market timing strong. Execution resources stretched.</div>
              <div style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:'11px',fontWeight:700,color:'#fbbf24',background:'rgba(251,191,36,0.1)',padding:'5px 10px',borderRadius:7,marginBottom:12}}>⏸ Delay · 76% confidence</div>
              <div style={{display:'flex',gap:8}}>
                <div style={{padding:'6px 12px',background:'#16a34a',color:'white',borderRadius:8,fontSize:'11px',fontWeight:600}}>Approve anyway</div>
                <div style={{padding:'6px 12px',background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.38)',borderRadius:8,fontSize:'11px'}}>Follow recommendation</div>
              </div>
            </div>
          </div>
          {[
            {label:'Your accuracy rate',num:'71%',body:'When following Cervio: 84%. When overriding: 52%. The data is clear.',delay:'0.1s'},
            {label:'Decisions lost after approval',num:'0',body:'Every approved decision creates tasks, assigns owners, and tracks to completion.',delay:'0.15s'},
            {label:'Predictive intelligence',h:'Knows what will break before it does.',body:'Revenue risk, execution bottlenecks, cold relationships — surfaced while you still have time.',delay:'0.2s'},
            {label:'Accountability system',h:'Cervio doesn\'t let things slide.',body:'"You\'ve delayed this 3 times. This is blocking execution." It detects avoidance and names it.',delay:'0.25s'},
          ].map((c,i) => (
            <div key={i} className="impact-card reveal" style={{transitionDelay:c.delay}}>
              <div className="ic-label">{c.label}</div>
              {c.num && <div className="ic-num">{c.num}</div>}
              {c.h && <h3 className="ic-h">{c.h}</h3>}
              <p className="ic-b">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOR */}
      <section className="for-s">
        <div className="for-in reveal">
          <div style={{fontSize:'11px',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(249,248,245,0.22)',marginBottom:'16px'}}>Built for</div>
          <h2 className="for-h">Operators who move fast and hate excuses.</h2>
          <p className="for-sub">Not a tool for thinking about your business. A system for running it.</p>
          <div className="for-tags">
            {['Founders','CEOs','COOs','Series A — C','Scale-up operators','Executive teams','Anyone who ships'].map(t => (
              <div key={t} className="for-tag">{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FINALE */}
      <section className="finale">
        <div className="finale-glow"/>
        <div className="finale-in reveal">
          <h2 className="finale-h">Stop managing.<br/><em>Start operating.</em></h2>
          <p className="finale-sub">Your business is ready to run properly. Cervio is ready when you are.</p>
          <Link href="/auth/login" className="btn-w" style={{fontSize:'16px',padding:'16px 40px',display:'inline-flex',margin:'0 auto'}}>
            Start running your business
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div className="finale-note">Free trial · No credit card · Built by Morphotech</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="f-copy">© 2026 Morphotech Australia Pty Ltd</div>
        <div className="f-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/auth/login">Sign in</Link>
          <Link href="/auth/login">Get started</Link>
        </div>
      </footer>

      <script dangerouslySetInnerHTML={{__html:`
        function initReveal() {
          const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                const d = parseFloat(e.target.style.transitionDelay || '0') * 1000
                setTimeout(() => e.target.classList.add('in'), d)
                io.unobserve(e.target)
              }
            })
          }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' })
          document.querySelectorAll('.reveal').forEach(el => io.observe(el))
        }
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initReveal)
        } else {
          initReveal()
        }
      `}}/>
    </>
  )
}
