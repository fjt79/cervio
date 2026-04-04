import Link from 'next/link'

export const metadata = {
  title: 'Cervio — Run your company like a system.',
  description: 'Cervio sees what is breaking, recommends decisions, and executes them. The operating system for your business.',
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #0a0a0a;
          --ink-2: #111113;
          --ink-3: #18181b;
          --white: #fafaf8;
          --off: #f4f3f0;
          --stone: #e8e6e1;
          --muted: rgba(250,250,248,0.45);
          --dim: rgba(250,250,248,0.22);
          --accent: #2563eb;
          --accent-glow: rgba(37,99,235,0.14);
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

        /* Grain */
        body::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 256px;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.4;
        }

        /* ── NAV ──────────────────────────────────── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 52px; height: 60px;
          background: rgba(10,10,10,0.72);
          backdrop-filter: blur(28px) saturate(160%);
          border-bottom: 1px solid rgba(255,255,255,0.045);
        }

        .nav-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .nav-name { font-weight: 600; font-size: 16px; color: var(--white); letter-spacing: -0.2px; }

        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-links a { font-size: 14px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
        .nav-links a:hover { color: var(--white); }

        .nav-pill {
          background: var(--white); color: var(--ink);
          padding: 7px 18px; border-radius: 100px;
          font-size: 13px; font-weight: 600; text-decoration: none;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: -0.1px;
        }
        .nav-pill:hover { opacity: 0.87; transform: translateY(-1px); }

        /* ── HERO ─────────────────────────────────── */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 120px 40px 80px;
          position: relative; overflow: hidden;
        }

        .hero-ambient {
          position: absolute; top: -10%; left: 50%; transform: translateX(-50%);
          width: 900px; height: 700px;
          background: radial-gradient(ellipse at 50% 30%, rgba(37,99,235,0.13) 0%, rgba(37,99,235,0.04) 35%, transparent 65%);
          pointer-events: none;
        }

        .hero-ambient-2 {
          position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 600px; height: 300px;
          background: radial-gradient(ellipse at bottom, rgba(37,99,235,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 500; letter-spacing: 2px;
          text-transform: uppercase; color: var(--dim);
          margin-bottom: 28px;
          opacity: 0; animation: rise 0.7s ease 0.15s forwards;
        }

        .hero-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%; background: var(--accent);
          animation: breathe 2.5s ease-in-out infinite;
        }

        @keyframes breathe { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.35;transform:scale(0.6)} }

        .hero-h1 {
          font-family: var(--serif);
          font-size: clamp(56px, 7.5vw, 104px);
          font-weight: 400; line-height: 0.98;
          letter-spacing: -2px;
          color: var(--white);
          max-width: 820px;
          margin-bottom: 26px;
          opacity: 0; animation: rise 0.9s ease 0.3s forwards;
        }

        .hero-h1 em { font-style: italic; color: var(--muted); }

        .hero-sub {
          font-size: 18px; font-weight: 300;
          color: rgba(250,250,248,0.5);
          max-width: 440px; line-height: 1.65;
          margin-bottom: 44px;
          opacity: 0; animation: rise 0.9s ease 0.5s forwards;
          letter-spacing: 0.1px;
        }

        .hero-cta {
          display: flex; gap: 12px; align-items: center;
          margin-bottom: 88px;
          opacity: 0; animation: rise 0.9s ease 0.65s forwards;
        }

        .cta-main {
          background: var(--white); color: var(--ink);
          padding: 14px 30px; border-radius: 100px;
          font-size: 15px; font-weight: 600; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          transition: opacity 0.2s, transform 0.2s;
          letter-spacing: -0.2px;
        }
        .cta-main:hover { opacity: 0.87; transform: translateY(-2px); }

        .cta-ghost {
          font-size: 14px; color: var(--muted); text-decoration: none;
          padding: 14px 16px;
          transition: color 0.2s;
          display: flex; align-items: center; gap: 5px;
        }
        .cta-ghost:hover { color: var(--white); }

        /* ── HERO UI ──────────────────────────────── */
        .hero-frame {
          width: 100%; max-width: 960px;
          border-radius: 22px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 60px 140px rgba(0,0,0,0.65),
            0 20px 40px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.06);
          opacity: 0; animation: riseFrame 1.2s ease 0.8s forwards;
          background: #0d0d0e;
        }

        @keyframes riseFrame {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .frame-bar {
          background: #101012; padding: 11px 14px;
          display: flex; align-items: center; gap: 7px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .dot { width: 9px; height: 9px; border-radius: 50%; }

        .frame-title {
          flex: 1; text-align: center;
          font-size: 11px; color: rgba(255,255,255,0.16);
          letter-spacing: 0.3px;
        }

        .frame-body {
          display: grid; grid-template-columns: 200px 1fr;
          min-height: 420px;
        }

        .frame-sidebar {
          background: #090909;
          border-right: 1px solid rgba(255,255,255,0.04);
          padding: 14px 0;
        }

        .f-item {
          padding: 8px 16px; font-size: 12px;
          color: rgba(255,255,255,0.25);
          display: flex; align-items: center; gap: 9px;
          transition: all 0.15s;
        }
        .f-item.on { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.04); }

        .f-ico {
          width: 15px; height: 15px; border-radius: 4px;
          background: rgba(255,255,255,0.04);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; flex-shrink: 0;
        }
        .f-item.on .f-ico { background: rgba(37,99,235,0.2); }

        .f-divider { height: 1px; background: rgba(255,255,255,0.04); margin: 8px 0; }

        .frame-main { padding: 20px; display: flex; flex-direction: column; gap: 12px; }

        .f-label {
          font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
          text-transform: uppercase; color: rgba(255,255,255,0.22);
          margin-bottom: 6px;
        }

        /* Decision card */
        .f-decision {
          background: #111113; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 14px; position: relative; overflow: hidden;
        }
        .f-decision::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #dc2626 0%, rgba(220,38,38,0) 70%);
        }

        .f-dec-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.7px;
          text-transform: uppercase; color: #f87171;
          background: rgba(220,38,38,0.1); padding: 2px 7px; border-radius: 20px;
          margin-bottom: 8px;
        }
        .f-dec-tag::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: #f87171; animation: breathe 1.5s ease-in-out infinite; }

        .f-dec-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.88); margin-bottom: 5px; line-height: 1.3; }
        .f-dec-body { font-size: 11px; color: rgba(255,255,255,0.32); margin-bottom: 10px; line-height: 1.5; }

        .f-rec {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; color: #4ade80;
          background: rgba(74,222,128,0.1); padding: 4px 10px; border-radius: 7px;
          margin-bottom: 11px;
        }

        .f-btns { display: flex; gap: 7px; }
        .f-btn { padding: 6px 12px; border-radius: 7px; font-size: 11px; font-weight: 600; border: none; cursor: default; }
        .f-btn-go { background: #16a34a; color: white; position: relative; overflow: hidden; }
        .f-btn-go::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: sheen 2.5s ease 1.5s infinite;
        }
        @keyframes sheen { to { left: 100%; } }
        .f-btn-skip { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.36); }

        /* Execution card */
        .f-exec {
          background: #111113; border: 1px solid rgba(37,99,235,0.2);
          border-radius: 12px; padding: 14px;
        }
        .f-exec-head { display: flex; align-items: center; gap: 7px; margin-bottom: 10px; }
        .f-exec-dot { width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; animation: breathe 1.5s ease-in-out infinite; }
        .f-exec-label { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #60a5fa; }
        .f-exec-pct { margin-left: auto; font-size: 10px; color: rgba(255,255,255,0.25); }

        .f-task { display: flex; align-items: center; gap: 7px; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 11px; color: rgba(255,255,255,0.45); }
        .f-task:last-of-type { border-bottom: none; }
        .f-check { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.1); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 7px; }
        .f-check.done { background: #16a34a; border-color: #16a34a; color: white; }
        .f-check.now { border-color: rgba(37,99,235,0.5); background: rgba(37,99,235,0.1); }

        .f-pb { height: 2px; background: rgba(255,255,255,0.06); border-radius: 1px; margin-top: 10px; overflow: hidden; }
        .f-pf { height: 100%; width: 40%; background: linear-gradient(90deg, #2563eb, #60a5fa); border-radius: 1px; animation: pbGrow 2s ease 1.5s both; }
        @keyframes pbGrow { from { width: 0 } to { width: 40% } }

        /* Health mini */
        .f-health {
          background: #111113; border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px; padding: 12px;
          display: flex; align-items: center; gap: 12px;
        }
        .f-score { font-size: 28px; font-weight: 800; color: #4ade80; line-height: 1; }
        .f-score-sub { font-size: 9px; color: rgba(255,255,255,0.25); margin-top: 2px; }
        .f-bars { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        .f-bar { display: flex; flex-direction: column; gap: 2px; }
        .f-bar-l { font-size: 8px; color: rgba(255,255,255,0.22); text-transform: uppercase; letter-spacing: 0.4px; }
        .f-bar-t { height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; overflow: hidden; }
        .f-bar-f { height: 100%; border-radius: 1px; animation: pbGrow 1.5s ease 1.8s both; }

        @keyframes rise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── TENSION ──────────────────────────────── */
        .tension {
          padding: 180px 40px;
          text-align: center;
          position: relative; overflow: hidden;
        }

        .tension-in { max-width: 700px; margin: 0 auto; }

        .tension-h {
          font-family: var(--serif);
          font-size: clamp(40px, 5.5vw, 66px);
          font-weight: 400; line-height: 1.08;
          letter-spacing: -1px;
          color: var(--white);
          margin-bottom: 20px;
        }

        .tension-h em { font-style: italic; color: var(--muted); }

        .tension-sub {
          font-size: 18px; font-weight: 300;
          color: rgba(250,250,248,0.42);
          line-height: 1.7; max-width: 480px; margin: 0 auto 72px;
        }

        .tension-stats {
          display: flex; gap: 1px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px; overflow: hidden;
          max-width: 820px; margin: 0 auto;
        }

        .tension-stat {
          flex: 1; background: var(--ink-2);
          padding: 40px 28px; text-align: center;
        }

        .tension-num {
          font-family: var(--serif);
          font-size: 56px; font-weight: 400;
          color: var(--white); line-height: 1;
          letter-spacing: -2px; margin-bottom: 12px;
        }

        .tension-desc {
          font-size: 13px; color: rgba(250,250,248,0.35);
          line-height: 1.6;
        }

        .tension-desc strong { color: rgba(250,250,248,0.65); font-weight: 500; }

        /* ── SHIFT ────────────────────────────────── */
        .shift {
          padding: 160px 40px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; max-width: 1100px; margin: 0 auto;
          align-items: center;
        }

        .shift-copy {}

        .shift-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; color: var(--dim); margin-bottom: 20px;
        }

        .shift-h {
          font-family: var(--serif);
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 400; line-height: 1.1;
          letter-spacing: -0.7px; color: var(--white);
          margin-bottom: 20px;
        }

        .shift-body {
          font-size: 16px; color: rgba(250,250,248,0.42);
          line-height: 1.75; margin-bottom: 32px;
        }

        .shift-list { display: flex; flex-direction: column; gap: 12px; }

        .shift-item {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 15px; color: rgba(250,250,248,0.65);
          line-height: 1.5;
        }

        .shift-item-dot {
          width: 6px; height: 6px; border-radius: 50%;
          flex-shrink: 0; margin-top: 8px;
        }

        .shift-visual {
          background: var(--ink-2);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 32px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.4);
        }

        /* ── MAGIC ────────────────────────────────── */
        .magic {
          padding: 200px 40px;
          text-align: center;
          position: relative; overflow: hidden;
          background: linear-gradient(180deg, var(--ink) 0%, #07070d 40%, #07070d 60%, var(--ink) 100%);
        }

        .magic-glow {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 700px; height: 500px;
          background: radial-gradient(ellipse, rgba(37,99,235,0.1) 0%, transparent 65%);
          pointer-events: none;
        }

        .magic-in { max-width: 680px; margin: 0 auto; position: relative; }

        .magic-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; color: var(--dim); margin-bottom: 20px;
        }

        .magic-h {
          font-family: var(--serif);
          font-size: clamp(44px, 6vw, 80px);
          font-weight: 400; line-height: 1.05;
          letter-spacing: -1.5px; color: var(--white);
          margin-bottom: 20px;
        }

        .magic-h em { font-style: italic; color: var(--muted); }

        .magic-sub {
          font-size: 17px; font-weight: 300;
          color: rgba(250,250,248,0.4);
          line-height: 1.65; margin-bottom: 80px;
        }

        .magic-sequence {
          display: flex; gap: 0; max-width: 960px;
          margin: 0 auto; position: relative;
        }

        .magic-step {
          flex: 1; padding: 36px 24px;
          background: var(--ink-2);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px; text-align: left;
          position: relative; transition: border-color 0.3s, transform 0.3s;
        }

        .magic-step:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-3px); }
        .magic-step + .magic-step { margin-left: 10px; }

        .magic-step-n {
          font-family: var(--serif);
          font-size: 48px; font-weight: 400;
          color: rgba(255,255,255,0.03);
          position: absolute; top: 14px; right: 18px;
          line-height: 1;
        }

        .magic-step-icon { font-size: 24px; margin-bottom: 16px; display: block; }

        .magic-step-title {
          font-size: 15px; font-weight: 600;
          color: var(--white); margin-bottom: 8px;
        }

        .magic-step-body {
          font-size: 13px; color: rgba(250,250,248,0.35);
          line-height: 1.65;
        }

        /* ── IMPACT ───────────────────────────────── */
        .impact {
          padding: 160px 40px;
          max-width: 1100px; margin: 0 auto;
        }

        .impact-head { text-align: center; margin-bottom: 80px; }

        .impact-h {
          font-family: var(--serif);
          font-size: clamp(36px, 4.5vw, 58px);
          font-weight: 400; line-height: 1.1;
          letter-spacing: -0.8px; color: var(--white);
          margin-bottom: 16px;
        }

        .impact-sub {
          font-size: 17px; font-weight: 300;
          color: rgba(250,250,248,0.38); line-height: 1.65;
        }

        .impact-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .impact-card {
          background: var(--ink-2);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 36px 32px;
          position: relative; overflow: hidden;
          transition: border-color 0.3s;
        }

        .impact-card:hover { border-color: rgba(255,255,255,0.12); }

        .impact-card.wide { grid-column: span 2; }

        .impact-card-label {
          font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: var(--dim);
          margin-bottom: 14px;
        }

        .impact-card-h {
          font-family: var(--serif);
          font-size: 26px; font-weight: 400;
          color: var(--white); line-height: 1.2;
          margin-bottom: 12px; letter-spacing: -0.3px;
        }

        .impact-card-body {
          font-size: 14px; color: rgba(250,250,248,0.36);
          line-height: 1.7;
        }

        .impact-num {
          font-family: var(--serif);
          font-size: 72px; font-weight: 400;
          color: var(--white); line-height: 1;
          letter-spacing: -2px; margin-bottom: 10px;
        }

        /* ── FOR ──────────────────────────────────── */
        .for-section {
          padding: 160px 40px;
          text-align: center;
          background: var(--ink-2);
          position: relative; overflow: hidden;
        }

        .for-section::before {
          content: ''; position: absolute;
          bottom: 0; left: 50%; transform: translateX(-50%);
          width: 800px; height: 300px;
          background: radial-gradient(ellipse at bottom, rgba(37,99,235,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .for-in { max-width: 640px; margin: 0 auto; position: relative; }

        .for-h {
          font-family: var(--serif);
          font-size: clamp(36px, 4.5vw, 56px);
          font-weight: 400; line-height: 1.1;
          letter-spacing: -0.8px; color: var(--white);
          margin-bottom: 16px;
        }

        .for-sub {
          font-size: 17px; font-weight: 300;
          color: rgba(250,250,248,0.38);
          line-height: 1.65; margin-bottom: 48px;
        }

        .for-tags {
          display: flex; flex-wrap: wrap;
          gap: 8px; justify-content: center;
        }

        .for-tag {
          padding: 9px 18px;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 100px; font-size: 14px;
          color: rgba(250,250,248,0.42);
          transition: all 0.2s; cursor: default;
        }

        .for-tag:hover { border-color: rgba(255,255,255,0.2); color: var(--white); }

        /* ── FINAL CTA ────────────────────────────── */
        .finale {
          padding: 220px 40px;
          text-align: center;
          position: relative; overflow: hidden;
        }

        .finale-glow {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 1000px; height: 600px;
          background: radial-gradient(ellipse, rgba(37,99,235,0.09) 0%, transparent 60%);
          pointer-events: none;
        }

        .finale-in { max-width: 680px; margin: 0 auto; position: relative; }

        .finale-h {
          font-family: var(--serif);
          font-size: clamp(48px, 7vw, 92px);
          font-weight: 400; line-height: 1.0;
          letter-spacing: -2px; color: var(--white);
          margin-bottom: 22px;
        }

        .finale-h em { font-style: italic; color: var(--muted); }

        .finale-sub {
          font-size: 17px; font-weight: 300;
          color: rgba(250,250,248,0.36);
          line-height: 1.65; margin-bottom: 48px;
          max-width: 440px; margin-left: auto; margin-right: auto;
        }

        .finale-note {
          margin-top: 22px;
          font-size: 12px; color: var(--dim);
        }

        /* ── FOOTER ───────────────────────────────── */
        footer {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 36px 52px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .footer-copy { font-size: 12px; color: rgba(255,255,255,0.18); }

        .footer-links { display: flex; gap: 24px; }
        .footer-links a { font-size: 12px; color: rgba(255,255,255,0.22); text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: rgba(255,255,255,0.55); }

        /* ── REVEAL ───────────────────────────────── */
       .reveal {
          opacity: 1; transform: translateY(0);
          transition: opacity 0.85s ease, transform 0.85s ease;
        }
        .reveal.in { opacity: 1; transform: translateY(0); }

        .reveal-slow {
          opacity: 1; transform: translateY(0);
          transition: opacity 1.1s ease, transform 1.1s ease;
        }
        .reveal-slow.in { opacity: 1; transform: translateY(0); }

        /* ── RESPONSIVE ───────────────────────────── */
        @media (max-width: 768px) {
          .nav { padding: 0 20px; }
          .nav-links { display: none; }
          .hero { padding: 100px 20px 64px; }
          .hero-h1 { letter-spacing: -1px; }
          .frame-body { grid-template-columns: 1fr; }
          .frame-sidebar { display: none; }
          .tension { padding: 100px 20px; }
          .tension-stats { flex-direction: column; }
          .shift { grid-template-columns: 1fr; padding: 100px 20px; gap: 48px; }
          .magic { padding: 120px 20px; }
          .magic-sequence { flex-direction: column; }
          .magic-step + .magic-step { margin-left: 0; margin-top: 10px; }
          .impact { padding: 100px 20px; }
          .impact-grid { grid-template-columns: 1fr; }
          .impact-card.wide { grid-column: span 1; }
          .for-section { padding: 100px 20px; }
          .finale { padding: 120px 20px; }
          footer { flex-direction: column; gap: 16px; text-align: center; padding: 32px 20px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">
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
          <span className="nav-name">Cervio</span>
        </Link>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#for">Who it's for</a>
          <Link href="/auth/login">Sign in</Link>
          <Link href="/auth/login" className="nav-pill">Get started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-ambient" />
        <div className="hero-ambient-2" />

        <div className="hero-eyebrow">
          <div className="hero-eyebrow-dot" />
          AI Chief of Staff
        </div>

        <h1 className="hero-h1">
          Run your company<br /><em>like a system.</em>
        </h1>

        <p className="hero-sub">
          Cervio sees what's breaking, recommends what to do, and executes when you approve.
        </p>

        <div className="hero-cta">
          <Link href="/auth/login" className="cta-main">
            Start operating
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 6.5h9M7 2l4.5 4.5L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <a href="#how" className="cta-ghost">See how it works →</a>
        </div>

        {/* Product frame */}
        <div className="hero-frame">
          <div className="frame-bar">
            <div className="dot" style={{background:'#ff5f56'}}/>
            <div className="dot" style={{background:'#ffbd2e'}}/>
            <div className="dot" style={{background:'#27c93f'}}/>
            <div className="frame-title">cervio.ai — Command Centre</div>
          </div>
          <div className="frame-body">
            <div className="frame-sidebar">
              {[
                {icon:'⊞',label:'Dashboard',on:true},
                {icon:'⚡',label:'Decisions'},
                {icon:'◎',label:'Goals'},
                {icon:'✦',label:'Coach'},
                {icon:'📅',label:'Calendar'},
                {icon:'★',label:'Weekly Review'},
              ].map(item => (
                <div key={item.label} className={`f-item ${item.on ? 'on' : ''}`}>
                  <div className="f-ico">{item.icon}</div>
                  {item.label}
                </div>
              ))}
              <div className="f-divider"/>
              <div className="f-item" style={{marginTop: 'auto'}}>
                <div className="f-ico">⚙</div>
                Settings
              </div>
            </div>

            <div className="frame-main">
              {/* Decision */}
              <div>
                <div className="f-label">AI Decision Required · 2 pending</div>
                <div className="f-decision">
                  <div className="f-dec-tag">Blocking execution</div>
                  <div className="f-dec-title">Renew agency contract at $18k/month?</div>
                  <div className="f-dec-body">Delivery slipped 3 of 4 months. Two alternatives in your network ready to quote.</div>
                  <div className="f-rec">✗ Cervio recommends: Reject · 88% confidence</div>
                  <div className="f-btns">
                    <div className="f-btn f-btn-go">✓ Approve & Execute</div>
                    <div className="f-btn f-btn-skip">⏸ Delay</div>
                  </div>
                </div>
              </div>

              {/* Execution */}
              <div>
                <div className="f-label">Execution in Progress</div>
                <div className="f-exec">
                  <div className="f-exec-head">
                    <div className="f-exec-dot"/>
                    <div className="f-exec-label">Q2 Revenue Plan</div>
                    <div className="f-exec-pct">40% complete</div>
                  </div>
                  {[
                    {done:true,text:'Define revenue milestone'},
                    {done:true,text:'Select acquisition channel'},
                    {done:false,now:true,text:'Set KPI tracking system'},
                    {done:false,text:'Schedule weekly review'},
                  ].map((t,i) => (
                    <div key={i} className="f-task">
                      <div className={`f-check ${t.done ? 'done' : t.now ? 'now' : ''}`}>
                        {t.done ? '✓' : ''}
                      </div>
                      <span style={t.now ? {color:'rgba(255,255,255,0.72)'} : {}}>{t.text}</span>
                    </div>
                  ))}
                  <div className="f-pb"><div className="f-pf"/></div>
                </div>
              </div>

              {/* Health */}
              <div className="f-health">
                <div>
                  <div className="f-score">68</div>
                  <div className="f-score-sub">/100 health</div>
                </div>
                <div className="f-bars">
                  {[
                    {l:'Revenue',w:'54%',c:'#f59e0b'},
                    {l:'Execution',w:'70%',c:'#3b82f6'},
                    {l:'Team',w:'78%',c:'#22c55e'},
                    {l:'Risk',w:'40%',c:'#ef4444'},
                  ].map(b => (
                    <div key={b.l} className="f-bar">
                      <div className="f-bar-l">{b.l}</div>
                      <div className="f-bar-t">
                        <div className="f-bar-f" style={{width:b.w,background:b.c}}/>
                      </div>
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
          <div className="tension-h">
            Decisions are easy.<br /><em>Execution is the hard part.</em>
          </div>
          <p className="tension-sub">
            Most companies don't fail from lack of ideas. They fail because decisions disappear after the meeting, and no one knows what's actually moving.
          </p>
        </div>
        <div className="tension-stats reveal" style={{transitionDelay:'0.15s'}}>
          <div className="tension-stat">
            <div className="tension-num">73%</div>
            <div className="tension-desc">of strategic decisions are made with <strong>incomplete information</strong> — or delayed until it's too late.</div>
          </div>
          <div className="tension-stat">
            <div className="tension-num">4.2h</div>
            <div className="tension-desc">lost every day to <strong>reactive decisions</strong>, status checks, and work that should already be happening.</div>
          </div>
          <div className="tension-stat">
            <div className="tension-num">60%</div>
            <div className="tension-desc">of approved decisions are <strong>never executed.</strong> The work simply doesn't happen.</div>
          </div>
        </div>
      </section>

      {/* SHIFT */}
      <section className="shift" id="how">
        <div className="shift-copy reveal">
          <div className="shift-eyebrow">The shift</div>
          <h2 className="shift-h">Cervio closes the gap between decision and execution.</h2>
          <p className="shift-body">
            Not another dashboard. Not another AI chat. A system that actually runs your business — sees problems, recommends actions, and executes when you approve.
          </p>
          <div className="shift-list">
            {[
              {color:'#dc2626', text:'Sees risks and bottlenecks before they become crises'},
              {color:'#2563eb', text:'Recommends decisions with reasoning and confidence scores'},
              {color:'#16a34a', text:'Executes approved actions — tasks, messages, follow-ups'},
              {color:'#d97706', text:'Tracks outcomes and scores your decision accuracy over time'},
            ].map((item, i) => (
              <div key={i} className="shift-item">
                <div className="shift-item-dot" style={{background: item.color}}/>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <div className="shift-visual reveal" style={{transitionDelay:'0.2s'}}>
          <div style={{fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:'1.2px',textTransform:'uppercase',marginBottom:'16px'}}>Business Health</div>
          <div style={{fontSize:'52px',fontWeight:800,color:'#4ade80',lineHeight:1,marginBottom:'6px',fontFamily:'var(--serif)'}}>68</div>
          <div style={{fontSize:'12px',color:'rgba(255,255,255,0.28)',marginBottom:'20px'}}>/ 100 · Needs attention</div>
          <div style={{height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',marginBottom:'20px',overflow:'hidden'}}>
            <div style={{height:'100%',width:'68%',background:'linear-gradient(90deg, #2563eb, #60a5fa)',borderRadius:'2px'}}/>
          </div>
          {[
            {l:'Revenue',w:'54%',c:'#f59e0b',v:54},
            {l:'Execution',w:'70%',c:'#3b82f6',v:70},
            {l:'Team',w:'78%',c:'#22c55e',v:78},
            {l:'Risk',w:'40%',c:'#ef4444',v:40},
          ].map(b => (
            <div key={b.l} style={{marginBottom:'10px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                <span style={{fontSize:'12px',color:'rgba(255,255,255,0.35)'}}>{b.l}</span>
                <span style={{fontSize:'12px',fontWeight:700,color:b.c}}>{b.v}</span>
              </div>
              <div style={{height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',overflow:'hidden'}}>
                <div style={{height:'100%',width:b.w,background:b.c,borderRadius:'2px'}}/>
              </div>
            </div>
          ))}
          <div style={{marginTop:'20px',paddingTop:'16px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,0.22)',marginBottom:'8px'}}>DRAGGING YOUR SCORE</div>
            {['Q2 revenue at 34% — 67 days left','Agency contract decision overdue'].map((f,i) => (
              <div key={i} style={{fontSize:'12px',color:'rgba(255,255,255,0.38)',paddingLeft:'10px',borderLeft:'2px solid #dc2626',marginBottom:'6px',lineHeight:1.5}}>{f}</div>
            ))}
          </div>
        </div>
      </section>

      {/* MAGIC */}
      <section className="magic">
        <div className="magic-glow"/>
        <div className="magic-in reveal">
          <div className="magic-eyebrow">The moment</div>
          <h2 className="magic-h">
            You click approve.<br /><em>Cervio does the rest.</em>
          </h2>
          <p className="magic-sub">
            No follow-up emails. No lost action items. No wondering if it happened.
          </p>
        </div>

        <div className="magic-sequence reveal" style={{transitionDelay:'0.2s'}}>
          {[
            {icon:'⚡',n:'1',title:'Decision surfaces',body:'Cervio identifies what needs to be decided — full context, reasoning, and a recommendation already prepared.'},
            {icon:'✓',n:'2',title:'You approve',body:'One tap. That is your entire input. The recommendation, the plan, and the execution queue are already ready.'},
            {icon:'⚙',n:'3',title:'Execution starts',body:'Tasks created. Owners assigned. Deadlines set. Messages drafted. Everything downstream moves automatically.'},
            {icon:'📊',n:'4',title:'Outcome tracked',body:'Cervio scores its own accuracy. Over time, it learns your patterns and sharpens its recommendations.'},
          ].map((s,i) => (
            <div key={i} className="magic-step" style={{transitionDelay:`${0.2 + i * 0.1}s`}}>
              <div className="magic-step-n">{s.n}</div>
              <span className="magic-step-icon">{s.icon}</span>
              <div className="magic-step-title">{s.title}</div>
              <div className="magic-step-body">{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* IMPACT */}
      <section className="impact">
        <div className="impact-head reveal">
          <div style={{fontSize:'11px',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(250,250,248,0.25)',marginBottom:'16px'}}>The impact</div>
          <h2 className="impact-h">Momentum becomes visible.</h2>
          <p className="impact-sub">Work doesn't disappear after meetings. Decisions don't stall. Progress moves.</p>
        </div>

        <div className="impact-grid">
          <div className="impact-card wide reveal">
            <div className="impact-card-label">Decision Engine</div>
            <h3 className="impact-card-h">Every decision comes with a recommendation, confidence score, and consequence model.</h3>
            <p className="impact-card-body">Approve, reject, or delay — with full reasoning. Cervio tracks your accuracy over time and identifies where your instincts are costing you money.</p>
            <div style={{marginTop:'24px',padding:'16px',background:'rgba(255,255,255,0.03)',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.05)'}}>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.22)',marginBottom:'10px',letterSpacing:'1px',textTransform:'uppercase'}}>Your Decision Performance</div>
              <div style={{display:'flex',gap:'20px'}}>
                {[{v:'71%',l:'Overall accuracy'},{v:'84%',l:'When following Cervio'},{v:'52%',l:'When overriding'}].map(s => (
                  <div key={s.l}>
                    <div style={{fontSize:'24px',fontWeight:800,color:'rgba(255,255,255,0.85)',lineHeight:1,fontFamily:'var(--serif)'}}>{s.v}</div>
                    <div style={{fontSize:'11px',color:'rgba(255,255,255,0.28)',marginTop:'3px'}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="impact-card reveal" style={{transitionDelay:'0.1s'}}>
            <div className="impact-card-label">Predictive</div>
            <h3 className="impact-card-h">Knows what will break before it does.</h3>
            <p className="impact-card-body">Revenue risk, execution bottlenecks, cold relationships — surfaced while you still have time to act.</p>
          </div>

          <div className="impact-card reveal" style={{transitionDelay:'0.15s'}}>
            <div className="impact-num">3×</div>
            <div className="impact-card-label">Faster decision-making</div>
            <p className="impact-card-body">With context and a recommendation already prepared, decisions that took hours take seconds.</p>
          </div>

          <div className="impact-card reveal" style={{transitionDelay:'0.2s'}}>
            <div className="impact-num">0</div>
            <div className="impact-card-label">Decisions lost after approval</div>
            <p className="impact-card-body">Every approved decision creates tasks, assigns owners, and tracks to completion.</p>
          </div>

          <div className="impact-card reveal" style={{transitionDelay:'0.25s'}}>
            <div className="impact-card-label">Accountability</div>
            <h3 className="impact-card-h">Cervio doesn't let things slide.</h3>
            <p className="impact-card-body">"You've delayed this 3 times. This is blocking execution." It detects avoidance and names it directly.</p>
          </div>
        </div>
      </section>

      {/* FOR */}
      <section className="for-section" id="for">
        <div className="for-in reveal">
          <div style={{fontSize:'11px',fontWeight:600,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(250,250,248,0.25)',marginBottom:'16px'}}>Built for</div>
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
          <h2 className="finale-h">
            Stop managing.<br /><em>Start operating.</em>
          </h2>
          <p className="finale-sub">
            Your business is ready to run properly. Cervio is ready when you are.
          </p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/auth/login" className="cta-main" style={{fontSize:'16px',padding:'16px 36px'}}>
              Start running your business
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
          <div className="finale-note">Free trial · No credit card · Built by Morphotech</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-copy">© 2026 Morphotech Australia Pty Ltd</div>
        <div className="footer-links">
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
    document.querySelectorAll('.reveal, .reveal-slow').forEach(el => io.observe(el))
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
