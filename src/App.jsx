import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://lrjjchlplmsdntbvqwby.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyampjaGxwbG1zZG50YnZxd2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzI5MDEsImV4cCI6MjA4ODE0ODkwMX0.2omsf1A1QNNOv_5n2iG50egnyN-qi-uBLMB47wdmlck";

const sb = {
  from: (table) => ({
    select: (cols = "*") => fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    }).then(r => r.json()),
    insert: (data) => fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    upsert: (data) => fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(data)
    }).then(r => r.json()),
  })
};

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const WORKOUT_TYPES = [
  { id: "strength",    label: "Strength Training",      icon: "🏋️" },
  { id: "cardio",      label: "Cardio / HIIT",           icon: "🔥" },
  { id: "wellness",    label: "Flexibility & Wellness",  icon: "🧘" },
  { id: "bodybuilding",label: "Bodybuilding",            icon: "💪" },
  { id: "calisthenics",label: "Calisthenics",            icon: "🤸" },
  { id: "cycling",     label: "Cycling",                 icon: "🚴" },
];

const GOALS = [
  { id: "muscle",     label: "Build Muscle",     emoji: "💪" },
  { id: "lose",       label: "Lose Weight",       emoji: "🔥" },
  { id: "endurance",  label: "Endurance",         emoji: "🏃" },
  { id: "strength",   label: "Get Stronger",      emoji: "🏆" },
  { id: "flexible",   label: "Stay Flexible",     emoji: "🧘" },
  { id: "consistent", label: "Stay Consistent",   emoji: "📅" },
  { id: "compete",    label: "Compete",           emoji: "🥇" },
  { id: "wellness",   label: "Mental Wellness",   emoji: "🌿" },
];

const COMPLIMENTS = [
  { id: "physique",   label: "Nice Physique",       emoji: "💪" },
  { id: "energy",     label: "Love the Energy",     emoji: "⚡" },
  { id: "form",       label: "Great Form",          emoji: "🎯" },
  { id: "dedication", label: "Pure Dedication",     emoji: "🔥" },
  { id: "vibes",      label: "Good Vibes Only",     emoji: "🌊" },
  { id: "beast",      label: "Beast Mode",          emoji: "🦁" },
  { id: "crushing",   label: "Crushing It",         emoji: "🏆" },
  { id: "grind",      label: "Respect the Grind",   emoji: "💯" },
  { id: "inspiring",  label: "Inspiring Me",        emoji: "🤝" },
  { id: "easy",       label: "You Make It Look Easy", emoji: "🔑" },
];


const VIBE_OPTIONS = [
  { id: "grinding",  label: "Grinding",      emoji: "😤" },
  { id: "cardio",    label: "Cardio Day",     emoji: "🔥" },
  { id: "pr",        label: "PR Attempt",     emoji: "🏆" },
  { id: "vibing",    label: "Just Vibing",    emoji: "😎" },
  { id: "recovery",  label: "Recovery Day",   emoji: "🧘" },
  { id: "leg_day",   label: "Leg Day",        emoji: "🦵" },
  { id: "push",      label: "Push Day",       emoji: "💪" },
  { id: "pull",      label: "Pull Day",       emoji: "🎯" },
];
const SEXUALITY_OPTIONS = [
  { id: "straight",  label: "Straight",    emoji: "💙" },
  { id: "gay",       label: "Gay",         emoji: "🏳️‍🌈" },
  { id: "bi",        label: "Bisexual",    emoji: "💜" },
  { id: "prefer",    label: "Prefer not to say", emoji: "🤍" },
];

const PRONOUN_OPTIONS = [
  { id: "he",       label: "He/Him"          },
  { id: "she",      label: "She/Her"          },
  { id: "they",     label: "They/Them"        },
  { id: "he_they",  label: "He/They"          },
  { id: "she_they", label: "She/They"         },
  { id: "any",      label: "Any"              },
  { id: "prefer",   label: "Prefer not to say"},
];

const MOCK_LOBBY = [
  { id: 1, name: "Marcus T.", age: 28, sexuality: "straight", workoutType: "Strength Training", goals: ["💪 Build Muscle","🏆 Get Stronger"], bio: "Powerlifting 4x a week. No excuses.", verified: true,  isOnline: true,  onlineSince: "Online 18 min",  streak: 12, pronouns: "he", homeGyms: [{"name": "Equinox SoHo", "neighborhood": "SoHo"}, {"name": "Blink Fitness Midtown", "neighborhood": "Midtown"}], vibe: { id:"grinding", label:"Grinding", emoji:"😤" }, isRegular: true,    photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&crop=face", photos: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=700&fit=crop&crop=face","https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=700&fit=crop","https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=700&fit=crop"] },
  { id: 2, name: "Priya S.",  age: 25, sexuality: "bi",       workoutType: "Cardio / HIIT",    goals: ["🔥 Lose Weight","📅 Stay Consistent"], bio: "HIIT junkie. Barry's obsessed.", verified: true,  isOnline: true,  onlineSince: "Online 5 min",   streak: 5,  pronouns: "she", homeGyms: [{"name": "Barry's Bootcamp NYC", "neighborhood": "NoMad"}], vibe: { id:"cardio", label:"Cardio Day", emoji:"🔥" }, isRegular: false,     photo: "https://images.unsplash.com/photo-1609899464926-da0d5b3fd2eb?w=400&h=400&fit=crop&crop=face", photos: ["https://images.unsplash.com/photo-1609899464926-da0d5b3fd2eb?w=600&h=700&fit=crop&crop=face","https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=700&fit=crop","https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=700&fit=crop"] },
  { id: 3, name: "Devon W.",  age: 31, sexuality: "straight", workoutType: "Bodybuilding",     goals: ["💪 Build Muscle"], bio: "Stage ready by spring.", verified: true,  isOnline: false, onlineSince: "Last seen today",  streak: 21, pronouns: "he", homeGyms: [{"name": "Equinox SoHo", "neighborhood": "SoHo"}, {"name": "TMPL Gym Hell's Kitchen", "neighborhood": "Hell's Kitchen"}], vibe: null, isRegular: true,  photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop&crop=face", photos: ["https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=700&fit=crop&crop=face","https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=700&fit=crop","https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=700&fit=crop"] },
  { id: 4, name: "Aaliya R.", age: 27, sexuality: "prefer",   workoutType: "Flexibility & Wellness", goals: ["🧘 Stay Flexible","🌿 Mental Wellness"], bio: "Yoga + mobility work daily.", verified: false, isOnline: true,  onlineSince: "Online 11 min",  streak: 3,  pronouns: "she", homeGyms: [{"name": "Blink Fitness Midtown", "neighborhood": "Midtown"}], vibe: { id:"recovery", label:"Recovery Day", emoji:"🧘" }, isRegular: false,    photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop&crop=face", photos: ["https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=700&fit=crop&crop=face","https://images.unsplash.com/photo-1609899464926-da0d5b3fd2eb?w=600&h=700&fit=crop","https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=700&fit=crop"] },
  { id: 5, name: "Jake M.",   age: 33, sexuality: "gay",      workoutType: "Cycling",          goals: ["🏃 Endurance","📅 Stay Consistent"], bio: "100mi weeks minimum.", verified: true,  isOnline: false, onlineSince: "Last seen today",  streak: 7,  pronouns: "he", homeGyms: [{"name": "Planet Fitness Bronx", "neighborhood": "Bronx"}, {"name": "Crunch Fitness UES", "neighborhood": "Upper East Side"}], vibe: null, isRegular: true,  photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face", photos: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=700&fit=crop&crop=face","https://images.unsplash.com/photo-1534368538338-39f7f0a18b2d?w=600&h=700&fit=crop","https://images.unsplash.com/photo-1487956382158-bb926046304a?w=600&h=700&fit=crop"] },
  { id: 6, name: "Sofia L.",  age: 27, sexuality: "straight", workoutType: "Bodybuilding",     goals: ["💪 Build Muscle"], bio: "Competing this summer.", verified: true,  isOnline: true,  onlineSince: "Online 8 min",   streak: 30, pronouns: "she", homeGyms: [{"name": "Equinox SoHo", "neighborhood": "SoHo"}], vibe: { id:"pr", label:"PR Attempt", emoji:"🏆" }, isRegular: true,     photo: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400&h=400&fit=crop&crop=face", photos: ["https://images.unsplash.com/photo-1550345332-09e3ac987658?w=600&h=700&fit=crop&crop=face","https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=700&fit=crop","https://images.unsplash.com/photo-1609899464926-da0d5b3fd2eb?w=600&h=700&fit=crop"] },
];

const MOCK_INBOX = [
  { id: 1, type: "compliment", user: "Marcus T.", photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop&crop=face", text: 'Sent you "Nice Physique"', time: "2 min ago", unread: true, userData: { id:1, name:"Marcus T.", age:28, workoutType:"Strength Training", goals:["💪 Build Muscle","🏆 Get Stronger"], verified:true, onlineSince:"Online 18 min", photo:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&crop=face" } },
  { id: 2, type: "thanks",     user: "Aaliya R.", photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop&crop=face", text: "Replied Thanks to your compliment", time: "14 min ago", unread: true, userData: { id:4, name:"Aaliya R.", age:27, workoutType:"Flexibility & Wellness", goals:["🧘 Stay Flexible","🌿 Mental Wellness"], verified:false, onlineSince:"Online 11 min", photo:"https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop&crop=face" } },
  { id: 3, type: "you",        user: "Priya S.",  photo: "https://images.unsplash.com/photo-1609899464926-da0d5b3fd2eb?w=200&h=200&fit=crop&crop=face", text: 'Replied "You" to your compliment', time: "1 hr ago",  unread: false, userData: { id:2, name:"Priya S.", age:25, workoutType:"Cardio / HIIT", goals:["🔥 Lose Weight","📅 Stay Consistent"], verified:true, onlineSince:"Online 5 min", photo:"https://images.unsplash.com/photo-1609899464926-da0d5b3fd2eb?w=400&h=400&fit=crop&crop=face" } },
];

const ONBOARDING = [
  { emoji: "🏋️", title: "Check In", body: "Tap Check In when you start working out. Select your gym and go live — others can see you in real time.", color: "#FF6200" },
  { emoji: "👀", title: "See Who's Here", body: "Browse members at your gym — first name and last initial only. Verified profiles, real people.", color: "#FF6200" },
  { emoji: "💬", title: "Send a Compliment", body: "Tap a profile and pick from 10 compliments. That's how you break the ice. No messages, no pressure.", color: "#FF6200" },
  { emoji: "👻", title: "Ghost or Thanks", body: "If you get a compliment, reply Thanks, You, or Ghost. Ghosting is silent — they're never notified.", color: "#FF6200" },
];

// ─── COUNTRY CODES ────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "+1",  flag: "🇺🇸", name: "US" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+33", flag: "🇫🇷", name: "FR" },
  { code: "+49", flag: "🇩🇪", name: "DE" },
  { code: "+34", flag: "🇪🇸", name: "ES" },
  { code: "+39", flag: "🇮🇹", name: "IT" },
  { code: "+81", flag: "🇯🇵", name: "JP" },
  { code: "+86", flag: "🇨🇳", name: "CN" },
  { code: "+91", flag: "🇮🇳", name: "IN" },
  { code: "+55", flag: "🇧🇷", name: "BR" },
  { code: "+52", flag: "🇲🇽", name: "MX" },
  { code: "+61", flag: "🇦🇺", name: "AU" },
];

// ─── TOAST HOOK ───────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 2800);
  }, []);
  return [toast, showToast];
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --red: #FF6200;
    --orange: #FF6200;
    --green: #38E8A0;
    --purple: #FF6200;
    --blue: #A0B4C8;
    --bg: #0E0E0E;
    --bg2: #161616;
    --bg3: #1F1F1F;
    --border: #272727;
    --border2: #252640;
    --text: #ffffff;
    --text2: #aaaaaa;
    --text3: #565870;
    --text4: #32344a;
  }

  html, body, #root { height: 100%; background: var(--bg); color: var(--text); }

  body {
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
    overscroll-behavior: none;
  }

  .app {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    background: var(--bg);
  }

  /* ── LOGO ── */
  .logo-gym { color: var(--purple); letter-spacing: inherit; }
  .logo-connect { color: var(--text); letter-spacing: inherit; }
  .logo-xs { font-family: 'Bebas Neue'; font-size: 20px; letter-spacing: 2px; }
  .logo-sm { font-family: 'Bebas Neue'; font-size: 28px; letter-spacing: 2px; }
  .logo-md { font-family: 'Bebas Neue'; font-size: 36px; letter-spacing: 3px; }
  .logo-lg { font-family: 'Bebas Neue'; font-size: 48px; letter-spacing: 4px; }

  /* ── INPUTS ── */
  .input {
    width: 100%;
    background: var(--bg3);
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 14px 16px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    outline: none;
    transition: border-color 0.2s;
    -webkit-appearance: none;
  }
  .input:focus { border-color: #FF6B00; box-shadow: 0 0 0 3px #FF6B0010; }
  .input::placeholder { color: var(--text3); }

  /* ── BUTTONS ── */
  .btn-primary {
    width: 100%;
    padding: 16px;
    background: #FF6B00;
    box-shadow: 0 4px 24px #FF6B0040;
    color: #ffffff;
    border: none;
    border-radius: 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s, box-shadow 0.2s, background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: 0.3px;
  }
  .btn-primary:hover { background: #FF8C2A; box-shadow: 0 6px 32px #FF6B0060; transform: translateY(-1px); }
  .btn-primary:hover:disabled { background: #FF6B00; box-shadow: 0 4px 24px #FF6B0040; transform: none; }
  .btn-primary:active { transform: scale(0.98); opacity: 0.9; }
  /* Ice gradient text helper */
  .ice-text {
    background: var(--ice-grad);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  /* Ice gradient border helper */
  .ice-border { border-color: #FF6B00 !important; }
  .btn-primary.green { background: var(--green); color: #080808; }
  .btn-primary.danger { background: #C41230; color: #fff; box-shadow: 0 4px 20px #C4123035; }
  .btn-primary.ghost { background: transparent; border: 1.5px solid var(--border2); color: var(--text2); }
  .btn-primary:disabled { opacity: 0.4; cursor: default; }

  .btn-sm {
    padding: 8px 16px;
    background: var(--bg3);
    border: 1.5px solid var(--border);
    border-radius: 20px;
    color: var(--text2);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-sm.active { background: #080E18; border-color: #FF6B00; color: #E8F4FF; }

  /* ── OTP ── */
  .otp-box {
    width: 48px;
    height: 56px;
    background: var(--bg3);
    border: 2px solid var(--border);
    border-radius: 14px;
    color: var(--text);
    font-size: 22px;
    font-weight: 700;
    text-align: center;
    outline: none;
    transition: border-color 0.2s;
    font-family: 'DM Sans', sans-serif;
    -webkit-appearance: none;
  }
  .otp-box:focus { border-color: #FF6B00; box-shadow: 0 0 0 3px #FF6B0015; }
  .otp-box.filled { border-color: var(--green); }

  /* ── TAGS ── */
  .tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: var(--bg3);
    border: 1px solid var(--border);
    color: var(--text2);
  }

  /* ── CARDS ── */
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
  }

  /* ── NAV ── */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    background: rgba(8,8,8,0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 10px 0 20px;
    z-index: 100;
  }
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 4px 16px;
    border-radius: 12px;
    transition: all 0.15s;
    position: relative;
  }
  .nav-icon { font-size: 22px; line-height: 1; transition: transform 0.15s; }
  .nav-label { font-size: 10px; font-weight: 600; color: var(--text3); letter-spacing: 0.5px; text-transform: uppercase; }
  .nav-item.active .nav-label { color: var(--red); filter: none; }
  .nav-item.active .nav-icon { transform: scale(1.1); }
  .nav-badge {
    position: absolute;
    top: 0;
    right: 8px;
    background: var(--red);
    color: #ffffff;
    border-radius: 20px;
    min-width: 18px;
    height: 18px;
    font-size: 10px;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }

  /* ── TOAST ── */
  .toast {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(-80px);
    background: #1a1a1a;
    border: 1px solid var(--border2);
    border-radius: 40px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    z-index: 9999;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    max-width: 90vw;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .toast.show { transform: translateX(-50%) translateY(0); }
  .toast.success { border-color: #38E8A044; color: var(--green); }
  .toast.error { border-color: #FF620044; color: var(--red); }

  /* ── SPINNER ── */
  .spin {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-6px); }
    40%,80% { transform: translateX(6px); }
  }

  /* ── PULSE ── */
  .pulse { animation: pulse-glow 2s infinite; }
  @keyframes pulse-glow {
    0%,100% { opacity: 1; box-shadow: 0 0 0 0 #38E8A066; }
    50%      { opacity: 0.85; box-shadow: 0 0 0 5px #38E8A000; }
  }

  /* ── ANIMATIONS ── */
  @keyframes confettiFall {
    0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  .confetti-piece {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    animation: confettiFall linear forwards;
    pointer-events: none;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.85); }
    70%  { transform: scale(1.03); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  .fade-up   { animation: fadeUp 0.4s ease forwards; }
  .pop-in    { animation: popIn  0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .slide-up  { animation: slideUp 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }

  /* ── PROFILE OVERLAY ── */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(8px);
    z-index: 200;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .overlay-sheet {
    width: 100%;
    max-width: 430px;
    max-height: 92vh;
    overflow-y: auto;
    background: var(--bg2);
    border-radius: 28px 28px 0 0;
    animation: slideUp 0.3s ease;
  }

  /* ── CHECKIN CARD ── */
  .gym-card {
    background: var(--bg2);
    border: 1.5px solid var(--border);
    border-radius: 16px;
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .gym-card:active { transform: scale(0.98); }
  .gym-card.selected { background: #080E18; border-color: #FF6B00; }

  /* ── LOBBY CARD ── */
  .lobby-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.15s;
    margin-bottom: 8px;
  }
  .lobby-card:active { transform: scale(0.99); background: #111; }

  /* ── DIVIDER ── */
  .divider {
    height: 1px;
    background: var(--border);
    margin: 16px 0;
  }

  /* ── SECTION LABEL ── */
  .section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text3);
    margin-bottom: 12px;
  }

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar { width: 0; height: 0; }
  .scroll-x { overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
  .scroll-x::-webkit-scrollbar { display: none; }

  /* ── VERIFIED BADGE ── */
  .verified { color: #38E8A0; font-size: 13px; }

  /* ── PHOTO GRID ── */
  .photo-slot {
    aspect-ratio: 1;
    border-radius: 16px;
    overflow: hidden;
    background: var(--bg3);
    border: 2px dashed var(--border2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: border-color 0.2s;
  }
  .photo-slot:hover { border-color: var(--red); }
  .photo-slot img { width: 100%; height: 100%; object-fit: cover; }

  /* ── PROGRESS BAR ── */
  .progress-bar {
    height: 3px;
    background: var(--border);
    border-radius: 99px;
    overflow: hidden;
    margin-bottom: 32px;
  }
  .progress-fill {
    height: 100%;
    background: #FF6B00;
    border-radius: 99px;
    transition: width 0.4s ease;
  }

  /* ── COMPLIMENT GRID ── */
  .compliment-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 16px 100px;
  }
  .compliment-btn {
    background: var(--bg2);
    border: 1.5px solid var(--border);
    border-radius: 16px;
    padding: 16px 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .compliment-btn:active { transform: scale(0.96); }
  .compliment-btn.sent { background: #080E18; border-color: var(--green); }

  /* ── SETTINGS ITEM ── */
  .settings-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    cursor: pointer;
    transition: background 0.15s;
    border-radius: 14px;
  }
  .settings-item:active { background: var(--bg3); }

  /* ── TOOLTIP ── */
  .tooltip-wrap { position: relative; display: inline-flex; }
  .tooltip-wrap .tooltip-box {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: #1A1A2E;
    border: 1px solid #A8D8F060;
    color: #A8D8F0;
    font-size: 11px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    white-space: normal;
    max-width: 180px;
    text-align: center;
    padding: 8px 10px;
    border-radius: 10px;
    line-height: 1.5;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 999;
  }
  .tooltip-wrap .tooltip-box::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-bottom-color: #A8D8F060;
  }
  .tooltip-wrap:hover .tooltip-box { opacity: 1; }

  /* ── TOGGLE ── */
  .toggle {
    width: 44px;
    height: 26px;
    border-radius: 13px;
    background: var(--border2);
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .toggle.on { background: var(--green); }
  .toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
  }
  .toggle.on .toggle-knob { transform: translateX(18px); }
`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const Logo = ({ size = "sm" }) => (
  <div className={`logo-${size}`}>
    <span className="logo-gym">Fr</span><span className="logo-connect">ost</span>
  </div>
);

const Spinner = () => <span className="spin" />;

const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
    &larr; Back
  </button>
);

const Toggle = ({ on, onToggle }) => (
  <div className={`toggle${on ? " on" : ""}`} onClick={onToggle}>
    <div className="toggle-knob" />
  </div>
);

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {

  // ── Screen state ──
  const [screen, setScreen]       = useState("auth");   // auth | onboarding | ageverify | signup | homegyms | main | settings
  const [mainTab, setMainTab]     = useState("floor");  // floor | inbox | profile
  const [settingsTab, setSettingsTab] = useState("main");

  // ── Auth ──
  const [authMode, setAuthMode]   = useState("signup");
  const [authStep, setAuthStep]   = useState("phone");  // phone | otp
  const [country, setCountry]     = useState(COUNTRIES[0]);
  const [phone, setPhone]         = useState("");
  const [otp, setOtp]             = useState(["","","","","",""]);
  const [otpError, setOtpError]   = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const otpRefs                   = useRef([]);

  // ── Signup ──
  const SIGNUP_STEPS = ["name","workout","goals","photos","done"];
  const [signupStep, setSignupStep] = useState("name");
  const [firstName, setFirstName]   = useState("");
  const [lastInitial, setLastInitial] = useState("");
  const [age, setAge]               = useState("");
  const [birthday, setBirthday]     = useState({ month: "", day: "", year: "" });
  const [height, setHeight]         = useState("");
  const [sexuality, setSexuality]   = useState("");
  const [pronouns, setPronouns]     = useState("");
  const [workout, setWorkout]       = useState("");
  const [goals, setGoals]           = useState([]);
  const [bio, setBio]               = useState("");
  const [photos, setPhotos]         = useState([null, null]);
  const [signupErrors, setSignupErrors] = useState({});

  // ── Onboarding ──
  const [onboardSlide, setOnboardSlide] = useState(0);

  // ── Gyms ──
  const [allGyms, setAllGyms]       = useState([]);
  const [gymSearch, setGymSearch]   = useState("");
  const [homeGyms, setHomeGyms]     = useState([]);

  // ── Main app ──
  const [checkedIn, setCheckedIn]   = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [floorFilter, setFloorFilter] = useState("all"); // "all" | "online" | "gym"
  const [floorGymSearch, setFloorGymSearch] = useState("");
  const [floorGymSearchOpen, setFloorGymSearchOpen] = useState(false);
  const [floorSelectedGym, setFloorSelectedGym] = useState(null); // null = your home gym
  const [selectedGym, setSelectedGym] = useState({ id: "demo", name: "Equinox SoHo", neighborhood: "SoHo" });
  const [lobbyUsers, setLobbyUsers] = useState(MOCK_LOBBY);
  const [showAllGyms, setShowAllGyms] = useState(false);

  // ── Profile ──
  const [myProfile, setMyProfile]   = useState({
    name: "", photo: null, photos: [null,null],
    workoutType: "", goals: [], sexuality: "", bio: "",
    age: 18, height: "", verified: true,
  });
  const [editDraft, setEditDraft]   = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // ── User interactions ──
  const [viewingUser, setViewingUser] = useState(null);
  const [profileViewers, setProfileViewers] = useState([]); // [{user, time}] — Frost+ only
  const [showWhoViewed, setShowWhoViewed] = useState(false);
  // Persist sentToday keyed by date so free-tier limit survives refresh
  const todayKey = new Date().toISOString().slice(0, 10); // "2026-03-09"
  const [sentToday, setSentToday] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("frost_sent_today") || "{}");
      return saved.date === todayKey ? saved.sent : {};
    } catch { return {}; }
  });
  // Keep localStorage in sync whenever sentToday changes
  const persistSentToday = (newSent) => {
    try { localStorage.setItem("frost_sent_today", JSON.stringify({ date: todayKey, sent: newSent })); } catch {}
  };

  // ── Subscription tier ──
  // "free" | "plus" | "pro"
  const [userTier, setUserTier]     = useState("free");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef(null);
  const [ghostMode, setGhostMode]   = useState(false); // hidden on floor, compliments show as "Someone"

  const [bonusComplimentEarnedToday, setBonusComplimentEarnedToday] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('frost_bonus_compliment') || '{}');
      return saved.date === todayKey;
    } catch { return false; }
  });
  const TIER_LIMITS = { free: 5, plus: Infinity, pro: Infinity };
  const [showOneLeftNudge, setShowOneLeftNudge] = useState(false);
  const bonusCompliments = bonusComplimentEarnedToday ? 1 : 0;
  const complimentsLeft = userTier === "free"
    ? Math.max(0, TIER_LIMITS.free + bonusCompliments - Object.keys(sentToday).length)
    : null;
  const [myVibe, setMyVibe]         = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("frost_vibe") || "null");
      if (!saved) return null;
      if (Date.now() - saved.setAt > 86400000) { localStorage.removeItem("frost_vibe"); return null; }
      return saved.vibe;
    } catch { return null; }
  });

  // ── Streak: persisted checkin dates (earned after 30min at gym) ──
  const [checkinDates, setCheckinDates] = useState(() => {
    try { return JSON.parse(localStorage.getItem("frost_checkin_dates") || "[]"); } catch { return []; }
  });
  const [gymSessionStart, setGymSessionStart] = useState(null); // timestamp when Check In tapped
  const [gymTimeElapsed, setGymTimeElapsed]   = useState(0);    // seconds since Check In
  const [streakEarnedToday, setStreakEarnedToday] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("frost_streak_earned") || "{}");
      return saved.date === todayKey;
    } catch { return false; }
  });
  const STREAK_THRESHOLD = 30 * 60; // 30 minutes in seconds
  const [showCheckinSheet, setShowCheckinSheet] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(60); // minutes
  const [sessionAutoCheckoutAt, setSessionAutoCheckoutAt] = useState(null); // timestamp

  // Compute current streak from consecutive days ending today/yesterday
  const myStreak = (() => {
    const dates = [...new Set(checkinDates)].sort().reverse();
    if (!dates.length) return 0;
    let streak = 0;
    let cursor = new Date(todayKey);
    for (const d of dates) {
      const diff = Math.round((cursor - new Date(d)) / 86400000);
      if (diff === 0 || diff === 1) { streak++; cursor = new Date(d); }
      else break;
    }
    return streak;
  })();
  const [mutualNotices, setMutualNotices] = useState(new Set());
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [lbGym, setLbGym] = useState(null);         // null = use primary home gym
  const [lbGymSearch, setLbGymSearch] = useState("");
  const [lbGymSearchOpen, setLbGymSearchOpen] = useState(false);
  const [statSheet, setStatSheet] = useState(null); // "sent" | "received"
  const [leaderboard, setLeaderboard] = useState([
    { id: 6,  name: "Sofia L.",   photo: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=200&h=200&fit=crop&crop=face", count: 47, workoutType: "Bodybuilding",          streak: 30, isOnline: true  },
    { id: 3,  name: "Devon W.",   photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop&crop=face", count: 41, workoutType: "Bodybuilding",          streak: 21, isOnline: false },
    { id: 1,  name: "Marcus T.",  photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop&crop=face", count: 38, workoutType: "Strength Training",     streak: 12, isOnline: true  },
    { id: 2,  name: "Priya S.",   photo: "https://images.unsplash.com/photo-1609899464926-da0d5b3fd2eb?w=200&h=200&fit=crop&crop=face", count: 33, workoutType: "Cardio / HIIT",         streak: 5,  isOnline: true  },
    { id: 4,  name: "Aaliya R.",  photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop&crop=face", count: 29, workoutType: "Flexibility & Wellness", streak: 3,  isOnline: true  },
    { id: 5,  name: "Jake M.",    photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=face", count: 26, workoutType: "Cycling",               streak: 7,  isOnline: false },
    { id: 7,  name: "Jordan K.",  photo: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop&crop=face", count: 24, workoutType: "Strength Training",     streak: 9,  isOnline: true  },
    { id: 8,  name: "Tanya B.",   photo: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=200&h=200&fit=crop&crop=face", count: 22, workoutType: "Cardio / HIIT",         streak: 14, isOnline: false },
    { id: 9,  name: "Chris M.",   photo: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&h=200&fit=crop&crop=face", count: 20, workoutType: "Bodybuilding",          streak: 4,  isOnline: true  },
    { id: 10, name: "Nadia V.",   photo: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop&crop=face", count: 19, workoutType: "Flexibility & Wellness", streak: 11, isOnline: false },
    { id: 11, name: "Dante R.",   photo: "https://images.unsplash.com/photo-1534368538338-39f7f0a18b2d?w=200&h=200&fit=crop&crop=face", count: 18, workoutType: "Calisthenics",          streak: 6,  isOnline: true  },
    { id: 12, name: "Keisha T.",  photo: "https://images.unsplash.com/photo-1487956382158-bb926046304a?w=200&h=200&fit=crop&crop=face", count: 17, workoutType: "Cardio / HIIT",         streak: 2,  isOnline: false },
    { id: 13, name: "Leo F.",     photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop&crop=face", count: 16, workoutType: "Strength Training",     streak: 18, isOnline: true  },
    { id: 14, name: "Simone A.",  photo: "https://images.unsplash.com/photo-1609899464926-da0d5b3fd2eb?w=200&h=200&fit=crop&crop=face", count: 15, workoutType: "Bodybuilding",          streak: 8,  isOnline: false },
    { id: 15, name: "Tyrese H.",  photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop&crop=face", count: 14, workoutType: "Cycling",               streak: 1,  isOnline: true  },
    { id: 16, name: "Fatima O.",  photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop&crop=face", count: 13, workoutType: "Flexibility & Wellness", streak: 22, isOnline: false },
    { id: 17, name: "Remy J.",    photo: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=200&h=200&fit=crop&crop=face", count: 13, workoutType: "Strength Training",     streak: 3,  isOnline: true  },
    { id: 18, name: "Amara N.",   photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=face", count: 12, workoutType: "Cardio / HIIT",         streak: 15, isOnline: false },
    { id: 19, name: "Zach P.",    photo: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop&crop=face", count: 12, workoutType: "Bodybuilding",          streak: 5,  isOnline: true  },
    { id: 20, name: "Nia W.",     photo: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=200&h=200&fit=crop&crop=face", count: 11, workoutType: "Calisthenics",          streak: 9,  isOnline: false },
    { id: 21, name: "Kofi A.",    photo: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&h=200&fit=crop&crop=face", count: 11, workoutType: "Cycling",               streak: 4,  isOnline: true  },
    { id: 22, name: "Bianca S.",  photo: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop&crop=face", count: 10, workoutType: "Strength Training",     streak: 7,  isOnline: false },
    { id: 23, name: "Miles C.",   photo: "https://images.unsplash.com/photo-1534368538338-39f7f0a18b2d?w=200&h=200&fit=crop&crop=face", count: 10, workoutType: "Bodybuilding",          streak: 2,  isOnline: true  },
    { id: 24, name: "Yara M.",    photo: "https://images.unsplash.com/photo-1487956382158-bb926046304a?w=200&h=200&fit=crop&crop=face", count: 9,  workoutType: "Cardio / HIIT",         streak: 13, isOnline: false },
    { id: 25, name: "Elias T.",   photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop&crop=face", count: 9,  workoutType: "Flexibility & Wellness", streak: 6,  isOnline: true  },
    { id: 26, name: "Laila K.",   photo: "https://images.unsplash.com/photo-1609899464926-da0d5b3fd2eb?w=200&h=200&fit=crop&crop=face", count: 8,  workoutType: "Strength Training",     streak: 1,  isOnline: false },
    { id: 27, name: "Darius F.",  photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop&crop=face", count: 8,  workoutType: "Cycling",               streak: 10, isOnline: true  },
    { id: 28, name: "Zoe H.",     photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop&crop=face", count: 8,  workoutType: "Cardio / HIIT",         streak: 3,  isOnline: false },
    { id: 29, name: "Omari J.",   photo: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=200&h=200&fit=crop&crop=face", count: 7,  workoutType: "Bodybuilding",          streak: 8,  isOnline: true  },
    { id: 30, name: "Chloe V.",   photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=face", count: 7,  workoutType: "Calisthenics",          streak: 5,  isOnline: false },
    { id: 31, name: "Isaiah R.",  photo: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop&crop=face", count: 7,  workoutType: "Strength Training",     streak: 2,  isOnline: true  },
    { id: 32, name: "Mia T.",     photo: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=200&h=200&fit=crop&crop=face", count: 6,  workoutType: "Flexibility & Wellness", streak: 16, isOnline: false },
    { id: 33, name: "Kaiden B.",  photo: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&h=200&fit=crop&crop=face", count: 6,  workoutType: "Cycling",               streak: 4,  isOnline: true  },
    { id: 34, name: "Indira C.",  photo: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop&crop=face", count: 6,  workoutType: "Cardio / HIIT",         streak: 7,  isOnline: false },
    { id: 35, name: "Troy M.",    photo: "https://images.unsplash.com/photo-1534368538338-39f7f0a18b2d?w=200&h=200&fit=crop&crop=face", count: 5,  workoutType: "Bodybuilding",          streak: 1,  isOnline: true  },
    { id: 36, name: "Alana P.",   photo: "https://images.unsplash.com/photo-1487956382158-bb926046304a?w=200&h=200&fit=crop&crop=face", count: 5,  workoutType: "Strength Training",     streak: 9,  isOnline: false },
    { id: 37, name: "Xavier N.",  photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop&crop=face", count: 5,  workoutType: "Calisthenics",          streak: 3,  isOnline: true  },
    { id: 38, name: "Raina L.",   photo: "https://images.unsplash.com/photo-1609899464926-da0d5b3fd2eb?w=200&h=200&fit=crop&crop=face", count: 4,  workoutType: "Cycling",               streak: 6,  isOnline: false },
    { id: 39, name: "Quincy T.",  photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop&crop=face", count: 4,  workoutType: "Cardio / HIIT",         streak: 2,  isOnline: true  },
    { id: 40, name: "Sasha W.",   photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200&h=200&fit=crop&crop=face", count: 4,  workoutType: "Flexibility & Wellness", streak: 11, isOnline: false },
    { id: 41, name: "Bryce O.",   photo: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=200&h=200&fit=crop&crop=face", count: 3,  workoutType: "Bodybuilding",          streak: 4,  isOnline: true  },
    { id: 42, name: "Iman F.",    photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=face", count: 3,  workoutType: "Strength Training",     streak: 1,  isOnline: false },
    { id: 43, name: "Andre K.",   photo: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop&crop=face", count: 3,  workoutType: "Cycling",               streak: 7,  isOnline: true  },
    { id: 44, name: "Lena C.",    photo: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=200&h=200&fit=crop&crop=face", count: 2,  workoutType: "Cardio / HIIT",         streak: 3,  isOnline: false },
    { id: 45, name: "Theo R.",    photo: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&h=200&fit=crop&crop=face", count: 2,  workoutType: "Calisthenics",          streak: 5,  isOnline: true  },
    { id: 46, name: "Nora H.",    photo: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop&crop=face", count: 2,  workoutType: "Bodybuilding",          streak: 2,  isOnline: false },
    { id: 47, name: "Cam J.",     photo: "https://images.unsplash.com/photo-1534368538338-39f7f0a18b2d?w=200&h=200&fit=crop&crop=face", count: 2,  workoutType: "Strength Training",     streak: 8,  isOnline: true  },
    { id: 48, name: "Vera M.",    photo: "https://images.unsplash.com/photo-1487956382158-bb926046304a?w=200&h=200&fit=crop&crop=face", count: 1,  workoutType: "Cycling",               streak: 1,  isOnline: false },
    { id: 49, name: "Jace T.",    photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop&crop=face", count: 1,  workoutType: "Cardio / HIIT",         streak: 4,  isOnline: true  },
    { id: 50, name: "Kira B.",    photo: "https://images.unsplash.com/photo-1609899464926-da0d5b3fd2eb?w=200&h=200&fit=crop&crop=face", count: 1,  workoutType: "Flexibility & Wellness", streak: 2,  isOnline: false },
  ]);
  const [ghostedIds, setGhostedIds] = useState(new Set());
  const [thankedIds, setThankedIds] = useState(new Set());
  const [youIds, setYouIds]         = useState(new Set());
  const [inbox, setInbox]           = useState(MOCK_INBOX);
  const [history, setHistory]       = useState([]);
  const [complimentAnim, setComplimentAnim] = useState(false);

  // ── Settings ──
  const [showOnline, setShowOnline] = useState(true);
  const [showAge, setShowAge]       = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [blockedUsers, setBlockedUsers]   = useState([]);
  const [overlayMenu, setOverlayMenu]     = useState(false);   // ⋯ menu in profile overlay
  const [overlayReport, setOverlayReport] = useState(null);    // null | { step:1|2|3|4, target, reason, details }
  const [settingsSheet, setSettingsSheet] = useState(null); // "block" | "report" | "privacy" | "terms"
  const [reportStep, setReportStep]       = useState(1);

  // ── Verification ──
  const [verifyStep, setVerifyStep]       = useState("intro"); // intro | selfie | confirm | done
  const [verifyAgeChecked, setVerifyAgeChecked] = useState(false);
  const [verifySelfie, setVerifySelfie]   = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [reportTarget, setReportTarget]   = useState("");
  const [reportReason, setReportReason]   = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [blockSearch, setBlockSearch]     = useState("");
  const [openFaq, setOpenFaq]             = useState(null); // index of open FAQ item

  // ── Toast ──
  const [toast, showToast]          = useToast();

  // ── City request ──
  const [cityRequestOpen, setCityRequestOpen] = useState(false);
  const [cityRequestVal, setCityRequestVal]   = useState("");
  const [cityRequestSent, setCityRequestSent] = useState(false);

  // ── Load gyms from Supabase ──
  useEffect(() => {
    sb.from("gyms").select("id,name,address,neighborhood,city,lat,lng").then(data => {
      if (Array.isArray(data)) {
        setAllGyms(data.map(g => ({
          id: g.id, name: g.name,
          address: g.address || "",
          neighborhood: g.neighborhood || "",
          city: g.city || "New York",
        })));
      }
    });
  }, []);

  // Floor "live" simulation — shuffle users every 45s when checked in, simulate joins/leaves
  const [floorPulse, setFloorPulse] = useState(false);
  useEffect(() => {
    if (!checkedIn) return;
    const interval = setInterval(() => {
      setLobbyUsers(prev => {
        const shuffled = [...prev].sort(() => Math.random() - 0.5);
        const idx = Math.floor(Math.random() * shuffled.length);
        shuffled[idx] = { ...shuffled[idx], isOnline: !shuffled[idx].isOnline,
          onlineSince: shuffled[idx].isOnline ? "Last seen just now" : "At the gym just now" };
        return shuffled;
      });
      setFloorPulse(true);
      setTimeout(() => setFloorPulse(false), 800);
    }, 45000);
    return () => clearInterval(interval);
  }, [checkedIn]);

  // 30-min gym timer — tick every second while checked in, award streak at threshold
  useEffect(() => {
    if (!checkedIn || !gymSessionStart) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gymSessionStart) / 1000);
      setGymTimeElapsed(elapsed);
      // Award streak at 30 minutes if not already earned today
      if (elapsed >= STREAK_THRESHOLD && !streakEarnedToday) {
        setStreakEarnedToday(true);
        try { localStorage.setItem("frost_streak_earned", JSON.stringify({ date: todayKey })); } catch {}
        setCheckinDates(prev => {
          const updated = [...new Set([...prev, todayKey])];
          try { localStorage.setItem("frost_checkin_dates", JSON.stringify(updated)); } catch {}
          return updated;
        });
        showToast("🔥 Streak + bonus compliment earned! You showed up today.");
        // Award bonus compliment once per day
        if (!bonusComplimentEarnedToday) {
          setBonusComplimentEarnedToday(true);
          try { localStorage.setItem("frost_bonus_compliment", JSON.stringify({ date: todayKey })); } catch {}
        }
      }
      // Auto checkout when session duration expires
      if (sessionAutoCheckoutAt && Date.now() >= sessionAutoCheckoutAt) {
        setCheckedIn(false);
        setGymSessionStart(null);
        setGymTimeElapsed(0);
        setSessionAutoCheckoutAt(null);
        setMyVibe(null);
        showToast("⏱️ Session complete — you've been checked out automatically.");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [checkedIn, gymSessionStart, streakEarnedToday, bonusComplimentEarnedToday, sessionAutoCheckoutAt]);

  // ── Helpers ──
  const activeGym = lbGym || homeGyms[0] || { name: "Equinox SoHo", id: "demo" };
  const filteredLbGyms = lbGymSearch.length > 1
    ? (allGyms.length > 0 ? allGyms : [{ id:"demo", name:"Equinox SoHo", neighborhood:"SoHo" },{ id:"demo2", name:"Barry's Bootcamp NYC", neighborhood:"NoMad" },{ id:"demo3", name:"Blink Fitness Midtown", neighborhood:"Midtown" }])
        .filter(g => g.name.toLowerCase().includes(lbGymSearch.toLowerCase()) || (g.neighborhood||"").toLowerCase().includes(lbGymSearch.toLowerCase()))
        .slice(0, 8)
    : [];
  const statIsSent = statSheet === "sent";
  const statItems = statIsSent ? history : inbox.filter(n => n.type === "compliment");
  const statTitle = statIsSent ? "Compliments Sent" : "Compliments Received";
  const statEmpty = statIsSent ? "You haven't sent any compliments yet" : "No compliments received yet";
  const statEmptyIcon = statIsSent ? "💬" : "🎉";
  const filteredGyms = allGyms.filter(g => {
    const q = gymSearch.toLowerCase();
    return (g.name||"").toLowerCase().includes(q) ||
           (g.neighborhood||"").toLowerCase().includes(q) ||
           (g.address||"").toLowerCase().includes(q);
  });

  const sortedGyms = [...allGyms].sort((a,b) => a.name.localeCompare(b.name));

  const displayGyms = gymSearch.length > 1 ? filteredGyms
    : homeGyms.length > 0 && !showAllGyms
      ? sortedGyms.filter(g => homeGyms.some(h => h.id === g.id))
      : sortedGyms;

  const unreadCount = inbox.filter(n => n.unread).length;

  const validateSignup = () => {
    const e = {};
    if (signupStep === "name") {
      if (!firstName.trim()) e.firstName = "Required";
      if (!lastInitial.trim()) e.lastInitial = "Required";
      if (!age || isNaN(age) || +age < 18 || +age > 100) e.age = "Must be 18-100";
      if (!sexuality) e.sexuality = "Required";
    }
    if (signupStep === "workout" && !workout) e.workout = "Pick your style";
    if (signupStep === "goals" && goals.length === 0) e.goals = "Pick at least one";
    if (signupStep === "photos" && !photos[0]) e.photos = "Add at least one photo";
    setSignupErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextSignup = () => {
    if (!validateSignup()) return;
    setSignupErrors({});
    const idx = SIGNUP_STEPS.indexOf(signupStep);
    if (idx < SIGNUP_STEPS.length - 1) setSignupStep(SIGNUP_STEPS[idx+1]);
  };

  const backSignup = () => {
    setSignupErrors({});
    const idx = SIGNUP_STEPS.indexOf(signupStep);
    if (idx > 0) setSignupStep(SIGNUP_STEPS[idx-1]);
    else setScreen("onboarding");
  };

  const doCheckIn = () => {
    setCheckInLoading(true);
    setTimeout(() => {
      setCheckInLoading(false);
      setCheckedIn(true);
      setMainTab("floor");
      showToast("You are at the gym! Say hi to someone.");
    }, 1200);
  };

  const sendCompliment = (c) => {
    if (!viewingUser) return;
    // Streak is earned by 30min gym session, not by sending compliments
    // Free tier limit check
    if (userTier === "free" && Object.keys(sentToday).length >= TIER_LIMITS.free) {
      setShowUpgrade(true);
      return;
    }
    const senderName = ghostMode ? "Someone" : myProfile.name;
    const senderPhoto = ghostMode ? null : myProfile.photo;
    setSentToday(p => {
      const n = { ...p, [viewingUser.id]: c.id };
      persistSentToday(n);
      // Fire 1-left nudge when they have exactly 1 compliment remaining
      const remaining = TIER_LIMITS.free - Object.keys(n).length;
      if (userTier === "free" && remaining === 1) {
        setTimeout(() => setShowOneLeftNudge(true), 1200);
      }
      return n;
    });
    setComplimentAnim(true);
    setHistory(h => [{ id: Date.now(), user: viewingUser.name, photo: viewingUser.photo, compliment: c.label, time: "Just now", reply: null, userData: viewingUser, ghost: ghostMode }, ...h]);
    // Your outbox notification
    const newNotif = { id: Date.now(), type: "compliment_sent", user: viewingUser.name, photo: viewingUser.photo, text: ghostMode ? `You ghost-sent "${c.label}" to ${viewingUser.name.split(" ")[0]}` : `You sent "${c.label}" to ${viewingUser.name.split(" ")[0]}`, time: "Just now", unread: false, ghost: ghostMode };
    // Simulate the RECEIVED notification from the recipient's perspective — using senderName/senderPhoto
    // (In production this would be a real push notification to the other user)
    const receivedByThem = {
      id: Date.now() + 2, type: "compliment_received_echo", ghost: ghostMode,
      user: senderName, photo: senderPhoto,
      text: `${senderName} sent you "${c.label}"`,
      time: "Just now", unread: false, forUser: viewingUser.id,
    };
    setInbox(n => [newNotif, receivedByThem, ...n]);
    // Check for mutual notice — if they already complimented us back
    const theyComplimentedUs = inbox.some(n => n.userData?.id === viewingUser.id && n.type === "compliment");
    if (theyComplimentedUs && !ghostMode) {
      setMutualNotices(s => new Set([...s, viewingUser.id]));
      setTimeout(() => {
        const mutualNotif = { id: Date.now() + 1, type: "mutual", user: viewingUser.name, photo: viewingUser.photo, text: `You and ${viewingUser.name.split(" ")[0]} both noticed each other`, time: "Just now", unread: true, userData: viewingUser };
        setInbox(n => [mutualNotif, ...n]);
        showToast(`✨ You and ${viewingUser.name.split(" ")[0]} both noticed each other!`);
      }, 1200);
    }
    setTimeout(() => { setComplimentAnim(false); showToast(ghostMode ? `👻 Ghost compliment sent!` : `${c.emoji} Sent to ${viewingUser.name.split(" ")[0]}!`); setViewingUser(null); }, 1000);
  };

  const ghostUser = (user) => {
    setGhostedIds(s => new Set([...s, user.id]));
    setLobbyUsers(u => u.filter(x => x.id !== user.id));
    setViewingUser(null);
    showToast("Ghosted — they are gone.");
  };

  const saveProfile = () => {
    if (editDraft) {
      setMyProfile(p => ({...p, ...editDraft}));
      showToast("Profile updated!");
      setEditDraft(null);
    }
  };

  // ── OTP handler ──
  const handleOtp = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    setOtpError(false);
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx+1]?.focus();
    if (next.every(d => d !== "")) {
      setOtpLoading(true);
      setTimeout(() => {
        setOtpLoading(false);
        if (authMode === "login") {
          setMyProfile(p => ({...p, name: "User"}));
          setScreen("main");
          showToast("Welcome back! 👋");
        } else {
          // New user — show onboarding (mark as seen so it won't repeat)
          localStorage.setItem("frost_onboarding_seen", "1");
          setScreen("onboarding");
        }
      }, 900);
    }
  };
  const handleOtpResend = () => {
    setOtp(["","","","","",""]);
    setOtpError(false);
    otpRefs.current[0]?.focus();
    showToast("Code resent! Use any 6 digits to test.");
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* Toast */}
        {toast && (
          <div className={`toast ${toast.type} show`} key={toast.id}>
            {toast.msg}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            AUTH SCREEN
        ══════════════════════════════════════════════════ */}
        {screen === "auth" && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Hero */}
            <div style={{ background: "linear-gradient(160deg, #080E18 0%, #080808 70%)", padding: "64px 32px 44px", position: "relative", overflow: "hidden" }}>
              {/* Ice glow orb */}
              <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, #A8D8F018 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -20, left: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, #4DFFC408 0%, transparent 70%)", pointerEvents: "none" }} />
              <Logo size="lg" />
              <div style={{ marginTop: 20, lineHeight: 1.25 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2.5, color: "var(--text3)", textTransform: "uppercase", marginBottom: 8 }}>
                  Your Gym. Your Scene.
                </div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 38, letterSpacing: 3, color: "var(--text)", lineHeight: 1 }}>
                  Break.<span style={{ color: "var(--purple)" }}>The.</span>Ice.
                </div>
              </div>

              {/* Live cities */}
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "var(--text3)", textTransform: "uppercase", marginBottom: 10 }}>Now Live In</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {["🗽 New York", "🌴 Los Angeles", "🌊 Miami", "🌬️ Chicago", "🤠 Austin", "🍑 Atlanta", "🦞 Boston"].map(city => (
                    <div key={city} style={{ background: "#0E0E18", border: "1px solid #FF6B0030", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "var(--text2)", letterSpacing: 0.3 }}>
                      {city}
                    </div>
                  ))}
                  <button onClick={() => setCityRequestOpen(true)} style={{ background: "transparent", border: "1px dashed #FF6B0050", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#FF6B00", cursor: "pointer", letterSpacing: 0.3, fontFamily: "'DM Sans',sans-serif" }}>
                    + Request City
                  </button>
                </div>
              </div>
            </div>

            {/* Auth Buttons */}
            <div style={{ display: "flex", gap: 10, margin: "0 24px" }}>
              <button
                onClick={() => setAuthMode("signup")}
                style={{
                  flex: 1, padding: "16px 0", borderRadius: 16,
                  background: authMode === "signup" ? "#FF6B00" : "transparent",
                  border: "2px solid #FF6B00",
                  color: "#ffffff",
                  fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 800,
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: authMode === "signup" ? "0 4px 24px #FF6B0040" : "none",
                  letterSpacing: 0.2,
                }}>
                Create Account
              </button>
              <button
                onClick={() => setAuthMode("login")}
                style={{
                  flex: 1, padding: "16px 0", borderRadius: 16,
                  background: authMode === "login" ? "#FF6B00" : "transparent",
                  border: "2px solid #FF6B00",
                  color: "#ffffff",
                  fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 800,
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: authMode === "login" ? "0 4px 24px #FF6B0040" : "none",
                  letterSpacing: 0.2,
                }}>
                Log In
              </button>
            </div>

            <div style={{ padding: "28px 24px 40px", flex: 1 }}>
              {authStep === "phone" && (
                <div className="fade-up">
                  <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                    {authMode === "signup" ? "Now live in 7 cities. Connect through compliments." : "Welcome back. Enter your number to continue."}
                  </div>

                  {/* ── DEMO MODE BUTTON ── */}
                  <button onClick={() => {
                    setMyProfile({
                      name: "Alex R.",
                      photo: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop&crop=face",
                      photos: [
                        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=700&fit=crop&crop=face",
                        "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=700&fit=crop",
                      ],
                      workoutType: "Strength Training",
                      goals: ["💪 Build Muscle", "🏆 Get Stronger"],
                      sexuality: "straight",
                      pronouns: "he",
                      bio: "Lifting since 2018. Equinox regular.",
                      age: 27,
                      height: "6'1\"",
                      verified: true,
                    });
                    setHomeGyms([
                      { id: "demo1", name: "Equinox SoHo", neighborhood: "SoHo" },
                      { id: "demo2", name: "Barry's Bootcamp NYC", neighborhood: "NoMad" },
                    ]);
                    setMainTab("floor");
                    const hasSeen = localStorage.getItem("frost_onboarding_seen");
                    if (!hasSeen) {
                      localStorage.setItem("frost_onboarding_seen", "1");
                      setScreen("onboarding");
                    } else {
                      setCheckedIn(true);
                      setScreen("main");
                    }
                    showToast("👋 Demo mode — welcome to Frost!");
                  }} style={{
                    width: "100%", padding: "16px", marginBottom: 16,
                    background: "linear-gradient(135deg, #0D1A0D, #0A1520)",
                    border: "1.5px solid #38E8A060",
                    borderRadius: 16, cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 800,
                    color: "#38E8A0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#38E8A0"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#38E8A060"}
                  >
                    <span style={{ fontSize: 18 }}>⚡</span> Try Demo
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    <span style={{ color: "var(--text3)", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>OR</span>
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <select value={country.code} onChange={e => setCountry(COUNTRIES.find(c => c.code === e.target.value))} style={{ background: "var(--bg3)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "14px 10px", color: "var(--text)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none", flexShrink: 0 }}>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                    </select>
                    <input className="input" type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,""))} style={{ flex: 1 }} />
                  </div>
                  <button className="btn-primary" onClick={() => { if (phone.length >= 7) setAuthStep("otp"); else showToast("Enter a valid number","error"); }}>
                    Continue
                  </button>
                  <div style={{ textAlign: "center", marginTop: 20, color: "var(--text4)", fontSize: 12, lineHeight: 1.6 }}>
                    By continuing you agree to Frost's Terms &amp; Privacy Policy
                  </div>
                </div>
              )}

              {authStep === "otp" && (
                <div className="fade-up">
                  <BackBtn onClick={() => { setAuthStep("phone"); setOtp(["","","","","",""]); setOtpError(false); setOtpLoading(false); }} />
                  <div style={{ marginTop: 20, marginBottom: 6, fontWeight: 700, fontSize: 18 }}>Enter code</div>
                  <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 28 }}>
                    Sent to {country.code} {phone} &mdash; use any 6 digits to test
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16, animation: otpError ? "shake 0.4s ease" : "none" }}>
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        className={`otp-box${d ? " filled" : ""}`}
                        type="tel"
                        maxLength={1}
                        value={d}
                        disabled={otpLoading}
                        onChange={e => handleOtp(i, e.target.value)}
                        onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) otpRefs.current[i-1]?.focus(); }}
                        style={{ borderColor: otpError ? "#C41230" : d ? "var(--red)" : undefined, opacity: otpLoading ? 0.5 : 1, transition: "all 0.2s" }}
                      />
                    ))}
                  </div>
                  {otpError && (
                    <div style={{ textAlign: "center", color: "#FF6B6B", fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                      Incorrect code — try again
                    </div>
                  )}
                  {otpLoading && (
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text3)", fontSize: 13 }}>
                        <div style={{ width: 14, height: 14, border: "2px solid var(--red)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                        Verifying…
                      </div>
                    </div>
                  )}
                  <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 13, marginBottom: 8 }}>
                    Didn't get it? <span onClick={handleOtpResend} style={{ color: "var(--red)", cursor: "pointer", fontWeight: 600 }}>Resend</span>
                  </div>
                </div>
              )}
            </div>

            {/* City Request Modal */}
            {cityRequestOpen && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 999, display: "flex", alignItems: "flex-end" }} onClick={() => { setCityRequestOpen(false); setCityRequestSent(false); setCityRequestVal(""); }}>
                <div style={{ width: "100%", background: "var(--bg2)", borderRadius: "24px 24px 0 0", padding: "28px 24px 48px", border: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>
                  {!cityRequestSent ? (<>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, letterSpacing: 2, marginBottom: 6 }}>Request a City</div>
                    <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Tell us where you want Frost. We track every request and launch in the most requested cities first.</div>
                    <input
                      className="input"
                      placeholder="City, State (e.g. Dallas, TX)"
                      value={cityRequestVal}
                      onChange={e => setCityRequestVal(e.target.value)}
                      style={{ marginBottom: 16 }}
                      autoFocus
                    />
                    <button className="btn-primary" onClick={() => {
                      if (cityRequestVal.trim().length > 2) {
                        setCityRequestSent(true);
                        // Persist so Settings can show "Requested: X"
                        const existing = JSON.parse(localStorage.getItem("frost_city_requests") || "[]");
                        if (!existing.includes(cityRequestVal.trim())) {
                          localStorage.setItem("frost_city_requests", JSON.stringify([...existing, cityRequestVal.trim()]));
                        }
                      } else {
                        showToast("Enter a city name", "error");
                      }
                    }}>
                      Submit Request
                    </button>
                  </>) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>🧊</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>Request Received</div>
                      <div style={{ color: "var(--text3)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                        We'll break the ice in <span style={{ color: "#FF6B00", fontWeight: 700 }}>{cityRequestVal}</span> soon.
                      </div>
                      <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", marginBottom: 20, textAlign: "left" }}>
                        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 8, fontWeight: 600 }}>Get notified when we launch</div>
                        <input className="input" placeholder="your@email.com" type="email"
                          style={{ marginBottom: 10 }}
                          onKeyDown={e => { if (e.key === "Enter") { showToast("📧 You're on the waitlist!"); e.target.value = ""; }}}
                        />
                        <button className="btn-primary" style={{ fontFamily: "'DM Sans',sans-serif" }} onClick={e => {
                          const inp = e.currentTarget.parentElement.querySelector("input");
                          if (inp && inp.value.includes("@")) { showToast("📧 You're on the waitlist!"); inp.value = ""; }
                          else showToast("Enter a valid email", "error");
                        }}>Notify Me 🔔</button>
                      </div>
                      <button className="btn-primary ghost" style={{ fontFamily: "'DM Sans',sans-serif" }} onClick={() => { setCityRequestOpen(false); setCityRequestSent(false); setCityRequestVal(""); }}>Done</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            ONBOARDING
        ══════════════════════════════════════════════════ */}
        {screen === "onboarding" && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "48px 24px 40px" }}
            onTouchStart={e => { const t = e.touches[0]; e.currentTarget._swipeX = t.clientX; }}
            onTouchEnd={e => {
              const dx = e.changedTouches[0].clientX - (e.currentTarget._swipeX || 0);
              if (Math.abs(dx) > 50) {
                if (dx < 0 && onboardSlide < ONBOARDING.length - 1) setOnboardSlide(s => s + 1);
                if (dx > 0 && onboardSlide > 0) setOnboardSlide(s => s - 1);
              }
            }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <Logo size="md" />
              <button onClick={() => setScreen("ageverify")} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                Skip →
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div className="pop-in" key={onboardSlide}>
                <div style={{ fontSize: 72, marginBottom: 24, lineHeight: 1 }}>{ONBOARDING[onboardSlide].emoji}</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 40, letterSpacing: 2, lineHeight: 1, marginBottom: 16, color: ONBOARDING[onboardSlide].color }}>
                  {ONBOARDING[onboardSlide].title}
                </div>
                <div style={{ color: "var(--text2)", fontSize: 16, lineHeight: 1.7 }}>
                  {ONBOARDING[onboardSlide].body}
                </div>
              </div>
            </div>
            {/* Progress dots */}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
              {ONBOARDING.map((_,i) => (
                <div key={i} onClick={() => setOnboardSlide(i)} style={{ width: i === onboardSlide ? 20 : 6, height: 6, borderRadius: 3, background: i === onboardSlide ? ONBOARDING[onboardSlide].color : "var(--border2)", transition: "all 0.3s", cursor: "pointer" }} />
              ))}
            </div>
            {onboardSlide < ONBOARDING.length - 1 ? (
              <button className="btn-primary" style={{ background: ONBOARDING[onboardSlide].color }} onClick={() => setOnboardSlide(s => s+1)}>
                Next →
              </button>
            ) : (
              <button className="btn-primary" onClick={() => {
                // If coming from demo (already have profile), go to main
                if (myProfile.name && myProfile.name !== "User" && myProfile.name !== "") {
                  setCheckedIn(true);
                  setScreen("main");
                } else {
                  setScreen("ageverify");
                }
              }}>
                Let's Go 🧊
              </button>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            AGE VERIFY
        ══════════════════════════════════════════════════ */}
        {screen === "ageverify" && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
            <div className="pop-in" style={{ textAlign: "center", width: "100%" }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🔞</div>
              <Logo size="md" />
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2, marginTop: 16, marginBottom: 8 }}>18+ Only</div>
              <div style={{ color: "var(--text3)", fontSize: 14, marginBottom: 40, lineHeight: 1.6 }}>Frost is for adults only.<br />You must be 18 or older to continue.</div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-primary ghost" onClick={() => setScreen("auth")}>I'm under 18</button>
                <button className="btn-primary" onClick={() => setScreen("signup")}>I'm 18+</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            SIGNUP
        ══════════════════════════════════════════════════ */}
        {screen === "signup" && (
          <div style={{ padding: "48px 24px 40px", minHeight: "100vh" }}>
            {signupStep !== "done" && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <BackBtn onClick={backSignup} />
                  <span style={{ color: "var(--text3)", fontSize: 12 }}>
                    Step {SIGNUP_STEPS.indexOf(signupStep) + 1} of {SIGNUP_STEPS.length - 1}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${((SIGNUP_STEPS.indexOf(signupStep)+1)/(SIGNUP_STEPS.length-1))*100}%` }} />
                </div>
              </>
            )}

            {/* STEP: NAME */}
            {signupStep === "name" && (
              <div className="fade-up">
                <Logo size="md" />
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2, marginTop: 12, marginBottom: 4 }}>Who Are You?</div>
                <div style={{ color: "var(--text3)", fontSize: 14, marginBottom: 24 }}>Your first name and last initial only.</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 2 }}>
                    <input className="input" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    {signupErrors.firstName && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>{signupErrors.firstName}</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input className="input" placeholder="Last initial" maxLength={1} value={lastInitial} onChange={e => setLastInitial(e.target.value.toUpperCase())} />
                    {signupErrors.lastInitial && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>{signupErrors.lastInitial}</div>}
                  </div>
                </div>
                <input className="input" placeholder="Age" type="number" value={age} onChange={e => setAge(e.target.value)} style={{ marginBottom: 12 }} />
                {signupErrors.age && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 12 }}>{signupErrors.age}</div>}
                <div style={{ marginBottom: 16 }}>
                  <select className="input" value={height} onChange={e => setHeight(e.target.value)} style={{ appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23565870' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center", paddingRight: 40, color: height ? "var(--text)" : "var(--text3)" }}>
                    <option value="" disabled hidden>Height</option>
                    {Array.from({ length: 36 }, (_, i) => {
                      const totalInches = 48 + i; // 4'0" to 6'11"
                      const ft = Math.floor(totalInches / 12);
                      const inch = totalInches % 12;
                      const cm = Math.round(totalInches * 2.54);
                      return <option key={totalInches} value={`${ft}'${inch}" (${cm} cm)`}>{ft}'{inch}" — {cm} cm</option>;
                    })}
                  </select>
                  {signupErrors.height && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>{signupErrors.height}</div>}
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div className="section-label" style={{ marginBottom: 10 }}>I identify as</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {SEXUALITY_OPTIONS.map(s => (
                      <button key={s.id} onClick={() => setSexuality(s.id)} className="btn-sm" style={{ background: sexuality === s.id ? "#080E18" : "var(--bg3)", borderColor: sexuality === s.id ? "#FF6B00" : "var(--border)", color: sexuality === s.id ? "#E8F4FF" : "var(--text2)" }}>
                        {s.emoji} {s.label}
                      </button>
                    ))}
                  </div>
                  {signupErrors.sexuality && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 8 }}>{signupErrors.sexuality}</div>}
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div className="section-label" style={{ marginBottom: 10 }}>Pronouns</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {PRONOUN_OPTIONS.map(p => (
                      <button key={p.id} onClick={() => setPronouns(p.id)} className="btn-sm" style={{ background: pronouns === p.id ? "#080E18" : "var(--bg3)", borderColor: pronouns === p.id ? "#FF6B00" : "var(--border)", color: pronouns === p.id ? "#E8F4FF" : "var(--text2)" }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={nextSignup}>Continue</button>
              </div>
            )}

            {/* STEP: WORKOUT */}
            {signupStep === "workout" && (
              <div className="fade-up">
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2, marginBottom: 4 }}>Your Style</div>
                <div style={{ color: "var(--text3)", fontSize: 14, marginBottom: 24 }}>How do you train?</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {WORKOUT_TYPES.map(w => (
                    <div key={w.id} onClick={() => setWorkout(w.id)} style={{ background: workout === w.id ? "#080E18" : "var(--bg2)", border: `1.5px solid ${workout === w.id ? "#FF6B00" : "var(--border)"}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}>
                      <span style={{ fontSize: 22 }}>{w.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: 15, color: workout === w.id ? "#fff" : "var(--text2)" }}>{w.label}</span>
                      {workout === w.id && <span style={{ marginLeft: "auto", color: "var(--red)" }}>✓</span>}
                    </div>
                  ))}
                </div>
                {signupErrors.workout && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 12 }}>{signupErrors.workout}</div>}
                <button className="btn-primary" onClick={nextSignup}>Continue</button>
              </div>
            )}

            {/* STEP: GOALS */}
            {signupStep === "goals" && (
              <div className="fade-up">
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2, marginBottom: 4 }}>Your Goals</div>
                <div style={{ color: "var(--text3)", fontSize: 14, marginBottom: 24 }}>Pick up to 3 that fit you.</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                  {GOALS.map(g => {
                    const active = goals.includes(g.id);
                    return (
                      <button key={g.id} onClick={() => setGoals(prev => active ? prev.filter(x=>x!==g.id) : prev.length < 3 ? [...prev,g.id] : prev)} style={{ background: active ? "#080E18" : "var(--bg2)", border: `1.5px solid ${active ? "#FF6B00" : "var(--border)"}`, borderRadius: 20, padding: "10px 16px", cursor: "pointer", color: active ? "#fff" : "var(--text2)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, transition: "all 0.15s", opacity: !active && goals.length >= 3 ? 0.4 : 1 }}>
                        {g.emoji} {g.label}
                      </button>
                    );
                  })}
                </div>
                {signupErrors.goals && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 12 }}>{signupErrors.goals}</div>}
                <button className="btn-primary" onClick={nextSignup}>Continue</button>
              </div>
            )}

            {/* STEP: PHOTOS */}
            {signupStep === "photos" && (
              <div className="fade-up">
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2, marginBottom: 4 }}>Your Photos</div>
                <div style={{ color: "var(--text3)", fontSize: 14, marginBottom: 24 }}>Show yourself. Real people only.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                  {[0,1].map(i => (
                    <label key={i}>
                      <div className="photo-slot" style={{ border: `2px ${photos[i] ? "solid" : "dashed"} ${photos[i] ? "#FF6B00" : "var(--border2)"}` }}>
                        {photos[i] ? (
                          <img src={photos[i]} alt="" />
                        ) : (
                          <div style={{ textAlign: "center", color: "var(--text3)" }}>
                            <div style={{ fontSize: 28 }}>{i === 0 ? "📸" : "+"}</div>
                            <div style={{ fontSize: 11, marginTop: 4 }}>{i === 0 ? "Main Photo" : "Optional"}</div>
                          </div>
                        )}
                      </div>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => { const p = [...photos]; p[i] = ev.target.result; setPhotos(p); };
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  ))}
                </div>
                <input className="input" placeholder="Bio (optional, 50 chars)" maxLength={50} value={bio} onChange={e => setBio(e.target.value)} style={{ marginBottom: 24 }} />
                {signupErrors.photos && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 12 }}>{signupErrors.photos}</div>}
                <button className="btn-primary" onClick={nextSignup}>Continue</button>
              </div>
            )}

            {/* STEP: DONE */}
            {signupStep === "done" && (
              <div className="pop-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", minHeight: "80vh", justifyContent: "center" }}>
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#131a00", border: "2px solid #38E8A044", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, marginBottom: 24, boxShadow: "0 0 40px rgba(124,255,107,0.1)" }}>
                  🎉
                </div>
                <Logo size="lg" />
                <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 6, marginTop: 16 }}>
                  Welcome, {firstName} {lastInitial}.
                </div>
                <div style={{ color: "var(--text3)", fontSize: 14, marginBottom: 36, lineHeight: 1.8 }}>
                  Your verified profile is ready.<br />Now pick your home gyms.
                </div>
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 20, padding: 20, width: "100%", marginBottom: 32, textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {photos[0] ? (
                        <img src={photos[0]} alt="" style={{ width: 60, height: 60, borderRadius: 16, objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: 60, height: 60, borderRadius: 16, background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👤</div>
                      )}
                      <div style={{ position: "absolute", bottom: -4, right: -4, background: "var(--green)", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg2)" }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: "#ffffff" }}>✓</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 17 }}>
                        {firstName} {lastInitial}. <span style={{ background: "var(--green)22", color: "var(--green)", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>Verified</span>
                      </div>
                      <div style={{ color: "var(--red)", fontSize: 13, fontWeight: 600, marginTop: 3 }}>
                        {WORKOUT_TYPES.find(w => w.id === workout)?.label}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="btn-primary green" onClick={() => {
                  const labelGoals = goals.map(g => { const f = GOALS.find(x => x.id === g); return f ? `${f.emoji} ${f.label}` : g; });
                  setMyProfile({
                    name: `${firstName} ${lastInitial}.`,
                    photo: photos[0],
                    photos,
                    workoutType: WORKOUT_TYPES.find(w => w.id === workout)?.label || workout,
                    goals: labelGoals,
                    sexuality,
                    bio,
                    age: +age,
                    height,
                    verified: true,
                  });
                  setScreen("homegyms");
                }}>
                  Pick My Home Gyms
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            HOME GYMS PICKER
        ══════════════════════════════════════════════════ */}
        {screen === "homegyms" && (
          <div style={{ padding: "48px 24px 120px", minHeight: "100vh" }}>
            <Logo size="md" />
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 2, lineHeight: 1, marginBottom: 6, marginTop: 16 }}>
              Your Home Gyms
            </div>
            <div style={{ color: "var(--text3)", fontSize: 14, marginBottom: 6 }}>
              Pick up to 2 gyms you regularly train at.
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ color: "var(--red)", fontSize: 13, fontWeight: 700 }}>{homeGyms.length}/2 selected</div>
              {allGyms.length > 0 && <div style={{ color: "var(--text4)", fontSize: 12 }}>{allGyms.length} gyms loaded</div>}
            </div>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--text3)" }}>🔍</span>
              <input className="input" placeholder="Search by name or neighborhood..." value={gymSearch} onChange={e => setGymSearch(e.target.value)} style={{ paddingLeft: 44 }} />
            </div>
            {allGyms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text3)" }}>
                <Spinner /><br /><br />Loading gyms...
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(gymSearch.length > 1 ? filteredGyms : sortedGyms).map(gym => {
                  const selected = homeGyms.some(h => h.id === gym.id);
                  const disabled = !selected && homeGyms.length >= 2;
                  return (
                    <div key={gym.id} onClick={() => {
                      if (selected) setHomeGyms(h => h.filter(x => x.id !== gym.id));
                      else if (!disabled) setHomeGyms(h => [...h, gym]);
                    }} style={{ background: selected ? "#080E18" : "var(--bg2)", border: `1.5px solid ${selected ? "var(--green)" : disabled ? "var(--bg3)" : "var(--border)"}`, borderRadius: 14, padding: "14px 16px", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: selected ? "var(--green)" : "var(--text)", marginBottom: 2 }}>{gym.name}</div>
                        <div style={{ color: "var(--text3)", fontSize: 12 }}>{gym.neighborhood || gym.city}</div>
                      </div>
                      {selected && <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#ffffff", flexShrink: 0, marginLeft: 12 }}>✓</div>}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Sticky bottom */}
            <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, padding: "16px 24px 32px", background: "linear-gradient(to top, var(--bg) 70%, transparent)", zIndex: 100 }}>
              {homeGyms.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {homeGyms.map(g => (
                    <div key={g.id} style={{ flex: 1, background: "#080E18", border: "1px solid #38E8A033", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ color: "var(--green)", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name.split(" ").slice(0,3).join(" ")}</span>
                      <span onClick={() => setHomeGyms(h => h.filter(x => x.id !== g.id))} style={{ color: "var(--text3)", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>x</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn-primary" onClick={() => { if (homeGyms.length === 0) { setScreen("main"); } else { setVerifyStep("intro"); setScreen("verify"); } }}>
                {homeGyms.length === 0 ? "Skip for now" : "Enter App"}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            VERIFY SCREEN
        ══════════════════════════════════════════════════ */}
        {screen === "verify" && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

            {/* Header */}
            <div style={{ padding: "56px 24px 24px", background: "linear-gradient(160deg, #0E0808 0%, #080808 60%)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, #FF6B0012 0%, transparent 70%)", pointerEvents: "none" }} />
              <Logo size="md" />
              <div style={{ marginTop: 16 }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 30, letterSpacing: 2, color: "var(--text)" }}>Verify Your Identity</div>
                <div style={{ color: "var(--text3)", fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>One last step before you hit the floor. This keeps Frost real.</div>
              </div>
              {/* Progress dots */}
              <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
                {["intro","selfie","confirm"].map(s => (
                  <div key={s} style={{ height: 3, flex: 1, borderRadius: 99, background: ["intro","selfie","confirm"].indexOf(s) <= ["intro","selfie","confirm"].indexOf(verifyStep) ? "#FF6B00" : "var(--border)", transition: "background 0.3s" }} />
                ))}
              </div>
            </div>

            <div style={{ padding: "28px 24px 40px", flex: 1, display: "flex", flexDirection: "column" }}>

              {/* STEP 1 — Intro */}
              {verifyStep === "intro" && (
                <div className="fade-up">
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                    {[
                      { icon: "📸", title: "Quick Selfie", desc: "Take a live photo so we know you're a real person — not a bot or a fake profile." },
                      { icon: "🔞", title: "Age Confirmation", desc: "Confirm you're 18 or older. Frost is an adult-only community." },
                      { icon: "🔒", title: "Private & Secure", desc: "Your selfie is used only for verification. It's never shown on your profile or stored publicly." },
                    ].map(item => (
                      <div key={item.icon} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "var(--bg2)", borderRadius: 16, padding: "16px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{item.title}</div>
                          <div style={{ color: "var(--text3)", fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={() => setVerifyStep("selfie")}>
                    Start Verification →
                  </button>
                </div>
              )}

              {/* STEP 2 — Selfie */}
              {verifyStep === "selfie" && (
                <div className="fade-up" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Take a Selfie</div>
                  <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>Look straight at the camera in good lighting. No sunglasses or masks.</div>

                  {/* Camera area */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
                    <div style={{ width: 200, height: 200, borderRadius: "50%", border: `3px solid ${verifySelfie ? "#38E8A0" : "#FF6B0060"}`, background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", transition: "border-color 0.3s", boxShadow: verifySelfie ? "0 0 24px #38E8A030" : "0 0 24px #FF6B0020" }}>
                      {verifySelfie ? (
                        <>
                          <img src={verifySelfie} alt="selfie" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(56,232,160,0.12)", borderRadius: "50%" }}>
                            <span style={{ fontSize: 36, filter: "drop-shadow(0 0 8px #38E8A0)" }}>✓</span>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 48 }}>🤳</div>
                          <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 8 }}>Position your face</div>
                        </div>
                      )}
                    </div>

                    <label style={{ cursor: "pointer" }}>
                      <input type="file" accept="image/*" capture="user" style={{ display: "none" }} onChange={e => {
                        const file = e.target.files[0];
                        if (file) { const url = URL.createObjectURL(file); setVerifySelfie(url); }
                      }} />
                      <div style={{ background: verifySelfie ? "var(--bg3)" : "#FF6B00", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 15, padding: "14px 32px", borderRadius: 16, border: verifySelfie ? "1.5px solid var(--border)" : "none", transition: "all 0.2s" }}>
                        {verifySelfie ? "Retake Photo" : "Open Camera"}
                      </div>
                    </label>
                  </div>

                  <button className="btn-primary" style={{ opacity: verifySelfie ? 1 : 0.4 }} disabled={!verifySelfie} onClick={() => setVerifyStep("confirm")}>
                    Use This Photo →
                  </button>
                </div>
              )}

              {/* STEP 3 — Age confirm + submit */}
              {verifyStep === "confirm" && (
                <div className="fade-up" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Almost There</div>
                  <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>Review your selfie and confirm your age to unlock the floor.</div>

                  {/* Selfie preview */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--bg2)", borderRadius: 16, padding: 16, border: "1px solid var(--border)", marginBottom: 20 }}>
                    <img src={verifySelfie} alt="selfie" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid #FF6B00" }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Selfie captured</div>
                      <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>Looks good? Tap below to confirm.</div>
                    </div>
                    <button onClick={() => setVerifyStep("selfie")} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text3)", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>Retake</button>
                  </div>

                  {/* Age checkbox */}
                  <div onClick={() => setVerifyAgeChecked(p => !p)} style={{ display: "flex", alignItems: "center", gap: 14, background: verifyAgeChecked ? "#0E0808" : "var(--bg2)", border: `1.5px solid ${verifyAgeChecked ? "#FF6B00" : "var(--border)"}`, borderRadius: 16, padding: 16, cursor: "pointer", marginBottom: 32, transition: "all 0.2s" }}>
                    <div style={{ width: 24, height: 24, borderRadius: 8, border: `2px solid ${verifyAgeChecked ? "#FF6B00" : "var(--border)"}`, background: verifyAgeChecked ? "#FF6B00" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                      {verifyAgeChecked && <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>✓</span>}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700 }}>I confirm I am 18 years of age or older.</span>
                      <span style={{ color: "var(--text3)", fontSize: 12, display: "block", marginTop: 2 }}>Providing false information may result in a permanent ban.</span>
                    </div>
                  </div>

                  <button className="btn-primary" style={{ opacity: verifyAgeChecked && !verifyLoading ? 1 : 0.4 }} disabled={!verifyAgeChecked || verifyLoading}
                    onClick={() => {
                      setVerifyLoading(true);
                      setTimeout(() => {
                        setVerifyLoading(false);
                        setVerifyStep("done");
                        setTimeout(() => setScreen("main"), 1800);
                      }, 1600);
                    }}>
                    {verifyLoading ? <><span className="spin" />&nbsp;Verifying…</> : "Complete Verification →"}
                  </button>
                </div>
              )}

              {/* DONE */}
              {verifyStep === "done" && (
                <div className="pop-in" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                  <div style={{ fontSize: 64, marginBottom: 20 }}>🧊</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 3, color: "var(--text)", marginBottom: 10 }}>You're Verified</div>
                  <div style={{ color: "var(--text3)", fontSize: 15, lineHeight: 1.7 }}>Welcome to Frost.<br />The floor is yours.</div>
                  <div style={{ marginTop: 32, display: "flex", gap: 8 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00", opacity: 0.3 + i * 0.35 }} />)}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            MAIN APP
        ══════════════════════════════════════════════════ */}
        {screen === "main" && (
          <div style={{ paddingBottom: 80 }}>

            {/* ── FLOOR TAB ── */}
            {mainTab === "floor" && (
              <div>

                {/* Header — always visible */}
                <div style={{ background: "linear-gradient(135deg, #141400, var(--bg))", borderBottom: "1px solid #FF620022", padding: "18px 18px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Logo size="sm" />
                        {userTier === "free" && (
                          <div onClick={() => { if (complimentsLeft === 0) setShowUpgrade(true); }} style={{ display: "flex", alignItems: "center", gap: 4, background: complimentsLeft === 0 ? "#1A0800" : "var(--bg3)", border: `1px solid ${complimentsLeft === 0 ? "#FF6B0060" : "var(--border)"}`, borderRadius: 20, padding: "3px 10px", cursor: complimentsLeft === 0 ? "pointer" : "default" }}>
                            <span style={{ fontSize: 11 }}>💬</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: complimentsLeft === 0 ? "#FF6B00" : complimentsLeft <= 2 ? "#FF8040" : "var(--text3)" }}>
                              {complimentsLeft === 0 ? "0 left · upgrade" : `${complimentsLeft} left`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        {checkedIn ? (
                          <>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)" }} className="pulse" />
                            <span style={{ color: "var(--green)", fontSize: 12, fontWeight: 700 }}>You're online · {selectedGym?.name?.split(" ").slice(0,3).join(" ")}</span>
                          </>
                        ) : (
                          <>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--text4)" }} />
                            <span style={{ color: "var(--text3)", fontSize: 12, fontWeight: 600 }}>You're offline</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {/* Ghost mode toggle — Frost+ only */}
                      <div className="tooltip-wrap">
                        <span className="tooltip-box">
                          {userTier === "free" ? "Frost+ only — go anonymous" : ghostMode ? "Turn off — show yourself on the floor" : "Go ghost — hidden to all, visible only to people you compliment"}
                        </span>
                        <button onClick={() => {
                          if (userTier === "free") { setShowUpgrade(true); return; }
                          const nextGhost = !ghostMode;
                          setGhostMode(nextGhost);
                          showToast(nextGhost ? "👻 Ghost on — hidden from floor, visible to people you compliment" : "👁️ Ghost off — you're visible to everyone");
                        }} style={{ background: ghostMode ? "#0D0D22" : "var(--bg3)", border: `1.5px solid ${ghostMode ? "#A8D8F0" : "var(--border)"}`, borderRadius: 12, padding: "10px 13px", cursor: "pointer", fontSize: 15, transition: "all 0.2s", position: "relative", flexShrink: 0 }}>
                          👻
                          {userTier === "free" && <span style={{ position: "absolute", top: -4, right: -4, background: "#FF6B00", borderRadius: "50%", width: 14, height: 14, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>+</span>}
                        </button>
                      </div>
                      <button onClick={() => {
                        if (checkedIn) {
                          setCheckedIn(false);
                          setGymSessionStart(null);
                          setGymTimeElapsed(0);
                          setMyVibe(null);
                          try { localStorage.removeItem("frost_vibe"); } catch {}
                          if (ghostMode) setGhostMode(false);
                          const timeMsg = gymTimeElapsed >= STREAK_THRESHOLD
                            ? "Great session! Streak earned 🔥"
                            : gymTimeElapsed > 0
                              ? `${Math.floor(gymTimeElapsed/60)} min session. Come back for your streak!`
                              : "See you next time!";
                          showToast(`You are offline. ${timeMsg}`);
                        } else {
                          setShowCheckinSheet(true);
                        }
                      }} style={{ background: checkedIn ? "#1a0000" : "#080E18", border: `1.5px solid ${checkedIn ? "#C4123066" : "#FF6B00"}`, borderRadius: 12, padding: "10px 18px", color: checkedIn ? "#FF6B6B" : "#E8F4FF", cursor: "pointer", fontSize: 13, fontWeight: 800, fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", position: "relative" }}
                        onMouseEnter={e => {
                          const tip = e.currentTarget.querySelector(".checkin-tip");
                          if (tip) tip.style.opacity = "1";
                        }}
                        onMouseLeave={e => {
                          const tip = e.currentTarget.querySelector(".checkin-tip");
                          if (tip) tip.style.opacity = "0";
                        }}
                      >
                        {checkedIn ? "Check Out" : "Check In"}
                        <span className="checkin-tip" style={{
                          position: "absolute", top: "calc(100% + 8px)", left: 0, transform: "none",
                          background: "#1A1A2E", border: "1px solid #FF6B0060", color: "#FF6B00",
                          fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
                          whiteSpace: "nowrap", maxWidth: "none", textAlign: "left",
                          padding: "8px 12px", borderRadius: 10, lineHeight: 1.5,
                          pointerEvents: "none", opacity: 0, transition: "opacity 0.15s", zIndex: 9999,
                        }}>
                          {checkedIn
                            ? "Leave the gym"
                            : "You're at the gym"}
                          <span style={{ position: "absolute", bottom: "100%", left: 16, border: "5px solid transparent", borderBottomColor: "#FF6B0060" }} />
                        </span>
                      </button>
                    </div>                  </div>

                  {/* Ghost mode active banner */}
                  {ghostMode && checkedIn && (
                    <div style={{ marginTop: 8, background: "#0D0D22", border: "1px solid #A8D8F080", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>👻</span>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#A8D8F0" }}>Ghost Mode On</span>
                        <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 6 }}>Hidden from the floor — visible only to people you compliment</span>
                      </div>
                      <button onClick={() => { setGhostMode(false); showToast("Ghost mode off — you're visible 👁️"); }} style={{ marginLeft: "auto", background: "none", border: "1px solid #A8D8F050", borderRadius: 8, padding: "3px 10px", color: "#A8D8F0", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Off</button>
                    </div>
                  )}

                  {/* Vibe picker — shown when online */}
                  {checkedIn && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text4)" }}>Your Vibe Today</div>
                        {myVibe && (
                          <button onClick={() => { setMyVibe(null); try { localStorage.removeItem("frost_vibe"); } catch {} }} style={{ background: "none", border: "none", color: "var(--text4)", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
                            {myVibe.emoji} {myVibe.label} ✕
                          </button>
                        )}
                      </div>
                      <div style={{ position: "relative" }}>
                        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
                          ref={el => { if (el) el.style.cssText += "; scrollbar-width: none;"; }}>
                          {VIBE_OPTIONS.map(v => (
                          <button key={v.id} onClick={() => { setMyVibe(prev => {
                              const next = prev?.id === v.id ? null : v;
                              try { localStorage.setItem("frost_vibe", JSON.stringify(next ? { vibe: next, setAt: Date.now() } : null)); } catch {}
                              return next;
                            }); if (myVibe?.id !== v.id) showToast(`${v.emoji} Vibe set to ${v.label}`); }} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${myVibe?.id === v.id ? "#FF6B00" : "var(--border)"}`, background: myVibe?.id === v.id ? "#080E18" : "var(--bg3)", color: myVibe?.id === v.id ? "#E8F4FF" : "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                            <span>{v.emoji}</span> {v.label}
                          </button>
                        ))}
                        </div>
                        {/* Right fade edge */}
                        <div style={{ position: "absolute", right: 0, top: 0, bottom: 6, width: 32, background: "linear-gradient(to right, transparent, #080808)", pointerEvents: "none", borderRadius: "0 20px 20px 0" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Gym selector pill — shown when offline */}
                {!checkedIn && (
                  <div style={{ padding: "10px 18px", background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
                    <select value={selectedGym?.id || ""} onChange={e => {
                      const gym = allGyms.find(g => String(g.id) === e.target.value);
                      if (gym) setSelectedGym(gym);
                    }} style={{ width: "100%", background: "var(--bg3)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "11px 14px", color: selectedGym ? "var(--text)" : "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, outline: "none", appearance: "none", WebkitAppearance: "none" }}>
                      <option value="">Select your gym to go online...</option>
                      {(allGyms.length > 0 ? allGyms : []).map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Gym floor grid — always shown */}
                <div style={{ padding: "14px 16px 80px" }}>

                  {/* Gym Location Picker */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 2, color: "var(--red)" }}>GYM FLOOR</div>
                        {checkedIn && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#041204", border: "1px solid #38E8A040", borderRadius: 20, padding: "3px 8px" }}>
                              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", boxShadow: floorPulse ? "0 0 7px var(--green)" : "none", transition: "box-shadow 0.4s" }} />
                              <span style={{ fontSize: 9, fontWeight: 800, color: "var(--green)", letterSpacing: 0.5 }}>LIVE</span>
                            </div>
                            {/* 30-min streak timer */}
                            {gymSessionStart && !streakEarnedToday && (
                              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#1A0E00", border: "1px solid #FF6B0040", borderRadius: 20, padding: "3px 9px" }}>
                                <div style={{ width: 26, height: 4, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${Math.min(100, (gymTimeElapsed / STREAK_THRESHOLD) * 100)}%`, background: gymTimeElapsed >= STREAK_THRESHOLD * 0.8 ? "#FF6B00" : "#FF6B0080", borderRadius: 99, transition: "width 1s linear" }} />
                                </div>
                                <span style={{ fontSize: 9, fontWeight: 800, color: "#FF6B00" }}>
                                  {gymTimeElapsed >= STREAK_THRESHOLD
                                    ? "🔥"
                                    : `${Math.floor((STREAK_THRESHOLD - gymTimeElapsed) / 60)}m`}
                                </span>
                              </div>
                            )}
                            {streakEarnedToday && gymSessionStart && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#1A0800", border: "1px solid #FF6B0060", borderRadius: 20, padding: "3px 9px" }}>
                                <span style={{ fontSize: 9, fontWeight: 800, color: "#FF6B00" }}>🔥 Streak earned!</span>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                      <div style={{ display: "flex", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 20, padding: 3, gap: 2 }}>
                        {[
                          { id: "all", label: "All" },
                          { id: "gym", label: "At the Gym" },
                        ].map(f => (
                          <button key={f.id} onClick={() => setFloorFilter(f.id)} style={{ padding: "5px 12px", borderRadius: 16, border: "none", background: floorFilter === f.id ? "#FF6B00" : "transparent", color: floorFilter === f.id ? "#fff" : "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 800, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                            {f.id === "gym" && <span style={{ width: 5, height: 5, borderRadius: "50%", background: floorFilter === "gym" ? "rgba(255,255,255,0.7)" : "var(--green)", display: "inline-block", flexShrink: 0 }} />}
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gym selector */}
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button
                          onClick={() => { setFloorGymSearchOpen(p => !p); setFloorGymSearch(""); }}
                          style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "var(--bg2)", border: `1.5px solid ${floorGymSearchOpen ? "#FF6B00" : "var(--border)"}`, borderRadius: 14, padding: "11px 14px", cursor: "pointer", transition: "all 0.2s" }}>
                          <span style={{ fontSize: 16 }}>📍</span>
                          <div style={{ flex: 1, textAlign: "left" }}>
                            <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600, letterSpacing: 0.5 }}>VIEWING FLOOR AT</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: floorSelectedGym ? "#FF6B00" : "var(--text)", marginTop: 1 }}>
                              {floorSelectedGym ? floorSelectedGym.name : (homeGyms[0]?.name || "Your Home Gym")}
                            </div>
                          </div>
                          <span style={{ color: "var(--text3)", fontSize: 14 }}>{floorGymSearchOpen ? "▲" : "▼"}</span>
                        </button>
                        {floorSelectedGym && (
                          <button onClick={() => setFloorSelectedGym(null)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", color: "var(--text3)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>
                            Home
                          </button>
                        )}
                      </div>

                      {/* Gym search dropdown */}
                      {floorGymSearchOpen && (
                        <div className="fade-up" style={{ marginTop: 8, background: "var(--bg2)", border: "1.5px solid #FF6B00", borderRadius: 16, overflow: "hidden" }}>
                          <div style={{ position: "relative", borderBottom: "1px solid var(--border)" }}>
                            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
                            <input
                              className="input"
                              placeholder="Search any gym location..."
                              value={floorGymSearch}
                              onChange={e => setFloorGymSearch(e.target.value)}
                              autoFocus
                              style={{ border: "none", borderRadius: 0, paddingLeft: 40, background: "transparent" }}
                            />
                          </div>
                          <div style={{ maxHeight: 220, overflowY: "auto" }}>
                            {(floorGymSearch.length > 1
                              ? sortedGyms.filter(g => g.name.toLowerCase().includes(floorGymSearch.toLowerCase()) || (g.neighborhood||"").toLowerCase().includes(floorGymSearch.toLowerCase()))
                              : sortedGyms.slice(0, 12)
                            ).map(gym => (
                              <div key={gym.id} onClick={() => { setFloorSelectedGym(gym); setFloorGymSearchOpen(false); setFloorGymSearch(""); }}
                                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: floorSelectedGym?.id === gym.id ? "#0E0808" : "transparent", transition: "background 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#0E0E18"}
                                onMouseLeave={e => e.currentTarget.style.background = floorSelectedGym?.id === gym.id ? "#0E0808" : "transparent"}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🏋️</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, fontSize: 13, color: floorSelectedGym?.id === gym.id ? "#FF6B00" : "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{gym.name}</div>
                                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{gym.neighborhood || gym.city || "NYC"}</div>
                                </div>
                                {floorSelectedGym?.id === gym.id && <span style={{ color: "#FF6B00", fontSize: 14 }}>✓</span>}
                              </div>
                            ))}
                            {floorGymSearch.length > 1 && sortedGyms.filter(g => g.name.toLowerCase().includes(floorGymSearch.toLowerCase()) || (g.neighborhood||"").toLowerCase().includes(floorGymSearch.toLowerCase())).length === 0 && (
                              <div style={{ padding: "20px 16px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>No gyms found for "{floorGymSearch}"</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {(() => {
                      const atGym = lobbyUsers.filter(u => u.isOnline);
                      // If "At the Gym" is selected but nobody is online, fall back to all users
                      const displayUsers = (floorFilter === "gym" && atGym.length === 0)
                        ? lobbyUsers
                        : floorFilter === "gym" ? atGym : lobbyUsers;
                      return displayUsers;
                    })().map((user, i) => {
                      if (ghostMode && user.id === 0) return null; // ghost: hide self from floor (visible only to users you've complimented)
                      const alreadySent = sentToday[user.id];
                      const wc = { "Strength Training":"#FF6200","Cardio / HIIT":"#FF6200","Bodybuilding":"#FF6200","Flexibility & Wellness":"#FF6200","Cycling":"#38E8A0","Calisthenics":"#FF6200" };
                      const color = wc[user.workoutType] || "var(--red)";
                      return (
                        <div key={user.id} className="fade-up" style={{ animationDelay: `${i*0.06}s`, opacity: 0, borderRadius: 20, overflow: "hidden", position: "relative", cursor: "pointer", aspectRatio: "3/4", background: "var(--bg2)", filter: user.isOnline ? "none" : "grayscale(55%)" }} onClick={() => {
                        setViewingUser(user);
                        // Simulate: this user "viewed" our profile back (50% chance, not ghost)
                        if (!ghostMode && Math.random() > 0.5) {
                          setProfileViewers(prev => {
                            const already = prev.find(v => v.user.id === user.id);
                            if (already) return prev;
                            return [{ user, time: "Just now" }, ...prev].slice(0, 20);
                          });
                        }
                      }}>
                          <img src={user.photo} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)" }} />

                          {/* Online/Offline indicator — top left */}
                          <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", borderRadius: 20, padding: "3px 8px" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: user.isOnline ? "var(--green)" : "var(--text4)", flexShrink: 0 }} className={user.isOnline ? "pulse" : ""} />
                            <span style={{ color: user.isOnline ? "var(--green)" : "var(--text3)", fontSize: 9, fontWeight: 800 }}>{user.isOnline ? "At the Gym" : "Not here"}</span>
                          </div>

                          {/* Verified badge — top right */}
                          {user.verified && (
                            <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", borderRadius: 20, padding: "3px 8px", display: "flex", alignItems: "center", gap: 3 }}>
                              <span style={{ color: "#38E8A0", fontSize: 11 }}>✓</span>
                              <span style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>Verified</span>
                            </div>
                          )}

                          {/* Sent badge */}
                          {alreadySent && (
                            <div style={{ position: "absolute", top: 36, left: 10, background: "#080E18", border: "1px solid #38E8A044", borderRadius: 20, padding: "2px 7px" }}>
                              <span style={{ color: "var(--green)", fontSize: 9, fontWeight: 700 }}>Sent ✓</span>
                            </div>
                          )}

                          {/* Info */}
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                              <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{user.name}, {user.age}</div>
                              {user.isRegular && <span style={{ fontSize: 9, background: "#1a1200", border: "1px solid #FF620044", color: "#FF6200", borderRadius: 20, padding: "1px 6px", fontWeight: 800 }}>Regular</span>}
                            </div>
                            <div style={{ display: "inline-flex", alignItems: "center", background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 8px", marginBottom: 5 }}>
                              <span style={{ color: color, fontSize: 10, fontWeight: 700 }}>{user.workoutType}</span>
                            </div>
                            {user.vibe && (
                              <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 4 }}>
                                <span style={{ fontSize: 10 }}>{user.vibe.emoji}</span>
                                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: 700 }}>{user.vibe.label}</span>
                              </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 9 }}>{user.onlineSince}</span>
                              {user.streak > 0 && (
                                <span style={{ fontSize: 9, fontWeight: 800, color: user.streak >= 20 ? "#FF6200" : user.streak >= 7 ? "#FF6200" : "rgba(255,255,255,0.3)" }}>
                                  🔥 {user.streak}d
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {floorFilter === "gym" && lobbyUsers.filter(u => u.isOnline).length === 0 && (
                    <div style={{ background: "linear-gradient(135deg, #0A0A0A, #0D0D16)", border: "1px solid #FF6B0020", borderRadius: 16, padding: "16px 18px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1A0800", border: "1px solid #FF6B0040", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>💡</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>Nobody checked in right now</div>
                        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2, lineHeight: 1.5 }}>Showing everyone. Be the first to check in and go live! 🔥</div>
                      </div>
                    </div>
                  )}

                  {/* ── Leaderboard teaser ── */}
                  <div onClick={() => setMainTab("leaderboard")} style={{ marginTop: 24, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 18, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                    <div style={{ display: "flex", gap: -6 }}>
                      {leaderboard.slice(0,3).map((u,i) => (
                        <img key={i} src={u.photo} alt="" style={{ width: 32, height: 32, borderRadius: 10, objectFit: "cover", border: "2px solid var(--bg2)", marginLeft: i > 0 ? -8 : 0 }} />
                      ))}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>🔥 Who's Poppin This Week</div>
                      <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 1 }}>Sofia L. is leading with {leaderboard[0]?.count} compliments</div>
                    </div>
                    <span style={{ color: "var(--red)", fontSize: 16 }}>›</span>
                  </div>
                </div>

              </div>
            )}

                        {/* ── INBOX TAB ── */}
            {mainTab === "inbox" && (
              <div className="fade-up" style={{ padding: "32px 20px 20px" }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2, marginBottom: 4 }}>Inbox</div>
                <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 24 }}>{unreadCount} unread</div>
                {inbox.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text3)" }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>No notifications yet</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text3)" }}>
                      When someone sends you a compliment<br />or replies to yours, it'll show up here.
                    </div>
                    <button onClick={() => setMainTab("floor")} className="btn-primary" style={{ marginTop: 24, width: "auto", padding: "12px 28px" }}>
                      Browse the Floor
                    </button>
                  </div>
                ) : (
                  inbox.map(n => {
                    const isComplimentReceived = n.type === "compliment";
                    const isMutual = n.type === "mutual";
                    const hasReplied = !!n.reply;
                    const replyColors = { "Thank You!": "var(--green)", "You": "var(--purple)", "Ghost": "var(--text4)" };
                    const replyIcons = { "Thank You!": "🙏", "You": "🫶🏽", "Ghost": "👻" };
                    return (
                      <div key={n.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                        {/* Top row: photo + text + time */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {/* Photo — always tappable to view profile */}
                          <div style={{ position: "relative", flexShrink: 0, cursor: n.userData ? "pointer" : "default" }} onClick={() => {
                            setInbox(i => i.map(x => x.id === n.id ? {...x, unread: false} : x));
                            if (n.userData) setViewingUser(n.userData);
                          }}>
                            <img src={n.photo} alt={n.user} style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", border: isComplimentReceived && !hasReplied ? "2px solid var(--purple)" : "2px solid transparent" }} />
                            <div style={{ position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: isMutual ? "#FF6200" : isComplimentReceived ? "var(--purple)" : n.type === "thanks" ? "var(--green)" : n.type === "you" ? "var(--blue)" : "var(--border2)", border: "2px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
                              {isMutual ? "✨" : isComplimentReceived ? "💬" : n.type === "thanks" ? "🙏" : n.type === "you" ? "😍" : "✓"}
                            </div>
                          </div>
                          <div style={{ flex: 1, cursor: n.userData ? "pointer" : "default" }} onClick={() => {
                            setInbox(i => i.map(x => x.id === n.id ? {...x, unread: false} : x));
                            if (n.userData) setViewingUser(n.userData);
                          }}>
                            <div style={{ fontWeight: n.unread ? 700 : 500, fontSize: 14 }}>{n.user}</div>
                            <div style={{ color: isComplimentReceived && !hasReplied ? "var(--text2)" : "var(--text3)", fontSize: 13, marginTop: 2 }}>
                              {n.ghost && <span style={{ display: "inline-block", fontSize: 9, background: "#0D0D22", border: "1px solid #A8D8F060", color: "#A8D8F0", borderRadius: 6, padding: "1px 6px", marginRight: 5, fontWeight: 800, verticalAlign: "middle" }}>👻 GHOST</span>}
                              {n.text}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                            <div style={{ color: "var(--text4)", fontSize: 11 }}>{n.time}</div>
                            {n.unread && !hasReplied && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--purple)" }} />}
                            {hasReplied && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg3)", borderRadius: 20, padding: "3px 8px", border: "1px solid var(--border2)" }}>
                                <span style={{ fontSize: 11 }}>{replyIcons[n.reply] || "✓"}</span>
                                <span style={{ color: replyColors[n.reply] || "var(--text3)", fontSize: 11, fontWeight: 700 }}>{n.reply}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Mutual notice banner */}
                        {isMutual && (
                          <div style={{ marginTop: 10, marginLeft: 64, background: "linear-gradient(135deg, #080E18, #111200)", border: "1.5px solid #FF620033", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 22 }}>✨</span>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 13, color: "#FF6200" }}>You both noticed each other</div>
                              <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 2 }}>Say hi next time you see them</div>
                            </div>
                          </div>
                        )}

                        {/* Reply buttons — only for received compliments not yet replied */}
                        {isComplimentReceived && !hasReplied && (
                          <div style={{ marginTop: 12, marginLeft: 64, background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 16, padding: "12px", display: "flex", gap: 8 }}>
                            {[
                              { label: "Thank You!", icon: "🙏", bg: "linear-gradient(135deg,#080E18,#111100)", color: "var(--green)", border: "#38E8A055" },
                              { label: "You",        icon: "🫶🏽", bg: "linear-gradient(135deg,#1a0d08,#180e05)", color: "var(--purple)", border: "#FF620055" },
                              { label: "Ghost",      icon: "👻", bg: "transparent", color: "var(--text4)", border: "var(--border2)" },
                            ].map(btn => (
                              <button key={btn.label} onClick={() => {
                                // Mark compliment as replied
                                setInbox(i => i.map(x => x.id === n.id ? {...x, reply: btn.label, unread: false} : x));
                                // Inject reply notification so the sender "sees" it (simulates real delivery)
                                if (btn.label !== "Ghost") {
                                  const replyType = btn.label === "Thank You!" ? "thanks" : "you";
                                  const replyNotif = {
                                    id: Date.now(),
                                    type: replyType,
                                    user: n.user,
                                    photo: n.photo,
                                    text: btn.label === "Thank You!"
                                      ? `${n.user.split(" ")[0]} said Thank You to your compliment 🙏`
                                      : `${n.user.split(" ")[0]} replied "You" to your compliment 🫶🏽`,
                                    time: "Just now",
                                    unread: true,
                                    userData: n.userData,
                                  };
                                  setTimeout(() => {
                                    setInbox(prev => [replyNotif, ...prev]);
                                    showToast(`${btn.icon} ${n.user.split(" ")[0]} ${btn.label === "Thank You!" ? "thanked you!" : "sent you a You!"}`);
                                  }, 600);
                                } else {
                                  showToast(`${btn.icon} Ghosted — they will never know.`);
                                }
                              }} style={{ flex: 1, background: btn.bg, border: `1.5px solid ${btn.border}`, borderRadius: 12, padding: "10px 6px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: btn.color, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s" }}>
                                <span style={{ fontSize: 18 }}>{btn.icon}</span>
                                <span>{btn.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Compliment history */}
                {history.length > 0 && (
                  <>
                    <div style={{ marginTop: 28, marginBottom: 12 }}>
                      <div className="section-label">Sent by You</div>
                    </div>
                    {history.map(h => (
                      <div key={h.id} onClick={() => h.userData && setViewingUser(h.userData)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)", cursor: h.userData ? "pointer" : "default" }}>
                        <img src={h.photo} alt={h.user} style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{h.user}</div>
                          <div style={{ color: "var(--text3)", fontSize: 12 }}>"{h.compliment}"</div>
                        </div>
                        <div style={{ color: "var(--text4)", fontSize: 11 }}>{h.time}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ── LEADERBOARD TAB ── */}
            {mainTab === "leaderboard" && (
              <div className="fade-up" style={{ padding: "0 0 100px" }}>

                  {/* ── Gym Selector Header ── */}
                  <div style={{ padding: "28px 16px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 30, letterSpacing: 2, marginBottom: 10 }}>Who's Poppin</div>

                    {/* Home gym pills */}
                    <div style={{ display: "flex", gap: 7, marginBottom: lbGymSearchOpen ? 10 : 0 }}>
                      {homeGyms.slice(0, 2).map((g, i) => (
                        <button key={g.id} onClick={() => { setLbGym(g); setLbGymSearchOpen(false); setLbGymSearch(""); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 20, border: `1.5px solid ${activeGym.id === g.id && !lbGymSearchOpen ? (i === 0 ? "#FF6B00" : "#A8D8F0") : "var(--border)"}`, background: activeGym.id === g.id && !lbGymSearchOpen ? (i === 0 ? "#080E18" : "#080E18") : "var(--bg3)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", flexShrink: 0 }}>
                          <span style={{ fontSize: 11 }}>{i === 0 ? "🏠" : "📍"}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: activeGym.id === g.id && !lbGymSearchOpen ? (i === 0 ? "#FF6B00" : "#A8D8F0") : "var(--text3)", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name.split(" ").slice(0, 2).join(" ")}</span>
                          {i === 0 && <span style={{ fontSize: 9, color: "var(--text4)", fontWeight: 700 }}>Primary</span>}
                        </button>
                      ))}
                      {/* Search other gyms button */}
                      <button onClick={() => { setLbGymSearchOpen(p => !p); setLbGymSearch(""); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 20, border: `1.5px solid ${lbGymSearchOpen ? "#FF6B00" : "var(--border)"}`, background: lbGymSearchOpen ? "#080E18" : "var(--bg3)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", flexShrink: 0 }}>
                        <span style={{ fontSize: 12 }}>🔍</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: lbGymSearchOpen ? "#E8F4FF" : "var(--text3)" }}>Other</span>
                      </button>
                    </div>

                    {/* Search input + results */}
                    {lbGymSearchOpen && (
                      <div style={{ marginTop: 10 }}>
                        <input
                          autoFocus
                          value={lbGymSearch}
                          onChange={e => setLbGymSearch(e.target.value)}
                          placeholder="Search gyms near you..."
                          style={{ width: "100%", background: "var(--bg3)", border: "1.5px solid #FF6B00", borderRadius: 12, padding: "11px 14px", color: "var(--text)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                        />
                        {filteredLbGyms.length > 0 && (
                          <div style={{ marginTop: 6, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                            {filteredLbGyms.map((g, i) => (
                              <div key={g.id} onClick={() => { setLbGym(g); setLbGymSearchOpen(false); setLbGymSearch(""); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderBottom: i < filteredLbGyms.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <span style={{ fontSize: 14 }}>🏋️</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{g.name}</div>
                                  {g.neighborhood && <div style={{ color: "var(--text3)", fontSize: 11 }}>{g.neighborhood}</div>}
                                </div>
                                <span style={{ color: "var(--text4)", fontSize: 12 }}>›</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {lbGymSearch.length > 1 && filteredLbGyms.length === 0 && (
                          <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>No gyms found</div>
                        )}
                      </div>
                    )}

                    {/* Active gym label */}
                    {!lbGymSearchOpen && (
                      <div style={{ marginTop: 10, color: "var(--text3)", fontSize: 12 }}>
                        Most noticed this week at <span style={{ color: "var(--text)", fontWeight: 700 }}>{activeGym.name}</span>
                      </div>
                    )}
                  </div>

                  {/* ── Podium — top 3 ── */}
                  <div style={{ padding: "20px 16px 0" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                      {[leaderboard[1], leaderboard[0], leaderboard[2]].filter(u => u && !(ghostMode && u.id === 0)).map((u, pos) => {
                        const rank = pos === 0 ? 2 : pos === 1 ? 1 : 3;
                        const heights = { 1: 110, 2: 80, 3: 65 };
                        const colors = { 1: "#FF6200", 2: "#A8B8C8", 3: "#C87941" };
                        const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
                        if (!u) return null;
                        return (
                          <div key={u.id} onClick={() => { const full = lobbyUsers.find(x => x.id === u.id) || { ...u, age: null, goals: [], bio: '', sexuality: '', homeGyms: [], photos: [u.photo], isOnline: u.isOnline, onlineSince: u.isOnline ? 'Online now' : 'Last seen today' }; setViewingUser(full); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flex: rank === 1 ? "0 0 36%" : "0 0 28%" }}>
                            <div style={{ position: "relative", marginBottom: 6 }}>
                              <img src={u.photo} alt="" style={{ width: rank === 1 ? 70 : 54, height: rank === 1 ? 70 : 54, borderRadius: 18, objectFit: "cover", border: `2.5px solid ${colors[rank]}` }} />
                              <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", fontSize: rank === 1 ? 18 : 14 }}>{medals[rank]}</div>
                            </div>
                            <div style={{ marginTop: 14, fontWeight: 700, fontSize: rank === 1 ? 13 : 12, color: "var(--text)", textAlign: "center" }}>{u.name.split(" ")[0]}</div>
                            <div style={{ fontFamily: "'Bebas Neue'", fontSize: rank === 1 ? 26 : 20, color: colors[rank], lineHeight: 1 }}>{u.count}</div>
                            <div style={{ height: heights[rank], width: "100%", background: `${colors[rank]}18`, border: `1px solid ${colors[rank]}33`, borderRadius: "10px 10px 0 0", marginTop: 6 }} />
                          </div>
                        );
                      })}
                    </div>

                    {/* Full ranked list */}
                    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
                      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text4)" }}>Full Rankings · Top {leaderboard.length}</div>
                        {(() => {
                          const myCount = history.length;
                          const myRankNum = leaderboard.filter(u => u.count > myCount).length + 1;
                          return (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#080E18", border: "1px solid #FF620033", borderRadius: 10, padding: "4px 10px" }}>
                              <span style={{ fontSize: 10, color: "var(--text3)" }}>Your rank</span>
                              <span style={{ fontFamily: "'Bebas Neue'", fontSize: 16, color: "#FF6200", lineHeight: 1 }}>#{myRankNum}</span>
                            </div>
                          );
                        })()}
                      </div>
                      <div style={{ maxHeight: showFullLeaderboard ? 9999 : 340, overflow: "hidden", transition: "max-height 0.3s ease" }}>
                        {leaderboard.filter(u => !(ghostMode && u.id === 0)).map((u, i) => (
                          <div key={u.id + i} onClick={() => { const full = lobbyUsers.find(x => x.id === u.id) || { ...u, age: null, goals: [], bio: '', sexuality: '', homeGyms: [], photos: [u.photo], isOnline: u.isOnline, onlineSince: u.isOnline ? 'Online now' : 'Last seen today' }; setViewingUser(full); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <div style={{ width: 26, textAlign: "center", fontSize: i < 3 ? 15 : 11, fontWeight: 900, color: i===0?"#FF6200":i===1?"#A8B8C8":i===2?"#C87941":"var(--text4)", flexShrink: 0 }}>
                              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                            </div>
                            <div style={{ position: "relative", flexShrink: 0 }}>
                              <img src={u.photo} alt="" style={{ width: 38, height: 38, borderRadius: 11, objectFit: "cover", border: `1.5px solid ${i===0?"#FF620044":i===1?"#A8B8C844":i===2?"#C8794144":"var(--border)"}` }} />
                              <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: u.isOnline ? "var(--green)" : "var(--text4)", border: "1.5px solid var(--bg2)" }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                              <div style={{ color: "var(--text3)", fontSize: 11 }}>{u.workoutType}</div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: i===0?"#FF6200":i===1?"#A8B8C8":i===2?"#C87941":"var(--text2)", lineHeight: 1 }}>{u.count}</div>
                              <div style={{ color: "var(--text4)", fontSize: 9, fontWeight: 700 }}>compliments</div>
                              {u.streak >= 7 && <div style={{ color: u.streak >= 20 ? "#FF6200" : "#FF6200", fontSize: 9, fontWeight: 800 }}>🔥 {u.streak}d</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Your own row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: "1px solid var(--border)", background: "#080E18" }}>
                        <div style={{ width: 26, textAlign: "center", fontSize: 11, fontWeight: 900, color: "var(--text4)", flexShrink: 0 }}>#{leaderboard.length + 1}</div>
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          {myProfile.photo
                            ? <img src={myProfile.photo} alt="" style={{ width: 38, height: 38, borderRadius: 11, objectFit: "cover", border: "1.5px solid #FF620044" }} />
                            : <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: "1.5px solid #FF620044" }}>👤</div>
                          }
                          <div style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: checkedIn ? "var(--green)" : "var(--text4)", border: "1.5px solid #080E18" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#FF6200", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{myProfile.name || "You"} <span style={{ fontSize: 10, color: "var(--text4)", fontWeight: 600 }}>(you)</span></div>
                          <div style={{ color: "var(--text3)", fontSize: 11 }}>{myProfile.workoutType || "—"}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: "var(--text2)", lineHeight: 1 }}>{history.length}</div>
                          <div style={{ color: "var(--text4)", fontSize: 9, fontWeight: 700 }}>compliments</div>
                          {myStreak >= 7 && <div style={{ color: "#FF6200", fontSize: 9, fontWeight: 800 }}>🔥 {myStreak}d</div>}
                        </div>
                      </div>
                      <button onClick={() => setShowFullLeaderboard(p => !p)} style={{ width: "100%", padding: "13px", background: "var(--bg3)", border: "none", borderTop: "1px solid var(--border)", color: "var(--red)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                        {showFullLeaderboard ? "▲ Show Less" : `Show All ${leaderboard.length} →`}
                      </button>
                    </div>
                  </div>
                </div>
            )}

            {/* ── PROFILE TAB ── */}
            {mainTab === "profile" && !editDraft && (
              <div className="fade-up" style={{ padding: "32px 20px 20px" }}>
                {/* Profile header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
                  <div style={{ position: "relative" }}>
                    <label style={{ cursor: "pointer", display: "block" }}>
                      {myProfile.photo ? (
                        <img src={myProfile.photo} alt="me" style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover", border: "2px solid #FF620044", display: "block" }} />
                      ) : (
                        <div style={{ width: 80, height: 80, borderRadius: 20, background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>👤</div>
                      )}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.55)", borderRadius: "0 0 20px 20px", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 0" }}>
                        <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>✎</span>
                      </div>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                        const f = e.target.files[0]; if (!f) return;
                        const r = new FileReader();
                        r.onload = ev => setMyProfile(p => ({...p, photo: ev.target.result}));
                        r.readAsDataURL(f);
                      }} />
                    </label>
                    {myProfile.verified && <div style={{ position: "absolute", bottom: -4, right: -4, background: "#FF6200", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg)" }}><span style={{ fontSize: 10, color: "#fff" }}>✓</span></div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 20 }}>{myProfile.name || "Your Name"}</div>
                    <div style={{ color: "var(--red)", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{myProfile.workoutType}</div>
                    {myProfile.age && <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>Age {myProfile.age}{myProfile.height ? ` · ${myProfile.height}` : ""}{myProfile.pronouns ? ` · ${PRONOUN_OPTIONS.find(p=>p.id===myProfile.pronouns)?.label||""}` : ""}</div>}
                  </div>
                  <button onClick={() => setEditDraft({...myProfile})} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", color: "var(--text2)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Edit</button>
                </div>

                {myVibe && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 20, padding: "5px 12px", marginBottom: 12 }}>
                    <span style={{ fontSize: 16 }}>{myVibe.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)" }}>{myVibe.label}</span>
                    <span style={{ fontSize: 10, color: "var(--text3)" }}>· Today's vibe</span>
                  </div>
                )}
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", marginBottom: 16 }}>
                  {myProfile.bio
                    ? <span style={{ color: "var(--text2)", fontSize: 14, fontStyle: "italic" }}>"{myProfile.bio}"</span>
                    : <span style={{ color: "var(--text4)", fontSize: 13 }}>No bio yet — tap Edit to add one</span>
                  }
                </div>

                {/* Pronouns + sexuality tags */}
                {(myProfile.pronouns || myProfile.sexuality) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {myProfile.pronouns && (() => {
                      const p = PRONOUN_OPTIONS.find(o => o.id === myProfile.pronouns);
                      return p ? <span className="tag" style={{ background: "#080E18", color: "var(--blue)", borderColor: "var(--blue)33" }}>🏷️ {p.label}</span> : null;
                    })()}
                    {myProfile.sexuality && (() => {
                      const s = SEXUALITY_OPTIONS.find(o => o.id === myProfile.sexuality);
                      return s ? <span className="tag">{s.emoji} {s.label}</span> : null;
                    })()}
                  </div>
                )}

                {/* Goals */}
                {(myProfile.goals||[]).length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div className="section-label">Goals</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(myProfile.goals||[]).map(g => <span key={g} className="tag">{g}</span>)}
                    </div>
                  </div>
                )}

                {/* Home gyms */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div className="section-label" style={{ marginBottom: 0 }}>Home Gyms</div>
                    {homeGyms.length < 2 && (
                      <button onClick={() => setScreen("homegyms")} style={{ background: "none", border: "none", color: "var(--red)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>+ Add</button>
                    )}
                  </div>
                  {homeGyms.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: homeGyms.length === 2 ? "1fr 1fr" : "1fr", gap: 8 }}>
                      {homeGyms.map((g, i) => (
                        <div key={g.id} style={{ background: i === 0 ? "#080E18" : "var(--bg2)", border: `1px solid ${i === 0 ? "#38E8A033" : "var(--border)"}`, borderRadius: 14, padding: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? "#1a2600" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                              {i === 0 ? "🏠" : "📍"}
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 800, color: i === 0 ? "var(--green)" : "var(--text3)", textTransform: "uppercase", letterSpacing: 0.5 }}>{i === 0 ? "Primary" : "Secondary"}</span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: i === 0 ? "var(--green)" : "var(--text)", lineHeight: 1.3 }}>{g.name}</div>
                          {g.neighborhood && <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 2 }}>{g.neighborhood}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div onClick={() => setScreen("homegyms")} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg2)", border: "1.5px dashed var(--border2)", borderRadius: 14, padding: "14px", cursor: "pointer" }}>
                      <span style={{ fontSize: 20 }}>🏋️</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text2)" }}>No home gyms added</div>
                        <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 1 }}>Tap to add your regular gyms</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  {[
                    { icon: "💬", val: history.length,                                   label: "Compliments Sent",     key: "sent"     },
                    { icon: "🎉", val: inbox.filter(n=>n.type==="compliment").length,    label: "Received",             key: "received" },
                  ].map(s => (
                    <div key={s.key} onClick={() => setStatSheet(s.key)} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px", cursor: "pointer", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--red)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: "var(--red)" }}>{s.val}</div>
                      <div style={{ color: "var(--text3)", fontSize: 12 }}>{s.label}</div>
                      <div style={{ color: "var(--text4)", fontSize: 10, fontWeight: 700, marginTop: 4 }}>Tap to view →</div>
                    </div>
                  ))}
                </div>

                {/* Streak + Who Viewed You row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {/* Streak card */}
                  <div style={{ background: myStreak >= 20 ? "#1A0800" : "var(--bg2)", border: `1px solid ${myStreak >= 20 ? "#FF6B0060" : "var(--border)"}`, borderRadius: 16, padding: "16px" }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{myStreak >= 20 ? "🔥" : myStreak >= 7 ? "⚡" : "📅"}</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: myStreak >= 7 ? "#FF6B00" : "var(--text2)" }}>{myStreak}</div>
                    <div style={{ color: "var(--text3)", fontSize: 12 }}>Day Streak</div>
                    <div style={{ color: myStreak > 0 ? "var(--green)" : "var(--text4)", fontSize: 10, fontWeight: 700, marginTop: 4 }}>
                      {myStreak === 0
                        ? "Check in 30 min → streak + bonus 💬"
                        : streakEarnedToday
                          ? myStreak >= 20 ? "On fire 🔥" : `Earned today ✓${bonusComplimentEarnedToday ? " +1 bonus 💬" : ""}`
                          : "Check in 30 min to keep it going"}
                    </div>
                  </div>

                  {/* Who Viewed You card — Frost+ only */}
                  <div onClick={() => { if (userTier === "free") { setShowUpgrade(true); } else { setShowWhoViewed(true); } }}
                    style={{ background: userTier !== "free" && profileViewers.length > 0 ? "#08101A" : "var(--bg2)", border: `1px solid ${userTier !== "free" && profileViewers.length > 0 ? "#A8D8F060" : "var(--border)"}`, borderRadius: 16, padding: "16px", cursor: "pointer", position: "relative", transition: "border-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = userTier !== "free" ? "#A8D8F0" : "var(--red)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = userTier !== "free" && profileViewers.length > 0 ? "#A8D8F060" : "var(--border)"}>
                    {userTier === "free" && <div style={{ position: "absolute", top: 8, right: 8, background: "#FF6B00", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>+</div>}
                    <div style={{ fontSize: 22, marginBottom: 6 }}>👁️</div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: userTier !== "free" ? "#A8D8F0" : "var(--text4)" }}>
                      {userTier === "free" ? "?" : profileViewers.length}
                    </div>
                    <div style={{ color: "var(--text3)", fontSize: 12 }}>Viewed You</div>
                    <div style={{ color: userTier !== "free" ? "#A8D8F0" : "var(--text4)", fontSize: 10, fontWeight: 700, marginTop: 4 }}>
                      {userTier === "free" ? "Frost+ only" : profileViewers.length > 0 ? "Tap to see →" : "No views yet"}
                    </div>
                  </div>
                </div>

                {/* Upgrade banner */}
                {userTier === "free" && (
                  <div onClick={() => setShowUpgrade(true)} style={{ background: "linear-gradient(135deg, #1A0E00, #0E0808)", border: "1.5px solid #FF6B00", borderRadius: 16, padding: "14px 16px", marginBottom: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#FF6B00" }}>Upgrade to Frost+ ✦</div>
                      <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Unlimited compliments · See who viewed you</div>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: "#FF6B00" }}>$4.99</div>
                  </div>
                )}
                {userTier !== "free" && (
                  <div onClick={() => setShowUpgrade(true)} style={{ background: "#0A0A12", border: "1px solid #FF6B0050", borderRadius: 16, padding: "12px 16px", marginBottom: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#FF6B00" }}>{userTier === "plus" ? "Frost+ Active ✦" : "Frost Pro Active ✦"}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>Manage</div>
                  </div>
                )}

                <button className="btn-primary ghost" onClick={() => setScreen("settings")}>
                  Settings
                </button>
              </div>
            )}

            {/* ── EDIT PROFILE ── */}
            {mainTab === "profile" && editDraft && (
              <div className="fade-up" style={{ padding: "32px 20px 40px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <BackBtn onClick={() => setEditDraft(null)} />
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 1 }}>Edit Profile</div>
                  <button onClick={() => setShowPreview(true)} style={{ background: "var(--bg3)", border: "1.5px solid var(--border2)", borderRadius: 10, padding: "7px 12px", color: "var(--text2)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    Preview
                  </button>
                </div>

                {/* Photos — 3 slots */}
                <div style={{ marginBottom: 24 }}>
                  <div className="section-label">Photos (up to 3)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[0,1,2].map(i => (
                      <label key={i} style={{ cursor: "pointer" }}>
                        <div className="photo-slot" style={{ aspectRatio: "3/4", border: `2px ${(editDraft.photos||[])[i] ? "solid" : "dashed"} ${(editDraft.photos||[])[i] ? "var(--red)" : "var(--border2)"}`, borderRadius: 14 }}>
                          {(editDraft.photos||[])[i] ? (
                            <img src={(editDraft.photos||[])[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ textAlign: "center", color: "var(--text3)" }}>
                              <div style={{ fontSize: 22 }}>{i === 0 ? "📸" : "+"}</div>
                              <div style={{ fontSize: 10, marginTop: 4 }}>{i === 0 ? "Main" : "Photo " + (i+1)}</div>
                            </div>
                          )}
                        </div>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                          const f = e.target.files[0]; if (!f) return;
                          const r = new FileReader();
                          r.onload = ev => setEditDraft(d => { const p = [...(d.photos||[null,null,null])]; p[i] = ev.target.result; return {...d, photos: p, photo: i===0 ? ev.target.result : d.photo}; });
                          r.readAsDataURL(f);
                        }} />
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div className="section-label">Bio</div>
                  <input className="input" placeholder="Bio (max 50 chars)" maxLength={50} value={editDraft.bio||""} onChange={e => setEditDraft(d => ({...d,bio:e.target.value}))} />
                  <div style={{ textAlign: "right", color: "var(--text4)", fontSize: 11, marginTop: 4 }}>{(editDraft.bio||"").length}/50</div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div className="section-label">Height</div>
                  <select className="input" value={editDraft.height||""} onChange={e => setEditDraft(d => ({...d, height: e.target.value}))} style={{ appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23565870' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center", paddingRight: 40, color: editDraft.height ? "var(--text)" : "var(--text3)" }}>
                    <option value="">Select height</option>
                    {Array.from({ length: 36 }, (_, i) => {
                      const totalInches = 48 + i;
                      const ft = Math.floor(totalInches / 12);
                      const inch = totalInches % 12;
                      const cm = Math.round(totalInches * 2.54);
                      return <option key={totalInches} value={`${ft}'${inch}" (${cm} cm)`}>{ft}'{inch}" — {cm} cm</option>;
                    })}
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div className="section-label">Pronouns</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {PRONOUN_OPTIONS.map(p => (
                      <button key={p.id} onClick={() => setEditDraft(d => ({...d, pronouns: d.pronouns === p.id ? "" : p.id}))} className="btn-sm" style={{ background: editDraft.pronouns === p.id ? "#080E18" : "var(--bg3)", borderColor: editDraft.pronouns === p.id ? "#FF6B00" : "var(--border)", color: editDraft.pronouns === p.id ? "#E8F4FF" : "var(--text2)" }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div className="section-label">Goals (up to 3)</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {GOALS.map(g => {
                      const active = (editDraft.goals||[]).includes(g.id) || (editDraft.goals||[]).includes(`${g.emoji} ${g.label}`);
                      return (
                        <button key={g.id} onClick={() => setEditDraft(d => { const cur=d.goals||[]; const label=`${g.emoji} ${g.label}`; return {...d, goals: cur.includes(label) ? cur.filter(x=>x!==label) : cur.length<3 ? [...cur,label] : cur}; })} style={{ background: active?"#080E18":"var(--bg2)", border:`1.5px solid ${active?"#FF6B00":"var(--border)"}`, borderRadius: 20, padding:"8px 14px", color: active?"#fff":"var(--text2)", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, transition:"all 0.15s" }}>
                          {g.emoji} {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div className="section-label">Workout Type</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {WORKOUT_TYPES.map(w => (
                      <div key={w.id} onClick={() => setEditDraft(d => ({...d, workoutType: w.label}))} style={{ background: editDraft.workoutType===w.label?"#080E18":"var(--bg2)", border:`1.5px solid ${editDraft.workoutType===w.label?"var(--red)":"var(--border)"}`, borderRadius:12, padding:"12px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"all 0.15s" }}>
                        <span style={{fontSize:18}}>{w.icon}</span>
                        <span style={{fontWeight:600, fontSize:14, color:editDraft.workoutType===w.label?"#fff":"var(--text2)"}}>{w.label}</span>
                        {editDraft.workoutType===w.label && <span style={{marginLeft:"auto",color:"var(--red)"}}>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div className="section-label">Home Gyms (up to 2)</div>
                  <div style={{ color: "var(--red)", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{homeGyms.length}/2 selected</div>
                  <input className="input" placeholder="Search gyms..." value={gymSearch} onChange={e => setGymSearch(e.target.value)} style={{ marginBottom: 10 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                    {(gymSearch.length>1 ? filteredGyms : homeGyms.length>0 ? [...homeGyms,...sortedGyms.filter(g=>!homeGyms.some(h=>h.id===g.id)).slice(0,8)] : sortedGyms.slice(0,10)).map(gym => {
                      const sel = homeGyms.some(h => h.id===gym.id);
                      const dis = !sel && homeGyms.length>=2;
                      return (
                        <div key={gym.id} onClick={() => { if(sel) setHomeGyms(h=>h.filter(x=>x.id!==gym.id)); else if(!dis) setHomeGyms(h=>[...h,gym]); }} style={{background:sel?"#080E18":"var(--bg2)",border:`1.5px solid ${sel?"var(--green)":"var(--border)"}`,borderRadius:10,padding:"10px 12px",cursor:dis?"default":"pointer",opacity:dis?0.35:1,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <div>
                            <div style={{fontWeight:600,fontSize:13,color:sel?"var(--green)":"var(--text)"}}>{gym.name}</div>
                            <div style={{color:"var(--text3)",fontSize:11}}>{gym.neighborhood||gym.city}</div>
                          </div>
                          {sel && <span style={{color:"var(--green)",fontWeight:700}}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button className="btn-primary" onClick={saveProfile}>Save Changes</button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            WHO VIEWED YOU SHEET (Frost+)
        ══════════════════════════════════════════════════ */}
        {showWhoViewed && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 999, display: "flex", alignItems: "flex-end" }} onClick={() => setShowWhoViewed(false)}>
            <div style={{ width: "100%", background: "var(--bg2)", borderRadius: "24px 24px 0 0", padding: "24px 20px 48px", border: "1px solid var(--border)", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, letterSpacing: 2 }}>Who Viewed You</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>People who checked out your profile today</div>
                </div>
                <button onClick={() => setShowWhoViewed(false)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "6px 12px", color: "var(--text3)", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Close</button>
              </div>

              {profileViewers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>👁️</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No views yet</div>
                  <div style={{ color: "var(--text3)", fontSize: 13 }}>When someone checks out your profile on the floor, they'll show up here.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {profileViewers.map((v, i) => (
                    <div key={i} onClick={() => { setShowWhoViewed(false); setViewingUser(v.user); }}
                      style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, padding: "12px 14px", cursor: "pointer", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#A8D8F0"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <img src={v.user.photo} alt="" style={{ width: 48, height: 48, borderRadius: 14, objectFit: "cover", border: "1.5px solid #A8D8F040" }} />
                        <div style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderRadius: "50%", background: v.user.isOnline ? "var(--green)" : "var(--text4)", border: "2px solid var(--bg3)" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{v.user.name}</div>
                        <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 1 }}>{v.user.workoutType}</div>
                        {v.user.vibe && <div style={{ color: "var(--text4)", fontSize: 11, marginTop: 2 }}>{v.user.vibe.emoji} {v.user.vibe.label}</div>}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ color: "#A8D8F0", fontSize: 11, fontWeight: 700 }}>{v.time}</div>
                        <div style={{ color: "var(--text4)", fontSize: 10, marginTop: 3 }}>Tap to view →</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 16, padding: "10px 14px", background: "#08101A", border: "1px solid #A8D8F030", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>👻</span>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>Ghost users only appear to people they've complimented</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            UPGRADE MODAL
        ══════════════════════════════════════════════════ */}
        {showUpgrade && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 999, display: "flex", alignItems: "flex-end" }} onClick={() => setShowUpgrade(false)}>
            <div style={{ width: "100%", background: "var(--bg2)", borderRadius: "24px 24px 0 0", padding: "28px 24px 48px", border: "1px solid var(--border)" }} onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 3, color: "var(--text)" }}>Unlock Frost</div>
                <div style={{ color: "var(--text3)", fontSize: 13, marginTop: 4 }}>
                  {complimentsLeft === 0 ? "You've used all 5 free compliments today." : "Go unlimited. Stand out on the floor."}
                </div>
              </div>

              {/* Tier cards */}
              {[
                {
                  id: "free", label: "Free", price: "$0", period: "forever",
                  perks: ["5 compliments per day", "Full gym floor access", "Basic profile"],
                  color: "var(--border)", textColor: "var(--text3)", highlight: false,
                },
                {
                  id: "plus", label: "Frost+", price: "$4.99", period: "/mo",
                  perks: ["Unlimited compliments", "See who viewed your profile", "👻 Ghost mode — send anonymously", "Streak bonuses + badges"],
                  color: "#FF6B00", textColor: "#FF6B00", highlight: true,
                },
                {
                  id: "pro", label: "Frost Pro", price: "$9.99", period: "/mo",
                  perks: ["Everything in Frost+", "Priority floor placement", "Multi-city access + verified badge"],
                  color: "#A8D8F0", textColor: "#A8D8F0", highlight: false,
                },
              ].map(tier => (
                <div key={tier.id} onClick={() => { if (tier.id !== "free") {
                        setUserTier(tier.id);
                        setShowUpgrade(false);
                        showToast(`${tier.label} activated! 🎉`);
                        setMainTab("floor");
                        setTimeout(() => {
                          setShowConfetti(true);
                          setTimeout(() => setShowConfetti(false), 3500);
                        }, 300);
                      } }}
                  style={{ background: userTier === tier.id ? "#0E0E18" : "var(--bg3)", border: `1.5px solid ${userTier === tier.id ? tier.color : "var(--border)"}`, borderRadius: 16, padding: "14px 16px", marginBottom: 10, cursor: tier.id === "free" ? "default" : "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}>
                  {tier.highlight && userTier !== "plus" && (
                    <div style={{ position: "absolute", top: 0, right: 0, background: "#FF6B00", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: "0 0 0 10px", letterSpacing: 1 }}>POPULAR</div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {userTier === tier.id && <span style={{ color: tier.color, fontSize: 12 }}>✓</span>}
                      <span style={{ fontWeight: 800, fontSize: 15, color: tier.textColor }}>{tier.label}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: tier.color }}>{tier.price}</span>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>{tier.period}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {tier.perks.map(p => (
                      <div key={p} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)" }}>
                        <span style={{ color: tier.color, fontSize: 10 }}>✦</span> {p}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ textAlign: "center", marginTop: 12, color: "var(--text4)", fontSize: 11 }}>
                Cancel anytime · No hidden fees
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            SETTINGS
        ══════════════════════════════════════════════════ */}
        {screen === "settings" && (
          <div className="fade-up" style={{ padding: "48px 20px 80px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <BackBtn onClick={() => setScreen("main")} />
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 2 }}>Settings</div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ padding: "16px 16px 8px" }}>
                <div className="section-label">Privacy</div>
              </div>
              {[
                { label: "Show Online Status", sub: "Let others see you're in the gym", val: showOnline, set: setShowOnline },
                { label: "Show Age", sub: "Display your age on your profile", val: showAge, set: setShowAge },
                { label: "Notifications", sub: "Get notified of compliments", val: notifications, set: setNotifications },
              ].map(s => (
                <div key={s.label} className="settings-item" style={{ padding: "14px 16px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.label}</div>
                    <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>{s.sub}</div>
                  </div>
                  <Toggle on={s.val} onToggle={() => s.set(v => !v)} />
                </div>
              ))}

              {/* Ghost Mode toggle — Frost+ only */}
              <div className="settings-item" style={{ padding: "14px 16px" }} onClick={() => {
                if (userTier === "free") { setShowUpgrade(true); return; }
                const next = !ghostMode;
                setGhostMode(next);
                showToast(next ? "👻 Ghost on — hidden from floor, visible to people you compliment" : "👁️ Ghost off — you're visible to everyone");
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: ghostMode ? "#0D0D22" : "var(--bg3)", border: `1.5px solid ${ghostMode ? "#A8D8F060" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, transition: "all 0.2s" }}>
                  👻
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>Ghost Mode</span>
                    {userTier === "free"
                      ? <span style={{ fontSize: 9, fontWeight: 800, background: "#FF6B00", color: "#fff", borderRadius: 20, padding: "2px 7px" }}>FROST+</span>
                      : ghostMode && <span style={{ fontSize: 9, fontWeight: 800, background: "#0D0D22", color: "#A8D8F0", border: "1px solid #A8D8F050", borderRadius: 20, padding: "2px 7px" }}>ON</span>
                    }
                  </div>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>
                    {ghostMode ? "Hidden from floor — visible only to people you compliment" : "Hide from the floor, visible only to people you compliment"}
                  </div>
                </div>
                {userTier === "free"
                  ? <span style={{ color: "var(--text4)", fontSize: 16 }}>›</span>
                  : <Toggle on={ghostMode} onToggle={() => {
                      const next = !ghostMode;
                      setGhostMode(next);
                      showToast(next ? "👻 Ghost on — hidden from floor, visible to people you compliment" : "👁️ Ghost off — you're visible to everyone");
                    }} />
                }
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ padding: "16px 16px 8px" }}>
                <div className="section-label">Safety & Privacy</div>
              </div>
              {[
                { label: "Block a User",      icon: "🚫", sub: `${blockedUsers.length} blocked`,          key: "block"   },
                { label: "Report Someone",    icon: "⚠️",  sub: "Flag inappropriate behaviour",            key: "report"  },
                { label: "Privacy Policy",    icon: "📄",  sub: "How we handle your data",                 key: "privacy" },
                { label: "Terms of Service",  icon: "📋",  sub: "Rules and guidelines",                    key: "terms"   },
              ].map(item => (
                <div key={item.label} className="settings-item" style={{ padding: "14px 16px" }} onClick={() => { setSettingsSheet(item.key); setReportStep(1); setReportTarget(""); setReportReason(""); setReportDetails(""); setBlockSearch(""); }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                    <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 1 }}>{item.sub}</div>
                  </div>
                  <span style={{ color: "var(--text4)", fontSize: 16 }}>›</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ padding: "16px 16px 8px" }}>
                <div className="section-label">FAQ</div>
              </div>
              {[
                { q: "How does Check In work?",    icon: "🏋️", a: "Tap Check In, pick your session length (30 min–2 hrs), and go live. Others at the same gym can see you on the floor. You earn your daily streak + bonus compliment after 30 minutes." },
                { q: "Who can see my profile?",    icon: "👁️", a: "Only people at the same gym. Once you check out or your session expires, you disappear from the floor. Enable Ghost Mode (Frost+) to stay invisible while still browsing." },
                { q: "What is Ghost Mode?",        icon: "👻", a: "Ghost Mode hides you from the floor — but you can still browse and send compliments. Your compliments arrive as 'Someone.' Available on Frost+ and Pro." },
                { q: "How do compliments work?",   icon: "💬", a: "Tap someone's card, pick one of 10 compliments, and send. They can reply Thanks, You, or Ghost. Free users get 5 compliments/day — earn a bonus one by staying 30 min." },
                { q: "What does the streak mean?", icon: "🔥", a: "Check in and stay 30 minutes to earn a streak day. Miss a day and it resets. Streaks show on your profile and leaderboard ranking." },
                { q: "Is my data private?",        icon: "🔒", a: "We only collect your first name, last initial, age, workout type, and the photos you choose to share. Your phone number is only used to verify your identity and is never shown to other users." },
              ].map(({ q, a, icon }, i) => (
                <div key={q} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                    <div style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>{q}</div>
                    <span style={{ color: "var(--text4)", fontSize: 12, transition: "transform 0.2s", display: "inline-block", transform: openFaq === i ? "rotate(180deg)" : "none", flexShrink: 0 }}>▾</span>
                  </div>
                  {openFaq === i && (
                    <div style={{ color: "var(--text3)", fontSize: 13, marginTop: 10, lineHeight: 1.7, paddingLeft: 26, paddingRight: 8 }}>
                      {a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Subscription Card */}
            <div className="card" style={{ marginBottom: 16, padding: "16px" }}>
              <div className="section-label" style={{ marginBottom: 12 }}>Account</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: userTier === "free" ? "var(--bg3)" : "#1A0800", border: `1.5px solid ${userTier === "free" ? "var(--border)" : "#FF6B0060"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    {userTier === "free" ? "🔓" : userTier === "plus" ? "👻" : "⚡"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: userTier === "free" ? "var(--text)" : "#FF6B00" }}>
                      {userTier === "free" ? "Free Plan" : userTier === "plus" ? "Frost+" : "Frost Pro"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                      {userTier === "free" ? "5 compliments/day" : userTier === "plus" ? "$4.99/mo · Unlimited + Ghost" : "$9.99/mo · All features"}
                    </div>
                  </div>
                </div>
                {userTier === "free"
                  ? <button onClick={() => setShowUpgrade(true)} style={{ background: "#FF6B00", border: "none", borderRadius: 20, padding: "7px 14px", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Upgrade</button>
                  : <button onClick={() => { setUserTier("free"); showToast("Subscription cancelled."); }} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 20, padding: "7px 14px", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Manage</button>
                }
              </div>
            </div>

            <button className="btn-primary ghost" onClick={() => { setScreen("auth"); setAuthStep("phone"); setPhone(""); setOtp(["","","","","",""]); showToast("Logged out."); }}>
              Log Out
            </button>

            {/* Delete Account */}
            <button onClick={() => {
              if (window.confirm("Delete your Frost account? This cannot be undone. All your data will be permanently removed within 30 days.")) {
                try { localStorage.clear(); } catch {}
                setScreen("auth"); setAuthStep("phone"); setPhone(""); setOtp(["","","","","",""]);
                showToast("Account deleted. Sorry to see you go.", "error");
              }
            }} style={{ width: "100%", background: "none", border: "1px solid #ff444433", borderRadius: 14, padding: "14px", color: "#ff6b6b", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
              Delete Account
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            SETTINGS SHEETS
        ══════════════════════════════════════════════════ */}
        {settingsSheet && (
          <div className="overlay" onClick={() => setSettingsSheet(null)}>
            <div className="overlay-sheet" style={{ maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>

              {/* ── BLOCK USER ── */}
              {settingsSheet === "block" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 2 }}>Block a User</div>
                      <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 1 }}>Blocked users can't see you or send you compliments</div>
                    </div>
                    <button onClick={() => setSettingsSheet(null)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 14px", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Done</button>
                  </div>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                    <input autoFocus value={blockSearch} onChange={e => setBlockSearch(e.target.value)} placeholder="Search by name..." style={{ width: "100%", background: "var(--bg3)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "11px 14px", color: "var(--text)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ overflowY: "auto", maxHeight: "calc(90vh - 160px)" }}>
                    {/* Current blocked list */}
                    {blockedUsers.length > 0 && (
                      <div style={{ padding: "12px 20px 4px" }}>
                        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "var(--text4)", textTransform: "uppercase", marginBottom: 8 }}>Blocked ({blockedUsers.length})</div>
                        {blockedUsers.map(u => (
                          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                            <img src={u.photo} alt="" style={{ width: 40, height: 40, borderRadius: 12, objectFit: "cover", filter: "grayscale(100%)", opacity: 0.5 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text2)" }}>{u.name}</div>
                              <div style={{ color: "var(--text4)", fontSize: 11 }}>Blocked</div>
                            </div>
                            <button onClick={() => { setBlockedUsers(b => b.filter(x => x.id !== u.id)); showToast(`${u.name.split(" ")[0]} unblocked`); }} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 20, padding: "5px 12px", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Unblock</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Only show users you've interacted with */}
                    <div style={{ padding: "12px 20px 20px" }}>
                      {(() => {
                        // Build interacted user list from sent history + inbox + profile viewers
                        const interactedIds = new Set([
                          ...history.map(h => h.userData?.id ?? h.userId).filter(Boolean),
                          ...inbox.map(n => n.userData?.id).filter(Boolean),
                          ...profileViewers.map(v => v.user?.id).filter(Boolean),
                        ]);
                        const interactedUsers = lobbyUsers.filter(u =>
                          interactedIds.has(u.id) &&
                          !blockedUsers.some(b => b.id === u.id) &&
                          (blockSearch === "" || u.name.toLowerCase().includes(blockSearch.toLowerCase()))
                        );
                        if (interactedUsers.length === 0 && blockSearch === "") return (
                          <div style={{ textAlign: "center", padding: "32px 0" }}>
                            <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text2)", marginBottom: 4 }}>No interactions yet</div>
                            <div style={{ color: "var(--text3)", fontSize: 12 }}>Users you send or receive compliments from will appear here.</div>
                          </div>
                        );
                        if (interactedUsers.length === 0 && blockSearch !== "") return (
                          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text3)", fontSize: 13 }}>No users found</div>
                        );
                        return (
                          <>
                            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "var(--text4)", textTransform: "uppercase", marginBottom: 8 }}>Recent Interactions</div>
                            {interactedUsers.map(u => (
                              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                                <img src={u.photo} alt="" style={{ width: 40, height: 40, borderRadius: 12, objectFit: "cover" }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                                  <div style={{ color: "var(--text3)", fontSize: 11 }}>{u.workoutType}</div>
                                </div>
                                <button onClick={() => { setBlockedUsers(b => [...b, u]); setLobbyUsers(l => l.filter(x => x.id !== u.id)); showToast(`🚫 ${u.name.split(" ")[0]} blocked`); }} style={{ background: "#1a0000", border: "1px solid #ff444433", borderRadius: 20, padding: "5px 12px", color: "#ff6b6b", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Block</button>
                              </div>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </>
              )}

              {/* ── REPORT USER ── */}
              {settingsSheet === "report" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 2 }}>Report Someone</div>
                      <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 1 }}>{reportStep >= 4 ? "Submitted" : `Step ${reportStep} of 3`}</div>
                    </div>
                    <button onClick={() => { setSettingsSheet(null); setReportStep(1); setReportTarget(""); setReportReason(""); setReportDetails(""); }} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 14px", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 3, background: "var(--bg3)" }}>
                    <div style={{ height: "100%", width: `${(reportStep / 3) * 100}%`, background: "linear-gradient(90deg, #FF6B00, #FF8C2A)", transition: "width 0.3s ease", borderRadius: 99 }} />
                  </div>

                  <div style={{ padding: "20px", overflowY: "auto", maxHeight: "calc(90vh - 110px)" }}>
                    {/* Step 1: Who */}
                    {reportStep === 1 && (
                      <>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Who are you reporting?</div>
                        <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 16 }}>Select the person from your current gym floor</div>
                        {lobbyUsers.map(u => (
                          <div key={u.id} onClick={() => setReportTarget(u.name)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", marginBottom: 8, borderRadius: 14, border: `1.5px solid ${reportTarget === u.name ? "var(--red)" : "var(--border)"}`, background: reportTarget === u.name ? "#1a0000" : "var(--bg3)", cursor: "pointer", transition: "all 0.15s" }}>
                            <img src={u.photo} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                              <div style={{ color: "var(--text3)", fontSize: 12 }}>{u.workoutType}</div>
                            </div>
                            {reportTarget === u.name && <span style={{ color: "var(--red)", fontSize: 18 }}>✓</span>}
                          </div>
                        ))}
                        <button onClick={() => reportTarget && setReportStep(2)} style={{ marginTop: 8 }} className={`btn-primary${!reportTarget ? " ghost" : ""}`}>Continue</button>
                      </>
                    )}

                    {/* Step 2: Why */}
                    {reportStep === 2 && (
                      <>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>What's the issue?</div>
                        <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 16 }}>Reporting <span style={{ color: "var(--red)", fontWeight: 700 }}>{reportTarget}</span></div>
                        {["Harassment or bullying", "Inappropriate content", "Fake or impersonation", "Spam", "Underage user", "Other"].map(r => (
                          <div key={r} onClick={() => setReportReason(r)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", marginBottom: 8, borderRadius: 14, border: `1.5px solid ${reportReason === r ? "var(--red)" : "var(--border)"}`, background: reportReason === r ? "#1a0000" : "var(--bg3)", cursor: "pointer", transition: "all 0.15s" }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: reportReason === r ? "var(--red)" : "var(--text)" }}>{r}</span>
                            {reportReason === r && <span style={{ color: "var(--red)" }}>✓</span>}
                          </div>
                        ))}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                          <button onClick={() => reportReason && setReportStep(3)} className={`btn-primary${!reportReason ? " ghost" : ""}`}>Continue</button>
                          <button onClick={() => setReportStep(1)} style={{ background: "none", border: "none", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "10px" }}>← Back</button>
                        </div>
                      </>
                    )}

                    {/* Step 4: Confirmation */}
                    {reportStep === 4 && (
                      <div className="pop-in" style={{ textAlign: "center", padding: "32px 0" }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>Report Submitted</div>
                        <div style={{ color: "var(--text3)", fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
                          We've received your report about <span style={{ color: "var(--text)", fontWeight: 700 }}>{reportTarget}</span>.
                        </div>
                        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", marginBottom: 24, textAlign: "left" }}>
                          {[
                            { label: "Reason", val: reportReason },
                            { label: "Review time", val: "Within 24 hours" },
                            { label: "Action", val: "Reviewed by our trust & safety team" },
                          ].map(row => (
                            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                              <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600 }}>{row.label}</span>
                              <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 700 }}>{row.val}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ background: "#0D1A0D", border: "1px solid #38E8A030", borderRadius: 12, padding: "12px 14px", marginBottom: 24, fontSize: 12, color: "var(--text3)", lineHeight: 1.6, textAlign: "left" }}>
                          💡 You can also block <span style={{ fontWeight: 700, color: "var(--text)" }}>{reportTarget.split(" ")[0]}</span> immediately from Settings → Block a User so they can no longer see your profile.
                        </div>
                        <button className="btn-primary" onClick={() => { setSettingsSheet(null); setReportStep(1); setReportTarget(""); setReportReason(""); setReportDetails(""); }}>Done</button>
                      </div>
                    )}

                    {/* Step 3: Details + submit */}
                    {reportStep === 3 && (
                      <>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Any additional details?</div>
                        <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 16 }}>Optional — helps us act faster</div>
                        <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} placeholder="Describe what happened..." style={{ width: "100%", minHeight: 100, background: "var(--bg3)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "12px 14px", color: "var(--text)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.5 }} />
                        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px", marginTop: 12, marginBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Summary</div>
                          <div style={{ color: "var(--text3)", fontSize: 12, lineHeight: 1.6 }}>
                            Reporting <span style={{ color: "var(--text)", fontWeight: 700 }}>{reportTarget}</span> for <span style={{ color: "var(--red)", fontWeight: 700 }}>{reportReason}</span>
                          </div>
                        </div>
                        <button className="btn-primary" onClick={() => { setReportStep(4); }}>Submit Report</button>
                        <button onClick={() => setReportStep(2)} style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "10px" }}>← Back</button>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* ── PRIVACY POLICY ── */}
              {settingsSheet === "privacy" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 2 }}>Privacy Policy</div>
                    <button onClick={() => setSettingsSheet(null)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 14px", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Done</button>
                  </div>
                  <div style={{ overflowY: "auto", maxHeight: "calc(90vh - 80px)", padding: "20px" }}>
                    {[
                      { title: "What We Collect", body: "We collect your first name, last initial, age, workout preferences, and the photos you choose to upload. We do not collect your last name, email, or any information beyond what you provide during signup." },
                      { title: "How We Use It", body: "Your information is used solely to display your profile to members at the same gym when you are online. We never sell your data to third parties or use it for advertising." },
                      { title: "Who Can See You", body: "Only members who are checked into the same gym at the same time as you can see your profile. Once you go offline, your profile is hidden from the gym floor." },
                      { title: "Compliments", body: "Compliments are stored so you can view your inbox history. We do not share compliment data with anyone outside of the two parties involved." },
                      { title: "Photos", body: "Photos are stored securely and only displayed within the app. We do not use facial recognition or share photos with any third parties." },
                      { title: "Blocking & Reporting", body: "When you block someone, they are immediately removed from your view and cannot see your profile. Reports are reviewed by our team within 24 hours." },
                      { title: "Data Deletion", body: "You can delete your account at any time from Settings. All your data, including photos and compliment history, is permanently deleted within 30 days." },
                      { title: "Contact", body: "For privacy questions, contact us at privacy@frost.app" },
                    ].map(s => (
                      <div key={s.title} style={{ marginBottom: 20 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "var(--red)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.title}</div>
                        <div style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.7 }}>{s.body}</div>
                      </div>
                    ))}
                    <div style={{ color: "var(--text4)", fontSize: 11, marginTop: 8, textAlign: "center" }}>Last updated March 2026 · Frost NYC</div>
                  </div>
                </>
              )}

              {/* ── TERMS OF SERVICE ── */}
              {settingsSheet === "terms" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 2 }}>Terms of Service</div>
                    <button onClick={() => setSettingsSheet(null)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 14px", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Done</button>
                  </div>
                  <div style={{ overflowY: "auto", maxHeight: "calc(90vh - 80px)", padding: "20px" }}>
                    {[
                      { title: "1. Eligibility", body: "You must be 18 years or older to use Frost. By using the app you confirm that you meet this requirement." },
                      { title: "2. Respectful Use", body: "Frost is a compliments-only platform. You agree to use it positively and respectfully. Harassment, hate speech, or threatening behaviour will result in immediate permanent ban." },
                      { title: "3. Authentic Identity", body: "You agree to use your real first name and a genuine photo of yourself. Impersonating another person is strictly prohibited." },
                      { title: "4. Appropriate Content", body: "Photos must be appropriate for a public fitness environment. Nudity, explicit content, or content that violates community standards is not permitted." },
                      { title: "5. No Solicitation", body: "Frost is not a dating app or marketplace. Using it to solicit commercial services, sell products, or pursue others in unwanted ways violates these terms." },
                      { title: "6. Gym Verification", body: "You may only check in to gyms where you are actually present. False check-ins are a violation of these terms." },
                      { title: "7. Reporting Obligation", body: "If you witness behaviour that violates these terms, you are encouraged to use the Report feature. Failure to report known violations may affect your account standing." },
                      { title: "8. Account Termination", body: "We reserve the right to suspend or terminate any account that violates these terms, with or without notice." },
                      { title: "9. Limitation of Liability", body: "Frost is provided as-is. We are not liable for interactions between users that occur outside of the app." },
                      { title: "10. Changes to Terms", body: "We may update these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms." },
                    ].map(s => (
                      <div key={s.title} style={{ marginBottom: 20 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "var(--red)", marginBottom: 6 }}>{s.title}</div>
                        <div style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.7 }}>{s.body}</div>
                      </div>
                    ))}
                    <div style={{ color: "var(--text4)", fontSize: 11, marginTop: 8, textAlign: "center" }}>Last updated March 2026 · Frost NYC</div>
                  </div>
                </>
              )}

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            PROFILE PREVIEW OVERLAY
        ══════════════════════════════════════════════════ */}
        {showPreview && editDraft && (
          <div className="overlay" style={{ zIndex: 300 }}>
            <div className="overlay-sheet" style={{ maxHeight: "96vh" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "var(--text3)", textTransform: "uppercase" }}>Profile Preview</div>
                <button onClick={() => setShowPreview(false)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 14px", color: "var(--text2)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Done</button>
              </div>

              {/* Photo strip */}
              {(() => {
                const photos = (editDraft.photos || []).filter(Boolean).slice(0, 3);
                const photoIdx = editDraft._previewPhotoIdx || 0;
                const setPhotoIdx = (n) => setEditDraft(d => ({...d, _previewPhotoIdx: n}));
                if (photos.length === 0) return (
                  <div style={{ margin: "12px 20px 0", height: 140, background: "var(--bg3)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed var(--border2)" }}>
                    <div style={{ textAlign: "center", color: "var(--text3)" }}>
                      <div style={{ fontSize: 36 }}>📸</div>
                      <div style={{ fontSize: 12, marginTop: 6 }}>No photos yet</div>
                    </div>
                  </div>
                );
                return (
                  <div style={{ position: "relative", margin: "12px 20px 0", borderRadius: 20, overflow: "hidden", aspectRatio: "4/3" }}>
                    {photos.map((p, i) => (
                      <img key={i} src={p} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: i === photoIdx ? 1 : 0, transition: "opacity 0.35s ease", zIndex: i === photoIdx ? 1 : 0 }} />
                    ))}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)", zIndex: 2 }} />
                    {photos.length > 1 && (
                      <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, zIndex: 3 }}>
                        {photos.map((_, i) => (
                          <div key={i} onClick={() => setPhotoIdx(i)} style={{ width: i === photoIdx ? 18 : 6, height: 6, borderRadius: 99, background: i === photoIdx ? "var(--red)" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.25s ease" }} />
                        ))}
                      </div>
                    )}
                    {photoIdx > 0 && <div onClick={() => setPhotoIdx(photoIdx - 1)} style={{ position: "absolute", left: 0, top: 0, width: "40%", height: "100%", zIndex: 4, cursor: "pointer" }} />}
                    {photoIdx < photos.length - 1 && <div onClick={() => setPhotoIdx(photoIdx + 1)} style={{ position: "absolute", right: 0, top: 0, width: "40%", height: "100%", zIndex: 4, cursor: "pointer" }} />}
                    {photos.length > 1 && (
                      <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", borderRadius: 20, padding: "3px 8px", zIndex: 3 }}>
                        <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>{photoIdx + 1} / {photos.length}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Name + verified */}
              <div style={{ padding: "16px 20px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontWeight: 800, fontSize: 22 }}>{editDraft.name || myProfile.name || "Your Name"}</div>
                  <div style={{ background: "var(--green)22", color: "var(--green)", fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: 700, border: "1px solid var(--green)44" }}>Verified</div>
                </div>

                {/* Tags row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {myProfile.age && (
                    <span className="tag" style={{ background: "#080E18", color: "var(--red)", borderColor: "var(--red)33" }}>
                      {myProfile.age} yrs
                    </span>
                  )}
                  {myProfile.height && (
                    <span className="tag" style={{ background: "#080E18", color: "var(--red)", borderColor: "var(--red)33" }}>
                      {myProfile.height}
                    </span>
                  )}
                  {myProfile.sexuality && (() => {
                    const s = SEXUALITY_OPTIONS.find(o => o.id === myProfile.sexuality);
                    return s ? <span className="tag">{s.emoji} {s.label}</span> : null;
                  })()}
                  {editDraft.workoutType && (
                    <span className="tag" style={{ background: "#080E18", color: "var(--purple)", borderColor: "var(--purple)33" }}>
                      {editDraft.workoutType}
                    </span>
                  )}
                </div>

                {/* Bio */}
                {editDraft.bio ? (
                  <div style={{ color: "var(--text2)", fontSize: 14, fontStyle: "italic", marginBottom: 12, lineHeight: 1.6, background: "var(--bg3)", borderRadius: 12, padding: "10px 14px", border: "1px solid var(--border)" }}>
                    "{editDraft.bio}"
                  </div>
                ) : (
                  <div style={{ color: "var(--text4)", fontSize: 13, marginBottom: 12, fontStyle: "italic" }}>No bio added</div>
                )}

                {/* Goals */}
                {(editDraft.goals || []).length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div className="section-label" style={{ marginBottom: 8 }}>Goals</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(editDraft.goals || []).map(g => <span key={g} className="tag">{g}</span>)}
                    </div>
                  </div>
                )}

                {/* How others see this card on Gym Floor */}
                <div style={{ marginBottom: 20 }}>
                  <div className="section-label" style={{ marginBottom: 10 }}>How you appear on Gym Floor</div>
                  <div style={{ borderRadius: 20, overflow: "hidden", position: "relative", aspectRatio: "3/4", background: "var(--bg3)", maxWidth: 180 }}>
                    {(editDraft.photos || [])[0] ? (
                      <img src={(editDraft.photos || [])[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>👤</div>
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)" }} />
                    <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", borderRadius: 20, padding: "3px 8px", display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ color: "#38E8A0", fontSize: 11 }}>✓</span>
                      <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>Verified</span>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px" }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 4 }}>{editDraft.name || myProfile.name || "You"}, {myProfile.age || "?"}</div>
                      {editDraft.workoutType && (
                        <div style={{ display: "inline-flex", background: "rgba(199,125,255,0.2)", border: "1px solid rgba(199,125,255,0.3)", borderRadius: 20, padding: "2px 8px", marginBottom: 5 }}>
                          <span style={{ color: "var(--purple)", fontSize: 10, fontWeight: 700 }}>{editDraft.workoutType}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)" }} className="pulse" />
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>Just went online</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="btn-primary" onClick={() => setShowPreview(false)} style={{ marginBottom: 32 }}>
                  Back to Editing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            COMPLIMENT SHEET
        ══════════════════════════════════════════════════ */}
        {/* ── INLINE REPORT FROM PROFILE OVERLAY ── */}
        {overlayReport && (
          <div className="overlay" style={{ zIndex: 500 }} onClick={() => setOverlayReport(null)}>
            <div style={{ width: "100%", maxWidth: 430, background: "var(--bg2)", borderRadius: "24px 24px 0 0", padding: "24px 24px 48px", animation: "slideUp .3s ease" }} onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, letterSpacing: 2 }}>Report {overlayReport.target?.name?.split(" ")[0]}</div>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 1 }}>
                    {overlayReport.step >= 4 ? "Submitted" : `Step ${overlayReport.step} of 3`}
                  </div>
                </div>
                <button onClick={() => setOverlayReport(null)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 14px", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              </div>
              {/* Progress bar */}
              <div style={{ height: 3, background: "var(--bg3)", borderRadius: 99, marginBottom: 20, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(Math.min(overlayReport.step, 3) / 3) * 100}%`, background: "linear-gradient(90deg,#FF6B00,#FF8C2A)", transition: "width .3s ease", borderRadius: 99 }} />
              </div>

              {/* Step 1 — pick reason */}
              {overlayReport.step === 1 && (
                <>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>What's the issue?</div>
                  <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 14 }}>Reporting <span style={{ color: "var(--red)", fontWeight: 700 }}>{overlayReport.target?.name}</span></div>
                  {["Harassment or bullying", "Inappropriate content", "Fake or impersonation", "Spam", "Underage user", "Other"].map(r => (
                    <div key={r} onClick={() => setOverlayReport(o => ({ ...o, reason: r }))}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px", marginBottom: 8, borderRadius: 14, border: `1.5px solid ${overlayReport.reason === r ? "var(--red)" : "var(--border)"}`, background: overlayReport.reason === r ? "#1a0000" : "var(--bg3)", cursor: "pointer", transition: "all .15s" }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: overlayReport.reason === r ? "var(--red)" : "var(--text)" }}>{r}</span>
                      {overlayReport.reason === r && <span style={{ color: "var(--red)" }}>✓</span>}
                    </div>
                  ))}
                  <button onClick={() => overlayReport.reason && setOverlayReport(o => ({ ...o, step: 2 }))} className={`btn-primary${!overlayReport.reason ? " ghost" : ""}`} style={{ marginTop: 8, fontFamily: "'DM Sans',sans-serif" }}>Continue</button>
                </>
              )}

              {/* Step 2 — optional details + summary */}
              {overlayReport.step === 2 && (
                <>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Any additional details?</div>
                  <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 14 }}>Optional — helps us act faster</div>
                  <textarea value={overlayReport.details} onChange={e => setOverlayReport(o => ({ ...o, details: e.target.value }))}
                    placeholder="Describe what happened..."
                    style={{ width: "100%", minHeight: 90, background: "var(--bg3)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "12px 14px", color: "var(--text)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.5, marginBottom: 12 }} />
                  <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4, color: "var(--text3)" }}>Summary</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                      Reporting <span style={{ fontWeight: 700 }}>{overlayReport.target?.name}</span> for <span style={{ color: "var(--red)", fontWeight: 700 }}>{overlayReport.reason}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button className="btn-primary" style={{ fontFamily: "'DM Sans',sans-serif" }} onClick={() => setOverlayReport(o => ({ ...o, step: 3 }))}>Submit Report</button>
                    <button onClick={() => setOverlayReport(o => ({ ...o, step: 1 }))} style={{ background: "none", border: "none", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "8px" }}>← Back</button>
                  </div>
                </>
              )}

              {/* Step 3 — confirmation */}
              {overlayReport.step === 3 && (
                <div className="pop-in" style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, letterSpacing: 2, marginBottom: 8 }}>Report Submitted</div>
                  <div style={{ color: "var(--text3)", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
                    We've received your report about <span style={{ color: "var(--text)", fontWeight: 700 }}>{overlayReport.target?.name}</span>. Our team reviews within 24 hours.
                  </div>
                  <div style={{ background: "#0D1A0D", border: "1px solid #38E8A030", borderRadius: 12, padding: "12px 14px", marginBottom: 20, fontSize: 12, color: "var(--text3)", lineHeight: 1.6, textAlign: "left" }}>
                    💡 Want to block <span style={{ fontWeight: 700, color: "var(--text)" }}>{overlayReport.target?.name?.split(" ")[0]}</span> too? They won't be able to see your profile.
                    <button onClick={() => {
                      const u = overlayReport.target;
                      if (!blockedUsers.some(b => b.id === u.id)) {
                        setBlockedUsers(b => [...b, u]);
                        setLobbyUsers(l => l.filter(x => x.id !== u.id));
                        showToast(`🚫 ${u.name.split(" ")[0]} blocked`);
                      }
                      setOverlayReport(null); setViewingUser(null);
                    }} style={{ display: "block", marginTop: 8, background: "#1a0000", border: "1px solid #ff444433", borderRadius: 10, padding: "7px 14px", color: "#ff6b6b", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer", width: "100%" }}>
                      🚫 Also block {overlayReport.target?.name?.split(" ")[0]}
                    </button>
                  </div>
                  <button className="btn-primary" style={{ fontFamily: "'DM Sans',sans-serif" }} onClick={() => { setOverlayReport(null); setViewingUser(null); }}>Done</button>
                </div>
              )}
            </div>
          </div>
        )}

        {viewingUser && (
          <div className="overlay">
            <div className="overlay-sheet" style={{ maxHeight: "96vh" }}>
              {complimentAnim ? (
                <div className="pop-in" style={{ padding: 48, textAlign: "center" }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>✨</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 2, color: "var(--green)" }}>Compliment Sent!</div>
                </div>
              ) : (
                <>
                  {/* ── Close bar ── */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0" }}>
                    <button onClick={() => { setViewingUser(null); setShowProfileDetails(false); setOverlayMenu(false); setOverlayReport(null); }} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>Close</button>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Per-compliment ghost toggle */}
                      <div className="tooltip-wrap">
                        <span className="tooltip-box">
                          {userTier === "free" ? "Frost+ only — go anonymous" : ghostMode ? "Turn off — visible to everyone again" : "Go ghost — hidden to all, visible only to people you compliment"}
                        </span>
                        <button onClick={() => {
                          if (userTier === "free") { setShowUpgrade(true); return; }
                          const nextGhost2 = !ghostMode;
                          setGhostMode(nextGhost2);
                          showToast(nextGhost2 ? "👻 Ghost on — hidden from floor, visible only to people you compliment" : "👁️ Ghost off — visible to everyone");
                        }} style={{ display: "flex", alignItems: "center", gap: 5, background: ghostMode ? "#0D0D22" : "var(--bg3)", border: `1.5px solid ${ghostMode ? "#A8D8F0" : "var(--border)"}`, borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 800, color: ghostMode ? "#A8D8F0" : "var(--text3)", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", position: "relative" }}>
                          👻 {ghostMode ? "Ghost On" : "Ghost Off"}
                          {userTier === "free" && <span style={{ position: "absolute", top: -4, right: -4, background: "#FF6B00", borderRadius: "50%", width: 14, height: 14, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>+</span>}
                        </button>
                      </div>
                      {/* ⋯ more menu */}
                      <div style={{ position: "relative" }}>
                        <button onClick={() => setOverlayMenu(m => !m)} style={{ background: overlayMenu ? "var(--bg3)" : "none", border: overlayMenu ? "1px solid var(--border)" : "none", borderRadius: 10, padding: "6px 10px", color: "var(--text3)", cursor: "pointer", fontSize: 18, lineHeight: 1, fontFamily: "'DM Sans',sans-serif", transition: "all .15s" }}>⋯</button>
                        {overlayMenu && (
                          <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", zIndex: 999, minWidth: 160, boxShadow: "0 8px 32px rgba(0,0,0,.6)" }}>
                            <button onClick={() => {
                              setOverlayMenu(false);
                              if (!blockedUsers.some(b => b.id === viewingUser.id)) {
                                setBlockedUsers(b => [...b, viewingUser]);
                                setLobbyUsers(l => l.filter(x => x.id !== viewingUser.id));
                                showToast(`🚫 ${viewingUser.name.split(" ")[0]} blocked`);
                              }
                              setViewingUser(null);
                            }} style={{ width: "100%", padding: "13px 16px", background: "none", border: "none", borderBottom: "1px solid var(--border)", color: "#FF6B6B", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
                              <span>🚫</span> Block {viewingUser.name.split(" ")[0]}
                            </button>
                            <button onClick={() => {
                              setOverlayMenu(false);
                              setOverlayReport({ step: 1, target: viewingUser, reason: "", details: "" });
                            }} style={{ width: "100%", padding: "13px 16px", background: "none", border: "none", color: "var(--text2)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
                              <span>⚠️</span> Report {viewingUser.name.split(" ")[0]}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Photo slideshow ── */}
                  {(() => {
                    const photos = (viewingUser.photos || [viewingUser.photo]).filter(Boolean).slice(0, 3);
                    const [photoIdx, setPhotoIdx] = [viewingUser._photoIdx || 0, (n) => setViewingUser(u => ({...u, _photoIdx: n}))];
                    return (
                      <div style={{ position: "relative", margin: "12px 20px 0", borderRadius: 20, overflow: "hidden", aspectRatio: "4/3" }}>
                        {photos.map((p, i) => (
                          <img key={i} src={p} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: i === photoIdx ? 1 : 0, transition: "opacity 0.35s ease", zIndex: i === photoIdx ? 1 : 0 }} />
                        ))}
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)", zIndex: 2 }} />

                        {/* Name + key info overlaid on photo */}
                        <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, zIndex: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <div style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>{viewingUser.name}</div>
                            {viewingUser.verified && <span style={{ color: "#38E8A0", fontSize: 14 }}>✓</span>}
                            {viewingUser.age && <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{viewingUser.age}</span>}
                          </div>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)", background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "2px 8px" }}>{viewingUser.workoutType}</span>
                            {viewingUser.vibe && <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)", background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "2px 8px" }}>{viewingUser.vibe.emoji} {viewingUser.vibe.label}</span>}
                            {viewingUser.streak > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: viewingUser.streak >= 20 ? "#FF6200" : "#FF6200", background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "2px 8px" }}>🔥 {viewingUser.streak}d</span>}
                            {viewingUser.isRegular && <span style={{ fontSize: 10, fontWeight: 700, color: "#FF6200", background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "2px 8px" }}>Regular</span>}
                          </div>
                        </div>

                        {/* Dot indicators */}
                        {photos.length > 1 && (
                          <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, zIndex: 5 }}>
                            {photos.map((_, i) => (
                              <div key={i} onClick={() => setPhotoIdx(i)} style={{ width: i === photoIdx ? 18 : 6, height: 6, borderRadius: 99, background: i === photoIdx ? "var(--red)" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.25s ease" }} />
                            ))}
                          </div>
                        )}
                        {photoIdx > 0 && <div onClick={() => setPhotoIdx(photoIdx - 1)} style={{ position: "absolute", left: 0, top: 0, width: "40%", height: "100%", zIndex: 3, cursor: "pointer" }} />}
                        {photoIdx < photos.length - 1 && <div onClick={() => setPhotoIdx(photoIdx + 1)} style={{ position: "absolute", right: 0, top: 0, width: "40%", height: "100%", zIndex: 3, cursor: "pointer" }} />}
                        {photos.length > 1 && photoIdx > 0 && <div style={{ position: "absolute", left: 10, top: "40%", zIndex: 4, background: "rgba(0,0,0,0.4)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, pointerEvents: "none" }}>‹</div>}
                        {photos.length > 1 && photoIdx < photos.length - 1 && <div style={{ position: "absolute", right: 10, top: "40%", zIndex: 4, background: "rgba(0,0,0,0.4)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, pointerEvents: "none" }}>›</div>}
                      </div>
                    );
                  })()}

                  {/* ── Send a Compliment — right after photo ── */}
                  <div style={{ padding: "14px 20px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 15, letterSpacing: 1.5, color: "var(--text3)" }}>SEND A COMPLIMENT</div>
                      {ghostMode && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#0D0D22", border: "1px solid #A8D8F060", borderRadius: 10, padding: "3px 9px" }}>
                          <span style={{ fontSize: 11 }}>👻</span>
                          <span style={{ fontSize: 10, fontWeight: 800, color: "#A8D8F0" }}>Anonymous</span>
                        </div>
                      )}
                    </div>
                    {ghostMode && (
                      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10, padding: "7px 10px", background: "#0D0D22", borderRadius: 10, border: "1px solid #A8D8F030" }}>
                        👻 They'll see this as <strong style={{ color: "#A8D8F0" }}>"Someone thinks..."</strong> — your identity stays hidden
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 8 }}>
                      {COMPLIMENTS.map(c => {
                        const sent = sentToday[viewingUser.id] === c.id;
                        const disabled = !!sentToday[viewingUser.id] && !sent;
                        return (
                          <div key={c.id} onClick={() => !sentToday[viewingUser.id] && sendCompliment(c)} style={{ background: sent ? "#080E18" : "var(--bg3)", border: `1.5px solid ${sent ? "var(--green)" : "var(--border)"}`, borderRadius: 12, padding: "10px 4px", textAlign: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1, transition: "all 0.15s" }}>
                            <div style={{ fontSize: 20, marginBottom: 3 }}>{c.emoji}</div>
                            <div style={{ fontWeight: 700, fontSize: 9, color: sent ? "var(--green)" : "var(--text2)", lineHeight: 1.3 }}>{c.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── About — collapsible ── */}
                  <div style={{ margin: "8px 20px 16px" }}>
                    <button onClick={() => setShowProfileDetails(p => !p)} style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text2)" }}>About {viewingUser.name.split(" ")[0]}</span>
                      <span style={{ color: "var(--text3)", fontSize: 13 }}>{showProfileDetails ? "▲" : "▼"}</span>
                    </button>
                    {showProfileDetails && (
                      <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 14px 14px", padding: "14px" }}>
                        {/* Tags */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: viewingUser.bio ? 10 : 0 }}>
                          {viewingUser.age && <span className="tag" style={{ background: "#080E18", color: "var(--red)", borderColor: "var(--red)33" }}>{viewingUser.age} yrs</span>}
                          {viewingUser.height && <span className="tag" style={{ background: "#080E18", color: "var(--red)", borderColor: "var(--red)33" }}>{viewingUser.height}</span>}
                          {viewingUser.pronouns && (() => { const p = PRONOUN_OPTIONS.find(o => o.id === viewingUser.pronouns); return p ? <span className="tag" style={{ background: "#080E18", color: "var(--blue)", borderColor: "var(--blue)33" }}>🏷️ {p.label}</span> : null; })()}
                          {viewingUser.sexuality && (() => { const s = SEXUALITY_OPTIONS.find(o => o.id === viewingUser.sexuality); return s ? <span className="tag">{s.emoji} {s.label}</span> : null; })()}
                        </div>
                        {/* Bio */}
                        {viewingUser.bio && <div style={{ color: "var(--text2)", fontSize: 13, fontStyle: "italic", marginBottom: 10, lineHeight: 1.5 }}>"{viewingUser.bio}"</div>}
                        {/* Goals */}
                        {(viewingUser.goals || []).length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                            {(viewingUser.goals || []).map(g => <span key={g} className="tag" style={{ fontSize: 11 }}>{g}</span>)}
                          </div>
                        )}
                        {/* Home gyms */}
                        {(viewingUser.homeGyms || []).length > 0 && (
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text4)", marginBottom: 7 }}>Home Gyms</div>
                            <div style={{ display: "grid", gridTemplateColumns: viewingUser.homeGyms.length === 2 ? "1fr 1fr" : "1fr", gap: 7 }}>
                              {(viewingUser.homeGyms || []).map((g, i) => (
                                <div key={i} style={{ background: i === 0 ? "#080E18" : "var(--bg2)", border: `1px solid ${i === 0 ? "#38E8A033" : "var(--border)"}`, borderRadius: 12, padding: "10px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                                    <span style={{ fontSize: 12 }}>{i === 0 ? "🏠" : "📍"}</span>
                                    <span style={{ fontSize: 9, fontWeight: 800, color: i === 0 ? "var(--green)" : "var(--text3)", textTransform: "uppercase" }}>{i === 0 ? "Primary" : "Secondary"}</span>
                                  </div>
                                  <div style={{ fontWeight: 700, fontSize: 12, color: i === 0 ? "var(--green)" : "var(--text)", lineHeight: 1.3 }}>{g.name}</div>
                                  {g.neighborhood && <div style={{ color: "var(--text3)", fontSize: 10, marginTop: 2 }}>{g.neighborhood}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STAT SHEETS — Sent / Received
        ══════════════════════════════════════════════════ */}
        {statSheet && (
            <div className="overlay" onClick={() => setStatSheet(null)}>
              <div className="overlay-sheet" style={{ maxHeight: "88vh" }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 2 }}>{statTitle}</div>
                    <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 1 }}>{statItems.length} {statIsSent ? "people" : "compliments"}</div>
                  </div>
                  <button onClick={() => setStatSheet(null)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 14px", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Done</button>
                </div>

                {/* List */}
                <div style={{ overflowY: "auto", maxHeight: "calc(88vh - 80px)", padding: "8px 0 24px" }}>
                  {statItems.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text3)" }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>{statEmptyIcon}</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{statEmpty}</div>
                      {statIsSent && <div style={{ fontSize: 12, marginTop: 6, color: "var(--text4)" }}>Head to the Gym Floor and send one!</div>}
                    </div>
                  ) : statItems.map((item, i) => {
                    const photo = item.photo;
                    const name  = item.user;
                    const compliment = statIsSent ? item.compliment : item.text?.replace(/^.*?"(.*?)".*$/, '$1') || item.text;
                    const time  = item.time;
                    const userData = item.userData;
                    return (
                      <div key={item.id || i} onClick={() => { if (userData) { setStatSheet(null); setTimeout(() => setViewingUser(userData), 120); } }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: "1px solid var(--border)", cursor: userData ? "pointer" : "default", transition: "background 0.15s" }}
                        onMouseEnter={e => { if (userData) e.currentTarget.style.background = "var(--bg3)"; }}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {/* Photo */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <img src={photo} alt={name} style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", border: "1.5px solid var(--border)" }} />
                          {!statIsSent && <div style={{ position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: "var(--purple)", border: "2px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>💬</div>}
                          {statIsSent && <div style={{ position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: "var(--green)", border: "2px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>✓</div>}
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>{name}</div>
                          <div style={{ color: "var(--text3)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {statIsSent ? `You sent "${compliment}"` : `"${compliment}"`}
                          </div>
                        </div>
                        {/* Time + view hint */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ color: "var(--text4)", fontSize: 11 }}>{time}</div>
                          {userData && <div style={{ color: "var(--red)", fontSize: 10, fontWeight: 700, marginTop: 3 }}>View ›</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        {/* ══════════════════════════════════════════════════
            BOTTOM NAV
        ══════════════════════════════════════════════════ */}
        {screen === "main" && (
          <nav className="bottom-nav">
            {[
              { id: "floor",       icon: "🏋️", label: "Gym Floor" },
              { id: "inbox",       icon: "💬", label: "Inbox",   badge: unreadCount },
              { id: "leaderboard", icon: "🔥", label: "Who's Poppin" },
              { id: "profile",     icon: "👤", label: "Profile" },
            ].map(tab => (
              <div key={tab.id} className={`nav-item${mainTab===tab.id?" active":""}`} onClick={() => setMainTab(tab.id)}>
                <div className="nav-icon">{tab.icon}</div>
                <div className="nav-label">{tab.label}</div>
                {tab.badge > 0 && <div className="nav-badge">{tab.badge}</div>}
              </div>
            ))}
          </nav>
        )}

      </div>

      {/* ── ONE LEFT NUDGE ── */}
      {showOneLeftNudge && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowOneLeftNudge(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 430, background: "var(--bg2)", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", animation: "slideUp 0.3s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, letterSpacing: 1, marginBottom: 6 }}>1 Compliment Left Today</div>
              <div style={{ color: "var(--text3)", fontSize: 13, lineHeight: 1.6 }}>
                Make it count — or go unlimited with Frost+ and never hit a limit again.
              </div>
            </div>
            <button className="btn-primary" onClick={() => { setShowOneLeftNudge(false); setShowUpgrade(true); }} style={{ marginBottom: 10 }}>
              ✦ Go Unlimited with Frost+
            </button>
            <button onClick={() => setShowOneLeftNudge(false)} style={{ width: "100%", background: "none", border: "none", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "10px" }}>
              Use my last one wisely
            </button>
          </div>
        </div>
      )}

      {/* ── CHECK-IN SHEET ── */}
      {showCheckinSheet && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={() => setShowCheckinSheet(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 430, background: "var(--bg2)", borderRadius: "24px 24px 0 0", padding: "28px 24px 44px", animation: "slideUp 0.3s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏋️</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, letterSpacing: 1, marginBottom: 4 }}>You're at the gym!</div>
              <div style={{ color: "var(--text3)", fontSize: 13 }}>How long is your session today?</div>
            </div>

            {/* Session duration picker */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[
                { label: "30 min", value: 30, emoji: "⚡" },
                { label: "1 hour", value: 60, emoji: "🔥" },
                { label: "1.5 hrs", value: 90, emoji: "💪" },
                { label: "2 hours", value: 120, emoji: "🏆" },
              ].map(opt => (
                <div key={opt.value} onClick={() => setSessionDuration(opt.value)}
                  style={{ background: sessionDuration === opt.value ? "#080E18" : "var(--bg3)", border: `1.5px solid ${sessionDuration === opt.value ? "#FF6B00" : "var(--border)"}`, borderRadius: 16, padding: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{opt.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: sessionDuration === opt.value ? "#FF6B00" : "var(--text)" }}>{opt.label}</div>
                </div>
              ))}
            </div>

            {/* Gym shown */}
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>📍</span>
              <div>
                <div style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600 }}>Checking in at</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Equinox SoHo</div>
              </div>
            </div>

            {/* Streak/bonus hint */}
            <div style={{ background: "#1A0800", border: "1px solid #FF6B0030", borderRadius: 12, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🎁</span>
              <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>
                Stay <span style={{ color: "#FF6B00", fontWeight: 800 }}>30 minutes</span> to earn your daily streak <span style={{ color: "#FF6B00", fontWeight: 800 }}>+1 bonus compliment</span>. Auto check-out after {sessionDuration} min.
              </div>
            </div>

            <button className="btn-primary" onClick={() => {
              const now = Date.now();
              setCheckedIn(true);
              setGymSessionStart(now);
              setGymTimeElapsed(0);
              setSessionAutoCheckoutAt(now + sessionDuration * 60 * 1000);
              setShowCheckinSheet(false);
              showToast(ghostMode
                ? `👻 Checked in (ghost) · ${sessionDuration}min session`
                : `✅ Checked in! ${sessionDuration}min session · Stay 30 min to earn your streak 🔥`);
            }}>
              I'm Here · {sessionDuration} min session
            </button>
            <button onClick={() => setShowCheckinSheet(false)} style={{ width: "100%", background: "none", border: "none", color: "var(--text3)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "12px", marginTop: 4 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── CONFETTI OVERLAY ── */}
      {showConfetti && (() => {
        const pieces = Array.from({ length: 80 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 1.2,
          duration: 2.2 + Math.random() * 1.2,
          color: ["#FF6B00","#38E8A0","#A8D8F0","#FFD700","#FF69B4","#C41230","#ffffff"][Math.floor(Math.random() * 7)],
          size: 6 + Math.random() * 8,
          shape: Math.random() > 0.5 ? "50%" : "2px",
        }));
        return (
          <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998, overflow: "hidden" }}>
            {pieces.map(p => (
              <div key={p.id} className="confetti-piece" style={{
                left: `${p.left}%`,
                top: "-12px",
                width: p.size,
                height: p.size,
                background: p.color,
                borderRadius: p.shape,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }} />
            ))}
            <div style={{
              position: "absolute", top: "38%", left: "50%", transform: "translateX(-50%)",
              textAlign: "center", animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>👻✨</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2, color: "#fff", textShadow: "0 0 20px #FF6B00" }}>FROST+ UNLOCKED</div>
              <div style={{ color: "#38E8A0", fontSize: 13, fontWeight: 700, marginTop: 4 }}>Ghost mode & unlimited compliments are yours</div>
            </div>
          </div>
        );
      })()}

    </>
  );
}
