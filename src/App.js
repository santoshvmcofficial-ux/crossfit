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

const MONTHLY_REVENUE = [
  { month: "Sep", revenue: 28000 }, { month: "Oct", revenue: 35000 },
  { month: "Nov", revenue: 42000 }, { month: "Dec", revenue: 38000 },
  { month: "Jan", revenue: 51000 }, { month: "Feb", revenue: 47000 },
];

const WORKOUT_PLANS = {
  beginner: {
    label:"Beginner", icon:"🌱", color:"#00ff88",
    desc:"Simple movements, light weights, form focus",
    schedule:{
      0:{day:"Sunday",focus:"Rest & Recovery 😌",color:"#8b5cf6",exercises:[
        {name:"Light Walk",sets:"1 set",reps:"20 min",muscle:"Cardio"},
        {name:"Foam Rolling",sets:"10 min",reps:"Full body",muscle:"Recovery"},
        {name:"Child's Pose",sets:"3 sets",reps:"60 sec",muscle:"Back"},
        {name:"Cat-Cow Stretch",sets:"3 sets",reps:"10 reps",muscle:"Spine"},
        {name:"Hip Flexor Stretch",sets:"3 sets",reps:"45 sec",muscle:"Hips"},
        {name:"Deep Breathing",sets:"5 min",reps:"Box breathing",muscle:"Mind"},
        {name:"Light Stretching",sets:"3 sets",reps:"30 sec each",muscle:"Flexibility"},
        {name:"Neck Rolls",sets:"2 sets",reps:"10 each side",muscle:"Neck"},
      ]},
      1:{day:"Monday",focus:"Chest Day 💪",color:"#00ff88",exercises:[
        {name:"Wall Push-Ups",sets:"3 sets",reps:"15 reps",muscle:"Chest"},
        {name:"Knee Push-Ups",sets:"3 sets",reps:"12 reps",muscle:"Chest & Arms"},
        {name:"DB Chest Press",sets:"3 sets",reps:"12 reps",muscle:"Chest"},
        {name:"Chest Flyes (Light)",sets:"3 sets",reps:"12 reps",muscle:"Chest"},
        {name:"Incline Push-Ups",sets:"3 sets",reps:"10 reps",muscle:"Upper Chest"},
        {name:"Dips (Assisted)",sets:"2 sets",reps:"8 reps",muscle:"Lower Chest"},
        {name:"Chest Stretch",sets:"3 sets",reps:"30 sec",muscle:"Chest Flexibility"},
        {name:"Deep Breathing",sets:"1 set",reps:"5 min",muscle:"Cool Down"},
      ]},
      2:{day:"Tuesday",focus:"Back Day 🏋️",color:"#00d4ff",exercises:[
        {name:"Band Pull-Aparts",sets:"3 sets",reps:"15 reps",muscle:"Upper Back"},
        {name:"Assisted Pull-Ups",sets:"3 sets",reps:"6 reps",muscle:"Lats"},
        {name:"Dumbbell Row",sets:"3 sets",reps:"10 reps",muscle:"Mid Back"},
        {name:"Lat Pulldown (Light)",sets:"3 sets",reps:"12 reps",muscle:"Lats"},
        {name:"Superman Hold",sets:"3 sets",reps:"10 reps",muscle:"Lower Back"},
        {name:"Seated Cable Row",sets:"3 sets",reps:"12 reps",muscle:"Back"},
        {name:"Cat-Cow Stretch",sets:"2 sets",reps:"10 reps",muscle:"Spine"},
        {name:"Child's Pose",sets:"2 sets",reps:"60 sec",muscle:"Back Stretch"},
      ]},
      3:{day:"Wednesday",focus:"Arms Day 💥",color:"#ff6b35",exercises:[
        {name:"Dumbbell Curl",sets:"3 sets",reps:"12 reps",muscle:"Biceps"},
        {name:"Hammer Curl",sets:"3 sets",reps:"12 reps",muscle:"Brachialis"},
        {name:"Tricep Pushdown",sets:"3 sets",reps:"12 reps",muscle:"Triceps"},
        {name:"Overhead Tricep Ext",sets:"3 sets",reps:"12 reps",muscle:"Triceps"},
        {name:"Concentration Curl",sets:"2 sets",reps:"10 reps",muscle:"Biceps Peak"},
        {name:"Tricep Dips (Bench)",sets:"2 sets",reps:"10 reps",muscle:"Triceps"},
        {name:"Wrist Curls",sets:"2 sets",reps:"15 reps",muscle:"Forearms"},
        {name:"Arm Stretch",sets:"2 sets",reps:"30 sec",muscle:"Flexibility"},
      ]},
      4:{day:"Thursday",focus:"Shoulders Day 🎯",color:"#ffd700",exercises:[
        {name:"DB Shoulder Press",sets:"3 sets",reps:"12 reps",muscle:"All Delts"},
        {name:"Lateral Raises",sets:"3 sets",reps:"15 reps",muscle:"Side Delts"},
        {name:"Front Raises",sets:"3 sets",reps:"12 reps",muscle:"Front Delts"},
        {name:"Rear Delt Flyes",sets:"3 sets",reps:"15 reps",muscle:"Rear Delts"},
        {name:"Band Pull-Aparts",sets:"3 sets",reps:"15 reps",muscle:"Rear Delts"},
        {name:"Shrugs (Light)",sets:"3 sets",reps:"15 reps",muscle:"Traps"},
        {name:"Neck Stretch",sets:"2 sets",reps:"30 sec",muscle:"Neck & Traps"},
        {name:"Shoulder Circles",sets:"2 sets",reps:"20 reps",muscle:"Mobility"},
      ]},
      5:{day:"Friday",focus:"Legs Day 🦵",color:"#ff4444",exercises:[
        {name:"Bodyweight Squat",sets:"3 sets",reps:"15 reps",muscle:"Quads"},
        {name:"Walking Lunges",sets:"3 sets",reps:"10 each leg",muscle:"Legs"},
        {name:"Leg Press (Light)",sets:"3 sets",reps:"12 reps",muscle:"Quads"},
        {name:"Lying Leg Curl",sets:"3 sets",reps:"12 reps",muscle:"Hamstrings"},
        {name:"Glute Bridges",sets:"3 sets",reps:"15 reps",muscle:"Glutes"},
        {name:"Step-Ups",sets:"3 sets",reps:"10 each leg",muscle:"Legs"},
        {name:"Calf Raises",sets:"3 sets",reps:"20 reps",muscle:"Calves"},
        {name:"Hip Flexor Stretch",sets:"2 sets",reps:"45 sec",muscle:"Cool Down"},
      ]},
      6:{day:"Saturday",focus:"Core & Cardio ⚡",color:"#8b5cf6",exercises:[
        {name:"Plank Hold",sets:"3 sets",reps:"30 sec",muscle:"Core"},
        {name:"Crunches",sets:"3 sets",reps:"15 reps",muscle:"Abs"},
        {name:"Leg Raises",sets:"3 sets",reps:"10 reps",muscle:"Lower Abs"},
        {name:"Russian Twists",sets:"3 sets",reps:"15 reps",muscle:"Obliques"},
        {name:"Mountain Climbers",sets:"3 sets",reps:"20 sec",muscle:"Core & Cardio"},
        {name:"Jumping Jacks",sets:"3 sets",reps:"30 reps",muscle:"Full Body"},
        {name:"Brisk Walk",sets:"1 set",reps:"15 min",muscle:"Cardio"},
        {name:"Deep Breathing",sets:"1 set",reps:"5 min",muscle:"Cool Down"},
      ]},
    }
  },
  intermediate:{
    label:"Intermediate", icon:"🔥", color:"#ff6b35",
    desc:"Progressive overload, compound lifts, moderate intensity",
    schedule:{
      0:{day:"Sunday",focus:"Active Recovery 🧘",color:"#8b5cf6",exercises:[
        {name:"Foam Rolling",sets:"15 min",reps:"Full body",muscle:"Recovery"},
        {name:"Light Stretching",sets:"3 sets",reps:"30 sec each",muscle:"Flexibility"},
        {name:"Yoga Flow",sets:"20 min",reps:"Full body",muscle:"Mind & Body"},
        {name:"Hip Flexor Stretch",sets:"3 sets",reps:"45 sec",muscle:"Hips"},
        {name:"Cat-Cow Stretch",sets:"3 sets",reps:"10 reps",muscle:"Spine"},
        {name:"Deep Breathing",sets:"5 min",reps:"Box breathing",muscle:"Mind"},
        {name:"Light Walk",sets:"1 set",reps:"30 min",muscle:"Cardio"},
        {name:"Meditation",sets:"1 set",reps:"10 min",muscle:"Mental Recovery"},
      ]},
      1:{day:"Monday",focus:"Chest Day 💪",color:"#00ff88",exercises:[
        {name:"Bench Press",sets:"4 sets",reps:"8-10 reps",muscle:"Chest"},
        {name:"Incline DB Press",sets:"3 sets",reps:"10-12 reps",muscle:"Upper Chest"},
        {name:"Cable Flyes",sets:"3 sets",reps:"12-15 reps",muscle:"Chest"},
        {name:"Push-Ups",sets:"3 sets",reps:"15-20 reps",muscle:"Chest & Triceps"},
        {name:"Dips",sets:"3 sets",reps:"10-12 reps",muscle:"Lower Chest"},
        {name:"Chest Press Machine",sets:"3 sets",reps:"12 reps",muscle:"Chest"},
        {name:"Pec Deck",sets:"3 sets",reps:"15 reps",muscle:"Inner Chest"},
        {name:"Chest Stretch",sets:"2 sets",reps:"30 sec",muscle:"Cool Down"},
      ]},
      2:{day:"Tuesday",focus:"Back Day 🏋️",color:"#00d4ff",exercises:[
        {name:"Deadlift",sets:"4 sets",reps:"6-8 reps",muscle:"Full Back"},
        {name:"Pull-Ups",sets:"4 sets",reps:"8-10 reps",muscle:"Lats"},
        {name:"Barbell Row",sets:"3 sets",reps:"8-10 reps",muscle:"Mid Back"},
        {name:"Lat Pulldown",sets:"3 sets",reps:"12 reps",muscle:"Lats"},
        {name:"Seated Cable Row",sets:"3 sets",reps:"12 reps",muscle:"Back"},
        {name:"Face Pulls",sets:"3 sets",reps:"15 reps",muscle:"Rear Delts"},
        {name:"T-Bar Row",sets:"3 sets",reps:"10 reps",muscle:"Thickness"},
        {name:"Back Stretch",sets:"2 sets",reps:"30 sec",muscle:"Cool Down"},
      ]},
      3:{day:"Wednesday",focus:"Arms Day 💥",color:"#ff6b35",exercises:[
        {name:"Barbell Curl",sets:"4 sets",reps:"10-12 reps",muscle:"Biceps"},
        {name:"Hammer Curl",sets:"3 sets",reps:"12 reps",muscle:"Brachialis"},
        {name:"Incline DB Curl",sets:"3 sets",reps:"12 reps",muscle:"Biceps Stretch"},
        {name:"Tricep Dips",sets:"4 sets",reps:"10-12 reps",muscle:"Triceps"},
        {name:"Skull Crushers",sets:"3 sets",reps:"10-12 reps",muscle:"Triceps"},
        {name:"Tricep Pushdown",sets:"3 sets",reps:"15 reps",muscle:"Triceps"},
        {name:"Concentration Curl",sets:"3 sets",reps:"12 reps",muscle:"Biceps Peak"},
        {name:"Arm Stretch",sets:"2 sets",reps:"30 sec",muscle:"Cool Down"},
      ]},
      4:{day:"Thursday",focus:"Shoulders Day 🎯",color:"#ffd700",exercises:[
        {name:"Overhead Press",sets:"4 sets",reps:"8-10 reps",muscle:"All Delts"},
        {name:"Arnold Press",sets:"3 sets",reps:"10-12 reps",muscle:"Full Shoulder"},
        {name:"Lateral Raises",sets:"4 sets",reps:"12-15 reps",muscle:"Side Delts"},
        {name:"Front Raises",sets:"3 sets",reps:"12 reps",muscle:"Front Delts"},
        {name:"Rear Delt Flyes",sets:"3 sets",reps:"15 reps",muscle:"Rear Delts"},
        {name:"Shrugs",sets:"4 sets",reps:"15 reps",muscle:"Traps"},
        {name:"Upright Row",sets:"3 sets",reps:"12 reps",muscle:"Side Delts & Traps"},
        {name:"Shoulder Stretch",sets:"2 sets",reps:"30 sec",muscle:"Cool Down"},
      ]},
      5:{day:"Friday",focus:"Legs Day 🦵",color:"#ff4444",exercises:[
        {name:"Barbell Squat",sets:"4 sets",reps:"8-10 reps",muscle:"Quads & Glutes"},
        {name:"Romanian Deadlift",sets:"3 sets",reps:"10-12 reps",muscle:"Hamstrings"},
        {name:"Leg Press",sets:"4 sets",reps:"12 reps",muscle:"Quads"},
        {name:"Walking Lunges",sets:"3 sets",reps:"12 each leg",muscle:"Legs"},
        {name:"Leg Curl",sets:"3 sets",reps:"12-15 reps",muscle:"Hamstrings"},
        {name:"Leg Extension",sets:"3 sets",reps:"15 reps",muscle:"Quads"},
        {name:"Calf Raises",sets:"5 sets",reps:"20 reps",muscle:"Calves"},
        {name:"Hip Flexor Stretch",sets:"2 sets",reps:"45 sec",muscle:"Cool Down"},
      ]},
      6:{day:"Saturday",focus:"Core & Cardio ⚡",color:"#8b5cf6",exercises:[
        {name:"Plank",sets:"4 sets",reps:"60 sec hold",muscle:"Core"},
        {name:"Crunches",sets:"4 sets",reps:"20 reps",muscle:"Abs"},
        {name:"Russian Twists",sets:"3 sets",reps:"20 reps",muscle:"Obliques"},
        {name:"Leg Raises",sets:"3 sets",reps:"15 reps",muscle:"Lower Abs"},
        {name:"Burpees",sets:"4 sets",reps:"10 reps",muscle:"Full Body"},
        {name:"Mountain Climbers",sets:"3 sets",reps:"30 sec",muscle:"Core & Cardio"},
        {name:"Jump Rope",sets:"3 sets",reps:"2 min",muscle:"Cardio"},
        {name:"Cool Down Stretch",sets:"1 set",reps:"10 min",muscle:"Full Body"},
      ]},
    }
  },
  professional:{
    label:"Professional", icon:"⚡", color:"#ffd700",
    desc:"Dual muscle groups, high volume, max intensity",
    schedule:{
      0:{day:"Sunday",focus:"Full Recovery 🧘",color:"#8b5cf6",exercises:[
        {name:"Foam Rolling",sets:"20 min",reps:"Full body",muscle:"Myofascial Release"},
        {name:"Light Yoga",sets:"30 min",reps:"Full flow",muscle:"Flexibility"},
        {name:"Cold Shower",sets:"1 set",reps:"10 min",muscle:"Recovery"},
        {name:"Meditation",sets:"1 set",reps:"15 min",muscle:"CNS Recovery"},
        {name:"Hip Mobility Drills",sets:"3 sets",reps:"10 each",muscle:"Hips"},
        {name:"Band Activation",sets:"3 sets",reps:"15 reps",muscle:"Glutes & Shoulders"},
        {name:"Thoracic Rotation",sets:"3 sets",reps:"10 each",muscle:"Spine Mobility"},
        {name:"Deep Tissue Stretch",sets:"1 set",reps:"15 min",muscle:"Full Body"},
        {name:"Contrast Therapy",sets:"3 rounds",reps:"Hot/Cold cycle",muscle:"Circulation"},
        {name:"Nutrition Review",sets:"—",reps:"Review macros",muscle:"Recovery"},
      ]},
      1:{day:"Monday",focus:"Chest + Triceps 💪🔥",color:"#00ff88",exercises:[
        {name:"Flat Bench Press",sets:"5 sets",reps:"5-6 reps (heavy)",muscle:"Chest"},
        {name:"Incline Barbell Press",sets:"4 sets",reps:"8-10 reps",muscle:"Upper Chest"},
        {name:"Decline DB Press",sets:"3 sets",reps:"10-12 reps",muscle:"Lower Chest"},
        {name:"Cable Crossover Flyes",sets:"4 sets",reps:"12-15 reps",muscle:"Chest Isolation"},
        {name:"Weighted Dips",sets:"4 sets",reps:"8-10 reps",muscle:"Lower Chest + Triceps"},
        {name:"Close-Grip Bench Press",sets:"4 sets",reps:"8-10 reps",muscle:"Triceps"},
        {name:"Skull Crushers",sets:"3 sets",reps:"10-12 reps",muscle:"Triceps Long Head"},
        {name:"Tricep Pushdown (Rope)",sets:"3 sets",reps:"12-15 reps",muscle:"Triceps Lateral"},
        {name:"Overhead Tricep Ext",sets:"3 sets",reps:"12 reps",muscle:"Triceps Long Head"},
        {name:"Cable Tricep Kickback",sets:"3 sets",reps:"15 reps",muscle:"Triceps Finish"},
      ]},
      2:{day:"Tuesday",focus:"Back + Biceps 🏋️💥",color:"#00d4ff",exercises:[
        {name:"Deadlift",sets:"5 sets",reps:"3-5 reps (heavy)",muscle:"Full Posterior Chain"},
        {name:"Weighted Pull-Ups",sets:"4 sets",reps:"6-8 reps",muscle:"Lats & Biceps"},
        {name:"Barbell Row (Pendlay)",sets:"4 sets",reps:"6-8 reps",muscle:"Mid Back Thickness"},
        {name:"T-Bar Row",sets:"3 sets",reps:"8-10 reps",muscle:"Back Density"},
        {name:"Single-Arm DB Row",sets:"3 sets",reps:"10-12 each",muscle:"Lats"},
        {name:"Face Pulls (Heavy)",sets:"3 sets",reps:"15 reps",muscle:"Rear Delts & Rotators"},
        {name:"Barbell Curl",sets:"4 sets",reps:"8-10 reps",muscle:"Biceps"},
        {name:"Incline DB Curl",sets:"3 sets",reps:"10-12 reps",muscle:"Biceps Stretch"},
        {name:"Hammer Curl",sets:"3 sets",reps:"12 reps",muscle:"Brachialis"},
        {name:"Reverse Curl",sets:"3 sets",reps:"12 reps",muscle:"Brachioradialis"},
      ]},
      3:{day:"Wednesday",focus:"Shoulders + Traps 🎯💪",color:"#ffd700",exercises:[
        {name:"Push Press",sets:"5 sets",reps:"5-6 reps (heavy)",muscle:"All Delts + Traps"},
        {name:"DB Arnold Press",sets:"4 sets",reps:"8-10 reps",muscle:"Full Shoulder"},
        {name:"Lateral Raises (Drop Set)",sets:"4 sets",reps:"12→10→8",muscle:"Side Delts"},
        {name:"Cable Front Raises",sets:"3 sets",reps:"12-15 reps",muscle:"Front Delts"},
        {name:"Rear Delt Flyes (Machine)",sets:"4 sets",reps:"15 reps",muscle:"Rear Delts"},
        {name:"Upright Row",sets:"3 sets",reps:"10-12 reps",muscle:"Side Delts & Traps"},
        {name:"Barbell Shrugs",sets:"5 sets",reps:"12-15 reps",muscle:"Traps"},
        {name:"DB Shrugs",sets:"3 sets",reps:"15 reps",muscle:"Traps"},
        {name:"Face Pulls",sets:"3 sets",reps:"20 reps",muscle:"Rear Delts & Health"},
        {name:"Neck Training",sets:"3 sets",reps:"15 each dir",muscle:"Neck"},
      ]},
      4:{day:"Thursday",focus:"Legs (Quad Focus) 🦵🔥",color:"#ff4444",exercises:[
        {name:"Barbell Back Squat",sets:"5 sets",reps:"5-6 reps (heavy)",muscle:"Full Legs"},
        {name:"Front Squat",sets:"4 sets",reps:"6-8 reps",muscle:"Quads"},
        {name:"Leg Press (High Volume)",sets:"4 sets",reps:"15-20 reps",muscle:"Quads"},
        {name:"Hack Squat",sets:"3 sets",reps:"10-12 reps",muscle:"Quads"},
        {name:"Bulgarian Split Squat",sets:"3 sets",reps:"10 each leg",muscle:"Quads & Glutes"},
        {name:"Walking Lunges",sets:"3 sets",reps:"15 each leg",muscle:"Legs"},
        {name:"Leg Extension",sets:"4 sets",reps:"15-20 reps",muscle:"Quad Isolation"},
        {name:"Romanian Deadlift",sets:"3 sets",reps:"10-12 reps",muscle:"Hamstrings"},
        {name:"Calf Raises (Heavy)",sets:"6 sets",reps:"15-20 reps",muscle:"Calves"},
        {name:"Tibialis Raise",sets:"3 sets",reps:"20 reps",muscle:"Shin"},
      ]},
      5:{day:"Friday",focus:"Legs (Ham) + Core 🦵⚡",color:"#ff6b35",exercises:[
        {name:"Romanian Deadlift",sets:"5 sets",reps:"6-8 reps (heavy)",muscle:"Hamstrings"},
        {name:"Lying Leg Curl",sets:"4 sets",reps:"10-12 reps",muscle:"Hamstrings"},
        {name:"Seated Leg Curl",sets:"3 sets",reps:"12-15 reps",muscle:"Hamstrings"},
        {name:"Good Mornings",sets:"3 sets",reps:"10 reps",muscle:"Hamstrings & Lower Back"},
        {name:"Hip Thrust",sets:"4 sets",reps:"10-12 reps",muscle:"Glutes"},
        {name:"Weighted Plank",sets:"4 sets",reps:"60-90 sec",muscle:"Core"},
        {name:"Ab Wheel Rollout",sets:"4 sets",reps:"10-12 reps",muscle:"Full Core"},
        {name:"Hanging Leg Raises",sets:"4 sets",reps:"15 reps",muscle:"Lower Abs"},
        {name:"Cable Woodchops",sets:"3 sets",reps:"12 each side",muscle:"Obliques"},
        {name:"Seated Calf Raise",sets:"4 sets",reps:"20 reps",muscle:"Soleus"},
      ]},
      6:{day:"Saturday",focus:"Full Body Power 💥",color:"#8b5cf6",exercises:[
        {name:"Power Cleans",sets:"5 sets",reps:"3-5 reps",muscle:"Full Body Power"},
        {name:"Push Press",sets:"4 sets",reps:"5-6 reps",muscle:"Shoulders & Triceps"},
        {name:"Pull-Ups (Weighted)",sets:"4 sets",reps:"6-8 reps",muscle:"Back & Biceps"},
        {name:"Barbell Complex",sets:"3 rounds",reps:"6 each movement",muscle:"Full Body"},
        {name:"Dumbbell Thrusters",sets:"4 sets",reps:"10 reps",muscle:"Full Body"},
        {name:"Burpees",sets:"5 sets",reps:"10 reps",muscle:"Conditioning"},
        {name:"Battle Ropes",sets:"5 sets",reps:"30 sec",muscle:"Upper Body + Cardio"},
        {name:"Box Jumps",sets:"4 sets",reps:"8 reps",muscle:"Explosive Power"},
        {name:"Sprint Intervals",sets:"8 rounds",reps:"20 sec on/40 sec off",muscle:"Cardio"},
        {name:"Cool Down Stretch",sets:"1 set",reps:"15 min",muscle:"Full Body"},
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

// ─── Main App ─────────────────────────────────────────────────────────────────
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
  const [newMember, setNewMember] = useState({ name: "", username: "", password: "", phone: "", plan: "Basic", fees: "1499" });
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
    const joinDate = new Date().toISOString().split("T")[0];
    const dueDate = new Date(Date.now() + 30*24*60*60*1000).toISOString().split("T")[0];
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
    setNewMember({ name: "", username: "", password: "", phone: "", plan: "Basic", fees: "1499" });
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
  const ExerciseGif = ({ name, color = "#00ff88", done = false }) => {
    const n = (name || "").toLowerCase();

    // ── categorise by keywords ──────────────────────────────────
    const is = (...kws) => kws.some(k => n.includes(k));

    // Returns an SVG string for the exercise category
    const getSvg = () => {
      const c   = done ? "#000" : color;
      const bg  = done ? color  : `${color}22`;
      const id  = Math.random().toString(36).slice(2,7); // unique IDs per render

      /* ── PUSH / CHEST / PRESS / PUSH-UP / BENCH ── */
      if (is("bench","push-up","push up","chest press","incline","decline","close-grip","cable cross","pec","dip","tricep dip","wall push","knee push")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #b${id}{animation:pushup${id} 1.4s ease-in-out infinite}
            #a${id}{animation:armpu${id} 1.4s ease-in-out infinite}
            @keyframes pushup${id}{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
            @keyframes armpu${id}{0%,100%{transform:rotate(0deg) translateX(0)}50%{transform:rotate(-20deg) translateX(2px)}}
          </style>
          <!-- body -->
          <g id="b${id}" transform-origin="32 40">
            <rect x="20" y="28" width="24" height="10" rx="5" fill="${c}" opacity="0.9"/>
            <circle cx="32" cy="22" r="7" fill="${c}"/>
          </g>
          <!-- arms -->
          <g id="a${id}" transform-origin="32 38">
            <line x1="20" y1="34" x2="10" y2="44" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="44" y1="34" x2="54" y2="44" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          </g>
          <!-- floor -->
          <line x1="8" y1="46" x2="56" y2="46" stroke="${c}" stroke-width="2" opacity="0.3"/>
        </svg>`;

      /* ── PULL / ROW / PULLDOWN / PULL-UP / CHIN ── */
      if (is("pull","row","lat pull","chin","deadlift","pendlay","t-bar","face pull","band pull")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #p${id}{animation:pull${id} 1.5s ease-in-out infinite}
            @keyframes pull${id}{0%,100%{transform:translateY(8px)}50%{transform:translateY(-2px)}}
          </style>
          <line x1="32" y1="4" x2="32" y2="16" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="0.4"/>
          <g id="p${id}" transform-origin="32 32">
            <circle cx="32" cy="18" r="7" fill="${c}"/>
            <rect x="22" y="24" width="20" height="10" rx="5" fill="${c}" opacity="0.9"/>
            <line x1="22" y1="27" x2="10" y2="16" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="42" y1="27" x2="54" y2="16" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="26" y1="34" x2="22" y2="48" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
            <line x1="38" y1="34" x2="42" y2="48" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
          </g>
        </svg>`;

      /* ── CURL / BICEP / HAMMER / CONCENTRATION ── */
      if (is("curl","bicep","hammer curl","concentration","reverse curl","wrist curl","preacher")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #cu${id}{animation:curl${id} 1.2s ease-in-out infinite}
            @keyframes curl${id}{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-50deg)}}
          </style>
          <circle cx="32" cy="14" r="7" fill="${c}"/>
          <rect x="24" y="20" width="16" height="10" rx="5" fill="${c}" opacity="0.9"/>
          <line x1="24" y1="27" x2="14" y2="36" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          <g id="cu${id}" transform-origin="36 36">
            <line x1="40" y1="27" x2="40" y2="44" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <rect x="34" y="43" width="12" height="5" rx="2.5" fill="${c}" opacity="0.7"/>
          </g>
          <line x1="24" y1="30" x2="24" y2="48" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
        </svg>`;

      /* ── SQUAT / LEG PRESS / LUNGE / HIP / GLUTE / HACK ── */
      if (is("squat","leg press","lunge","bulgarian","split squat","hip thrust","glute","step-up","step up","goblet")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #sq${id}{animation:squat${id} 1.4s ease-in-out infinite}
            @keyframes squat${id}{0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(10px) scaleY(0.82)}}
          </style>
          <g id="sq${id}" transform-origin="32 28">
            <circle cx="32" cy="10" r="7" fill="${c}"/>
            <rect x="22" y="16" width="20" height="12" rx="5" fill="${c}" opacity="0.9"/>
          </g>
          <line x1="26" y1="44" x2="18" y2="58" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="38" y1="44" x2="46" y2="58" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="26" y1="30" x2="26" y2="44" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="38" y1="30" x2="38" y2="44" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
        </svg>`;

      /* ── SHOULDER PRESS / OVERHEAD / ARNOLD / PUSH PRESS ── */
      if (is("shoulder press","overhead","arnold","push press","lateral raise","front raise","upright row","shrug","military")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #sh${id}{animation:shpress${id} 1.4s ease-in-out infinite}
            @keyframes shpress${id}{0%,100%{transform:translateY(4px)}50%{transform:translateY(-6px)}}
          </style>
          <circle cx="32" cy="14" r="7" fill="${c}"/>
          <rect x="24" y="20" width="16" height="10" rx="5" fill="${c}" opacity="0.9"/>
          <g id="sh${id}" transform-origin="32 26">
            <line x1="24" y1="24" x2="8"  y2="18" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="40" y1="24" x2="56" y2="18" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="8"  cy="16" r="4" fill="${c}" opacity="0.6"/>
            <circle cx="56" cy="16" r="4" fill="${c}" opacity="0.6"/>
          </g>
          <line x1="26" y1="30" x2="22" y2="50" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
          <line x1="38" y1="30" x2="42" y2="50" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
        </svg>`;

      /* ── PLANK / HOLD / SUPERMAN ── */
      if (is("plank","superman","hollow","dead bug","ab wheel","rollout","l-sit")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #pl${id}{animation:plank${id} 2s ease-in-out infinite}
            @keyframes plank${id}{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
          </style>
          <g id="pl${id}" transform-origin="32 34">
            <circle cx="14" cy="28" r="6" fill="${c}"/>
            <rect x="18" y="30" width="32" height="8" rx="4" fill="${c}" opacity="0.9"/>
            <line x1="18" y1="34" x2="10" y2="44" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="50" y1="34" x2="56" y2="44" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          </g>
          <line x1="8" y1="46" x2="56" y2="46" stroke="${c}" stroke-width="2" opacity="0.3"/>
        </svg>`;

      /* ── CRUNCH / AB / SITUP / RUSSIAN TWIST / LEG RAISE ── */
      if (is("crunch","sit-up","situp","russian twist","leg raise","ab ","core","woodchop","hanging leg","oblique")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #cr${id}{animation:crunch${id} 1.3s ease-in-out infinite}
            @keyframes crunch${id}{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-30deg)}}
          </style>
          <line x1="8" y1="50" x2="56" y2="50" stroke="${c}" stroke-width="2" opacity="0.3"/>
          <!-- lower body static -->
          <line x1="30" y1="50" x2="24" y2="38" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="34" y1="50" x2="40" y2="38" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          <!-- torso + head animated -->
          <g id="cr${id}" transform-origin="32 38">
            <rect x="26" y="28" width="12" height="12" rx="5" fill="${c}" opacity="0.9"/>
            <circle cx="32" cy="22" r="6" fill="${c}"/>
            <line x1="26" y1="32" x2="16" y2="28" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
            <line x1="38" y1="32" x2="48" y2="28" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
          </g>
        </svg>`;

      /* ── RUN / CARDIO / JUMP / BURPEE / MOUNTAIN CLIMBER / SPRINT / HIIT ── */
      if (is("run","cardio","jump","burpee","mountain climber","sprint","jog","skip","battle rope","box jump","jumping jack","walk","treadmill","hiit")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #rn${id}{animation:run${id} 0.7s ease-in-out infinite}
            #rl${id}{animation:runl${id} 0.7s ease-in-out infinite}
            #rr${id}{animation:runr${id} 0.7s ease-in-out infinite}
            @keyframes run${id}{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
            @keyframes runl${id}{0%,100%{transform:rotate(30deg)}50%{transform:rotate(-30deg)}}
            @keyframes runr${id}{0%,100%{transform:rotate(-30deg)}50%{transform:rotate(30deg)}}
          </style>
          <circle cx="32" cy="12" r="7" fill="${c}"/>
          <g id="rn${id}" transform-origin="32 24">
            <rect x="26" y="18" width="12" height="14" rx="5" fill="${c}" opacity="0.9"/>
          </g>
          <g id="rl${id}" transform-origin="28 32">
            <line x1="28" y1="32" x2="20" y2="48" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          </g>
          <g id="rr${id}" transform-origin="36 32">
            <line x1="36" y1="32" x2="44" y2="48" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          </g>
          <line x1="28" y1="24" x2="14" y2="32" stroke="${c}" stroke-width="3.5" stroke-linecap="round" opacity="0.6"/>
          <line x1="36" y1="24" x2="50" y2="32" stroke="${c}" stroke-width="3.5" stroke-linecap="round" opacity="0.6"/>
        </svg>`;

      /* ── CALF RAISE / TIBIALIS / CALF ── */
      if (is("calf","tibialis")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #cf${id}{animation:calf${id} 0.9s ease-in-out infinite}
            @keyframes calf${id}{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
          </style>
          <g id="cf${id}" transform-origin="32 32">
            <circle cx="32" cy="10" r="7" fill="${c}"/>
            <rect x="24" y="16" width="16" height="12" rx="5" fill="${c}" opacity="0.9"/>
            <line x1="26" y1="28" x2="22" y2="42" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="38" y1="28" x2="42" y2="42" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          </g>
          <line x1="18" y1="54" x2="28" y2="54" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
          <line x1="36" y1="54" x2="46" y2="54" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
        </svg>`;

      /* ── YOGA / STRETCH / MEDITATION / BREATHING / FOAM ROLL / MOBILITY ── */
      if (is("yoga","stretch","meditat","breath","foam","mobility","rotation","child","cat-cow","hip flexor","neck","recovery","cool down","rest","contrast")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #yg${id}{animation:yoga${id} 3s ease-in-out infinite}
            @keyframes yoga${id}{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
          </style>
          <g id="yg${id}" transform-origin="32 32">
            <circle cx="32" cy="14" r="7" fill="${c}"/>
            <line x1="32" y1="20" x2="32" y2="40" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="32" y1="28" x2="12" y2="24" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="32" y1="28" x2="52" y2="24" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="32" y1="40" x2="18" y2="54" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="32" y1="40" x2="46" y2="54" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          </g>
        </svg>`;

      /* ── SKULL CRUSHER / TRICEP EXT / TRICEP PUSHDOWN / KICKBACK / OVERHEAD TRICEP ── */
      if (is("skull","tricep","close grip","overhead tricep","kickback")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #tc${id}{animation:tricep${id} 1.2s ease-in-out infinite}
            @keyframes tricep${id}{0%,100%{transform:rotate(0deg)}50%{transform:rotate(45deg)}}
          </style>
          <circle cx="24" cy="16" r="6" fill="${c}"/>
          <rect x="18" y="22" width="14" height="10" rx="4" fill="${c}" opacity="0.9"/>
          <line x1="18" y1="28" x2="10" y2="40" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          <g id="tc${id}" transform-origin="32 28">
            <line x1="32" y1="22" x2="42" y2="16" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="42" y1="26" x2="56" y2="20" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
            <rect x="50" y="16" width="8" height="5" rx="2" fill="${c}" opacity="0.5"/>
          </g>
          <line x1="24" y1="32" x2="20" y2="50" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
          <line x1="30" y1="32" x2="34" y2="50" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
        </svg>`;

      /* ── POWER CLEAN / CLEAN / THRUSTER / BARBELL COMPLEX / POWER ── */
      if (is("power clean","clean","thruster","barbell complex","complex","snatch")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #pc${id}{animation:pclean${id} 1s ease-in-out infinite}
            @keyframes pclean${id}{0%{transform:translateY(12px) rotate(0deg)}40%{transform:translateY(-6px) rotate(-5deg)}100%{transform:translateY(12px) rotate(0deg)}}
          </style>
          <g id="pc${id}" transform-origin="32 32">
            <circle cx="32" cy="10" r="7" fill="${c}"/>
            <rect x="24" y="16" width="16" height="10" rx="5" fill="${c}" opacity="0.9"/>
            <line x1="24" y1="20" x2="8"  y2="22" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="40" y1="20" x2="56" y2="22" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="8"  cy="22" r="5" fill="${c}" opacity="0.5"/>
            <circle cx="56" cy="22" r="5" fill="${c}" opacity="0.5"/>
            <line x1="28" y1="26" x2="22" y2="44" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="36" y1="26" x2="42" y2="44" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          </g>
        </svg>`;

      /* ── ROPE / BATTLE ROPE ── */
      if (is("rope","battle")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #rp1${id}{animation:rope1${id} 0.5s ease-in-out infinite}
            #rp2${id}{animation:rope2${id} 0.5s ease-in-out infinite 0.25s}
            @keyframes rope1${id}{0%,100%{transform:translateY(-4px)}50%{transform:translateY(4px)}}
            @keyframes rope2${id}{0%,100%{transform:translateY(4px)}50%{transform:translateY(-4px)}}
          </style>
          <circle cx="32" cy="14" r="6" fill="${c}"/>
          <rect x="26" y="20" width="12" height="10" rx="4" fill="${c}" opacity="0.9"/>
          <line x1="26" y1="26" x2="16" y2="34" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
          <line x1="38" y1="26" x2="48" y2="34" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
          <g id="rp1${id}">
            <path d="M8 38 Q14 34 20 38 Q26 42 32 38" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>
          </g>
          <g id="rp2${id}">
            <path d="M32 38 Q38 34 44 38 Q50 42 56 38" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>
          </g>
        </svg>`;

      /* ── GOOD MORNING / BACK EXTENSION / RDL / ROMANIAN ── */
      if (is("good morning","back ext","rdl","romanian","hip hinge")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #gm${id}{animation:goodm${id} 1.4s ease-in-out infinite}
            @keyframes goodm${id}{0%,100%{transform:rotate(-30deg)}50%{transform:rotate(0deg)}}
          </style>
          <line x1="32" y1="48" x2="22" y2="54" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="32" y1="48" x2="42" y2="54" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          <g id="gm${id}" transform-origin="32 48">
            <circle cx="32" cy="18" r="7" fill="${c}"/>
            <rect x="24" y="24" width="16" height="24" rx="5" fill="${c}" opacity="0.9"/>
            <line x1="24" y1="30" x2="10" y2="28" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="40" y1="30" x2="54" y2="28" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          </g>
        </svg>`;

      /* ── SHRUG / NECK / TRAP ── */
      if (is("shrug","neck","trap")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #sk${id}{animation:shrug${id} 1s ease-in-out infinite}
            @keyframes shrug${id}{0%,100%{transform:translateY(4px)}50%{transform:translateY(-5px)}}
          </style>
          <g id="sk${id}" transform-origin="32 20">
            <circle cx="32" cy="14" r="7" fill="${c}"/>
            <rect x="22" y="20" width="20" height="10" rx="5" fill="${c}" opacity="0.9"/>
            <line x1="22" y1="24" x2="8" y2="22" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
            <line x1="42" y1="24" x2="56" y2="22" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
          </g>
          <line x1="26" y1="36" x2="22" y2="52" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
          <line x1="38" y1="36" x2="42" y2="52" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
        </svg>`;

      /* ── LEG CURL / LEG EXTENSION / LEG RAISE ── */
      if (is("leg curl","leg ext","leg raise","seated leg","lying leg")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #lc${id}{animation:legcurl${id} 1.2s ease-in-out infinite}
            @keyframes legcurl${id}{0%,100%{transform:rotate(0deg)}50%{transform:rotate(50deg)}}
          </style>
          <!-- seated body -->
          <circle cx="18" cy="20" r="6" fill="${c}"/>
          <rect x="12" y="26" width="14" height="10" rx="4" fill="${c}" opacity="0.9"/>
          <line x1="12" y1="32" x2="4" y2="30" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
          <!-- bench -->
          <rect x="6" y="36" width="24" height="4" rx="2" fill="${c}" opacity="0.25"/>
          <!-- animated leg -->
          <g id="lc${id}" transform-origin="20 36">
            <line x1="20" y1="36" x2="50" y2="44" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="52" cy="44" r="5" fill="${c}" opacity="0.5"/>
          </g>
          <line x1="20" y1="36" x2="22" y2="54" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
        </svg>`;

      /* ── WALKING LUNGE / LUNGE ── */
      if (is("lunge","walking lunge")) return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #ln${id}{animation:lunge${id} 1.3s ease-in-out infinite}
            @keyframes lunge${id}{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.15)}}
          </style>
          <g id="ln${id}" transform-origin="32 32">
            <circle cx="32" cy="10" r="7" fill="${c}"/>
            <rect x="26" y="16" width="12" height="10" rx="4" fill="${c}" opacity="0.9"/>
            <line x1="26" y1="22" x2="14" y2="26" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="38" y1="22" x2="50" y2="26" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <!-- front leg -->
            <line x1="30" y1="26" x2="18" y2="40" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="18" y1="40" x2="14" y2="56" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <!-- back leg -->
            <line x1="34" y1="26" x2="46" y2="40" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <line x1="46" y1="40" x2="50" y2="56" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          </g>
        </svg>`;

      /* ── DEFAULT fallback — generic dumbbell curl ── */
      return `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="64" rx="12" fill="${bg}"/>
          <style>
            #df${id}{animation:def${id} 1.3s ease-in-out infinite}
            @keyframes def${id}{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-40deg)}}
          </style>
          <circle cx="32" cy="14" r="7" fill="${c}"/>
          <rect x="24" y="20" width="16" height="10" rx="5" fill="${c}" opacity="0.9"/>
          <line x1="24" y1="26" x2="12" y2="34" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
          <g id="df${id}" transform-origin="36 26">
            <line x1="40" y1="26" x2="52" y2="32" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
            <rect x="49" y="28" width="10" height="5" rx="2" fill="${c}" opacity="0.6"/>
          </g>
          <line x1="28" y1="30" x2="24" y2="50" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
          <line x1="36" y1="30" x2="40" y2="50" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
        </svg>`;
    };

    return (
      <div
        style={{
          width:52, height:52, flexShrink:0, borderRadius:10,
          overflow:"hidden", background:"transparent",
        }}
        dangerouslySetInnerHTML={{ __html: getSvg() }}
      />
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
                <div style={{
                  borderRadius:12,overflow:"hidden",flexShrink:0,
                  border:`1.5px solid ${done?viewW.color:`${viewW.color}44`}`,
                  transition:"border-color 0.25s",
                  boxShadow:done?`0 0 10px ${viewW.color}44`:"none",
                }}>
                  <ExerciseGif name={ex.name} color={viewW.color} done={done}/>
                </div>

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
              <div className="info-row"><span className="info-key">Theme</span><span className="info-val">🌙 Dark</span></div>
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
  const memberTabs = [{id:"dashboard",icon:"🏠",label:"Home"},{id:"workout",icon:"💪",label:"Workout"},{id:"attendance",icon:"📋",label:"Attend."},{id:"profile",icon:"👤",label:"Profile"},{id:"settings",icon:"⚙️",label:"Settings"}];
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
