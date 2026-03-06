import { useState } from "react";

// ─── Simulated Database ───────────────────────────────────────────────────────
const DB = {
  owner: { username: "admin", password: "admin123", name: "Crossfit Admin", upiId: "crossfit@upi" },
  members: [
    {
      id: "m1", username: "john", password: "john123", name: "John Carter",
      age: 28, height: 178, weight: 82, gender: "Male", goal: "Fat Loss",
      activity: "Moderate", medical: "None", plan: "Premium", fees: 2999,
      dueDate: "2026-03-15", status: "Paid", joinDate: "2025-01-10",
      coins: 340, streak: 7, lastActive: "2026-02-27",
      payments: [
        { date: "2026-02-01", amount: 2999, status: "Paid", method: "UPI" },
        { date: "2026-01-01", amount: 2999, status: "Paid", method: "UPI" },
      ],
      workoutLog: { "2026-02-27": ["Chest Day"], "2026-02-26": ["Cardio"], "2026-02-25": ["Legs Day"] },
      badges: ["🔥 7-Day Streak", "💪 First Workout", "⭐ 300 Coins"],
    },
    {
      id: "m2", username: "sara", password: "sara123", name: "Sara Mitchell",
      age: 24, height: 162, weight: 58, gender: "Female", goal: "Muscle Gain",
      activity: "High", medical: "None", plan: "Basic", fees: 1499,
      dueDate: "2026-02-28", status: "Unpaid", joinDate: "2025-06-15",
      coins: 120, streak: 2, lastActive: "2026-02-26",
      payments: [
        { date: "2026-01-01", amount: 1499, status: "Paid", method: "Cash" },
      ],
      workoutLog: { "2026-02-26": ["HIIT"], "2026-02-25": ["Yoga"] },
      badges: ["💪 First Workout"],
    },
    {
      id: "m3", username: "mike", password: "mike123", name: "Mike Johnson",
      age: 32, height: 185, weight: 95, gender: "Male", goal: "Maintenance",
      activity: "Low", medical: "Knee Issue", plan: "Premium", fees: 2999,
      dueDate: "2026-03-20", status: "Paid", joinDate: "2024-11-01",
      coins: 890, streak: 14, lastActive: "2026-02-27",
      payments: [
        { date: "2026-02-01", amount: 2999, status: "Paid", method: "UPI" },
        { date: "2026-01-01", amount: 2999, status: "Paid", method: "UPI" },
        { date: "2025-12-01", amount: 2999, status: "Paid", method: "Card" },
      ],
      workoutLog: {},
      badges: ["🔥 14-Day Streak", "💪 First Workout", "⭐ 800 Coins", "🏆 Top Performer"],
    },
  ],
  monthlyRevenue: [
    { month: "Sep", revenue: 28000 }, { month: "Oct", revenue: 35000 },
    { month: "Nov", revenue: 42000 }, { month: "Dec", revenue: 38000 },
    { month: "Jan", revenue: 51000 }, { month: "Feb", revenue: 47000 },
  ],
  workoutTasks: [
    { id: "t1", name: "Chest Day", icon: "💪", coins: 30, category: "Strength" },
    { id: "t2", name: "Cardio", icon: "🏃", coins: 20, category: "Cardio" },
    { id: "t3", name: "Legs Day", icon: "🦵", coins: 30, category: "Strength" },
    { id: "t4", name: "Back & Biceps", icon: "🏋️", coins: 30, category: "Strength" },
    { id: "t5", name: "Yoga", icon: "🧘", coins: 15, category: "Flexibility" },
    { id: "t6", name: "HIIT", icon: "⚡", coins: 35, category: "Cardio" },
    { id: "t7", name: "Shoulder Day", icon: "🎯", coins: 30, category: "Strength" },
    { id: "t8", name: "Core & Abs", icon: "🔥", coins: 20, category: "Core" },
  ],
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Exo+2:wght@300;400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #0a0a0f;
    --bg2: #111118;
    --bg3: #1a1a24;
    --card: #14141e;
    --card2: #1c1c28;
    --border: #2a2a3a;
    --neon: #00ff88;
    --neon2: #00d4ff;
    --neon3: #ff6b35;
    --gold: #ffd700;
    --purple: #8b5cf6;
    --text: #e8e8f0;
    --text2: #9090a8;
    --text3: #5a5a7a;
    --danger: #ff4444;
    --success: #00ff88;
    --warning: #ffaa00;
    --paid: #00cc66;
    --unpaid: #ff4444;
  }

  body { font-family: 'Exo 2', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; }
  
  h1,h2,h3,h4,h5,h6 { font-family: 'Rajdhani', sans-serif; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--neon); border-radius: 2px; }

  .app-shell {
    max-width: 420px;
    min-height: 100vh;
    margin: 0 auto;
    background: var(--bg);
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 0 60px rgba(0,255,136,0.08);
  }

  /* ── Auth Screen ── */
  .auth-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: radial-gradient(ellipse at top, #0d1a14 0%, var(--bg) 60%);
    position: relative;
    overflow: hidden;
  }
  .auth-screen::before {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%);
    top: -50px; right: -80px;
    animation: pulse 4s ease-in-out infinite;
  }
  .auth-screen::after {
    content: '';
    position: absolute;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%);
    bottom: 100px; left: -40px;
    animation: pulse 5s ease-in-out infinite 1s;
  }
  @keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 1; } }
  @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(0,255,136,0.3); } 50% { box-shadow: 0 0 40px rgba(0,255,136,0.6); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes coinPop { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 80% { transform: scale(1.2) rotate(10deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
  @keyframes barGrow { from { height: 0; } to { height: var(--h); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes streak { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  @keyframes neonFlicker { 0%,100% { opacity: 1; } 92% { opacity: 1; } 93% { opacity: 0.8; } 94% { opacity: 1; } 96% { opacity: 0.9; } 97% { opacity: 1; } }

  .logo-area { text-align: center; margin-bottom: 40px; animation: slideUp 0.6s ease; }
  .logo-icon {
    width: 80px; height: 80px;
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    border-radius: 24px;
    display: flex; align-items: center; justify-content: center;
    font-size: 36px;
    margin: 0 auto 16px;
    animation: glow 3s ease-in-out infinite;
    box-shadow: 0 0 30px rgba(0,255,136,0.4);
  }
  .logo-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 32px; font-weight: 700;
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    letter-spacing: 3px;
  }
  .logo-sub { color: var(--text2); font-size: 13px; letter-spacing: 2px; margin-top: 4px; }

  .role-tabs {
    display: flex; gap: 8px; margin-bottom: 28px;
    background: var(--card); padding: 4px; border-radius: 12px;
    border: 1px solid var(--border);
    animation: slideUp 0.7s ease;
  }
  .role-tab {
    flex: 1; padding: 10px; border: none; border-radius: 9px;
    font-family: 'Exo 2', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.3s;
    background: transparent; color: var(--text2);
    letter-spacing: 0.5px;
  }
  .role-tab.active {
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    color: #000; box-shadow: 0 4px 15px rgba(0,255,136,0.3);
  }

  .auth-form {
    width: 100%; background: var(--card);
    border: 1px solid var(--border); border-radius: 20px;
    padding: 28px; position: relative; z-index: 1;
    animation: slideUp 0.8s ease;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }
  .form-title { font-size: 22px; font-weight: 700; margin-bottom: 24px; color: var(--text); }

  .input-group { margin-bottom: 18px; position: relative; }
  .input-label { font-size: 12px; color: var(--text2); margin-bottom: 8px; display: block; letter-spacing: 0.5px; text-transform: uppercase; }
  .input-field {
    width: 100%; padding: 14px 16px;
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 12px; color: var(--text);
    font-family: 'Exo 2', sans-serif; font-size: 15px;
    transition: all 0.3s; outline: none;
  }
  .input-field:focus {
    border-color: var(--neon);
    box-shadow: 0 0 0 3px rgba(0,255,136,0.1);
  }
  .input-field::placeholder { color: var(--text3); }
  select.input-field { cursor: pointer; }
  select.input-field option { background: var(--bg2); }

  .btn-primary {
    width: 100%; padding: 15px;
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    border: none; border-radius: 12px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 17px; font-weight: 700; letter-spacing: 1.5px;
    color: #000; cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 20px rgba(0,255,136,0.3);
    margin-top: 8px;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,255,136,0.5); }
  .btn-primary:active { transform: translateY(0); }

  .btn-secondary {
    padding: 10px 20px;
    background: var(--card2); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    font-family: 'Exo 2', sans-serif; font-size: 14px;
    cursor: pointer; transition: all 0.3s;
  }
  .btn-secondary:hover { border-color: var(--neon); color: var(--neon); }

  .btn-danger {
    padding: 8px 16px;
    background: rgba(255,68,68,0.15); border: 1px solid rgba(255,68,68,0.3);
    border-radius: 8px; color: var(--danger);
    font-family: 'Exo 2', sans-serif; font-size: 13px;
    cursor: pointer; transition: all 0.3s;
  }
  .btn-danger:hover { background: rgba(255,68,68,0.25); }

  .btn-success {
    padding: 8px 16px;
    background: rgba(0,255,136,0.15); border: 1px solid rgba(0,255,136,0.3);
    border-radius: 8px; color: var(--neon);
    font-family: 'Exo 2', sans-serif; font-size: 13px;
    cursor: pointer; transition: all 0.3s;
  }

  .btn-warning {
    padding: 8px 16px;
    background: rgba(255,170,0,0.15); border: 1px solid rgba(255,170,0,0.3);
    border-radius: 8px; color: var(--warning);
    font-family: 'Exo 2', sans-serif; font-size: 13px;
    cursor: pointer; transition: all 0.3s;
  }

  .error-msg { color: var(--danger); font-size: 13px; margin-top: 12px; text-align: center; }
  .demo-hint { color: var(--text3); font-size: 12px; text-align: center; margin-top: 16px; }

  /* ── App Header ── */
  .app-header {
    padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between;
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(10px);
  }
  .header-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 20px; font-weight: 700;
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    letter-spacing: 1px;
  }
  .header-logo {
    display: flex; align-items: center; gap: 8px;
  }
  .header-logo-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    border-radius: 8px; display: flex; align-items: center;
    justify-content: center; font-size: 16px;
  }
  .header-actions { display: flex; gap: 10px; align-items: center; }
  .icon-btn {
    width: 36px; height: 36px;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; display: flex; align-items: center;
    justify-content: center; cursor: pointer; font-size: 16px;
    transition: all 0.3s;
  }
  .icon-btn:hover { border-color: var(--neon); }

  /* ── Bottom Nav ── */
  .bottom-nav {
    position: sticky; bottom: 0;
    background: var(--bg2);
    border-top: 1px solid var(--border);
    display: flex; padding: 8px 0 12px;
    z-index: 100;
    backdrop-filter: blur(15px);
  }
  .nav-item {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 4px; padding: 6px;
    cursor: pointer; transition: all 0.3s;
    position: relative;
  }
  .nav-icon { font-size: 20px; transition: transform 0.3s; }
  .nav-label { font-size: 10px; color: var(--text3); font-weight: 500; letter-spacing: 0.3px; transition: color 0.3s; }
  .nav-item.active .nav-label { color: var(--neon); }
  .nav-item.active .nav-icon { transform: translateY(-2px); }
  .nav-dot {
    position: absolute; top: 2px; right: 20%;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--neon);
    animation: pulse 2s ease-in-out infinite;
  }

  /* ── Content Area ── */
  .content { flex: 1; overflow-y: auto; padding-bottom: 10px; }

  /* ── Cards ── */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    margin: 0 16px 14px;
    animation: slideUp 0.4s ease;
  }
  .card-glow {
    box-shadow: 0 0 20px rgba(0,255,136,0.08);
  }
  .card-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px; font-weight: 600;
    color: var(--text2); letter-spacing: 1px;
    text-transform: uppercase; margin-bottom: 12px;
    display: flex; align-items: center; gap: 6px;
  }
  .section-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 20px 10px;
  }
  .section-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 18px; font-weight: 700; color: var(--text);
    letter-spacing: 0.5px;
  }
  .see-all { font-size: 13px; color: var(--neon); cursor: pointer; }

  /* ── Stats Grid ── */
  .stats-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px; padding: 0 16px 4px;
  }
  .stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    position: relative; overflow: hidden;
    animation: slideUp 0.4s ease;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 80px; height: 80px;
    border-radius: 0 0 0 80px;
    opacity: 0.06;
  }
  .stat-card.green::before { background: var(--neon); }
  .stat-card.blue::before { background: var(--neon2); }
  .stat-card.orange::before { background: var(--neon3); }
  .stat-card.gold::before { background: var(--gold); }
  .stat-card.purple::before { background: var(--purple); }

  .stat-icon { font-size: 24px; margin-bottom: 10px; }
  .stat-value {
    font-family: 'Rajdhani', sans-serif;
    font-size: 26px; font-weight: 700;
  }
  .stat-card.green .stat-value { color: var(--neon); }
  .stat-card.blue .stat-value { color: var(--neon2); }
  .stat-card.orange .stat-value { color: var(--neon3); }
  .stat-card.gold .stat-value { color: var(--gold); }
  .stat-card.purple .stat-value { color: var(--purple); }
  .stat-label { font-size: 12px; color: var(--text2); margin-top: 4px; }
  .stat-change { font-size: 11px; margin-top: 6px; }
  .up { color: var(--success); }
  .down { color: var(--danger); }

  /* ── Revenue Chart ── */
  .chart-container { padding: 8px 0; }
  .chart-bars {
    display: flex; align-items: flex-end; gap: 8px;
    height: 120px; padding: 0 4px;
  }
  .chart-bar-wrap {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; gap: 6px;
  }
  .chart-bar-outer {
    width: 100%; flex: 1; display: flex;
    align-items: flex-end;
  }
  .chart-bar {
    width: 100%; border-radius: 6px 6px 0 0;
    transition: height 1s ease; cursor: pointer;
    position: relative; overflow: hidden;
    min-height: 4px;
  }
  .chart-bar::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 100%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent);
  }
  .chart-bar.active-bar {
    background: linear-gradient(to top, var(--neon), var(--neon2)) !important;
    box-shadow: 0 -4px 15px rgba(0,255,136,0.5);
  }
  .chart-month { font-size: 10px; color: var(--text3); font-weight: 500; }

  /* ── Member Cards ── */
  .member-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 14px; padding: 14px;
    margin: 0 16px 10px; display: flex;
    align-items: center; gap: 12px;
    cursor: pointer; transition: all 0.3s;
    animation: slideUp 0.4s ease;
  }
  .member-card:hover { border-color: var(--neon); transform: translateY(-1px); }
  .member-avatar {
    width: 48px; height: 48px;
    background: linear-gradient(135deg, var(--bg3), var(--card2));
    border-radius: 14px; display: flex; align-items: center;
    justify-content: center; font-size: 22px;
    border: 2px solid var(--border); flex-shrink: 0;
  }
  .member-info { flex: 1; min-width: 0; }
  .member-name { font-weight: 600; font-size: 15px; color: var(--text); margin-bottom: 3px; }
  .member-plan { font-size: 12px; color: var(--text2); }
  .badge-status {
    padding: 4px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
  }
  .badge-paid { background: rgba(0,255,136,0.15); color: var(--paid); border: 1px solid rgba(0,255,136,0.2); }
  .badge-unpaid { background: rgba(255,68,68,0.15); color: var(--unpaid); border: 1px solid rgba(255,68,68,0.2); }
  .badge-plan-premium { background: rgba(255,215,0,0.15); color: var(--gold); border: 1px solid rgba(255,215,0,0.2); padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; }
  .badge-plan-basic { background: rgba(0,212,255,0.15); color: var(--neon2); border: 1px solid rgba(0,212,255,0.2); padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; }

  /* ── Progress Bar ── */
  .progress-wrap { margin: 8px 0; }
  .progress-label { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .progress-bar-bg {
    height: 6px; background: var(--bg3);
    border-radius: 3px; overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%; border-radius: 3px;
    transition: width 1s ease;
  }
  .progress-neon { background: linear-gradient(90deg, var(--neon), var(--neon2)); }
  .progress-gold { background: linear-gradient(90deg, var(--gold), var(--neon3)); }
  .progress-purple { background: linear-gradient(90deg, var(--purple), var(--neon2)); }

  /* ── Coin Display ── */
  .coin-display {
    display: flex; align-items: center; gap: 6px;
  }
  .coin-icon { font-size: 18px; animation: coinPop 0.6s ease; }
  .coin-value {
    font-family: 'Rajdhani', sans-serif;
    font-size: 22px; font-weight: 700;
    color: var(--gold);
  }
  .coin-small { font-size: 14px; color: var(--gold); font-weight: 600; }

  /* ── Workout Tasks ── */
  .task-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; padding: 0 16px;
  }
  .task-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 14px; padding: 16px;
    cursor: pointer; transition: all 0.3s;
    text-align: center; position: relative;
    overflow: hidden;
  }
  .task-card::before {
    content: '';
    position: absolute; top: -50%; left: -50%;
    width: 200%; height: 200%;
    background: conic-gradient(transparent 270deg, rgba(0,255,136,0.03) 360deg);
    animation: streak 3s linear infinite;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .task-card:hover::before { opacity: 1; }
  .task-card.completed {
    border-color: var(--neon);
    background: rgba(0,255,136,0.05);
  }
  .task-card.completed::after {
    content: '✓';
    position: absolute; top: 8px; right: 8px;
    width: 20px; height: 20px;
    background: var(--neon); border-radius: 50%;
    color: #000; font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .task-card:hover { border-color: var(--neon2); transform: translateY(-2px); }
  .task-icon { font-size: 32px; margin-bottom: 8px; display: block; }
  .task-name { font-weight: 600; font-size: 14px; color: var(--text); margin-bottom: 4px; }
  .task-coins { font-size: 12px; color: var(--gold); }
  .task-category { font-size: 10px; color: var(--text3); margin-top: 4px; }

  /* ── Profile Section ── */
  .profile-hero {
    background: linear-gradient(135deg, var(--card), var(--bg2));
    border: 1px solid var(--border);
    border-radius: 20px; margin: 0 16px 14px;
    padding: 20px; text-align: center;
    position: relative; overflow: hidden;
  }
  .profile-hero::before {
    content: '';
    position: absolute; bottom: -30px; right: -30px;
    width: 120px; height: 120px;
    background: radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%);
  }
  .profile-avatar-lg {
    width: 72px; height: 72px;
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    border-radius: 20px; margin: 0 auto 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; box-shadow: 0 0 20px rgba(0,255,136,0.3);
  }
  .profile-name { font-family: 'Rajdhani', sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .profile-sub { font-size: 13px; color: var(--text2); }

  /* ── AI Plan Section ── */
  .ai-plan-card {
    background: linear-gradient(135deg, #0d1520, #0a1a0d);
    border: 1px solid rgba(0,255,136,0.2);
    border-radius: 16px; padding: 16px;
    margin: 0 16px 14px; position: relative;
    overflow: hidden;
  }
  .ai-plan-card::before {
    content: '';
    position: absolute; top: 0; right: 0;
    width: 100px; height: 100px;
    background: radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%);
  }
  .ai-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.2);
    border-radius: 20px; padding: 4px 12px; margin-bottom: 12px;
    font-size: 11px; color: var(--neon); font-weight: 600; letter-spacing: 0.5px;
  }
  .meal-item {
    background: var(--card); border-radius: 10px; padding: 10px 12px;
    margin-bottom: 8px; display: flex; justify-content: space-between;
    align-items: center;
  }
  .meal-name { font-size: 13px; font-weight: 500; color: var(--text); }
  .meal-cal { font-size: 12px; color: var(--neon); }
  .workout-item {
    background: var(--card); border-radius: 10px; padding: 10px 12px;
    margin-bottom: 8px; display: flex; gap: 10px; align-items: center;
  }
  .workout-day {
    background: rgba(0,255,136,0.1); color: var(--neon);
    border-radius: 6px; padding: 4px 8px; font-size: 11px;
    font-weight: 700; min-width: 32px; text-align: center;
  }
  .workout-desc { font-size: 13px; color: var(--text); }

  /* ── UPI Payment ── */
  .upi-card {
    background: linear-gradient(135deg, #1a0d2e, #0d1a2e);
    border: 1px solid rgba(139,92,246,0.3);
    border-radius: 20px; padding: 20px;
    margin: 0 16px 14px;
  }
  .upi-amount {
    font-family: 'Rajdhani', sans-serif;
    font-size: 36px; font-weight: 700; color: var(--danger);
    text-align: center; margin: 10px 0;
  }
  .upi-apps { display: flex; gap: 10px; justify-content: center; margin: 14px 0; }
  .upi-app-btn {
    flex: 1; padding: 12px 8px;
    border-radius: 12px; border: 1px solid var(--border);
    background: var(--card); cursor: pointer; transition: all 0.3s;
    text-align: center; font-size: 11px; color: var(--text2);
  }
  .upi-app-btn:hover { border-color: var(--purple); color: var(--text); transform: translateY(-2px); }
  .upi-app-icon { font-size: 24px; display: block; margin-bottom: 4px; }

  /* ── Notification Toast ── */
  .toast {
    position: fixed; top: 20px; left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: var(--card2); border: 1px solid var(--neon);
    border-radius: 12px; padding: 12px 20px;
    font-size: 14px; z-index: 9999;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 8px 30px rgba(0,255,136,0.2);
    max-width: 90%; text-align: center;
    display: flex; align-items: center; gap: 8px;
    white-space: nowrap;
  }
  .toast.show { transform: translateX(-50%) translateY(0); }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);
    z-index: 1000; display: flex; align-items: flex-end;
    animation: fadeIn 0.2s ease;
  }
  .modal-sheet {
    width: 100%; max-width: 420px; margin: 0 auto;
    background: var(--bg2); border-radius: 24px 24px 0 0;
    padding: 24px; max-height: 90vh; overflow-y: auto;
    animation: slideUp 0.3s ease;
    border-top: 1px solid var(--border);
  }
  .modal-handle {
    width: 40px; height: 4px;
    background: var(--border); border-radius: 2px;
    margin: 0 auto 20px;
  }
  .modal-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 22px; font-weight: 700;
    margin-bottom: 20px; color: var(--text);
  }

  /* ── Streak Counter ── */
  .streak-display {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,170,0,0.08);
    border: 1px solid rgba(255,170,0,0.2);
    border-radius: 12px; padding: 10px 14px;
  }
  .streak-fire { font-size: 24px; animation: pulse 1.5s ease-in-out infinite; }
  .streak-num {
    font-family: 'Rajdhani', sans-serif;
    font-size: 28px; font-weight: 700; color: var(--warning);
  }
  .streak-label { font-size: 12px; color: var(--text2); }

  /* ── Badges ── */
  .badges-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .badge-item {
    background: var(--card2); border: 1px solid var(--border);
    border-radius: 20px; padding: 5px 12px;
    font-size: 12px; color: var(--text);
    transition: all 0.3s;
  }
  .badge-item:hover { border-color: var(--gold); color: var(--gold); }

  /* ── Payment History ── */
  .payment-item {
    display: flex; justify-content: space-between;
    align-items: center; padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }
  .payment-item:last-child { border-bottom: none; }
  .payment-date { font-size: 13px; color: var(--text2); }
  .payment-amount { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; color: var(--neon); }

  /* ── Loading Spinner ── */
  .spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--neon);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 20px auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── AI Loading ── */
  .ai-loading {
    display: flex; flex-direction: column; align-items: center;
    padding: 30px; gap: 12px;
  }
  .ai-loading-dots {
    display: flex; gap: 6px;
  }
  .ai-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--neon);
    animation: bounce 1.2s ease-in-out infinite;
  }
  .ai-dot:nth-child(2) { animation-delay: 0.2s; }
  .ai-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

  /* ── Misc ── */
  .divider { height: 1px; background: var(--border); margin: 10px 16px; }
  .tag {
    display: inline-block; padding: 2px 8px;
    border-radius: 4px; font-size: 11px; font-weight: 600;
  }
  .tag-green { background: rgba(0,255,136,0.1); color: var(--neon); }
  .tag-blue { background: rgba(0,212,255,0.1); color: var(--neon2); }
  .tag-orange { background: rgba(255,107,53,0.1); color: var(--neon3); }
  .row { display: flex; gap: 10px; align-items: center; }
  .flex-1 { flex: 1; }
  .mt-8 { margin-top: 8px; }
  .mt-12 { margin-top: 12px; }
  .mt-16 { margin-top: 16px; }
  .text-sm { font-size: 13px; }
  .text-xs { font-size: 11px; }
  .text-muted { color: var(--text2); }
  .text-neon { color: var(--neon); }
  .text-danger { color: var(--danger); }
  .text-gold { color: var(--gold); }
  .fw-7 { font-weight: 700; }
  .text-center { text-align: center; }
  .p-0-16 { padding: 0 16px; }
  .pb-10 { padding-bottom: 10px; }
  .shimmer {
    background: linear-gradient(90deg, var(--card) 25%, var(--card2) 50%, var(--card) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px; height: 16px;
  }
  .neon-text {
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .neon-flicker { animation: neonFlicker 4s ease-in-out infinite; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .info-row {
    display: flex; justify-content: space-between;
    padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .info-row:last-child { border-bottom: none; }
  .info-key { font-size: 13px; color: var(--text2); }
  .info-val { font-size: 13px; font-weight: 600; color: var(--text); }

  /* Scrollable tab bar */
  .tab-bar {
    display: flex; gap: 8px; padding: 4px 16px 12px;
    overflow-x: auto; scrollbar-width: none;
  }
  .tab-bar::-webkit-scrollbar { display: none; }
  .tab-pill {
    padding: 8px 16px; border-radius: 20px; white-space: nowrap;
    font-size: 13px; font-weight: 600; cursor: pointer;
    border: 1px solid var(--border); background: var(--card);
    color: var(--text2); transition: all 0.3s; flex-shrink: 0;
  }
  .tab-pill.active {
    background: rgba(0,255,136,0.1);
    border-color: var(--neon); color: var(--neon);
  }
`;

// ─── AI Mock Data Generator ────────────────────────────────────────────────────

// ─── Revenue Chart Component ──────────────────────────────────────────────────
function RevenueChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.revenue));
  const [active, setActive] = useState(data.length - 1);
  return (
    <div className="chart-container">
      <div className="chart-bars">
        {data.map((d, i) => {
          const pct = (d.revenue / maxVal) * 100;
          const colors = ["#00ff88", "#00d4ff", "#ff6b35", "#8b5cf6", "#ffd700", "#00ff88"];
          return (
            <div key={d.month} className="chart-bar-wrap" onClick={() => setActive(i)}>
              <div className="chart-bar-outer" style={{ height: "100%" }}>
                <div
                  className={`chart-bar${i === active ? " active-bar" : ""}`}
                  style={{
                    height: `${pct}%`,
                    background: i !== active ? `linear-gradient(to top, ${colors[i]}55, ${colors[i]}22)` : undefined,
                  }}
                />
              </div>
              <div className="chart-month">{d.month}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 10, fontSize: 14, color: "var(--text2)" }}>
        <span style={{ fontFamily: "Rajdhani", fontSize: 18, fontWeight: 700, color: "var(--neon)" }}>
          ₹{data[active].revenue.toLocaleString()}
        </span>
        <span style={{ marginLeft: 6 }}>{data[active].month} 2025</span>
      </div>
    </div>
  );
}


// ─── AIPlanSection — top-level component (hooks work correctly here) ──────────
function AIPlanSection({ user, members, showToast }) {
  const base = user ? (members.find(m => m.id === user.id) || user) : {};
  const [form, setForm] = useState({
    gender: base.gender || "Male",
    age: base.age || 25,
    height: base.height || 170,
    weight: base.weight || 70,
    activity: base.activity || "Moderate",
    goal: base.goal || "Fat Loss",
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("diet");

  const bmi = (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1);
  const bmiLabel = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const bmiColor = bmi < 18.5 ? "var(--neon2)" : bmi < 25 ? "var(--neon)" : bmi < 30 ? "var(--warning)" : "var(--danger)";

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.age || form.age < 10 || form.age > 100) return "Age must be between 10–100";
    if (!form.height || form.height < 100 || form.height > 250) return "Height must be 100–250 cm";
    if (!form.weight || form.weight < 30 || form.weight > 300) return "Weight must be 30–300 kg";
    return "";
  };

  const generate = () => {
    const e = validate();
    if (e) { setError(e); return; }
    setError(""); setLoading(true); setPlan(null);

    setTimeout(() => {
      const age = Number(form.age), h = Number(form.height), w = Number(form.weight);
      const { goal, activity, gender } = form;

      // BMR Mifflin-St Jeor
      const bmr = gender === "Female"
        ? 10*w + 6.25*h - 5*age - 161
        : 10*w + 6.25*h - 5*age + 5;
      const mult = activity === "Low" ? 1.375 : activity === "High" ? 1.725 : 1.55;
      const tdee = Math.round(bmr * mult);
      const kcal = goal==="Fat Loss" ? tdee-500 : goal==="Muscle Gain" ? tdee+300 : goal==="Endurance" ? tdee+100 : tdee;
      const protG = goal==="Muscle Gain" ? Math.round(w*2.2) : goal==="Fat Loss" ? Math.round(w*2) : Math.round(w*1.6);
      const fatG  = Math.round(kcal*0.25/9);
      const carbG = Math.round((kcal - protG*4 - fatG*9)/4);

      const splits = [0.25,0.10,0.30,0.10,0.20,0.05].map(p=>Math.round(kcal*p));
      const times  = ["Breakfast (7:00 AM)","Mid-Morning Snack (10:00 AM)","Lunch (1:00 PM)","Pre-Workout (4:30 PM)","Dinner (7:30 PM)","Night / Post-Workout (9:30 PM)"];
      const icons  = ["🌅","🍎","☀️","⚡","🌙","🌟"];

      const FOODS = {
        "Fat Loss":    [
          {f:"Egg white omelette (3 whites+1 yolk), sautéed spinach & mushrooms, black coffee", p:"22g"},
          {f:"1 medium apple + 10 raw almonds", p:"4g"},
          {f:"Grilled chicken breast (150g) + steamed brown rice (¾ cup) + cucumber-tomato salad", p:"38g"},
          {f:"Greek yogurt 100g (0% fat) + ½ scoop whey protein", p:"20g"},
          {f:"Baked salmon (120g) + stir-fried broccoli & bell pepper + 1 small roti", p:"32g"},
          {f:"Casein protein shake or warm low-fat turmeric milk", p:"14g"},
        ],
        "Muscle Gain": [
          {f:"6 whole eggs scrambled + 2 slices whole-wheat toast + 1 banana + glass full-fat milk", p:"42g"},
          {f:"Whey shake (1 scoop) + banana + peanut butter (1 tbsp)", p:"28g"},
          {f:"Chicken breast (200g) + white rice (1.5 cups) + dal + mixed vegetable sabzi", p:"52g"},
          {f:"Peanut butter sandwich (2 slices) + 1 glass whole milk + handful mixed nuts", p:"22g"},
          {f:"Paneer bhurji (200g) + 3 rotis + rajma curry + curd (200ml)", p:"44g"},
          {f:"Whey protein (1 scoop) + banana or rice cakes (fast carb)", p:"26g"},
        ],
        "Maintenance": [
          {f:"Poha with peas & peanuts + 2 boiled eggs + green tea", p:"18g"},
          {f:"Mixed fruit bowl (1 cup) + handful walnuts", p:"5g"},
          {f:"Dal rice + chicken curry (100g) + vegetable sabzi + salad", p:"30g"},
          {f:"Roasted chana (30g) + 1 banana or seasonal fruit", p:"9g"},
          {f:"2 rotis + paneer/fish/egg curry + curd + salad", p:"28g"},
          {f:"1 glass warm milk or light protein smoothie", p:"10g"},
        ],
        "Endurance": [
          {f:"Oats porridge (80g) with banana, honey & chia seeds + 2 boiled eggs", p:"20g"},
          {f:"Energy bar or 4–5 dates + 1 glass coconut water", p:"4g"},
          {f:"Brown rice (1 cup) + tuna/chicken (150g) + steamed veggies + olive oil", p:"36g"},
          {f:"Sports drink or banana + peanut butter on rice cakes", p:"8g"},
          {f:"Wholegrain pasta (100g dry) + lean mince sauce + side salad", p:"34g"},
          {f:"Recovery smoothie: milk + banana + oats + whey (½ scoop)", p:"20g"},
        ],
      };

      const WORKOUTS = {
        "Fat Loss": {
          Low:[
            {day:"MON",focus:"Full Body Circuit",   ex:"Bodyweight squats 3×15, Push-ups 3×12, DB rows 3×12, Plank 3×30s",           dur:"40 min",int:"Moderate"},
            {day:"TUE",focus:"Cardio + Core",       ex:"Brisk walk 30 min, Crunches 3×20, Leg raises 3×15",                          dur:"45 min",int:"Low"},
            {day:"WED",focus:"Upper Body",          ex:"DB shoulder press 3×12, Bicep curls 3×12, Tricep dips 3×12",                 dur:"40 min",int:"Moderate"},
            {day:"THU",focus:"Active Recovery",     ex:"20 min gentle yoga + foam rolling + stretching",                              dur:"25 min",int:"Low"},
            {day:"FRI",focus:"Lower Body",          ex:"Goblet squat 3×15, Lunges 3×12, Glute bridge 3×20, Wall sit 3×30s",          dur:"40 min",int:"Moderate"},
            {day:"SAT",focus:"LISS Cardio",         ex:"Outdoor walk / cycling 40 min at comfortable pace",                          dur:"40 min",int:"Low"},
            {day:"SUN",focus:"Rest & Stretch",      ex:"Full body static stretch, light mobility work",                               dur:"20 min",int:"None"},
          ],
          Moderate:[
            {day:"MON",focus:"HIIT + Core",         ex:"Jump squats 4×20, Mountain climbers 4×30s, Burpees 4×10, Russian twists 3×20",dur:"45 min",int:"High"},
            {day:"TUE",focus:"Upper Strength",      ex:"Bench press 4×10, Bent-over rows 4×10, OHP 3×10, Pull-ups 3×8",              dur:"50 min",int:"Moderate"},
            {day:"WED",focus:"Cardio Intervals",    ex:"10 min warm-up + 8×1 min sprint (1 min rest) + 10 min cool-down",            dur:"50 min",int:"High"},
            {day:"THU",focus:"Lower Strength",      ex:"Barbell squat 4×10, RDL 4×10, Leg press 3×12, Calf raises 4×15",            dur:"55 min",int:"Moderate"},
            {day:"FRI",focus:"Full Body Circuit",   ex:"KB swings 4×15, Box jumps 3×10, TRX rows 3×12, Sled push 3×20m",            dur:"50 min",int:"High"},
            {day:"SAT",focus:"Active Cardio",       ex:"Cycling or swimming at easy pace 35–40 min",                                 dur:"40 min",int:"Low"},
            {day:"SUN",focus:"Complete Rest",       ex:"Foam rolling + 10 min light stretch",                                        dur:"—",     int:"None"},
          ],
          High:[
            {day:"MON",focus:"Heavy HIIT + Abs",    ex:"Barbell complex 5×5, Box jumps 4×12, Battle ropes 4×30s, V-ups 4×20",       dur:"60 min",int:"High"},
            {day:"TUE",focus:"Push",                ex:"Incline bench 4×8, Arnold press 4×10, Dips 4×10, Skull crushers 3×12",      dur:"65 min",int:"High"},
            {day:"WED",focus:"Steady Cardio",       ex:"Run 5–8 km at 65–70% max HR",                                               dur:"50 min",int:"Moderate"},
            {day:"THU",focus:"Pull",                ex:"Weighted pull-ups 4×8, Cable rows 4×10, Face pulls 3×15, Hammer curls 3×12",dur:"60 min",int:"High"},
            {day:"FRI",focus:"Legs + HIIT",         ex:"Front squat 4×8, Bulgarian split squat 3×10, RDL 4×8, 5 min HIIT finisher", dur:"70 min",int:"High"},
            {day:"SAT",focus:"Sport / Functional",  ex:"60 min sport activity (basketball, badminton) or long run",                  dur:"60 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",                ex:"Mandatory rest, passive stretching only",                                    dur:"—",     int:"None"},
          ],
        },
        "Muscle Gain":{
          Low:[
            {day:"MON",focus:"Chest + Triceps",     ex:"Bench press 4×8, Incline DB press 3×10, Cable flies 3×12, Tricep pushdown 3×12",dur:"55 min",int:"Moderate"},
            {day:"TUE",focus:"Back + Biceps",       ex:"Lat pulldown 4×10, Seated row 3×10, DB curls 3×12, Hammer curls 3×12",         dur:"50 min",int:"Moderate"},
            {day:"WED",focus:"Rest / Light Cardio", ex:"15 min walk + full body stretch",                                               dur:"20 min",int:"Low"},
            {day:"THU",focus:"Legs",                ex:"Leg press 4×10, Hack squat 3×10, Leg extension 3×12, Calf raises 4×15",        dur:"55 min",int:"Moderate"},
            {day:"FRI",focus:"Shoulders + Core",    ex:"Seated DB press 4×10, Lateral raises 3×15, Shrugs 3×12, Plank 3×45s",         dur:"50 min",int:"Moderate"},
            {day:"SAT",focus:"Full Body Compound",  ex:"Deadlift 4×5, Pull-ups 3×8, Dips 3×10, Farmer's carry 3×20m",                 dur:"60 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",                ex:"Complete rest, sleep 8+ hours",                                                dur:"—",     int:"None"},
          ],
          Moderate:[
            {day:"MON",focus:"Chest + Triceps",     ex:"Flat bench 5×5, Incline DB 4×8, Dips 4×10, Close-grip bench 3×10",            dur:"65 min",int:"High"},
            {day:"TUE",focus:"Back + Biceps",       ex:"Barbell row 5×5, Weighted pull-ups 4×6, DB curls 4×10, Preacher curl 3×12",   dur:"65 min",int:"High"},
            {day:"WED",focus:"Legs (Full)",         ex:"Barbell squat 5×5, RDL 4×8, Leg press 3×10, Leg curl 3×12, Calf raises 5×15", dur:"70 min",int:"High"},
            {day:"THU",focus:"Active Recovery",     ex:"Light swim or walk, foam roll, mobility drills",                               dur:"30 min",int:"Low"},
            {day:"FRI",focus:"Shoulders",           ex:"Standing OHP 5×5, Arnold press 3×10, Lateral raises 4×12, Tricep ext 3×12",   dur:"60 min",int:"High"},
            {day:"SAT",focus:"Arms + Weak Points",  ex:"Barbell 21s 3×, Skull crushers 4×10, Wrist curls 3×15, Cable work",          dur:"55 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",                ex:"Full rest, prioritise sleep & nutrition",                                      dur:"—",     int:"None"},
          ],
          High:[
            {day:"MON",focus:"Chest (Volume)",      ex:"Bench press 6×6, Incline DB 5×8, Cable flies 4×12, Push-ups burnout",         dur:"75 min",int:"High"},
            {day:"TUE",focus:"Back (Volume)",       ex:"Deadlift 5×5, Barbell row 5×6, Pull-ups 5×8, Cable pullovers 3×15",          dur:"75 min",int:"High"},
            {day:"WED",focus:"Legs (Volume)",       ex:"Squats 6×6, Hack squat 4×10, RDL 4×8, Leg press drop-sets, Calves",          dur:"80 min",int:"High"},
            {day:"THU",focus:"Shoulders (Volume)",  ex:"OHP 5×5, Lateral raises 5×15, Rear delt flies 4×15, Face pulls 4×15",        dur:"65 min",int:"High"},
            {day:"FRI",focus:"Arms (Volume)",       ex:"Barbell curls 5×8, Incline DB curls 4×10, Skull crushers 5×8, Dips 4×fail",  dur:"65 min",int:"High"},
            {day:"SAT",focus:"Full Body Power",     ex:"Power cleans 4×4, Push press 4×5, Weighted pull-ups 4×6, Box jumps 3×8",     dur:"70 min",int:"High"},
            {day:"SUN",focus:"Rest",                ex:"Mandatory rest; light walk only if needed",                                   dur:"—",     int:"None"},
          ],
        },
        "Maintenance":{
          Low:[
            {day:"MON",focus:"Full Body A",         ex:"Goblet squat 3×12, DB bench 3×12, DB row 3×12, Shoulder press 3×12",         dur:"45 min",int:"Moderate"},
            {day:"TUE",focus:"Cardio + Flex",       ex:"30 min brisk walk + 15 min yoga flow",                                       dur:"45 min",int:"Low"},
            {day:"WED",focus:"Full Body B",         ex:"Deadlift 3×8, Pull-ups 3×8, Dips 3×10, Plank 3×45s",                        dur:"45 min",int:"Moderate"},
            {day:"THU",focus:"Rest / Mobility",     ex:"Foam roll + dynamic stretching",                                             dur:"20 min",int:"None"},
            {day:"FRI",focus:"Full Body C",         ex:"Lunges 3×12, Push-ups 3×15, Lat pulldown 3×12, Cable row 3×12",              dur:"45 min",int:"Moderate"},
            {day:"SAT",focus:"Active Hobby",        ex:"Cycling, swimming, hiking or sport",                                         dur:"45 min",int:"Low"},
            {day:"SUN",focus:"Rest",                ex:"Rest and recover",                                                           dur:"—",     int:"None"},
          ],
          Moderate:[
            {day:"MON",focus:"Upper Body",          ex:"Bench press 4×10, Pull-ups 4×8, OHP 3×10, Rows 3×10",                       dur:"55 min",int:"Moderate"},
            {day:"TUE",focus:"Lower + Cardio",      ex:"Squats 4×10, RDL 3×10, Leg press 3×12 + 20 min run",                       dur:"60 min",int:"Moderate"},
            {day:"WED",focus:"Cardio",              ex:"30 min run/cycle at 65% HR + 10 min abs",                                   dur:"40 min",int:"Moderate"},
            {day:"THU",focus:"Rest",                ex:"Light walk or complete rest",                                                dur:"—",     int:"None"},
            {day:"FRI",focus:"Full Body",           ex:"Deadlift 4×6, DB press 4×10, Cable rows 3×12, Lunges 3×12",                 dur:"60 min",int:"Moderate"},
            {day:"SAT",focus:"Sport / Fun",         ex:"Choose an outdoor sport or recreational activity",                          dur:"45 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",                ex:"Recovery stretching, hydration focus",                                      dur:"20 min",int:"None"},
          ],
          High:[
            {day:"MON",focus:"Push",                ex:"Bench 4×8, Incline DB 4×10, OHP 4×8, Tricep ext 3×12",                     dur:"60 min",int:"High"},
            {day:"TUE",focus:"Pull",                ex:"Weighted pull-ups 4×8, Barbell row 4×8, Face pulls 3×15, Curls 3×12",      dur:"60 min",int:"High"},
            {day:"WED",focus:"Legs",                ex:"Squat 4×8, RDL 4×8, Leg press 3×10, Calves 4×15",                         dur:"65 min",int:"High"},
            {day:"THU",focus:"HIIT Conditioning",   ex:"10×30s sprints, Jump rope 5 min, Battle ropes 3×30s, Box jumps 3×10",      dur:"45 min",int:"High"},
            {day:"FRI",focus:"Full Body",           ex:"Deadlift 4×5, Dips 3×failure, Pull-ups 3×failure, KB swings 3×20",         dur:"60 min",int:"High"},
            {day:"SAT",focus:"Long Cardio",         ex:"60–75 min steady-state run, cycle or swim",                                 dur:"70 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",                ex:"Complete rest",                                                             dur:"—",     int:"None"},
          ],
        },
        "Endurance":{
          Low:[
            {day:"MON",focus:"Base Cardio",         ex:"40 min easy-pace run (Zone 2, conversational)",                             dur:"40 min",int:"Low"},
            {day:"TUE",focus:"Strength + Mobility", ex:"Bodyweight squat 3×15, Hip hinge 3×12, Shoulder work 3×12, Core 3×15",    dur:"40 min",int:"Moderate"},
            {day:"WED",focus:"Interval Run",        ex:"5 min warm-up + 6×2 min hard + 1 min rest + 5 min cool-down",             dur:"35 min",int:"High"},
            {day:"THU",focus:"Cross-Training",      ex:"Cycling or swimming 35–40 min easy",                                       dur:"40 min",int:"Low"},
            {day:"FRI",focus:"Tempo Run",           ex:"5 min warm-up + 20 min threshold pace + 5 min cool-down",                 dur:"35 min",int:"Moderate"},
            {day:"SAT",focus:"Long Slow Distance",  ex:"60–70 min easy run / brisk walk-run",                                     dur:"65 min",int:"Low"},
            {day:"SUN",focus:"Rest / Stretch",      ex:"Full body stretch, foam rolling",                                         dur:"20 min",int:"None"},
          ],
          Moderate:[
            {day:"MON",focus:"Intervals",           ex:"10 min warm-up + 8×400m repeats (90s rest) + 10 min cool-down",           dur:"55 min",int:"High"},
            {day:"TUE",focus:"Strength",            ex:"Lunges 4×12, Single-leg RDL 3×10, Step-ups 3×12, Core circuit",          dur:"50 min",int:"Moderate"},
            {day:"WED",focus:"Recovery Run",        ex:"30–35 min easy jog (Zone 2)",                                             dur:"35 min",int:"Low"},
            {day:"THU",focus:"Cycle / Swim",        ex:"45 min moderate cycling or 30 min swim",                                  dur:"45 min",int:"Moderate"},
            {day:"FRI",focus:"Threshold Run",       ex:"10 min warm-up + 25 min tempo + 10 min cool-down",                       dur:"55 min",int:"High"},
            {day:"SAT",focus:"Long Run",            ex:"75–90 min easy long run",                                                 dur:"80 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",                ex:"Complete rest, hydration & sleep",                                        dur:"—",     int:"None"},
          ],
          High:[
            {day:"MON",focus:"VO2 Max Intervals",   ex:"10 min warm-up + 5×5 min @95% HR (3 min rest) + 10 min cool-down",       dur:"65 min",int:"High"},
            {day:"TUE",focus:"Strength + Plyo",     ex:"Box jumps 4×10, Single-leg squat 3×8, Bounding 3×20m, Calf raises 5×20", dur:"55 min",int:"High"},
            {day:"WED",focus:"Recovery Jog",        ex:"30 min easy run (Zone 1–2), foam roll after",                             dur:"35 min",int:"Low"},
            {day:"THU",focus:"Bike / Swim",         ex:"60 min moderate bike or 40 min structured swim",                         dur:"60 min",int:"Moderate"},
            {day:"FRI",focus:"Race-Pace Run",       ex:"10 min warm-up + 35 min goal pace + 10 min cool-down",                   dur:"60 min",int:"High"},
            {day:"SAT",focus:"Long Run / Brick",    ex:"100–120 min long run or bike-to-run brick session",                      dur:"110 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",                ex:"Complete rest; sleep & recovery priority",                                dur:"—",     int:"None"},
          ],
        },
      };

      const ak = activity==="Low"?"Low":activity==="High"?"High":"Moderate";
      const workoutPlan = WORKOUTS[goal]?.[ak] || WORKOUTS["Maintenance"]["Moderate"];
      const foods = FOODS[goal] || FOODS["Maintenance"];
      const dietPlan = foods.map((f,i) => ({ meal:times[i], icon:icons[i], food:f.f, calories:splits[i], protein:f.p }));

      const wL = (w*0.035).toFixed(1);
      const TIPS = {
        "Fat Loss":    [`At ${w}kg target ${wL}L water daily — suppresses appetite & boosts metabolism.`, `${kcal} kcal target = ~500 kcal deficit. Weigh yourself weekly, not daily, to see real trends.`, `Aim for ${protG}g protein daily to preserve muscle while losing fat.`, age>35?`After 35 recovery slows — take at least 1 full rest day and sleep 7–8 hrs.`:`Sleep minimum 7 hrs — poor sleep raises cortisol and stalls fat loss.`],
        "Muscle Gain": [`${kcal} kcal surplus supports growth. Aim to gain 0.25–0.5 kg/week on the scale.`, `Hit ${protG}g protein daily spread across 5–6 meals for max muscle protein synthesis.`, `Progressive overload: add small weight or reps every 1–2 weeks to keep growing.`, `Post-workout: consume protein + fast carbs within 30–45 min after training.`],
        "Maintenance": [`At ${kcal} kcal you're at maintenance — adjust ±100 kcal based on weekly weight.`, `Focus on food quality: whole foods, lean proteins & fibre-rich carbs keep you full.`, `Consistency beats perfection — 80% adherence reliably beats sporadic 100% days.`, `Stay active outside the gym: 7,000–10,000 steps/day makes a significant difference.`],
        "Endurance":   [`Carbs are your primary fuel — at ${carbG}g/day, time them around sessions.`, `Drink ${wL}L+ water on training days; add electrolytes on sessions over 60 min.`, `Don't skip strength work — 2 sessions/week prevent injury & improve running economy.`, `Sleep and recovery are performance tools. 8 hrs will measurably improve your times.`],
      };

      const summary = `At ${age} yrs, ${h}cm, ${w}kg (BMI ${bmi} — ${bmiLabel}), your TDEE is ~${tdee} kcal/day (${activity.toLowerCase()} activity). Your personalised ${goal} plan targets ${kcal} kcal with ${protG}g protein, ${carbG}g carbs & ${fatG}g fat daily.`;

      setPlan({ summary, kcal, tdee, macros:{protein:`${protG}g`,carbs:`${carbG}g`,fat:`${fatG}g`}, dietPlan, workoutPlan, tips: TIPS[goal]||TIPS["Maintenance"] });
      setLoading(false);
      showToast("✨ Personalised Plan Generated!");
    }, 1800);
  };

  const iColor = i => i==="High"?"var(--danger)":i==="Moderate"?"var(--warning)":i==="Low"?"var(--neon)":"var(--text3)";

  return (
    <div style={{paddingBottom:28}}>

      {/* Header */}
      <div style={{padding:"16px 16px 12px"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(0,255,136,0.08)",border:"1px solid rgba(0,255,136,0.2)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"var(--neon)",fontWeight:700,letterSpacing:"0.5px",marginBottom:10}}>🤖 AI POWERED</div>
        <div style={{fontFamily:"Rajdhani",fontSize:26,fontWeight:700,marginBottom:4}}>Diet & Workout Planner</div>
        <div style={{fontSize:13,color:"var(--text2)"}}>Enter your details below and generate a custom plan</div>
      </div>

      {/* ── FORM ── */}
      <div style={{margin:"0 16px 16px",background:"linear-gradient(135deg,#0d1520,#0a1a0d)",border:"1px solid rgba(0,255,136,0.18)",borderRadius:20,padding:20}}>

        {/* Section title */}
        <div style={{fontFamily:"Rajdhani",fontSize:17,fontWeight:700,color:"var(--text)",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
          📋 Your Body Details
        </div>

        {/* Gender */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:"var(--text2)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Gender</div>
          <div style={{display:"flex",gap:8}}>
            {[{v:"Male",lbl:"♂ Male"},{v:"Female",lbl:"♀ Female"},{v:"Other",lbl:"⊙ Other"}].map(g=>(
              <button key={g.v} onClick={()=>set("gender",g.v)} style={{
                flex:1,padding:"10px 4px",borderRadius:10,
                border:`1px solid ${form.gender===g.v?"var(--neon)":"var(--border)"}`,
                background:form.gender===g.v?"rgba(0,255,136,0.1)":"var(--bg2)",
                color:form.gender===g.v?"var(--neon)":"var(--text2)",
                fontFamily:"Exo 2,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.2s",
              }}>{g.lbl}</button>
            ))}
          </div>
        </div>

        {/* Age / Height / Weight inputs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
          {[{k:"age",lbl:"Age (yrs)"},{k:"height",lbl:"Height (cm)"},{k:"weight",lbl:"Weight (kg)"}].map(f=>(
            <div key={f.k}>
              <div style={{fontSize:11,color:"var(--text2)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>{f.lbl}</div>
              <input
                type="number"
                value={form[f.k]}
                onChange={e=>set(f.k,e.target.value)}
                style={{
                  width:"100%",padding:"13px 6px",textAlign:"center",
                  background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,
                  color:"var(--text)",fontFamily:"Exo 2,sans-serif",fontSize:18,fontWeight:700,
                  outline:"none",transition:"border-color 0.2s",
                }}
                onFocus={e=>e.target.style.borderColor="var(--neon)"}
                onBlur={e=>e.target.style.borderColor="var(--border)"}
              />
            </div>
          ))}
        </div>

        {/* Live BMI */}
        {Number(form.height)>100 && Number(form.weight)>20 && (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--bg2)",borderRadius:10,padding:"10px 14px",border:`1px solid ${bmiColor}33`,marginBottom:14}}>
            <div>
              <div style={{fontSize:11,color:"var(--text3)"}}>Your BMI</div>
              <div style={{fontFamily:"Rajdhani",fontSize:24,fontWeight:700,color:bmiColor}}>{bmi}</div>
            </div>
            <div style={{background:`${bmiColor}18`,border:`1px solid ${bmiColor}44`,borderRadius:8,padding:"5px 14px",fontSize:13,fontWeight:700,color:bmiColor}}>{bmiLabel}</div>
            <div>
              <div style={{width:70,height:6,background:"var(--border)",borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${Math.min(Math.max(((bmi-10)/30)*100,4),100)}%`,height:"100%",background:`linear-gradient(90deg,var(--neon),${bmiColor})`,borderRadius:3,transition:"width 0.5s"}}/>
              </div>
              <div style={{fontSize:10,color:"var(--text3)",marginTop:3,textAlign:"right"}}>10 – 40+</div>
            </div>
          </div>
        )}

        {/* Activity Level */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:"var(--text2)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>🏃 Activity Level</div>
          <div style={{display:"flex",gap:8}}>
            {[{v:"Low",lbl:"Sedentary",e:"🛋️"},{v:"Moderate",lbl:"Moderate",e:"🚶"},{v:"High",lbl:"Active",e:"🏃"}].map(a=>(
              <button key={a.v} onClick={()=>set("activity",a.v)} style={{
                flex:1,padding:"10px 4px",borderRadius:10,textAlign:"center",
                border:`1px solid ${form.activity===a.v?"var(--neon2)":"var(--border)"}`,
                background:form.activity===a.v?"rgba(0,212,255,0.1)":"var(--bg2)",
                color:form.activity===a.v?"var(--neon2)":"var(--text2)",
                fontFamily:"Exo 2,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s",
              }}>
                <div style={{fontSize:20,marginBottom:3}}>{a.e}</div>
                {a.lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Fitness Goal */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,color:"var(--text2)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>🎯 Fitness Goal</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[{v:"Fat Loss",e:"🔥",d:"Lose weight"},{v:"Muscle Gain",e:"💪",d:"Build muscle"},{v:"Maintenance",e:"⚖️",d:"Stay fit"},{v:"Endurance",e:"🏅",d:"Stamina & cardio"}].map(g=>(
              <button key={g.v} onClick={()=>set("goal",g.v)} style={{
                padding:"12px 10px",borderRadius:12,textAlign:"left",
                border:`1px solid ${form.goal===g.v?"var(--neon3)":"var(--border)"}`,
                background:form.goal===g.v?"rgba(255,107,53,0.12)":"var(--bg2)",
                display:"flex",alignItems:"center",gap:10,cursor:"pointer",transition:"all 0.2s",
              }}>
                <span style={{fontSize:22}}>{g.e}</span>
                <div>
                  <div style={{fontFamily:"Exo 2,sans-serif",fontSize:13,fontWeight:700,color:form.goal===g.v?"var(--neon3)":"var(--text)"}}>{g.v}</div>
                  <div style={{fontSize:11,color:"var(--text3)"}}>{g.d}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <div style={{background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.3)",borderRadius:8,padding:"10px 14px",marginBottom:12,color:"var(--danger)",fontSize:13}}>⚠️ {error}</div>}

        {/* Generate Button */}
        <button
          onClick={generate}
          disabled={loading}
          style={{
            width:"100%",padding:16,
            background:loading?"rgba(0,255,136,0.1)":"linear-gradient(135deg,var(--neon),var(--neon2))",
            border:loading?"1px solid rgba(0,255,136,0.3)":"none",
            borderRadius:14,fontFamily:"Rajdhani,sans-serif",fontSize:18,fontWeight:700,
            letterSpacing:2,color:loading?"var(--neon)":"#000",
            cursor:loading?"not-allowed":"pointer",
            boxShadow:loading?"none":"0 4px 22px rgba(0,255,136,0.35)",
            transition:"all 0.3s",
          }}
        >
          {loading?"⏳ GENERATING YOUR PLAN...":plan?"🔄 REGENERATE PLAN":"✨ GENERATE MY PLAN"}
        </button>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={{textAlign:"center",padding:"28px 20px"}}>
          <div style={{fontSize:44,marginBottom:12,animation:"pulse 1.5s ease-in-out infinite"}}>🤖</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{width:10,height:10,borderRadius:"50%",background:"var(--neon)",animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>
            ))}
          </div>
          <div style={{fontFamily:"Rajdhani",fontSize:20,fontWeight:700,color:"var(--text)"}}>Crafting Your Personalised Plan</div>
          <div style={{fontSize:13,color:"var(--text2)",marginTop:6}}>Analysing BMR · TDEE · Macros · Workouts…</div>
          {["Calculating caloric needs…","Building meal schedule…","Designing workout splits…","Adding personalised tips…"].map((s,i)=>(
            <div key={i} style={{fontSize:12,color:"var(--text3)",marginTop:6,animation:`fadeIn 0.4s ease ${i*0.45}s both`}}>✓ {s}</div>
          ))}
        </div>
      )}

      {/* ── RESULTS ── */}
      {plan && !loading && (
        <div>
          {/* Summary card */}
          <div style={{margin:"0 16px 14px",background:"linear-gradient(135deg,rgba(0,255,136,0.07),rgba(0,212,255,0.04))",border:"1px solid rgba(0,255,136,0.2)",borderRadius:16,padding:16}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(0,255,136,0.08)",border:"1px solid rgba(0,255,136,0.2)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"var(--neon)",fontWeight:700,letterSpacing:"0.5px",marginBottom:10}}>📊 YOUR ANALYSIS</div>
            <div style={{fontSize:13,lineHeight:1.75,color:"var(--text)"}}>{plan.summary}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:14}}>
              {[{l:"Daily Calories",v:`${plan.kcal} kcal`,c:"var(--neon)"},{l:"TDEE",v:`${plan.tdee} kcal`,c:"var(--purple)"},{l:"Protein",v:plan.macros.protein,c:"var(--neon2)"},{l:"Carbs",v:plan.macros.carbs,c:"var(--gold)"},{l:"Fat",v:plan.macros.fat,c:"var(--neon3)"}].map(m=>(
                <div key={m.l} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,padding:"8px 12px",textAlign:"center",flex:"1 1 60px"}}>
                  <div style={{fontFamily:"Rajdhani",fontSize:15,fontWeight:700,color:m.c}}>{m.v}</div>
                  <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab strip */}
          <div style={{display:"flex",gap:8,padding:"0 16px 14px"}}>
            {[{id:"diet",lbl:"🥗 Diet"},{id:"workout",lbl:"💪 Workout"},{id:"tips",lbl:"💡 Tips"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                flex:1,padding:"10px 4px",borderRadius:20,
                border:`1px solid ${tab===t.id?"var(--neon)":"var(--border)"}`,
                background:tab===t.id?"rgba(0,255,136,0.1)":"var(--card)",
                color:tab===t.id?"var(--neon)":"var(--text2)",
                fontFamily:"Exo 2,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s",
              }}>{t.lbl}</button>
            ))}
          </div>

          {/* Diet Plan */}
          {tab==="diet" && (
            <div style={{margin:"0 16px 16px",background:"linear-gradient(135deg,#0d1520,#0a1a0d)",border:"1px solid rgba(0,255,136,0.15)",borderRadius:16,padding:16}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(0,255,136,0.08)",border:"1px solid rgba(0,255,136,0.15)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"var(--neon)",fontWeight:700,letterSpacing:"0.5px",marginBottom:12}}>🥗 DAILY MEAL PLAN — {form.goal.toUpperCase()}</div>
              {plan.dietPlan.map((m,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"12px 14px",marginBottom:10,borderLeft:"3px solid var(--neon)",display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{fontSize:22,width:28,textAlign:"center",flexShrink:0,paddingTop:2}}>{m.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,color:"var(--text3)",marginBottom:3}}>{m.meal}</div>
                    <div style={{fontSize:14,fontWeight:600,color:"var(--text)",marginBottom:6,lineHeight:1.45}}>{m.food}</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,color:"var(--neon)",background:"rgba(0,255,136,0.08)",borderRadius:4,padding:"2px 7px"}}>🔥 {m.calories} kcal</span>
                      <span style={{fontSize:11,color:"var(--neon2)",background:"rgba(0,212,255,0.08)",borderRadius:4,padding:"2px 7px"}}>💪 {m.protein}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{marginTop:6,padding:"10px 14px",borderRadius:10,background:"rgba(0,255,136,0.05)",border:"1px solid rgba(0,255,136,0.1)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:"var(--text2)"}}>Total Daily Calories</span>
                <span style={{fontFamily:"Rajdhani",fontSize:20,fontWeight:700,color:"var(--neon)"}}>{plan.kcal} kcal</span>
              </div>
            </div>
          )}

          {/* Workout Plan */}
          {tab==="workout" && (
            <div style={{margin:"0 16px 16px",background:"linear-gradient(135deg,#0d1520,#0a1a0d)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:16,padding:16}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(0,212,255,0.08)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"var(--neon2)",fontWeight:700,letterSpacing:"0.5px",marginBottom:12}}>💪 WEEKLY WORKOUT SPLIT</div>
              {plan.workoutPlan.map((w,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"12px 14px",marginBottom:10,display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{background:"rgba(0,255,136,0.1)",border:"1px solid rgba(0,255,136,0.2)",borderRadius:8,padding:"6px 8px",minWidth:40,textAlign:"center",fontFamily:"Rajdhani",fontSize:13,fontWeight:700,color:"var(--neon)",flexShrink:0}}>{w.day}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:14,color:"var(--text)",marginBottom:4}}>{w.focus}</div>
                    <div style={{fontSize:12,color:"var(--text2)",marginBottom:6,lineHeight:1.45}}>{w.ex}</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,color:"var(--text3)",background:"var(--bg2)",borderRadius:4,padding:"2px 7px"}}>⏱ {w.dur}</span>
                      <span style={{fontSize:11,borderRadius:4,padding:"2px 7px",color:iColor(w.int),background:`${iColor(w.int)}18`}}>
                        {w.int==="High"?"🔴":w.int==="Moderate"?"🟡":"🟢"} {w.int}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {tab==="tips" && (
            <div style={{margin:"0 16px 16px",background:"linear-gradient(135deg,#0d1520,#0a1a0d)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:16,padding:16}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"var(--gold)",fontWeight:700,letterSpacing:"0.5px",marginBottom:12}}>💡 PERSONALISED TIPS</div>
              {plan.tips.map((tip,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"14px",marginBottom:10,display:"flex",gap:12,alignItems:"flex-start",border:"1px solid rgba(255,215,0,0.06)"}}>
                  <span style={{fontSize:22,flexShrink:0}}>{["💧","📊","💪","😴"][i]||"✅"}</span>
                  <div style={{fontSize:13,lineHeight:1.65,color:"var(--text)"}}>{tip}</div>
                </div>
              ))}
              <div style={{marginTop:8,padding:"14px",borderRadius:12,background:"rgba(255,215,0,0.05)",border:"1px solid rgba(255,215,0,0.15)",textAlign:"center"}}>
                <div style={{fontSize:30,marginBottom:6}}>🏆</div>
                <div style={{fontFamily:"Rajdhani",fontSize:17,fontWeight:700,color:"var(--gold)"}}>Stay consistent for 90 days</div>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>Results come from discipline, not motivation.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!plan && !loading && (
        <div style={{margin:"0 16px",background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:"32px 20px",textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:14}}>🥗</div>
          <div style={{fontFamily:"Rajdhani",fontSize:20,fontWeight:700,marginBottom:8}}>AI-Powered Diet & Workout Planner</div>
          <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.75}}>
            Fill in your details above and tap{" "}
            <span style={{color:"var(--neon)",fontWeight:600}}>Generate My Plan</span>{" "}
            to receive a fully personalised diet + workout schedule.
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:18,flexWrap:"wrap"}}>
            {["🥗 Meal Plan","💪 Workout Split","💡 Expert Tips"].map(f=>(
              <div key={f} style={{fontSize:12,color:"var(--text3)",background:"var(--bg2)",borderRadius:8,padding:"6px 12px"}}>{f}</div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [modal, setModal] = useState(null);
  const [members, setMembers] = useState(DB.members);
  const [selectedMember, setSelectedMember] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [memberCoins, setMemberCoins] = useState(0);
  const [editProfile, setEditProfile] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", username: "", password: "", plan: "Basic", fees: "1499" });
  const [loginRole, setLoginRole] = useState("owner");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const handleLogin = () => {
    setLoginError("");
    if (loginRole === "owner") {
      if (loginForm.username === DB.owner.username && loginForm.password === DB.owner.password) {
        setUser(DB.owner); setRole("owner"); setActiveTab("dashboard");
      } else setLoginError("Invalid credentials");
    } else {
      const m = members.find(m => m.username === loginForm.username && m.password === loginForm.password);
      if (m) { setUser(m); setRole("member"); setMemberCoins(m.coins); setActiveTab("dashboard"); }
      else setLoginError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setUser(null); setRole(null); setLoginForm({ username: "", password: "" });
    setLoginError(""); setActiveTab("dashboard"); setCompletedTasks([]);
  };

  const completeTask = (task) => {
    if (completedTasks.includes(task.id)) return;
    setCompletedTasks(p => [...p, task.id]);
    setMemberCoins(p => p + task.coins);
    showToast(`🪙 +${task.coins} coins! ${task.name} completed!`);
  };

  const updateFeeStatus = (memberId, status) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status } : m));
    showToast(status === "Paid" ? "✅ Fee marked as Paid" : "⚠️ Fee marked as Unpaid");
    setModal(null);
  };

  const addMember = () => {
    if (!newMember.name || !newMember.username || !newMember.password) { showToast("❌ Fill all fields"); return; }
    const m = {
      id: `m${Date.now()}`, ...newMember, age: 25, height: 170, weight: 70,
      gender: "Male", goal: "Maintenance", activity: "Moderate", medical: "None",
      dueDate: "2026-03-31", status: "Unpaid", joinDate: new Date().toISOString().split("T")[0],
      coins: 0, streak: 0, lastActive: new Date().toISOString().split("T")[0],
      payments: [], workoutLog: {}, badges: [],
    };
    setMembers(p => [...p, m]);
    setNewMember({ name: "", username: "", password: "", plan: "Basic", fees: "1499" });
    setModal(null); showToast("✅ Member added!");
  };

  const deleteMember = (id) => { setMembers(p => p.filter(m => m.id !== id)); showToast("🗑️ Member removed"); setModal(null); };

  const totalRevenue = DB.monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const monthlyRev = DB.monthlyRevenue[DB.monthlyRevenue.length - 1].revenue;
  const activeMembers = members.filter(m => m.status === "Paid").length;
  const pendingFees = members.filter(m => m.status === "Unpaid").reduce((s, m) => s + Number(m.fees), 0);

  // ── Auth Screen ──
  const [legalPage, setLegalPage] = useState(null); // 'terms' | 'privacy' | null

  const LegalModal = ({ page, onClose }) => {
    const isTerms = page === "terms";
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(4px)",zIndex:9999,display:"flex",alignItems:"flex-end",animation:"fadeIn 0.2s ease"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
        <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:"var(--bg2)",borderRadius:"24px 24px 0 0",padding:24,maxHeight:"85vh",overflowY:"auto",borderTop:"1px solid var(--border)",animation:"slideUp 0.3s ease"}}>
          <div style={{width:40,height:4,background:"var(--border)",borderRadius:2,margin:"0 auto 20px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{fontSize:28}}>{isTerms?"📋":"🔒"}</div>
            <div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700,color:"var(--text)"}}>{isTerms?"Terms & Conditions":"Privacy Policy"}</div>
          </div>

          {isTerms ? (
            <div style={{fontSize:13,lineHeight:1.8,color:"var(--text2)"}}>
              <div style={{color:"var(--neon)",fontWeight:700,fontSize:12,letterSpacing:1,marginBottom:6}}>LAST UPDATED: MARCH 2026</div>
              {[
                {t:"1. Acceptance of Terms", b:"By accessing or using the Crossfit Gym Management app, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the app."},
                {t:"2. Use of the App", b:"This app is intended for gym members and administrators only. You agree to use it solely for managing your gym membership, workout tracking, and related activities. Any misuse or unauthorized access is strictly prohibited."},
                {t:"3. Account Responsibility", b:"You are responsible for maintaining the confidentiality of your username and password. You must notify us immediately of any unauthorized use of your account. Crossfit is not liable for any loss resulting from unauthorized access."},
                {t:"4. Membership & Payments", b:"Membership fees are due on the date specified in your account. Late payments may result in suspension of access. All payments made through the app are final unless otherwise stated by the gym administration."},
                {t:"5. Health Disclaimer", b:"The workout plans and diet recommendations provided in the app are for general informational purposes only. Always consult a qualified health professional before starting any new exercise or diet program. Crossfit is not responsible for any injury or health issues."},
                {t:"6. Modifications", b:"We reserve the right to update these Terms at any time. Continued use of the app after changes are made constitutes your acceptance of the revised Terms."},
                {t:"7. Termination", b:"We reserve the right to suspend or terminate your account at any time if you violate these Terms or engage in any harmful behaviour."},
                {t:"8. Contact Us", b:"For any questions about these Terms, please contact the gym administration directly."},
              ].map((s,i)=>(
                <div key={i} style={{marginBottom:16}}>
                  <div style={{fontWeight:700,color:"var(--text)",marginBottom:4}}>{s.t}</div>
                  <div>{s.b}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{fontSize:13,lineHeight:1.8,color:"var(--text2)"}}>
              <div style={{color:"var(--neon)",fontWeight:700,fontSize:12,letterSpacing:1,marginBottom:6}}>LAST UPDATED: MARCH 2026</div>
              {[
                {t:"1. Information We Collect", b:"We collect information you provide when registering, including your name, age, height, weight, fitness goals, and payment details. We also collect workout activity and app usage data."},
                {t:"2. How We Use Your Information", b:"Your information is used to manage your membership, generate personalised fitness and diet plans, process payments, and send important notifications about your account."},
                {t:"3. Data Storage", b:"All your data is stored securely within the app. We do not sell, trade, or transfer your personal information to any third parties without your consent, except as required by law."},
                {t:"4. Health Data", b:"Any health-related data you enter (height, weight, medical conditions) is used solely to provide personalised recommendations within the app. This data is treated with the highest level of confidentiality."},
                {t:"5. Payment Information", b:"Payment details processed through the app are handled securely. We do not store full payment credentials. UPI transactions are processed through the respective payment providers."},
                {t:"6. Cookies & Analytics", b:"The app may use basic analytics to improve user experience. No personally identifiable information is shared with analytics providers."},
                {t:"7. Your Rights", b:"You have the right to access, update, or request deletion of your personal data at any time by contacting the gym administration."},
                {t:"8. Contact Us", b:"If you have any questions about this Privacy Policy, please contact the gym administration directly."},
              ].map((s,i)=>(
                <div key={i} style={{marginBottom:16}}>
                  <div style={{fontWeight:700,color:"var(--text)",marginBottom:4}}>{s.t}</div>
                  <div>{s.b}</div>
                </div>
              ))}
            </div>
          )}

          <button onClick={onClose} style={{width:"100%",padding:14,marginTop:8,background:"linear-gradient(135deg,var(--neon),var(--neon2))",border:"none",borderRadius:12,fontFamily:"Rajdhani,sans-serif",fontSize:16,fontWeight:700,color:"#000",cursor:"pointer",letterSpacing:1}}>I UNDERSTAND</button>
        </div>
      </div>
    );
  };

  if (!user) return (
    <div className="auth-screen">
      <style>{css}</style>
      {legalPage && <LegalModal page={legalPage} onClose={()=>setLegalPage(null)}/>}
      <div className="logo-area">
        <div className="logo-icon">🏋️</div>
        <div className="logo-title neon-flicker">CROSSFIT</div>
        <div className="logo-sub">PRO GYM MANAGEMENT</div>
      </div>
      <div className="role-tabs">
        <button className={`role-tab${loginRole==="owner"?" active":""}`} onClick={()=>setLoginRole("owner")}>👑 Owner</button>
        <button className={`role-tab${loginRole==="member"?" active":""}`} onClick={()=>setLoginRole("member")}>👤 Member</button>
      </div>
      <div className="auth-form">
        <div className="form-title">{loginRole==="owner"?"Admin Login":"Member Login"}</div>
        <div className="input-group">
          <label className="input-label">Username</label>
          <input className="input-field" placeholder={loginRole==="owner"?"admin":"john / sara / mike"}
            value={loginForm.username} onChange={e=>setLoginForm(p=>({...p,username:e.target.value}))} />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input-field" type="password" placeholder="••••••••"
            value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
        </div>
        {loginError && <div className="error-msg">⚠️ {loginError}</div>}
        <button className="btn-primary" onClick={handleLogin}>LOGIN →</button>
        <div style={{textAlign:"center",marginTop:16,fontSize:12,color:"var(--text3)"}}>
          By logging in you agree to our{" "}
          <span onClick={()=>setLegalPage("terms")} style={{color:"var(--neon)",cursor:"pointer",textDecoration:"underline"}}>Terms & Conditions</span>
          {" "}and{" "}
          <span onClick={()=>setLegalPage("privacy")} style={{color:"var(--neon)",cursor:"pointer",textDecoration:"underline"}}>Privacy Policy</span>
        </div>
      </div>
    </div>
  );

  // ── Owner Dashboard ──
  const OwnerDashboard = () => (
    <div>
      <div style={{padding:"16px 16px 8px"}}>
        <div style={{fontSize:13,color:"var(--text2)"}}>Welcome back,</div>
        <div style={{fontFamily:"Rajdhani",fontSize:24,fontWeight:700}}>{DB.owner.name} 👑</div>
      </div>
      <div className="stats-grid">
        <div className="stat-card green"><div className="stat-icon">👥</div><div className="stat-value">{members.length}</div><div className="stat-label">Total Members</div><div className="stat-change up">+2 this month</div></div>
        <div className="stat-card blue"><div className="stat-icon">✅</div><div className="stat-value">{activeMembers}</div><div className="stat-label">Active Members</div><div className="stat-change" style={{color:"var(--text2)"}}>{members.length-activeMembers} pending</div></div>
        <div className="stat-card orange"><div className="stat-icon">⚠️</div><div className="stat-value">₹{(pendingFees/1000).toFixed(1)}k</div><div className="stat-label">Pending Fees</div><div className="stat-change down">{members.filter(m=>m.status==="Unpaid").length} members</div></div>
        <div className="stat-card gold"><div className="stat-icon">💰</div><div className="stat-value">₹{(monthlyRev/1000).toFixed(0)}k</div><div className="stat-label">This Month</div><div className="stat-change up">+8.2% ↑</div></div>
      </div>
      <div style={{margin:"14px 16px 0"}}>
        <div className="stat-card purple" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div className="stat-icon">📊</div><div className="stat-value">₹{(totalRevenue/1000).toFixed(0)}k</div><div className="stat-label">Total Revenue (6 months)</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:12,color:"var(--text2)",marginBottom:4}}>Growth</div><div style={{fontFamily:"Rajdhani",fontSize:24,fontWeight:700,color:"var(--purple)"}}>+24%</div></div>
        </div>
      </div>
      <div className="section-header" style={{marginTop:8}}><div className="section-title">Revenue Chart</div><div className="tag tag-green">6M</div></div>
      <div className="card"><RevenueChart data={DB.monthlyRevenue}/></div>
      <div className="section-header"><div className="section-title">Members</div><div className="see-all" onClick={()=>setActiveTab("members")}>View All →</div></div>
      {members.slice(0,3).map(m=>(
        <div key={m.id} className="member-card" onClick={()=>{setSelectedMember(m);setModal("memberDetail");}}>
          <div className="member-avatar">{m.gender==="Female"?"👩":"👨"}</div>
          <div className="member-info">
            <div className="member-name">{m.name}</div>
            <div className="row mt-8" style={{gap:6}}><span className={`badge-plan-${m.plan.toLowerCase()}`}>{m.plan}</span><span style={{fontSize:12,color:"var(--text3)"}}>₹{m.fees}/mo</span></div>
          </div>
          <span className={`badge-status badge-${m.status.toLowerCase()}`}>{m.status}</span>
        </div>
      ))}
      <div style={{padding:"0 16px 10px"}}><button className="btn-primary" onClick={()=>setModal("addMember")}>+ Add New Member</button></div>
    </div>
  );

  const OwnerMembers = () => (
    <div>
      <div className="tab-bar">{["All","Active","Unpaid","Premium"].map(f=><button key={f} className={`tab-pill${f==="All"?" active":""}`}>{f}</button>)}</div>
      {members.map(m=>(
        <div key={m.id} className="member-card" onClick={()=>{setSelectedMember(m);setModal("memberDetail");}}>
          <div className="member-avatar">{m.gender==="Female"?"👩":"👨"}</div>
          <div className="member-info">
            <div className="member-name">{m.name}</div>
            <div className="text-sm text-muted mt-8">@{m.username} · Joined {m.joinDate}</div>
            <div className="row mt-8" style={{gap:6}}><span className={`badge-plan-${m.plan.toLowerCase()}`}>{m.plan}</span><span className="coin-small">🪙 {m.coins}</span><span style={{fontSize:11,color:"var(--warning)"}}>🔥{m.streak}d</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
            <span className={`badge-status badge-${m.status.toLowerCase()}`}>{m.status}</span>
            <span style={{fontSize:11,color:"var(--text3)"}}>Due {m.dueDate}</span>
          </div>
        </div>
      ))}
      <div style={{padding:"0 16px 16px"}}><button className="btn-primary" onClick={()=>setModal("addMember")}>+ Add New Member</button></div>
    </div>
  );

  const OwnerAnalytics = () => (
    <div>
      <div className="section-header"><div className="section-title">Analytics</div></div>
      <div className="card card-glow"><div className="card-title">📈 Revenue Trend</div><RevenueChart data={DB.monthlyRevenue}/></div>
      <div className="stats-grid">
        <div className="stat-card green"><div className="stat-icon">🧘</div><div className="stat-value">78%</div><div className="stat-label">Retention Rate</div></div>
        <div className="stat-card blue"><div className="stat-icon">🤖</div><div className="stat-value">{members.length}</div><div className="stat-label">AI Plan Users</div></div>
        <div className="stat-card orange"><div className="stat-icon">🏃</div><div className="stat-value">142</div><div className="stat-label">Workouts/Week</div></div>
        <div className="stat-card gold"><div className="stat-icon">🪙</div><div className="stat-value">{members.reduce((s,m)=>s+m.coins,0)}</div><div className="stat-label">Total Coins</div></div>
      </div>
      <div className="section-header"><div className="section-title">Member Progress</div></div>
      {members.map(m=>(
        <div key={m.id} className="card" style={{marginBottom:10}}>
          <div className="row"><div className="member-avatar" style={{width:36,height:36,fontSize:16}}>{m.gender==="Female"?"👩":"👨"}</div><div className="flex-1"><div className="fw-7" style={{fontSize:14}}>{m.name}</div><div className="text-xs text-muted">{m.goal}</div></div><div className="streak-display" style={{padding:"5px 10px"}}><span>🔥</span><span style={{fontFamily:"Rajdhani",fontSize:18,fontWeight:700,color:"var(--warning)"}}>{m.streak}</span></div></div>
          <div className="progress-wrap mt-12"><div className="progress-label"><span className="text-xs text-muted">Coins: {m.coins}</span><span className="text-xs text-gold">Goal: 1000</span></div><div className="progress-bar-bg"><div className="progress-bar-fill progress-gold" style={{width:`${Math.min((m.coins/1000)*100,100)}%`}}/></div></div>
        </div>
      ))}
    </div>
  );

  const MemberDashboard = () => {
    const cu = members.find(m=>m.id===user.id)||user;
    return (
      <div>
        <div className="profile-hero">
          <div className="profile-avatar-lg">{cu.gender==="Female"?"👩":"👨"}</div>
          <div className="profile-name">{cu.name}</div>
          <div className="profile-sub">{cu.plan} Plan · Joined {cu.joinDate}</div>
          <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:14}}>
            <div className="coin-display"><span className="coin-icon">🪙</span><span className="coin-value">{memberCoins}</span><span style={{fontSize:13,color:"var(--text2)",marginLeft:2}}>coins</span></div>
            <div style={{width:1,background:"var(--border)"}}/>
            <div className="streak-display" style={{background:"transparent",border:"none",padding:0}}><span className="streak-fire">🔥</span><span className="streak-num">{cu.streak}</span><span className="streak-label">day streak</span></div>
          </div>
        </div>
        <div style={{padding:"0 16px 12px"}}><div className="progress-wrap"><div className="progress-label"><span className="text-sm text-muted">Coin Progress</span><span className="text-sm text-gold">{memberCoins}/1000</span></div><div className="progress-bar-bg"><div className="progress-bar-fill progress-gold" style={{width:`${Math.min((memberCoins/1000)*100,100)}%`}}/></div></div></div>
        <div className="stats-grid">
          <div className="stat-card orange"><div className="stat-icon">💳</div><div className="stat-value" style={{fontSize:18}}>{cu.status==="Unpaid"?"OVERDUE":"ACTIVE"}</div><div className="stat-label">Fee Status</div><div className={`stat-change ${cu.status==="Paid"?"up":"down"}`}>{cu.status==="Paid"?"✓ Paid":"⚠ Unpaid"}</div></div>
          <div className="stat-card blue"><div className="stat-icon">📅</div><div className="stat-value" style={{fontSize:16}}>{cu.dueDate}</div><div className="stat-label">Due Date</div></div>
        </div>
        {cu.status==="Unpaid"&&(
          <div className="upi-card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div><div className="ai-badge">⚠️ PAYMENT DUE</div><div className="upi-amount">₹{cu.fees}</div><div className="text-sm text-muted">UPI: {DB.owner.upiId}</div></div>
              <div style={{fontSize:36}}>💳</div>
            </div>
            <div style={{fontSize:12,color:"var(--text2)",margin:"8px 0",textAlign:"center"}}>Pay via UPI App</div>
            <div className="upi-apps">
              {[{name:"GPay",icon:"🟢"},{name:"PhonePe",icon:"🟣"},{name:"Paytm",icon:"🔵"},{name:"BHIM",icon:"🟡"}].map(app=>(
                <button key={app.name} className="upi-app-btn" onClick={()=>showToast(`Opening ${app.name}... UPI: ${DB.owner.upiId}`)}><span className="upi-app-icon">{app.icon}</span>{app.name}</button>
              ))}
            </div>
            <button className="btn-primary" style={{marginTop:8}} onClick={()=>{showToast("🔗 Opening UPI Intent...");window.open(`upi://pay?pa=${DB.owner.upiId}&pn=Crossfit&am=${cu.fees}&tn=Gym+Membership`,"_blank");}}>PAY NOW ₹{cu.fees}</button>
          </div>
        )}
        <div className="section-header"><div className="section-title">Payment History</div></div>
        <div className="card">
          {cu.payments.map((p,i)=>(
            <div key={i} className="payment-item"><div><div style={{fontSize:14,fontWeight:500}}>{p.method}</div><div className="payment-date">{p.date}</div></div><div><div className="payment-amount">₹{p.amount}</div><div className={`text-xs ${p.status==="Paid"?"text-neon":"text-danger"}`}>{p.status}</div></div></div>
          ))}
          {cu.payments.length===0&&<div className="text-center text-muted" style={{padding:16}}>No payments yet</div>}
        </div>
        <div className="section-header"><div className="section-title">Badges</div></div>
        <div className="card"><div className="badges-wrap">{cu.badges.map((b,i)=><span key={i} className="badge-item">{b}</span>)}{memberCoins>=100&&<span className="badge-item" style={{borderColor:"var(--gold)",color:"var(--gold)"}}>⭐ {memberCoins}+ Coins</span>}</div></div>
      </div>
    );
  };

  const MemberWorkout = () => (
    <div>
      <div style={{padding:"16px 16px 4px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700}}>Today's Tasks</div><div style={{fontSize:13,color:"var(--text2)",marginTop:2}}>Complete to earn coins 🪙</div></div>
          <div className="streak-display"><span className="streak-fire">🔥</span><span className="streak-num">{user.streak}</span></div>
        </div>
        <div className="progress-wrap mt-12"><div className="progress-label"><span className="text-sm text-muted">Daily Progress</span><span className="text-sm text-neon">{completedTasks.length}/{DB.workoutTasks.length}</span></div><div className="progress-bar-bg"><div className="progress-bar-fill progress-neon" style={{width:`${(completedTasks.length/DB.workoutTasks.length)*100}%`}}/></div></div>
      </div>
      <div className="tab-bar">{["All","Strength","Cardio","Core","Flexibility"].map(c=><button key={c} className={`tab-pill${c==="All"?" active":""}`}>{c}</button>)}</div>
      <div className="task-grid">
        {DB.workoutTasks.map(t=>(
          <div key={t.id} className={`task-card${completedTasks.includes(t.id)?" completed":""}`} onClick={()=>completeTask(t)}>
            <span className="task-icon">{t.icon}</span>
            <div className="task-name">{t.name}</div>
            <div className="task-coins">🪙 +{t.coins}</div>
            <div className="task-category">{t.category}</div>
          </div>
        ))}
      </div>
      {completedTasks.length>0&&(
        <div className="card" style={{marginTop:4,background:"rgba(0,255,136,0.05)",borderColor:"rgba(0,255,136,0.2)"}}>
          <div className="text-center">
            <div style={{fontSize:28,marginBottom:8}}>🎉</div>
            <div style={{fontFamily:"Rajdhani",fontSize:20,fontWeight:700}}>Today: {completedTasks.length} tasks done</div>
            <div className="coin-display" style={{justifyContent:"center",marginTop:8}}><span className="coin-icon">🪙</span><span className="coin-value" style={{fontSize:26}}>{memberCoins}</span><span style={{fontSize:13,color:"var(--text2)"}}>total coins</span></div>
          </div>
        </div>
      )}
    </div>
  );

  const MemberProfile = () => {
    const cu = members.find(m=>m.id===user.id)||user;
    const [ld, setLd] = useState({...cu});
    return (
      <div>
        <div style={{padding:"16px 16px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700}}>My Profile</div>
          <button className="btn-secondary" onClick={()=>setEditProfile(p=>!p)}>{editProfile?"Cancel":"✏️ Edit"}</button>
        </div>
        <div className="profile-hero" style={{textAlign:"left"}}>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <div className="profile-avatar-lg">{cu.gender==="Female"?"👩":"👨"}</div>
            <div><div className="profile-name">{cu.name}</div><div className="profile-sub">{cu.plan} Plan</div><div className="row mt-8"><span className="tag tag-green">{cu.goal}</span><span className="text-xs text-muted">{cu.activity} Activity</span></div></div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">📋 Body Stats</div>
          {editProfile?(
            <div className="two-col">
              {[{key:"age",label:"Age",type:"number"},{key:"height",label:"Height (cm)",type:"number"},{key:"weight",label:"Weight (kg)",type:"number"}].map(f=>(
                <div key={f.key} className="input-group" style={{margin:0}}><label className="input-label">{f.label}</label><input className="input-field" type={f.type} value={ld[f.key]} onChange={e=>setLd(p=>({...p,[f.key]:e.target.value}))}/></div>
              ))}
              <div className="input-group" style={{margin:0}}><label className="input-label">Gender</label><select className="input-field" value={ld.gender} onChange={e=>setLd(p=>({...p,gender:e.target.value}))}><option>Male</option><option>Female</option><option>Other</option></select></div>
              <div className="input-group" style={{margin:"8px 0 0",gridColumn:"span 2"}}><label className="input-label">Fitness Goal</label><select className="input-field" value={ld.goal} onChange={e=>setLd(p=>({...p,goal:e.target.value}))}><option>Fat Loss</option><option>Muscle Gain</option><option>Maintenance</option><option>Endurance</option></select></div>
              <div className="input-group" style={{margin:"8px 0 0",gridColumn:"span 2"}}><label className="input-label">Activity Level</label><select className="input-field" value={ld.activity} onChange={e=>setLd(p=>({...p,activity:e.target.value}))}><option>Low</option><option>Moderate</option><option>High</option></select></div>
              <div className="input-group" style={{margin:"8px 0 0",gridColumn:"span 2"}}><label className="input-label">Medical Conditions</label><input className="input-field" value={ld.medical} onChange={e=>setLd(p=>({...p,medical:e.target.value}))}/></div>
              <div style={{gridColumn:"span 2"}}><button className="btn-primary" onClick={()=>{setMembers(prev=>prev.map(m=>m.id===user.id?{...m,...ld}:m));setEditProfile(false);showToast("✅ Profile updated!");}}>Save Changes</button></div>
            </div>
          ):(
            <div>
              {[{k:"Age",v:`${cu.age} yrs`},{k:"Height",v:`${cu.height} cm`},{k:"Weight",v:`${cu.weight} kg`},{k:"BMI",v:(cu.weight/((cu.height/100)**2)).toFixed(1)},{k:"Gender",v:cu.gender},{k:"Goal",v:cu.goal},{k:"Activity",v:cu.activity},{k:"Medical",v:cu.medical||"None"}].map(item=>(
                <div key={item.k} className="info-row"><span className="info-key">{item.k}</span><span className="info-val">{item.v}</span></div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SettingsSection = () => (
    <div>
      <div style={{padding:"16px 16px 8px"}}><div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700}}>Settings</div></div>
      <div className="card">
        {role==="owner"&&<div className="info-row"><span className="info-key">UPI ID</span><span className="info-val text-neon">{DB.owner.upiId}</span></div>}
        <div className="info-row"><span className="info-key">Account</span><span className="info-val">{user.name}</span></div>
        <div className="info-row"><span className="info-key">Role</span><span className="info-val">{role==="owner"?"👑 Owner":"👤 Member"}</span></div>
        <div className="info-row"><span className="info-key">Theme</span><span className="info-val">🌑 Dark</span></div>
      </div>
      <div className="card">
        <div className="card-title">🔔 Notifications</div>
        {["Payment Reminders","Workout Alerts","Streak Notifications","AI Plan Updates"].map(n=>(
          <div key={n} className="info-row"><span className="info-key">{n}</span><div style={{width:36,height:20,background:"var(--neon)",borderRadius:10,position:"relative",cursor:"pointer"}}><div style={{position:"absolute",right:2,top:2,width:16,height:16,background:"#000",borderRadius:"50%"}}/></div></div>
        ))}
      </div>
      <div style={{padding:"0 16px"}}><button className="btn-danger" style={{width:"100%",padding:"14px",fontSize:15}} onClick={handleLogout}>🚪 Logout</button></div>
    </div>
  );

  // ── Modals ──
  const renderModal = () => {
    if (!modal) return null;
    if (modal==="memberDetail"&&selectedMember) {
      const m = selectedMember;
      return (
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}>
          <div className="modal-sheet">
            <div className="modal-handle"/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div className="member-avatar" style={{width:56,height:56,fontSize:28}}>{m.gender==="Female"?"👩":"👨"}</div>
                <div><div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700}}>{m.name}</div><div className="text-sm text-muted">@{m.username}</div></div>
              </div>
              <span className={`badge-status badge-${m.status.toLowerCase()}`}>{m.status}</span>
            </div>
            <div className="card" style={{margin:"0 0 14px"}}>
              {[{k:"Plan",v:m.plan},{k:"Monthly Fee",v:`₹${m.fees}`},{k:"Due Date",v:m.dueDate},{k:"Joined",v:m.joinDate},{k:"Coins",v:`🪙 ${m.coins}`},{k:"Streak",v:`🔥 ${m.streak} days`},{k:"Goal",v:m.goal},{k:"Medical",v:m.medical||"None"}].map(item=>(
                <div key={item.k} className="info-row"><span className="info-key">{item.k}</span><span className="info-val">{item.v}</span></div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
              <button className="btn-success" onClick={()=>updateFeeStatus(m.id,"Paid")}>✅ Mark Paid</button>
              <button className="btn-warning" onClick={()=>updateFeeStatus(m.id,"Unpaid")}>⚠️ Mark Unpaid</button>
              <button className="btn-danger" onClick={()=>deleteMember(m.id)}>🗑️ Delete</button>
            </div>
            <button className="btn-secondary" style={{width:"100%"}} onClick={()=>{showToast(`📲 Reminder sent to ${m.name}!`);setModal(null);}}>📲 Send Payment Reminder</button>
          </div>
        </div>
      );
    }
    if (modal==="addMember") return (
      <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null);}}>
        <div className="modal-sheet">
          <div className="modal-handle"/>
          <div className="modal-title">Add New Member</div>
          {["name","username","password"].map(f=>(
            <div key={f} className="input-group"><label className="input-label">{f.charAt(0).toUpperCase()+f.slice(1)}</label><input className="input-field" placeholder={`Enter ${f}`} type={f==="password"?"password":"text"} value={newMember[f]} onChange={e=>setNewMember(p=>({...p,[f]:e.target.value}))}/></div>
          ))}
          <div className="two-col">
            <div className="input-group" style={{margin:0}}><label className="input-label">Plan</label><select className="input-field" value={newMember.plan} onChange={e=>setNewMember(p=>({...p,plan:e.target.value}))}><option>Basic</option><option>Premium</option></select></div>
            <div className="input-group" style={{margin:0}}><label className="input-label">Monthly Fee</label><input className="input-field" value={newMember.fees} onChange={e=>setNewMember(p=>({...p,fees:e.target.value}))}/></div>
          </div>
          <button className="btn-primary" style={{marginTop:16}} onClick={addMember}>Add Member</button>
        </div>
      </div>
    );
    return null;
  };

  const ownerTabs = [{id:"dashboard",icon:"🏠",label:"Home"},{id:"members",icon:"👥",label:"Members"},{id:"analytics",icon:"📊",label:"Analytics"},{id:"aiplan",icon:"🤖",label:"AI Plans"},{id:"settings",icon:"⚙️",label:"Settings"}];
  const memberTabs = [{id:"dashboard",icon:"🏠",label:"Home"},{id:"workout",icon:"💪",label:"Workout"},{id:"aiplan",icon:"🤖",label:"AI Plan"},{id:"profile",icon:"👤",label:"Profile"},{id:"settings",icon:"⚙️",label:"Settings"}];
  const tabs = role==="owner"?ownerTabs:memberTabs;

  const renderContent = () => {
    if (role==="owner") {
      if (activeTab==="dashboard") return <OwnerDashboard/>;
      if (activeTab==="members") return <OwnerMembers/>;
      if (activeTab==="analytics") return <OwnerAnalytics/>;
      if (activeTab==="aiplan") return <AIPlanSection user={user} members={members} showToast={showToast}/>;
      if (activeTab==="settings") return <SettingsSection/>;
    } else {
      if (activeTab==="dashboard") return <MemberDashboard/>;
      if (activeTab==="workout") return <MemberWorkout/>;
      if (activeTab==="aiplan") return <AIPlanSection user={user} members={members} showToast={showToast}/>;
      if (activeTab==="profile") return <MemberProfile/>;
      if (activeTab==="settings") return <SettingsSection/>;
    }
    return null;
  };

  const pageTitles = {dashboard:"CROSSFIT",members:"Members",analytics:"Analytics",aiplan:"AI Planner",settings:"Settings",workout:"Workouts",profile:"Profile"};

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{css}</style>
      <div className="app-shell">
        <div className="app-header">
          <div className="header-logo">
            <div className="header-logo-icon">🏋️</div>
            <div className="header-title">{pageTitles[activeTab]||"CROSSFIT"}</div>
          </div>
          <div className="header-actions">
            <div className="icon-btn" onClick={()=>showToast("🔔 No new notifications")}>🔔</div>
            {role==="member"&&<div className="icon-btn" style={{color:"var(--gold)",fontSize:13,width:"auto",padding:"0 10px",gap:4,display:"flex",alignItems:"center"}}>🪙 {memberCoins}</div>}
          </div>
        </div>
        <div className="content">{renderContent()}</div>
        <div className="bottom-nav">
          {tabs.map(t=>(
            <div key={t.id} className={`nav-item${activeTab===t.id?" active":""}`} onClick={()=>setActiveTab(t.id)}>
              <div className="nav-icon">{t.icon}</div>
              <div className="nav-label">{t.label}</div>
              {t.id==="dashboard"&&role==="member"&&members.find(m=>m.id===user.id)?.status==="Unpaid"&&<div className="nav-dot"/>}
            </div>
          ))}
        </div>
        {renderModal()}
        <div className={`toast${toast.show?" show":""}`}>{toast.msg}</div>
      </div>
    </div>
  );
}
