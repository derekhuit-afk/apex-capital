import { useState, useEffect, useRef, useMemo } from "react";
import {
  Check, Lock, BarChart3, Brain, Target, FileText, Database,
  BookOpen, Award, ChevronRight, ArrowRight, X, Menu,
  Bell, Zap, TrendingUp, TrendingDown, AlertCircle, Building2,
  Activity, Shield, Search, Download, RefreshCw, Filter,
  Globe, Phone, Mail, ExternalLink, Layers, Eye, EyeOff,
  CheckCircle, XCircle, Info, Send, User, Play, Clock,
  ChevronDown, LogOut, MapPin, DollarSign, Star, Users
} from "lucide-react";

/* ─── AI PROXY ─── */
const AI_URL = "/api/ai";
async function callAI(system, userMsg, history = []) {
  const messages = history.length > 0 ? [...history, { role: "user", content: userMsg }] : [{ role: "user", content: userMsg }];
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Unable to generate response.";
}

/* ─── TOKENS ─── */
const C = {
  bg: "#07090F", surface: "#0D1019", card: "#111620", card2: "#0C1018",
  border: "#192030", borderGold: "#7A5C10", borderBlue: "#1A3060",
  gold: "#C49A28", goldBright: "#E8BB44", goldMuted: "#6A4E10",
  text: "#DDE2EE", muted: "#58688A", dim: "#252F42", white: "#FFFFFF",
  success: "#38A870", successBg: "#0B1E14", successBorder: "#184832",
  warn: "#D48A28", warnBg: "#1A1206", warnBorder: "#382808",
  danger: "#C04848", dangerBg: "#1E0C0C", dangerBorder: "#401818",
  blue: "#4A90D9", blueDim: "#0E2040", blueBorder: "#1A4080",
  purple: "#7A6CD8", teal: "#3ABCAA", tealDim: "#0C2420", rose: "#D46080",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{background:${C.bg};color:${C.text};font-family:'DM Sans',sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${C.borderGold};border-radius:2px;}
  select option{background:${C.card};color:${C.text};}
  input,select,textarea{-webkit-appearance:none;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes pulse{0%,100%{opacity:.6;}50%{opacity:1;}}
  @keyframes shimmer{0%,100%{opacity:.7;}50%{opacity:1;}}
  @keyframes gridPan{from{background-position:0 0;}to{background-position:60px 60px;}}
  .au{animation:fadeUp .45s ease forwards;}.ai{animation:fadeIn .3s ease forwards;}
  @media(max-width:768px){.hide-mobile{display:none!important;}.sidebar-open{width:62px!important;}}
  @media(max-width:420px){.px-mobile{padding-left:16px!important;padding-right:16px!important;}}
`;

/* ─── DATA ─── */
const PROP_TYPES = ["Multifamily","Office","Retail","Industrial","Hotel","Mixed-Use","Self-Storage","Mobile Home Park"];
const LOAN_PURPOSES = ["Acquisition","Refinance","Cash-Out Refinance","Construction","Bridge/Value-Add","Ground-Up Development"];
const TIERS = {
  foundation: { id:"foundation", name:"FOUNDATION", price:"$2,995", period:"one-time", sub:"Lifetime access. No renewals.", features:["CRE AI MasterClass (5 modules)","Underwriting Calculator Suite","Deal Packager AI","Static Lender Guide (500+ lenders)","Lifetime access"], locked:["Live Lender Matching Engine","24/7 AI Advisor","Client Acquisition / ASE","Live Market Data"], cta:"Buy Lifetime Access" },
  active: { id:"active", name:"ACTIVE", price:"$249", period:"/mo", badge:"MOST POPULAR", sub:"Everything updated monthly.", features:["Everything in FOUNDATION","Live Lender Matching Engine","APEX Deal Quality Scoring","24/7 AI Advisor (Huit Brain)","Client Acquisition / ASE","Live Cap Rate + Market Data","1 user seat"], locked:["Team seats (5 users)","White-label reports","Agency branding"], cta:"Start Monthly Plan" },
  agency: { id:"agency", name:"AGENCY", price:"$999", period:"/mo", sub:"For teams and brokerages.", features:["Everything in ACTIVE","5 team seats","White-label deal packages","Branded client reports","Agency dashboard","Priority support"], locked:[], cta:"Start Agency Plan" },
};

const LENDERS = [
  { id:1,name:"Pinnacle National Bank",type:"National Bank",logo:"🏛",minLoan:500000,maxLoan:50000000,maxLTV:75,minDSCR:1.25,propTypes:["Multifamily","Office","Retail","Industrial","Mixed-Use"],markets:"Nationwide",rateRange:"6.25–7.50%",term:"5,7,10yr",amort:"25–30yr",contact:"cre@pinnaclenational.com",phone:"(800) 555-0110",specialty:"Agency multifamily, stabilized CRE" },
  { id:2,name:"Meridian Capital Group",type:"Debt Fund",logo:"💼",minLoan:2000000,maxLoan:75000000,maxLTV:80,minDSCR:1.20,propTypes:["Multifamily","Office","Hotel","Mixed-Use","Self-Storage"],markets:"Nationwide",rateRange:"7.00–9.50%",term:"2–5yr bridge",amort:"Interest only",contact:"deals@meridiancg.com",phone:"(212) 555-0142",specialty:"Bridge, value-add, transitional assets" },
  { id:3,name:"Pacific Life Lending",type:"Life Company",logo:"🏢",minLoan:5000000,maxLoan:200000000,maxLTV:65,minDSCR:1.30,propTypes:["Multifamily","Office","Industrial","Retail"],markets:"Top 50 MSAs",rateRange:"5.85–6.75%",term:"10,15,20yr",amort:"25–30yr",contact:"lending@pacificlife.com",phone:"(800) 555-0188",specialty:"Long-term fixed rate, core assets" },
  { id:4,name:"Atlas CMBS Conduit",type:"CMBS",logo:"📊",minLoan:3000000,maxLoan:100000000,maxLTV:75,minDSCR:1.25,propTypes:["Office","Retail","Hotel","Industrial","Multifamily"],markets:"Nationwide",rateRange:"6.50–7.25%",term:"10yr",amort:"30yr",contact:"originations@atlascmbs.com",phone:"(646) 555-0177",specialty:"CMBS/conduit, 10yr fixed non-recourse" },
  { id:5,name:"Northstar Credit Union",type:"Credit Union",logo:"🤝",minLoan:250000,maxLoan:10000000,maxLTV:80,minDSCR:1.20,propTypes:["Multifamily","Retail","Office","Mixed-Use"],markets:"AK, WA, OR, MT, ID",rateRange:"6.00–7.25%",term:"5,7yr",amort:"20–25yr",contact:"business@northstarccu.com",phone:"(907) 555-0190",specialty:"Alaska/Pacific NW, small-balance CRE" },
  { id:6,name:"Fortress Bridge Capital",type:"Bridge",logo:"⚡",minLoan:1000000,maxLoan:30000000,maxLTV:85,minDSCR:1.10,propTypes:["Multifamily","Office","Retail","Industrial","Hotel","Mixed-Use","Self-Storage"],markets:"Nationwide",rateRange:"9.00–12.50%",term:"12–36 months",amort:"Interest only",contact:"bridge@fortresscap.com",phone:"(310) 555-0133",specialty:"Fast close, value-add, ground-up" },
  { id:7,name:"Cascade Life Insurance",type:"Life Company",logo:"🏗",minLoan:10000000,maxLoan:500000000,maxLTV:60,minDSCR:1.35,propTypes:["Office","Industrial","Multifamily","Retail"],markets:"Top 25 MSAs",rateRange:"5.50–6.40%",term:"15,20,25yr",amort:"30yr",contact:"cre@cascadelife.com",phone:"(503) 555-0111",specialty:"Core trophy assets, ultra-long term" },
  { id:8,name:"Northern Lights Credit Union",type:"Credit Union",logo:"✨",minLoan:100000,maxLoan:5000000,maxLTV:80,minDSCR:1.15,propTypes:["Multifamily","Retail","Office","Mixed-Use"],markets:"AK, WA, MT",rateRange:"5.75–6.75%",term:"5,7yr",amort:"20yr",contact:"business@nlcu.org",phone:"(907) 555-0199",specialty:"Alaska-based, small balance, local relationships" },
  { id:9,name:"CoreVest Finance",type:"Debt Fund",logo:"🎯",minLoan:1000000,maxLoan:50000000,maxLTV:75,minDSCR:1.20,propTypes:["Multifamily","Self-Storage","Mobile Home Park","Industrial"],markets:"Nationwide",rateRange:"7.00–8.75%",term:"5,7yr",amort:"25–30yr",contact:"originations@corevest.com",phone:"(888) 555-0166",specialty:"SFR portfolios, small balance multifamily" },
  { id:10,name:"Apex Private Mortgage",type:"Bridge",logo:"🚀",minLoan:200000,maxLoan:10000000,maxLTV:90,minDSCR:1.00,propTypes:["Multifamily","Office","Retail","Industrial","Mixed-Use","Hotel","Self-Storage"],markets:"Nationwide",rateRange:"11.00–15.00%",term:"6–18 months",amort:"Interest only",contact:"fast@apexprivate.com",phone:"(800) 555-0100",specialty:"Any deal, any condition, 24hr approval" },
  { id:11,name:"Pacific Rim Capital",type:"Debt Fund",logo:"🌏",minLoan:3000000,maxLoan:100000000,maxLTV:75,minDSCR:1.20,propTypes:["Multifamily","Industrial","Office","Hotel","Mixed-Use"],markets:"CA, WA, OR, HI, AK",rateRange:"7.25–9.00%",term:"2–5yr",amort:"Interest only",contact:"west@pacificrimcap.com",phone:"(415) 555-0122",specialty:"West Coast, Pacific NW, Alaska deals" },
  { id:12,name:"Summit Community Bank",type:"Community Bank",logo:"🏘",minLoan:200000,maxLoan:8000000,maxLTV:80,minDSCR:1.20,propTypes:["Multifamily","Retail","Office","Mixed-Use","Self-Storage"],markets:"AK, MT, ID, WY",rateRange:"6.25–7.50%",term:"5,7,10yr",amort:"20–25yr",contact:"loans@summitcommunity.com",phone:"(406) 555-0145",specialty:"Mountain West, rural markets" },
];

const CAP_RATES = [
  {type:"Multifamily",q1:"5.2%",q2:"5.4%",q3:"5.6%",q4:"5.8%",ytd:"+0.6%"},
  {type:"Industrial",q1:"5.0%",q2:"5.1%",q3:"5.3%",q4:"5.4%",ytd:"+0.4%"},
  {type:"Office (Class A)",q1:"6.8%",q2:"7.2%",q3:"7.6%",q4:"8.0%",ytd:"+1.2%"},
  {type:"Retail",q1:"6.4%",q2:"6.5%",q3:"6.7%",q4:"6.8%",ytd:"+0.4%"},
  {type:"Self-Storage",q1:"5.8%",q2:"5.9%",q3:"6.0%",q4:"6.1%",ytd:"+0.3%"},
  {type:"Hotel",q1:"7.5%",q2:"7.6%",q3:"7.8%",q4:"8.0%",ytd:"+0.5%"},
];

const RATE_ENV = [
  {label:"10-Year Treasury",value:"4.42%",change:"+0.08%",up:true},
  {label:"SOFR 30-Day",value:"5.31%",change:"-0.02%",up:false},
  {label:"Prime Rate",value:"8.50%",change:"0.00%",up:null},
  {label:"CMBS 10yr Spread",value:"+185 bps",change:"+12 bps",up:true},
  {label:"CRE Avg All-In",value:"6.95%",change:"+0.14%",up:true},
];

const CRE_NEWS = [
  {headline:"Fed signals potential rate cuts in H2 2025 as CRE lending conditions ease",source:"Bloomberg",time:"2h ago",tag:"RATES",positive:true},
  {headline:"Multifamily cap rates in Sun Belt markets stabilize after 18-month expansion",source:"CoStar",time:"4h ago",tag:"MULTIFAMILY",positive:true},
  {headline:"Industrial vacancy hits 5-year high in major markets amid supply wave",source:"CBRE Research",time:"6h ago",tag:"INDUSTRIAL",positive:false},
  {headline:"Bridge lending volume up 22% YoY as value-add deals dominate",source:"Mortgage Bankers",time:"8h ago",tag:"LENDING",positive:true},
  {headline:"Alaska CRE fundamentals remain resilient; multifamily demand outpaces supply",source:"Alaska Real Estate Magazine",time:"1d ago",tag:"ALASKA",positive:true},
  {headline:"Life company allocations to CRE debt increase for third consecutive quarter",source:"ACLI",time:"1d ago",tag:"CAPITAL",positive:true},
  {headline:"CMBS issuance on pace for strongest year since 2021",source:"Trepp",time:"2d ago",tag:"CMBS",positive:true},
];

const MODULES = [
  {id:1,title:"CRE Foundations",subtitle:"The language, structure, and logic of commercial real estate",icon:"🏛",duration:"45 min",topics:["Property types & asset classes","How CRE deals are structured","Key market participants","CRE vs residential","Reading a deal from the outside in"],color:C.blue},
  {id:2,title:"Packaging a Deal",subtitle:"Build a lender-ready package that gets funded",icon:"📋",duration:"55 min",topics:["Executive memo structure","Financial summary formatting","What lenders look for first","Supporting document checklist","Common packaging mistakes"],color:C.gold},
  {id:3,title:"Lender Relationships",subtitle:"Who to call, how to pitch, and how to get funded",icon:"🤝",duration:"50 min",topics:["Lender appetite by type","How to cold approach a lender","Term sheet negotiation basics","Building a lender database"],color:C.teal},
  {id:4,title:"CRE Underwriting",subtitle:"Analyze any deal with confidence and precision",icon:"📊",duration:"65 min",topics:["NOI calculation walkthrough","Cap rate interpretation by market","DSCR: the lender's #1 metric","LTV vs LTC vs LTARV","Red flags in a deal package"],color:C.purple},
  {id:5,title:"Client Acquisition",subtitle:"Build deal flow from nothing using proven systems",icon:"🎯",duration:"60 min",topics:["Where CRE capital finders make money","HMDA data prospecting strategy","LinkedIn outbound for CRE","Converting a cold lead to a funded deal"],color:C.rose},
];

function calcAPEXScore({capRate,dscr,ltv,propType,purpose}) {
  let score=0; const factors=[];
  const cr=parseFloat(capRate)||0;
  if(cr>=7){score+=25;factors.push({name:"Cap Rate",score:25,max:25,grade:"A"});}
  else if(cr>=5.5){score+=18;factors.push({name:"Cap Rate",score:18,max:25,grade:"B"});}
  else if(cr>=4){score+=10;factors.push({name:"Cap Rate",score:10,max:25,grade:"C"});}
  else{score+=4;factors.push({name:"Cap Rate",score:4,max:25,grade:"D"});}
  const ds=parseFloat(dscr)||0;
  if(ds>=1.5){score+=30;factors.push({name:"DSCR Coverage",score:30,max:30,grade:"A"});}
  else if(ds>=1.25){score+=22;factors.push({name:"DSCR Coverage",score:22,max:30,grade:"B"});}
  else if(ds>=1.10){score+=12;factors.push({name:"DSCR Coverage",score:12,max:30,grade:"C"});}
  else{score+=3;factors.push({name:"DSCR Coverage",score:3,max:30,grade:"D"});}
  const lv=parseFloat(ltv)||0;
  if(lv<=60){score+=25;factors.push({name:"LTV Risk",score:25,max:25,grade:"A"});}
  else if(lv<=70){score+=18;factors.push({name:"LTV Risk",score:18,max:25,grade:"B"});}
  else if(lv<=80){score+=10;factors.push({name:"LTV Risk",score:10,max:25,grade:"C"});}
  else{score+=3;factors.push({name:"LTV Risk",score:3,max:25,grade:"D"});}
  const safeProp=["Industrial","Multifamily","Self-Storage"];
  if(safeProp.includes(propType)){score+=10;factors.push({name:"Property Class",score:10,max:10,grade:"A"});}
  else if(["Office","Mixed-Use","Retail"].includes(propType)){score+=6;factors.push({name:"Property Class",score:6,max:10,grade:"B"});}
  else{score+=3;factors.push({name:"Property Class",score:3,max:10,grade:"C"});}
  if(["Refinance","Acquisition"].includes(purpose)){score+=10;factors.push({name:"Loan Purpose",score:10,max:10,grade:"A"});}
  else if(["Cash-Out Refinance","Bridge/Value-Add"].includes(purpose)){score+=6;factors.push({name:"Loan Purpose",score:6,max:10,grade:"B"});}
  else{score+=2;factors.push({name:"Loan Purpose",score:2,max:10,grade:"C"});}
  const grade=score>=85?"A+":score>=75?"A":score>=65?"B+":score>=55?"B":score>=45?"C+":score>=35?"C":"D";
  return{score:Math.round(score),grade,factors};
}

function matchLenders({propType,loanAmt,ltv,dscr}) {
  const loan=parseFloat(loanAmt)||0,ltvN=parseFloat(ltv)||0,dscrN=parseFloat(dscr)||1.0;
  return LENDERS.map(l=>{
    let score=0;const reasons=[],flags=[];
    if(l.propTypes.includes(propType)){score+=30;reasons.push("Property type match");}
    else flags.push(`Does not lend on ${propType}`);
    if(loan>=l.minLoan&&loan<=l.maxLoan){score+=25;reasons.push("Loan amount in range");}
    else if(loan<l.minLoan)flags.push(`Min loan: $${(l.minLoan/1e6).toFixed(1)}M`);
    else flags.push(`Max loan: $${(l.maxLoan/1e6).toFixed(0)}M`);
    if(ltvN<=l.maxLTV){score+=25;reasons.push(`LTV within ${l.maxLTV}% max`);}
    else flags.push(`LTV exceeds their ${l.maxLTV}% max`);
    if(dscrN>=l.minDSCR){score+=20;reasons.push(`DSCR above ${l.minDSCR}x floor`);}
    else flags.push(`DSCR below ${l.minDSCR}x minimum`);
    if(l.markets==="Nationwide")score+=5;
    return{...l,matchScore:Math.min(score,100),reasons,flags,eligible:score>=60};
  }).sort((a,b)=>b.matchScore-a.matchScore);
}

/* ─── APP ROOT ─── */
export default function App() {
  const [view, setView] = useState("landing");
  const [selectedTier, setSelectedTier] = useState(null);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = FONTS;
    document.head.appendChild(s);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => { document.head.removeChild(s); window.removeEventListener("scroll", onScroll); };
  }, []);

  const go = (v) => { setView(v); window.scrollTo(0,0); };
  const openCheckout = (tid) => { setSelectedTier(tid); go("checkout"); };
  const openDash = (u) => { setUser(u); go("dashboard"); };

  if (view === "checkout") return <Checkout tier={TIERS[selectedTier]} onBack={()=>go("landing")} onSuccess={openDash} />;
  if (view === "login") return <Login onBack={()=>go("landing")} onSuccess={openDash} />;
  if (view === "dashboard") return <Dashboard user={user} onLogout={()=>go("landing")} />;

  return (
    <div style={{minHeight:"100vh",background:C.bg,overflowX:"hidden"}}>
      <LandingNav scrolled={scrolled} onLogin={()=>go("login")} onCTA={()=>openCheckout("active")} />
      <Hero onCTA={()=>openCheckout("active")} onLearn={()=>document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"})} />
      <StatsBar />
      <Modules />
      <Pricing onSelect={openCheckout} />
      <CtaBanner onCTA={()=>openCheckout("active")} />
      <Footer />
    </div>
  );
}

/* ─── LANDING NAV ─── */
function LandingNav({scrolled,onLogin,onCTA}) {
  return (
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:scrolled?"rgba(7,9,15,.97)":"transparent",borderBottom:scrolled?`1px solid ${C.border}`:"none",backdropFilter:scrolled?"blur(12px)":"none",transition:"all .3s",padding:"0 24px"}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:68}}>
        <Logo />
        <div className="hide-mobile" style={{display:"flex",alignItems:"center",gap:28}}>
          {["Platform","Pricing","Lenders","Resources"].map(l=>(
            <a key={l} href="#" style={{color:C.muted,fontSize:14,textDecoration:"none",transition:"color .2s"}} onMouseEnter={e=>e.target.style.color=C.text} onMouseLeave={e=>e.target.style.color=C.muted}>{l}</a>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onLogin} style={btnOutline}>Sign In</button>
          <button onClick={()=>document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"})} style={btnGold}>Get Started</button>
        </div>
      </div>
    </nav>
  );
}

/* ─── HERO ─── */
function Hero({onCTA,onLearn}) {
  return (
    <section style={{position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",paddingTop:68}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${C.border} 1px, transparent 1px),linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,backgroundSize:"60px 60px",opacity:.22}}/>
      <div style={{position:"absolute",top:"35%",left:"50%",transform:"translate(-50%,-50%)",width:700,height:700,background:`radial-gradient(circle, ${C.goldMuted}1E 0%, transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:2,textAlign:"center",maxWidth:880,padding:"0 24px",animation:"fadeUp .9s ease forwards"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${C.goldMuted}2A`,border:`1px solid ${C.borderGold}`,borderRadius:100,padding:"6px 18px",marginBottom:32}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:C.goldBright,animation:"shimmer 2s infinite"}}/>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.gold,letterSpacing:".12em",textTransform:"uppercase"}}>Powered by Huit.AI · Built From Alaska</span>
        </div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(44px,7vw,82px)",fontWeight:600,lineHeight:1.05,color:C.white,marginBottom:24}}>
          The Intelligence Layer<br/>
          <span style={{background:`linear-gradient(135deg, ${C.gold}, ${C.goldBright})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>for CRE Capital</span>
        </h1>
        <p style={{fontSize:"clamp(16px,2vw,20px)",color:C.muted,lineHeight:1.7,maxWidth:620,margin:"0 auto 40px",fontWeight:300}}>
          AI-powered deal packaging, lender matching, underwriting tools, and client acquisition — built for every CRE professional.
        </p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={onCTA} style={{...btnGold,fontSize:16,padding:"14px 36px",display:"flex",alignItems:"center",gap:10}}>Start for $249/mo <ArrowRight size={18}/></button>
          <button onClick={onLearn} style={{...btnOutline,fontSize:16,padding:"14px 36px"}}>See Pricing</button>
        </div>
        <p style={{marginTop:18,color:C.dim,fontSize:13}}>Or lifetime access for $2,995 · No free trial · Cancel monthly anytime</p>
      </div>
      <div style={{position:"absolute",bottom:36,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
        <span style={{color:C.dim,fontSize:10,letterSpacing:".1em",textTransform:"uppercase"}}>Explore</span>
        <ChevronDown size={14} color={C.dim}/>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <div style={{borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,background:C.surface,padding:"28px 24px"}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:24}}>
        {[["500+","Active CRE Lenders"],["$2.4B+","Deals Packaged"],["6","AI-Powered Tools"],["24/7","AI Advisor Access"]].map(([v,l])=>(
          <div key={l} style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:38,fontWeight:600,color:C.goldBright}}>{v}</div>
            <div style={{fontSize:13,color:C.muted,marginTop:4}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Modules() {
  const items = [
    {icon:BookOpen,title:"CRE AI MasterClass",desc:"5-module interactive AI training: deal fundamentals, packaging, lender relationships, and capital markets.",tier:"all"},
    {icon:BarChart3,title:"Underwriting Suite",desc:"NOI, Cap Rate, DSCR, LTV, Cash-on-Cash, IRR — 6 live calculators built for CRE deal analysis.",tier:"all"},
    {icon:FileText,title:"Deal Packager AI",desc:"Input deal parameters and get a fully formatted, lender-ready executive memo with APEX score in seconds.",tier:"all"},
    {icon:Database,title:"Lender Intelligence Engine",desc:"AI-powered matching against 500+ active CRE lenders — banks, life cos, debt funds, CMBS, and bridge.",tier:"active"},
    {icon:Target,title:"Client Acquisition Engine",desc:"HMDA-powered prospecting. ASE automation delivers qualified CRE borrower leads to your pipeline.",tier:"active"},
    {icon:Brain,title:"24/7 AI Advisor",desc:"Powered by Huit Brain. Ask anything about your deal, market conditions, lender appetite, or CRE strategy.",tier:"active"},
  ];
  return (
    <section style={{padding:"100px 24px",maxWidth:1200,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:64}}>
        <Pill>Platform</Pill>
        <h2 style={H2}>Six Tools. One Platform.<br/><span style={GoldGrad}>Every CRE Professional Covered.</span></h2>
        <p style={{fontSize:16,color:C.muted,maxWidth:560,margin:"16px auto 0",lineHeight:1.7}}>From beginner CRE broker to 8-figure brokerage — HyCRE replaces courses, spreadsheets, and manual research.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:22}}>
        {items.map((m,i)=>{
          const [hov,setHov]=useState(false);
          return (
            <div key={i} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:hov?C.card:C.surface,border:`1px solid ${hov?C.borderGold:C.border}`,borderRadius:12,padding:28,transition:"all .25s"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
                <div style={{width:44,height:44,background:`${C.goldMuted}2A`,border:`1px solid ${C.borderGold}`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><m.icon size={20} color={C.gold}/></div>
                <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",letterSpacing:".1em",padding:"3px 9px",borderRadius:4,background:m.tier==="all"?"#0D2218":`${C.goldMuted}2A`,color:m.tier==="all"?C.success:C.gold,border:`1px solid ${m.tier==="all"?"#1A4030":C.borderGold}`}}>{m.tier==="all"?"ALL TIERS":"ACTIVE+"}</span>
              </div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:C.white,marginBottom:10}}>{m.title}</h3>
              <p style={{fontSize:14,color:C.muted,lineHeight:1.65}}>{m.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Pricing({onSelect}) {
  return (
    <section id="pricing" style={{padding:"100px 24px",background:C.surface}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:64}}>
          <Pill>Pricing</Pill>
          <h2 style={H2}>Start Learning. Start Closing.<br/><span style={GoldGrad}>Choose Your Plan.</span></h2>
          <p style={{fontSize:16,color:C.muted,maxWidth:560,margin:"16px auto 0",lineHeight:1.7}}>One closed CRE deal pays for years of access. Their $2,995 course teaches you how. HyCRE does it for you.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:22,alignItems:"start"}}>
          {Object.values(TIERS).map(t=>{
            const [hov,setHov]=useState(false);
            return (
              <div key={t.id} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{position:"relative",background:t.id==="active"?`linear-gradient(160deg, #0F1520, #131825)`:C.card,border:`1px solid ${t.id==="active"||hov?C.borderGold:C.border}`,borderRadius:16,padding:32,transition:"all .3s",boxShadow:t.id==="active"?`0 0 50px ${C.goldMuted}2A`:"none"}}>
                {t.badge&&<div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(90deg, ${C.gold}, ${C.goldBright})`,color:C.bg,fontSize:9,fontWeight:600,letterSpacing:".14em",padding:"4px 14px",borderRadius:100,whiteSpace:"nowrap"}}>{t.badge}</div>}
                <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:".14em",color:t.id==="agency"?"#E8C060":t.id==="active"?C.gold:C.muted}}>{t.name}</span>
                <div style={{display:"flex",alignItems:"flex-end",gap:4,margin:"8px 0"}}>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:52,fontWeight:700,color:C.white,lineHeight:1}}>{t.price}</span>
                  <span style={{color:C.muted,fontSize:14,marginBottom:8}}>{t.period}</span>
                </div>
                <p style={{fontSize:13,color:C.muted,marginBottom:24}}>{t.sub}</p>
                <button onClick={()=>onSelect(t.id)} style={{width:"100%",padding:"12px 0",borderRadius:8,border:`1px solid ${t.id==="active"?"transparent":C.borderGold}`,background:t.id==="active"?`linear-gradient(90deg, ${C.gold}, ${C.goldBright})`:"transparent",color:t.id==="active"?C.bg:C.gold,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:24,transition:"all .2s"}}>{t.cta}</button>
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:22}}>
                  {t.features.map((f,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:11}}><Check size={13} color={C.success} style={{marginTop:2,flexShrink:0}}/><span style={{fontSize:13,color:C.text}}>{f}</span></div>)}
                  {t.locked?.map((f,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:11,opacity:.4}}><Lock size={13} color={C.muted} style={{marginTop:2,flexShrink:0}}/><span style={{fontSize:13,color:C.muted}}>{f}</span></div>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CtaBanner({onCTA}) {
  return (
    <section style={{padding:"80px 24px",borderTop:`1px solid ${C.border}`}}>
      <div style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,5vw,52px)",fontWeight:600,color:C.white,marginBottom:20}}>One Deal Pays for<br/><span style={GoldGrad}>Years of Access.</span></h2>
        <p style={{fontSize:17,color:C.muted,marginBottom:40,lineHeight:1.7}}>Their $2,995 course teaches you how. HyCRE does it for you — with AI that underwrites, matches lenders, and closes deals in real time.</p>
        <button onClick={onCTA} style={{...btnGold,fontSize:17,padding:"16px 44px",display:"inline-flex",alignItems:"center",gap:10}}>Get Started Today <ArrowRight size={18}/></button>
        <p style={{marginTop:14,color:C.dim,fontSize:13}}>No free trial · Secure checkout · Cancel monthly anytime</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{borderTop:`1px solid ${C.border}`,padding:"36px 24px",background:C.bg}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
        <Logo/>
        <p style={{fontSize:12,color:C.dim}}>© 2025 HyCRE.ai · A Huit.AI Product · Built From Alaska.</p>
        <div style={{display:"flex",gap:20}}>{["Privacy","Terms","Support"].map(l=><a key={l} href="#" style={{fontSize:12,color:C.dim,textDecoration:"none"}}>{l}</a>)}</div>
      </div>
    </footer>
  );
}

/* ─── CHECKOUT ─── */
/* ─── TOS / PRIVACY MODAL ─── */
function LegalModal({type, onClose}) {
  const isTOS = type === "tos";
  const title = isTOS ? "Terms of Service" : "Privacy Policy";
  const effective = "April 14, 2026";
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",backdropFilter:"blur(6px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,maxWidth:620,width:"100%",maxHeight:"82vh",display:"flex",flexDirection:"column",animation:"fadeUp .3s ease"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:C.white}}>{title}</h3>
            <p style={{fontSize:11,color:C.muted,marginTop:2}}>HyCRE.ai · Effective {effective}</p>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:4}}><X size={18}/></button>
        </div>
        <div style={{overflow:"auto",padding:"20px 24px",fontSize:13,color:C.muted,lineHeight:1.8}}>
          {isTOS ? (
            <>
              <Section t="1. Acceptance of Terms">By accessing or using HyCRE.ai ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. HyCRE.ai is operated by Huit.AI, Inc. ("Company," "we," "us").</Section>
              <Section t="2. Description of Service">HyCRE.ai provides AI-powered commercial real estate capital intelligence tools including deal packaging, lender matching, underwriting calculators, HMDA-based prospecting, market data, and educational content. The Service is provided on a subscription basis.</Section>
              <Section t="3. Subscription & Payment">Subscriptions are billed in advance. The FOUNDATION plan is a one-time payment of $2,995 for lifetime access to specified features. ACTIVE ($249/mo) and AGENCY ($999/mo) plans are billed monthly and may be cancelled at any time. All payments are processed through ZenoPay. All sales are final. No refunds are provided for partial billing periods.</Section>
              <Section t="4. Acceptable Use">You agree not to: (a) use the Service for unlawful purposes; (b) attempt to reverse engineer or extract source code; (c) resell or redistribute the Service without written authorization; (d) use AI-generated outputs as professional legal, financial, or investment advice without independent verification.</Section>
              <Section t="5. AI-Generated Content Disclaimer">HyCRE.ai uses artificial intelligence to generate deal memos, lender matches, market analysis, and educational content. All AI-generated outputs are for informational purposes only and do not constitute legal, financial, investment, or professional advice. You are solely responsible for decisions made based on outputs from this Service.</Section>
              <Section t="6. No Guarantee of Loan Approval">HyCRE.ai does not guarantee loan approval, funding, or any specific financial outcome. Lender matching and deal scoring are algorithmic estimates. All financing decisions are made solely by independent lenders.</Section>
              <Section t="7. HMDA Data Usage">Our prospecting tools use publicly available HMDA (Home Mortgage Disclosure Act) data. Users are responsible for ensuring their outreach and marketing activities comply with all applicable federal and state laws, including the Fair Housing Act, Equal Credit Opportunity Act, and CAN-SPAM Act.</Section>
              <Section t="8. Intellectual Property">All content, software, and tools on HyCRE.ai are owned by Huit.AI, Inc. or its licensors. The APEX scoring algorithm, TLS engine, and STDA methodology are patent-pending under USPTO Case No. TPS97949.</Section>
              <Section t="9. Limitation of Liability">TO THE MAXIMUM EXTENT PERMITTED BY LAW, HUIT.AI, INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNTS PAID BY YOU IN THE PRIOR 12 MONTHS.</Section>
              <Section t="10. Termination">We reserve the right to suspend or terminate your account for violation of these Terms. You may cancel your subscription at any time through your account settings.</Section>
              <Section t="11. Governing Law">These Terms are governed by the laws of the State of Alaska, United States. Disputes shall be resolved by binding arbitration in Anchorage, Alaska.</Section>
              <Section t="12. Changes to Terms">We may update these Terms at any time. Continued use of the Service constitutes acceptance of the updated Terms. Material changes will be communicated by email.</Section>
              <Section t="13. Contact">For questions about these Terms, contact: legal@hycre.ai | Huit.AI, Inc. | Anchorage, Alaska</Section>
            </>
          ) : (
            <>
              <Section t="1. Information We Collect">We collect: (a) Account information (name, email, password hash); (b) Payment information processed securely through ZenoPay (we do not store raw card data); (c) Usage data (features accessed, deals packaged, searches performed); (d) Communications you send us.</Section>
              <Section t="2. How We Use Your Information">We use your information to: provide and improve the Service; send transactional emails (receipts, password resets, account notifications); send product updates and marketing communications (you may opt out); comply with legal obligations; detect and prevent fraud.</Section>
              <Section t="3. Data Sharing">We do not sell your personal data. We share data only with: (a) ZenoPay for payment processing; (b) Anthropic for AI model inference (no personal data retained per Anthropic's API terms); (c) Service providers under confidentiality agreements; (d) Law enforcement when required by law.</Section>
              <Section t="4. HMDA & Third-Party Data">Our prospecting tools use publicly available HMDA data published by the Consumer Financial Protection Bureau (CFPB). We do not sell or redistribute this data. Users are responsible for compliant use of prospecting outputs.</Section>
              <Section t="5. Data Security">We use industry-standard security measures including TLS encryption, encrypted database storage, and access controls. However, no method of transmission over the internet is 100% secure.</Section>
              <Section t="6. Data Retention">We retain your account data while your account is active and for 3 years after termination for legal and business purposes. You may request deletion of your data by emailing privacy@hycre.ai.</Section>
              <Section t="7. Your Rights">Depending on your jurisdiction, you may have rights to: access, correct, or delete your personal data; opt out of marketing communications; data portability; lodge a complaint with a supervisory authority.</Section>
              <Section t="8. Cookies">We use essential cookies for authentication and session management. We do not use tracking or advertising cookies. You may disable cookies in your browser settings.</Section>
              <Section t="9. Children's Privacy">HyCRE.ai is not directed to individuals under 18. We do not knowingly collect personal information from minors.</Section>
              <Section t="10. Contact">For privacy inquiries or data requests: privacy@hycre.ai | Huit.AI, Inc. | Anchorage, Alaska</Section>
            </>
          )}
        </div>
        <div style={{padding:"14px 24px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <button onClick={onClose} style={{...btnGold,width:"100%",padding:"11px 0",fontSize:14}}>I've Read This — Close</button>
        </div>
      </div>
    </div>
  );
}
function Section({t,children}){return<div style={{marginBottom:18}}><p style={{color:C.text,fontWeight:600,marginBottom:4}}>{t}</p><p>{children}</p></div>;}

/* ─── CHECKOUT ─── */
function Checkout({tier,onBack,onSuccess}) {
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({name:"",email:"",card:"",exp:"",cvv:""});
  const [tosAccepted,setTosAccepted]=useState(false);
  const [showCvv,setShowCvv]=useState(false);
  const [loading,setLoading]=useState(false);
  const [errors,setErrors]=useState({});
  const [legalModal,setLegalModal]=useState(null);
  const [payError,setPayError]=useState("");
  const f=k=>v=>setForm(p=>({...p,[k]:v}));

  const validate=()=>{
    const e={};
    if(!form.name.trim())e.name="Required";
    if(!form.email.includes("@"))e.email="Valid email required";
    if(step===1&&!tosAccepted)e.tos="You must accept the Terms of Service and Privacy Policy to continue";
    if(step===2){if(form.card.replace(/\s/g,"").length<16)e.card="Valid card required";if(!form.exp.match(/^\d{2}\/\d{2}$/))e.exp="MM/YY";if(form.cvv.length<3)e.cvv="3-4 digits";}
    setErrors(e);return Object.keys(e).length===0;
  };

  const next=async()=>{
    if(!validate())return;
    if(step===1){setStep(2);return;}
    setLoading(true);setPayError("");
    try {
      // Process payment via ZenoPay
      const res = await fetch("/api/payment", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({tier:tier.id,name:form.name,email:form.email,amount:tier.price,period:tier.period,card:form.card,exp:form.exp,cvv:form.cvv})
      });
      const data = await res.json();
      if(!res.ok||!data.success){setPayError(data.error||"Payment failed. Please check your card details.");setLoading(false);return;}
      // Notify admin of new signup
      await fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"new_signup",name:form.name,email:form.email,tier:tier.id,amount:`${tier.price}${tier.period}`})});
      setStep(3);
    } catch(err){
      setPayError("Connection error. Please try again.");
    }
    setLoading(false);
  };

  if(step===3) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      {legalModal&&<LegalModal type={legalModal} onClose={()=>setLegalModal(null)}/>}
      <div style={{background:C.surface,border:`1px solid ${C.borderGold}`,borderRadius:20,padding:52,textAlign:"center",maxWidth:460,width:"100%",animation:"fadeUp .5s ease"}}>
        <div style={{width:68,height:68,borderRadius:"50%",background:C.successBg,border:`2px solid ${C.success}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><Check size={30} color={C.success}/></div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:600,color:C.white,marginBottom:10}}>You're In.</h2>
        <p style={{color:C.muted,marginBottom:6}}>Welcome to HyCRE, <strong style={{color:C.text}}>{form.name}</strong>.</p>
        <p style={{color:C.muted,marginBottom:32,fontSize:13}}>Confirmation sent to {form.email}</p>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:18,marginBottom:28,textAlign:"left"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:C.muted}}>Plan</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.gold}}>{tier.name}</span></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.muted}}>Amount</span><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:C.goldBright,fontWeight:600}}>{tier.price}{tier.period}</span></div>
        </div>
        <button onClick={()=>onSuccess({name:form.name,email:form.email,tier:tier.id})} style={{...btnGold,width:"100%",padding:"13px 0",fontSize:15}}>Enter Dashboard →</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,padding:24}}>
      {legalModal&&<LegalModal type={legalModal} onClose={()=>setLegalModal(null)}/>}
      <div style={{maxWidth:960,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0 40px"}}><Logo/><button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}><X size={15}/>Cancel</button></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:32,alignItems:"start"}}>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:36}}>
            <div style={{display:"flex",gap:8,marginBottom:32}}>
              {["Account","Payment"].map((s,i)=>(
                <div key={s} style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:step>i+1?C.success:step===i+1?C.gold:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:step>=i+1?C.bg:C.muted}}>{step>i+1?<Check size={12}/>:i+1}</div>
                  <span style={{fontSize:13,color:step===i+1?C.text:C.muted}}>{s}</span>
                  {i===0&&<ChevronRight size={13} color={C.dim}/>}
                </div>
              ))}
            </div>
            {step===1&&<div className="ai">
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:C.white,marginBottom:22}}>Create Your Account</h3>
              <FI label="Full Name" val={form.name} set={f("name")} ph="Your Name" err={errors.name}/>
              <FI label="Email Address" val={form.email} set={f("email")} ph="you@example.com" err={errors.email}/>
              {/* TOS Acceptance */}
              <div style={{marginTop:20,padding:16,background:C.card,borderRadius:10,border:`1px solid ${errors.tos?C.danger:tosAccepted?C.successBorder:C.border}`,transition:"border-color .2s"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}} onClick={()=>setTosAccepted(s=>!s)}>
                  <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${tosAccepted?C.success:C.muted}`,background:tosAccepted?C.success:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all .2s"}}>
                    {tosAccepted&&<Check size={11} color={C.bg}/>}
                  </div>
                  <p style={{fontSize:12,color:C.muted,lineHeight:1.6,userSelect:"none"}}>
                    I have read and agree to HyCRE.ai's{" "}
                    <span onClick={e=>{e.stopPropagation();setLegalModal("tos");}} style={{color:C.gold,cursor:"pointer",textDecoration:"underline"}}>Terms of Service</span>
                    {" "}and{" "}
                    <span onClick={e=>{e.stopPropagation();setLegalModal("pp");}} style={{color:C.gold,cursor:"pointer",textDecoration:"underline"}}>Privacy Policy</span>.
                    I understand that AI-generated outputs are for informational purposes only and do not constitute professional financial or legal advice.
                  </p>
                </div>
              </div>
              {errors.tos&&<p style={{fontSize:11,color:C.danger,marginTop:6}}>{errors.tos}</p>}
            </div>}
            {step===2&&<div className="ai">
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:C.white,marginBottom:6}}>Payment Details</h3>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:18}}>
                <div style={{width:18,height:18,background:`${C.goldMuted}33`,border:`1px solid ${C.borderGold}`,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,color:C.gold,fontFamily:"'DM Mono',monospace"}}>ZP</span></div>
                <span style={{fontSize:11,color:C.muted}}>Processed securely by <span style={{color:C.gold}}>ZenoPay.ai</span></span>
              </div>
              <FI label="Card Number" val={form.card} set={v=>{const d=v.replace(/\D/g,"").slice(0,16);setForm(p=>({...p,card:d.replace(/(\d{4})(?=\d)/g,"$1 ")}));}} ph="4242 4242 4242 4242" err={errors.card} mono/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <FI label="Expiry" val={form.exp} set={v=>{let d=v.replace(/\D/g,"").slice(0,4);if(d.length>=2)d=d.slice(0,2)+"/"+d.slice(2);setForm(p=>({...p,exp:d}));}} ph="MM/YY" err={errors.exp}/>
                <FI label="CVV" val={form.cvv} set={v=>setForm(p=>({...p,cvv:v.replace(/\D/g,"").slice(0,4)}))} ph="123" type={showCvv?"text":"password"} err={errors.cvv} suffix={<button type="button" onClick={()=>setShowCvv(s=>!s)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:0}}>{showCvv?<EyeOff size={13}/>:<Eye size={13}/>}</button>}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}><Shield size={13} color={C.success}/><span style={{fontSize:11,color:C.muted}}>256-bit SSL · PCI DSS compliant · Powered by ZenoPay.ai</span></div>
              {payError&&<div style={{marginTop:12,padding:"10px 14px",background:C.dangerBg,border:`1px solid ${C.dangerBorder}`,borderRadius:8,fontSize:12,color:C.danger}}>{payError}</div>}
            </div>}
            <button onClick={next} disabled={loading} style={{...btnGold,width:"100%",padding:"13px 0",fontSize:15,marginTop:24,display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:loading?.7:1}}>
              {loading?<><div style={{width:14,height:14,border:`2px solid ${C.bg}55`,borderTopColor:C.bg,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>Processing...</>
              :<>{step===1?"Continue to Payment":`Pay ${tier.price}${tier.period}`}<ArrowRight size={17}/></>}
            </button>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.borderGold}`,borderRadius:14,padding:24,position:"sticky",top:24}}>
            <h4 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:C.white,marginBottom:18}}>Order Summary</h4>
            <div style={{background:C.surface,borderRadius:10,padding:14,marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,color:C.muted}}>Plan</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.gold}}>{tier.name}</span></div>
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginTop:10,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:14,fontWeight:600,color:C.text}}>Total</span>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:C.goldBright}}>{tier.price}</span>
              </div>
            </div>
            {tier.features.slice(0,4).map((feat,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8}}><Check size={11} color={C.success} style={{marginTop:2,flexShrink:0}}/><span style={{fontSize:11,color:C.muted}}>{feat}</span></div>)}
            <div style={{marginTop:16,padding:"10px 12px",background:`${C.goldMuted}11`,borderRadius:7,border:`1px solid ${C.borderGold}`}}>
              <p style={{fontSize:10,color:C.muted,lineHeight:1.5}}>By completing purchase you confirm acceptance of our <span style={{color:C.gold}}>Terms of Service</span> and <span style={{color:C.gold}}>Privacy Policy</span>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── LOGIN ─── */
function Login({onBack,onSuccess}) {
  const [form,setForm]=useState({email:"",password:""});
  const [showPw,setShowPw]=useState(false);
  const [loading,setLoading]=useState(false);
  const [mode,setMode]=useState("login"); // login | reset
  const [resetSent,setResetSent]=useState(false);
  const [resetEmail,setResetEmail]=useState("");
  const [legalModal,setLegalModal]=useState(null);

  const handle=()=>{
    if(!form.email||!form.password)return;
    setLoading(true);
    setTimeout(()=>{setLoading(false);onSuccess({name:"User",email:form.email,tier:"active"});},1400);
  };

  const sendReset=async()=>{
    if(!resetEmail.includes("@"))return;
    setLoading(true);
    await fetch("/api/reset-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:resetEmail})});
    setLoading(false);setResetSent(true);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
      {legalModal&&<LegalModal type={legalModal} onClose={()=>setLegalModal(null)}/>}
      <div style={{padding:"20px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}><Logo/><button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}><X size={14}/>Back</button></div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{width:"100%",maxWidth:380,background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:38,animation:"fadeUp .5s ease"}}>
          {mode==="reset" ? (
            <>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{width:46,height:46,background:`${C.goldMuted}22`,border:`1px solid ${C.borderGold}`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><Shield size={19} color={C.gold}/></div>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:600,color:C.white}}>Reset Password</h2>
                <p style={{fontSize:12,color:C.muted,marginTop:4}}>Enter your email and we'll send a reset link</p>
              </div>
              {resetSent ? (
                <div style={{background:C.successBg,border:`1px solid ${C.successBorder}`,borderRadius:10,padding:18,textAlign:"center"}}>
                  <p style={{color:C.success,fontSize:14,marginBottom:6}}>✓ Reset link sent</p>
                  <p style={{color:C.muted,fontSize:12}}>Check your inbox at {resetEmail}</p>
                </div>
              ) : (
                <>
                  <FI label="Email Address" val={resetEmail} set={setResetEmail} ph="you@example.com"/>
                  <button onClick={sendReset} disabled={loading} style={{...btnGold,width:"100%",padding:"11px 0",fontSize:14,marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    {loading?<><div style={{width:13,height:13,border:`2px solid ${C.bg}55`,borderTopColor:C.bg,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>Sending...</>:"Send Reset Link"}
                  </button>
                </>
              )}
              <p style={{textAlign:"center",marginTop:16,fontSize:12,color:C.muted,cursor:"pointer"}} onClick={()=>{setMode("login");setResetSent(false);}}>← Back to Sign In</p>
            </>
          ) : (
            <>
              <div style={{textAlign:"center",marginBottom:28}}>
                <div style={{width:48,height:48,background:`${C.goldMuted}22`,border:`1px solid ${C.borderGold}`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><Shield size={20} color={C.gold}/></div>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,color:C.white}}>Sign In</h2>
                <p style={{fontSize:13,color:C.muted,marginTop:4}}>Access your HyCRE dashboard</p>
              </div>
              <FI label="Email" val={form.email} set={v=>setForm(p=>({...p,email:v}))} ph="you@example.com"/>
              <FI label="Password" val={form.password} set={v=>setForm(p=>({...p,password:v}))} ph="••••••••" type={showPw?"text":"password"} suffix={<button type="button" onClick={()=>setShowPw(s=>!s)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:0}}>{showPw?<EyeOff size={13}/>:<Eye size={13}/>}</button>}/>
              <div style={{textAlign:"right",marginBottom:16,marginTop:-6}}>
                <span onClick={()=>setMode("reset")} style={{fontSize:11,color:C.gold,cursor:"pointer"}}>Forgot password?</span>
              </div>
              <button onClick={handle} disabled={loading} style={{...btnGold,width:"100%",padding:"12px 0",fontSize:14}}>{loading?"Signing In...":"Sign In"}</button>
              <div style={{marginTop:20,padding:"12px 14px",background:C.card,borderRadius:8,border:`1px solid ${C.border}`}}>
                <p style={{fontSize:11,color:C.muted,textAlign:"center",lineHeight:1.6}}>
                  By signing in you agree to our{" "}
                  <span onClick={()=>setLegalModal("tos")} style={{color:C.gold,cursor:"pointer"}}>Terms of Service</span>
                  {" "}and{" "}
                  <span onClick={()=>setLegalModal("pp")} style={{color:C.gold,cursor:"pointer"}}>Privacy Policy</span>
                </p>
              </div>
              <p style={{textAlign:"center",marginTop:16,fontSize:12,color:C.muted}}>No account? <span style={{color:C.gold,cursor:"pointer"}} onClick={onBack}>Get started →</span></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ─── */
const DASH_NAV = [
  {id:"home",icon:BarChart3,label:"Dashboard"},
  {id:"advisor",icon:Brain,label:"Huit Brain AI",badge:"AI",color:C.blue},
  {id:"masterclass",icon:BookOpen,label:"MasterClass",badge:"NEW"},
  {id:"market",icon:Activity,label:"Market Intel",badge:"LIVE",color:C.teal},
  {id:"prospecting",icon:Target,label:"HMDA Prospecting",badge:"NEW"},
  {id:"packager",icon:FileText,label:"Deal Packager"},
  {id:"underwriting",icon:BarChart3,label:"Underwriting Suite"},
  {id:"lenders",icon:Database,label:"Lender Engine"},
  {id:"apex",icon:Award,label:"APEX Scoring"},
  {id:"course",icon:BookOpen,label:"MasterClass Modules"},
];

function Dashboard({user,onLogout}) {
  const [active,setActive]=useState("home");
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const isPro=user?.tier==="active"||user?.tier==="agency";

  return (
    <div style={{display:"flex",height:"100vh",background:C.bg,overflow:"hidden"}}>
      <aside style={{width:sidebarOpen?248:62,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",transition:"width .25s ease",flexShrink:0,overflow:"hidden"}}>
        <div style={{padding:sidebarOpen?"18px 16px 14px":"18px 14px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          {sidebarOpen?<Logo/>:<LogoIcon/>}
          <button onClick={()=>setSidebarOpen(s=>!s)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:4}}><Menu size={14}/></button>
        </div>
        <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
          {sidebarOpen&&<div style={{fontSize:9,fontFamily:"'DM Mono',monospace",letterSpacing:".12em",color:C.blue,padding:"8px 8px 4px",textTransform:"uppercase"}}>Phase 3 — Live</div>}
          {DASH_NAV.slice(0,5).map(n=><SideBtn key={n.id} n={n} active={active===n.id} open={sidebarOpen} onClick={()=>setActive(n.id)}/>)}
          {sidebarOpen&&<div style={{fontSize:9,fontFamily:"'DM Mono',monospace",letterSpacing:".12em",color:C.muted,padding:"10px 8px 4px",textTransform:"uppercase"}}>Tools</div>}
          {DASH_NAV.slice(5).map(n=><SideBtn key={n.id} n={n} active={active===n.id} open={sidebarOpen} onClick={()=>setActive(n.id)}/>)}
        </nav>
        {sidebarOpen&&(
          <div style={{padding:"12px 14px",borderTop:`1px solid ${C.border}`}}>
            <div style={{background:`${C.goldMuted}18`,border:`1px solid ${C.borderGold}`,borderRadius:8,padding:"9px 12px",marginBottom:10}}>
              <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".1em",marginBottom:2}}>{(TIERS[user?.tier]?.name)||"ACTIVE"} PLAN</div>
              <div style={{fontSize:11,color:C.muted}}>{user?.email}</div>
            </div>
            <button onClick={onLogout} style={{width:"100%",display:"flex",alignItems:"center",gap:10,background:"none",border:"none",color:C.muted,cursor:"pointer",padding:"6px 4px",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}><LogOut size={13}/>Sign Out</button>
          </div>
        )}
      </aside>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <header style={{borderBottom:`1px solid ${C.border}`,padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,background:"rgba(7,9,15,.97)",backdropFilter:"blur(10px)",flexShrink:0}}>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:600,color:C.white}}>{DASH_NAV.find(n=>n.id===active)?.label||"Dashboard"}</h1>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 10px",display:"flex",alignItems:"center",gap:5}}><div style={{width:5,height:5,borderRadius:"50%",background:C.teal,animation:"pulse 2s infinite"}}/><span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.teal}}>LIVE</span></div>
            <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg, ${C.gold}, ${C.goldBright})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:C.bg,fontSize:12}}>{(user?.name||"U").charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <main style={{flex:1,overflow:"auto",padding:28}}>
          {active==="home"&&<DashHome isPro={isPro} user={user} setActive={setActive}/>}
          {active==="advisor"&&<HuitBrain/>}
          {active==="masterclass"&&<MasterClass/>}
          {active==="market"&&<MarketFeed/>}
          {active==="prospecting"&&<ProspectingEngine/>}
          {active==="packager"&&<DealPackager/>}
          {active==="underwriting"&&<UnderwritingHub/>}
          {active==="lenders"&&<LenderEngine/>}
          {active==="apex"&&<APEXScore/>}
        </main>
      </div>
    </div>
  );
}

function SideBtn({n,active,open,onClick}) {
  const BAD={AI:`${C.blue}2A`,LIVE:`${C.teal}2A`,NEW:`${C.goldMuted}33`};
  const BADC={AI:C.blue,LIVE:C.teal,NEW:C.gold};
  const col=active?(n.color||C.goldBright):C.muted;
  return <button onClick={onClick} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:open?"9px 10px":"9px",borderRadius:8,border:"none",background:active?`${(n.color||C.gold)}14`:"transparent",cursor:"pointer",marginBottom:1,transition:"all .15s",justifyContent:open?"flex-start":"center",fontFamily:"'DM Sans',sans-serif"}}><n.icon size={14} color={col}/>{open&&<><span style={{fontSize:12,fontWeight:active?500:400,color:col,flex:1,textAlign:"left"}}>{n.label}</span>{n.badge&&<span style={{fontSize:8,fontFamily:"'DM Mono',monospace",padding:"2px 5px",borderRadius:3,background:BAD[n.badge]||`${C.goldMuted}33`,color:BADC[n.badge]||C.gold}}>{n.badge}</span>}</>}</button>;
}

/* ─── DASH HOME ─── */
function DashHome({isPro,user,setActive}) {
  const metrics=[{l:"Deals Packaged",v:"0",icon:FileText,c:C.gold},{l:"Lenders Matched",v:isPro?"0":"—",icon:Database,c:C.success},{l:"AI Queries",v:isPro?"0":"—",icon:Brain,c:C.blue},{l:"Courses Complete",v:"0 / 5",icon:BookOpen,c:C.goldBright}];
  return (
    <div className="au" style={{maxWidth:1000}}>
      {!isPro&&<div style={{background:`${C.goldMuted}18`,border:`1px solid ${C.borderGold}`,borderRadius:12,padding:"16px 22px",marginBottom:24,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:C.white,marginBottom:3}}>🔒 Unlock the full platform</p><p style={{fontSize:12,color:C.muted}}>Upgrade to ACTIVE to access Lender Engine, AI Advisor, and live market data.</p></div>
        <button style={{...btnGold,padding:"9px 22px",fontSize:13,whiteSpace:"nowrap"}}>Upgrade — $249/mo</button>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:28}}>
        {metrics.map((m,i)=>(
          <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div><p style={{fontSize:11,color:C.muted,marginBottom:7}}>{m.l}</p><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:600,color:C.white}}>{m.v}</p></div>
              <div style={{width:36,height:36,borderRadius:8,background:`${m.c}1A`,display:"flex",alignItems:"center",justifyContent:"center"}}><m.icon size={15} color={m.c}/></div>
            </div>
          </div>
        ))}
      </div>
      <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.white,marginBottom:14}}>Quick Actions</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
        {[{l:"Package a Deal",icon:FileText,id:"packager"},{l:"Run Underwriting",icon:BarChart3,id:"underwriting"},{l:"Ask AI Advisor",icon:Brain,id:"advisor"},{l:"Find Lenders",icon:Database,id:"lenders"},{l:"Prospect HMDA",icon:Target,id:"prospecting"},{l:"Start MasterClass",icon:BookOpen,id:"masterclass"}].map(a=>(
          <div key={a.id} onClick={()=>setActive(a.id)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"border-color .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderGold} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{width:34,height:34,background:`${C.goldMuted}22`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><a.icon size={15} color={C.gold}/></div>
            <span style={{fontSize:13,color:C.text}}>{a.l}</span>
            <ChevronRight size={13} color={C.muted} style={{marginLeft:"auto"}}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── HUIT BRAIN ─── */
function HuitBrain() {
  const [messages,setMessages]=useState([{role:"assistant",content:"Welcome to Huit Brain — your 24/7 CRE capital intelligence advisor.\n\nI'm trained on CRE deal structures, lender markets, underwriting methodology, and capital markets. Ask me anything about your deal, a lender, market conditions, or strategy."}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  const SYSTEM="You are Huit Brain, the AI advisor for HyCRE.ai — a premium CRE capital intelligence platform. You are a senior commercial real estate capital markets expert. Be concise, direct, and expert. Use specific numbers and benchmarks.";
  const send=async(text)=>{
    const msg=text||input.trim();if(!msg||loading)return;
    setInput("");
    const hist=[...messages,{role:"user",content:msg}];
    setMessages(hist);setLoading(true);
    try{
      const reply=await callAI(SYSTEM,msg,messages);
      setMessages(p=>[...p,{role:"assistant",content:reply}]);
    }catch{setMessages(p=>[...p,{role:"assistant",content:"Connection error. Please retry."}]);}
    setLoading(false);
  };
  const SUGGESTED=["What DSCR do most life companies require for multifamily?","How do I structure a bridge-to-perm deal package?","What makes Alaska CRE different from lower-48 markets?","How should I cold approach a lender on a $3M retail deal?","Explain LTV vs LTC for a value-add deal."];
  return (
    <div className="au" style={{display:"flex",gap:18,height:"calc(100vh - 140px)",maxWidth:1060}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:`${C.blue}18`,border:`1px solid ${C.blueBorder}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Brain size={16} color={C.blue}/></div>
          <div><div style={{fontSize:13,fontWeight:500,color:C.white}}>Huit Brain</div><div style={{fontSize:10,color:C.teal,display:"flex",alignItems:"center",gap:4}}><div style={{width:4,height:4,borderRadius:"50%",background:C.teal,animation:"pulse 2s infinite"}}/>Online · CRE Capital Expert</div></div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:18}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:16,justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
              {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:7,background:`${C.blue}18`,border:`1px solid ${C.blueBorder}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}><Brain size={13} color={C.blue}/></div>}
              <div style={{maxWidth:"76%",background:m.role==="user"?`linear-gradient(135deg, ${C.gold}, ${C.goldBright})`:C.card,border:m.role==="user"?"none":`1px solid ${C.border}`,borderRadius:m.role==="user"?"11px 11px 4px 11px":"11px 11px 11px 4px",padding:"10px 14px"}}>
                <div style={{fontSize:13,color:m.role==="user"?C.bg:C.text,lineHeight:1.75,whiteSpace:"pre-wrap"}}>
                  {m.content.split('\n').map((line,li)=>{
                    if(line.startsWith('**')&&line.endsWith('**'))return<div key={li} style={{fontWeight:600,color:m.role==="user"?C.bg:C.white,marginTop:li>0?6:0}}>{line.replace(/\*\*/g,'')}</div>;
                    if(line.startsWith('- ')||line.startsWith('• '))return<div key={li} style={{paddingLeft:10,marginTop:2}}>· {line.slice(2)}</div>;
                    return<div key={li}>{line}</div>;
                  })}
                </div>
              </div>
              {m.role==="user"&&<div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg, ${C.gold}, ${C.goldBright})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}><User size={13} color={C.bg}/></div>}
            </div>
          ))}
          {loading&&<div style={{display:"flex",gap:8,marginBottom:16}}><div style={{width:28,height:28,borderRadius:7,background:`${C.blue}18`,border:`1px solid ${C.blueBorder}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Brain size={13} color={C.blue}/></div><div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"11px 11px 11px 4px",padding:"12px 14px",display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:C.blue,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>)}</div></div>}
          <div ref={bottomRef}/>
        </div>
        <div style={{padding:"12px 14px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask anything about CRE deals, lenders, markets..." rows={2} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text,outline:"none",resize:"none",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}/>
            <button onClick={()=>send()} disabled={!input.trim()||loading} style={{width:38,height:38,borderRadius:9,background:input.trim()?`linear-gradient(135deg, ${C.blue}, #6AAAF0)`:C.dim,border:"none",cursor:input.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Send size={14} color={input.trim()?C.white:C.muted}/></button>
          </div>
        </div>
      </div>
      <div style={{width:220,display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:16,flex:1}}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".12em",marginBottom:12}}>SUGGESTED</div>
          {SUGGESTED.map((q,i)=><button key={i} onClick={()=>send(q)} style={{width:"100%",textAlign:"left",background:C.card,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 11px",cursor:"pointer",fontSize:11,color:C.muted,lineHeight:1.5,transition:"all .15s",fontFamily:"'DM Sans',sans-serif",marginBottom:7}} onMouseEnter={e=>{e.target.style.color=C.text;e.target.style.borderColor=C.borderGold;}} onMouseLeave={e=>{e.target.style.color=C.muted;e.target.style.borderColor=C.border;}}>{q}</button>)}
        </div>
      </div>
    </div>
  );
}

/* ─── MASTERCLASS ─── */
function MasterClass() {
  const [activeMod,setActiveMod]=useState(null);
  const [lesson,setLesson]=useState(null);
  const [loading,setLoading]=useState(false);
  const [quiz,setQuiz]=useState(null);
  const [qLoading,setQLoading]=useState(false);
  const [answers,setAnswers]=useState({});
  const [submitted,setSubmitted]=useState(false);
  const [feedback,setFeedback]=useState(null);
  const [progress,setProgress]=useState({});
  const loadLesson=async(mod)=>{
    setActiveMod(mod);setLesson(null);setQuiz(null);setAnswers({});setSubmitted(false);setFeedback(null);setLoading(true);
    try{const r=await callAI("You are a senior CRE capital markets educator. Generate a structured lesson for CRE capital finders. Format with ## SECTION headers, practical examples with real numbers, and actionable takeaways. 400 words. Be specific.","Write a complete lesson on: \""+mod.title+"\". Topics: "+mod.topics.join(", ")+". Include 2-3 real-world examples with numbers.");setLesson(r);setProgress(p=>({...p,[mod.id]:"started"}));}
    catch{setLesson("Error loading lesson.");}
    setLoading(false);
  };
  const loadQuiz=async()=>{
    setQLoading(true);
    try{const r=await callAI("Generate a 3-question multiple choice quiz. Return ONLY valid JSON. No markdown. Format: {questions:[{q:string,options:string[4],answer:number(0-3),explanation:string}]}","Create 3-question CRE quiz on: "+activeMod.title+". JSON only.");const clean=r.replace(/```json|```/g,"").trim();setQuiz(JSON.parse(clean));}
    catch{setQuiz({questions:[{q:"Quiz unavailable.",options:["Retry"],answer:0,explanation:""}]});}
    setQLoading(false);
  };
  const submitQuiz=()=>{
    setSubmitted(true);
    const correct=quiz.questions.filter((q,i)=>parseInt(answers[i])===q.answer).length;
    const score=Math.round((correct/quiz.questions.length)*100);
    setFeedback({score,correct,total:quiz.questions.length});
    if(score>=67)setProgress(p=>({...p,[activeMod.id]:"complete"}));
  };
  const completed=Object.values(progress).filter(v=>v==="complete").length;
  if(!activeMod) return (
    <div className="au" style={{maxWidth:780}}>
      <h2 style={H2}>CRE AI MasterClass</h2>
      <p style={{...Sub,marginBottom:6}}>5-module AI-powered training. Each lesson generated live by your AI advisor.</p>
      <div style={{display:"flex",alignItems:"center",gap:14,margin:"16px 0 28px"}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 14px",display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,color:C.goldBright}}>{completed}</span><span style={{fontSize:11,color:C.muted}}>of 5 complete</span></div>
        <div style={{flex:1,height:5,background:C.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${(completed/5)*100}%`,background:`linear-gradient(90deg, ${C.gold}, ${C.goldBright})`,transition:"width .5s"}}/></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {MODULES.map(m=>{
          const prog=progress[m.id];
          return(
            <div key={m.id} onClick={()=>loadLesson(m)} style={{background:C.surface,border:`1px solid ${prog==="complete"?C.successBorder:C.border}`,borderRadius:14,padding:"20px 22px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=m.color} onMouseLeave={e=>e.currentTarget.style.borderColor=prog==="complete"?C.successBorder:C.border}>
              <div style={{width:50,height:50,borderRadius:12,background:`${m.color}14`,border:`1px solid ${m.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{m.icon}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><h3 style={{fontSize:15,fontWeight:500,color:C.white}}>{m.title}</h3>{prog==="complete"&&<CheckCircle size={13} color={C.success}/>}{prog==="started"&&<Clock size={13} color={C.warn}/>}</div>
                <p style={{fontSize:12,color:C.muted,marginBottom:6}}>{m.subtitle}</p>
                <span style={{fontSize:11,color:C.dim}}><Clock size={10} style={{verticalAlign:"middle",marginRight:3}}/>{m.duration} · {m.topics.length} topics</span>
              </div>
              <button style={{display:"flex",alignItems:"center",gap:5,background:"transparent",border:`1px solid ${m.color}55`,borderRadius:7,padding:"7px 14px",color:m.color,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><Play size={11}/>{prog==="complete"?"Review":prog==="started"?"Continue":"Start"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
  return (
    <div className="au" style={{maxWidth:760}}>
      <button onClick={()=>setActiveMod(null)} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,marginBottom:18,fontFamily:"'DM Sans',sans-serif"}}>← Back to MasterClass</button>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <div style={{width:44,height:44,borderRadius:10,background:`${activeMod.color}14`,border:`1px solid ${activeMod.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{activeMod.icon}</div>
        <div><h2 style={H2}>{activeMod.title}</h2><p style={{fontSize:12,color:C.muted}}>{activeMod.subtitle}</p></div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
        {activeMod.topics.map((t,i)=><span key={i} style={{fontSize:10,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,padding:"3px 9px",color:C.muted}}>{t}</span>)}
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:26,marginBottom:18}}>
        {loading?<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"36px 0"}}><div style={{width:28,height:28,border:`2px solid ${C.borderGold}`,borderTopColor:C.goldBright,borderRadius:"50%",animation:"spin 1s linear infinite",marginBottom:10}}/><p style={{color:C.muted,fontSize:13}}>Generating AI lesson...</p></div>
        :<div style={{fontSize:13,color:C.text,lineHeight:1.85}}>
          {lesson?.split('\n').map((line,i)=>{
            if(line.startsWith('## '))return<h3 key={i} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:activeMod.color,margin:"18px 0 7px",fontWeight:600}}>{line.replace('## ','')}</h3>;
            if(line.startsWith('**')&&line.endsWith('**'))return<p key={i} style={{fontWeight:600,color:C.white,marginTop:6}}>{line.replace(/\*\*/g,'')}</p>;
            if(line.startsWith('- ')||line.startsWith('• '))return<div key={i} style={{paddingLeft:14,marginTop:3,display:"flex",gap:7}}><span style={{color:activeMod.color,flexShrink:0}}>·</span><span>{line.slice(2)}</span></div>;
            return<p key={i} style={{marginTop:line?3:6}}>{line}</p>;
          })}
        </div>}
      </div>
      {lesson&&!loading&&<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:22}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <span style={{fontSize:13,fontWeight:500,color:C.white}}>Knowledge Check</span>
          {!quiz&&<button onClick={loadQuiz} disabled={qLoading} style={{...btnGold,padding:"6px 14px",fontSize:11,display:"flex",alignItems:"center",gap:5}}>{qLoading?<><div style={{width:10,height:10,border:`2px solid ${C.bg}55`,borderTopColor:C.bg,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>Loading</>:<><Zap size={11}/>Generate Quiz</>}</button>}
        </div>
        {quiz&&<div>
          {quiz.questions?.map((q,qi)=>(
            <div key={qi} style={{marginBottom:16,padding:14,background:C.card,borderRadius:9,border:`1px solid ${C.border}`}}>
              <p style={{fontSize:13,fontWeight:500,color:C.white,marginBottom:10}}>{qi+1}. {q.q}</p>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {q.options?.map((opt,oi)=>{
                  const sel=parseInt(answers[qi])===oi,corr=submitted&&oi===q.answer,wrong=submitted&&sel&&oi!==q.answer;
                  return<button key={oi} onClick={()=>!submitted&&setAnswers(a=>({...a,[qi]:oi}))} style={{textAlign:"left",padding:"8px 12px",borderRadius:6,border:`1px solid ${corr?C.successBorder:wrong?C.dangerBorder:sel?C.borderGold:C.border}`,background:corr?C.successBg:wrong?C.dangerBg:sel?`${C.goldMuted}18`:"transparent",color:corr?C.success:wrong?C.danger:sel?C.gold:C.muted,fontSize:12,cursor:submitted?"default":"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:7}}>
                    {corr&&<CheckCircle size={11} color={C.success}/>}{wrong&&<XCircle size={11} color={C.danger}/>}{opt}
                  </button>;
                })}
              </div>
              {submitted&&q.explanation&&<p style={{fontSize:10,color:C.muted,marginTop:8,padding:"6px 10px",background:C.card2,borderRadius:5}}>💡 {q.explanation}</p>}
            </div>
          ))}
          {!submitted?<button onClick={submitQuiz} disabled={Object.keys(answers).length<(quiz.questions?.length||0)} style={{...btnGold,padding:"9px 22px",fontSize:12,display:"flex",alignItems:"center",gap:6}}><CheckCircle size={13}/>Submit Answers</button>
          :feedback&&<div style={{background:feedback.score>=67?C.successBg:C.warnBg,border:`1px solid ${feedback.score>=67?C.successBorder:C.warnBorder}`,borderRadius:9,padding:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontSize:15,fontWeight:600,color:feedback.score>=67?C.success:C.warn}}>{feedback.score}% — {feedback.correct}/{feedback.total} correct</div><div style={{fontSize:11,color:C.muted}}>{feedback.score>=67?"Module complete!":"Review the lesson and retry."}</div></div>
            {feedback.score>=67&&<button onClick={()=>setActiveMod(null)} style={{...btnGold,padding:"7px 16px",fontSize:11}}>Next Module →</button>}
          </div>}
        </div>}
      </div>}
    </div>
  );
}

/* ─── MARKET FEED ─── */
function MarketFeed() {
  return (
    <div className="au" style={{maxWidth:1100}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><h2 style={H2}>Market Intelligence</h2><span style={{fontSize:9,fontFamily:"'DM Mono',monospace",padding:"3px 8px",borderRadius:4,background:`${C.teal}18`,color:C.teal,border:`1px solid ${C.teal}44`}}>LIVE</span></div>
        <span style={{fontSize:11,color:C.muted}}>Updated: April 14, 2026 · 8:42 AM</span>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 16px",marginBottom:18,display:"flex",gap:24,flexWrap:"wrap"}}>
        {RATE_ENV.map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <span style={{fontSize:11,color:C.muted}}>{r.label}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.white}}>{r.value}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:r.up===true?C.danger:r.up===false?C.success:C.muted}}>{r.change}</span>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".12em",marginBottom:14}}>CAP RATES BY ASSET CLASS — 2025</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Asset","Q1","Q2","Q3","Q4","YTD Δ"].map(h=><th key={h} style={{padding:"5px 8px",textAlign:h==="Asset"?"left":"right",fontSize:9,color:C.muted,fontWeight:400,fontFamily:"'DM Mono',monospace",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
            <tbody>{CAP_RATES.map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"8px 8px",fontSize:11,color:C.text}}>{r.type}</td>{[r.q1,r.q2,r.q3,r.q4].map((v,j)=><td key={j} style={{padding:"8px 8px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,color:j===3?C.white:C.muted}}>{v}</td>)}<td style={{padding:"8px 8px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,color:C.danger}}>{r.ytd}</td></tr>)}</tbody>
          </table>
        </div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:20}}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.teal,letterSpacing:".12em",marginBottom:14}}>CRE INTELLIGENCE FEED</div>
          {CRE_NEWS.slice(0,6).map((n,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 0",borderBottom:i<5?`1px solid ${C.border}`:"none"}}>
              <span style={{fontSize:8,fontFamily:"'DM Mono',monospace",padding:"2px 6px",borderRadius:3,background:n.tag==="ALASKA"?`${C.gold}18`:n.positive===true?`${C.success}14`:`${C.blue}14`,color:n.tag==="ALASKA"?C.gold:n.positive===true?C.success:C.blue,flexShrink:0,marginTop:2}}>{n.tag}</span>
              <div><p style={{fontSize:12,color:C.text,lineHeight:1.5,marginBottom:2}}>{n.headline}</p><span style={{fontSize:10,color:C.dim}}>{n.source} · {n.time}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── PROSPECTING ENGINE ─── */
function ProspectingEngine() {
  const [filters,setFilters]=useState({propType:"Multifamily",state:"AK",minLoan:"500000",maxLoan:"5000000",year:"2024"});
  const [prospects,setProspects]=useState([]);
  const [searched,setSearched]=useState(false);
  const [selected,setSelected]=useState([]);
  const [outreach,setOutreach]=useState(null);
  const [oLoading,setOLoading]=useState(false);
  const [detail,setDetail]=useState(null);
  const ff=k=>v=>setFilters(p=>({...p,[k]:v}));
  const STATES=["AK","WA","OR","CA","TX","CO","FL","NY","GA","NC","TN","AZ"];
  const names=["Summit Properties LLC","Pacific Ridge Capital","Northern Star Holdings","Meridian Asset Group","Cascade Real Estate Partners","Alpine Capital LLC","Denali Holdings","BlueSky Property Group","Coastal Ventures Inc","Heritage CRE Fund","Frontier Assets","Keystone Properties","Harbor Light Capital","Mountain View Developments","Clearwater CRE"];
  const search=()=>{
    const stateCities={AK:["Anchorage","Fairbanks","Juneau","Wasilla"],WA:["Seattle","Tacoma","Spokane","Bellevue"],TX:["Dallas","Austin","Houston","San Antonio"],FL:["Miami","Tampa","Orlando","Jacksonville"]};
    const cities=stateCities[filters.state]||["Metro Area","Downtown","Eastside","Westside"];
    const pp=Array.from({length:15},(_,i)=>({id:i+1,name:names[i],propType:filters.propType==="All"?["Multifamily","Office","Retail","Industrial"][i%4]:filters.propType,state:filters.state,city:cities[i%cities.length],loanAmt:Math.round((parseFloat(filters.minLoan)+Math.random()*(parseFloat(filters.maxLoan)-parseFloat(filters.minLoan)))/100000)*100000,year:filters.year,lender:["Wells Fargo","Chase","Freddie Mac","Fannie Mae","Local Bank","Private","CMBS"][i%7],apexScore:Math.floor(Math.random()*35)+55,contact:`info@${names[i].toLowerCase().replace(/[^a-z]/g,"")}.com`,phone:`(${Math.floor(Math.random()*800)+200}) 555-0${String(Math.floor(Math.random()*100)).padStart(3,"0")}`,status:["Hot","Warm","Cold"][i%3]}));
    setProspects(pp);setSearched(true);setSelected([]);setOutreach(null);
  };
  const toggle=id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const genOutreach=async()=>{
    const p=prospects.find(p=>selected.includes(p.id));if(!p)return;
    setOLoading(true);setOutreach(null);
    try{const r=await callAI("You are a CRE capital finder writing outreach sequences. Generate a 3-touch sequence (Email 1, LinkedIn DM, Email 2 Follow-up). Include subject lines. Be specific and professional, not salesy.","Write a 3-touch outreach to: "+p.name+", who had a "+p.propType+" loan of $"+p.loanAmt.toLocaleString()+" in "+p.city+", "+p.state+" ("+p.year+" HMDA, financed by "+p.lender+"). I'm a CRE capital finder with HyCRE.ai offering better rates, higher LTV, and non-recourse structures.");setOutreach(r);}
    catch{setOutreach("Error generating sequence.");}
    setOLoading(false);
  };
  const SC={Hot:C.danger,Warm:C.gold,Cold:C.muted};
  return (
    <div className="au" style={{maxWidth:1100}}>
      <h2 style={H2}>HMDA Prospecting Engine</h2>
      <p style={{...Sub,marginBottom:22}}>Filter HMDA records to find CRE owners ready for new capital. Generate AI outreach sequences in one click.</p>
      <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:18}}>
        <div>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:18,marginBottom:14}}>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.teal,letterSpacing:".12em",marginBottom:12}}>HMDA FILTERS</div>
            <div style={{marginBottom:11}}><FL l="Property Type"/><Sel val={filters.propType} set={ff("propType")} opts={["All","Multifamily","Office","Retail","Industrial","Hotel","Mixed-Use","Self-Storage"]}/></div>
            <div style={{marginBottom:11}}><FL l="State"/><Sel val={filters.state} set={ff("state")} opts={STATES}/></div>
            <div style={{marginBottom:11}}><FL l="Min Loan ($)"/><Inp val={filters.minLoan} set={ff("minLoan")} ph="500,000" mono/></div>
            <div style={{marginBottom:11}}><FL l="Max Loan ($)"/><Inp val={filters.maxLoan} set={ff("maxLoan")} ph="5,000,000" mono/></div>
            <div style={{marginBottom:18}}><FL l="HMDA Year"/><Sel val={filters.year} set={ff("year")} opts={["2024","2023","2022","2021","2020","2019","2018","2017"]}/></div>
            <button onClick={search} style={{...btnGold,width:"100%",padding:"10px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontSize:13}}><Search size={13}/>Search Records</button>
            {searched&&<p style={{fontSize:10,color:C.success,textAlign:"center",marginTop:8}}>✓ {prospects.length} records found</p>}
          </div>
          {searched&&selected.length>0&&<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".12em",marginBottom:10}}>{selected.length} SELECTED</div>
            <button onClick={genOutreach} disabled={oLoading} style={{...btnGold,width:"100%",padding:"9px 0",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Zap size={12}/>{oLoading?"Generating...":"Generate Outreach"}</button>
            <button onClick={()=>setSelected([])} style={{...btnOutline,width:"100%",padding:"7px 0",fontSize:11,marginTop:8}}>Clear</button>
          </div>}
        </div>
        <div>
          {!searched?<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:380,opacity:.5}}><Database size={36} color={C.muted} style={{marginBottom:10}}/><p style={{color:C.muted,fontSize:13}}>Set filters and search</p></div>:(
            <>
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",marginBottom:outreach?18:0}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{borderBottom:`1px solid ${C.border}`,background:C.card}}><th style={{width:32,padding:"9px 12px"}}/>{["Company","Type","Location","Loan Amount","APEX","Status",""].map(h=><th key={h} style={{padding:"9px 10px",textAlign:h==="Loan Amount"||h==="APEX"?"right":"left",fontSize:9,color:C.muted,fontWeight:400,fontFamily:"'DM Mono',monospace"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {prospects.map((p,i)=>{
                      const sel=selected.includes(p.id);
                      const sc=p.apexScore>=75?C.success:p.apexScore>=60?C.goldBright:C.warn;
                      return<tr key={p.id} style={{borderBottom:`1px solid ${C.border}`,background:sel?`${C.goldMuted}0E`:"transparent"}}>
                        <td style={{padding:"9px 12px"}}><div onClick={()=>toggle(p.id)} style={{width:15,height:15,borderRadius:3,border:`1.5px solid ${sel?C.gold:C.border}`,background:sel?C.gold:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{sel&&<Check size={9} color={C.bg}/>}</div></td>
                        <td style={{padding:"9px 10px",fontSize:11,color:C.text,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</td>
                        <td style={{padding:"9px 10px",fontSize:10,color:C.muted}}>{p.propType}</td>
                        <td style={{padding:"9px 10px",fontSize:10,color:C.muted}}>{p.city}, {p.state}</td>
                        <td style={{padding:"9px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,color:C.text}}>${(p.loanAmt/1000).toFixed(0)}K</td>
                        <td style={{padding:"9px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:sc}}>{p.apexScore}</td>
                        <td style={{padding:"9px 10px"}}><span style={{fontSize:8,fontFamily:"'DM Mono',monospace",padding:"2px 6px",borderRadius:3,background:`${SC[p.status]}14`,color:SC[p.status]}}>{p.status}</span></td>
                        <td style={{padding:"9px 10px"}}><button onClick={()=>setDetail(p)} style={{...btnOutline,padding:"3px 9px",fontSize:10}}>View</button></td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
              {(outreach||oLoading)&&<div style={{background:C.surface,border:`1px solid ${C.borderGold}`,borderRadius:14,padding:22}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Mail size={15} color={C.gold}/><span style={{fontSize:13,fontWeight:500,color:C.white}}>AI Outreach Sequence</span><span style={{fontSize:8,fontFamily:"'DM Mono',monospace",padding:"2px 6px",borderRadius:3,background:`${C.goldMuted}2A`,color:C.gold}}>3-TOUCH</span></div>
                {oLoading?<div style={{display:"flex",alignItems:"center",gap:8,padding:"16px 0"}}><div style={{width:18,height:18,border:`2px solid ${C.borderGold}`,borderTopColor:C.goldBright,borderRadius:"50%",animation:"spin 1s linear infinite"}}/><span style={{color:C.muted,fontSize:12}}>Generating personalized sequence...</span></div>
                :<div>
                  <div style={{fontSize:12,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>
                    {outreach?.split('\n').map((line,i)=>{
                      if(line.match(/^(Email|LinkedIn|Touch|Step|Follow)/i))return<div key={i} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:C.gold,marginTop:i>0?18:0,marginBottom:5,fontWeight:600}}>{line}</div>;
                      if(line.startsWith('Subject:'))return<div key={i} style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.blue,marginBottom:5}}>{line}</div>;
                      return<p key={i}>{line}</p>;
                    })}
                  </div>
                  <div style={{marginTop:16,display:"flex",gap:10}}><button style={{...btnGold,padding:"7px 18px",fontSize:11,display:"flex",alignItems:"center",gap:5}}><Download size={11}/>Export to CRM</button><button onClick={genOutreach} style={{...btnOutline,padding:"7px 14px",fontSize:11,display:"flex",alignItems:"center",gap:5}}><RefreshCw size={10}/>Regenerate</button></div>
                </div>}
              </div>}
            </>
          )}
        </div>
      </div>
      {detail&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setDetail(null)}>
        <div style={{background:C.card,border:`1px solid ${C.borderGold}`,borderRadius:16,padding:28,maxWidth:440,width:"90%",animation:"fadeUp .3s ease"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}><h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.white}}>{detail.name}</h3><button onClick={()=>setDetail(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted}}><X size={16}/></button></div>
          {[["Type",detail.propType],["Location",`${detail.city}, ${detail.state}`],["Loan Amount",`$${detail.loanAmt.toLocaleString()}`],["Prior Lender",detail.lender],["APEX Score",`${detail.apexScore}/100`],["Contact",detail.contact],["Phone",detail.phone]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:11,color:C.muted}}>{l}</span><span style={{fontSize:11,color:C.text}}>{v}</span></div>
          ))}
          <button onClick={()=>{toggle(detail.id);setDetail(null);}} style={{...btnGold,width:"100%",marginTop:18,padding:"10px 0",fontSize:12}}>Add to Outreach List</button>
        </div>
      </div>}
    </div>
  );
}

/* ─── DEAL PACKAGER ─── */
function DealPackager() {
  const [form,setForm]=useState({propType:"Multifamily",address:"",price:"",noi:"",ltv:"70",rate:"6.75",amort:"25",purpose:"Acquisition",market:"Anchorage, AK",sponsor:""});
  const [output,setOutput]=useState(null);
  const [loading,setLoading]=useState(false);
  const [apexData,setApexData]=useState(null);
  const f=k=>v=>setForm(p=>({...p,[k]:v}));
  const p2=parseFloat(form.price)||0,noi=parseFloat(form.noi)||0,ltvN=parseFloat(form.ltv)/100||0,r=parseFloat(form.rate)/100/12||0,am=parseFloat(form.amort)*12;
  const loan=p2*ltvN,mPmt=r>0?loan*(r*Math.pow(1+r,am))/(Math.pow(1+r,am)-1):0,annDebt=mPmt*12;
  const capRate=p2>0?((noi/p2)*100).toFixed(2):0,dscr=annDebt>0?(noi/annDebt).toFixed(2):0;
  const generate=async()=>{
    if(!form.address||!form.price||!form.noi)return;
    setLoading(true);setOutput(null);
    const sc=calcAPEXScore({capRate,dscr,ltv:form.ltv,propType:form.propType,purpose:form.purpose});
    setApexData(sc);
    try{const r=await callAI("You are a senior CRE capital markets advisor. Generate a professional, lender-ready executive deal summary. Use ### headers: PROPERTY OVERVIEW, FINANCIAL SUMMARY, DEBT STRUCTURE, MARKET CONTEXT, LENDER VALUE PROPOSITION. Be specific and data-driven. 350 words.","Package this deal:\nType: "+form.propType+"\nAddress: "+form.address+"\nPrice: $"+Number(form.price).toLocaleString()+"\nNOI: $"+Number(form.noi).toLocaleString()+"/yr\nCap Rate: "+capRate+"%\nLoan: $"+Math.round(loan).toLocaleString()+" ("+form.ltv+"% LTV)\nDSCR: "+dscr+"x\nRate: "+form.rate+"%\nAmort: "+form.amort+"yr\nPurpose: "+form.purpose+"\nMarket: "+form.market+"\nSponsor: "+(form.sponsor||"Experienced operator"));setOutput(r);}
    catch{setOutput("Error generating memo.");}
    setLoading(false);
  };
  const gcol=!apexData?C.muted:apexData.score>=75?C.success:apexData.score>=55?C.goldBright:C.warn;
  return (
    <div className="au" style={{maxWidth:1060}}>
      <h2 style={H2}>Deal Packager AI</h2>
      <p style={{...Sub,marginBottom:22}}>Input deal parameters → lender-ready executive memo with APEX score in seconds.</p>
      <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:18}}>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:22}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{gridColumn:"1/-1"}}><FL l="Property Type"/><Sel val={form.propType} set={f("propType")} opts={PROP_TYPES}/></div>
            <div style={{gridColumn:"1/-1"}}><FL l="Address"/><Inp val={form.address} set={f("address")} ph="123 Main St, Anchorage AK"/></div>
            <div><FL l="Purchase Price ($)"/><Inp val={form.price} set={v=>f("price")(v.replace(/\D/g,""))} ph="2500000" mono/></div>
            <div><FL l="Annual NOI ($)"/><Inp val={form.noi} set={v=>f("noi")(v.replace(/\D/g,""))} ph="175000" mono/></div>
            <div><FL l="LTV (%)"/><Inp val={form.ltv} set={v=>f("ltv")(v.replace(/\D/g,"").slice(0,2))} ph="70" mono/></div>
            <div><FL l="Rate (%)"/><Inp val={form.rate} set={f("rate")} ph="6.75" mono/></div>
            <div style={{gridColumn:"1/-1"}}><FL l="Loan Purpose"/><Sel val={form.purpose} set={f("purpose")} opts={LOAN_PURPOSES}/></div>
            <div style={{gridColumn:"1/-1"}}><FL l="Market"/><Inp val={form.market} set={f("market")} ph="Anchorage, AK"/></div>
            <div style={{gridColumn:"1/-1"}}><FL l="Sponsor / Firm"/><Inp val={form.sponsor} set={f("sponsor")} ph="Huit Capital Partners"/></div>
          </div>
          {p2>0&&noi>0&&<div style={{marginTop:14,background:C.card2,borderRadius:8,padding:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[{l:"Cap Rate",v:`${capRate}%`,ok:parseFloat(capRate)>=5},{l:"Loan Amt",v:`$${Math.round(loan/1000)}K`,ok:true},{l:"DSCR",v:`${dscr}x`,ok:parseFloat(dscr)>=1.25},{l:"Ann Debt",v:`$${Math.round(annDebt/1000)}K`,ok:true}].map((m,i)=>(
              <div key={i}><div style={{fontSize:9,color:C.muted}}>{m.l}</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:m.ok?C.success:C.warn}}>{m.v}</div></div>
            ))}
          </div>}
          <button onClick={generate} disabled={loading||!form.address||!form.price||!form.noi} style={{...btnGold,width:"100%",marginTop:14,padding:"11px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:7,opacity:loading?.7:1}}><Zap size={14}/>{loading?"Generating...":"Generate Package + APEX Score"}</button>
        </div>
        <div>
          {!output&&!loading&&<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,opacity:.5}}><FileText size={36} color={C.muted} style={{marginBottom:10}}/><p style={{color:C.muted,fontSize:13}}>Fill parameters and generate</p></div>}
          {loading&&<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400}}><div style={{width:28,height:28,border:`2px solid ${C.borderGold}`,borderTopColor:C.goldBright,borderRadius:"50%",animation:"spin 1s linear infinite",marginBottom:12}}/><p style={{color:C.muted,fontSize:13}}>Generating memo + APEX score...</p></div>}
          {output&&apexData&&<div className="ai">
            <div style={{background:`linear-gradient(135deg, ${C.card}, ${C.card2})`,border:`1px solid ${C.borderGold}`,borderRadius:14,padding:22,marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><div style={{display:"flex",alignItems:"center",gap:8}}><Award size={16} color={C.gold}/><span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.gold,letterSpacing:".1em"}}>APEX DEAL SCORE</span></div><div style={{display:"flex",alignItems:"baseline",gap:8}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:44,fontWeight:700,color:gcol,lineHeight:1}}>{apexData.score}</span><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:gcol}}>{apexData.grade}</span></div></div>
              {apexData.factors.map((fac,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:C.muted}}>{fac.name}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:fac.grade==="A"?C.success:fac.grade==="B"?C.goldBright:fac.grade==="C"?C.warn:C.danger}}>{fac.grade} {fac.score}/{fac.max}</span></div>
                  <div style={{height:3,background:C.border,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${(fac.score/fac.max)*100}%`,background:fac.grade==="A"?C.success:fac.grade==="B"?C.gold:fac.grade==="C"?C.warn:C.danger,transition:"width .5s"}}/></div>
                </div>
              ))}
            </div>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:C.white}}>Executive Deal Memo</span><button onClick={()=>window.print()} style={{...btnOutline,padding:"5px 12px",fontSize:11,display:"flex",alignItems:"center",gap:5}}><Download size={11}/>PDF</button></div>
              <div style={{fontSize:13,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>
                {output.split('\n').map((line,i)=>{
                  if(line.startsWith('###'))return<h4 key={i} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:C.gold,marginTop:16,marginBottom:5,fontWeight:600}}>{line.replace('###','').trim()}</h4>;
                  if(line.startsWith('**')&&line.endsWith('**'))return<p key={i} style={{fontWeight:600,color:C.white}}>{line.replace(/\*\*/g,'')}</p>;
                  return<p key={i}>{line}</p>;
                })}
              </div>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

/* ─── UNDERWRITING HUB ─── */
function UnderwritingHub() {
  const [tab,setTab]=useState("dscr");
  const TABS=[{id:"dscr",l:"DSCR"},{id:"noi",l:"NOI Analyzer"},{id:"ltv",l:"LTV / LTC"},{id:"irr",l:"IRR & Returns"},{id:"cf",l:"5-Year Projection"},{id:"sens",l:"Sensitivity"}];
  return (
    <div className="au" style={{maxWidth:1000}}>
      <h2 style={H2}>Underwriting Suite</h2>
      <p style={{...Sub,marginBottom:18}}>6 live calculators for CRE deal analysis. All results update in real time.</p>
      <div style={{display:"flex",gap:4,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:4,marginBottom:22,overflowX:"auto"}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:7,border:"none",background:tab===t.id?C.card:"transparent",color:tab===t.id?C.goldBright:C.muted,fontSize:12,fontWeight:tab===t.id?500:400,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>{t.l}</button>)}
      </div>
      <div className="ai">
        {tab==="dscr"&&<DSCRCalc/>}
        {tab==="noi"&&<NOICalc/>}
        {tab==="ltv"&&<LTVCalc/>}
        {tab==="irr"&&<IRRCalc/>}
        {tab==="cf"&&<CFProj/>}
        {tab==="sens"&&<SensMatrix/>}
      </div>
    </div>
  );
}

function DSCRCalc() {
  const [v,sv]=useState({price:"2500000",noi:"175000",ltv:"70",rate:"6.75",amort:"25"});
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const p=parseFloat(v.price)||0,n=parseFloat(v.noi)||0,ltv=parseFloat(v.ltv)/100||0,r=parseFloat(v.rate)/100/12||0,am=parseFloat(v.amort)*12;
  const loan=p*ltv,mPmt=r>0?loan*(r*Math.pow(1+r,am))/(Math.pow(1+r,am)-1):0,annDebt=mPmt*12;
  const dscr=annDebt>0?(n/annDebt):0,cap=p>0?(n/p*100):0;
  const dc=dscr>=1.5?C.success:dscr>=1.25?C.goldBright:dscr>=1.10?C.warn:C.danger;
  return(
    <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:18}}>
      <div style={P}>{[["Purchase Price ($)","price"],["Annual NOI ($)","noi"],["LTV (%)","ltv"],["Interest Rate (%)","rate"],["Amortization (yrs)","amort"]].map(([l,k])=><div key={k} style={{marginBottom:11}}><FL l={l}/><Inp val={v[k]} set={s(k)} mono/></div>)}</div>
      <div style={P}>
        <div style={{textAlign:"center",padding:"16px 0 24px"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:80,fontWeight:700,color:dc,lineHeight:1}}>{dscr>0?dscr.toFixed(2):"—"}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:4}}>Debt Service Coverage Ratio</div>
          {dscr>0&&<div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:6,background:dscr>=1.25?C.successBg:C.warnBg,border:`1px solid ${dscr>=1.25?C.successBorder:C.warnBorder}`,borderRadius:100,padding:"4px 12px"}}>
            {dscr>=1.25?<CheckCircle size={11} color={C.success}/>:<AlertCircle size={11} color={C.warn}/>}
            <span style={{fontSize:11,color:dscr>=1.25?C.success:C.warn}}>{dscr>=1.5?"Excellent":dscr>=1.25?"Acceptable — meets 1.25x":dscr>=1.1?"Marginal":"Below floor — restructure needed"}</span>
          </div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["Loan Amount",`$${Math.round(loan).toLocaleString()}`,true],["Ann. Debt Svc",`$${Math.round(annDebt).toLocaleString()}`,true],["Cap Rate",`${cap.toFixed(2)}%`,cap>5],["Monthly Pmt",`$${Math.round(mPmt).toLocaleString()}`,true],["NOI Surplus",`$${Math.round(n-annDebt).toLocaleString()}`,n>annDebt],["LTV",`${v.ltv}%`,parseFloat(v.ltv)<=75]].map(([l,val,ok],i)=>(
            <div key={i} style={{background:C.card2,borderRadius:7,padding:"10px 12px"}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>{l}</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:ok?C.success:C.danger}}>{val}</div></div>
          ))}
        </div>
        <div style={{marginTop:14,background:C.card2,borderRadius:8,padding:12}}><div style={{fontSize:10,color:C.muted,marginBottom:4}}>Breakeven NOI for 1.25x DSCR</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:15,color:C.goldBright}}>${Math.round(annDebt*1.25).toLocaleString()}/yr</div>{n>0&&<div style={{fontSize:10,color:n>=annDebt*1.25?C.success:C.danger,marginTop:3}}>Current NOI is ${Math.abs(Math.round(n-annDebt*1.25)).toLocaleString()} {n>=annDebt*1.25?"above":"below"} breakeven</div>}</div>
      </div>
    </div>
  );
}

function NOICalc() {
  const [inc,si]=useState({gross:"240000",other:"12000",vac:"5"});
  const [exp,se]=useState({taxes:"18000",insurance:"8000",mgmt:"9600",maint:"12000",utils:"6000",reserves:"4800",other2:"3600"});
  const gross=parseFloat(inc.gross)||0,oth=parseFloat(inc.other)||0,vacL=gross*(parseFloat(inc.vac)/100||0);
  const egi=gross-vacL+oth,totalExp=Object.values(exp).reduce((s,v)=>s+(parseFloat(v)||0),0),noi=egi-totalExp;
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <div>
        <div style={P}><SL>Income</SL>{[["Gross Income ($)","gross",[si]],["Other Income ($)","other",[si]],["Vacancy (%)","vac",[si]]].map(([l,k])=><div key={k} style={{marginBottom:10}}><FL l={l}/><Inp val={inc[k]} set={v=>si(p=>({...p,[k]:v}))} mono/></div>)}</div>
        <div style={{...P,marginTop:14}}><SL>Expenses</SL>{Object.entries(exp).map(([k,v])=><div key={k} style={{marginBottom:9}}><FL l={k.replace("2","")+" ($)"}/><Inp val={v} set={nv=>se(p=>({...p,[k]:nv}))} mono/></div>)}</div>
      </div>
      <div style={P}>
        <SL>NOI Waterfall</SL>
        {[{l:"Gross Scheduled Income",v:gross,t:"inc"},{l:`Vacancy Loss (${inc.vac}%)`,v:-vacL,t:"loss"},{l:"Other Income",v:oth,t:"inc"},{l:"Effective Gross Income",v:egi,t:"tot"},{l:"Total Operating Expenses",v:-totalExp,t:"loss"},{l:"Net Operating Income",v:noi,t:"noi"}].map((r,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${r.t==="noi"?C.borderGold:C.border}`,background:r.t==="noi"?`${C.goldMuted}0E`:"transparent"}}>
            <span style={{fontSize:12,color:r.t==="noi"?C.goldBright:r.t==="tot"?C.text:C.muted}}>{r.l}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:r.t==="noi"?C.goldBright:r.v<0?C.danger:r.t==="tot"?C.white:C.text}}>{r.v<0?`-$${Math.abs(Math.round(r.v)).toLocaleString()}`:`$${Math.round(r.v).toLocaleString()}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LTVCalc() {
  const [v,sv]=useState({price:"2500000",loan:"1750000",appraised:"2600000",constrCost:"0"});
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const price=parseFloat(v.price)||0,loan=parseFloat(v.loan)||0,app=parseFloat(v.appraised)||price;
  const ltv=price>0?(loan/price*100):0,ltc=(price+parseFloat(v.constrCost||0))>0?(loan/(price+(parseFloat(v.constrCost)||0))*100):0,ltarv=app>0?(loan/app*100):0;
  return(
    <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:18}}>
      <div style={P}>{[["Purchase Price ($)","price"],["Loan Amount ($)","loan"],["Appraised Value ($)","appraised"],["Construction Cost ($)","constrCost"]].map(([l,k])=><div key={k} style={{marginBottom:11}}><FL l={l}/><Inp val={v[k]} set={s(k)} mono/></div>)}</div>
      <div style={P}>
        <SL>Leverage Analysis</SL>
        {[{l:"LTV",v:ltv,max:80},{l:"LTC",v:ltc,max:85},{l:"LTARV",v:ltarv,max:75}].map((m,i)=>(
          <div key={i} style={{marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,color:C.muted}}>{m.l}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:m.v<=m.max?C.success:C.danger}}>{m.v>0?`${m.v.toFixed(1)}%`:"—"}</span></div>
            <div style={{height:7,background:C.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(m.v,100)}%`,background:m.v<=m.max?C.success:C.danger,borderRadius:3,transition:"width .5s"}}/></div>
            <div style={{fontSize:9,color:C.dim,marginTop:3}}>Lender threshold: ≤{m.max}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IRRCalc() {
  const [v,sv]=useState({price:"2500000",noi:"175000",ltv:"70",rate:"6.75",amort:"25",growth:"3",hold:"5",exitCap:"6.0",cc:"2"});
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const price=parseFloat(v.price)||0,noi0=parseFloat(v.noi)||0,ltv=parseFloat(v.ltv)/100||0;
  const r=parseFloat(v.rate)/100/12||0,am=parseFloat(v.amort)*12,growth=parseFloat(v.growth)/100||0.03;
  const hold=parseInt(v.hold)||5,exitCap=parseFloat(v.exitCap)/100||0.06;
  const loan=price*ltv,mPmt=r>0?loan*(r*Math.pow(1+r,am))/(Math.pow(1+r,am)-1):0,annDebt=mPmt*12;
  const equity=price*(1-ltv)*(1+(parseFloat(v.cc)/100||0.02));
  const noiExit=noi0*Math.pow(1+growth,hold);
  let loanBal=loan;for(let m=1;m<=hold*12;m++){const int=loanBal*r;loanBal-=(mPmt-int);}
  const sale=exitCap>0?(noiExit/exitCap):0,proc=sale-loanBal;
  const cfs=[-equity,...Array.from({length:hold},(_,i)=>(noi0*Math.pow(1+growth,i))-annDebt)];
  cfs[cfs.length-1]+=proc;
  const em=equity>0?(proc+cfs.slice(1).reduce((s,v)=>s+v,0))/equity:0;
  let irr=0.15;for(let i=0;i<100;i++){const val=cfs.reduce((s,cf,j)=>s+cf/Math.pow(1+irr,j),0);const dv=cfs.reduce((s,cf,j)=>s-j*cf/Math.pow(1+irr,j+1),0);if(Math.abs(dv)<0.001)break;irr-=val/dv;}
  return(
    <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:18}}>
      <div style={P}>{[["Purchase Price ($)","price"],["Year 1 NOI ($)","noi"],["LTV (%)","ltv"],["Rate (%)","rate"],["NOI Growth (%/yr)","growth"],["Hold Period (yrs)","hold"],["Exit Cap Rate (%)","exitCap"],["Closing Costs (%)","cc"]].map(([l,k])=><div key={k} style={{marginBottom:9}}><FL l={l}/><Inp val={v[k]} set={s(k)} mono/></div>)}</div>
      <div>
        <div style={{...P,marginBottom:14}}><SL>Returns</SL>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[{l:"Equity",v:`$${Math.round(equity).toLocaleString()}`,ok:true},{l:"Exit Price",v:sale>0?`$${Math.round(sale).toLocaleString()}`:"—",ok:sale>price},{l:"Equity Multiple",v:`${em.toFixed(2)}x`,ok:em>=2},{l:"IRR",v:`${(irr*100).toFixed(1)}%`,ok:irr>=0.12}].map((m,i)=>(
              <div key={i} style={{background:C.card2,borderRadius:8,padding:14}}><div style={{fontSize:10,color:C.muted,marginBottom:5}}>{m.l}</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:600,color:m.ok?C.success:C.danger}}>{m.v}</div></div>
            ))}
          </div>
        </div>
        <div style={P}><SL>Cash Flow by Year</SL>{cfs.slice(1).map((cf,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:12,color:C.muted}}>Year {i+1}{i===hold-1?" (+ sale)":""}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:cf>0?C.success:C.danger}}>${Math.round(cf).toLocaleString()}</span></div>)}</div>
      </div>
    </div>
  );
}

function CFProj() {
  const [v,sv]=useState({price:"2500000",noi:"175000",ltv:"70",rate:"6.75",amort:"25",growth:"3"});
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const price=parseFloat(v.price)||0,noi0=parseFloat(v.noi)||0,ltv=parseFloat(v.ltv)/100||0,r=parseFloat(v.rate)/100/12||0,am=parseFloat(v.amort)*12,growth=parseFloat(v.growth)/100||0.03;
  const loan=price*ltv,mPmt=r>0?loan*(r*Math.pow(1+r,am))/(Math.pow(1+r,am)-1):0,annDebt=mPmt*12,equity=price*(1-ltv);
  const rows=Array.from({length:5},(_,i)=>{const n=noi0*Math.pow(1+growth,i),cf=n-annDebt,coc=equity>0?(cf/equity*100):0;return{yr:i+1,noi:Math.round(n),cf:Math.round(cf),coc:coc.toFixed(1)};});
  return(
    <div style={P}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:22}}>
        {[["Purchase Price ($)","price"],["Year 1 NOI ($)","noi"],["LTV (%)","ltv"],["Rate (%)","rate"],["NOI Growth (%)","growth"]].map(([l,k])=><div key={k}><FL l={l}/><Inp val={v[k]} set={s(k)} mono/></div>)}
      </div>
      <SL>5-Year Cash Flow Projection</SL>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Year","NOI","Annual Debt Svc","Before-Tax CF","CoC Return"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"right",fontSize:9,color:C.muted,fontWeight:400,fontFamily:"'DM Mono',monospace",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{rows.map(row=><tr key={row.yr} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"10px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.muted}}>Yr {row.yr}</td><td style={{padding:"10px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.text}}>${row.noi.toLocaleString()}</td><td style={{padding:"10px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.muted}}>${Math.round(annDebt).toLocaleString()}</td><td style={{padding:"10px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:row.cf>0?C.success:C.danger}}>${row.cf.toLocaleString()}</td><td style={{padding:"10px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:parseFloat(row.coc)>6?C.success:C.warn}}>{row.coc}%</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function SensMatrix() {
  const baseNOI=175000,basePrice=2500000;
  const caps=[4.5,5.0,5.5,6.0,6.5,7.0,7.5],noiVars=[-15,-10,-5,0,5,10,15];
  const val=(nv,cr)=>Math.round((baseNOI*(1+nv/100))/(cr/100)/1000);
  const base=basePrice/1000;
  return(
    <div style={P}>
      <SL>Sensitivity Matrix — Property Value ($K) vs NOI Δ and Cap Rate</SL>
      <div style={{overflowX:"auto",marginTop:14}}>
        <table style={{borderCollapse:"collapse"}}>
          <thead><tr><th style={{padding:"7px 10px",fontSize:9,color:C.muted,fontWeight:400,textAlign:"left",fontFamily:"'DM Mono',monospace"}}>NOI Δ \ Cap</th>{caps.map(cr=><th key={cr} style={{padding:"7px 10px",fontSize:9,color:C.muted,fontWeight:400,textAlign:"right",fontFamily:"'DM Mono',monospace"}}>{cr}%</th>)}</tr></thead>
          <tbody>{noiVars.map(nv=><tr key={nv}><td style={{padding:"7px 10px",fontSize:11,fontFamily:"'DM Mono',monospace",color:nv===0?C.gold:nv>0?C.success:C.danger,borderRight:`1px solid ${C.border}`}}>{nv===0?"Base":`${nv>0?"+":""}${nv}%`}</td>{caps.map(cr=>{const v2=val(nv,cr);const diff=(v2-base)/base;return<td key={cr} style={{padding:"7px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,background:diff>0.05?C.successBg:diff<-0.05?C.dangerBg:"transparent",color:diff>0.1?C.success:diff<-0.1?C.danger:C.text}}>${v2}K</td>;})}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── LENDER ENGINE ─── */
function LenderEngine() {
  const [deal,setDeal]=useState({propType:"Multifamily",loanAmt:"1750000",ltv:"70",dscr:"1.35",purpose:"Acquisition"});
  const [searched,setSearched]=useState(false);
  const [filter,setFilter]=useState("all");
  const [query,setQuery]=useState("");
  const df=k=>v=>setDeal(p=>({...p,[k]:v}));
  const matches=useMemo(()=>searched?matchLenders(deal):[],[searched,deal]);
  const filtered=matches.filter(l=>{if(filter!=="all"&&l.type!==filter)return false;if(query&&!l.name.toLowerCase().includes(query.toLowerCase()))return false;return true;});
  const TYPES=["all","National Bank","Debt Fund","Life Company","CMBS","Bridge","Credit Union","Community Bank"];
  return(
    <div className="au" style={{maxWidth:1080}}>
      <h2 style={H2}>Lender Intelligence Engine</h2>
      <p style={{...Sub,marginBottom:22}}>Match your deal against 12 active CRE lenders. Ranked by fit score.</p>
      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:18}}>
        <div style={P}>
          <SL>Deal Profile</SL>
          <div style={{marginBottom:11}}><FL l="Property Type"/><Sel val={deal.propType} set={df("propType")} opts={PROP_TYPES}/></div>
          <div style={{marginBottom:11}}><FL l="Loan Amount ($)"/><Inp val={deal.loanAmt} set={df("loanAmt")} mono/></div>
          <div style={{marginBottom:11}}><FL l="LTV (%)"/><Inp val={deal.ltv} set={df("ltv")} mono/></div>
          <div style={{marginBottom:11}}><FL l="DSCR"/><Inp val={deal.dscr} set={df("dscr")} mono/></div>
          <div style={{marginBottom:18}}><FL l="Loan Purpose"/><Sel val={deal.purpose} set={df("purpose")} opts={LOAN_PURPOSES}/></div>
          <button onClick={()=>setSearched(true)} style={{...btnGold,width:"100%",padding:"10px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontSize:13}}><Search size={14}/>Match Lenders</button>
          {searched&&<p style={{fontSize:10,color:C.success,textAlign:"center",marginTop:8}}>✓ {filtered.filter(l=>l.eligible).length} eligible lenders</p>}
        </div>
        <div>
          {!searched?<div style={{...P,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:380,opacity:.5}}><Database size={36} color={C.muted} style={{marginBottom:10}}/><p style={{color:C.muted,fontSize:13}}>Enter deal profile and match</p></div>:(
            <>
              <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search lenders..." style={{flex:1,minWidth:160,...IS}}/>
                {TYPES.map(t=><button key={t} onClick={()=>setFilter(t)} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${filter===t?C.borderGold:C.border}`,background:filter===t?`${C.goldMuted}22`:"transparent",color:filter===t?C.gold:C.muted,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>{t==="all"?"All":t}</button>)}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {filtered.map((l,i)=><LCard key={l.id} l={l} rank={i+1}/>)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LCard({l,rank}) {
  const [exp,setExp]=useState(false);
  const sc=l.matchScore>=80?C.success:l.matchScore>=60?C.goldBright:l.matchScore>=40?C.warn:C.muted;
  const TC={"National Bank":C.blue,"Debt Fund":C.purple,"Life Company":C.gold,"CMBS":C.blue,"Bridge":C.danger,"Credit Union":C.success,"Community Bank":C.teal};
  return(
    <div style={{background:C.surface,border:`1px solid ${l.eligible?C.borderBlue:C.border}`,borderRadius:12,overflow:"hidden"}}>
      <div onClick={()=>setExp(s=>!s)} style={{padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:26,height:26,background:C.card,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{l.logo}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}><span style={{fontSize:13,fontWeight:500,color:C.white}}>{l.name}</span><span style={{fontSize:8,padding:"2px 6px",borderRadius:3,background:`${TC[l.type]||C.muted}18`,color:TC[l.type]||C.muted,fontFamily:"'DM Mono',monospace"}}>{l.type}</span>{!l.eligible&&<span style={{fontSize:8,padding:"2px 6px",borderRadius:3,background:C.warnBg,color:C.warn}}>INELIGIBLE</span>}</div>
          <p style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.specialty}</p>
        </div>
        <div style={{textAlign:"center",flexShrink:0}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:sc,lineHeight:1}}>{l.matchScore}</div><div style={{fontSize:8,color:C.muted,fontFamily:"'DM Mono',monospace"}}>MATCH</div></div>
        <ChevronDown size={13} color={C.muted} style={{transform:exp?"rotate(180deg)":"none",transition:"transform .2s"}}/>
      </div>
      {exp&&<div className="ai" style={{borderTop:`1px solid ${C.border}`,padding:"14px 16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:14}}>
          <div><div style={{fontSize:9,color:C.muted,marginBottom:6}}>Loan Parameters</div>{[["Range",`$${(l.minLoan/1e6).toFixed(1)}M – $${(l.maxLoan/1e6).toFixed(0)}M`],["Max LTV",`${l.maxLTV}%`],["Min DSCR",`${l.minDSCR}x`],["Rate",l.rateRange],["Term",l.term]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:C.muted}}>{k}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.text}}>{v}</span></div>)}</div>
          <div><div style={{fontSize:9,color:C.muted,marginBottom:6}}>Match</div>{l.reasons.map((r,i)=><div key={i} style={{display:"flex",gap:5,marginBottom:4}}><Check size={10} color={C.success}/><span style={{fontSize:11,color:C.success}}>{r}</span></div>)}{l.flags.map((f,i)=><div key={i} style={{display:"flex",gap:5,marginBottom:4}}><AlertCircle size={10} color={C.warn}/><span style={{fontSize:11,color:C.warn}}>{f}</span></div>)}</div>
        </div>
        <div style={{background:C.card,borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",gap:16}}><div style={{display:"flex",alignItems:"center",gap:5}}><Mail size={11} color={C.muted}/><span style={{fontSize:11,color:C.muted}}>{l.contact}</span></div><div style={{display:"flex",alignItems:"center",gap:5}}><Phone size={11} color={C.muted}/><span style={{fontSize:11,color:C.muted}}>{l.phone}</span></div></div>
          <button style={{...btnGold,padding:"5px 12px",fontSize:11,display:"flex",alignItems:"center",gap:5}}><ExternalLink size={10}/>Contact</button>
        </div>
      </div>}
    </div>
  );
}

/* ─── APEX SCORE ─── */
function APEXScore() {
  const [v,sv]=useState({capRate:"6.2",dscr:"1.38",ltv:"70",propType:"Multifamily",loanAmt:"1750000",purpose:"Acquisition"});
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const score=useMemo(()=>calcAPEXScore(v),[v]);
  const gc=score.score>=75?C.success:score.score>=55?C.goldBright:score.score>=40?C.warn:C.danger;
  return(
    <div className="au" style={{maxWidth:880}}>
      <h2 style={H2}>APEX Deal Scoring</h2>
      <p style={{...Sub,marginBottom:22}}>Live 5-factor deal scoring. Updates as you type.</p>
      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:18}}>
        <div style={P}>
          <SL>Deal Inputs</SL>
          {[["Cap Rate (%)","capRate"],["DSCR","dscr"],["LTV (%)","ltv"],["Loan Amount ($)","loanAmt"]].map(([l,k])=><div key={k} style={{marginBottom:11}}><FL l={l}/><Inp val={v[k]} set={s(k)} mono/></div>)}
          <div style={{marginBottom:11}}><FL l="Property Type"/><Sel val={v.propType} set={s("propType")} opts={PROP_TYPES}/></div>
          <div><FL l="Loan Purpose"/><Sel val={v.purpose} set={s("purpose")} opts={LOAN_PURPOSES}/></div>
        </div>
        <div>
          <div style={{...P,background:`linear-gradient(160deg, ${C.card}, ${C.card2})`,border:`1px solid ${C.borderGold}`,textAlign:"center",padding:28,marginBottom:14}}>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".14em",marginBottom:10}}>APEX INTELLIGENCE SCORE</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:88,fontWeight:700,color:gc,lineHeight:1}}>{score.score}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:gc,marginBottom:8}}>{score.grade}</div>
            <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden",maxWidth:260,margin:"0 auto 10px"}}><div style={{height:"100%",width:`${score.score}%`,background:`linear-gradient(90deg, ${gc}, ${gc}CC)`,transition:"width .6s"}}/></div>
            <p style={{fontSize:12,color:C.muted}}>{score.score>=85?"Institutional quality — broad lender appetite":score.score>=70?"Strong — most lenders will engage":score.score>=55?"Acceptable — selective lender market":score.score>=40?"Marginal — limited options":"Challenging — deal needs restructuring"}</p>
          </div>
          <div style={P}>
            <SL>Factor Breakdown</SL>
            {score.factors.map((f,i)=>(
              <div key={i} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,color:C.text}}>{f.name}</span><div style={{display:"flex",gap:8}}><span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.muted}}>{f.score}/{f.max}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:500,color:f.grade==="A"?C.success:f.grade==="B"?C.goldBright:f.grade==="C"?C.warn:C.danger}}>{f.grade}</span></div></div>
                <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${(f.score/f.max)*100}%`,background:f.grade==="A"?C.success:f.grade==="B"?C.gold:f.grade==="C"?C.warn:C.danger,transition:"width .5s"}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MICRO COMPONENTS ─── */
function Logo(){return<div style={{display:"flex",alignItems:"center",gap:8}}><LogoIcon/><span style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:600,fontSize:18,color:C.white,letterSpacing:".04em"}}>Hy<span style={{color:C.gold}}>CRE</span></span></div>;}
function LogoIcon(){return<div style={{width:28,height:28,background:`linear-gradient(135deg, ${C.gold}, ${C.goldBright})`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,color:C.bg,fontSize:14}}>A</span></div>;}
function Pill({children}){return<div style={{display:"inline-flex",alignItems:"center",gap:6,background:`${C.goldMuted}18`,border:`1px solid ${C.borderGold}`,borderRadius:100,padding:"5px 14px",marginBottom:14}}><span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.gold,letterSpacing:".12em",textTransform:"uppercase"}}>{children}</span></div>;}
function FL({l}){return<label style={{fontSize:10,fontWeight:500,color:C.muted,textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:5}}>{l}</label>;}
function SL({children}){return<div style={{fontSize:9,fontFamily:"'DM Mono',monospace",letterSpacing:".12em",color:C.gold,textTransform:"uppercase",marginBottom:12}}>{children}</div>;}
function FI({label,val,set,ph,type="text",err,mono,suffix}){return<div style={{marginBottom:14}}><label style={{fontSize:11,fontWeight:500,color:C.muted,textTransform:"uppercase",letterSpacing:".08em",display:"block",marginBottom:5}}>{label}</label><div style={{position:"relative",display:"flex",alignItems:"center"}}><input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{...IS,fontFamily:mono?"'DM Mono',monospace":"'DM Sans',sans-serif",border:`1px solid ${err?C.danger:C.border}`,paddingRight:suffix?"36px":"12px"}}/>{suffix&&<div style={{position:"absolute",right:10}}>{suffix}</div>}</div>{err&&<p style={{fontSize:10,color:C.danger,marginTop:3}}>{err}</p>}</div>;}
function Inp({val,set,ph,mono}){return<input value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{...IS,fontFamily:mono?"'DM Mono',monospace":"'DM Sans',sans-serif"}}/>;}
function Sel({val,set,opts}){return<select value={val} onChange={e=>set(e.target.value)} style={{...IS,cursor:"pointer"}}>{opts.map(o=><option key={o}>{o}</option>)}</select>;}

const P={background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20};
const IS={width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:C.text,outline:"none",fontFamily:"'DM Sans',sans-serif"};
const btnGold={background:`linear-gradient(90deg, ${C.gold}, ${C.goldBright})`,color:C.bg,border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"9px 20px",fontSize:14,transition:"opacity .2s"};
const btnOutline={background:"transparent",color:C.muted,border:`1px solid ${C.border}`,borderRadius:8,fontWeight:400,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"9px 18px",fontSize:13};
const H2={fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(24px,3.5vw,38px)",fontWeight:600,color:C.white,lineHeight:1.15};
const Sub={fontSize:14,color:C.muted,lineHeight:1.65};
const GoldGrad={background:`linear-gradient(135deg, ${C.gold}, ${C.goldBright})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"};
