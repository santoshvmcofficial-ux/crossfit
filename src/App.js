import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

// ─── Firebase Setup ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyA34A_BmpA-2NWgN3v9zjF-CVpvm8m2Bwk",
  authDomain: "crossfit-fb915.firebaseapp.com",
  projectId: "crossfit-fb915",
  storageBucket: "crossfit-fb915.firebasestorage.app",
  messagingSenderId: "468096043702",
  appId: "1:468096043702:web:90ee190f14196742a37417"
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ─── Static Config (never changes) ───────────────────────────────────────────
const OWNER = { username: "admin", password: "admin123", name: "Crossfit Admin", upiId: "crossfit@upi" };
// ⬆️ Change "crossfit@upi" to your real UPI ID (e.g. "yourname@okaxis" or "9876543210@ybl")

const MONTHLY_REVENUE = [
  { month: "Sep", revenue: 28000 }, { month: "Oct", revenue: 35000 },
  { month: "Nov", revenue: 42000 }, { month: "Dec", revenue: 38000 },
  { month: "Jan", revenue: 51000 }, { month: "Feb", revenue: 47000 },
];

const WORKOUT_TASKS = [
  { id: "t1", name: "Chest Day", icon: "💪", coins: 30, category: "Strength" },
  { id: "t2", name: "Cardio", icon: "🏃", coins: 20, category: "Cardio" },
  { id: "t3", name: "Legs Day", icon: "🦵", coins: 30, category: "Strength" },
  { id: "t4", name: "Back & Biceps", icon: "🏋️", coins: 30, category: "Strength" },
  { id: "t5", name: "Yoga", icon: "🧘", coins: 15, category: "Flexibility" },
  { id: "t6", name: "HIIT", icon: "⚡", coins: 35, category: "Cardio" },
  { id: "t7", name: "Shoulder Day", icon: "🎯", coins: 30, category: "Strength" },
  { id: "t8", name: "Core & Abs", icon: "🔥", coins: 20, category: "Core" },
];

// ─── Daily Workout Schedule ───────────────────────────────────────────────────
const DAILY_WORKOUTS = {
  0: { // Sunday
    day: "Sunday", focus: "Rest & Recovery", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",
    exercises: [
      { name: "Foam Rolling", sets: "10 min", reps: "Full body", muscle: "Recovery", anim: "foam" },
      { name: "Light Stretching", sets: "3 sets", reps: "30 sec each", muscle: "Flexibility", anim: "stretch" },
      { name: "Deep Breathing", sets: "5 min", reps: "Box breathing", muscle: "Mind", anim: "breath" },
      { name: "Hip Flexor Stretch", sets: "3 sets", reps: "45 sec", muscle: "Hips", anim: "hip" },
      { name: "Cat-Cow Stretch", sets: "3 sets", reps: "10 reps", muscle: "Spine", anim: "camel" },
      { name: "Child's Pose", sets: "3 sets", reps: "60 sec", muscle: "Back", anim: "child" },
    ]
  },
  1: { // Monday
    day: "Monday", focus: "Chest Day 💪", color: "#00ff88", bg: "rgba(0,255,136,0.08)",
    exercises: [
      { name: "Bench Press", sets: "4 sets", reps: "8-10 reps", muscle: "Chest", anim: "bench" },
      { name: "Incline DB Press", sets: "3 sets", reps: "10-12 reps", muscle: "Upper Chest", anim: "incline" },
      { name: "Cable Flyes", sets: "3 sets", reps: "12-15 reps", muscle: "Chest", anim: "fly" },
      { name: "Push-Ups", sets: "3 sets", reps: "15-20 reps", muscle: "Chest & Triceps", anim: "pushup" },
      { name: "Dips", sets: "3 sets", reps: "10-12 reps", muscle: "Lower Chest", anim: "dip" },
      { name: "Chest Press Machine", sets: "3 sets", reps: "12 reps", muscle: "Chest", anim: "machine" },
    ]
  },
  2: { // Tuesday
    day: "Tuesday", focus: "Back Day 🏋️", color: "#00d4ff", bg: "rgba(0,212,255,0.08)",
    exercises: [
      { name: "Deadlift", sets: "4 sets", reps: "6-8 reps", muscle: "Full Back", anim: "deadlift" },
      { name: "Pull-Ups", sets: "4 sets", reps: "8-10 reps", muscle: "Lats", anim: "pullup" },
      { name: "Barbell Row", sets: "3 sets", reps: "8-10 reps", muscle: "Mid Back", anim: "row" },
      { name: "Lat Pulldown", sets: "3 sets", reps: "12 reps", muscle: "Lats", anim: "pulldown" },
      { name: "Seated Cable Row", sets: "3 sets", reps: "12 reps", muscle: "Back", anim: "cablerow" },
      { name: "Face Pulls", sets: "3 sets", reps: "15 reps", muscle: "Rear Delts", anim: "facepull" },
    ]
  },
  3: { // Wednesday
    day: "Wednesday", focus: "Biceps & Triceps 💥", color: "#ff6b35", bg: "rgba(255,107,53,0.08)",
    exercises: [
      { name: "Barbell Curl", sets: "4 sets", reps: "10-12 reps", muscle: "Biceps", anim: "curl" },
      { name: "Hammer Curl", sets: "3 sets", reps: "12 reps", muscle: "Brachialis", anim: "hammer" },
      { name: "Tricep Dips", sets: "4 sets", reps: "10-12 reps", muscle: "Triceps", anim: "tricdip" },
      { name: "Skull Crushers", sets: "3 sets", reps: "10-12 reps", muscle: "Triceps", anim: "skull" },
      { name: "Concentration Curl", sets: "3 sets", reps: "12 reps", muscle: "Biceps Peak", anim: "conc" },
      { name: "Tricep Pushdown", sets: "3 sets", reps: "15 reps", muscle: "Triceps", anim: "pushdown" },
    ]
  },
  4: { // Thursday
    day: "Thursday", focus: "Shoulder Day 🎯", color: "#ffd700", bg: "rgba(255,215,0,0.08)",
    exercises: [
      { name: "Overhead Press", sets: "4 sets", reps: "8-10 reps", muscle: "All Delts", anim: "ohp" },
      { name: "Lateral Raises", sets: "4 sets", reps: "12-15 reps", muscle: "Side Delts", anim: "lateral" },
      { name: "Front Raises", sets: "3 sets", reps: "12 reps", muscle: "Front Delts", anim: "front" },
      { name: "Rear Delt Flyes", sets: "3 sets", reps: "15 reps", muscle: "Rear Delts", anim: "rear" },
      { name: "Arnold Press", sets: "3 sets", reps: "10-12 reps", muscle: "Full Shoulder", anim: "arnold" },
      { name: "Shrugs", sets: "4 sets", reps: "15 reps", muscle: "Traps", anim: "shrug" },
    ]
  },
  5: { // Friday
    day: "Friday", focus: "Legs Day 🦵", color: "#ff4444", bg: "rgba(255,68,68,0.08)",
    exercises: [
      { name: "Barbell Squat", sets: "4 sets", reps: "8-10 reps", muscle: "Quads & Glutes", anim: "squat" },
      { name: "Romanian Deadlift", sets: "3 sets", reps: "10-12 reps", muscle: "Hamstrings", anim: "rdl" },
      { name: "Leg Press", sets: "4 sets", reps: "12 reps", muscle: "Quads", anim: "legpress" },
      { name: "Lunges", sets: "3 sets", reps: "12 each leg", muscle: "Legs", anim: "lunge" },
      { name: "Leg Curl", sets: "3 sets", reps: "12-15 reps", muscle: "Hamstrings", anim: "legcurl" },
      { name: "Calf Raises", sets: "5 sets", reps: "20 reps", muscle: "Calves", anim: "calf" },
    ]
  },
  6: { // Saturday
    day: "Saturday", focus: "Core & Cardio ⚡", color: "#00ff88", bg: "rgba(0,255,136,0.08)",
    exercises: [
      { name: "Plank", sets: "4 sets", reps: "60 sec hold", muscle: "Core", anim: "plank" },
      { name: "Crunches", sets: "4 sets", reps: "20 reps", muscle: "Abs", anim: "crunch" },
      { name: "Russian Twists", sets: "3 sets", reps: "20 reps", muscle: "Obliques", anim: "twist" },
      { name: "Leg Raises", sets: "3 sets", reps: "15 reps", muscle: "Lower Abs", anim: "legraise" },
      { name: "Burpees", sets: "4 sets", reps: "10 reps", muscle: "Full Body", anim: "burpee" },
      { name: "Mountain Climbers", sets: "3 sets", reps: "30 sec", muscle: "Core & Cardio", anim: "mountain" },
    ]
  },
};

// ─── Seed Members (only used if Firestore is empty) ───────────────────────────
const SEED_MEMBERS = [
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
    workoutLog: { "2026-02-27": ["Chest Day"], "2026-02-26": ["Cardio"] },
    badges: ["🔥 7-Day Streak", "💪 First Workout", "⭐ 300 Coins"],
  },
  {
    id: "m2", username: "sara", password: "sara123", name: "Sara Mitchell",
    age: 24, height: 162, weight: 58, gender: "Female", goal: "Muscle Gain",
    activity: "High", medical: "None", plan: "Basic", fees: 1499,
    dueDate: "2026-02-28", status: "Unpaid", joinDate: "2025-06-15",
    coins: 120, streak: 2, lastActive: "2026-02-26",
    payments: [{ date: "2026-01-01", amount: 1499, status: "Paid", method: "Cash" }],
    workoutLog: { "2026-02-26": ["HIIT"] },
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
    ],
    workoutLog: {},
    badges: ["🔥 14-Day Streak", "💪 First Workout", "⭐ 800 Coins", "🏆 Top Performer"],
  },
];

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
    max-width: 420px; min-height: 100vh; margin: 0 auto;
    background: var(--bg); position: relative;
    display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 0 60px rgba(0,255,136,0.08);
  }

  .auth-screen {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 24px;
    background: radial-gradient(ellipse at top, #0d1a14 0%, var(--bg) 60%);
    position: relative; overflow: hidden;
  }
  .auth-screen::before {
    content: ''; position: absolute;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%);
    top: -50px; right: -80px;
    animation: pulse 4s ease-in-out infinite;
  }
  .auth-screen::after {
    content: ''; position: absolute;
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
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes streak { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
  @keyframes neonFlicker { 0%,100% { opacity: 1; } 92% { opacity: 1; } 93% { opacity: 0.8; } 94% { opacity: 1; } 96% { opacity: 0.9; } 97% { opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

  .logo-area { text-align: center; margin-bottom: 40px; animation: slideUp 0.6s ease; }
  .logo-icon {
    width: 80px; height: 80px;
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    border-radius: 24px; display: flex; align-items: center;
    justify-content: center; font-size: 36px; margin: 0 auto 16px;
    animation: glow 3s ease-in-out infinite;
    box-shadow: 0 0 30px rgba(0,255,136,0.4);
  }
  .logo-title {
    font-family: 'Rajdhani', sans-serif; font-size: 32px; font-weight: 700;
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    letter-spacing: 3px;
  }
  .logo-sub { color: var(--text2); font-size: 13px; letter-spacing: 2px; margin-top: 4px; }

  .role-tabs {
    display: flex; gap: 8px; margin-bottom: 28px;
    background: var(--card); padding: 4px; border-radius: 12px;
    border: 1px solid var(--border); animation: slideUp 0.7s ease;
  }
  .role-tab {
    flex: 1; padding: 10px; border: none; border-radius: 9px;
    font-family: 'Exo 2', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.3s;
    background: transparent; color: var(--text2); letter-spacing: 0.5px;
  }
  .role-tab.active {
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    color: #000; box-shadow: 0 4px 15px rgba(0,255,136,0.3);
  }

  .auth-form {
    width: 100%; background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; padding: 28px; position: relative; z-index: 1;
    animation: slideUp 0.8s ease; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
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
  .input-field:focus { border-color: var(--neon); box-shadow: 0 0 0 3px rgba(0,255,136,0.1); }
  .input-field::placeholder { color: var(--text3); }
  select.input-field { cursor: pointer; }
  select.input-field option { background: var(--bg2); }

  .btn-primary {
    width: 100%; padding: 15px;
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    border: none; border-radius: 12px;
    font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700;
    letter-spacing: 1.5px; color: #000; cursor: pointer; transition: all 0.3s;
    box-shadow: 0 4px 20px rgba(0,255,136,0.3); margin-top: 8px;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,255,136,0.5); }
  .btn-primary:active { transform: translateY(0); }

  .btn-secondary {
    padding: 10px 20px; background: var(--card2); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    font-family: 'Exo 2', sans-serif; font-size: 14px; cursor: pointer; transition: all 0.3s;
  }
  .btn-secondary:hover { border-color: var(--neon); color: var(--neon); }

  .btn-danger {
    padding: 8px 16px; background: rgba(255,68,68,0.15); border: 1px solid rgba(255,68,68,0.3);
    border-radius: 8px; color: var(--danger);
    font-family: 'Exo 2', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.3s;
  }
  .btn-danger:hover { background: rgba(255,68,68,0.25); }

  .btn-success {
    padding: 8px 16px; background: rgba(0,255,136,0.15); border: 1px solid rgba(0,255,136,0.3);
    border-radius: 8px; color: var(--neon);
    font-family: 'Exo 2', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.3s;
  }

  .btn-warning {
    padding: 8px 16px; background: rgba(255,170,0,0.15); border: 1px solid rgba(255,170,0,0.3);
    border-radius: 8px; color: var(--warning);
    font-family: 'Exo 2', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.3s;
  }

  .error-msg { color: var(--danger); font-size: 13px; margin-top: 12px; text-align: center; }

  .app-header {
    padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;
    background: var(--bg2); border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100; backdrop-filter: blur(10px);
  }
  .header-title {
    font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700;
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 1px;
  }
  .header-logo { display: flex; align-items: center; gap: 8px; }
  .header-logo-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, var(--neon), var(--neon2));
    border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;
  }
  .header-actions { display: flex; gap: 10px; align-items: center; }
  .icon-btn {
    width: 36px; height: 36px; background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; display: flex; align-items: center;
    justify-content: center; cursor: pointer; font-size: 16px; transition: all 0.3s;
  }
  .icon-btn:hover { border-color: var(--neon); }
  .back-btn {
    width: 36px; height: 36px; background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 20px; font-weight: 700; color: var(--neon);
    transition: all 0.3s; margin-right: 8px; flex-shrink: 0;
  }
  .back-btn:hover { border-color: var(--neon); background: rgba(0,255,136,0.1); transform: translateX(-2px); }

  .bottom-nav {
    position: sticky; bottom: 0; background: var(--bg2);
    border-top: 1px solid var(--border); display: flex; padding: 8px 0 12px;
    z-index: 100; backdrop-filter: blur(15px);
  }
  .nav-item {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 4px; padding: 6px; cursor: pointer; transition: all 0.3s; position: relative;
  }
  .nav-icon { font-size: 20px; transition: transform 0.3s; }
  .nav-label { font-size: 10px; color: var(--text3); font-weight: 500; letter-spacing: 0.3px; transition: color 0.3s; }
  .nav-item.active .nav-label { color: var(--neon); }
  .nav-item.active .nav-icon { transform: translateY(-2px); }
  .nav-dot {
    position: absolute; top: 2px; right: 20%;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--neon); animation: pulse 2s ease-in-out infinite;
  }

  .content { flex: 1; overflow-y: auto; padding-bottom: 10px; }

  .card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; padding: 16px; margin: 0 16px 14px;
    animation: slideUp 0.4s ease;
  }
  .card-glow { box-shadow: 0 0 20px rgba(0,255,136,0.08); }
  .card-title {
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 600;
    color: var(--text2); letter-spacing: 1px; text-transform: uppercase;
    margin-bottom: 12px; display: flex; align-items: center; gap: 6px;
  }
  .section-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px 10px; }
  .section-title { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: 0.5px; }
  .see-all { font-size: 13px; color: var(--neon); cursor: pointer; }

  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 16px 4px; }
  .stat-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; padding: 16px; position: relative; overflow: hidden;
    animation: slideUp 0.4s ease;
  }
  .stat-card::before {
    content: ''; position: absolute; top: 0; right: 0;
    width: 80px; height: 80px; border-radius: 0 0 0 80px; opacity: 0.06;
  }
  .stat-card.green::before { background: var(--neon); }
  .stat-card.blue::before { background: var(--neon2); }
  .stat-card.orange::before { background: var(--neon3); }
  .stat-card.gold::before { background: var(--gold); }
  .stat-card.purple::before { background: var(--purple); }
  .stat-icon { font-size: 24px; margin-bottom: 10px; }
  .stat-value { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; }
  .stat-card.green .stat-value { color: var(--neon); }
  .stat-card.blue .stat-value { color: var(--neon2); }
  .stat-card.orange .stat-value { color: var(--neon3); }
  .stat-card.gold .stat-value { color: var(--gold); }
  .stat-card.purple .stat-value { color: var(--purple); }
  .stat-label { font-size: 12px; color: var(--text2); margin-top: 4px; }
  .stat-change { font-size: 11px; margin-top: 6px; }
  .up { color: var(--success); }
  .down { color: var(--danger); }

  .chart-container { padding: 8px 0; }
  .chart-bars { display: flex; align-items: flex-end; gap: 8px; height: 120px; padding: 0 4px; }
  .chart-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .chart-bar-outer { width: 100%; flex: 1; display: flex; align-items: flex-end; }
  .chart-bar {
    width: 100%; border-radius: 6px 6px 0 0; transition: height 1s ease;
    cursor: pointer; position: relative; overflow: hidden; min-height: 4px;
  }
  .chart-bar::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 100%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent);
  }
  .chart-bar.active-bar {
    background: linear-gradient(to top, var(--neon), var(--neon2)) !important;
    box-shadow: 0 -4px 15px rgba(0,255,136,0.5);
  }
  .chart-month { font-size: 10px; color: var(--text3); font-weight: 500; }

  .member-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 14px; padding: 14px; margin: 0 16px 10px;
    display: flex; align-items: center; gap: 12px;
    cursor: pointer; transition: all 0.3s; animation: slideUp 0.4s ease;
  }
  .member-card:hover { border-color: var(--neon); transform: translateY(-1px); }
  .member-avatar {
    width: 48px; height: 48px;
    background: linear-gradient(135deg, var(--bg3), var(--card2));
    border-radius: 14px; display: flex; align-items: center;
    justify-content: center; font-size: 22px; border: 2px solid var(--border); flex-shrink: 0;
  }
  .member-info { flex: 1; min-width: 0; }
  .member-name { font-weight: 600; font-size: 15px; color: var(--text); margin-bottom: 3px; }
  .member-plan { font-size: 12px; color: var(--text2); }
  .badge-status { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; }
  .badge-paid { background: rgba(0,255,136,0.15); color: var(--paid); border: 1px solid rgba(0,255,136,0.2); }
  .badge-unpaid { background: rgba(255,68,68,0.15); color: var(--unpaid); border: 1px solid rgba(255,68,68,0.2); }
  .badge-plan-premium { background: rgba(255,215,0,0.15); color: var(--gold); border: 1px solid rgba(255,215,0,0.2); padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; }
  .badge-plan-basic { background: rgba(0,212,255,0.15); color: var(--neon2); border: 1px solid rgba(0,212,255,0.2); padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; }

  .progress-wrap { margin: 8px 0; }
  .progress-label { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .progress-bar-bg { height: 6px; background: var(--bg3); border-radius: 3px; overflow: hidden; }
  .progress-bar-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
  .progress-neon { background: linear-gradient(90deg, var(--neon), var(--neon2)); }
  .progress-gold { background: linear-gradient(90deg, var(--gold), var(--neon3)); }
  .progress-purple { background: linear-gradient(90deg, var(--purple), var(--neon2)); }

  .coin-display { display: flex; align-items: center; gap: 6px; }
  .coin-icon { font-size: 18px; animation: coinPop 0.6s ease; }
  .coin-value { font-family: 'Rajdhani', sans-serif; font-size: 22px; font-weight: 700; color: var(--gold); }
  .coin-small { font-size: 14px; color: var(--gold); font-weight: 600; }

  .task-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 16px; }
  .task-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 14px; padding: 16px; cursor: pointer; transition: all 0.3s;
    text-align: center; position: relative; overflow: hidden;
  }
  .task-card.completed { border-color: var(--neon); background: rgba(0,255,136,0.05); }
  .task-card.completed::after {
    content: '✓'; position: absolute; top: 8px; right: 8px;
    width: 20px; height: 20px; background: var(--neon); border-radius: 50%;
    color: #000; font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .task-card:hover { border-color: var(--neon2); transform: translateY(-2px); }
  .task-icon { font-size: 32px; margin-bottom: 8px; display: block; }
  .task-name { font-weight: 600; font-size: 14px; color: var(--text); margin-bottom: 4px; }
  .task-coins { font-size: 12px; color: var(--gold); }
  .task-category { font-size: 10px; color: var(--text3); margin-top: 4px; }

  .profile-hero {
    background: linear-gradient(135deg, var(--card), var(--bg2));
    border: 1px solid var(--border); border-radius: 20px; margin: 0 16px 14px;
    padding: 20px; text-align: center; position: relative; overflow: hidden;
  }
  .profile-hero::before {
    content: ''; position: absolute; bottom: -30px; right: -30px;
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

  .upi-card {
    background: linear-gradient(135deg, #1a0d2e, #0d1a2e);
    border: 1px solid rgba(139,92,246,0.3); border-radius: 20px;
    padding: 20px; margin: 0 16px 14px;
  }
  .upi-amount { font-family: 'Rajdhani', sans-serif; font-size: 36px; font-weight: 700; color: var(--danger); text-align: center; margin: 10px 0; }
  .upi-apps { display: flex; gap: 10px; justify-content: center; margin: 14px 0; }
  .upi-app-btn {
    flex: 1; padding: 12px 8px; border-radius: 12px; border: 1px solid var(--border);
    background: var(--card); cursor: pointer; transition: all 0.3s;
    text-align: center; font-size: 11px; color: var(--text2);
  }
  .upi-app-btn:hover { border-color: var(--purple); color: var(--text); transform: translateY(-2px); }
  .upi-app-icon { font-size: 24px; display: block; margin-bottom: 4px; }

  .toast {
    position: fixed; top: 20px; left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: var(--card2); border: 1px solid var(--neon);
    border-radius: 12px; padding: 12px 20px; font-size: 14px; z-index: 9999;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 8px 30px rgba(0,255,136,0.2);
    max-width: 90%; text-align: center;
    display: flex; align-items: center; gap: 8px; white-space: nowrap;
  }
  .toast.show { transform: translateX(-50%) translateY(0); }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8);
    backdrop-filter: blur(4px); z-index: 1000; display: flex;
    align-items: flex-end; animation: fadeIn 0.2s ease;
  }
  .modal-sheet {
    width: 100%; max-width: 420px; margin: 0 auto;
    background: var(--bg2); border-radius: 24px 24px 0 0;
    padding: 24px; max-height: 90vh; overflow-y: auto;
    animation: slideUp 0.3s ease; border-top: 1px solid var(--border);
  }
  .modal-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 20px; }
  .modal-title { font-family: 'Rajdhani', sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 20px; color: var(--text); }

  .streak-display { display: flex; align-items: center; gap: 8px; background: rgba(255,170,0,0.08); border: 1px solid rgba(255,170,0,0.2); border-radius: 12px; padding: 10px 14px; }
  .streak-fire { font-size: 24px; animation: pulse 1.5s ease-in-out infinite; }
  .streak-num { font-family: 'Rajdhani', sans-serif; font-size: 28px; font-weight: 700; color: var(--warning); }
  .streak-label { font-size: 12px; color: var(--text2); }

  .badges-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .badge-item { background: var(--card2); border: 1px solid var(--border); border-radius: 20px; padding: 5px 12px; font-size: 12px; color: var(--text); transition: all 0.3s; }
  .badge-item:hover { border-color: var(--gold); color: var(--gold); }

  .payment-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .payment-item:last-child { border-bottom: none; }
  .payment-date { font-size: 13px; color: var(--text2); }
  .payment-amount { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; color: var(--neon); }

  .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--neon); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 20px auto; }

  .db-loading {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: var(--bg); gap: 16px;
  }

  .divider { height: 1px; background: var(--border); margin: 10px 16px; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
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
  .neon-text { background: linear-gradient(135deg, var(--neon), var(--neon2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .neon-flicker { animation: neonFlicker 4s ease-in-out infinite; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .info-row:last-child { border-bottom: none; }
  .info-key { font-size: 13px; color: var(--text2); }
  .info-val { font-size: 13px; font-weight: 600; color: var(--text); }
  .tab-bar { display: flex; gap: 8px; padding: 4px 16px 12px; overflow-x: auto; scrollbar-width: none; }
  .tab-bar::-webkit-scrollbar { display: none; }
  .tab-pill { padding: 8px 16px; border-radius: 20px; white-space: nowrap; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: var(--card); color: var(--text2); transition: all 0.3s; flex-shrink: 0; }
  .tab-pill.active { background: rgba(0,255,136,0.1); border-color: var(--neon); color: var(--neon); }
`;

// ─── Revenue Chart ────────────────────────────────────────────────────────────
function RevenueChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.revenue));
  const [active, setActive] = useState(data.length - 1);
  return (
    <div className="chart-container">
      <div className="chart-bars">
        {data.map((d, i) => {
          const pct = (d.revenue / maxVal) * 100;
          const colors = ["#00ff88","#00d4ff","#ff6b35","#8b5cf6","#ffd700","#00ff88"];
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

// ─── AI Plan Section ──────────────────────────────────────────────────────────
function AIPlanSection({ user, members, showToast }) {
  const base = user ? (members.find(m => m.id === user.id) || user) : {};
  const [form, setForm] = useState({
    gender: base.gender || "Male", age: base.age || 25,
    height: base.height || 170, weight: base.weight || 70,
    activity: base.activity || "Moderate", goal: base.goal || "Fat Loss",
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
    const e = validate(); if (e) { setError(e); return; }
    setError(""); setLoading(true); setPlan(null);
    setTimeout(() => {
      const age = Number(form.age), h = Number(form.height), w = Number(form.weight);
      const { goal, activity, gender } = form;
      const bmr = gender === "Female" ? 10*w + 6.25*h - 5*age - 161 : 10*w + 6.25*h - 5*age + 5;
      const mult = activity === "Low" ? 1.375 : activity === "High" ? 1.725 : 1.55;
      const tdee = Math.round(bmr * mult);
      const kcal = goal==="Fat Loss" ? tdee-500 : goal==="Muscle Gain" ? tdee+300 : goal==="Endurance" ? tdee+100 : tdee;
      const protG = goal==="Muscle Gain" ? Math.round(w*2.2) : goal==="Fat Loss" ? Math.round(w*2) : Math.round(w*1.6);
      const fatG = Math.round(kcal*0.25/9);
      const carbG = Math.round((kcal - protG*4 - fatG*9)/4);
      const splits = [0.25,0.10,0.30,0.10,0.20,0.05].map(p=>Math.round(kcal*p));
      const times = ["Breakfast (7:00 AM)","Mid-Morning Snack (10:00 AM)","Lunch (1:00 PM)","Pre-Workout (4:30 PM)","Dinner (7:30 PM)","Night / Post-Workout (9:30 PM)"];
      const icons = ["🌅","🍎","☀️","⚡","🌙","🌟"];
      const FOODS = {
        "Fat Loss": [
          {f:"Egg white omelette (3 whites+1 yolk), sautéed spinach & mushrooms, black coffee",p:"22g"},
          {f:"1 medium apple + 10 raw almonds",p:"4g"},
          {f:"Grilled chicken breast (150g) + steamed brown rice (¾ cup) + cucumber-tomato salad",p:"38g"},
          {f:"Greek yogurt 100g (0% fat) + ½ scoop whey protein",p:"20g"},
          {f:"Baked salmon (120g) + stir-fried broccoli & bell pepper + 1 small roti",p:"32g"},
          {f:"Casein protein shake or warm low-fat turmeric milk",p:"14g"},
        ],
        "Muscle Gain": [
          {f:"6 whole eggs scrambled + 2 slices whole-wheat toast + 1 banana + glass full-fat milk",p:"42g"},
          {f:"Whey shake (1 scoop) + banana + peanut butter (1 tbsp)",p:"28g"},
          {f:"Chicken breast (200g) + white rice (1.5 cups) + dal + mixed vegetable sabzi",p:"52g"},
          {f:"Peanut butter sandwich (2 slices) + 1 glass whole milk + handful mixed nuts",p:"22g"},
          {f:"Paneer bhurji (200g) + 3 rotis + rajma curry + curd (200ml)",p:"44g"},
          {f:"Whey protein (1 scoop) + banana or rice cakes (fast carb)",p:"26g"},
        ],
        "Maintenance": [
          {f:"Poha with peas & peanuts + 2 boiled eggs + green tea",p:"18g"},
          {f:"Mixed fruit bowl (1 cup) + handful walnuts",p:"5g"},
          {f:"Dal rice + chicken curry (100g) + vegetable sabzi + salad",p:"30g"},
          {f:"Roasted chana (30g) + 1 banana or seasonal fruit",p:"9g"},
          {f:"2 rotis + paneer/fish/egg curry + curd + salad",p:"28g"},
          {f:"1 glass warm milk or light protein smoothie",p:"10g"},
        ],
        "Endurance": [
          {f:"Oats porridge (80g) with banana, honey & chia seeds + 2 boiled eggs",p:"20g"},
          {f:"Energy bar or 4–5 dates + 1 glass coconut water",p:"4g"},
          {f:"Brown rice (1 cup) + tuna/chicken (150g) + steamed veggies + olive oil",p:"36g"},
          {f:"Sports drink or banana + peanut butter on rice cakes",p:"8g"},
          {f:"Wholegrain pasta (100g dry) + lean mince sauce + side salad",p:"34g"},
          {f:"Recovery smoothie: milk + banana + oats + whey (½ scoop)",p:"20g"},
        ],
      };
      const WORKOUTS = {
        "Fat Loss": {
          Moderate:[
            {day:"MON",focus:"HIIT + Core",ex:"Jump squats 4×20, Mountain climbers 4×30s, Burpees 4×10, Russian twists 3×20",dur:"45 min",int:"High"},
            {day:"TUE",focus:"Upper Strength",ex:"Bench press 4×10, Bent-over rows 4×10, OHP 3×10, Pull-ups 3×8",dur:"50 min",int:"Moderate"},
            {day:"WED",focus:"Cardio Intervals",ex:"10 min warm-up + 8×1 min sprint (1 min rest) + 10 min cool-down",dur:"50 min",int:"High"},
            {day:"THU",focus:"Lower Strength",ex:"Barbell squat 4×10, RDL 4×10, Leg press 3×12, Calf raises 4×15",dur:"55 min",int:"Moderate"},
            {day:"FRI",focus:"Full Body Circuit",ex:"KB swings 4×15, Box jumps 3×10, TRX rows 3×12, Sled push 3×20m",dur:"50 min",int:"High"},
            {day:"SAT",focus:"Active Cardio",ex:"Cycling or swimming at easy pace 35–40 min",dur:"40 min",int:"Low"},
            {day:"SUN",focus:"Complete Rest",ex:"Foam rolling + 10 min light stretch",dur:"—",int:"None"},
          ],
          Low:[
            {day:"MON",focus:"Full Body Circuit",ex:"Bodyweight squats 3×15, Push-ups 3×12, DB rows 3×12, Plank 3×30s",dur:"40 min",int:"Moderate"},
            {day:"TUE",focus:"Cardio + Core",ex:"Brisk walk 30 min, Crunches 3×20, Leg raises 3×15",dur:"45 min",int:"Low"},
            {day:"WED",focus:"Upper Body",ex:"DB shoulder press 3×12, Bicep curls 3×12, Tricep dips 3×12",dur:"40 min",int:"Moderate"},
            {day:"THU",focus:"Active Recovery",ex:"20 min gentle yoga + foam rolling + stretching",dur:"25 min",int:"Low"},
            {day:"FRI",focus:"Lower Body",ex:"Goblet squat 3×15, Lunges 3×12, Glute bridge 3×20, Wall sit 3×30s",dur:"40 min",int:"Moderate"},
            {day:"SAT",focus:"LISS Cardio",ex:"Outdoor walk / cycling 40 min at comfortable pace",dur:"40 min",int:"Low"},
            {day:"SUN",focus:"Rest & Stretch",ex:"Full body static stretch, light mobility work",dur:"20 min",int:"None"},
          ],
          High:[
            {day:"MON",focus:"Heavy HIIT + Abs",ex:"Barbell complex 5×5, Box jumps 4×12, Battle ropes 4×30s, V-ups 4×20",dur:"60 min",int:"High"},
            {day:"TUE",focus:"Push",ex:"Incline bench 4×8, Arnold press 4×10, Dips 4×10, Skull crushers 3×12",dur:"65 min",int:"High"},
            {day:"WED",focus:"Steady Cardio",ex:"Run 5–8 km at 65–70% max HR",dur:"50 min",int:"Moderate"},
            {day:"THU",focus:"Pull",ex:"Weighted pull-ups 4×8, Cable rows 4×10, Face pulls 3×15, Hammer curls 3×12",dur:"60 min",int:"High"},
            {day:"FRI",focus:"Legs + HIIT",ex:"Front squat 4×8, Bulgarian split squat 3×10, RDL 4×8, 5 min HIIT finisher",dur:"70 min",int:"High"},
            {day:"SAT",focus:"Sport / Functional",ex:"60 min sport activity (basketball, badminton) or long run",dur:"60 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",ex:"Mandatory rest, passive stretching only",dur:"—",int:"None"},
          ],
        },
        "Muscle Gain": {
          Moderate:[
            {day:"MON",focus:"Chest + Triceps",ex:"Flat bench 5×5, Incline DB 4×8, Dips 4×10, Close-grip bench 3×10",dur:"65 min",int:"High"},
            {day:"TUE",focus:"Back + Biceps",ex:"Barbell row 5×5, Weighted pull-ups 4×6, DB curls 4×10, Preacher curl 3×12",dur:"65 min",int:"High"},
            {day:"WED",focus:"Legs (Full)",ex:"Barbell squat 5×5, RDL 4×8, Leg press 3×10, Leg curl 3×12, Calf raises 5×15",dur:"70 min",int:"High"},
            {day:"THU",focus:"Active Recovery",ex:"Light swim or walk, foam roll, mobility drills",dur:"30 min",int:"Low"},
            {day:"FRI",focus:"Shoulders",ex:"Standing OHP 5×5, Arnold press 3×10, Lateral raises 4×12, Tricep ext 3×12",dur:"60 min",int:"High"},
            {day:"SAT",focus:"Arms + Weak Points",ex:"Barbell 21s 3×, Skull crushers 4×10, Wrist curls 3×15, Cable work",dur:"55 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",ex:"Full rest, prioritise sleep & nutrition",dur:"—",int:"None"},
          ],
          Low:[
            {day:"MON",focus:"Chest + Triceps",ex:"Bench press 4×8, Incline DB press 3×10, Cable flies 3×12, Tricep pushdown 3×12",dur:"55 min",int:"Moderate"},
            {day:"TUE",focus:"Back + Biceps",ex:"Lat pulldown 4×10, Seated row 3×10, DB curls 3×12, Hammer curls 3×12",dur:"50 min",int:"Moderate"},
            {day:"WED",focus:"Rest / Light Cardio",ex:"15 min walk + full body stretch",dur:"20 min",int:"Low"},
            {day:"THU",focus:"Legs",ex:"Leg press 4×10, Hack squat 3×10, Leg extension 3×12, Calf raises 4×15",dur:"55 min",int:"Moderate"},
            {day:"FRI",focus:"Shoulders + Core",ex:"Seated DB press 4×10, Lateral raises 3×15, Shrugs 3×12, Plank 3×45s",dur:"50 min",int:"Moderate"},
            {day:"SAT",focus:"Full Body Compound",ex:"Deadlift 4×5, Pull-ups 3×8, Dips 3×10, Farmer's carry 3×20m",dur:"60 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",ex:"Complete rest, sleep 8+ hours",dur:"—",int:"None"},
          ],
          High:[
            {day:"MON",focus:"Chest (Volume)",ex:"Bench press 6×6, Incline DB 5×8, Cable flies 4×12, Push-ups burnout",dur:"75 min",int:"High"},
            {day:"TUE",focus:"Back (Volume)",ex:"Deadlift 5×5, Barbell row 5×6, Pull-ups 5×8, Cable pullovers 3×15",dur:"75 min",int:"High"},
            {day:"WED",focus:"Legs (Volume)",ex:"Squats 6×6, Hack squat 4×10, RDL 4×8, Leg press drop-sets, Calves",dur:"80 min",int:"High"},
            {day:"THU",focus:"Shoulders (Volume)",ex:"OHP 5×5, Lateral raises 5×15, Rear delt flies 4×15, Face pulls 4×15",dur:"65 min",int:"High"},
            {day:"FRI",focus:"Arms (Volume)",ex:"Barbell curls 5×8, Incline DB curls 4×10, Skull crushers 5×8, Dips 4×fail",dur:"65 min",int:"High"},
            {day:"SAT",focus:"Full Body Power",ex:"Power cleans 4×4, Push press 4×5, Weighted pull-ups 4×6, Box jumps 3×8",dur:"70 min",int:"High"},
            {day:"SUN",focus:"Rest",ex:"Mandatory rest; light walk only if needed",dur:"—",int:"None"},
          ],
        },
        "Maintenance": {
          Moderate:[
            {day:"MON",focus:"Upper Body",ex:"Bench press 4×10, Pull-ups 4×8, OHP 3×10, Rows 3×10",dur:"55 min",int:"Moderate"},
            {day:"TUE",focus:"Lower + Cardio",ex:"Squats 4×10, RDL 3×10, Leg press 3×12 + 20 min run",dur:"60 min",int:"Moderate"},
            {day:"WED",focus:"Cardio",ex:"30 min run/cycle at 65% HR + 10 min abs",dur:"40 min",int:"Moderate"},
            {day:"THU",focus:"Rest",ex:"Light walk or complete rest",dur:"—",int:"None"},
            {day:"FRI",focus:"Full Body",ex:"Deadlift 4×6, DB press 4×10, Cable rows 3×12, Lunges 3×12",dur:"60 min",int:"Moderate"},
            {day:"SAT",focus:"Sport / Fun",ex:"Choose an outdoor sport or recreational activity",dur:"45 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",ex:"Recovery stretching, hydration focus",dur:"20 min",int:"None"},
          ],
          Low:[
            {day:"MON",focus:"Full Body A",ex:"Goblet squat 3×12, DB bench 3×12, DB row 3×12, Shoulder press 3×12",dur:"45 min",int:"Moderate"},
            {day:"TUE",focus:"Cardio + Flex",ex:"30 min brisk walk + 15 min yoga flow",dur:"45 min",int:"Low"},
            {day:"WED",focus:"Full Body B",ex:"Deadlift 3×8, Pull-ups 3×8, Dips 3×10, Plank 3×45s",dur:"45 min",int:"Moderate"},
            {day:"THU",focus:"Rest / Mobility",ex:"Foam roll + dynamic stretching",dur:"20 min",int:"None"},
            {day:"FRI",focus:"Full Body C",ex:"Lunges 3×12, Push-ups 3×15, Lat pulldown 3×12, Cable row 3×12",dur:"45 min",int:"Moderate"},
            {day:"SAT",focus:"Active Hobby",ex:"Cycling, swimming, hiking or sport",dur:"45 min",int:"Low"},
            {day:"SUN",focus:"Rest",ex:"Rest and recover",dur:"—",int:"None"},
          ],
          High:[
            {day:"MON",focus:"Push",ex:"Bench 4×8, Incline DB 4×10, OHP 4×8, Tricep ext 3×12",dur:"60 min",int:"High"},
            {day:"TUE",focus:"Pull",ex:"Weighted pull-ups 4×8, Barbell row 4×8, Face pulls 3×15, Curls 3×12",dur:"60 min",int:"High"},
            {day:"WED",focus:"Legs",ex:"Squat 4×8, RDL 4×8, Leg press 3×10, Calves 4×15",dur:"65 min",int:"High"},
            {day:"THU",focus:"HIIT Conditioning",ex:"10×30s sprints, Jump rope 5 min, Battle ropes 3×30s, Box jumps 3×10",dur:"45 min",int:"High"},
            {day:"FRI",focus:"Full Body",ex:"Deadlift 4×5, Dips 3×failure, Pull-ups 3×failure, KB swings 3×20",dur:"60 min",int:"High"},
            {day:"SAT",focus:"Long Cardio",ex:"60–75 min steady-state run, cycle or swim",dur:"70 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",ex:"Complete rest",dur:"—",int:"None"},
          ],
        },
        "Endurance": {
          Moderate:[
            {day:"MON",focus:"Intervals",ex:"10 min warm-up + 8×400m repeats (90s rest) + 10 min cool-down",dur:"55 min",int:"High"},
            {day:"TUE",focus:"Strength",ex:"Lunges 4×12, Single-leg RDL 3×10, Step-ups 3×12, Core circuit",dur:"50 min",int:"Moderate"},
            {day:"WED",focus:"Recovery Run",ex:"30–35 min easy jog (Zone 2)",dur:"35 min",int:"Low"},
            {day:"THU",focus:"Cycle / Swim",ex:"45 min moderate cycling or 30 min swim",dur:"45 min",int:"Moderate"},
            {day:"FRI",focus:"Threshold Run",ex:"10 min warm-up + 25 min tempo + 10 min cool-down",dur:"55 min",int:"High"},
            {day:"SAT",focus:"Long Run",ex:"75–90 min easy long run",dur:"80 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",ex:"Complete rest, hydration & sleep",dur:"—",int:"None"},
          ],
          Low:[
            {day:"MON",focus:"Base Cardio",ex:"40 min easy-pace run (Zone 2, conversational)",dur:"40 min",int:"Low"},
            {day:"TUE",focus:"Strength + Mobility",ex:"Bodyweight squat 3×15, Hip hinge 3×12, Shoulder work 3×12, Core 3×15",dur:"40 min",int:"Moderate"},
            {day:"WED",focus:"Interval Run",ex:"5 min warm-up + 6×2 min hard + 1 min rest + 5 min cool-down",dur:"35 min",int:"High"},
            {day:"THU",focus:"Cross-Training",ex:"Cycling or swimming 35–40 min easy",dur:"40 min",int:"Low"},
            {day:"FRI",focus:"Tempo Run",ex:"5 min warm-up + 20 min threshold pace + 5 min cool-down",dur:"35 min",int:"Moderate"},
            {day:"SAT",focus:"Long Slow Distance",ex:"60–70 min easy run / brisk walk-run",dur:"65 min",int:"Low"},
            {day:"SUN",focus:"Rest / Stretch",ex:"Full body stretch, foam rolling",dur:"20 min",int:"None"},
          ],
          High:[
            {day:"MON",focus:"VO2 Max Intervals",ex:"10 min warm-up + 5×5 min @95% HR (3 min rest) + 10 min cool-down",dur:"65 min",int:"High"},
            {day:"TUE",focus:"Strength + Plyo",ex:"Box jumps 4×10, Single-leg squat 3×8, Bounding 3×20m, Calf raises 5×20",dur:"55 min",int:"High"},
            {day:"WED",focus:"Recovery Jog",ex:"30 min easy run (Zone 1–2), foam roll after",dur:"35 min",int:"Low"},
            {day:"THU",focus:"Bike / Swim",ex:"60 min moderate bike or 40 min structured swim",dur:"60 min",int:"Moderate"},
            {day:"FRI",focus:"Race-Pace Run",ex:"10 min warm-up + 35 min goal pace + 10 min cool-down",dur:"60 min",int:"High"},
            {day:"SAT",focus:"Long Run / Brick",ex:"100–120 min long run or bike-to-run brick session",dur:"110 min",int:"Moderate"},
            {day:"SUN",focus:"Rest",ex:"Complete rest; sleep & recovery priority",dur:"—",int:"None"},
          ],
        },
      };
      const ak = activity==="Low"?"Low":activity==="High"?"High":"Moderate";
      const workoutPlan = WORKOUTS[goal]?.[ak] || WORKOUTS["Maintenance"]["Moderate"];
      const foods = FOODS[goal] || FOODS["Maintenance"];
      const dietPlan = foods.map((f,i) => ({ meal:times[i], icon:icons[i], food:f.f, calories:splits[i], protein:f.p }));
      const wL = (w*0.035).toFixed(1);
      const TIPS = {
        "Fat Loss": [`At ${w}kg target ${wL}L water daily.`,`${kcal} kcal = ~500 kcal deficit. Weigh weekly, not daily.`,`Aim for ${protG}g protein daily to preserve muscle.`,age>35?`After 35 recovery slows — take rest days and sleep 7–8 hrs.`:`Sleep 7+ hrs — poor sleep raises cortisol and stalls fat loss.`],
        "Muscle Gain": [`${kcal} kcal surplus supports growth. Aim to gain 0.25–0.5 kg/week.`,`Hit ${protG}g protein spread across 5–6 meals.`,`Progressive overload: add weight or reps every 1–2 weeks.`,`Post-workout: protein + fast carbs within 30–45 min.`],
        "Maintenance": [`At ${kcal} kcal you're at maintenance — adjust ±100 based on weekly weight.`,`Focus on food quality: whole foods, lean proteins & fibre-rich carbs.`,`Consistency beats perfection — 80% adherence reliably beats sporadic 100%.`,`7,000–10,000 steps/day makes a significant difference.`],
        "Endurance": [`Carbs are your fuel — ${carbG}g/day, timed around sessions.`,`Drink ${wL}L+ water; add electrolytes on sessions over 60 min.`,`2 strength sessions/week prevent injury & improve economy.`,`8 hrs sleep will measurably improve your times.`],
      };
      const summary = `At ${age} yrs, ${h}cm, ${w}kg (BMI ${bmi} — ${bmiLabel}), your TDEE is ~${tdee} kcal/day. Your ${goal} plan targets ${kcal} kcal with ${protG}g protein, ${carbG}g carbs & ${fatG}g fat daily.`;
      setPlan({ summary, kcal, tdee, macros:{protein:`${protG}g`,carbs:`${carbG}g`,fat:`${fatG}g`}, dietPlan, workoutPlan, tips: TIPS[goal]||TIPS["Maintenance"] });
      setLoading(false);
      showToast("✨ Personalised Plan Generated!");
    }, 1800);
  };

  const iColor = i => i==="High"?"var(--danger)":i==="Moderate"?"var(--warning)":i==="Low"?"var(--neon)":"var(--text3)";

  return (
    <div style={{paddingBottom:28}}>
      <div style={{padding:"16px 16px 12px"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(0,255,136,0.08)",border:"1px solid rgba(0,255,136,0.2)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"var(--neon)",fontWeight:700,letterSpacing:"0.5px",marginBottom:10}}>🤖 AI POWERED</div>
        <div style={{fontFamily:"Rajdhani",fontSize:26,fontWeight:700,marginBottom:4}}>Diet & Workout Planner</div>
        <div style={{fontSize:13,color:"var(--text2)"}}>Enter your details and generate a custom plan</div>
      </div>
      <div style={{margin:"0 16px 16px",background:"linear-gradient(135deg,#0d1520,#0a1a0d)",border:"1px solid rgba(0,255,136,0.18)",borderRadius:20,padding:20}}>
        <div style={{fontFamily:"Rajdhani",fontSize:17,fontWeight:700,color:"var(--text)",marginBottom:16}}>📋 Your Body Details</div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:"var(--text2)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Gender</div>
          <div style={{display:"flex",gap:8}}>
            {[{v:"Male",lbl:"♂ Male"},{v:"Female",lbl:"♀ Female"},{v:"Other",lbl:"⊙ Other"}].map(g=>(
              <button key={g.v} onClick={()=>set("gender",g.v)} style={{flex:1,padding:"10px 4px",borderRadius:10,border:`1px solid ${form.gender===g.v?"var(--neon)":"var(--border)"}`,background:form.gender===g.v?"rgba(0,255,136,0.1)":"var(--bg2)",color:form.gender===g.v?"var(--neon)":"var(--text2)",fontFamily:"Exo 2,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>{g.lbl}</button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
          {[{k:"age",lbl:"Age (yrs)"},{k:"height",lbl:"Height (cm)"},{k:"weight",lbl:"Weight (kg)"}].map(f=>(
            <div key={f.k}>
              <div style={{fontSize:11,color:"var(--text2)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>{f.lbl}</div>
              <input type="number" value={form[f.k]} onChange={e=>set(f.k,e.target.value)} style={{width:"100%",padding:"13px 6px",textAlign:"center",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,color:"var(--text)",fontFamily:"Exo 2,sans-serif",fontSize:18,fontWeight:700,outline:"none",transition:"border-color 0.2s"}} onFocus={e=>e.target.style.borderColor="var(--neon)"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
            </div>
          ))}
        </div>
        {Number(form.height)>100 && Number(form.weight)>20 && (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--bg2)",borderRadius:10,padding:"10px 14px",border:`1px solid ${bmiColor}33`,marginBottom:14}}>
            <div><div style={{fontSize:11,color:"var(--text3)"}}>Your BMI</div><div style={{fontFamily:"Rajdhani",fontSize:24,fontWeight:700,color:bmiColor}}>{bmi}</div></div>
            <div style={{background:`${bmiColor}18`,border:`1px solid ${bmiColor}44`,borderRadius:8,padding:"5px 14px",fontSize:13,fontWeight:700,color:bmiColor}}>{bmiLabel}</div>
            <div><div style={{width:70,height:6,background:"var(--border)",borderRadius:3,overflow:"hidden"}}><div style={{width:`${Math.min(Math.max(((bmi-10)/30)*100,4),100)}%`,height:"100%",background:`linear-gradient(90deg,var(--neon),${bmiColor})`,borderRadius:3,transition:"width 0.5s"}}/></div><div style={{fontSize:10,color:"var(--text3)",marginTop:3,textAlign:"right"}}>10 – 40+</div></div>
          </div>
        )}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:"var(--text2)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>🏃 Activity Level</div>
          <div style={{display:"flex",gap:8}}>
            {[{v:"Low",lbl:"Sedentary",e:"🛋️"},{v:"Moderate",lbl:"Moderate",e:"🚶"},{v:"High",lbl:"Active",e:"🏃"}].map(a=>(
              <button key={a.v} onClick={()=>set("activity",a.v)} style={{flex:1,padding:"10px 4px",borderRadius:10,textAlign:"center",border:`1px solid ${form.activity===a.v?"var(--neon2)":"var(--border)"}`,background:form.activity===a.v?"rgba(0,212,255,0.1)":"var(--bg2)",color:form.activity===a.v?"var(--neon2)":"var(--text2)",fontFamily:"Exo 2,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>
                <div style={{fontSize:20,marginBottom:3}}>{a.e}</div>{a.lbl}
              </button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,color:"var(--text2)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>🎯 Fitness Goal</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[{v:"Fat Loss",e:"🔥",d:"Lose weight"},{v:"Muscle Gain",e:"💪",d:"Build muscle"},{v:"Maintenance",e:"⚖️",d:"Stay fit"},{v:"Endurance",e:"🏅",d:"Stamina & cardio"}].map(g=>(
              <button key={g.v} onClick={()=>set("goal",g.v)} style={{padding:"12px 10px",borderRadius:12,textAlign:"left",border:`1px solid ${form.goal===g.v?"var(--neon3)":"var(--border)"}`,background:form.goal===g.v?"rgba(255,107,53,0.12)":"var(--bg2)",display:"flex",alignItems:"center",gap:10,cursor:"pointer",transition:"all 0.2s"}}>
                <span style={{fontSize:22}}>{g.e}</span>
                <div><div style={{fontFamily:"Exo 2,sans-serif",fontSize:13,fontWeight:700,color:form.goal===g.v?"var(--neon3)":"var(--text)"}}>{g.v}</div><div style={{fontSize:11,color:"var(--text3)"}}>{g.d}</div></div>
              </button>
            ))}
          </div>
        </div>
        {error && <div style={{background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.3)",borderRadius:8,padding:"10px 14px",marginBottom:12,color:"var(--danger)",fontSize:13}}>⚠️ {error}</div>}
        <button onClick={generate} disabled={loading} style={{width:"100%",padding:16,background:loading?"rgba(0,255,136,0.1)":"linear-gradient(135deg,var(--neon),var(--neon2))",border:loading?"1px solid rgba(0,255,136,0.3)":"none",borderRadius:14,fontFamily:"Rajdhani,sans-serif",fontSize:18,fontWeight:700,letterSpacing:2,color:loading?"var(--neon)":"#000",cursor:loading?"not-allowed":"pointer",boxShadow:loading?"none":"0 4px 22px rgba(0,255,136,0.35)",transition:"all 0.3s"}}>
          {loading?"⏳ GENERATING...":plan?"🔄 REGENERATE PLAN":"✨ GENERATE MY PLAN"}
        </button>
      </div>
      {loading && (
        <div style={{textAlign:"center",padding:"28px 20px"}}>
          <div style={{fontSize:44,marginBottom:12,animation:"pulse 1.5s ease-in-out infinite"}}>🤖</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}}>
            {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:"var(--neon)",animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
          </div>
          <div style={{fontFamily:"Rajdhani",fontSize:20,fontWeight:700}}>Crafting Your Personalised Plan</div>
        </div>
      )}
      {plan && !loading && (
        <div>
          <div style={{margin:"0 16px 14px",background:"linear-gradient(135deg,rgba(0,255,136,0.07),rgba(0,212,255,0.04))",border:"1px solid rgba(0,255,136,0.2)",borderRadius:16,padding:16}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(0,255,136,0.08)",border:"1px solid rgba(0,255,136,0.2)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"var(--neon)",fontWeight:700,letterSpacing:"0.5px",marginBottom:10}}>📊 YOUR ANALYSIS</div>
            <div style={{fontSize:13,lineHeight:1.75,color:"var(--text)"}}>{plan.summary}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:14}}>
              {[{l:"Calories",v:`${plan.kcal} kcal`,c:"var(--neon)"},{l:"TDEE",v:`${plan.tdee} kcal`,c:"var(--purple)"},{l:"Protein",v:plan.macros.protein,c:"var(--neon2)"},{l:"Carbs",v:plan.macros.carbs,c:"var(--gold)"},{l:"Fat",v:plan.macros.fat,c:"var(--neon3)"}].map(m=>(
                <div key={m.l} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:10,padding:"8px 12px",textAlign:"center",flex:"1 1 60px"}}>
                  <div style={{fontFamily:"Rajdhani",fontSize:15,fontWeight:700,color:m.c}}>{m.v}</div>
                  <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8,padding:"0 16px 14px"}}>
            {[{id:"diet",lbl:"🥗 Diet"},{id:"workout",lbl:"💪 Workout"},{id:"tips",lbl:"💡 Tips"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px",borderRadius:20,border:`1px solid ${tab===t.id?"var(--neon)":"var(--border)"}`,background:tab===t.id?"rgba(0,255,136,0.1)":"var(--card)",color:tab===t.id?"var(--neon)":"var(--text2)",fontFamily:"Exo 2,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>{t.lbl}</button>
            ))}
          </div>
          {tab==="diet" && (
            <div style={{margin:"0 16px 16px",background:"linear-gradient(135deg,#0d1520,#0a1a0d)",border:"1px solid rgba(0,255,136,0.15)",borderRadius:16,padding:16}}>
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
            </div>
          )}
          {tab==="workout" && (
            <div style={{margin:"0 16px 16px",background:"linear-gradient(135deg,#0d1520,#0a1a0d)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:16,padding:16}}>
              {plan.workoutPlan.map((w,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"12px 14px",marginBottom:10,display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{background:"rgba(0,255,136,0.1)",border:"1px solid rgba(0,255,136,0.2)",borderRadius:8,padding:"6px 8px",minWidth:40,textAlign:"center",fontFamily:"Rajdhani",fontSize:13,fontWeight:700,color:"var(--neon)",flexShrink:0}}>{w.day}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:14,color:"var(--text)",marginBottom:4}}>{w.focus}</div>
                    <div style={{fontSize:12,color:"var(--text2)",marginBottom:6,lineHeight:1.45}}>{w.ex}</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,color:"var(--text3)",background:"var(--bg2)",borderRadius:4,padding:"2px 7px"}}>⏱ {w.dur}</span>
                      <span style={{fontSize:11,borderRadius:4,padding:"2px 7px",color:iColor(w.int),background:`${iColor(w.int)}18`}}>{w.int==="High"?"🔴":w.int==="Moderate"?"🟡":"🟢"} {w.int}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab==="tips" && (
            <div style={{margin:"0 16px 16px",background:"linear-gradient(135deg,#0d1520,#0a1a0d)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:16,padding:16}}>
              {plan.tips.map((tip,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"14px",marginBottom:10,display:"flex",gap:12,alignItems:"flex-start",border:"1px solid rgba(255,215,0,0.06)"}}>
                  <span style={{fontSize:22,flexShrink:0}}>{["💧","📊","💪","😴"][i]||"✅"}</span>
                  <div style={{fontSize:13,lineHeight:1.65,color:"var(--text)"}}>{tip}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {!plan && !loading && (
        <div style={{margin:"0 16px",background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:"32px 20px",textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:14}}>🥗</div>
          <div style={{fontFamily:"Rajdhani",fontSize:20,fontWeight:700,marginBottom:8}}>AI-Powered Diet & Workout Planner</div>
          <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.75}}>Fill in your details above and tap <span style={{color:"var(--neon)",fontWeight:600}}>Generate My Plan</span> to receive a fully personalised plan.</div>
        </div>
      )}
    </div>
  );
}

// ─── Exercise Animation Component ────────────────────────────────────────────
function ExerciseAnim({ type, color }) {
  const c = color || "#00ff88";
  const anims = {
    // Chest
    bench: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="10" y="45" width="60" height="8" rx="4" fill={c} opacity="0.3"/><circle cx="40" cy="30" r="10" fill={c} opacity="0.7"/><line x1="40" y1="40" x2="40" y2="55" stroke={c} strokeWidth="3"/><line x1="40" y1="45" x2="20" y2="38" stroke={c} strokeWidth="3"/><line x1="40" y1="45" x2="60" y2="38" stroke={c} strokeWidth="3"/><rect x="8" y="35" width="8" height="4" rx="2" fill={c}/><rect x="64" y="35" width="8" height="4" rx="2" fill={c}/><animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="1.5s" repeatCount="indefinite"/></svg>,
    pushup: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="20" cy="28" r="8" fill={c} opacity="0.8"/><line x1="28" y1="32" x2="55" y2="48" stroke={c} strokeWidth="3"/><line x1="55" y1="48" x2="68" y2="48" stroke={c} strokeWidth="3"/><line x1="40" y1="40" x2="40" y2="58" stroke={c} strokeWidth="3"/><line x1="55" y1="48" x2="55" y2="62" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="translate" values="0,0;0,6;0,0" dur="1.2s" repeatCount="indefinite"/></svg>,
    incline: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="5" y="50" width="70" height="6" rx="3" fill={c} opacity="0.2"/><rect x="5" y="40" width="50" height="12" rx="4" fill={c} opacity="0.25" transform="rotate(-15 30 46)"/><circle cx="30" cy="28" r="9" fill={c} opacity="0.8"/><line x1="30" y1="37" x2="38" y2="50" stroke={c} strokeWidth="3"/><line x1="38" y1="45" x2="15" y2="38" stroke={c} strokeWidth="2.5"/><line x1="38" y1="45" x2="58" y2="38" stroke={c} strokeWidth="2.5"/><rect x="8" y="34" width="8" height="5" rx="2" fill={c}/><rect x="56" y="34" width="8" height="5" rx="2" fill={c}/><animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="1.6s" repeatCount="indefinite"/></svg>,
    fly: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="22" r="9" fill={c} opacity="0.8"/><line x1="40" y1="31" x2="40" y2="50" stroke={c} strokeWidth="3"/><path d="M40,40 Q20,30 12,38" stroke={c} strokeWidth="3" fill="none"/><path d="M40,40 Q60,30 68,38" stroke={c} strokeWidth="3" fill="none"/><circle cx="12" cy="38" r="5" fill={c} opacity="0.5"/><circle cx="68" cy="38" r="5" fill={c} opacity="0.5"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="2s" repeatCount="indefinite"/></svg>,
    dip: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="8" y="20" width="6" height="45" rx="3" fill={c} opacity="0.4"/><rect x="66" y="20" width="6" height="45" rx="3" fill={c} opacity="0.4"/><rect x="8" y="18" width="64" height="6" rx="3" fill={c} opacity="0.3"/><circle cx="40" cy="35" r="9" fill={c} opacity="0.8"/><line x1="40" y1="44" x2="40" y2="58" stroke={c} strokeWidth="3"/><line x1="40" y1="50" x2="28" y2="62" stroke={c} strokeWidth="3"/><line x1="40" y1="50" x2="52" y2="62" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="1.4s" repeatCount="indefinite"/></svg>,
    machine: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="5" y="10" width="70" height="60" rx="8" fill={c} opacity="0.08" stroke={c} strokeWidth="1.5"/><circle cx="40" cy="35" r="9" fill={c} opacity="0.8"/><line x1="40" y1="44" x2="40" y2="58" stroke={c} strokeWidth="3"/><line x1="40" y1="48" x2="25" y2="42" stroke={c} strokeWidth="3"/><line x1="40" y1="48" x2="55" y2="42" stroke={c} strokeWidth="3"/><rect x="18" y="38" width="8" height="8" rx="2" fill={c} opacity="0.5"/><rect x="54" y="38" width="8" height="8" rx="2" fill={c} opacity="0.5"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="1.5s" repeatCount="indefinite"/></svg>,
    // Back
    deadlift: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="20" r="9" fill={c} opacity="0.8"/><line x1="40" y1="29" x2="40" y2="52" stroke={c} strokeWidth="3"/><line x1="40" y1="40" x2="25" y2="48" stroke={c} strokeWidth="3"/><line x1="40" y1="40" x2="55" y2="48" stroke={c} strokeWidth="3"/><rect x="10" y="58" width="60" height="6" rx="3" fill={c} opacity="0.4"/><rect x="8" y="54" width="10" height="10" rx="5" fill={c} opacity="0.6"/><rect x="62" y="54" width="10" height="10" rx="5" fill={c} opacity="0.6"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-8;0,0" dur="1.6s" repeatCount="indefinite"/></svg>,
    pullup: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="5" y="8" width="70" height="8" rx="4" fill={c} opacity="0.4"/><circle cx="40" cy="35" r="9" fill={c} opacity="0.8"/><line x1="40" y1="16" x2="40" y2="26" stroke={c} strokeWidth="3"/><line x1="40" y1="44" x2="40" y2="60" stroke={c} strokeWidth="3"/><line x1="40" y1="52" x2="28" y2="62" stroke={c} strokeWidth="3"/><line x1="40" y1="52" x2="52" y2="62" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="translate" values="0,6;0,0;0,6" dur="1.5s" repeatCount="indefinite"/></svg>,
    row: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="20" cy="30" r="8" fill={c} opacity="0.8"/><line x1="28" y1="34" x2="40" y2="42" stroke={c} strokeWidth="3"/><line x1="40" y1="42" x2="40" y2="58" stroke={c} strokeWidth="3"/><line x1="40" y1="50" x2="55" y2="58" stroke={c} strokeWidth="3"/><line x1="28" y1="38" x2="65" y2="38" stroke={c} strokeWidth="3"/><rect x="60" y="34" width="10" height="8" rx="4" fill={c} opacity="0.5"/><animateTransform attributeName="transform" type="translate" values="0,0;-6,0;0,0" dur="1.4s" repeatCount="indefinite"/></svg>,
    pulldown: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="5" y="5" width="70" height="6" rx="3" fill={c} opacity="0.35"/><line x1="40" y1="11" x2="20" y2="28" stroke={c} strokeWidth="2.5"/><line x1="40" y1="11" x2="60" y2="28" stroke={c} strokeWidth="2.5"/><circle cx="40" cy="38" r="9" fill={c} opacity="0.8"/><line x1="40" y1="47" x2="40" y2="62" stroke={c} strokeWidth="3"/><line x1="40" y1="54" x2="28" y2="64" stroke={c} strokeWidth="3"/><line x1="40" y1="54" x2="52" y2="64" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="translate" values="0,-4;0,4;0,-4" dur="1.5s" repeatCount="indefinite"/></svg>,
    cablerow: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="5" y="35" width="20" height="30" rx="4" fill={c} opacity="0.2" stroke={c} strokeWidth="1"/><circle cx="55" cy="32" r="9" fill={c} opacity="0.8"/><line x1="25" y1="50" x2="48" y2="40" stroke={c} strokeWidth="3"/><line x1="55" y1="41" x2="55" y2="58" stroke={c} strokeWidth="3"/><line x1="55" y1="50" x2="43" y2="62" stroke={c} strokeWidth="3"/><line x1="55" y1="50" x2="67" y2="62" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="translate" values="0,0;-5,0;0,0" dur="1.4s" repeatCount="indefinite"/></svg>,
    facepull: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="60" y="20" width="15" height="40" rx="4" fill={c} opacity="0.2"/><circle cx="28" cy="30" r="9" fill={c} opacity="0.8"/><line x1="37" y1="33" x2="60" y2="38" stroke={c} strokeWidth="3"/><line x1="37" y1="37" x2="37" y2="55" stroke={c} strokeWidth="3"/><line x1="37" y1="46" x2="25" y2="58" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="translate" values="0,0;-6,0;0,0" dur="1.3s" repeatCount="indefinite"/></svg>,
    // Arms
    curl: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="20" r="9" fill={c} opacity="0.8"/><line x1="40" y1="29" x2="40" y2="45" stroke={c} strokeWidth="3"/><line x1="40" y1="45" x2="25" y2="38" stroke={c} strokeWidth="3"/><rect x="12" y="34" width="14" height="6" rx="3" fill={c} opacity="0.5"/><line x1="40" y1="45" x2="55" y2="55" stroke={c} strokeWidth="3"/><line x1="40" y1="55" x2="28" y2="66" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="rotate" values="0 25 38;-15 25 38;0 25 38" dur="1.4s" repeatCount="indefinite"/></svg>,
    hammer: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="20" r="9" fill={c} opacity="0.8"/><line x1="40" y1="29" x2="40" y2="48" stroke={c} strokeWidth="3"/><line x1="40" y1="48" x2="28" y2="42" stroke={c} strokeWidth="3"/><rect x="14" y="36" width="15" height="12" rx="4" fill={c} opacity="0.5"/><line x1="40" y1="48" x2="52" y2="58" stroke={c} strokeWidth="3"/><line x1="40" y1="58" x2="28" y2="68" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="rotate" values="0 28 42;-12 28 42;0 28 42" dur="1.5s" repeatCount="indefinite"/></svg>,
    tricdip: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="8" y="55" width="64" height="6" rx="3" fill={c} opacity="0.3"/><circle cx="40" cy="28" r="9" fill={c} opacity="0.8"/><line x1="40" y1="37" x2="40" y2="52" stroke={c} strokeWidth="3"/><line x1="40" y1="48" x2="25" y2="60" stroke={c} strokeWidth="3"/><line x1="40" y1="48" x2="55" y2="60" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="1.3s" repeatCount="indefinite"/></svg>,
    skull: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="10" y="48" width="60" height="8" rx="4" fill={c} opacity="0.3"/><circle cx="40" cy="20" r="9" fill={c} opacity="0.8"/><line x1="40" y1="29" x2="40" y2="42" stroke={c} strokeWidth="3"/><line x1="40" y1="42" x2="24" y2="42" stroke={c} strokeWidth="3"/><line x1="40" y1="42" x2="56" y2="42" stroke={c} strokeWidth="3"/><rect x="14" y="38" width="10" height="6" rx="3" fill={c} opacity="0.5"/><rect x="56" y="38" width="10" height="6" rx="3" fill={c} opacity="0.5"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur="1.4s" repeatCount="indefinite"/></svg>,
    conc: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="35" cy="18" r="9" fill={c} opacity="0.8"/><line x1="35" y1="27" x2="35" y2="45" stroke={c} strokeWidth="3"/><line x1="35" y1="45" x2="20" y2="40" stroke={c} strokeWidth="3"/><rect x="8" y="36" width="13" height="7" rx="3" fill={c} opacity="0.5"/><rect x="8" y="55" width="64" height="6" rx="3" fill={c} opacity="0.2"/><animateTransform attributeName="transform" type="rotate" values="0 20 40;-18 20 40;0 20 40" dur="1.4s" repeatCount="indefinite"/></svg>,
    pushdown: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="30" y="5" width="20" height="8" rx="4" fill={c} opacity="0.4"/><line x1="40" y1="13" x2="40" y2="26" stroke={c} strokeWidth="2.5"/><circle cx="40" cy="35" r="9" fill={c} opacity="0.8"/><line x1="40" y1="44" x2="40" y2="55" stroke={c} strokeWidth="3"/><line x1="40" y1="55" x2="28" y2="48" stroke={c} strokeWidth="3"/><line x1="40" y1="55" x2="52" y2="48" stroke={c} strokeWidth="3"/><rect x="23" y="62" width="34" height="6" rx="3" fill={c} opacity="0.4"/><animateTransform attributeName="transform" type="translate" values="0,-4;0,4;0,-4" dur="1.3s" repeatCount="indefinite"/></svg>,
    // Shoulders
    ohp: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="38" r="9" fill={c} opacity="0.8"/><line x1="40" y1="47" x2="40" y2="62" stroke={c} strokeWidth="3"/><line x1="40" y1="54" x2="28" y2="64" stroke={c} strokeWidth="3"/><line x1="40" y1="54" x2="52" y2="64" stroke={c} strokeWidth="3"/><line x1="40" y1="34" x2="18" y2="34" stroke={c} strokeWidth="3"/><line x1="40" y1="34" x2="62" y2="34" stroke={c} strokeWidth="3"/><rect x="8" y="30" width="10" height="8" rx="4" fill={c} opacity="0.5"/><rect x="62" y="30" width="10" height="8" rx="4" fill={c} opacity="0.5"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-8;0,0" dur="1.6s" repeatCount="indefinite"/></svg>,
    lateral: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="25" r="9" fill={c} opacity="0.8"/><line x1="40" y1="34" x2="40" y2="52" stroke={c} strokeWidth="3"/><line x1="40" y1="42" x2="22" y2="32" stroke={c} strokeWidth="3"/><line x1="40" y1="42" x2="58" y2="32" stroke={c} strokeWidth="3"/><circle cx="18" cy="30" r="5" fill={c} opacity="0.4"/><circle cx="62" cy="30" r="5" fill={c} opacity="0.4"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="1.4s" repeatCount="indefinite"/></svg>,
    front: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="28" r="9" fill={c} opacity="0.8"/><line x1="40" y1="37" x2="40" y2="55" stroke={c} strokeWidth="3"/><line x1="40" y1="47" x2="28" y2="58" stroke={c} strokeWidth="3"/><line x1="40" y1="47" x2="52" y2="58" stroke={c} strokeWidth="3"/><line x1="40" y1="43" x2="22" y2="43" stroke={c} strokeWidth="3"/><circle cx="18" cy="43" r="5" fill={c} opacity="0.5"/><animateTransform attributeName="transform" type="rotate" values="0 22 43;-25 22 43;0 22 43" dur="1.6s" repeatCount="indefinite"/></svg>,
    rear: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="22" r="9" fill={c} opacity="0.8"/><line x1="40" y1="31" x2="40" y2="50" stroke={c} strokeWidth="3" transform="rotate(15 40 40)"/><line x1="40" y1="42" x2="20" y2="55" stroke={c} strokeWidth="3"/><line x1="40" y1="42" x2="60" y2="55" stroke={c} strokeWidth="3"/><circle cx="16" cy="53" r="5" fill={c} opacity="0.4"/><circle cx="64" cy="53" r="5" fill={c} opacity="0.4"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="1.5s" repeatCount="indefinite"/></svg>,
    arnold: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="35" r="9" fill={c} opacity="0.8"/><line x1="40" y1="44" x2="40" y2="60" stroke={c} strokeWidth="3"/><line x1="40" y1="52" x2="28" y2="62" stroke={c} strokeWidth="3"/><line x1="40" y1="52" x2="52" y2="62" stroke={c} strokeWidth="3"/><line x1="40" y1="30" x2="22" y2="30" stroke={c} strokeWidth="3"/><line x1="40" y1="30" x2="58" y2="30" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="rotate" values="0 40 30;15 40 30;0 40 30" dur="2s" repeatCount="indefinite"/></svg>,
    shrug: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="22" r="9" fill={c} opacity="0.8"/><line x1="40" y1="31" x2="40" y2="52" stroke={c} strokeWidth="3"/><line x1="40" y1="40" x2="22" y2="36" stroke={c} strokeWidth="3"/><line x1="40" y1="40" x2="58" y2="36" stroke={c} strokeWidth="3"/><rect x="12" y="32" width="10" height="8" rx="4" fill={c} opacity="0.5"/><rect x="58" y="32" width="10" height="8" rx="4" fill={c} opacity="0.5"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-6;0,0" dur="1.2s" repeatCount="indefinite"/></svg>,
    // Legs
    squat: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="18" r="9" fill={c} opacity="0.8"/><line x1="40" y1="27" x2="40" y2="45" stroke={c} strokeWidth="3"/><line x1="40" y1="45" x2="25" y2="62" stroke={c} strokeWidth="3"/><line x1="40" y1="45" x2="55" y2="62" stroke={c} strokeWidth="3"/><rect x="12" y="13" width="56" height="7" rx="3.5" fill={c} opacity="0.3"/><animateTransform attributeName="transform" type="translate" values="0,0;0,10;0,0" dur="1.5s" repeatCount="indefinite"/></svg>,
    rdl: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="18" r="9" fill={c} opacity="0.8"/><line x1="40" y1="27" x2="40" y2="42" stroke={c} strokeWidth="3" transform="rotate(25 40 34)"/><line x1="40" y1="42" x2="25" y2="58" stroke={c} strokeWidth="3"/><line x1="40" y1="42" x2="55" y2="58" stroke={c} strokeWidth="3"/><rect x="14" y="60" width="52" height="7" rx="3.5" fill={c} opacity="0.4"/><animateTransform attributeName="transform" type="rotate" values="0 40 40;20 40 40;0 40 40" dur="1.6s" repeatCount="indefinite"/></svg>,
    legpress: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="5" y="30" width="30" height="40" rx="6" fill={c} opacity="0.15" stroke={c} strokeWidth="1"/><circle cx="20" cy="22" r="8" fill={c} opacity="0.8"/><line x1="20" y1="30" x2="20" y2="46" stroke={c} strokeWidth="3"/><line x1="20" y1="38" x2="38" y2="38" stroke={c} strokeWidth="3"/><rect x="38" y="28" width="35" height="22" rx="5" fill={c} opacity="0.2"/><animateTransform attributeName="transform" type="translate" values="0,0;8,0;0,0" dur="1.4s" repeatCount="indefinite"/></svg>,
    lunge: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="38" cy="16" r="9" fill={c} opacity="0.8"/><line x1="38" y1="25" x2="38" y2="42" stroke={c} strokeWidth="3"/><line x1="38" y1="42" x2="22" y2="62" stroke={c} strokeWidth="3"/><line x1="38" y1="42" x2="58" y2="55" stroke={c} strokeWidth="3"/><line x1="58" y1="55" x2="58" y2="68" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="translate" values="0,0;0,6;0,0" dur="1.5s" repeatCount="indefinite"/></svg>,
    legcurl: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="5" y="30" width="70" height="10" rx="5" fill={c} opacity="0.2"/><circle cx="22" cy="22" r="8" fill={c} opacity="0.8"/><line x1="22" y1="30" x2="22" y2="46" stroke={c} strokeWidth="3"/><line x1="22" y1="38" x2="55" y2="38" stroke={c} strokeWidth="3"/><line x1="55" y1="38" x2="62" y2="22" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="rotate" values="0 55 38;-35 55 38;0 55 38" dur="1.4s" repeatCount="indefinite"/></svg>,
    calf: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="18" r="9" fill={c} opacity="0.8"/><line x1="40" y1="27" x2="40" y2="50" stroke={c} strokeWidth="3"/><line x1="40" y1="50" x2="28" y2="68" stroke={c} strokeWidth="3"/><line x1="40" y1="50" x2="52" y2="68" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-8;0,0" dur="0.9s" repeatCount="indefinite"/></svg>,
    // Core & Cardio
    plank: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="15" cy="35" r="8" fill={c} opacity="0.8"/><line x1="23" y1="38" x2="62" y2="44" stroke={c} strokeWidth="4"/><line x1="30" y1="40" x2="30" y2="56" stroke={c} strokeWidth="3"/><line x1="55" y1="43" x2="55" y2="58" stroke={c} strokeWidth="3"/><rect x="8" y="58" width="64" height="5" rx="2.5" fill={c} opacity="0.2"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="2s" repeatCount="indefinite"/></svg>,
    crunch: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="8" y="55" width="64" height="8" rx="4" fill={c} opacity="0.2"/><circle cx="35" cy="28" r="9" fill={c} opacity="0.8"/><path d="M35,37 Q40,50 50,55" stroke={c} strokeWidth="3" fill="none"/><line x1="50" y1="55" x2="62" y2="55" stroke={c} strokeWidth="3"/><line x1="35" y1="45" x2="20" y2="55" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="rotate" values="0 40 50;-20 40 50;0 40 50" dur="1.3s" repeatCount="indefinite"/></svg>,
    twist: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="22" r="9" fill={c} opacity="0.8"/><line x1="40" y1="31" x2="40" y2="52" stroke={c} strokeWidth="3"/><line x1="40" y1="40" x2="20" y2="35" stroke={c} strokeWidth="3"/><line x1="40" y1="40" x2="60" y2="35" stroke={c} strokeWidth="3"/><circle cx="16" cy="33" r="5" fill={c} opacity="0.5"/><circle cx="64" cy="33" r="5" fill={c} opacity="0.5"/><animateTransform attributeName="transform" type="rotate" values="0 40 40;15 40 40;-15 40 40;0 40 40" dur="1.5s" repeatCount="indefinite"/></svg>,
    legraise: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="8" y="50" width="64" height="8" rx="4" fill={c} opacity="0.2"/><circle cx="22" cy="28" r="8" fill={c} opacity="0.8"/><line x1="22" y1="36" x2="22" y2="52" stroke={c} strokeWidth="3"/><line x1="22" y1="45" x2="38" y2="52" stroke={c} strokeWidth="3"/><line x1="38" y1="52" x2="62" y2="28" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="rotate" values="0 38 52;-30 38 52;0 38 52" dur="1.4s" repeatCount="indefinite"/></svg>,
    burpee: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="14" r="8" fill={c} opacity="0.8"/><line x1="40" y1="22" x2="40" y2="40" stroke={c} strokeWidth="3"/><line x1="40" y1="30" x2="26" y2="24" stroke={c} strokeWidth="3"/><line x1="40" y1="30" x2="54" y2="24" stroke={c} strokeWidth="3"/><line x1="40" y1="40" x2="28" y2="56" stroke={c} strokeWidth="3"/><line x1="40" y1="40" x2="52" y2="56" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="translate" values="0,0;0,-10;0,20;0,0" dur="1.6s" repeatCount="indefinite"/></svg>,
    mountain: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="14" cy="32" r="7" fill={c} opacity="0.8"/><line x1="21" y1="35" x2="55" y2="42" stroke={c} strokeWidth="3"/><line x1="36" y1="38" x2="36" y2="54" stroke={c} strokeWidth="3"/><line x1="55" y1="42" x2="55" y2="58" stroke={c} strokeWidth="3"/><line x1="36" y1="54" x2="28" y2="66" stroke={c} strokeWidth="2.5"/><line x1="55" y1="58" x2="65" y2="66" stroke={c} strokeWidth="2.5"/><animateTransform attributeName="transform" type="translate" values="0,0;5,0;0,0;-5,0;0,0" dur="0.8s" repeatCount="indefinite"/></svg>,
    // Recovery
    foam: <svg viewBox="0 0 80 80" width="80" height="80"><rect x="10" y="50" width="60" height="14" rx="7" fill={c} opacity="0.3"/><circle cx="25" cy="35" r="8" fill={c} opacity="0.8"/><line x1="25" y1="43" x2="40" y2="52" stroke={c} strokeWidth="3"/><line x1="40" y1="52" x2="65" y2="52" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="translate" values="0,0;5,0;0,0" dur="2s" repeatCount="indefinite"/></svg>,
    stretch: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="18" r="9" fill={c} opacity="0.8"/><line x1="40" y1="27" x2="40" y2="48" stroke={c} strokeWidth="3"/><line x1="40" y1="36" x2="16" y2="28" stroke={c} strokeWidth="3"/><line x1="40" y1="36" x2="64" y2="28" stroke={c} strokeWidth="3"/><line x1="40" y1="48" x2="25" y2="65" stroke={c} strokeWidth="3"/><line x1="40" y1="48" x2="55" y2="65" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="rotate" values="0 40 40;8 40 40;-8 40 40;0 40 40" dur="3s" repeatCount="indefinite"/></svg>,
    breath: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="40" r="28" fill="none" stroke={c} strokeWidth="2" opacity="0.3"><animate attributeName="r" values="20;30;20" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0.1;0.5" dur="3s" repeatCount="indefinite"/></circle><circle cx="40" cy="40" r="14" fill={c} opacity="0.6"><animate attributeName="r" values="10;18;10" dur="3s" repeatCount="indefinite"/></circle></svg>,
    hip: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="30" cy="22" r="8" fill={c} opacity="0.8"/><line x1="30" y1="30" x2="30" y2="48" stroke={c} strokeWidth="3"/><line x1="30" y1="42" x2="15" y2="55" stroke={c} strokeWidth="3"/><line x1="30" y1="42" x2="55" y2="38" stroke={c} strokeWidth="3"/><line x1="55" y1="38" x2="62" y2="55" stroke={c} strokeWidth="3"/><animateTransform attributeName="transform" type="rotate" values="0 30 42;10 30 42;0 30 42" dur="2s" repeatCount="indefinite"/></svg>,
    camel: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="22" r="9" fill={c} opacity="0.8"/><path d="M40,31 Q25,45 40,55 Q55,45 40,31" stroke={c} strokeWidth="3" fill="none"><animate attributeName="d" values="M40,31 Q25,45 40,55 Q55,45 40,31;M40,31 Q22,50 40,60 Q58,50 40,31;M40,31 Q25,45 40,55 Q55,45 40,31" dur="2s" repeatCount="indefinite"/></path><line x1="30" y1="55" x2="25" y2="68" stroke={c} strokeWidth="3"/><line x1="50" y1="55" x2="55" y2="68" stroke={c} strokeWidth="3"/></svg>,
    child: <svg viewBox="0 0 80 80" width="80" height="80"><circle cx="65" cy="30" r="8" fill={c} opacity="0.8"/><path d="M65,38 Q55,48 35,50" stroke={c} strokeWidth="3" fill="none"/><line x1="35" y1="50" x2="12" y2="50" stroke={c} strokeWidth="3"/><line x1="35" y1="50" x2="30" y2="62" stroke={c} strokeWidth="2.5"/><line x1="50" y1="46" x2="50" y2="62" stroke={c} strokeWidth="2.5"/><animateTransform attributeName="transform" type="translate" values="0,0;0,3;0,0" dur="3s" repeatCount="indefinite"/></svg>,
  };
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:80,height:80,filter:`drop-shadow(0 0 8px ${c}55)`}}>
      {anims[type] || anims.stretch}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

// ─── PaymentFlow Component ────────────────────────────────────────────────────
function PaymentFlow({ cu, upiId, onPaid }) {
  const [step, setStep] = useState("idle"); // idle | choosing | redirected | confirming | success
  const [selMethod, setSelMethod] = useState("GPay");
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);

  if (cu.status === "Paid" && step !== "success") return (
    <div style={{margin:"0 16px 14px",background:"linear-gradient(135deg,#0a1a0d,#0d1520)",border:"1px solid rgba(0,255,136,0.25)",borderRadius:20,padding:16,display:"flex",alignItems:"center",gap:14}}>
      <div style={{fontSize:36}}>✅</div>
      <div>
        <div style={{fontFamily:"Rajdhani",fontSize:18,fontWeight:700,color:"var(--neon)"}}>Membership Active</div>
        <div style={{fontSize:13,color:"var(--text2)"}}>Next due: <span style={{color:"var(--text)",fontWeight:600}}>{cu.dueDate}</span></div>
      </div>
    </div>
  );

  if (step === "success") return (
    <div style={{margin:"0 16px 14px",background:"linear-gradient(135deg,#0a1a0d,#0d1a10)",border:"1px solid rgba(0,255,136,0.4)",borderRadius:20,padding:24,textAlign:"center"}}>
      <div style={{fontSize:52,marginBottom:10}}>🎉</div>
      <div style={{fontFamily:"Rajdhani",fontSize:24,fontWeight:700,color:"var(--neon)",marginBottom:6}}>Payment Successful!</div>
      <div style={{fontSize:13,color:"var(--text2)",marginBottom:14}}>Membership is now active. See you at the gym! 💪</div>
      <button className="btn-primary" onClick={()=>setStep("idle")}>Done</button>
    </div>
  );

  if (step === "idle") return (
    <div style={{margin:"0 16px 14px",background:"linear-gradient(135deg,#1a0810,#0d1020)",border:"1px solid rgba(255,68,68,0.35)",borderRadius:20,padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,68,68,0.12)",border:"1px solid rgba(255,68,68,0.3)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"var(--danger)",fontWeight:700}}>🔴 PAYMENT OVERDUE</div>
        <div style={{fontSize:28}}>💳</div>
      </div>
      <div style={{fontFamily:"Rajdhani",fontSize:42,fontWeight:700,color:"var(--danger)",margin:"6px 0 2px"}}>₹{cu.fees}</div>
      <div style={{fontSize:13,color:"var(--text2)",marginBottom:16}}>Pay to UPI · <span style={{color:"var(--neon)",fontWeight:600}}>{upiId}</span></div>
      <button className="btn-primary" style={{background:"linear-gradient(135deg,#ff4444,#ff6b35)",boxShadow:"0 4px 20px rgba(255,68,68,0.4)"}} onClick={()=>setStep("choosing")}>
        💳 PAY NOW ₹{cu.fees}
      </button>
    </div>
  );

  if (step === "choosing") return (
    <div style={{margin:"0 16px 14px",background:"linear-gradient(135deg,#0d1520,#0a1a0d)",border:"1px solid rgba(0,212,255,0.3)",borderRadius:20,padding:20}}>
      <div style={{fontFamily:"Rajdhani",fontSize:20,fontWeight:700,marginBottom:4}}>Choose Payment App</div>
      <div style={{fontSize:13,color:"var(--text2)",marginBottom:16}}>Tap an app — you'll be redirected to pay ₹{cu.fees}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[{name:"Google Pay",emoji:"🟢"},{name:"PhonePe",emoji:"🟣"},{name:"Paytm",emoji:"🔵"},{name:"BHIM UPI",emoji:"🇮🇳"}].map(app=>(
          <button key={app.name} onClick={()=>{
            const upiUrl = `upi://pay?pa=${upiId}&pn=Crossfit+Gym&am=${cu.fees}&tn=Gym+Membership+Fee&cu=INR`;
            window.location.href = upiUrl;
            setTimeout(()=>setStep("redirected"), 1500);
          }} style={{padding:"16px 10px",borderRadius:14,background:"var(--card)",border:"1px solid var(--border)",cursor:"pointer",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <span style={{fontSize:32}}>{app.emoji}</span>
            <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{app.name}</span>
          </button>
        ))}
      </div>
      <button onClick={()=>setStep("idle")} style={{width:"100%",padding:"11px",background:"transparent",border:"1px solid var(--border)",borderRadius:12,color:"var(--text2)",fontFamily:"Exo 2,sans-serif",fontSize:14,cursor:"pointer"}}>← Cancel</button>
    </div>
  );

  if (step === "redirected") return (
    <div style={{margin:"0 16px 14px",background:"linear-gradient(135deg,#0d1520,#0a1a0d)",border:"1px solid rgba(255,215,0,0.35)",borderRadius:20,padding:24,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:12}}>⏳</div>
      <div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700,marginBottom:8}}>Complete Payment in UPI App</div>
      <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.8,marginBottom:10}}>
        Pay <span style={{color:"var(--danger)",fontWeight:700}}>₹{cu.fees}</span> to<br/>
        <span style={{color:"var(--neon)",fontWeight:700,fontSize:16}}>{upiId}</span>
      </div>
      <div style={{background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:12,padding:"10px 14px",marginBottom:18,fontSize:12,color:"var(--warning)"}}>
        ⚠️ After paying, come back here and tap "I've Paid"
      </div>
      <button className="btn-primary" style={{marginBottom:12,background:"linear-gradient(135deg,var(--neon),#00cc66)",boxShadow:"0 4px 20px rgba(0,255,136,0.4)"}} onClick={()=>setStep("confirming")}>
        ✅ I've Paid — Confirm Now
      </button>
      <br/>
      <button onClick={()=>setStep("choosing")} style={{background:"transparent",border:"none",color:"var(--text3)",fontSize:13,cursor:"pointer",textDecoration:"underline"}}>← Try a different app</button>
    </div>
  );

  if (step === "confirming") return (
    <div style={{margin:"0 16px 14px",background:"linear-gradient(135deg,#0a1a0d,#0d1520)",border:"1px solid rgba(0,255,136,0.35)",borderRadius:20,padding:20}}>
      <div style={{fontFamily:"Rajdhani",fontSize:20,fontWeight:700,marginBottom:4}}>Confirm Payment</div>
      <div style={{fontSize:13,color:"var(--text2)",marginBottom:16}}>Select app used and enter UTR (optional)</div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,color:"var(--text2)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Payment App</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["GPay","PhonePe","Paytm","BHIM","Cash"].map(m=>(
            <button key={m} onClick={()=>setSelMethod(m)} style={{
              padding:"8px 14px",borderRadius:20,fontFamily:"Exo 2,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.2s",
              background: selMethod===m ? "rgba(0,255,136,0.12)" : "var(--bg2)",
              border: `1px solid ${selMethod===m ? "var(--neon)" : "var(--border)"}`,
              color: selMethod===m ? "var(--neon)" : "var(--text2)",
            }}>{m}</button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:"var(--text2)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>UTR / Reference No. <span style={{color:"var(--text3)"}}>(optional)</span></div>
        <input className="input-field" placeholder="e.g. 123456789012" value={utr} onChange={e=>setUtr(e.target.value)} style={{letterSpacing:1}}/>
      </div>
      <button className="btn-primary" style={{marginBottom:10}} disabled={loading} onClick={async()=>{
        setLoading(true);
        try { await onPaid(selMethod, utr); setStep("success"); }
        catch(e) { alert("Error saving payment. Try again."); }
        setLoading(false);
      }}>
        {loading ? "Saving..." : "🎉 CONFIRM & MARK AS PAID"}
      </button>
      <button onClick={()=>setStep("redirected")} style={{width:"100%",padding:"11px",background:"transparent",border:"1px solid var(--border)",borderRadius:12,color:"var(--text2)",fontFamily:"Exo 2,sans-serif",fontSize:14,cursor:"pointer"}}>← Go Back</button>
    </div>
  );

  return null;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [modal, setModal] = useState(null);
  const [members, setMembers] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [memberCoins, setMemberCoins] = useState(0);
  const [editProfile, setEditProfile] = useState(false);
  const [gymUpiId, setGymUpiId] = useState(OWNER.upiId);
  const [newMember, setNewMember] = useState({ name: "", username: "", password: "", plan: "Basic", fees: "1499" });
  const [newMemberPhoto, setNewMemberPhoto] = useState(null);
  const [newMemberFeePaid, setNewMemberFeePaid] = useState(false);
  const [loginRole, setLoginRole] = useState("owner");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [legalPage, setLegalPage] = useState(null);

  // ── Firebase: live listener for members ──
  useEffect(() => {
    const colRef = collection(db, "members");
    const unsub = onSnapshot(colRef, async (snap) => {
      if (snap.empty) {
        // First time: seed database with demo members
        for (const m of SEED_MEMBERS) {
          await setDoc(doc(db, "members", m.id), m);
        }
      } else {
        const data = snap.docs.map(d => d.data());
        setMembers(data);
        // Sync logged-in member's coins if they're active
        setUser(prev => {
          if (prev && prev.id) {
            const fresh = data.find(m => m.id === prev.id);
            if (fresh) { setMemberCoins(fresh.coins); return fresh; }
          }
          return prev;
        });
      }
      setDbLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setDbLoading(false);
    });

    // Load gym settings (UPI ID) from Firebase
    const settingsUnsub = onSnapshot(doc(db, "settings", "gym"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.upiId) setGymUpiId(data.upiId);
      }
    });

    return () => { unsub(); settingsUnsub(); };
  }, []);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const handleLogin = () => {
    setLoginError("");
    if (loginRole === "owner") {
      if (loginForm.username === OWNER.username && loginForm.password === OWNER.password) {
        setUser(OWNER); setRole("owner"); setActiveTab("dashboard");
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

  // ── Firestore writes ──
  const completeTask = async (task) => {
    if (completedTasks.includes(task.id)) return;
    setCompletedTasks(p => [...p, task.id]);
    const newCoins = memberCoins + task.coins;
    setMemberCoins(newCoins);
    await updateDoc(doc(db, "members", user.id), { coins: newCoins });
    showToast(`🪙 +${task.coins} coins! ${task.name} completed!`);
  };

  const updateFeeStatus = async (memberId, status) => {
    await updateDoc(doc(db, "members", memberId), { status });
    showToast(status === "Paid" ? "✅ Fee marked as Paid" : "⚠️ Fee marked as Unpaid");
    setModal(null);
  };

  // Compress image to small size before saving to Firestore
  const compressPhoto = (base64, maxSize = 200) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = base64;
  });

  const [addingMember, setAddingMember] = useState(false);

  const addMember = async () => {
    if (!newMember.name || !newMember.username || !newMember.password) {
      showToast("❌ Fill all fields — Name, Username and Password required"); return;
    }
    setAddingMember(true);
    try {
      const id = `m${Date.now()}`;
      const today = new Date().toISOString().split("T")[0];
      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 1);
      const nextDueStr = nextDue.toISOString().split("T")[0];
      const initialPayments = newMemberFeePaid
        ? [{ date: today, amount: Number(newMember.fees), status: "Paid", method: "Cash" }]
        : [];
      // Compress photo if present to avoid Firestore size limit
      let photo = null;
      if (newMemberPhoto) {
        photo = await compressPhoto(newMemberPhoto, 200);
      }
      const m = {
        id, ...newMember, fees: Number(newMember.fees),
        photo,
        age: 25, height: 170, weight: 70, gender: "Male",
        goal: "Maintenance", activity: "Moderate", medical: "None",
        dueDate: newMemberFeePaid ? nextDueStr : today,
        status: newMemberFeePaid ? "Paid" : "Unpaid",
        joinDate: today,
        coins: 0, streak: 0, lastActive: today,
        payments: initialPayments, workoutLog: {}, badges: [],
      };
      await setDoc(doc(db, "members", id), m);
      setNewMember({ name: "", username: "", password: "", plan: "Basic", fees: "1499" });
      setNewMemberPhoto(null);
      setNewMemberFeePaid(false);
      setModal(null);
      setActiveTab("members");
      showToast(newMemberFeePaid ? "✅ Member added & fee marked Paid!" : "✅ Member added — fee pending");
    } catch (err) {
      console.error("addMember error:", err);
      showToast("❌ Error: " + (err.message || "Failed to add member"));
    } finally {
      setAddingMember(false);
    }
  };

  const deleteMember = async (id) => {
    await deleteDoc(doc(db, "members", id));
    showToast("🗑️ Member removed"); setModal(null);
  };

  const saveProfile = async (id, data) => {
    await updateDoc(doc(db, "members", id), data);
    setEditProfile(false); showToast("✅ Profile updated!");
  };

  // ── Loading screen ──
  if (dbLoading) return (
    <div className="db-loading">
      <style>{css}</style>
      <div style={{fontSize:52,animation:"pulse 1.5s ease-in-out infinite"}}>🏋️</div>
      <div className="spinner"/>
      <div style={{fontFamily:"Rajdhani",fontSize:20,fontWeight:700,color:"var(--neon)"}}>CROSSFIT</div>
      <div style={{fontSize:13,color:"var(--text2)"}}>Connecting to database…</div>
    </div>
  );

  // ── Legal Modal ──
  const LegalModal = ({ page, onClose }) => {
    const isTerms = page === "terms";
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(4px)",zIndex:9999,display:"flex",alignItems:"flex-end",animation:"fadeIn 0.2s ease"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
        <div style={{width:"100%",maxWidth:420,margin:"0 auto",background:"var(--bg2)",borderRadius:"24px 24px 0 0",padding:24,maxHeight:"85vh",overflowY:"auto",borderTop:"1px solid var(--border)",animation:"slideUp 0.3s ease"}}>
          <div style={{width:40,height:4,background:"var(--border)",borderRadius:2,margin:"0 auto 20px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{fontSize:28}}>{isTerms?"📋":"🔒"}</div>
            <div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700}}>{isTerms?"Terms & Conditions":"Privacy Policy"}</div>
          </div>
          <div style={{fontSize:13,lineHeight:1.8,color:"var(--text2)"}}>
            <div style={{color:"var(--neon)",fontWeight:700,fontSize:12,letterSpacing:1,marginBottom:12}}>LAST UPDATED: MARCH 2026</div>
            {(isTerms ? [
              {t:"1. Acceptance of Terms",b:"By accessing or using the Crossfit Gym Management app, you agree to be bound by these Terms. If you do not agree, please do not use the app."},
              {t:"2. Use of the App",b:"This app is intended for gym members and administrators only. Any misuse or unauthorized access is strictly prohibited."},
              {t:"3. Account Responsibility",b:"You are responsible for maintaining the confidentiality of your username and password. Notify us immediately of any unauthorized use."},
              {t:"4. Membership & Payments",b:"Membership fees are due on the date specified. All payments are final unless otherwise stated by gym administration."},
              {t:"5. Health Disclaimer",b:"Workout and diet recommendations are for general informational purposes only. Always consult a qualified health professional before starting any new program."},
              {t:"6. Modifications",b:"We reserve the right to update these Terms at any time. Continued use constitutes acceptance of the revised Terms."},
              {t:"7. Termination",b:"We reserve the right to suspend or terminate your account at any time if you violate these Terms."},
              {t:"8. Contact Us",b:"For any questions, please contact the gym administration directly."},
            ] : [
              {t:"1. Information We Collect",b:"We collect information you provide when registering, including name, age, height, weight, fitness goals, and payment details."},
              {t:"2. How We Use Your Information",b:"Your information is used to manage your membership, generate personalised plans, process payments, and send important notifications."},
              {t:"3. Data Storage",b:"All data is stored securely. We do not sell or transfer your personal information to third parties without your consent."},
              {t:"4. Health Data",b:"Health-related data you enter is used solely to provide personalised recommendations and is treated with the highest confidentiality."},
              {t:"5. Payment Information",b:"Payment details are handled securely. We do not store full payment credentials."},
              {t:"6. Your Rights",b:"You have the right to access, update, or request deletion of your personal data by contacting the gym administration."},
              {t:"7. Contact Us",b:"If you have any questions about this Privacy Policy, please contact the gym administration directly."},
            ]).map((s,i)=>(
              <div key={i} style={{marginBottom:16}}>
                <div style={{fontWeight:700,color:"var(--text)",marginBottom:4}}>{s.t}</div>
                <div>{s.b}</div>
              </div>
            ))}
          </div>
          <button onClick={onClose} style={{width:"100%",padding:14,marginTop:8,background:"linear-gradient(135deg,var(--neon),var(--neon2))",border:"none",borderRadius:12,fontFamily:"Rajdhani,sans-serif",fontSize:16,fontWeight:700,color:"#000",cursor:"pointer",letterSpacing:1}}>I UNDERSTAND</button>
        </div>
      </div>
    );
  };

  // ── Auth Screen ──
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
          <input className="input-field" placeholder={loginRole==="owner"?"admin":"your username"} value={loginForm.username} onChange={e=>setLoginForm(p=>({...p,username:e.target.value}))}/>
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input-field" type="password" placeholder="••••••••" value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
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

  // ── Computed stats ──
  const totalRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0);
  const monthlyRev = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].revenue;
  const activeMembers = members.filter(m => m.status === "Paid").length;
  const pendingFees = members.filter(m => m.status === "Unpaid").reduce((s, m) => s + Number(m.fees), 0);

  // ── Owner Screens ──
  const OwnerDashboard = () => (
    <div>
      <div style={{padding:"16px 16px 8px"}}>
        <div style={{fontSize:13,color:"var(--text2)"}}>Welcome back,</div>
        <div style={{fontFamily:"Rajdhani",fontSize:24,fontWeight:700}}>{OWNER.name} 👑</div>
      </div>
      <div className="stats-grid">
        <div className="stat-card green"><div className="stat-icon">👥</div><div className="stat-value">{members.length}</div><div className="stat-label">Total Members</div></div>
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
      <div className="card"><RevenueChart data={MONTHLY_REVENUE}/></div>
      <div className="section-header"><div className="section-title">Members</div><div className="see-all" onClick={()=>setActiveTab("members")}>View All →</div></div>
      {members.slice(0,3).map(m=>(
        <div key={m.id} className="member-card" onClick={()=>{setSelectedMember(m);setModal("memberDetail");}}>
          <div className="member-avatar" style={{overflow:"hidden",padding:0}}>{m.photo?<img src={m.photo} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:12}}/>:(m.gender==="Female"?"👩":"👨")}</div>
          <div className="member-info">
            <div className="member-name">{m.name}</div>
            <div className="row mt-8" style={{gap:6}}><span className={`badge-plan-${(m.plan||"basic").toLowerCase()}`}>{m.plan}</span><span style={{fontSize:12,color:"var(--text3)"}}>₹{m.fees}/mo</span></div>
          </div>
          <span className={`badge-status badge-${(m.status||"unpaid").toLowerCase()}`}>{m.status}</span>
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
          <div className="member-avatar" style={{overflow:"hidden",padding:0}}>{m.photo?<img src={m.photo} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:12}}/>:(m.gender==="Female"?"👩":"👨")}</div>
          <div className="member-info">
            <div className="member-name">{m.name}</div>
            <div className="text-sm text-muted mt-8">@{m.username} · Joined {m.joinDate}</div>
            <div className="row mt-8" style={{gap:6}}><span className={`badge-plan-${(m.plan||"basic").toLowerCase()}`}>{m.plan}</span><span className="coin-small">🪙 {m.coins}</span><span style={{fontSize:11,color:"var(--warning)"}}>🔥{m.streak}d</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
            <span className={`badge-status badge-${(m.status||"unpaid").toLowerCase()}`}>{m.status}</span>
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
      <div className="card card-glow"><div className="card-title">📈 Revenue Trend</div><RevenueChart data={MONTHLY_REVENUE}/></div>
      <div className="stats-grid">
        <div className="stat-card green"><div className="stat-icon">🧘</div><div className="stat-value">78%</div><div className="stat-label">Retention Rate</div></div>
        <div className="stat-card blue"><div className="stat-icon">🤖</div><div className="stat-value">{members.length}</div><div className="stat-label">AI Plan Users</div></div>
        <div className="stat-card orange"><div className="stat-icon">🏃</div><div className="stat-value">142</div><div className="stat-label">Workouts/Week</div></div>
        <div className="stat-card gold"><div className="stat-icon">🪙</div><div className="stat-value">{members.reduce((s,m)=>s+m.coins,0)}</div><div className="stat-label">Total Coins</div></div>
      </div>
      <div className="section-header"><div className="section-title">Member Progress</div></div>
      {members.map(m=>(
        <div key={m.id} className="card" style={{marginBottom:10}}>
          <div className="row"><div className="member-avatar" style={{width:36,height:36,fontSize:16,overflow:"hidden",padding:0}}>{m.photo?<img src={m.photo} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:10}}/>:(m.gender==="Female"?"👩":"👨")}</div><div className="flex-1"><div className="fw-7" style={{fontSize:14}}>{m.name}</div><div className="text-xs text-muted">{m.goal}</div></div><div className="streak-display" style={{padding:"5px 10px"}}><span>🔥</span><span style={{fontFamily:"Rajdhani",fontSize:18,fontWeight:700,color:"var(--warning)"}}>{m.streak}</span></div></div>
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
          <div className="profile-avatar-lg" style={{overflow:"hidden",padding:0}}>{cu.photo?<img src={cu.photo} alt={cu.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:20}}/>:(cu.gender==="Female"?"👩":"👨")}</div>
          <div className="profile-name">{cu.name}</div>
          <div className="profile-sub">{cu.plan} Plan · Joined {cu.joinDate}</div>
          <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:14}}>
            <div className="coin-display"><span className="coin-icon">🪙</span><span className="coin-value">{memberCoins}</span><span style={{fontSize:13,color:"var(--text2)",marginLeft:2}}>coins</span></div>
            <div style={{width:1,background:"var(--border)"}}/>
            <div className="streak-display" style={{background:"transparent",border:"none",padding:0}}><span className="streak-fire">🔥</span><span className="streak-num">{cu.streak}</span><span className="streak-label">day streak</span></div>
          </div>
        </div>
        <div style={{padding:"0 16px 12px"}}><div className="progress-wrap"><div className="progress-label"><span className="text-sm text-muted">Coin Progress</span><span className="text-sm text-gold">{memberCoins}/1000</span></div><div className="progress-bar-bg"><div className="progress-bar-fill progress-gold" style={{width:`${Math.min((memberCoins/1000)*100,100)}%`}}/></div></div></div>
        {/* ── Fee Status Cards ── */}
        <div className="stats-grid">
          <div className={`stat-card ${cu.status==="Paid"?"green":"orange"}`}>
            <div className="stat-icon">{cu.status==="Paid"?"✅":"⚠️"}</div>
            <div className="stat-value" style={{fontSize:18}}>{cu.status==="Unpaid"?"OVERDUE":"ACTIVE"}</div>
            <div className="stat-label">Fee Status</div>
            <div className={`stat-change ${cu.status==="Paid"?"up":"down"}`}>{cu.status==="Paid"?"✓ Paid":"⚠ Due Now"}</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon">📅</div>
            <div className="stat-value" style={{fontSize:16}}>{cu.dueDate}</div>
            <div className="stat-label">Next Due Date</div>
          </div>
        </div>

        {/* ── PAYMENT FLOW ── */}
        <PaymentFlow cu={cu} upiId={gymUpiId} onPaid={async (method, utr) => {
          const today = new Date().toISOString().split("T")[0];
          const nextDue = new Date();
          nextDue.setMonth(nextDue.getMonth() + 1);
          const newPayment = { date: today, amount: Number(cu.fees), status: "Paid", method, ...(utr ? { utr } : {}) };
          const updatedPayments = [newPayment, ...(cu.payments || [])];
          await updateDoc(doc(db, "members", user.id), {
            status: "Paid",
            dueDate: nextDue.toISOString().split("T")[0],
            payments: updatedPayments,
          });
          showToast("🎉 Payment confirmed! Membership active!");
        }} />

        <div className="section-header"><div className="section-title">Payment History</div></div>
        <div className="card">
          {(cu.payments||[]).length > 0 ? (cu.payments||[]).map((p,i)=>(
            <div key={i} className="payment-item">
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>{p.method}</div>
                <div className="payment-date">{p.date}</div>
                {p.utr && <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>UTR: {p.utr}</div>}
              </div>
              <div style={{textAlign:"right"}}>
                <div className="payment-amount">₹{p.amount}</div>
                <div className={`text-xs ${p.status==="Paid"?"text-neon":"text-danger"}`}>{p.status==="Paid"?"✓ Paid":"✗ Failed"}</div>
              </div>
            </div>
          )) : <div className="text-center text-muted" style={{padding:20}}>No payments yet</div>}
        </div>
        <div className="section-header"><div className="section-title">Badges</div></div>
        <div className="card"><div className="badges-wrap">{(cu.badges||[]).map((b,i)=><span key={i} className="badge-item">{b}</span>)}{memberCoins>=100&&<span className="badge-item" style={{borderColor:"var(--gold)",color:"var(--gold)"}}>⭐ {memberCoins}+ Coins</span>}</div></div>
      </div>
    );
  };

  const MemberWorkout = () => {
    const today = new Date();
    const dayIdx = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const todayWorkout = DAILY_WORKOUTS[dayIdx];
    const dateStr = today.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" });
    const [doneExercises, setDoneExercises] = useState([]);
    const [selectedDay, setSelectedDay] = useState(dayIdx);
    const viewWorkout = DAILY_WORKOUTS[selectedDay];

    const toggleExercise = (idx) => {
      setDoneExercises(prev =>
        prev.includes(idx) ? prev.filter(i=>i!==idx) : [...prev, idx]
      );
    };

    return (
      <div style={{paddingBottom:24}}>

        {/* ── Today Banner ── */}
        <div style={{
          margin:"16px 16px 14px",
          background:`linear-gradient(135deg, ${todayWorkout.bg.replace("0.08","0.15")}, rgba(0,0,0,0.3))`,
          border:`1px solid ${todayWorkout.color}44`,
          borderRadius:20, padding:"18px 20px",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:0.06,lineHeight:1}}>💪</div>
          <div style={{fontSize:11,color:todayWorkout.color,fontWeight:700,letterSpacing:2,marginBottom:4}}>TODAY · {dateStr.toUpperCase()}</div>
          <div style={{fontFamily:"Rajdhani",fontSize:26,fontWeight:700,color:"var(--text)",marginBottom:6}}>{todayWorkout.focus}</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{background:`${todayWorkout.color}22`,border:`1px solid ${todayWorkout.color}44`,borderRadius:20,padding:"4px 12px",fontSize:12,color:todayWorkout.color,fontWeight:600}}>
              {todayWorkout.exercises.length} Exercises
            </div>
            <div style={{fontSize:12,color:"var(--text2)"}}>🪙 +{todayWorkout.exercises.length * 10} coins on completion</div>
          </div>
          {/* Progress bar */}
          {selectedDay === dayIdx && (
            <div style={{marginTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:11,color:"var(--text3)"}}>Today's Progress</span>
                <span style={{fontSize:11,color:todayWorkout.color,fontWeight:700}}>{doneExercises.length}/{todayWorkout.exercises.length}</span>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${todayWorkout.color},${todayWorkout.color}99)`,width:`${(doneExercises.length/todayWorkout.exercises.length)*100}%`,transition:"width 0.5s ease"}}/>
              </div>
            </div>
          )}
        </div>

        {/* ── Day Selector ── */}
        <div style={{display:"flex",gap:6,padding:"0 16px 14px",overflowX:"auto",scrollbarWidth:"none"}}>
          {dayNames.map((d,i)=>{
            const w = DAILY_WORKOUTS[i];
            const isToday = i === dayIdx;
            const isSelected = i === selectedDay;
            return (
              <div key={i} onClick={()=>setSelectedDay(i)} style={{
                flexShrink:0, padding:"8px 12px", borderRadius:12, cursor:"pointer",
                background: isSelected ? `${w.color}22` : "var(--card)",
                border:`1px solid ${isSelected ? w.color : "var(--border)"}`,
                transition:"all 0.25s", textAlign:"center", minWidth:52,
              }}>
                <div style={{fontSize:10,color: isSelected ? w.color : "var(--text3)",fontWeight:700,letterSpacing:0.5}}>{d.slice(0,3).toUpperCase()}</div>
                {isToday && <div style={{width:4,height:4,background:w.color,borderRadius:"50%",margin:"3px auto 0",boxShadow:`0 0 6px ${w.color}`}}/>}
              </div>
            );
          })}
        </div>

        {/* ── Selected Day Header ── */}
        {selectedDay !== dayIdx && (
          <div style={{margin:"0 16px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:20}}>📅</div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{viewWorkout.day} — {viewWorkout.focus}</div>
              <div style={{fontSize:11,color:"var(--text3)"}}>Viewing scheduled workout</div>
            </div>
          </div>
        )}

        {/* ── Exercise Cards ── */}
        <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:12}}>
          {viewWorkout.exercises.map((ex, idx) => {
            const isDone = doneExercises.includes(idx) && selectedDay === dayIdx;
            return (
              <div key={idx} onClick={()=>{ if(selectedDay===dayIdx) toggleExercise(idx); }}
                style={{
                  background: isDone ? `${viewWorkout.color}0f` : "var(--card)",
                  border:`1px solid ${isDone ? viewWorkout.color : "var(--border)"}`,
                  borderRadius:18, padding:"14px 16px",
                  display:"flex", alignItems:"center", gap:14,
                  cursor: selectedDay===dayIdx ? "pointer" : "default",
                  transition:"all 0.3s",
                  boxShadow: isDone ? `0 0 20px ${viewWorkout.color}22` : "none",
                  animation:`slideUp 0.3s ease ${idx*0.06}s both`,
                }}
              >
                {/* Animated SVG */}
                <div style={{
                  width:80, height:80, flexShrink:0,
                  background: isDone ? `${viewWorkout.color}15` : "var(--bg2)",
                  borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center",
                  border:`1px solid ${isDone ? viewWorkout.color+"44" : "var(--border)"}`,
                  transition:"all 0.3s",
                }}>
                  <ExerciseAnim type={ex.anim} color={isDone ? viewWorkout.color : viewWorkout.color+"99"}/>
                </div>

                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{
                    fontFamily:"Rajdhani",fontSize:17,fontWeight:700,
                    color: isDone ? viewWorkout.color : "var(--text)",
                    marginBottom:3, transition:"color 0.3s",
                  }}>{ex.name}</div>
                  <div style={{fontSize:12,color:"var(--text2)",marginBottom:6}}>{ex.muscle}</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,fontWeight:600,color:viewWorkout.color,background:`${viewWorkout.color}15`,borderRadius:6,padding:"2px 8px"}}>{ex.sets}</span>
                    <span style={{fontSize:11,fontWeight:600,color:"var(--text2)",background:"var(--bg3)",borderRadius:6,padding:"2px 8px"}}>{ex.reps}</span>
                  </div>
                </div>

                {/* Done checkmark */}
                {selectedDay === dayIdx && (
                  <div style={{
                    width:28,height:28,borderRadius:"50%",flexShrink:0,
                    background: isDone ? viewWorkout.color : "var(--bg3)",
                    border:`2px solid ${isDone ? viewWorkout.color : "var(--border)"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:13,fontWeight:700,color: isDone ? "#000" : "var(--text3)",
                    transition:"all 0.3s",
                    boxShadow: isDone ? `0 0 10px ${viewWorkout.color}66` : "none",
                  }}>
                    {isDone ? "✓" : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── All Done Banner ── */}
        {selectedDay === dayIdx && doneExercises.length === viewWorkout.exercises.length && (
          <div style={{margin:"16px 16px 0",background:`linear-gradient(135deg,${viewWorkout.color}18,${viewWorkout.color}08)`,border:`1px solid ${viewWorkout.color}44`,borderRadius:20,padding:24,textAlign:"center",animation:"slideUp 0.4s ease"}}>
            <div style={{fontSize:52,marginBottom:10}}>🏆</div>
            <div style={{fontFamily:"Rajdhani",fontSize:24,fontWeight:700,color:viewWorkout.color,marginBottom:6}}>Workout Complete!</div>
            <div style={{fontSize:13,color:"var(--text2)",marginBottom:14}}>Amazing work! You crushed {viewWorkout.day}'s session 💪</div>
            <button className="btn-primary" onClick={()=>{ completeTask({id:`day${dayIdx}`,name:viewWorkout.focus,coins:viewWorkout.exercises.length*10}); }}>
              🪙 Claim +{viewWorkout.exercises.length*10} Coins
            </button>
          </div>
        )}

        {/* ── Streak ── */}
        <div style={{margin:"14px 16px 0"}}>
          <div className="streak-display">
            <span className="streak-fire">🔥</span>
            <span className="streak-num">{user.streak}</span>
            <span className="streak-label">day streak — keep it up!</span>
          </div>
        </div>
      </div>
    );
  };

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
            <div className="profile-avatar-lg" style={{overflow:"hidden",padding:0}}>{cu.photo?<img src={cu.photo} alt={cu.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:20}}/>:(cu.gender==="Female"?"👩":"👨")}</div>
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
              <div style={{gridColumn:"span 2"}}><button className="btn-primary" onClick={()=>saveProfile(user.id,ld)}>Save Changes</button></div>
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

  const SettingsSection = () => {
    const [editUpi, setEditUpi] = useState(false);
    const [upiInput, setUpiInput] = useState(gymUpiId);
    const saveUpi = async () => {
      if (!upiInput.trim()) { showToast("❌ UPI ID cannot be empty"); return; }
      await setDoc(doc(db, "settings", "gym"), { upiId: upiInput.trim() });
      setGymUpiId(upiInput.trim());
      setEditUpi(false);
      showToast("✅ UPI ID updated!");
    };
    return (
      <div>
        <div style={{padding:"16px 16px 8px"}}><div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700}}>Settings</div></div>

        {/* UPI ID card for owner */}
        {role==="owner" && (
          <div className="card" style={{marginBottom:14}}>
            <div className="card-title">💳 Payment Settings</div>
            <div style={{marginBottom:8,fontSize:13,color:"var(--text2)"}}>Members will pay to this UPI ID</div>
            {editUpi ? (
              <div>
                <input
                  className="input-field"
                  value={upiInput}
                  onChange={e=>setUpiInput(e.target.value)}
                  placeholder="e.g. yourname@okaxis or 9876543210@ybl"
                  style={{marginBottom:10}}
                />
                <div style={{display:"flex",gap:8}}>
                  <button className="btn-success" style={{flex:1,padding:"10px"}} onClick={saveUpi}>✅ Save</button>
                  <button className="btn-secondary" style={{flex:1}} onClick={()=>{setEditUpi(false);setUpiInput(gymUpiId);}}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--bg2)",borderRadius:12,padding:"12px 14px",border:"1px solid var(--border)"}}>
                <div>
                  <div style={{fontSize:11,color:"var(--text3)",marginBottom:3}}>CURRENT UPI ID</div>
                  <div style={{fontSize:16,fontWeight:700,color:"var(--neon)",letterSpacing:0.5}}>{gymUpiId}</div>
                </div>
                <button className="btn-secondary" onClick={()=>setEditUpi(true)}>✏️ Edit</button>
              </div>
            )}
          </div>
        )}

        <div className="card">
          <div className="info-row"><span className="info-key">Account</span><span className="info-val">{user.name}</span></div>
          <div className="info-row"><span className="info-key">Role</span><span className="info-val">{role==="owner"?"👑 Owner":"👤 Member"}</span></div>
          <div className="info-row"><span className="info-key">Database</span><span className="info-val" style={{color:"var(--neon)"}}>🟢 Firebase</span></div>
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
  };

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
                <div className="member-avatar" style={{width:56,height:56,fontSize:28,overflow:"hidden",padding:0}}>{m.photo?<img src={m.photo} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:12}}/>:(m.gender==="Female"?"👩":"👨")}</div>
                <div><div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700}}>{m.name}</div><div className="text-sm text-muted">@{m.username}</div></div>
              </div>
              <span className={`badge-status badge-${(m.status||"unpaid").toLowerCase()}`}>{m.status}</span>
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
      <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setModal(null);setNewMemberPhoto(null);setNewMemberFeePaid(false);}}}>
        <div className="modal-sheet">
          <div className="modal-handle"/>
          <div className="modal-title">Add New Member</div>

          {/* ── Photo Picker ── */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20}}>
            <div style={{
              width:90,height:90,borderRadius:22,
              background: newMemberPhoto ? "transparent" : "linear-gradient(135deg,var(--bg3),var(--card2))",
              border:`2px dashed ${newMemberPhoto?"var(--neon)":"var(--border)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              overflow:"hidden",marginBottom:12,position:"relative",
              boxShadow: newMemberPhoto?"0 0 16px rgba(0,255,136,0.3)":"none",
              transition:"all 0.3s",
            }}>
              {newMemberPhoto
                ? <img src={newMemberPhoto} alt="member" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <span style={{fontSize:36}}>👤</span>
              }
              {newMemberPhoto && (
                <div onClick={()=>setNewMemberPhoto(null)} style={{position:"absolute",top:4,right:4,width:20,height:20,background:"var(--danger)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:11,fontWeight:700,color:"#fff"}}>✕</div>
              )}
            </div>
            <div style={{fontSize:12,color:"var(--text2)",marginBottom:10}}>{newMemberPhoto?"Photo added ✓":"Add member photo (optional)"}</div>
            <div style={{display:"flex",gap:10}}>
              {/* Camera */}
              <label style={{
                display:"flex",alignItems:"center",gap:6,
                padding:"9px 16px",borderRadius:10,cursor:"pointer",
                background:"rgba(0,212,255,0.1)",border:"1px solid rgba(0,212,255,0.3)",
                color:"var(--neon2)",fontSize:13,fontWeight:600,transition:"all 0.2s",
              }}>
                <span style={{fontSize:16}}>📷</span> Camera
                <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{
                  const file=e.target.files?.[0];
                  if(!file)return;
                  const reader=new FileReader();
                  reader.onload=ev=>setNewMemberPhoto(ev.target.result);
                  reader.readAsDataURL(file);
                  e.target.value="";
                }}/>
              </label>
              {/* Gallery */}
              <label style={{
                display:"flex",alignItems:"center",gap:6,
                padding:"9px 16px",borderRadius:10,cursor:"pointer",
                background:"rgba(0,255,136,0.1)",border:"1px solid rgba(0,255,136,0.3)",
                color:"var(--neon)",fontSize:13,fontWeight:600,transition:"all 0.2s",
              }}>
                <span style={{fontSize:16}}>🖼️</span> Gallery
                <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                  const file=e.target.files?.[0];
                  if(!file)return;
                  const reader=new FileReader();
                  reader.onload=ev=>setNewMemberPhoto(ev.target.result);
                  reader.readAsDataURL(file);
                  e.target.value="";
                }}/>
              </label>
            </div>
          </div>

          {["name","username","password"].map(f=>(
            <div key={f} className="input-group"><label className="input-label">{f.charAt(0).toUpperCase()+f.slice(1)}</label><input className="input-field" placeholder={`Enter ${f}`} type={f==="password"?"password":"text"} value={newMember[f]} onChange={e=>setNewMember(p=>({...p,[f]:e.target.value}))}/></div>
          ))}
          <div className="two-col">
            <div className="input-group" style={{margin:0}}><label className="input-label">Plan</label><select className="input-field" value={newMember.plan} onChange={e=>setNewMember(p=>({...p,plan:e.target.value}))}><option>Basic</option><option>Premium</option></select></div>
            <div className="input-group" style={{margin:0}}><label className="input-label">Monthly Fee</label><input className="input-field" value={newMember.fees} onChange={e=>setNewMember(p=>({...p,fees:e.target.value}))}/></div>
          </div>

          {/* ── Fee Paid Toggle ── */}
          <div style={{
            marginTop:18,padding:"16px",
            background: newMemberFeePaid ? "rgba(0,255,136,0.07)" : "rgba(255,68,68,0.06)",
            border: `1px solid ${newMemberFeePaid ? "rgba(0,255,136,0.3)" : "rgba(255,68,68,0.25)"}`,
            borderRadius:16, transition:"all 0.4s",
          }}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:3}}>
                  {newMemberFeePaid ? "💰 Fee Paid This Month" : "⏳ Fee Pending"}
                </div>
                <div style={{fontSize:11,color:"var(--text2)"}}>
                  {newMemberFeePaid
                    ? `₹${newMember.fees} — recorded as paid today`
                    : "Will be saved as unpaid / due today"}
                </div>
              </div>
              {/* Slider toggle */}
              <div
                onClick={()=>setNewMemberFeePaid(p=>!p)}
                style={{
                  width:54,height:28,borderRadius:14,cursor:"pointer",
                  background: newMemberFeePaid ? "var(--neon)" : "var(--bg3)",
                  border: `2px solid ${newMemberFeePaid ? "var(--neon)" : "var(--border)"}`,
                  position:"relative",transition:"all 0.35s",flexShrink:0,
                  boxShadow: newMemberFeePaid ? "0 0 14px rgba(0,255,136,0.5)" : "none",
                }}
              >
                <div style={{
                  position:"absolute",
                  top:2,
                  left: newMemberFeePaid ? "calc(100% - 22px)" : "2px",
                  width:20,height:20,borderRadius:"50%",
                  background: newMemberFeePaid ? "#000" : "var(--text3)",
                  transition:"left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.4)",
                }}/>
              </div>
            </div>

            {/* Status badge preview */}
            <div style={{marginTop:12,display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:11,color:"var(--text3)"}}>Status preview:</div>
              <div style={{
                padding:"3px 12px",borderRadius:20,fontSize:11,fontWeight:700,letterSpacing:0.5,
                background: newMemberFeePaid ? "rgba(0,255,136,0.15)" : "rgba(255,68,68,0.15)",
                color: newMemberFeePaid ? "var(--neon)" : "var(--danger)",
                border: `1px solid ${newMemberFeePaid ? "rgba(0,255,136,0.3)" : "rgba(255,68,68,0.3)"}`,
                transition:"all 0.3s",
              }}>
                {newMemberFeePaid ? "✓ PAID" : "⚠ UNPAID"}
              </div>
              {newMemberFeePaid && (
                <div style={{fontSize:11,color:"var(--text2)"}}>
                  Next due in 1 month
                </div>
              )}
            </div>
          </div>

          <button className="btn-primary" disabled={addingMember} style={{
            marginTop:16,
            opacity: addingMember ? 0.7 : 1,
            background: newMemberFeePaid
              ? "linear-gradient(135deg,var(--neon),var(--neon2))"
              : "linear-gradient(135deg,#ff6b35,#ff4444)",
            boxShadow: newMemberFeePaid
              ? "0 4px 20px rgba(0,255,136,0.35)"
              : "0 4px 20px rgba(255,68,68,0.3)",
          }} onClick={addMember}>
            {addingMember ? "⏳ Saving..." : newMemberFeePaid ? "✅ Add Member (Fee Paid)" : "➕ Add Member (Fee Pending)"}
          </button>
        </div>
      </div>
    );
    return null;
  };

  const ownerTabs = [{id:"dashboard",icon:"🏠",label:"Home"},{id:"members",icon:"👥",label:"Members"},{id:"analytics",icon:"📊",label:"Analytics"},{id:"aiplan",icon:"🥗",label:"Diet Plan"},{id:"settings",icon:"⚙️",label:"Settings"}];
  const memberTabs = [{id:"dashboard",icon:"🏠",label:"Home"},{id:"workout",icon:"💪",label:"Workout"},{id:"aiplan",icon:"🥗",label:"Diet Plan"},{id:"profile",icon:"👤",label:"Profile"},{id:"settings",icon:"⚙️",label:"Settings"}];
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

  const pageTitles = {dashboard:"CROSSFIT",members:"Members",analytics:"Analytics",aiplan:"Diet Plan",settings:"Settings",workout:"Workouts",profile:"Profile"};

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{css}</style>
      <div className="app-shell">
        <div className="app-header">
          <div className="header-logo">
            {/* Back button — shows on all screens except dashboard */}
            {activeTab !== "dashboard" ? (
              <div
                className="back-btn"
                onClick={()=>setActiveTab("dashboard")}
              >
                ‹
              </div>
            ) : (
              <div className="header-logo-icon">🏋️</div>
            )}
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
