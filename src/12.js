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
const OWNER = { username: "admin", password: "admin123", name: "Crossfit Admin", upiId: "8709024076@ybl" };

const MONTHLY_REVENUE = [
  { month: "Sep", revenue: 28000 }, { month: "Oct", revenue: 35000 },
  { month: "Nov", revenue: 42000 }, { month: "Dec", revenue: 38000 },
  { month: "Jan", revenue: 51000 }, { month: "Feb", revenue: 47000 },
];

const WORKOUT_PLANS = {
  beginner: {
    label:"Beginner", icon:"🌱", color:"#00ff88",
    desc:"Classic PPL split — chest, back, legs, shoulders, arms",
    schedule:{
      1:{day:"Monday",focus:"Chest 💪",color:"#00ff88",exercises:[
        {name:"Flat Bench Press",sets:"4 sets",reps:"8–12 reps",muscle:"Chest"},
        {name:"Incline Dumbbell Press",sets:"3 sets",reps:"10 reps",muscle:"Upper Chest"},
        {name:"Chest Fly (Dumbbell/Machine)",sets:"3 sets",reps:"12 reps",muscle:"Chest"},
        {name:"Pec Deck Machine",sets:"3 sets",reps:"12 reps",muscle:"Inner Chest"},
        {name:"Push-Ups",sets:"3 sets",reps:"Till failure",muscle:"Chest & Triceps"},
      ]},
      2:{day:"Tuesday",focus:"Back 🏋️",color:"#00d4ff",exercises:[
        {name:"Lat Pulldown",sets:"4 sets",reps:"10 reps",muscle:"Lats"},
        {name:"Seated Cable Row",sets:"3 sets",reps:"10 reps",muscle:"Mid Back"},
        {name:"One-Arm Dumbbell Row",sets:"3 sets",reps:"10 reps",muscle:"Lats"},
        {name:"Deadlift (Light)",sets:"3 sets",reps:"8 reps",muscle:"Full Back"},
        {name:"Straight Arm Pulldown",sets:"3 sets",reps:"12 reps",muscle:"Lats"},
      ]},
      3:{day:"Wednesday",focus:"Legs 🦵",color:"#ff4444",exercises:[
        {name:"Squats",sets:"4 sets",reps:"8–10 reps",muscle:"Quads & Glutes"},
        {name:"Leg Press",sets:"3 sets",reps:"10 reps",muscle:"Quads"},
        {name:"Leg Extension",sets:"3 sets",reps:"12 reps",muscle:"Quads"},
        {name:"Leg Curl",sets:"3 sets",reps:"12 reps",muscle:"Hamstrings"},
        {name:"Calf Raises",sets:"4 sets",reps:"15 reps",muscle:"Calves"},
      ]},
      4:{day:"Thursday",focus:"Rest / Active Recovery 😌",color:"#8b5cf6",exercises:[
        {name:"Walking",sets:"1 set",reps:"15–20 min",muscle:"Cardio"},
        {name:"Full Body Stretching",sets:"10 min",reps:"Full body",muscle:"Flexibility"},
        {name:"Mobility Exercises",sets:"2 sets",reps:"10 reps each",muscle:"Joints"},
        {name:"Foam Rolling",sets:"10 min",reps:"Full body",muscle:"Recovery"},
        {name:"Light Yoga",sets:"15 min",reps:"Full flow",muscle:"Mind & Body"},
      ]},
      5:{day:"Friday",focus:"Shoulders 🏋️‍♂️",color:"#ffd700",exercises:[
        {name:"Shoulder Press",sets:"4 sets",reps:"10 reps",muscle:"All Delts"},
        {name:"Lateral Raises",sets:"3 sets",reps:"12 reps",muscle:"Side Delts"},
        {name:"Front Raises",sets:"3 sets",reps:"12 reps",muscle:"Front Delts"},
        {name:"Rear Delt Fly",sets:"3 sets",reps:"12 reps",muscle:"Rear Delts"},
        {name:"Shrugs",sets:"4 sets",reps:"12 reps",muscle:"Traps"},
      ]},
      6:{day:"Saturday",focus:"Arms 💪 (Biceps + Triceps)",color:"#ff6b35",exercises:[
        {name:"Barbell Curl",sets:"3 sets",reps:"10 reps",muscle:"Biceps"},
        {name:"Hammer Curl",sets:"3 sets",reps:"12 reps",muscle:"Brachialis"},
        {name:"Concentration Curl",sets:"3 sets",reps:"10 reps",muscle:"Biceps Peak"},
        {name:"Triceps Pushdown",sets:"3 sets",reps:"12 reps",muscle:"Triceps"},
        {name:"Overhead Triceps Extension",sets:"3 sets",reps:"10 reps",muscle:"Triceps Long Head"},
      ]},
      0:{day:"Sunday",focus:"Abs + Rest 🧘 (Optional)",color:"#8b5cf6",exercises:[
        {name:"Plank",sets:"3 sets",reps:"30–60 sec",muscle:"Core"},
        {name:"Leg Raises",sets:"3 sets",reps:"12 reps",muscle:"Lower Abs"},
        {name:"Crunches",sets:"3 sets",reps:"15 reps",muscle:"Abs"},
        {name:"Russian Twists",sets:"3 sets",reps:"20 reps",muscle:"Obliques"},
        {name:"Light Stretching",sets:"10 min",reps:"Full body",muscle:"Cool Down"},
      ]},
    }
  },
  intermediate:{
    label:"Intermediate", icon:"🔥", color:"#ff6b35",
    desc:"High volume PPL split — compound + isolation, progressive overload",
    schedule:{
      1:{day:"Monday",focus:"Chest 💪",color:"#00ff88",exercises:[
        {name:"Barbell Bench Press",sets:"4 sets",reps:"6–10 reps",muscle:"Chest"},
        {name:"Incline Dumbbell Press",sets:"4 sets",reps:"8–10 reps",muscle:"Upper Chest"},
        {name:"Decline Bench Press",sets:"3 sets",reps:"8–10 reps",muscle:"Lower Chest"},
        {name:"Chest Fly (Dumbbell)",sets:"3 sets",reps:"12 reps",muscle:"Chest"},
        {name:"Cable Fly (High to Low)",sets:"3 sets",reps:"12 reps",muscle:"Inner Chest"},
        {name:"Pec Deck Machine",sets:"3 sets",reps:"12 reps",muscle:"Inner Chest"},
        {name:"Push-Ups (Weighted/Normal)",sets:"3 sets",reps:"Till failure",muscle:"Chest & Triceps"},
        {name:"Chest Dips",sets:"3 sets",reps:"10–12 reps",muscle:"Lower Chest"},
      ]},
      2:{day:"Tuesday",focus:"Back 🏋️",color:"#00d4ff",exercises:[
        {name:"Deadlift",sets:"4 sets",reps:"5–8 reps",muscle:"Full Posterior Chain"},
        {name:"Pull-Ups",sets:"4 sets",reps:"Till failure",muscle:"Lats & Biceps"},
        {name:"Lat Pulldown",sets:"3 sets",reps:"10 reps",muscle:"Lats"},
        {name:"Seated Cable Row",sets:"3 sets",reps:"10 reps",muscle:"Mid Back"},
        {name:"T-Bar Row",sets:"3 sets",reps:"10 reps",muscle:"Back Thickness"},
        {name:"One-Arm Dumbbell Row",sets:"3 sets",reps:"10 reps",muscle:"Lats"},
        {name:"Straight Arm Pulldown",sets:"3 sets",reps:"12 reps",muscle:"Lats"},
        {name:"Face Pull",sets:"3 sets",reps:"12 reps",muscle:"Rear Delts & Rotators"},
      ]},
      3:{day:"Wednesday",focus:"Legs 🦵",color:"#ff4444",exercises:[
        {name:"Barbell Squat",sets:"4 sets",reps:"6–10 reps",muscle:"Quads & Glutes"},
        {name:"Leg Press",sets:"4 sets",reps:"10 reps",muscle:"Quads"},
        {name:"Walking Lunges",sets:"3 sets",reps:"12 each leg",muscle:"Legs"},
        {name:"Leg Extension",sets:"3 sets",reps:"12 reps",muscle:"Quads"},
        {name:"Leg Curl",sets:"3 sets",reps:"12 reps",muscle:"Hamstrings"},
        {name:"Romanian Deadlift",sets:"3 sets",reps:"10 reps",muscle:"Hamstrings"},
        {name:"Standing Calf Raises",sets:"4 sets",reps:"15 reps",muscle:"Calves"},
        {name:"Seated Calf Raises",sets:"4 sets",reps:"15 reps",muscle:"Soleus"},
      ]},
      4:{day:"Thursday",focus:"Rest / Active Recovery 😌",color:"#8b5cf6",exercises:[
        {name:"Light Cardio (Walking/Cycling)",sets:"1 set",reps:"20 min",muscle:"Cardio"},
        {name:"Full Body Stretching",sets:"10 min",reps:"Full body",muscle:"Flexibility"},
        {name:"Mobility Work",sets:"2 sets",reps:"10 each",muscle:"Joints"},
        {name:"Foam Rolling",sets:"10 min",reps:"Full body",muscle:"Recovery"},
        {name:"Core Activation (Light Plank)",sets:"3 sets",reps:"20 sec",muscle:"Core"},
        {name:"Yoga (Optional)",sets:"15 min",reps:"Full flow",muscle:"Mind & Body"},
        {name:"Breathing Exercises",sets:"5 min",reps:"Box breathing",muscle:"Mind"},
        {name:"Relaxation",sets:"10 min",reps:"Full rest",muscle:"Recovery"},
      ]},
      5:{day:"Friday",focus:"Shoulders 🏋️‍♂️",color:"#ffd700",exercises:[
        {name:"Barbell Shoulder Press",sets:"4 sets",reps:"6–10 reps",muscle:"All Delts"},
        {name:"Dumbbell Shoulder Press",sets:"3 sets",reps:"10 reps",muscle:"All Delts"},
        {name:"Lateral Raises",sets:"4 sets",reps:"12 reps",muscle:"Side Delts"},
        {name:"Front Raises",sets:"3 sets",reps:"12 reps",muscle:"Front Delts"},
        {name:"Rear Delt Fly",sets:"3 sets",reps:"12 reps",muscle:"Rear Delts"},
        {name:"Arnold Press",sets:"3 sets",reps:"10 reps",muscle:"Full Shoulder"},
        {name:"Upright Row",sets:"3 sets",reps:"10 reps",muscle:"Side Delts & Traps"},
        {name:"Shrugs",sets:"4 sets",reps:"12 reps",muscle:"Traps"},
      ]},
      6:{day:"Saturday",focus:"Arms 💪 (Biceps + Triceps)",color:"#ff6b35",exercises:[
        {name:"Barbell Curl",sets:"4 sets",reps:"10 reps",muscle:"Biceps"},
        {name:"EZ Bar Curl",sets:"3 sets",reps:"10 reps",muscle:"Biceps"},
        {name:"Hammer Curl",sets:"3 sets",reps:"12 reps",muscle:"Brachialis"},
        {name:"Concentration Curl",sets:"3 sets",reps:"10 reps",muscle:"Biceps Peak"},
        {name:"Close-Grip Bench Press",sets:"4 sets",reps:"8 reps",muscle:"Triceps"},
        {name:"Triceps Pushdown",sets:"3 sets",reps:"12 reps",muscle:"Triceps Lateral"},
        {name:"Overhead Triceps Extension",sets:"3 sets",reps:"10 reps",muscle:"Triceps Long Head"},
        {name:"Dips",sets:"3 sets",reps:"10–12 reps",muscle:"Triceps & Chest"},
      ]},
      0:{day:"Sunday",focus:"Abs + Rest 🧘 (Optional)",color:"#8b5cf6",exercises:[
        {name:"Hanging Leg Raises",sets:"3 sets",reps:"12 reps",muscle:"Lower Abs"},
        {name:"Plank",sets:"3 sets",reps:"45–60 sec",muscle:"Core"},
        {name:"Cable Crunch",sets:"3 sets",reps:"15 reps",muscle:"Abs"},
        {name:"Russian Twists",sets:"3 sets",reps:"20 reps",muscle:"Obliques"},
        {name:"Mountain Climbers",sets:"3 sets",reps:"20 reps",muscle:"Core & Cardio"},
        {name:"Bicycle Crunch",sets:"3 sets",reps:"15 reps",muscle:"Abs & Obliques"},
        {name:"Ab Wheel Rollout",sets:"3 sets",reps:"10 reps",muscle:"Full Core"},
      ]},
    }
  },
  professional:{
    label:"Professional", icon:"⚡", color:"#ffd700",
    desc:"Dual muscle groups, high volume, max intensity",
    schedule:{
      1:{day:"Monday",focus:"Chest + Triceps 💪🔥",color:"#00ff88",exercises:[
        {name:"Barbell Bench Press",     sets:"4 sets", reps:"6–8 reps",   muscle:"Chest"},
        {name:"Incline Dumbbell Press",  sets:"4 sets", reps:"8–10 reps",  muscle:"Upper Chest"},
        {name:"Decline Bench Press",     sets:"3 sets", reps:"8–10 reps",  muscle:"Lower Chest"},
        {name:"Cable Fly (High to Low)", sets:"3 sets", reps:"12 reps",    muscle:"Chest Isolation"},
        {name:"Pec Deck Machine",        sets:"3 sets", reps:"12 reps",    muscle:"Inner Chest"},
        {name:"Close-Grip Bench Press",  sets:"4 sets", reps:"6–8 reps",   muscle:"Triceps"},
        {name:"Skull Crushers (EZ Bar)", sets:"3 sets", reps:"10 reps",    muscle:"Triceps Long Head"},
        {name:"Triceps Pushdown",        sets:"3 sets", reps:"12 reps",    muscle:"Triceps Lateral"},
        {name:"Overhead Dumbbell Extension",sets:"3 sets",reps:"10 reps",  muscle:"Triceps Long Head"},
        {name:"Dips (Weighted)",         sets:"3 sets", reps:"10–12 reps", muscle:"Triceps & Chest"},
      ]},
      2:{day:"Tuesday",focus:"Back + Biceps 🏋️💥",color:"#00d4ff",exercises:[
        {name:"Deadlift",            sets:"4 sets", reps:"5–6 reps",   muscle:"Full Posterior Chain"},
        {name:"Pull-Ups",            sets:"4 sets", reps:"Till failure",muscle:"Lats & Biceps"},
        {name:"Lat Pulldown",        sets:"3 sets", reps:"10 reps",    muscle:"Lats"},
        {name:"T-Bar Row",           sets:"3 sets", reps:"10 reps",    muscle:"Back Thickness"},
        {name:"Seated Cable Row",    sets:"3 sets", reps:"10 reps",    muscle:"Mid Back"},
        {name:"Barbell Curl",        sets:"4 sets", reps:"8–10 reps",  muscle:"Biceps"},
        {name:"EZ Bar Curl",         sets:"3 sets", reps:"10 reps",    muscle:"Biceps"},
        {name:"Hammer Curl",         sets:"3 sets", reps:"12 reps",    muscle:"Brachialis"},
        {name:"Preacher Curl",       sets:"3 sets", reps:"10 reps",    muscle:"Biceps Peak"},
        {name:"Concentration Curl",  sets:"3 sets", reps:"10 reps",    muscle:"Biceps Isolation"},
      ]},
      3:{day:"Wednesday",focus:"Legs (Quads + Hams + Calves) 🦵🔥",color:"#ff4444",exercises:[
        {name:"Barbell Squat",       sets:"4 sets", reps:"6–8 reps",    muscle:"Quads & Glutes"},
        {name:"Leg Press",           sets:"4 sets", reps:"10 reps",     muscle:"Quads"},
        {name:"Walking Lunges",      sets:"3 sets", reps:"12 each leg", muscle:"Quads & Glutes"},
        {name:"Leg Extension",       sets:"3 sets", reps:"12 reps",     muscle:"Quad Isolation"},
        {name:"Romanian Deadlift",   sets:"4 sets", reps:"8–10 reps",   muscle:"Hamstrings"},
        {name:"Lying Leg Curl",      sets:"3 sets", reps:"12 reps",     muscle:"Hamstrings"},
        {name:"Seated Leg Curl",     sets:"3 sets", reps:"12 reps",     muscle:"Hamstrings"},
        {name:"Standing Calf Raises",sets:"4 sets", reps:"15 reps",     muscle:"Calves"},
        {name:"Seated Calf Raises",  sets:"4 sets", reps:"15 reps",     muscle:"Soleus"},
        {name:"Donkey Calf Raises",  sets:"3 sets", reps:"15 reps",     muscle:"Calves"},
      ]},
      4:{day:"Thursday",focus:"Rest / Recovery 😌",color:"#8b5cf6",exercises:[
        {name:"Light Cardio",         sets:"1 set",  reps:"20 min",     muscle:"Cardio"},
        {name:"Full Body Stretching", sets:"15 min", reps:"Full body",  muscle:"Flexibility"},
        {name:"Foam Rolling",         sets:"15 min", reps:"Full body",  muscle:"Recovery"},
        {name:"Mobility Work",        sets:"2 sets", reps:"10 each",    muscle:"Joints"},
      ]},
      5:{day:"Friday",focus:"Shoulders + Abs 🎯🔥",color:"#ffd700",exercises:[
        {name:"Barbell Shoulder Press",  sets:"4 sets", reps:"6–8 reps",  muscle:"All Delts"},
        {name:"Dumbbell Shoulder Press", sets:"3 sets", reps:"10 reps",   muscle:"All Delts"},
        {name:"Lateral Raises",          sets:"4 sets", reps:"12 reps",   muscle:"Side Delts"},
        {name:"Rear Delt Fly",           sets:"3 sets", reps:"12 reps",   muscle:"Rear Delts"},
        {name:"Arnold Press",            sets:"3 sets", reps:"10 reps",   muscle:"Full Shoulder"},
        {name:"Hanging Leg Raises",      sets:"3 sets", reps:"12 reps",   muscle:"Lower Abs"},
        {name:"Cable Crunch",            sets:"3 sets", reps:"15 reps",   muscle:"Abs"},
        {name:"Plank",                   sets:"3 sets", reps:"60 sec",    muscle:"Core"},
        {name:"Russian Twists",          sets:"3 sets", reps:"20 reps",   muscle:"Obliques"},
        {name:"Ab Wheel Rollout",        sets:"3 sets", reps:"10 reps",   muscle:"Full Core"},
      ]},
      6:{day:"Saturday",focus:"Arms – Heavy Pump Day 💪⚡",color:"#ff6b35",exercises:[
        {name:"Barbell Curl",              sets:"4 sets", reps:"8 reps",    muscle:"Biceps"},
        {name:"Incline Dumbbell Curl",     sets:"3 sets", reps:"10 reps",   muscle:"Biceps Stretch"},
        {name:"Hammer Curl",               sets:"3 sets", reps:"12 reps",   muscle:"Brachialis"},
        {name:"Preacher Curl",             sets:"3 sets", reps:"10 reps",   muscle:"Biceps Peak"},
        {name:"Cable Curl",                sets:"3 sets", reps:"12 reps",   muscle:"Biceps"},
        {name:"Close-Grip Bench Press",    sets:"4 sets", reps:"8 reps",    muscle:"Triceps"},
        {name:"Skull Crushers",            sets:"3 sets", reps:"10 reps",   muscle:"Triceps Long Head"},
        {name:"Rope Pushdown",             sets:"3 sets", reps:"12 reps",   muscle:"Triceps Lateral"},
        {name:"Overhead Cable Extension",  sets:"3 sets", reps:"10 reps",   muscle:"Triceps Long Head"},
        {name:"Bench Dips",                sets:"3 sets", reps:"12 reps",   muscle:"Triceps"},
      ]},
      0:{day:"Sunday",focus:"Full Recovery 🧘",color:"#8b5cf6",exercises:[
        {name:"Foam Rolling",         sets:"20 min", reps:"Full body",   muscle:"Myofascial Release"},
        {name:"Light Yoga",           sets:"30 min", reps:"Full flow",   muscle:"Flexibility"},
        {name:"Meditation",           sets:"1 set",  reps:"15 min",      muscle:"CNS Recovery"},
        {name:"Hip Mobility Drills",  sets:"3 sets", reps:"10 each",     muscle:"Hips"},
        {name:"Deep Tissue Stretch",  sets:"1 set",  reps:"15 min",      muscle:"Full Body"},
      ]},
    }
  }
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
  [data-theme="light"] {
    --bg: #f0f2f5;
    --bg2: #ffffff;
    --bg3: #e8eaed;
    --card: #ffffff;
    --card2: #f5f7fa;
    --border: #d0d5dd;
    --neon: #00aa55;
    --neon2: #0088cc;
    --neon3: #e05a20;
    --gold: #cc9900;
    --purple: #6d45d4;
    --text: #111827;
    --text2: #4b5563;
    --text3: #9ca3af;
    --danger: #dc2626;
    --success: #16a34a;
    --warning: #d97706;
    --paid: #16a34a;
    --unpaid: #dc2626;
  }

  body { font-family: 'Exo 2', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; }
  h1,h2,h3,h4,h5,h6 { font-family: 'Rajdhani', sans-serif; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--neon); border-radius: 2px; }

  .app-shell {
    max-width: 420px; height: 100vh; margin: 0 auto;
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
    flex-shrink: 0; z-index: 100; backdrop-filter: blur(10px);
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

  .bottom-nav {
    flex-shrink: 0; background: var(--bg2);
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

  .content { flex: 1; overflow-y: auto; overflow-x: hidden; padding-bottom: 10px; -webkit-overflow-scrolling: touch; }

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
    background: #000; gap: 0; position: relative; overflow: hidden;
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
    dietType: "veg",
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("diet");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

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
      const times = ["Breakfast (7:00 AM)","Mid-Morning Snack (10:00 AM)","Lunch (1:00 PM)","Pre-Workout (4:30 PM)","Dinner (7:30 PM)","Night / Post-Workout (9:30 PM)"];
      const icons = ["🌅","🍎","☀️","⚡","🌙","🌟"];
      const isVeg = form.dietType === "veg";

      // ── Dynamic diet generator — unique plan based on weight, kcal, goal, dietType ──
      const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];


      // Weight-scaled quantities
      const wScaled = (base, unit) => {
        const scale = w < 60 ? 0.8 : w < 80 ? 1.0 : w < 100 ? 1.2 : 1.4;
        const val = Math.round(base * scale);
        return `${val}${unit}`;
      };
      const eggsCount = w < 60 ? 2 : w < 80 ? 3 : w < 100 ? 4 : 5;
      const rotiCount = w < 60 ? 2 : w < 80 ? 3 : w < 100 ? 4 : 4;
      const riceAmt   = w < 60 ? "½ cup" : w < 80 ? "¾ cup" : w < 100 ? "1 cup" : "1.5 cups";

      const chickenG  = Math.min(Math.max(Math.round(w * (goal==="Muscle Gain" ? 2.5 : 1.8)), 100), 350);
      const paneerG   = Math.min(Math.max(Math.round(w * (goal==="Muscle Gain" ? 3.0 : 2.0)), 100), 300);
      const nutsCount = w < 70 ? 8 : w < 90 ? 12 : 15;
      const protShake = goal==="Muscle Gain" ? "1.5 scoops" : "1 scoop";

      // ── VEG meal pools by meal slot ──
      const VEG_POOLS = {
        breakfast: [
          `Moong dal chilla (${wScaled(3,"pieces")}) + mint chutney + 1 glass warm milk`,
          `Besan chilla (${wScaled(2,"pieces")}) + curd (${wScaled(150,"ml")}) + green tea`,
          `Poha with peas & peanuts (${wScaled(80,"g")}) + ${nutsCount} almonds + green tea`,
          `Oats porridge (${wScaled(70,"g")}) + banana + honey + ${nutsCount} cashews`,
          `Paneer bhurji (${paneerG}g) + ${rotiCount-1} whole-wheat rotis + green tea`,
          `Vegetable upma (${wScaled(80,"g")}) + coconut chutney + 1 boiled egg (if semi-veg)`,
          `Idli (${Math.round((w/20))} pieces) + sambar (${wScaled(150,"ml")}) + coconut chutney`,
          `Multigrain toast (${rotiCount-1} slices) + peanut butter (${wScaled(2,"tbsp")}) + banana`,
          `Dalia porridge (${wScaled(80,"g")}) + ${nutsCount} mixed nuts + 1 glass milk`,
          `Rajgira paratha (${rotiCount-1} nos) + low-fat curd (${wScaled(150,"ml")})`,
        ],
        midsnack: [
          `${nutsCount} mixed nuts + 1 seasonal fruit (apple/guava/pear)`,
          `Roasted chana (${wScaled(40,"g")}) + 1 banana`,
          `Low-fat paneer (${wScaled(80,"g")}) + cucumber slices`,
          `Greek yogurt (${wScaled(150,"ml")}) + 1 tbsp chia seeds + berries`,
          `Sprouts chaat (${wScaled(80,"g")}) + lemon + chaat masala`,
          `Makhana (${wScaled(30,"g")}) + ${nutsCount} almonds`,
          `1 banana + ${wScaled(1,"tbsp")} peanut butter`,
          `Coconut water (250ml) + ${nutsCount} dates`,
          `Buttermilk (${wScaled(250,"ml")}) + roasted flaxseeds`,
          `Fruit smoothie (banana+milk ${wScaled(200,"ml")}) + ${nutsCount} soaked almonds`,
        ],
        lunch: [
          `Dal tadka (${wScaled(1,"cup")}) + ${riceAmt} brown rice + paneer sabzi (${paneerG}g) + salad`,
          `Rajma curry (${wScaled(1,"cup")}) + ${riceAmt} rice + cucumber raita + salad`,
          `Chhole (${wScaled(1,"cup")}) + ${rotiCount} rotis + onion-tomato salad + curd`,
          `Soya chunk curry (${paneerG}g) + ${riceAmt} rice + mixed vegetable sabzi`,
          `Palak paneer (${paneerG}g) + ${rotiCount} rotis + dal soup + salad`,
          `Tofu stir-fry (${paneerG}g) + ${riceAmt} brown rice + steamed broccoli`,
          `Aloo gobi sabzi + ${rotiCount} rotis + moong dal + curd (${wScaled(150,"ml")})`,
          `Mixed dal khichdi (${wScaled(1.5,"cups")}) + curd + pickle + papad`,
          `Paneer tikka (${paneerG}g) + ${rotiCount-1} rotis + mint curd + salad`,
          `Lobia curry (${wScaled(1,"cup")}) + ${riceAmt} jeera rice + raita`,
        ],
        preworkout: [
          `Banana + ${wScaled(1,"tbsp")} peanut butter`,
          `Dates (${Math.round(w/15)} nos) + ${nutsCount} almonds`,
          `Whole-wheat bread (${rotiCount-2} slices) + peanut butter + honey`,
          `Mango smoothie (${wScaled(200,"ml")}) + ${nutsCount} cashews`,
          `Oats energy bar (${wScaled(1,"nos")}) + coconut water`,
          `Poha (${wScaled(50,"g")}) + 1 fruit`,
          `Rice cakes (${rotiCount-2} nos) + almond butter`,
          `Banana protein shake (${protShake} veg protein + milk ${wScaled(200,"ml")})`,
        ],
        dinner: [
          `Palak tofu (${paneerG}g) + ${rotiCount-1} rotis + dal soup + salad`,
          `Paneer curry (${paneerG}g) + ${rotiCount} rotis + curd + salad`,
          `Moong dal + ${riceAmt} rice + vegetable sabzi + raita`,
          `Tofu tikka masala (${paneerG}g) + ${rotiCount-1} rotis + salad`,
          `Rajma + ${rotiCount-1} rotis + curd + onion salad`,
          `Mixed vegetable curry + ${rotiCount} rotis + dal + curd`,
          `Quinoa pulao (${wScaled(80,"g")}) + paneer (${wScaled(100,"g")}) + raita`,
          `Soya keema (${paneerG}g) + ${rotiCount-1} rotis + dal + salad`,
          `Chhole tikki (${wScaled(2,"tikki")}) + mint curd + salad`,
          `Stuffed paneer paratha (${rotiCount-1} nos) + curd + salad`,
        ],
        night: [
          `Warm turmeric milk (${wScaled(250,"ml")}) + ${nutsCount} soaked almonds`,
          `Low-fat curd (${wScaled(150,"ml")}) + 1 tsp honey`,
          `Casein protein (1 scoop) + warm water`,
          `Chamomile tea + ${wScaled(5,"walnuts")}`,
          `Milk (${wScaled(200,"ml")}) + 1 tsp ashwagandha powder`,
          `Greek yogurt (${wScaled(100,"g")}) + chia seeds (1 tsp)`,
        ],
      };

      // ── NON-VEG meal pools ──
      const NONVEG_POOLS = {
        breakfast: [
          `${eggsCount} egg omelette (spinach + mushroom) + ${rotiCount-2} whole-wheat toast + black coffee`,
          `${eggsCount} boiled eggs + poha (${wScaled(60,"g")}) + green tea`,
          `Egg bhurji (${eggsCount} eggs) + ${rotiCount-1} rotis + 1 glass milk`,
          `${eggsCount-1} whole eggs + 1 banana + oats (${wScaled(60,"g")}) smoothie`,
          `Chicken keema paratha (${rotiCount-1} nos) + curd (${wScaled(150,"ml")})`,
          `Omelette sandwich (${eggsCount-1} eggs) + multigrain bread + black coffee`,
          `${eggsCount} boiled eggs + avocado (if available) + multigrain toast`,
          `Tuna (${wScaled(80,"g")}) + ${rotiCount-2} toast + ${nutsCount} almonds`,
          `Chicken sandwich (${Math.round(chickenG*0.6)}g) + multigrain bread + green tea`,
          `Egg white omelette (${eggsCount} whites) + sautéed veggies + black coffee`,
        ],
        midsnack: [
          `${nutsCount} mixed nuts + 1 boiled egg + 1 fruit`,
          `Greek yogurt (${wScaled(150,"ml")}) + ${nutsCount} almonds`,
          `Chicken jerky (${wScaled(40,"g")}) + 1 apple`,
          `Hard-boiled ${eggsCount-2} eggs + cucumber slices`,
          `Tuna (${wScaled(60,"g")}) on rice cakes (${rotiCount-3} nos)`,
          `Cottage cheese (${wScaled(100,"g")}) + berries`,
          `Whey protein (${protShake}) + ${nutsCount} cashews`,
          `1 banana + ${wScaled(1,"tbsp")} peanut butter + ${eggsCount-3} boiled eggs`,
          `Sprouts chaat (${wScaled(60,"g")}) + ${eggsCount-3} boiled egg whites`,
          `Coconut water + ${nutsCount} almonds + 1 boiled egg`,
        ],
        lunch: [
          `Grilled chicken breast (${chickenG}g) + ${riceAmt} brown rice + salad + curd`,
          `Chicken curry (${chickenG}g) + ${rotiCount} rotis + dal + salad`,
          `Fish curry (${chickenG}g) + ${riceAmt} steamed rice + vegetable sabzi`,
          `Egg curry (${eggsCount} eggs) + ${riceAmt} rice + salad + raita`,
          `Mutton curry (${Math.round(chickenG*0.8)}g) + ${rotiCount-1} rotis + dal + salad`,
          `Prawn masala (${chickenG}g) + ${riceAmt} rice + cucumber salad`,
          `Baked salmon (${chickenG}g) + ${riceAmt} quinoa + steamed broccoli`,
          `Chicken biryani (${wScaled(1.5,"cups")}) + raita + salad`,
          `Egg biryani (${eggsCount-1} eggs) + raita + onion salad`,
          `Grilled fish (${chickenG}g) + ${rotiCount-1} rotis + vegetable sabzi + curd`,
        ],
        preworkout: [
          `Banana + ${wScaled(1,"tbsp")} peanut butter + ${eggsCount-3} boiled egg whites`,
          `Whey protein (${protShake}) + banana shake`,
          `Dates (${Math.round(w/15)} nos) + ${nutsCount} almonds`,
          `Chicken breast (${Math.round(chickenG*0.5)}g) + rice cakes (${rotiCount-3} nos)`,
          `Energy bar + ${eggsCount-3} boiled eggs`,
          `Oats (${wScaled(50,"g")}) + protein shake (${protShake})`,
          `Rice cakes (${rotiCount-2} nos) + almond butter + honey`,
          `Banana + whey (${protShake}) + milk (${wScaled(200,"ml")})`,
        ],
        dinner: [
          `Grilled chicken (${chickenG}g) + ${rotiCount-1} rotis + dal + salad`,
          `Baked fish (${chickenG}g) + ${riceAmt} rice + stir-fried veggies`,
          `Chicken stir-fry (${chickenG}g) + ${rotiCount-1} rotis + curd`,
          `Egg curry (${eggsCount-1} eggs) + ${rotiCount} rotis + salad`,
          `Prawn curry (${Math.round(chickenG*0.9)}g) + ${riceAmt} rice + salad`,
          `Mutton soup (${Math.round(chickenG*0.7)}g) + ${rotiCount-1} rotis + salad`,
          `Chicken + vegetable soup + ${rotiCount-2} rotis`,
          `Grilled salmon (${chickenG}g) + steamed rice (${riceAmt}) + salad`,
          `Keema (${chickenG}g) + ${rotiCount-1} rotis + raita`,
          `Fish tikka (${chickenG}g) + mint curd + salad + ${rotiCount-2} rotis`,
        ],
        night: [
          `Casein protein (1 scoop) + warm water or milk`,
          `Warm milk (${wScaled(250,"ml")}) + ${nutsCount} soaked almonds`,
          `Greek yogurt (${wScaled(150,"ml")}) + chia seeds`,
          `${eggsCount-3} boiled egg whites + warm turmeric milk`,
          `Cottage cheese (${wScaled(100,"g")}) + 1 tsp honey`,
          `Warm chicken broth (${wScaled(200,"ml")}) + ${nutsCount} walnuts`,
        ],
      };

      const POOLS = isVeg ? VEG_POOLS : NONVEG_POOLS;

      // Protein targets per meal slot based on goal + weight

      // Build 7 unique daily plans (each day picks different random meals)
      // ── 7 day structured diet plans ──────────────────────────────────────────
      // Each day has a different nutritional focus based on goal + day of week.
      // Day focus adjusts calorie split & food selection (high-carb on workout days,
      // lower-carb on rest days, refeed on Saturday, light on Sunday).

      const DAY_FOCUS = {
        "Fat Loss": [
          { label:"Rest & Detox",    kcalMult:0.85, protMult:1.0,  carbFocus:"low",  note:"Lower carb rest day" },   // Sun
          { label:"High Protein",    kcalMult:1.00, protMult:1.2,  carbFocus:"mod",  note:"Strength training day" }, // Mon
          { label:"Cardio Fuel",     kcalMult:0.95, protMult:1.0,  carbFocus:"mod",  note:"Cardio + core day" },     // Tue
          { label:"Mid-Week Boost",  kcalMult:0.90, protMult:1.1,  carbFocus:"low",  note:"Intervals day" },         // Wed
          { label:"Power Day",       kcalMult:1.00, protMult:1.2,  carbFocus:"mod",  note:"Lower body strength" },   // Thu
          { label:"Cardio + HIIT",   kcalMult:0.95, protMult:1.0,  carbFocus:"mod",  note:"High intensity cardio" }, // Fri
          { label:"Refeed Day",      kcalMult:1.10, protMult:0.9,  carbFocus:"high", note:"Weekly carb refeed" },    // Sat
        ],
        "Muscle Gain": [
          { label:"Recovery",        kcalMult:0.95, protMult:1.0,  carbFocus:"mod",  note:"Active recovery" },       // Sun
          { label:"Chest Day Fuel",  kcalMult:1.10, protMult:1.3,  carbFocus:"high", note:"Chest + triceps" },       // Mon
          { label:"Back Day Fuel",   kcalMult:1.10, protMult:1.3,  carbFocus:"high", note:"Back + biceps" },         // Tue
          { label:"Mid-Week",        kcalMult:0.95, protMult:1.1,  carbFocus:"mod",  note:"Active recovery" },       // Wed
          { label:"Shoulder Fuel",   kcalMult:1.10, protMult:1.2,  carbFocus:"high", note:"Shoulders + arms" },      // Thu
          { label:"Leg Day Fuel",    kcalMult:1.15, protMult:1.2,  carbFocus:"high", note:"Legs — highest volume" }, // Fri
          { label:"Full Body",       kcalMult:1.05, protMult:1.1,  carbFocus:"mod",  note:"Full body power" },       // Sat
        ],
        "Maintenance": [
          { label:"Light Day",       kcalMult:0.90, protMult:0.9,  carbFocus:"mod",  note:"Rest & recharge" },       // Sun
          { label:"Active Day",      kcalMult:1.00, protMult:1.0,  carbFocus:"mod",  note:"Upper body" },            // Mon
          { label:"Cardio Day",      kcalMult:0.95, protMult:1.0,  carbFocus:"mod",  note:"Cardio + lower" },        // Tue
          { label:"Mid-Week",        kcalMult:0.95, protMult:1.0,  carbFocus:"mod",  note:"Rest or light" },         // Wed
          { label:"Strength Day",    kcalMult:1.00, protMult:1.0,  carbFocus:"mod",  note:"Full body" },             // Thu
          { label:"Active Day",      kcalMult:1.00, protMult:1.0,  carbFocus:"mod",  note:"Sport / fun" },           // Fri
          { label:"Social Day",      kcalMult:1.05, protMult:0.9,  carbFocus:"high", note:"Flexible eating day" },   // Sat
        ],
        "Endurance": [
          { label:"Rest Day",        kcalMult:0.85, protMult:0.9,  carbFocus:"low",  note:"Complete rest" },         // Sun
          { label:"Interval Fuel",   kcalMult:1.10, protMult:1.0,  carbFocus:"high", note:"Intervals day" },         // Mon
          { label:"Strength Fuel",   kcalMult:1.00, protMult:1.2,  carbFocus:"mod",  note:"Strength session" },      // Tue
          { label:"Recovery Run",    kcalMult:0.90, protMult:1.0,  carbFocus:"mod",  note:"Easy jog" },              // Wed
          { label:"Cross Train",     kcalMult:0.95, protMult:1.0,  carbFocus:"mod",  note:"Cycle / swim" },          // Thu
          { label:"Tempo Fuel",      kcalMult:1.10, protMult:1.0,  carbFocus:"high", note:"Tempo run" },             // Fri
          { label:"Long Run Carb",   kcalMult:1.20, protMult:0.9,  carbFocus:"high", note:"Long run — carb up!" },   // Sat
        ],
      };

      const focusList = DAY_FOCUS[goal] || DAY_FOCUS["Maintenance"];

      const buildDay = (dayIdx) => {
        const focus   = focusList[dayIdx];
        const dayKcal = Math.round(kcal * focus.kcalMult);
        const dayProt = Math.round(protG * focus.protMult);
        const dayFat  = Math.round(fatG);
        const dayCarb = Math.round((dayKcal - dayProt*4 - dayFat*9) / 4);

        // Adjust calorie split per meal slightly based on focus
        const dayKcalMultipliers = focus.carbFocus === "high"
          ? [0.22,0.08,0.32,0.12,0.22,0.04]   // more at lunch + pre-workout
          : focus.carbFocus === "low"
          ? [0.25,0.10,0.28,0.08,0.24,0.05]   // lighter overall
          : [0.25,0.10,0.30,0.10,0.20,0.05];  // balanced

        const dayKcalSplits = dayKcalMultipliers.map(p => Math.round(dayKcal * p));
        const dayProtSplits = [0.25,0.10,0.30,0.10,0.20,0.05].map(p => Math.round(dayProt * p));

        return {
          focus: focus.label,
          note:  focus.note,
          totalKcal: dayKcal,
          macros: { protein:`${dayProt}g`, carbs:`${dayCarb}g`, fat:`${dayFat}g` },
          meals: [
            { meal:times[0], icon:icons[0], food:rnd(POOLS.breakfast),  calories:dayKcalSplits[0], protein:`${dayProtSplits[0]}g` },
            { meal:times[1], icon:icons[1], food:rnd(POOLS.midsnack),   calories:dayKcalSplits[1], protein:`${dayProtSplits[1]}g` },
            { meal:times[2], icon:icons[2], food:rnd(POOLS.lunch),      calories:dayKcalSplits[2], protein:`${dayProtSplits[2]}g` },
            { meal:times[3], icon:icons[3], food:rnd(POOLS.preworkout), calories:dayKcalSplits[3], protein:`${dayProtSplits[3]}g` },
            { meal:times[4], icon:icons[4], food:rnd(POOLS.dinner),     calories:dayKcalSplits[4], protein:`${dayProtSplits[4]}g` },
            { meal:times[5], icon:icons[5], food:rnd(POOLS.night),      calories:dayKcalSplits[5], protein:`${dayProtSplits[5]}g` },
          ],
        };
      };
      const dietPlan = [0,1,2,3,4,5,6].map(i => buildDay(i));
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
        {/* Diet type selector */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,color:"var(--text2)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>🥗 Diet Preference</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              {v:"veg",   e:"🥦", label:"Vegetarian",    sub:"Plant-based meals",   color:"#00c850", glow:"rgba(0,200,80,0.15)"},
              {v:"nonveg",e:"🍗", label:"Non-Vegetarian",sub:"Includes meat & eggs", color:"#ff6b35", glow:"rgba(255,107,53,0.15)"},
            ].map(d=>{
              const sel = form.dietType === d.v;
              return (
                <button key={d.v} onClick={()=>set("dietType",d.v)} style={{
                  padding:"14px 10px",borderRadius:14,textAlign:"left",cursor:"pointer",
                  border:`2px solid ${sel ? d.color : "var(--border)"}`,
                  background: sel ? d.glow : "var(--bg2)",
                  transition:"all 0.2s",
                  boxShadow: sel ? `0 0 16px ${d.glow}` : "none",
                  display:"flex",alignItems:"center",gap:10,
                }}>
                  <div style={{
                    width:40,height:40,borderRadius:10,flexShrink:0,
                    background: sel ? `${d.color}22` : "var(--bg3)",
                    border:`1px solid ${sel ? d.color : "var(--border)"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:22,transition:"all 0.2s",
                  }}>{d.e}</div>
                  <div>
                    <div style={{fontFamily:"Exo 2,sans-serif",fontSize:13,fontWeight:700,color: sel ? d.color : "var(--text)",marginBottom:2}}>{d.label}</div>
                    <div style={{fontSize:10,color:"var(--text3)"}}>{d.sub}</div>
                  </div>
                  {sel && (
                    <div style={{
                      marginLeft:"auto",width:20,height:20,borderRadius:"50%",
                      background:d.color,display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:11,color:"#000",fontWeight:700,flexShrink:0,
                    }}>✓</div>
                  )}
                </button>
              );
            })}
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
            <div>
              {/* ── Day selector bar ── */}
              {(() => {
                const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
                const fullDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
                const todayIdx = new Date().getDay();
                const dayColors = ["#8b5cf6","#00ff88","#00d4ff","#ff6b35","#ffd700","#ff4444","#8b5cf6"];
                return (
                  <div>
                    {/* Horizontal scrollable day pills */}
                    <div style={{display:"flex",gap:8,padding:"0 16px 12px",overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
                      {days.map((d,i) => {
                        const isSel = selectedDay === i;
                        const isTod = i === todayIdx;
                        const dc = dayColors[i];
                        return (
                          <button key={i} onClick={()=>setSelectedDay(i)} style={{
                            flexShrink:0, padding:"8px 14px",
                            borderRadius:20, cursor:"pointer",
                            border:`2px solid ${isSel ? dc : "var(--border)"}`,
                            background: isSel ? `${dc}22` : "var(--card)",
                            color: isSel ? dc : "var(--text2)",
                            fontFamily:"Rajdhani,sans-serif",
                            fontSize:13, fontWeight:700,
                            transition:"all 0.2s",
                            boxShadow: isSel ? `0 0 14px ${dc}44` : "none",
                            position:"relative",
                          }}>
                            {d}
                            {isTod && (
                              <div style={{
                                position:"absolute", bottom:-2, left:"50%",
                                transform:"translateX(-50%)",
                                width:4, height:4, borderRadius:"50%",
                                background: isSel ? dc : "var(--neon)",
                                boxShadow:`0 0 5px ${isSel?dc:"var(--neon)"}`,
                              }}/>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Day banner with focus + macros */}
                    {(() => {
                      const day = plan.dietPlan[selectedDay];
                      return (
                        <div style={{
                          margin:"0 16px 12px",
                          background:`linear-gradient(135deg,${dayColors[selectedDay]}18,${dayColors[selectedDay]}06)`,
                          border:`1px solid ${dayColors[selectedDay]}44`,
                          borderRadius:16, padding:"14px 16px",
                        }}>
                          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                            <div>
                              <div style={{fontFamily:"Rajdhani",fontSize:18,fontWeight:700,color:dayColors[selectedDay]}}>{fullDays[selectedDay]} — {day.focus}</div>
                              <div style={{fontSize:11,color:"var(--text2)",marginTop:2}}>{selectedDay===todayIdx?"📍 Today · ":""}{day.note}</div>
                            </div>
                            <div style={{
                              background:dayColors[selectedDay]+"22",
                              border:`1px solid ${dayColors[selectedDay]}44`,
                              borderRadius:10,padding:"5px 10px",textAlign:"center",flexShrink:0,marginLeft:10,
                            }}>
                              <div style={{fontFamily:"Rajdhani",fontSize:18,fontWeight:700,color:dayColors[selectedDay]}}>{day.totalKcal}</div>
                              <div style={{fontSize:9,color:"var(--text3)",fontWeight:600}}>KCAL</div>
                            </div>
                          </div>
                          {/* Macro pills */}
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            {[
                              {label:"Protein",val:day.macros.protein,color:"#00d4ff"},
                              {label:"Carbs",  val:day.macros.carbs,  color:"#ffd700"},
                              {label:"Fat",    val:day.macros.fat,    color:"#ff6b35"},
                            ].map(macro=>(
                              <div key={macro.label} style={{
                                background:`${macro.color}15`,border:`1px solid ${macro.color}44`,
                                borderRadius:20,padding:"3px 10px",
                                fontSize:11,fontWeight:700,color:macro.color,
                              }}>{macro.label}: {macro.val}</div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Meals — vertical timeline */}
                    <div style={{margin:"0 16px 16px",position:"relative"}}>
                      <div style={{
                        position:"absolute", left:22, top:16, bottom:16,
                        width:2,
                        background:`linear-gradient(180deg,${dayColors[selectedDay]},${dayColors[selectedDay]}22)`,
                        borderRadius:2,
                      }}/>

                      {plan.dietPlan[selectedDay].meals.map((m,i)=>(
                        <div key={i} style={{
                          display:"flex", gap:12, alignItems:"flex-start",
                          marginBottom: i < 5 ? 0 : 0,
                          paddingBottom:12,
                          position:"relative",
                        }}>
                          {/* Circle on timeline */}
                          <div style={{
                            width:44, flexShrink:0,
                            display:"flex", flexDirection:"column", alignItems:"center",
                          }}>
                            <div style={{
                              width:18, height:18, borderRadius:"50%",
                              background:dayColors[selectedDay],
                              border:`3px solid var(--bg)`,
                              boxShadow:`0 0 8px ${dayColors[selectedDay]}88`,
                              display:"flex", alignItems:"center", justifyContent:"center",
                              fontSize:10, zIndex:1,
                            }}/>
                          </div>

                          {/* Meal card */}
                          <div style={{
                            flex:1, minWidth:0,
                            background:"var(--card)",
                            border:`1px solid ${dayColors[selectedDay]}22`,
                            borderRadius:14,
                            padding:"12px 14px",
                            marginBottom:8,
                          }}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                              <span style={{fontSize:18}}>{m.icon}</span>
                              <div>
                                <div style={{fontSize:11,fontWeight:700,color:dayColors[selectedDay],letterSpacing:0.5}}>{m.meal}</div>
                              </div>
                              <div style={{marginLeft:"auto",textAlign:"right"}}>
                                <div style={{fontSize:11,fontWeight:700,color:"var(--neon)"}}>🔥 {m.calories}</div>
                                <div style={{fontSize:10,color:"var(--text3)"}}>kcal</div>
                              </div>
                            </div>
                            <div style={{fontSize:13,fontWeight:600,color:"var(--text)",lineHeight:1.5,marginBottom:6}}>{m.food}</div>
                            <div style={{display:"flex",gap:6}}>
                              <span style={{fontSize:10,fontWeight:700,color:"var(--neon2)",background:"rgba(0,212,255,0.08)",borderRadius:5,padding:"2px 8px"}}>💪 {m.protein} protein</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
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

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("gymTheme") || "dark");
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
  const [newMember, setNewMember] = useState({ name: "", username: "", password: "", phone: "", plan: "Basic", fees: "1499", joinDate: new Date().toISOString().split("T")[0] });
  const [newMemberPhoto, setNewMemberPhoto] = useState(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [whatsappConfig, setWhatsappConfig] = useState({ accountSid: "", authToken: "", fromNumber: "whatsapp:+14155238886" });
  const [whatsappLogs, setWhatsappLogs] = useState([]);
  const [loginRole, setLoginRole] = useState("owner");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [legalPage, setLegalPage] = useState(null);
  const [memberMenu, setMemberMenu] = useState(null);        // id of member whose menu is open
  const [deleteConfirm, setDeleteConfirm] = useState(null);  // member object to delete
  const [editMemberData, setEditMemberData] = useState(null); // member object being edited

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
    return () => unsub();
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

  // ── WhatsApp Notification ─────────────────────────────────────────────────
  const sendWhatsAppWelcome = async (member) => {
    const { accountSid, authToken, fromNumber } = whatsappConfig;
    if (!accountSid || !authToken) {
      const log = { id: Date.now(), member: member.name, phone: member.phone, status: "skipped", reason: "Twilio credentials not configured", time: new Date().toLocaleTimeString() };
      setWhatsappLogs(p => [log, ...p.slice(0,49)]);
      return { success: false, reason: "not_configured" };
    }
    if (!member.phone) {
      const log = { id: Date.now(), member: member.name, phone: "—", status: "skipped", reason: "No phone number provided", time: new Date().toLocaleTimeString() };
      setWhatsappLogs(p => [log, ...p.slice(0,49)]);
      return { success: false, reason: "no_phone" };
    }

    const gymName = "Crossfit Gym";
    const toNumber = `whatsapp:+91${member.phone.replace(/\D/g,"")}`;
    const joinDate = new Date(member.joinDate).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
    const dueDate = new Date(member.dueDate).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });

    const message =
`🏋️ *Welcome to ${gymName}!* 🏋️

Hello *${member.name}*, your membership has been activated successfully! 🎉

━━━━━━━━━━━━━━━━━━━━
📋 *MEMBERSHIP DETAILS*
━━━━━━━━━━━━━━━━━━━━
🏷️ Member Name: *${member.name}*
📅 Joining Date: *${joinDate}*
💎 Plan: *${member.plan}*
💰 Monthly Fee: *₹${member.fees}*
📆 Next Payment: *${dueDate}*

━━━━━━━━━━━━━━━━━━━━
🔐 *YOUR LOGIN CREDENTIALS*
━━━━━━━━━━━━━━━━━━━━
👤 Username: *${member.username}*
🔑 Password: *${member.password}*

━━━━━━━━━━━━━━━━━━━━
💪 Stay consistent, stay strong!
For support, contact the gym desk.

_${gymName} — Powered by CrossFit App_ 🔥`;

    try {
      const creds = btoa(`${accountSid}:${authToken}`);
      const body = new URLSearchParams({ From: fromNumber, To: toNumber, Body: message });
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: "POST",
        headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = await res.json();
      if (res.ok && data.sid) {
        const log = { id: Date.now(), member: member.name, phone: member.phone, status: "sent", sid: data.sid, time: new Date().toLocaleTimeString() };
        setWhatsappLogs(p => [log, ...p.slice(0,49)]);
        return { success: true, sid: data.sid };
      } else {
        const log = { id: Date.now(), member: member.name, phone: member.phone, status: "failed", reason: data.message||"API error", time: new Date().toLocaleTimeString() };
        setWhatsappLogs(p => [log, ...p.slice(0,49)]);
        return { success: false, reason: data.message };
      }
    } catch (err) {
      const log = { id: Date.now(), member: member.name, phone: member.phone, status: "error", reason: err.message, time: new Date().toLocaleTimeString() };
      setWhatsappLogs(p => [log, ...p.slice(0,49)]);
      return { success: false, reason: err.message };
    }
  };

  const addMember = async () => {
    if (!newMember.name || !newMember.username || !newMember.password) { showToast("❌ Fill all required fields"); return; }
    const id = `m${Date.now()}`;
    const joinDate = newMember.joinDate || new Date().toISOString().split("T")[0];
    const dueDate = new Date(new Date(joinDate).getTime() + 30*24*60*60*1000).toISOString().split("T")[0];
    const m = {
      id, ...newMember, fees: Number(newMember.fees),
      photo: newMemberPhoto || null,
      age: 25, height: 170, weight: 70, gender: "Male",
      goal: "Maintenance", activity: "Moderate", medical: "None",
      dueDate, status: "Unpaid", joinDate,
      coins: 0, streak: 0, lastActive: joinDate,
      payments: [], workoutLog: {}, badges: [],
    };
    await setDoc(doc(db, "members", id), m);

    // ── Send WhatsApp welcome message ──────────────────────────
    const waResult = await sendWhatsAppWelcome(m);
    setNewMember({ name: "", username: "", password: "", phone: "", plan: "Basic", fees: "1499", joinDate: new Date().toISOString().split("T")[0] });
    setNewMemberPhoto(null);
    setShowPhotoOptions(false);
    setModal(null);
    setActiveTab("members");

    if (waResult.success) {
      showToast("✅ Member added! 📱 WhatsApp sent!");
    } else if (waResult.reason === "not_configured") {
      showToast("✅ Member added! (Configure WhatsApp in Settings)");
    } else if (waResult.reason === "no_phone") {
      showToast("✅ Member added! (No phone → WhatsApp skipped)");
    } else {
      showToast("✅ Member added! ⚠️ WhatsApp failed — check logs");
    }
  };

  const deleteMember = async (id) => {
    await deleteDoc(doc(db, "members", id));
    setDeleteConfirm(null);
    setMemberMenu(null);
    showToast("✅ Member deleted successfully");
  };

  const saveEditMember = async () => {
    if (!editMemberData) return;
    const { id, ...data } = editMemberData;
    await updateDoc(doc(db, "members", id), data);
    setEditMemberData(null);
    setMemberMenu(null);
    showToast("✅ Member updated!");
  };

  const saveProfile = async (id, data) => {
    await updateDoc(doc(db, "members", id), data);
    setEditProfile(false); showToast("✅ Profile updated!");
  };

  // ── Loading screen ──
  if (dbLoading) return (
    <div className="db-loading">
      <style>{css}</style>

      {/* Full-screen background photo */}
      <img
        src="data:image/jpeg;base64,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"
        alt="Crossfit"
        style={{
          position:"absolute", inset:0,
          width:"100%", height:"100%",
          objectFit:"cover", objectPosition:"center top",
        }}
      />

      {/* Dark gradient overlay — bottom to top */}
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)",
      }}/>

      {/* Content on top */}
      <div style={{
        position:"relative", zIndex:10,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"flex-end",
        height:"100%", width:"100%",
        paddingBottom:60,
      }}>
        {/* Logo + gym name */}
        <div style={{
          width:70, height:70, borderRadius:20,
          background:"linear-gradient(135deg,var(--neon),var(--neon2))",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:36, marginBottom:16,
          boxShadow:"0 0 40px rgba(0,255,136,0.6)",
          animation:"pulse 1.8s ease-in-out infinite",
        }}>🏋️</div>

        <div style={{
          fontFamily:"Rajdhani,sans-serif",
          fontSize:42, fontWeight:900,
          color:"#fff", letterSpacing:4,
          textShadow:"0 0 30px rgba(0,255,136,0.8)",
          marginBottom:4,
        }}>CROSSFIT</div>

        <div style={{
          fontSize:13, color:"rgba(255,255,255,0.6)",
          letterSpacing:2, textTransform:"uppercase",
          marginBottom:32,
        }}>Elite Fitness Club</div>

        {/* Loading bar */}
        <div style={{
          width:160, height:3,
          background:"rgba(255,255,255,0.15)",
          borderRadius:3, overflow:"hidden",
          marginBottom:14,
        }}>
          <div style={{
            height:"100%", borderRadius:3,
            background:"linear-gradient(90deg,var(--neon),var(--neon2))",
            animation:"loadBar 1.6s ease-in-out infinite",
          }}/>
        </div>

        <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",letterSpacing:1}}>
          Loading your fitness journey…
        </div>
      </div>

      <style>{`
        @keyframes loadBar {
          0%   { width: 0%;   margin-left: 0; }
          50%  { width: 70%;  margin-left: 0; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
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
          <div className="member-avatar">{m.gender==="Female"?"👩":"👨"}</div>
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

  const OwnerMembers = () => {
    const [filter, setFilter] = useState("All");
    const filtered = members.filter(m => {
      if (filter === "All")     return true;
      if (filter === "Active")  return m.status === "Paid";
      if (filter === "Unpaid")  return m.status === "Unpaid";
      if (filter === "Premium") return m.plan === "Premium";
      return true;
    });
    return (
      <div onClick={()=>memberMenu&&setMemberMenu(null)}>
        <div className="tab-bar">
          {["All","Active","Unpaid","Premium"].map(f=>(
            <button key={f} className={`tab-pill${f===filter?" active":""}`} onClick={()=>setFilter(f)}>{f}</button>
          ))}
        </div>

        {filtered.map(m=>(
          <div key={m.id} style={{position:"relative"}}>
            <div className="member-card" onClick={()=>{setSelectedMember(m);setModal("memberDetail");}}>
              {/* Avatar */}
              <div className="member-avatar" style={{overflow:"hidden",borderRadius:"50%"}}>
                {m.photo
                  ? <img src={m.photo} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : (m.gender==="Female"?"👩":"👨")
                }
              </div>
              {/* Info */}
              <div className="member-info">
                <div className="member-name">{m.name}</div>
                <div className="text-sm text-muted mt-8">@{m.username} · Joined {m.joinDate}</div>
                <div className="row mt-8" style={{gap:6}}>
                  <span className={`badge-plan-${(m.plan||"basic").toLowerCase()}`}>{m.plan}</span>
                  <span className="coin-small">🪙 {m.coins}</span>
                  <span style={{fontSize:11,color:"var(--warning)"}}>🔥{m.streak}d</span>
                </div>
              </div>
              {/* Status + due */}
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end",marginRight:6}}>
                <span className={`badge-status badge-${(m.status||"unpaid").toLowerCase()}`}>{m.status}</span>
                <span style={{fontSize:11,color:"var(--text3)"}}>Due {m.dueDate}</span>
              </div>
              {/* ⋮ 3-dot button */}
              <button
                onClick={e=>{e.stopPropagation();setMemberMenu(memberMenu===m.id?null:m.id);}}
                style={{
                  width:32,height:32,borderRadius:8,border:"1px solid var(--border)",
                  background:memberMenu===m.id?"rgba(0,255,136,0.12)":"var(--card2)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  cursor:"pointer",flexShrink:0,transition:"all 0.18s",
                  color:memberMenu===m.id?"var(--neon)":"var(--text2)",
                  fontSize:18,fontWeight:700,lineHeight:1,
                }}
              >⋮</button>
            </div>

            {/* Dropdown menu */}
            {memberMenu===m.id&&(
              <div
                onClick={e=>e.stopPropagation()}
                style={{
                  position:"absolute",right:16,top:"calc(100% - 4px)",zIndex:200,
                  background:"var(--bg2)",border:"1px solid var(--border)",
                  borderRadius:14,overflow:"hidden",
                  boxShadow:"0 8px 32px rgba(0,0,0,0.6)",
                  animation:"slideUp 0.15s ease",minWidth:180,
                }}
              >
                {/* Edit option */}
                <button
                  onClick={()=>{
                    setEditMemberData({...m});
                    setMemberMenu(null);
                  }}
                  style={{
                    width:"100%",padding:"13px 16px",background:"transparent",
                    border:"none",borderBottom:"1px solid var(--border)",
                    display:"flex",alignItems:"center",gap:10,cursor:"pointer",
                    color:"var(--text)",fontSize:14,fontWeight:600,textAlign:"left",
                    transition:"background 0.15s",
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(0,255,136,0.08)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <span style={{fontSize:16}}>✏️</span>
                  <span>Edit Member</span>
                </button>
                {/* Delete option */}
                <button
                  onClick={()=>{
                    setDeleteConfirm(m);
                    setMemberMenu(null);
                  }}
                  style={{
                    width:"100%",padding:"13px 16px",background:"transparent",
                    border:"none",
                    display:"flex",alignItems:"center",gap:10,cursor:"pointer",
                    color:"var(--danger)",fontSize:14,fontWeight:600,textAlign:"left",
                    transition:"background 0.15s",
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,68,68,0.08)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <span style={{fontSize:16}}>🗑️</span>
                  <span>Delete Member</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>
            <div style={{fontFamily:"Rajdhani",fontSize:18,fontWeight:700,marginBottom:6}}>No members found</div>
            <div style={{fontSize:13,color:"var(--text2)"}}>Try a different filter</div>
          </div>
        )}

        <div style={{padding:"0 16px 16px"}}>
          <button className="btn-primary" onClick={()=>setModal("addMember")}>+ Add New Member</button>
        </div>

        {/* ── Delete Confirm Popup ── */}
        {deleteConfirm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}
            onClick={()=>setDeleteConfirm(null)}>
            <div onClick={e=>e.stopPropagation()} style={{
              background:"var(--bg2)",border:"1px solid var(--border)",
              borderRadius:24,padding:28,width:"100%",maxWidth:340,
              animation:"slideUp 0.2s ease",
              boxShadow:"0 20px 60px rgba(0,0,0,0.7)",
            }}>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{
                  width:64,height:64,borderRadius:16,
                  background:"rgba(255,68,68,0.12)",border:"2px solid rgba(255,68,68,0.3)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:30,margin:"0 auto 14px",
                }}>🗑️</div>
                <div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700,color:"var(--text)",marginBottom:6}}>Delete Member?</div>
                <div style={{fontSize:14,color:"var(--text2)",lineHeight:1.5}}>
                  You're about to permanently delete<br/>
                  <span style={{color:"var(--danger)",fontWeight:700,fontSize:16}}>"{deleteConfirm.name}"</span>
                </div>
              </div>
              <div style={{
                background:"rgba(255,68,68,0.06)",border:"1px solid rgba(255,68,68,0.2)",
                borderRadius:12,padding:"10px 14px",marginBottom:20,
                display:"flex",alignItems:"flex-start",gap:8,
              }}>
                <span style={{fontSize:14,marginTop:1}}>⚠️</span>
                <span style={{fontSize:12,color:"var(--text2)",lineHeight:1.5}}>
                  This will permanently remove all their data including attendance, payments, and workout history. This cannot be undone.
                </span>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button
                  onClick={()=>setDeleteConfirm(null)}
                  style={{
                    flex:1,padding:"13px",borderRadius:12,border:"1px solid var(--border)",
                    background:"var(--card)",color:"var(--text)",
                    fontFamily:"Rajdhani,sans-serif",fontSize:15,fontWeight:700,cursor:"pointer",
                  }}
                >Cancel</button>
                <button
                  onClick={()=>deleteMember(deleteConfirm.id)}
                  style={{
                    flex:1,padding:"13px",borderRadius:12,border:"none",
                    background:"linear-gradient(135deg,#ff4444,#cc0000)",
                    color:"#fff",fontFamily:"Rajdhani,sans-serif",fontSize:15,fontWeight:700,cursor:"pointer",
                    boxShadow:"0 4px 20px rgba(255,68,68,0.4)",
                  }}
                >🗑️ Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Member Popup ── */}
        {editMemberData&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
            onClick={()=>setEditMemberData(null)}>
            <div onClick={e=>e.stopPropagation()} style={{
              background:"var(--bg2)",borderRadius:"24px 24px 0 0",
              padding:"20px 20px 32px",width:"100%",maxWidth:480,
              maxHeight:"85vh",overflowY:"auto",
              animation:"slideUp 0.25s ease",
              borderTop:"1px solid var(--border)",
            }}>
              <div style={{width:40,height:4,background:"var(--border)",borderRadius:2,margin:"0 auto 18px"}}/>
              <div style={{fontFamily:"Rajdhani",fontSize:20,fontWeight:700,marginBottom:18,display:"flex",alignItems:"center",gap:8}}>
                ✏️ Edit Member
                <div style={{marginLeft:"auto",fontSize:12,color:"var(--text3)"}}>ID: {editMemberData.id}</div>
              </div>

              {[
                {k:"name",     label:"Full Name",     type:"text"},
                {k:"username", label:"Username",      type:"text"},
                {k:"password", label:"Password",      type:"password"},
                {k:"phone",    label:"Phone (+91)",   type:"tel"},
              ].map(({k,label,type})=>(
                <div key={k} className="input-group">
                  <label className="input-label">{label}</label>
                  <input className="input-field" type={type} value={editMemberData[k]||""}
                    onChange={e=>setEditMemberData(p=>({...p,[k]:e.target.value}))}/>
                </div>
              ))}

              <div className="two-col" style={{gap:10}}>
                <div className="input-group" style={{margin:0}}>
                  <label className="input-label">Plan</label>
                  <select className="input-field" value={editMemberData.plan||"Basic"}
                    onChange={e=>setEditMemberData(p=>({...p,plan:e.target.value}))}>
                    <option>Basic</option><option>Premium</option>
                  </select>
                </div>
                <div className="input-group" style={{margin:0}}>
                  <label className="input-label">Monthly Fee (₹)</label>
                  <input className="input-field" type="number" value={editMemberData.fees||""}
                    onChange={e=>setEditMemberData(p=>({...p,fees:Number(e.target.value)}))}/>
                </div>
              </div>

              <div className="two-col" style={{gap:10}}>
                <div className="input-group" style={{margin:0}}>
                  <label className="input-label">Status</label>
                  <select className="input-field" value={editMemberData.status||"Unpaid"}
                    onChange={e=>setEditMemberData(p=>({...p,status:e.target.value}))}>
                    <option>Paid</option><option>Unpaid</option>
                  </select>
                </div>
                <div className="input-group" style={{margin:0}}>
                  <label className="input-label">Due Date</label>
                  <input className="input-field" type="date" value={editMemberData.dueDate||""}
                    onChange={e=>setEditMemberData(p=>({...p,dueDate:e.target.value}))}/>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Gender</label>
                <select className="input-field" value={editMemberData.gender||"Male"}
                  onChange={e=>setEditMemberData(p=>({...p,gender:e.target.value}))}>
                  <option>Male</option><option>Female</option>
                </select>
              </div>

              <div style={{display:"flex",gap:10,marginTop:8}}>
                <button onClick={()=>setEditMemberData(null)} style={{
                  flex:1,padding:"14px",borderRadius:12,border:"1px solid var(--border)",
                  background:"var(--card)",color:"var(--text)",
                  fontFamily:"Rajdhani,sans-serif",fontSize:15,fontWeight:700,cursor:"pointer",
                }}>Cancel</button>
                <button onClick={saveEditMember} style={{
                  flex:2,padding:"14px",borderRadius:12,border:"none",
                  background:"linear-gradient(135deg,var(--neon),#00cc6e)",
                  color:"#000",fontFamily:"Rajdhani,sans-serif",fontSize:15,fontWeight:700,cursor:"pointer",
                  boxShadow:"0 4px 20px rgba(0,255,136,0.35)",
                }}>💾 Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
              <div><div className="ai-badge" style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(0,255,136,0.1)",border:"1px solid rgba(0,255,136,0.2)",borderRadius:20,padding:"4px 12px",marginBottom:8,fontSize:11,color:"var(--neon)",fontWeight:600}}>⚠️ PAYMENT DUE</div><div className="upi-amount">₹{cu.fees}</div><div style={{fontSize:13,color:"var(--text2)"}}>UPI: {OWNER.upiId}</div></div>
              <div style={{fontSize:36}}>💳</div>
            </div>
            <div className="upi-apps">
              {[{name:"GPay",icon:"🟢"},{name:"PhonePe",icon:"🟣"},{name:"Paytm",icon:"🔵"},{name:"BHIM",icon:"🟡"}].map(app=>(
                <button key={app.name} className="upi-app-btn" onClick={()=>showToast(`Opening ${app.name}... UPI: ${OWNER.upiId}`)}><span className="upi-app-icon">{app.icon}</span>{app.name}</button>
              ))}
            </div>
            <button className="btn-primary" style={{marginTop:8}} onClick={()=>{showToast("🔗 Opening UPI Intent...");window.open(`upi://pay?pa=${OWNER.upiId}&pn=Crossfit&am=${cu.fees}&tn=Gym+Membership`,"_blank");}}>PAY NOW ₹{cu.fees}</button>
          </div>
        )}
        <div className="section-header"><div className="section-title">Payment History</div></div>
        <div className="card">
          {(cu.payments||[]).map((p,i)=>(
            <div key={i} className="payment-item"><div><div style={{fontSize:14,fontWeight:500}}>{p.method}</div><div className="payment-date">{p.date}</div></div><div><div className="payment-amount">₹{p.amount}</div><div className={`text-xs ${p.status==="Paid"?"text-neon":"text-danger"}`}>{p.status}</div></div></div>
          ))}
          {(!cu.payments||cu.payments.length===0)&&<div className="text-center text-muted" style={{padding:16}}>No payments yet</div>}
        </div>
        <div className="section-header"><div className="section-title">Badges</div></div>
        <div className="card"><div className="badges-wrap">{(cu.badges||[]).map((b,i)=><span key={i} className="badge-item">{b}</span>)}{memberCoins>=100&&<span className="badge-item" style={{borderColor:"var(--gold)",color:"var(--gold)"}}>⭐ {memberCoins}+ Coins</span>}</div></div>
      </div>
    );
  };

  // ── Animated Exercise GIF (pure SVG + CSS, no external URLs) ──────────────
  // ── 3D-style Exercise Illustration using real exercise GIFs from Giphy/public CDN ──
  // ── 3D Exercise GIF — emoji-based animated icons (no external dependencies) ──
  // ── Exercise GIF — real anatomical illustrations via wger open API ──────────
  // ── Exercise GIF using publicly accessible animated SVG/CSS per category ──
  const ExerciseGif = ({ name, color = "#00ff88", done = false }) => {
    const n = (name || "").toLowerCase();
    const is = (...kws) => kws.some(k => n.includes(k));

    // Map exercise name → animated GIF via muscles worked
    // Using multiple CDN sources with fallback chain
    const getGif = () => {
      // ── CHEST ──────────────────────────────────────────────────────────────
      if (is("flat bench","barbell bench press") && !is("incline","decline","close"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-front.gif";
      if (is("incline") && (is("dumbbell","db") || is("press")))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-incline-bench-press-front.gif";
      if (is("decline bench"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-decline-bench-press-front.gif";
      if (is("cable fly","cable cross","high to low"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-chest-fly-front.gif";
      if (is("pec deck","pec deck machine"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-pec-deck-fly-front.gif";
      if (is("chest fly","dumbbell fly") && !is("cable"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-chest-fly-front.gif";
      if (is("chest dip") || (is("dip") && !is("tricep","bench dip","weighted")))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dips-front.gif";
      if (is("push-up","push up","pushup") && !is("weighted"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-pushups-front.gif";
      if (is("weighted push") || is("push-up (weighted)"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-pushups-front.gif";

      // ── BACK ───────────────────────────────────────────────────────────────
      if (is("deadlift") && !is("romanian","rdl","sumo","single","stiff"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-deadlift-front.gif";
      if (is("romanian deadlift","rdl") || (is("romanian") && is("deadlift")))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-romanian-deadlift-front.gif";
      if (is("pull-up","pull up") && !is("lat","straight arm"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-pull-up-front.gif";
      if (is("lat pulldown","lat pull"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-lat-pull-down-front.gif";
      if (is("seated cable row","seated row") && !is("one arm","single"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-seated-row-front.gif";
      if (is("t-bar row","t bar row"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-tbar-row-front.gif";
      if (is("one-arm","one arm","single arm") && is("row","dumbbell row"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-single-arm-row-front.gif";
      if (is("barbell row","bent-over row","bent over row") && !is("t-bar","upright"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bent-over-row-front.gif";
      if (is("straight arm pulldown","straight arm pull"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-straight-arm-pulldown-front.gif";
      if (is("face pull"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-face-pull-front.gif";
      if (is("good morning"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-good-morning-front.gif";

      // ── SHOULDERS ──────────────────────────────────────────────────────────
      if (is("barbell shoulder press","barbell overhead","military press") && !is("dumbbell","arnold"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-overhead-press-front.gif";
      if (is("dumbbell shoulder press","db shoulder press") && !is("arnold","incline"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-shoulder-press-front.gif";
      if (is("arnold press","arnold"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-arnold-press-front.gif";
      if (is("lateral raise","lateral raises"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-lateral-raise-front.gif";
      if (is("front raise","front raises"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-front-raise-front.gif";
      if (is("rear delt fly","rear delt flye","reverse fly","rear delt"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-reverse-fly-front.gif";
      if (is("upright row"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-upright-row-front.gif";
      if (is("shrug","barbell shrug","dumbbell shrug"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-shrug-front.gif";
      if (is("push press"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-push-press-front.gif";
      if (is("shoulder press") && !is("barbell","dumbbell","arnold","db"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-shoulder-press-front.gif";

      // ── BICEPS ─────────────────────────────────────────────────────────────
      if (is("barbell curl") && !is("reverse","preacher","ez"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-curl-front.gif";
      if (is("ez bar curl","ez curl") && !is("preacher","skull"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-ez-bar-curl-front.gif";
      if (is("hammer curl"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-hammer-curl-front.gif";
      if (is("incline dumbbell curl","incline curl") && !is("press"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-incline-curl-front.gif";
      if (is("preacher curl","preacher"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-preacher-curl-front.gif";
      if (is("concentration curl","concentration"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-concentration-curl-front.gif";
      if (is("cable curl") && !is("hammer","overhead"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-curl-front.gif";
      if (is("reverse curl"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-reverse-curl-front.gif";
      if (is("curl","bicep") && !is("leg","hair"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-curl-front.gif";

      // ── TRICEPS ────────────────────────────────────────────────────────────
      if (is("close-grip bench","close grip bench"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-close-grip-bench-press-front.gif";
      if (is("skull crusher","skull"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-ez-bar-skull-crusher-front.gif";
      if (is("rope pushdown","tricep pushdown","triceps pushdown","pushdown") && !is("overhead"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-tricep-pushdown-front.gif";
      if (is("overhead tricep","overhead dumbbell ext","overhead cable ext","overhead extension") || (is("overhead") && is("tricep","extension")))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-overhead-tricep-extension-front.gif";
      if (is("bench dip","bench dips"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dips-front.gif";
      if (is("tricep kickback","kickback"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-tricep-kickback-front.gif";
      if (is("dip","dips","weighted dip") && !is("chest","bench","tricep pushdown"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dips-front.gif";

      // ── LEGS — QUADS ───────────────────────────────────────────────────────
      if (is("barbell squat","barbell back squat","back squat") && !is("front","hack","goblet"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-squat-front.gif";
      if (is("front squat"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-front-squat-front.gif";
      if (is("hack squat"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-hack-squat-front.gif";
      if (is("goblet squat"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-goblet-squat-front.gif";
      if (is("bodyweight squat") || (is("squat") && !is("barbell","front","hack","goblet","leg")))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-bodyweight-squat-front.gif";
      if (is("squats") && !is("barbell","front","hack","goblet"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-squat-front.gif";
      if (is("leg press"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-leg-press-front.gif";
      if (is("leg extension"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-leg-extension-front.gif";
      if (is("walking lunge","lunge","lunges"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-lunge-front.gif";
      if (is("bulgarian split squat","bulgarian"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-bulgarian-split-squat-front.gif";
      if (is("step-up","step up"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-step-up-front.gif";

      // ── LEGS — HAMSTRINGS ──────────────────────────────────────────────────
      if (is("lying leg curl","lying curl"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-lying-leg-curl-front.gif";
      if (is("seated leg curl","seated curl") && !is("calf"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-seated-leg-curl-front.gif";
      if (is("leg curl") && !is("lying","seated"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-lying-leg-curl-front.gif";

      // ── LEGS — GLUTES ──────────────────────────────────────────────────────
      if (is("hip thrust"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-hip-thrust-front.gif";
      if (is("glute bridge"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-glute-bridge-front.gif";

      // ── LEGS — CALVES ──────────────────────────────────────────────────────
      if (is("standing calf","calf raise","calf raises") && !is("seated","donkey"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-standing-calf-raises-front.gif";
      if (is("seated calf"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-seated-calf-raise-front.gif";
      if (is("donkey calf"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-donkey-calf-raise-front.gif";
      if (is("tibialis"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-standing-calf-raises-front.gif";

      // ── CORE ───────────────────────────────────────────────────────────────
      if (is("plank") && !is("cable","ab wheel","weighted"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-plank-front.gif";
      if (is("weighted plank"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-plank-front.gif";
      if (is("ab wheel","rollout"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-ab-wheel-rollout-front.gif";
      if (is("cable crunch") || (is("crunch") && is("cable")))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-crunch-front.gif";
      if (is("crunch") && !is("cable","bicycle"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-crunch-front.gif";
      if (is("bicycle crunch","bicycle"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-bicycle-crunch-front.gif";
      if (is("russian twist","russian twists"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-russian-twist-front.gif";
      if (is("hanging leg raise","hanging leg"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-hanging-leg-raise-front.gif";
      if (is("leg raise","leg raises") && !is("hanging"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-lying-leg-raise-front.gif";
      if (is("mountain climber"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-mountain-climbers-front.gif";
      if (is("cable woodchop","woodchop"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-cable-woodchop-front.gif";
      if (is("superman"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-superman-front.gif";
      if (is("sit-up","situp"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-sit-up-front.gif";

      // ── CARDIO / POWER ─────────────────────────────────────────────────────
      if (is("burpee"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-burpees-front.gif";
      if (is("box jump","box jumps"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-box-jumps-front.gif";
      if (is("jumping jack"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-jumping-jacks-front.gif";
      if (is("battle rope"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-battle-ropes-front.gif";
      if (is("power clean","clean") && !is("muscle"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-power-clean-front.gif";
      if (is("sprint","run","jog","treadmill","running"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-run-front.gif";
      if (is("walk","light walk","brisk walk","walking") && !is("lunge","lunges"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-walking-front.gif";
      if (is("jump rope","rope skip"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-jump-rope-front.gif";

      // ── STRETCHING / RECOVERY ──────────────────────────────────────────────
      if (is("foam roll","foam rolling"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-foam-rolling-it-band-front.gif";
      if (is("hip flexor stretch","hip flexor"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-hip-flexor-stretch-front.gif";
      if (is("child","child's pose","childs pose"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-childs-pose-front.gif";
      if (is("cat-cow","cat cow"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-cat-cow-front.gif";
      if (is("yoga","light yoga","yoga flow"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-downward-dog-front.gif";
      if (is("stretch","stretching","cool down","full body stretch","light stretch","deep stretch","static stretch","flexibility"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-standing-quad-stretch-front.gif";
      if (is("mobility","mobility work","mobility exercises","mobility drill"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-hip-circles-front.gif";
      if (is("meditation","deep breathing","breathing","box breathing","breath","relaxation"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-diaphragmatic-breathing-front.gif";
      if (is("neck roll","neck rotation","neck"))
        return "https://media.musclewiki.com/media/uploads/videos/branded/male-neck-rotation-front.gif";

      // ── DEFAULT ────────────────────────────────────────────────────────────
      return "https://media.musclewiki.com/media/uploads/videos/branded/male-dumbbell-curl-front.gif";
    };

    const gifUrl = getGif();

    const fbEmoji = () => {
      if (is("squat","lunge","leg press","leg ext","leg curl","calf","hip thrust","glute")) return "🦵";
      if (is("run","sprint","jump","burpee","cardio","mountain","box jump","battle","walk")) return "🏃";
      if (is("stretch","yoga","foam","child","cat","hip flexor","cool","rest","meditat","breath","recovery","mobility","relaxation","neck")) return "🧘";
      if (is("plank","crunch","ab","core","twist","rollout","leg raise","hanging","bicycle","woodchop","superman","sit-up")) return "🔥";
      if (is("bench","press","fly","dip","push","pec")) return "🏋️";
      if (is("curl","bicep","preacher","hammer","concentration","ez bar")) return "💪";
      if (is("row","pull","deadlift","pulldown","face pull","straight arm")) return "🏋️";
      if (is("shoulder","lateral","front raise","rear delt","shrug","upright","arnold")) return "🎯";
      if (is("skull","pushdown","overhead","tricep","kickback","close-grip","close grip","bench dip")) return "💪";
      return "💪";
    };

    return (
      <div style={{
        width:64, height:64, borderRadius:14, flexShrink:0,
        overflow:"hidden", position:"relative",
        background:"#0d1117",
        border:`2px solid ${done ? color : color+"44"}`,
        boxShadow: done ? `0 0 20px ${color}66` : `0 4px 14px rgba(0,0,0,0.6)`,
        transition:"all 0.25s",
      }}>
        <img
          src={gifUrl}
          alt={name}
          style={{
            width:"100%", height:"100%",
            objectFit:"cover",
            display:"block",
            opacity: done ? 0.7 : 1,
          }}
          onError={e => {
            e.target.style.display = "none";
            const fb = e.target.parentNode.querySelector(".ex-fb");
            if (fb) fb.style.display = "flex";
          }}
        />
        <div className="ex-fb" style={{
          display:"none", position:"absolute", inset:0,
          alignItems:"center", justifyContent:"center",
          fontSize:30, background:`linear-gradient(135deg,${color}22,${color}08)`,
        }}>{fbEmoji()}</div>

        {done && (
          <div style={{
            position:"absolute", inset:0,
            background:`${color}33`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <div style={{
              width:26, height:26, borderRadius:"50%",
              background:color, display:"flex",
              alignItems:"center", justifyContent:"center",
              fontSize:14, fontWeight:900, color:"#000",
              boxShadow:`0 0 12px ${color}`,
            }}>✓</div>
          </div>
        )}
      </div>
    );
  };

  const MemberWorkout = () => {
    const today = new Date();
    const dayIdx = today.getDay();
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const fullDayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dateStr = today.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"});
    const [doneEx, setDoneEx] = useState([]);
    const [selDay, setSelDay] = useState(dayIdx);
    const [mode, setMode] = useState("beginner");

    const plan = WORKOUT_PLANS[mode];
    const todayW = plan.schedule[dayIdx];
    const viewW = plan.schedule[selDay];

    const toggle = (i) => setDoneEx(p => p.includes(i)?p.filter(x=>x!==i):[...p,i]);

    const MODES = [
      {id:"beginner",   label:"Beginner",     icon:"🌱", color:"#00ff88", desc:"Simple & safe"},
      {id:"intermediate",label:"Intermediate",icon:"🔥", color:"#ff6b35", desc:"Progressive"},
      {id:"professional",label:"Pro",          icon:"⚡", color:"#ffd700", desc:"Max intensity"},
    ];

    return (
      <div style={{paddingBottom:24}}>

        {/* ── Mode Selector ── */}
        <div style={{padding:"16px 16px 10px"}}>
          <div style={{fontFamily:"Rajdhani",fontSize:12,fontWeight:700,color:"var(--text3)",letterSpacing:2,marginBottom:10}}>SELECT YOUR MODE</div>
          <div style={{display:"flex",gap:8}}>
            {MODES.map(m=>(
              <div key={m.id} onClick={()=>{setMode(m.id);setDoneEx([]);setSelDay(dayIdx);}} style={{
                flex:1,padding:"10px 6px",borderRadius:14,cursor:"pointer",textAlign:"center",
                background:mode===m.id?`${m.color}18`:"var(--card)",
                border:`2px solid ${mode===m.id?m.color:"var(--border)"}`,
                transition:"all 0.25s",
                boxShadow:mode===m.id?`0 0 18px ${m.color}30`:"none",
              }}>
                <div style={{fontSize:22,marginBottom:3}}>{m.icon}</div>
                <div style={{fontSize:11,fontWeight:700,color:mode===m.id?m.color:"var(--text2)"}}>{m.label}</div>
                <div style={{fontSize:9,color:"var(--text3)",marginTop:2}}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Today Banner ── */}
        <div style={{
          margin:"0 16px 14px",
          background:`linear-gradient(135deg,${todayW.color}15,rgba(0,0,0,0.3))`,
          border:`1px solid ${todayW.color}44`,borderRadius:20,padding:"16px 20px",
          position:"relative",overflow:"hidden",
        }}>
          <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:0.05}}>💪</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
            <div style={{fontSize:11,color:todayW.color,fontWeight:700,letterSpacing:1.5}}>TODAY · {dateStr.toUpperCase()}</div>
            <div style={{background:plan.color+"22",border:`1px solid ${plan.color}44`,borderRadius:20,padding:"2px 8px",fontSize:10,color:plan.color,fontWeight:700}}>{plan.icon} {plan.label}</div>
          </div>
          <div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700,color:"var(--text)",marginBottom:6}}>{todayW.focus}</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:`${todayW.color}22`,border:`1px solid ${todayW.color}44`,borderRadius:20,padding:"3px 10px",fontSize:12,color:todayW.color,fontWeight:600}}>{todayW.exercises.length} Exercises</div>
            <div style={{fontSize:11,color:"var(--text2)"}}>🪙 +{todayW.exercises.length*10} coins</div>
          </div>
          {selDay===dayIdx&&(
            <div style={{marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,color:"var(--text3)"}}>Today's Progress</span>
                <span style={{fontSize:11,color:todayW.color,fontWeight:700}}>{doneEx.length}/{viewW.exercises.length}</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.08)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${todayW.color},${todayW.color}88)`,width:`${(doneEx.length/viewW.exercises.length)*100}%`,transition:"width 0.5s ease"}}/>
              </div>
            </div>
          )}
        </div>

        {/* ── Day Selector ── */}
        <div style={{display:"flex",gap:6,padding:"0 16px 12px",overflowX:"auto",scrollbarWidth:"none"}}>
          {fullDayNames.map((d,i)=>{
            const w=plan.schedule[i];
            const isTod=i===dayIdx, isSel=i===selDay;
            return (
              <div key={i} onClick={()=>{setSelDay(i);setDoneEx([]);}} style={{
                flexShrink:0,padding:"8px 10px",borderRadius:12,cursor:"pointer",
                background:isSel?`${w.color}22`:"var(--card)",
                border:`1px solid ${isSel?w.color:"var(--border)"}`,
                transition:"all 0.2s",textAlign:"center",minWidth:46,
              }}>
                <div style={{fontSize:10,color:isSel?w.color:"var(--text3)",fontWeight:700}}>{dayNames[i]}</div>
                {isTod&&<div style={{width:4,height:4,background:w.color,borderRadius:"50%",margin:"3px auto 0",boxShadow:`0 0 5px ${w.color}`}}/>}
              </div>
            );
          })}
        </div>

        {/* ── Viewing another day note ── */}
        {selDay!==dayIdx&&(
          <div style={{margin:"0 16px 12px",background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>📅</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{fullDayNames[selDay]} — {viewW.focus}</div>
              <div style={{fontSize:11,color:"var(--text3)"}}>Viewing scheduled workout</div>
            </div>
          </div>
        )}

        {/* ── Exercise List ── */}
        <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:8}}>
          {viewW.exercises.map((ex,i)=>{
            const done = doneEx.includes(i)&&selDay===dayIdx;
            return (
              <div key={i} onClick={()=>{if(selDay===dayIdx)toggle(i);}}
                style={{
                  display:"flex",alignItems:"center",gap:12,
                  background:done?`${viewW.color}0e`:"var(--card)",
                  border:`1px solid ${done?viewW.color:"var(--border)"}`,
                  borderRadius:16,padding:"10px 14px 10px 10px",
                  cursor:selDay===dayIdx?"pointer":"default",
                  transition:"all 0.25s",
                  boxShadow:done?`0 0 18px ${viewW.color}25`:"none",
                }}
              >
                {/* Animated GIF */}
                <ExerciseGif name={ex.name} color={viewW.color} done={done}/>

                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:1}}>
                    {/* Number badge */}
                    <div style={{
                      width:18,height:18,borderRadius:5,flexShrink:0,
                      background:done?viewW.color:`${viewW.color}25`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontFamily:"Rajdhani",fontSize:10,fontWeight:700,
                      color:done?"#000":viewW.color,transition:"all 0.25s",
                    }}>
                      {done?"✓":(i+1)}
                    </div>
                    <div style={{fontFamily:"Rajdhani",fontSize:15,fontWeight:700,color:done?viewW.color:"var(--text)",transition:"color 0.25s",lineHeight:1.1}}>{ex.name}</div>
                  </div>
                  <div style={{fontSize:10,color:"var(--text3)",marginBottom:5,paddingLeft:24}}>{ex.muscle}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",paddingLeft:24}}>
                    <span style={{fontSize:10,fontWeight:600,color:viewW.color,background:`${viewW.color}18`,borderRadius:5,padding:"2px 7px"}}>{ex.sets}</span>
                    <span style={{fontSize:10,fontWeight:600,color:"var(--text2)",background:"var(--bg3)",borderRadius:5,padding:"2px 7px"}}>{ex.reps}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── All Done Banner ── */}
        {selDay===dayIdx&&doneEx.length===viewW.exercises.length&&doneEx.length>0&&(
          <div style={{margin:"14px 16px 0",background:`linear-gradient(135deg,${viewW.color}15,${viewW.color}06)`,border:`1px solid ${viewW.color}44`,borderRadius:18,padding:20,textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:8}}>🏆</div>
            <div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700,color:viewW.color,marginBottom:4}}>Workout Complete!</div>
            <div style={{fontSize:13,color:"var(--text2)",marginBottom:12}}>You crushed {fullDayNames[selDay]}'s {plan.label} session 💪</div>
            <button className="btn-primary" onClick={()=>{completeTask({id:`day${dayIdx}`,name:viewW.focus,coins:viewW.exercises.length*10});}}>
              🪙 Claim +{viewW.exercises.length*10} Coins
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
            <div className="profile-avatar-lg">{cu.gender==="Female"?"👩":"👨"}</div>
            <div><div className="profile-name">{cu.name}</div><div className="profile-sub">{cu.plan} Plan · Joined {cu.joinDate?new Date(cu.joinDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"-"}</div><div className="row mt-8"><span className="tag tag-green">{cu.goal}</span><span className="text-xs text-muted">{cu.activity} Activity</span></div></div>
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
              {[
                {k:"Age",      v:`${cu.age} yrs`},
                {k:"Height",   v:`${cu.height} cm`},
                {k:"Weight",   v:`${cu.weight} kg`},
                {k:"BMI",      v:(cu.weight/((cu.height/100)**2)).toFixed(1)},
                {k:"Gender",   v:cu.gender},
                {k:"Goal",     v:cu.goal},
                {k:"Activity", v:cu.activity},
                {k:"Medical",  v:cu.medical||"None"},
              ].map(item=>(
                <div key={item.k} className="info-row"><span className="info-key">{item.k}</span><span className="info-val">{item.v}</span></div>
              ))}
              {/* Date of Joining – always shown */}
              {cu.joinDate&&(
                <div className="info-row" style={{
                  marginTop:4,
                  background:"rgba(0,255,136,0.04)",
                  border:"1px solid rgba(0,255,136,0.15)",
                  borderRadius:10,padding:"8px 12px",margin:"8px -4px 0",
                }}>
                  <span className="info-key" style={{color:"var(--neon)"}}>📅 Joined</span>
                  <span className="info-val" style={{color:"var(--neon)",fontWeight:700}}>
                    {new Date(cu.joinDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SettingsSection = () => {
    const [settingsTab, setSettingsTab] = useState("general");
    const [editingWA, setEditingWA] = useState(false);
    const [waDraft, setWaDraft] = useState({...whatsappConfig});
    const [testPhone, setTestPhone] = useState("");
    const [testLoading, setTestLoading] = useState(false);

    const statusColor = {sent:"#25D366", failed:"var(--danger)", error:"var(--danger)", skipped:"var(--warning)"};
    const statusIcon  = {sent:"✅", failed:"❌", error:"💥", skipped:"⏭️"};

    const sendTestMsg = async () => {
      if (!testPhone || testPhone.length !== 10) { showToast("❌ Enter valid 10-digit number"); return; }
      setTestLoading(true);
      const fakeM = {
        name:"Test Member", username:"test123", password:"test@123", phone:testPhone,
        plan:"Premium", fees:2999,
        joinDate:new Date().toISOString().split("T")[0],
        dueDate:new Date(Date.now()+30*24*60*60*1000).toISOString().split("T")[0],
      };
      await sendWhatsAppWelcome(fakeM);
      setTestLoading(false);
      showToast("📲 Test message triggered — check logs below");
    };

    const configured = !!(whatsappConfig.accountSid && whatsappConfig.authToken);

    return (
      <div style={{paddingBottom:24}}>
        <div style={{padding:"16px 16px 8px"}}><div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700}}>Settings</div></div>

        {/* Tab strip */}
        <div style={{display:"flex",gap:8,padding:"0 16px 14px",overflowX:"auto",scrollbarWidth:"none"}}>
          {(role==="owner"
            ? [{id:"general",l:"⚙️ General"},{id:"whatsapp",l:"📱 WhatsApp"},{id:"logs",l:"📋 Logs"}]
            : [{id:"general",l:"⚙️ General"}]
          ).map(t=>(
            <button key={t.id} onClick={()=>setSettingsTab(t.id)} style={{
              padding:"8px 16px",borderRadius:20,
              border:`1px solid ${settingsTab===t.id?"var(--neon)":"var(--border)"}`,
              background:settingsTab===t.id?"rgba(0,255,136,0.1)":"var(--card)",
              color:settingsTab===t.id?"var(--neon)":"var(--text2)",
              fontFamily:"Exo 2,sans-serif",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",
              transition:"all 0.2s",
            }}>{t.l}</button>
          ))}
        </div>

        {/* ── General tab ── */}
        {settingsTab==="general"&&(
          <>
            <div className="card">
              {role==="owner"&&<div className="info-row"><span className="info-key">UPI ID</span><span className="info-val text-neon">{OWNER.upiId}</span></div>}
              <div className="info-row"><span className="info-key">Account</span><span className="info-val">{user.name}</span></div>
              <div className="info-row"><span className="info-key">Role</span><span className="info-val">{role==="owner"?"👑 Owner":"👤 Member"}</span></div>
              <div className="info-row"><span className="info-key">Database</span><span className="info-val" style={{color:"var(--neon)"}}>🟢 Firebase</span></div>
              <div className="info-row"><span className="info-key">WhatsApp</span>
                <span style={{fontSize:12,fontWeight:700,color:configured?"#25D366":"var(--warning)"}}>{configured?"🟢 Active":"🟡 Not configured"}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Theme</span>
                <button
                  onClick={()=>{
                    const next = theme==="dark"?"light":"dark";
                    setTheme(next);
                    localStorage.setItem("gymTheme", next);
                  }}
                  style={{
                    display:"flex",alignItems:"center",gap:8,
                    background:theme==="dark"?"rgba(0,255,136,0.08)":"rgba(0,0,0,0.06)",
                    border:`1px solid ${theme==="dark"?"rgba(0,255,136,0.3)":"rgba(0,0,0,0.15)"}`,
                    borderRadius:20,padding:"5px 14px",cursor:"pointer",
                    transition:"all 0.25s",
                  }}
                >
                  <span style={{fontSize:16}}>{theme==="dark"?"🌙":"☀️"}</span>
                  <span style={{fontFamily:"Rajdhani,sans-serif",fontSize:13,fontWeight:700,color:"var(--text)"}}>
                    {theme==="dark"?"Dark":"Light"}
                  </span>
                  {/* pill toggle */}
                  <div style={{
                    width:36,height:20,borderRadius:10,
                    background:theme==="dark"?"#1a1a2e":"#e2e8f0",
                    border:"1px solid var(--border)",
                    position:"relative",transition:"background 0.3s",
                  }}>
                    <div style={{
                      position:"absolute",top:2,
                      left:theme==="dark"?2:16,
                      width:14,height:14,borderRadius:"50%",
                      background:theme==="dark"?"var(--neon)":"#1a1a2e",
                      transition:"left 0.25s, background 0.25s",
                      boxShadow:theme==="dark"?"0 0 6px rgba(0,255,136,0.6)":"none",
                    }}/>
                  </div>
                </button>
              </div>
            </div>
            <div className="card">
              <div className="card-title">🔔 Notifications</div>
              {["Payment Reminders","Workout Alerts","Streak Notifications","WhatsApp Welcome"].map(n=>(
                <div key={n} className="info-row"><span className="info-key">{n}</span>
                  <div style={{width:36,height:20,background:"var(--neon)",borderRadius:10,position:"relative",cursor:"pointer"}}>
                    <div style={{position:"absolute",right:2,top:2,width:16,height:16,background:"#000",borderRadius:"50%"}}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{padding:"0 16px"}}><button className="btn-danger" style={{width:"100%",padding:"14px",fontSize:15}} onClick={handleLogout}>🚪 Logout</button></div>
          </>
        )}

        {/* ── WhatsApp Config tab ── */}
        {settingsTab==="whatsapp"&&role==="owner"&&(
          <div>
            {/* Status/Guide banner */}
            <div style={{margin:"0 16px 14px",background:configured?"linear-gradient(135deg,#075e54,#128c7e)":"linear-gradient(135deg,#1a1a24,#0a0a0f)",border:`1px solid ${configured?"#25D366":"var(--border)"}`,borderRadius:18,padding:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:configured?0:8}}>
                <div style={{fontSize:28}}>📲</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"Rajdhani",fontSize:18,fontWeight:700,color:configured?"#fff":"var(--text)"}}>WhatsApp Notifications</div>
                  <div style={{fontSize:12,color:configured?"rgba(255,255,255,0.8)":"var(--text2)"}}>{configured?"Connected via Twilio — auto-messages enabled":"Not configured — members won't receive welcome messages"}</div>
                </div>
                <div style={{background:configured?"#25D366":"var(--warning)",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,color:"#000",flexShrink:0}}>{configured?"ACTIVE":"SETUP"}</div>
              </div>
              {!configured&&(
                <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.75,padding:"12px 0 0",borderTop:"1px solid var(--border)",marginTop:10}}>
                  <div style={{fontWeight:700,color:"var(--neon)",marginBottom:6,fontSize:13}}>📋 Setup Guide (FREE Twilio Trial):</div>
                  <div>1️⃣  Sign up free at <strong style={{color:"var(--neon2)"}}>twilio.com</strong></div>
                  <div>2️⃣  Go to <strong>Messaging → Try it out → Send a WhatsApp message</strong></div>
                  <div>3️⃣  Member must join Twilio sandbox first (one-time)</div>
                  <div>4️⃣  Copy your <strong>Account SID</strong> &amp; <strong>Auth Token</strong> from dashboard</div>
                  <div>5️⃣  Enter them below and save ✅</div>
                </div>
              )}
            </div>

            {/* Credentials form */}
            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div className="card-title" style={{margin:0}}>🔐 Twilio Credentials</div>
                {!editingWA&&<button className="btn-secondary" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>{setWaDraft({...whatsappConfig});setEditingWA(true);}}>✏️ Edit</button>}
              </div>
              {editingWA ? (
                <div>
                  {[
                    {k:"accountSid",l:"Account SID",ph:"ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",tp:"text"},
                    {k:"authToken", l:"Auth Token", ph:"Your Twilio Auth Token",tp:"password"},
                    {k:"fromNumber",l:"From Number (Sandbox default)",ph:"whatsapp:+14155238886",tp:"text"},
                  ].map(({k,l,ph,tp})=>(
                    <div key={k} className="input-group">
                      <label className="input-label">{l}</label>
                      <input className="input-field" placeholder={ph} type={tp} value={waDraft[k]} onChange={e=>setWaDraft(p=>({...p,[k]:e.target.value}))}/>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <button className="btn-primary" style={{flex:1}} onClick={()=>{setWhatsappConfig({...waDraft});setEditingWA(false);showToast("✅ WhatsApp config saved!");}}>💾 Save Config</button>
                    <button className="btn-secondary" style={{flex:1}} onClick={()=>setEditingWA(false)}>Cancel</button>
                  </div>
                </div>
              ):(
                <div>
                  <div className="info-row"><span className="info-key">Account SID</span><span className="info-val">{whatsappConfig.accountSid?`AC...${whatsappConfig.accountSid.slice(-6)}`:"❌ Not set"}</span></div>
                  <div className="info-row"><span className="info-key">Auth Token</span><span className="info-val">{whatsappConfig.authToken?"••••••••••••":"❌ Not set"}</span></div>
                  <div className="info-row"><span className="info-key">From Number</span><span className="info-val" style={{fontSize:11}}>{whatsappConfig.fromNumber}</span></div>
                </div>
              )}
            </div>

            {/* Message Template Preview */}
            <div className="card">
              <div className="card-title">📋 Message Template Preview</div>
              <div style={{background:"#0b2027",border:"1px solid #25D36633",borderRadius:14,padding:14,fontSize:11,color:"rgba(255,255,255,0.85)",lineHeight:1.9,fontFamily:"monospace"}}>
                🏋️ <strong>Welcome to Crossfit Gym!</strong><br/><br/>
                Hello <span style={{color:"#25D366"}}>*[Member Name]*</span>, your membership is active! 🎉<br/><br/>
                ━━━━━━━━━━━━━━━━<br/>
                📋 <strong>MEMBERSHIP DETAILS</strong><br/>
                ━━━━━━━━━━━━━━━━<br/>
                📅 Joining: <span style={{color:"#25D366"}}>*[Join Date]*</span><br/>
                💎 Plan: <span style={{color:"#25D366"}}>*[Plan]*</span><br/>
                💰 Fee: ₹<span style={{color:"#25D366"}}>*[Fees]*</span>/mo<br/>
                📆 Next Payment: <span style={{color:"#25D366"}}>*[Due Date]*</span><br/><br/>
                ━━━━━━━━━━━━━━━━<br/>
                🔐 <strong>YOUR LOGIN</strong><br/>
                ━━━━━━━━━━━━━━━━<br/>
                👤 Username: <span style={{color:"#25D366"}}>*[Username]*</span><br/>
                🔑 Password: <span style={{color:"#25D366"}}>*[Password]*</span><br/><br/>
                💪 Stay consistent, stay strong!
              </div>
            </div>

            {/* Test message sender */}
            {configured&&(
              <div className="card">
                <div className="card-title">🧪 Send Test Message</div>
                <div style={{fontSize:12,color:"var(--text2)",marginBottom:12}}>Send a sample message to verify your Twilio setup is working</div>
                <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                  <div style={{flex:1}}>
                    <label className="input-label">📱 Test Number (+91)</label>
                    <input className="input-field" placeholder="10-digit number" maxLength={10} type="tel" value={testPhone} onChange={e=>setTestPhone(e.target.value.replace(/[^0-9]/g,""))}/>
                  </div>
                  <button onClick={sendTestMsg} disabled={testLoading} style={{padding:"14px 16px",background:testLoading?"var(--bg3)":"linear-gradient(135deg,#075e54,#128c7e)",border:`1px solid ${testLoading?"var(--border)":"#25D366"}`,borderRadius:12,color:testLoading?"var(--text3)":"#fff",fontFamily:"Rajdhani,sans-serif",fontSize:14,fontWeight:700,cursor:testLoading?"not-allowed":"pointer",transition:"all 0.2s"}}>
                    {testLoading?"⏳ Sending…":"📲 Send Test"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Delivery Logs tab ── */}
        {settingsTab==="logs"&&role==="owner"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 16px 12px"}}>
              <div>
                <div style={{fontFamily:"Rajdhani",fontSize:18,fontWeight:700}}>WhatsApp Delivery Log</div>
                <div style={{fontSize:12,color:"var(--text2)"}}>{whatsappLogs.length} messages tracked</div>
              </div>
              {whatsappLogs.length>0&&<button className="btn-secondary" style={{fontSize:11,padding:"5px 10px"}} onClick={()=>setWhatsappLogs([])}>🗑️ Clear</button>}
            </div>

            {/* Summary stats */}
            {whatsappLogs.length>0&&(
              <div style={{display:"flex",gap:8,padding:"0 16px 12px"}}>
                {[
                  {label:"Sent",    count:whatsappLogs.filter(l=>l.status==="sent").length,    color:"#25D366"},
                  {label:"Failed",  count:whatsappLogs.filter(l=>l.status==="failed"||l.status==="error").length, color:"var(--danger)"},
                  {label:"Skipped", count:whatsappLogs.filter(l=>l.status==="skipped").length, color:"var(--warning)"},
                ].map(s=>(
                  <div key={s.label} style={{flex:1,background:"var(--card)",border:`1px solid ${s.color}33`,borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700,color:s.color}}>{s.count}</div>
                    <div style={{fontSize:10,color:"var(--text2)"}}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {whatsappLogs.length===0 ? (
              <div className="card" style={{textAlign:"center",padding:"32px 16px"}}>
                <div style={{fontSize:40,marginBottom:12}}>📭</div>
                <div style={{fontFamily:"Rajdhani",fontSize:18,fontWeight:700,marginBottom:6}}>No Messages Yet</div>
                <div style={{fontSize:13,color:"var(--text2)"}}>Add a member to see delivery logs here</div>
              </div>
            ):(
              <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:8}}>
                {whatsappLogs.map(log=>(
                  <div key={log.id} style={{background:"var(--card)",border:`1px solid ${(statusColor[log.status]||"var(--border)")}22`,borderLeft:`3px solid ${statusColor[log.status]||"var(--border)"}`,borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:12}}>
                    <div style={{fontSize:22,flexShrink:0,lineHeight:1}}>{statusIcon[log.status]||"•"}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <div style={{fontFamily:"Rajdhani",fontSize:15,fontWeight:700,color:"var(--text)"}}>{log.member}</div>
                        <div style={{background:`${statusColor[log.status]||"var(--border)"}20`,border:`1px solid ${statusColor[log.status]||"var(--border)"}40`,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,color:statusColor[log.status]||"var(--text2)"}}>{log.status.toUpperCase()}</div>
                      </div>
                      <div style={{fontSize:11,color:"var(--text2)",marginBottom:2}}>📱 +91 {log.phone}&nbsp;&nbsp;🕐 {log.time}</div>
                      {log.sid&&<div style={{fontSize:10,color:"var(--text3)"}}>SID: {log.sid}</div>}
                      {log.reason&&<div style={{fontSize:11,color:"var(--warning)",marginTop:3}}>ℹ️ {log.reason}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
                <div className="member-avatar" style={{width:56,height:56,fontSize:28}}>{m.gender==="Female"?"👩":"👨"}</div>
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
      <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setModal(null);setNewMemberPhoto(null);setShowPhotoOptions(false);}}}>
        <div className="modal-sheet" style={{maxHeight:"92vh",overflowY:"auto"}}>
          <div className="modal-handle"/>
          <div className="modal-title">➕ Add New Member</div>

          {/* ── Photo Picker ── */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20}}>
            {/* Avatar preview */}
            <div style={{
              width:96,height:96,borderRadius:24,
              background:newMemberPhoto?"transparent":"linear-gradient(135deg,var(--bg3),var(--card2))",
              border:`3px solid ${newMemberPhoto?"var(--neon)":"var(--border)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:44,marginBottom:12,overflow:"hidden",
              boxShadow:newMemberPhoto?"0 0 20px rgba(0,255,136,0.3)":"none",
              transition:"all 0.3s",position:"relative",cursor:"pointer",
            }} onClick={()=>setShowPhotoOptions(p=>!p)}>
              {newMemberPhoto
                ? <img src={newMemberPhoto} alt="Member" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : "👤"
              }
              {/* Edit overlay */}
              <div style={{
                position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",
                display:"flex",alignItems:"center",justifyContent:"center",
                opacity:0,transition:"opacity 0.2s",borderRadius:21,
              }}
                onMouseEnter={e=>e.currentTarget.style.opacity=1}
                onMouseLeave={e=>e.currentTarget.style.opacity=0}
              >
                <span style={{fontSize:20}}>✏️</span>
              </div>
            </div>

            {/* Photo action buttons */}
            {!showPhotoOptions ? (
              <button onClick={()=>setShowPhotoOptions(true)} style={{
                display:"flex",alignItems:"center",gap:6,
                background:"var(--card2)",border:"1px solid var(--border)",
                borderRadius:20,padding:"7px 16px",cursor:"pointer",
                fontSize:13,color:"var(--text2)",fontWeight:600,transition:"all 0.2s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--neon)";e.currentTarget.style.color="var(--neon)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text2)";}}
              >
                <span style={{fontSize:16}}>📸</span>
                {newMemberPhoto ? "Change Photo" : "Add Photo (Optional)"}
              </button>
            ) : (
              <div style={{
                display:"flex",gap:10,animation:"slideUp 0.2s ease",
              }}>
                {/* Camera option */}
                <label style={{
                  display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                  background:"var(--card)",border:"2px solid var(--neon)",
                  borderRadius:16,padding:"14px 20px",cursor:"pointer",
                  transition:"all 0.2s",boxShadow:"0 0 16px rgba(0,255,136,0.2)",
                }}>
                  <input type="file" accept="image/*" capture="environment" style={{display:"none"}}
                    onChange={e=>{
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement("canvas");
                          const size = 200;
                          canvas.width = size; canvas.height = size;
                          const ctx = canvas.getContext("2d");
                          const scale = Math.max(size/img.width, size/img.height);
                          const w = img.width*scale, h = img.height*scale;
                          ctx.drawImage(img, (size-w)/2, (size-h)/2, w, h);
                          setNewMemberPhoto(canvas.toDataURL("image/jpeg", 0.7));
                          setShowPhotoOptions(false);
                        };
                        img.src = ev.target.result;
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <span style={{fontSize:32}}>📷</span>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--neon)"}}>Camera</span>
                  <span style={{fontSize:10,color:"var(--text3)"}}>Take photo</span>
                </label>

                {/* Gallery option */}
                <label style={{
                  display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                  background:"var(--card)",border:"2px solid var(--neon2)",
                  borderRadius:16,padding:"14px 20px",cursor:"pointer",
                  transition:"all 0.2s",boxShadow:"0 0 16px rgba(0,212,255,0.2)",
                }}>
                  <input type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>{
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement("canvas");
                          const size = 200;
                          canvas.width = size; canvas.height = size;
                          const ctx = canvas.getContext("2d");
                          const scale = Math.max(size/img.width, size/img.height);
                          const w = img.width*scale, h = img.height*scale;
                          ctx.drawImage(img, (size-w)/2, (size-h)/2, w, h);
                          setNewMemberPhoto(canvas.toDataURL("image/jpeg", 0.7));
                          setShowPhotoOptions(false);
                        };
                        img.src = ev.target.result;
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <span style={{fontSize:32}}>🖼️</span>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--neon2)"}}>Gallery</span>
                  <span style={{fontSize:10,color:"var(--text3)"}}>Choose file</span>
                </label>

                {/* Remove / Cancel */}
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {newMemberPhoto&&(
                    <button onClick={()=>{setNewMemberPhoto(null);setShowPhotoOptions(false);}} style={{
                      display:"flex",flexDirection:"column",alignItems:"center",gap:4,
                      background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.3)",
                      borderRadius:12,padding:"10px 14px",cursor:"pointer",color:"var(--danger)",fontSize:11,fontWeight:700,
                    }}>
                      <span style={{fontSize:22}}>🗑️</span>Remove
                    </button>
                  )}
                  <button onClick={()=>setShowPhotoOptions(false)} style={{
                    display:"flex",flexDirection:"column",alignItems:"center",gap:4,
                    background:"var(--card2)",border:"1px solid var(--border)",
                    borderRadius:12,padding:"10px 14px",cursor:"pointer",color:"var(--text3)",fontSize:11,
                  }}>
                    <span style={{fontSize:22}}>✖️</span>Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Basic fields */}
          {[
            {f:"name",    label:"Full Name",    icon:"👤", type:"text",     ph:"e.g. Rahul Sharma"},
            {f:"username",label:"Username",     icon:"🔖", type:"text",     ph:"e.g. rahul123"},
            {f:"password",label:"Password",     icon:"🔑", type:"password", ph:"Min 6 characters"},
          ].map(({f,label,icon,type,ph})=>(
            <div key={f} className="input-group">
              <label className="input-label">{icon} {label}</label>
              <input className="input-field" placeholder={ph} type={type} value={newMember[f]} onChange={e=>setNewMember(p=>({...p,[f]:e.target.value}))}/>
            </div>
          ))}

          {/* Phone field */}
          <div className="input-group">
            <label className="input-label">📱 Mobile Number <span style={{color:"#25D366",fontSize:10,fontWeight:700,marginLeft:4}}>● WhatsApp</span></label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"var(--text2)",fontWeight:600}}>+91</span>
              <input className="input-field" placeholder="10-digit mobile number" type="tel" maxLength={10}
                style={{paddingLeft:46}}
                value={newMember.phone} onChange={e=>setNewMember(p=>({...p,phone:e.target.value.replace(/[^0-9]/g,"")}))}/>
            </div>
            <div style={{fontSize:10,color:"#25D366",marginTop:4,display:"flex",alignItems:"center",gap:4}}>
              <span>📲</span>
              {whatsappConfig.accountSid
                ? "Welcome WhatsApp message will be sent automatically"
                : "⚙️ Configure Twilio in Settings → WhatsApp to enable"}
            </div>
          </div>

          <div className="two-col" style={{gap:10}}>
            <div className="input-group" style={{margin:0}}>
              <label className="input-label">💎 Plan</label>
              <select className="input-field" value={newMember.plan} onChange={e=>setNewMember(p=>({...p,plan:e.target.value}))}>
                <option>Basic</option><option>Premium</option>
              </select>
            </div>
            <div className="input-group" style={{margin:0}}>
              <label className="input-label">💰 Monthly Fee (₹)</label>
              <input className="input-field" value={newMember.fees} onChange={e=>setNewMember(p=>({...p,fees:e.target.value}))}/>
            </div>
          </div>

          {/* Date of Joining */}
          <div className="input-group">
            <label className="input-label">📅 Date of Joining</label>
            <input
              className="input-field"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={newMember.joinDate}
              onChange={e=>setNewMember(p=>({...p,joinDate:e.target.value}))}
            />
            <div style={{fontSize:10,color:"var(--text3)",marginTop:4}}>
              📆 Next due date auto-calculates 30 days from joining
            </div>
          </div>

          {/* WhatsApp preview */}
          {whatsappConfig.accountSid && newMember.phone && newMember.phone.length===10 && (
            <div style={{marginTop:14,background:"linear-gradient(135deg,#075e54,#128c7e)",borderRadius:14,padding:14,border:"1px solid #25D366"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:18}}>📲</span>
                <div style={{fontFamily:"Rajdhani",fontSize:14,fontWeight:700,color:"#fff"}}>WhatsApp Preview</div>
                <div style={{marginLeft:"auto",background:"#25D366",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#fff"}}>LIVE</div>
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",lineHeight:1.5}}>
                Will send to <strong style={{color:"#25D366"}}>+91 {newMember.phone}</strong><br/>
                Member: <strong>{newMember.name||"[Name]"}</strong> | Plan: <strong>{newMember.plan}</strong> | ₹{newMember.fees}/mo
              </div>
            </div>
          )}

          <button className="btn-primary" style={{marginTop:16}} onClick={addMember}>
            {whatsappConfig.accountSid && newMember.phone ? "➕ Add & Send WhatsApp 📱" : "➕ Add Member"}
          </button>
        </div>
      </div>
    );
    return null;
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ATTENDANCE PAGE  — full month grid, Firebase-backed
  // ══════════════════════════════════════════════════════════════════════════
  const AttendancePage = () => {
    const today      = new Date();
    const [viewYear,  setViewYear]  = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based
    const [attData,   setAttData]   = useState({});  // { "memberId_YYYY-MM-DD": "P"|"A" }
    const [loading,   setLoading]   = useState(true);
    const [saving,    setSaving]    = useState(null); // "memberId_date" being saved
    const [search,    setSearch]    = useState("");
    const [viewMode,  setViewMode]  = useState("grid"); // "grid" | "summary"

    const MONTH_NAMES = ["January","February","March","April","May","June",
                         "July","August","September","October","November","December"];

    // Days in selected month
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayStr    = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

    const dayStr = (d) =>
      `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

    const key = (memberId, d) => `${memberId}_${dayStr(d)}`;

    // ── Load attendance from Firebase (attendance collection) ──────────────
    useEffect(() => {
      setLoading(true);
      const monthPrefix = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}`;
      const unsub = onSnapshot(collection(db, "attendance"), snap => {
        const data = {};
        snap.forEach(docSnap => {
          const d = docSnap.data();
          // doc ID format:  memberId_YYYY-MM-DD
          if (d.date && d.date.startsWith(monthPrefix)) {
            data[`${d.memberId}_${d.date}`] = d.status;
          }
        });
        setAttData(data);
        setLoading(false);
      });
      return () => unsub();
    }, [viewMonth, viewYear]);

    // ── Toggle P / A ───────────────────────────────────────────────────────
    const toggle = async (memberId, d) => {
      if (role !== "owner") return;
      const dateStr = dayStr(d);
      const k       = `${memberId}_${dateStr}`;
      const current = attData[k] || "";
      const next    = current === "P" ? "A" : "P";
      setSaving(k);
      const docId = `${memberId}_${dateStr}`;
      await setDoc(doc(db, "attendance", docId), {
        memberId, date: dateStr, status: next,
        updatedAt: new Date().toISOString(),
      });
      setSaving(null);
    };

    // ── Stats helpers ───────────────────────────────────────────────────────
    const memberPresent = (memberId) =>
      Array.from({length:daysInMonth},(_,i)=>i+1)
        .filter(d => attData[key(memberId,d)] === "P").length;

    const dayPresent = (d) =>
      members.filter(m => attData[key(m.id,d)] === "P").length;

    const filteredMembers = members.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );

    // ── Month navigator ─────────────────────────────────────────────────────
    const prevMonth = () => {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(y=>y-1); }
      else setViewMonth(m=>m-1);
    };
    const nextMonth = () => {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(y=>y+1); }
      else setViewMonth(m=>m+1);
    };
    const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();
    const isFuture = new Date(viewYear, viewMonth) > new Date(today.getFullYear(), today.getMonth());

    // ── Cell component ──────────────────────────────────────────────────────
    const Cell = ({ memberId, d }) => {
      const dateStr = dayStr(d);
      const k       = `${memberId}_${dateStr}`;
      const status  = attData[k] || "";
      const isToday = dateStr === todayStr;
      const isSav   = saving === k;
      const isPast  = dateStr <= todayStr;
      const isOwner = role === "owner";

      let bg    = "transparent";
      let color = "var(--text3)";
      let txt   = "·";
      if (status === "P") { bg = "rgba(0,200,80,0.18)"; color = "#00c850"; txt = "P"; }
      if (status === "A") { bg = "rgba(255,60,60,0.15)"; color = "#ff4444"; txt = "A"; }

      return (
        <td
          onClick={() => isOwner && isPast && toggle(memberId, d)}
          style={{
            width: 28, minWidth: 28, height: 32, textAlign: "center",
            fontSize: 11, fontWeight: 700, fontFamily: "Rajdhani, sans-serif",
            background: bg,
            color: isSav ? "var(--text3)" : color,
            cursor: isOwner && isPast ? "pointer" : "default",
            border: isToday
              ? "1px solid rgba(0,255,136,0.6)"
              : "1px solid transparent",
            borderRadius: 6,
            transition: "all 0.15s",
            position: "relative",
            boxShadow: isToday ? "0 0 8px rgba(0,255,136,0.25)" : "none",
          }}
        >
          {isSav ? "·" : txt}
        </td>
      );
    };

    // ── Totals stats bar ────────────────────────────────────────────────────
    const totalPresent = Object.values(attData).filter(v=>v==="P").length;
    const totalAbsent  = Object.values(attData).filter(v=>v==="A").length;
    const totalMarked  = totalPresent + totalAbsent;
    const totalCells   = members.length * daysInMonth;

    return (
      <div style={{paddingBottom:24}}>

        {/* ── Header ── */}
        <div style={{padding:"14px 16px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontFamily:"Rajdhani",fontSize:22,fontWeight:700}}>Attendance</div>
            <div style={{fontSize:12,color:"var(--text2)"}}>
              {members.length} members · {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
          </div>
          {/* View toggle */}
          <div style={{display:"flex",gap:6}}>
            {["grid","summary"].map(v=>(
              <button key={v} onClick={()=>setViewMode(v)} style={{
                padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",
                border:`1px solid ${viewMode===v?"var(--neon)":"var(--border)"}`,
                background:viewMode===v?"rgba(0,255,136,0.1)":"var(--card2)",
                color:viewMode===v?"var(--neon)":"var(--text2)",transition:"all 0.2s",
              }}>{v==="grid"?"⊞ Grid":"📊 Summary"}</button>
            ))}
          </div>
        </div>

        {/* ── Month navigator ── */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 16px 12px"}}>
          <button onClick={prevMonth} style={{width:34,height:34,borderRadius:10,border:"1px solid var(--border)",background:"var(--card2)",color:"var(--text)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
          <div style={{
            flex:1,textAlign:"center",fontFamily:"Rajdhani",fontSize:17,fontWeight:700,
            padding:"6px 0",borderRadius:12,
            background:isCurrentMonth?"rgba(0,255,136,0.08)":"var(--card2)",
            border:`1px solid ${isCurrentMonth?"rgba(0,255,136,0.3)":"var(--border)"}`,
            color:isCurrentMonth?"var(--neon)":"var(--text)",
          }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
            {isCurrentMonth&&<span style={{fontSize:10,marginLeft:6,color:"var(--neon)",opacity:0.7}}>● TODAY</span>}
          </div>
          <button onClick={nextMonth} style={{width:34,height:34,borderRadius:10,border:"1px solid var(--border)",background:"var(--card2)",color:"var(--text)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
        </div>

        {/* ── Stats strip ── */}
        <div style={{display:"flex",gap:8,padding:"0 16px 12px"}}>
          {[
            {label:"Present",  val:totalPresent, color:"#00c850", bg:"rgba(0,200,80,0.1)"},
            {label:"Absent",   val:totalAbsent,  color:"#ff4444", bg:"rgba(255,68,68,0.1)"},
            {label:"Unmarked", val:totalCells-totalMarked, color:"var(--text3)", bg:"var(--card2)"},
            {label:"Coverage", val:`${totalCells?Math.round((totalMarked/totalCells)*100):0}%`, color:"var(--neon)", bg:"rgba(0,255,136,0.08)"},
          ].map(s=>(
            <div key={s.label} style={{flex:1,background:s.bg,border:`1px solid ${s.color}33`,borderRadius:12,padding:"8px 4px",textAlign:"center"}}>
              <div style={{fontFamily:"Rajdhani",fontSize:18,fontWeight:700,color:s.color}}>{s.val}</div>
              <div style={{fontSize:9,color:"var(--text3)",fontWeight:600}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div style={{padding:"0 16px 10px"}}>
          <input
            className="input-field"
            placeholder="🔍 Search member..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
            style={{margin:0}}
          />
        </div>

        {/* Legend */}
        <div style={{display:"flex",gap:12,padding:"0 16px 10px",alignItems:"center"}}>
          <div style={{fontSize:11,color:"var(--text3)",fontWeight:600}}>Legend:</div>
          {[
            {s:"P", color:"#00c850", bg:"rgba(0,200,80,0.18)", label:"Present"},
            {s:"A", color:"#ff4444", bg:"rgba(255,60,60,0.15)", label:"Absent"},
            {s:"·", color:"var(--text3)", bg:"transparent", label:"Not marked"},
          ].map(l=>(
            <div key={l.s} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:20,height:20,background:l.bg,border:"1px solid var(--border)",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:l.color}}>{l.s}</div>
              <span style={{fontSize:10,color:"var(--text3)"}}>{l.label}</span>
            </div>
          ))}
          {role==="owner"&&<div style={{fontSize:10,color:"var(--text3)",marginLeft:"auto"}}>Tap cell to toggle</div>}
        </div>

        {/* ── GRID VIEW ── */}
        {viewMode==="grid"&&(
          <div style={{padding:"0 16px"}}>
            {loading ? (
              <div style={{textAlign:"center",padding:"40px 0"}}>
                <div className="spinner"/>
                <div style={{fontSize:13,color:"var(--text2)",marginTop:8}}>Loading attendance…</div>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div style={{textAlign:"center",padding:40}}>
                <div style={{fontSize:36,marginBottom:10}}>🔍</div>
                <div style={{fontSize:14,color:"var(--text2)"}}>No members match your search</div>
              </div>
            ) : (
              <div style={{
                background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,
                overflow:"hidden",
              }}>
                <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                  <table style={{borderCollapse:"separate",borderSpacing:"2px",width:"max-content",minWidth:"100%",padding:8}}>
                    <thead>
                      <tr>
                        {/* Name header */}
                        <th style={{
                          position:"sticky",left:0,zIndex:10,
                          background:"var(--bg2)",
                          padding:"8px 10px",textAlign:"left",
                          fontSize:11,fontWeight:700,color:"var(--text3)",
                          letterSpacing:1,whiteSpace:"nowrap",
                          minWidth:110,borderRadius:8,
                        }}>MEMBER</th>
                        {/* Day headers 1–daysInMonth */}
                        {Array.from({length:daysInMonth},(_,i)=>i+1).map(d=>{
                          const ds = dayStr(d);
                          const isT = ds === todayStr;
                          const dow = new Date(viewYear, viewMonth, d).getDay();
                          const isSun = dow === 0;
                          const isSat = dow === 6;
                          return (
                            <th key={d} style={{
                              width:28,minWidth:28,textAlign:"center",
                              fontSize:10,fontWeight:700,padding:"4px 0",
                              color: isT ? "var(--neon)" : (isSun||isSat) ? "var(--warning)" : "var(--text3)",
                              background: isT ? "rgba(0,255,136,0.08)" : "transparent",
                              borderRadius:6,
                              boxShadow: isT ? "0 0 6px rgba(0,255,136,0.2)" : "none",
                            }}>
                              {d}
                            </th>
                          );
                        })}
                        {/* Total header */}
                        <th style={{fontSize:10,fontWeight:700,color:"var(--neon)",textAlign:"center",padding:"4px 6px",whiteSpace:"nowrap"}}>P/Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((m,mi)=>{
                        const pCount = memberPresent(m.id);
                        const pct    = Math.round((pCount/daysInMonth)*100);
                        return (
                          <tr key={m.id} style={{background:mi%2===0?"rgba(255,255,255,0.01)":"transparent"}}>
                            {/* Sticky name cell */}
                            <td style={{
                              position:"sticky",left:0,zIndex:5,
                              background: mi%2===0 ? "var(--bg2)" : "var(--bg)",
                              padding:"6px 10px",whiteSpace:"nowrap",
                              fontSize:12,fontWeight:700,color:"var(--text)",
                              borderRadius:8,
                            }}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <div style={{
                                  width:22,height:22,borderRadius:"50%",overflow:"hidden",
                                  background:"var(--card2)",flexShrink:0,
                                  display:"flex",alignItems:"center",justifyContent:"center",
                                  fontSize:12,
                                }}>
                                  {m.photo
                                    ? <img src={m.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                                    : (m.gender==="Female"?"👩":"👨")
                                  }
                                </div>
                                <span style={{maxWidth:80,overflow:"hidden",textOverflow:"ellipsis"}}>{m.name.split(" ")[0]}</span>
                              </div>
                            </td>
                            {/* Day cells */}
                            {Array.from({length:daysInMonth},(_,i)=>i+1).map(d=>(
                              <Cell key={d} memberId={m.id} d={d}/>
                            ))}
                            {/* Total */}
                            <td style={{textAlign:"center",padding:"0 6px",whiteSpace:"nowrap"}}>
                              <div style={{
                                fontSize:11,fontWeight:700,
                                color: pct>=80?"#00c850" : pct>=50?"var(--warning)":"#ff4444",
                              }}>{pCount}<span style={{fontSize:9,color:"var(--text3)",fontWeight:400}}>/{daysInMonth}</span></div>
                              <div style={{
                                width:30,height:3,background:"var(--bg3)",borderRadius:2,margin:"2px auto 0",overflow:"hidden",
                              }}>
                                <div style={{
                                  height:"100%",borderRadius:2,
                                  background: pct>=80?"#00c850" : pct>=50?"var(--warning)":"#ff4444",
                                  width:`${pct}%`,transition:"width 0.5s",
                                }}/>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Day total row */}
                      <tr style={{borderTop:"1px solid var(--border)"}}>
                        <td style={{
                          position:"sticky",left:0,zIndex:5,
                          background:"var(--bg2)",
                          padding:"6px 10px",
                          fontSize:10,fontWeight:700,color:"var(--neon)",whiteSpace:"nowrap",
                          borderRadius:8,
                        }}>📊 Present</td>
                        {Array.from({length:daysInMonth},(_,i)=>i+1).map(d=>{
                          const cnt  = dayPresent(d);
                          const pct  = members.length ? cnt/members.length : 0;
                          return (
                            <td key={d} style={{textAlign:"center",padding:"4px 0"}}>
                              <div style={{
                                fontSize:10,fontWeight:700,
                                color: pct>=0.8?"#00c850" : pct>=0.5?"var(--warning)" : cnt>0?"#ff4444":"var(--text3)",
                              }}>{cnt||""}</div>
                            </td>
                          );
                        })}
                        <td/>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SUMMARY VIEW ── */}
        {viewMode==="summary"&&(
          <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
            {loading ? (
              <div style={{textAlign:"center",padding:"40px 0"}}><div className="spinner"/></div>
            ) : filteredMembers.map(m=>{
              const pCount = memberPresent(m.id);
              const aCount = Array.from({length:daysInMonth},(_,i)=>i+1)
                .filter(d=>attData[key(m.id,d)]==="A").length;
              const marked  = pCount + aCount;
              const pct     = daysInMonth ? Math.round((pCount/daysInMonth)*100) : 0;
              return (
                <div key={m.id} style={{
                  background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:"14px 16px",
                  display:"flex",alignItems:"center",gap:12,
                }}>
                  <div style={{width:40,height:40,borderRadius:12,overflow:"hidden",background:"var(--card2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                    {m.photo ? <img src={m.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : (m.gender==="Female"?"👩":"👨")}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"Rajdhani",fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:4}}>{m.name}</div>
                    <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,fontWeight:700,color:"#00c850",background:"rgba(0,200,80,0.12)",borderRadius:6,padding:"2px 7px"}}>✅ {pCount}P</span>
                      <span style={{fontSize:10,fontWeight:700,color:"#ff4444",background:"rgba(255,68,68,0.1)",borderRadius:6,padding:"2px 7px"}}>❌ {aCount}A</span>
                      <span style={{fontSize:10,fontWeight:700,color:"var(--text3)",background:"var(--bg3)",borderRadius:6,padding:"2px 7px"}}>· {daysInMonth-marked} unmarked</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1,height:5,background:"var(--bg3)",borderRadius:3,overflow:"hidden"}}>
                        <div style={{
                          height:"100%",borderRadius:3,transition:"width 0.5s",
                          background: pct>=80?"linear-gradient(90deg,#00c850,#00ff88)" : pct>=50?"linear-gradient(90deg,var(--warning),#ffaa00)":"linear-gradient(90deg,#ff4444,#cc0000)",
                          width:`${pct}%`,
                        }}/>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:pct>=80?"#00c850":pct>=50?"var(--warning)":"#ff4444",flexShrink:0}}>{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Owner hint */}
        {role==="owner"&&!isFuture&&(
          <div style={{margin:"14px 16px 0",background:"rgba(0,255,136,0.04)",border:"1px solid rgba(0,255,136,0.15)",borderRadius:12,padding:"10px 14px",display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:14}}>💡</span>
            <span style={{fontSize:11,color:"var(--text2)"}}>
              Tap any cell to toggle between <strong style={{color:"#00c850"}}>Present (P)</strong> and <strong style={{color:"#ff4444"}}>Absent (A)</strong>. Today's column is highlighted in green.
            </span>
          </div>
        )}
      </div>
    );
  };

  const ownerTabs = [{id:"dashboard",icon:"🏠",label:"Home"},{id:"members",icon:"👥",label:"Members"},{id:"attendance",icon:"📋",label:"Attend."},{id:"aiplan",icon:"🥗",label:"Diet Plan"},{id:"settings",icon:"⚙️",label:"Settings"}];
  const memberTabs = [{id:"dashboard",icon:"🏠",label:"Home"},{id:"workout",icon:"💪",label:"Workout"},{id:"aiplan",icon:"🥗",label:"Diet Plan"},{id:"profile",icon:"👤",label:"Profile"},{id:"settings",icon:"⚙️",label:"Settings"}];
  const tabs = role==="owner"?ownerTabs:memberTabs;

  const renderContent = () => {
    if (role==="owner") {
      if (activeTab==="dashboard") return <OwnerDashboard/>;
      if (activeTab==="members") return <OwnerMembers/>;
      if (activeTab==="analytics") return <OwnerAnalytics/>;
      if (activeTab==="attendance") return <AttendancePage/>;
      if (activeTab==="aiplan") return <AIPlanSection user={user} members={members} showToast={showToast}/>;
      if (activeTab==="settings") return <SettingsSection/>;
    } else {
      if (activeTab==="dashboard") return <MemberDashboard/>;
      if (activeTab==="workout") return <MemberWorkout/>;
      if (activeTab==="attendance") return <AttendancePage/>;
      if (activeTab==="aiplan") return <AIPlanSection user={user} members={members} showToast={showToast}/>;
      if (activeTab==="profile") return <MemberProfile/>;
      if (activeTab==="settings") return <SettingsSection/>;
    }
    return null;
  };

  const pageTitles = {dashboard:"CROSSFIT",members:"Members",analytics:"Analytics",attendance:"Attendance",aiplan:"Diet Plan",settings:"Settings",workout:"Workouts",profile:"Profile"};

  return (
    <div data-theme={theme} style={{height:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
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
