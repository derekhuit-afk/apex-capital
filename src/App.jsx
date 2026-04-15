import { useState, useEffect, useRef, useMemo } from "react";
import {
  Check, Lock, BarChart3, Brain, Target, FileText, Database,
  BookOpen, Award, ChevronRight, ArrowRight, X, Menu,
  Bell, Zap, TrendingUp, TrendingDown, AlertCircle, Building2,
  Activity, Shield, Search, Download, RefreshCw, Filter,
  Globe, Phone, Mail, ExternalLink, Layers, Eye, EyeOff,
  CheckCircle, XCircle, Info, Send, User, Play, Clock,
  ChevronDown, LogOut, MapPin, DollarSign, Star, Users, Copy
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
  // ─── AGENCY / GSE MULTIFAMILY ───
  { id:1, name:"Walker & Dunlop", type:"Agency/GSE", logo:"🏛", minLoan:1000000, maxLoan:500000000, maxLTV:80, minDSCR:1.25, propTypes:["Multifamily","Affordable Housing","Senior Housing"], markets:"Nationwide", rateRange:"5.85–7.10%", term:"5,7,10,12yr", amort:"30yr", contact:"wdinfo@walkerdunlop.com", phone:"(301) 215-5500", website:"walkerdunlop.com", specialty:"#1 Fannie Mae/Freddie Mac DUS lender. Multifamily, affordable, seniors housing.", notes:"Largest commercial real estate finance company in the US by Fannie Mae volume." },
  { id:2, name:"Berkadia Commercial Mortgage", type:"Agency/GSE", logo:"🏛", minLoan:1000000, maxLoan:500000000, maxLTV:80, minDSCR:1.25, propTypes:["Multifamily","Affordable Housing","Senior Housing","Student Housing"], markets:"Nationwide", rateRange:"5.90–7.20%", term:"5,7,10yr", amort:"30yr", contact:"berkadia.com/contact", phone:"(215) 328-5500", website:"berkadia.com", specialty:"Top Fannie Mae/Freddie Mac/HUD lender. Full-service multifamily capital." },
  { id:3, name:"Greystone", type:"Agency/GSE", logo:"🏛", minLoan:1000000, maxLoan:500000000, maxLTV:80, minDSCR:1.25, propTypes:["Multifamily","Affordable Housing","Healthcare","Senior Housing"], markets:"Nationwide", rateRange:"5.80–7.15%", term:"5,7,10,35yr", amort:"30–35yr", contact:"greyco.com/contact", phone:"(212) 896-9800", website:"greyco.com", specialty:"Fannie Mae, Freddie Mac, HUD/FHA, CMBS multifamily specialist." },
  { id:4, name:"CBRE Multifamily Capital", type:"Agency/GSE", logo:"🏢", minLoan:1000000, maxLoan:1000000000, maxLTV:80, minDSCR:1.25, propTypes:["Multifamily","Affordable Housing","Senior Housing","Student Housing"], markets:"Nationwide", rateRange:"5.75–7.00%", term:"5,7,10,12yr", amort:"30yr", contact:"cbre.com/real-estate-finance", phone:"(214) 979-6100", website:"cbre.com", specialty:"Fannie/Freddie DUS, HUD, life company, CMBS, bridge. Full spectrum." },
  { id:5, name:"Lument (formerly ORIX Real Estate Capital)", type:"Agency/GSE", logo:"🏛", minLoan:1000000, maxLoan:500000000, maxLTV:80, minDSCR:1.25, propTypes:["Multifamily","Affordable Housing","Senior Housing","Healthcare"], markets:"Nationwide", rateRange:"5.85–7.20%", term:"5,7,10,35yr", amort:"30–35yr", contact:"lument.com/contact", phone:"(212) 543-7000", website:"lument.com", specialty:"Fannie/Freddie/HUD multifamily, senior housing, healthcare lending." },

  // ─── LIFE COMPANIES ───
  { id:6, name:"MetLife Investment Management", type:"Life Company", logo:"🏢", minLoan:10000000, maxLoan:500000000, maxLTV:65, minDSCR:1.30, propTypes:["Multifamily","Office","Industrial","Retail","Hotel"], markets:"Top 30 MSAs", rateRange:"5.50–6.75%", term:"10,15,20yr", amort:"25–30yr", contact:"metlife.com/institutional/strategies/real-estate", phone:"(973) 355-4000", website:"metlife.com", specialty:"Core, core-plus stabilized assets. One of largest CRE debt investors in the US." },
  { id:7, name:"PGIM Real Estate Finance (Prudential)", type:"Life Company", logo:"🏢", minLoan:5000000, maxLoan:500000000, maxLTV:65, minDSCR:1.30, propTypes:["Multifamily","Office","Industrial","Retail","Hotel","Self-Storage"], markets:"Top 50 MSAs", rateRange:"5.55–6.80%", term:"10,15,20yr", amort:"25–30yr", contact:"pgimrealestate.com/contact", phone:"(973) 367-7521", website:"pgimrealestate.com", specialty:"Global institutional lender. Full capital stack across asset types." },
  { id:8, name:"New York Life Real Estate Investors", type:"Life Company", logo:"🏢", minLoan:5000000, maxLoan:300000000, maxLTV:65, minDSCR:1.30, propTypes:["Multifamily","Office","Industrial","Retail"], markets:"Top 30 MSAs", rateRange:"5.50–6.70%", term:"10,15,20yr", amort:"25–30yr", contact:"newyorklifeinvestments.com", phone:"(212) 576-7000", website:"newyorklifeinvestments.com", specialty:"Long-term fixed rate. Conservative underwriting. Core stabilized properties." },
  { id:9, name:"Northwestern Mutual Real Estate", type:"Life Company", logo:"🏢", minLoan:10000000, maxLoan:400000000, maxLTV:65, minDSCR:1.35, propTypes:["Multifamily","Office","Industrial","Retail"], markets:"Top 25 MSAs", rateRange:"5.45–6.65%", term:"10,15,20yr", amort:"25–30yr", contact:"northwesternmutual.com/financial-professionals/real-estate", phone:"(414) 271-1444", website:"northwesternmutual.com", specialty:"Conservative life company. Premier core assets only. Ultra-long term fixed." },
  { id:10, name:"Principal Real Estate Investors", type:"Life Company", logo:"🏢", minLoan:5000000, maxLoan:300000000, maxLTV:65, minDSCR:1.30, propTypes:["Multifamily","Office","Industrial","Retail","Hotel"], markets:"Top 50 MSAs", rateRange:"5.60–6.85%", term:"10,15,20yr", amort:"25–30yr", contact:"principalam.com/real-estate", phone:"(515) 247-0920", website:"principalam.com", specialty:"Life company with full real estate debt platform." },
  { id:11, name:"Pacific Life Real Estate Finance", type:"Life Company", logo:"🏢", minLoan:5000000, maxLoan:200000000, maxLTV:65, minDSCR:1.30, propTypes:["Multifamily","Office","Industrial","Retail"], markets:"Top 50 MSAs", rateRange:"5.60–6.90%", term:"10,15,20yr", amort:"25–30yr", contact:"pacificlife.com/corporate/contact-us", phone:"(949) 219-3011", website:"pacificlife.com", specialty:"Life company CRE debt. Strong multifamily appetite. West Coast presence." },
  { id:12, name:"Nuveen Real Estate (TIAA)", type:"Life Company", logo:"🏢", minLoan:10000000, maxLoan:500000000, maxLTV:65, minDSCR:1.35, propTypes:["Multifamily","Office","Industrial","Retail","Hotel"], markets:"Top 25 MSAs", rateRange:"5.45–6.60%", term:"10,15,20yr", amort:"25–30yr", contact:"nuveen.com/real-estate", phone:"(312) 917-8146", website:"nuveen.com", specialty:"TIAA-backed life company. Top-tier institutional CRE debt." },

  // ─── NATIONAL BANKS ───
  { id:13, name:"JPMorgan Chase Commercial Real Estate", type:"National Bank", logo:"🏦", minLoan:1000000, maxLoan:1000000000, maxLTV:75, minDSCR:1.25, propTypes:["Multifamily","Office","Retail","Industrial","Hotel","Mixed-Use"], markets:"Nationwide", rateRange:"6.00–7.75%", term:"3,5,7,10yr", amort:"25–30yr", contact:"jpmorgan.com/commercial-banking/real-estate", phone:"(877) 425-8100", website:"jpmorgan.com", specialty:"Largest US bank by assets. Full CRE capital solutions. Balance sheet + conduit." },
  { id:14, name:"Wells Fargo Commercial Real Estate", type:"National Bank", logo:"🏦", minLoan:1000000, maxLoan:500000000, maxLTV:75, minDSCR:1.25, propTypes:["Multifamily","Office","Retail","Industrial","Hotel","Mixed-Use","Self-Storage"], markets:"Nationwide", rateRange:"6.10–7.80%", term:"3,5,7,10yr", amort:"25–30yr", contact:"wellsfargo.com/com/financing/commercial-real-estate", phone:"(800) 869-3557", website:"wellsfargo.com", specialty:"Full-service CRE. Construction, bridge, permanent. Major DUS lender." },
  { id:15, name:"Bank of America Commercial Real Estate", type:"National Bank", logo:"🏦", minLoan:2000000, maxLoan:500000000, maxLTV:75, minDSCR:1.25, propTypes:["Multifamily","Office","Retail","Industrial","Hotel","Mixed-Use"], markets:"Nationwide", rateRange:"6.00–7.70%", term:"3,5,7,10yr", amort:"25–30yr", contact:"bofasecurities.com/investment-banking/real-estate.html", phone:"(800) 432-1000", website:"bankofamerica.com", specialty:"Balance sheet lending. LIHTC, construction, perm. Strong institutional relationships." },
  { id:16, name:"U.S. Bank Real Estate Finance", type:"National Bank", logo:"🏦", minLoan:1000000, maxLoan:300000000, maxLTV:75, minDSCR:1.25, propTypes:["Multifamily","Office","Retail","Industrial","Hotel","Mixed-Use","Senior Housing"], markets:"Nationwide", rateRange:"6.05–7.65%", term:"3,5,7,10yr", amort:"25–30yr", contact:"usbank.com/business-banking/commercial-real-estate.html", phone:"(800) 872-2657", website:"usbank.com", specialty:"Midwest and Western US focus. LIHTC, construction, permanent, bridge." },
  { id:17, name:"PNC Real Estate", type:"National Bank", logo:"🏦", minLoan:1000000, maxLoan:300000000, maxLTV:75, minDSCR:1.25, propTypes:["Multifamily","Office","Retail","Industrial","Hotel","Mixed-Use","Senior Housing"], markets:"Nationwide", rateRange:"6.10–7.70%", term:"3,5,7,10yr", amort:"25–30yr", contact:"pnc.com/en/commercial-banking/products/realestate.html", phone:"(888) 762-2265", website:"pnc.com", specialty:"Full CRE capital stack. Strong Mid-Atlantic, Southeast, Midwest presence." },
  { id:18, name:"Truist Real Estate Capital", type:"National Bank", logo:"🏦", minLoan:1000000, maxLoan:300000000, maxLTV:75, minDSCR:1.25, propTypes:["Multifamily","Office","Retail","Industrial","Hotel","Mixed-Use","Affordable Housing"], markets:"Nationwide", rateRange:"6.10–7.75%", term:"3,5,7,10yr", amort:"25–30yr", contact:"truist.com/solutions/commercial/real-estate", phone:"(800) 878-4782", website:"truist.com", specialty:"Former BB&T/SunTrust. Strong Southeast, Mid-Atlantic, Florida presence." },
  { id:19, name:"KeyBank Real Estate Capital", type:"National Bank", logo:"🏦", minLoan:1000000, maxLoan:300000000, maxLTV:75, minDSCR:1.25, propTypes:["Multifamily","Office","Retail","Industrial","Affordable Housing","Senior Housing"], markets:"Nationwide", rateRange:"6.00–7.60%", term:"3,5,7,10yr", amort:"25–30yr", contact:"key.com/business/industries/real-estate.jsp", phone:"(888) 539-4247", website:"key.com", specialty:"Full-service CRE. Multifamily specialist. Strong Midwest, Pacific Northwest." },
  { id:20, name:"Regions Real Estate Capital", type:"National Bank", logo:"🏦", minLoan:1000000, maxLoan:200000000, maxLTV:75, minDSCR:1.25, propTypes:["Multifamily","Office","Retail","Industrial","Hotel","Mixed-Use"], markets:"Southeast, Midwest, Texas", rateRange:"6.10–7.70%", term:"3,5,7,10yr", amort:"25–30yr", contact:"regions.com/commercial-banking/real-estate", phone:"(800) 734-4667", website:"regions.com", specialty:"Southeast and South-Central US specialist. Deep local market knowledge." },

  // ─── CMBS / CONDUIT ───
  { id:21, name:"Starwood Mortgage Capital", type:"CMBS", logo:"📊", minLoan:3000000, maxLoan:500000000, maxLTV:75, minDSCR:1.25, propTypes:["Office","Retail","Hotel","Industrial","Multifamily","Mixed-Use"], markets:"Nationwide", rateRange:"6.40–7.50%", term:"10yr", amort:"30yr", contact:"starwood.com/realestate/contact.html", phone:"(305) 695-6300", website:"starwood.com", specialty:"Major CMBS conduit lender. Non-recourse 10yr fixed. Full property spectrum." },
  { id:22, name:"Goldman Sachs Real Estate Finance", type:"CMBS", logo:"📊", minLoan:10000000, maxLoan:2000000000, maxLTV:75, minDSCR:1.25, propTypes:["Office","Retail","Hotel","Industrial","Multifamily","Mixed-Use"], markets:"Nationwide", rateRange:"6.20–7.25%", term:"10yr", amort:"30yr", contact:"goldmansachs.com/businesses/invest-manage/real-estate", phone:"(212) 902-1000", website:"goldmansachs.com", specialty:"Institutional CMBS. Major deals, trophy assets. Full capital stack." },
  { id:23, name:"Morgan Stanley Real Estate", type:"CMBS", logo:"📊", minLoan:5000000, maxLoan:1000000000, maxLTV:75, minDSCR:1.25, propTypes:["Office","Retail","Hotel","Industrial","Multifamily","Mixed-Use"], markets:"Nationwide", rateRange:"6.25–7.30%", term:"10yr", amort:"30yr", contact:"morganstanley.com/im/real-estate", phone:"(212) 761-4000", website:"morganstanley.com", specialty:"Global CMBS issuance. Institutional-grade properties and sponsors." },
  { id:24, name:"Citigroup Commercial Mortgage Trust", type:"CMBS", logo:"📊", minLoan:5000000, maxLoan:500000000, maxLTV:75, minDSCR:1.25, propTypes:["Office","Retail","Hotel","Industrial","Multifamily","Mixed-Use"], markets:"Nationwide", rateRange:"6.30–7.35%", term:"10yr", amort:"30yr", contact:"citibank.com/commercial-mortgage", phone:"(212) 559-1000", website:"citi.com", specialty:"Top-tier CMBS conduit. Full loan-to-securitization platform." },
  { id:25, name:"Rialto Mortgage Finance", type:"CMBS", logo:"📊", minLoan:2000000, maxLoan:150000000, maxLTV:75, minDSCR:1.25, propTypes:["Office","Retail","Hotel","Industrial","Multifamily","Mixed-Use","Self-Storage"], markets:"Nationwide", rateRange:"6.45–7.55%", term:"10yr", amort:"30yr", contact:"rialtomortgage.com", phone:"(305) 485-2060", website:"rialtomortgage.com", specialty:"Conduit specialist. Broad property type coverage. Competitive non-recourse pricing." },

  // ─── DEBT FUNDS / MORTGAGE REITs ───
  { id:26, name:"Blackstone Real Estate Debt Strategies", type:"Debt Fund", logo:"💼", minLoan:10000000, maxLoan:5000000000, maxLTV:80, minDSCR:1.15, propTypes:["Multifamily","Office","Industrial","Hotel","Mixed-Use","Retail","Self-Storage"], markets:"Nationwide", rateRange:"7.00–10.00%", term:"1–5yr", amort:"Interest only", contact:"blackstone.com/businesses/breds", phone:"(212) 583-5000", website:"blackstone.com", specialty:"World's largest alternative asset manager. Bridge, transitional, value-add at scale." },
  { id:27, name:"Starwood Property Trust", type:"Debt Fund", logo:"💼", minLoan:10000000, maxLoan:1000000000, maxLTV:80, minDSCR:1.15, propTypes:["Multifamily","Office","Industrial","Hotel","Mixed-Use","Retail"], markets:"Nationwide", rateRange:"7.25–10.50%", term:"1–5yr", amort:"Interest only", contact:"starwoodpropertytrust.com", phone:"(203) 422-8000", website:"starwoodpropertytrust.com", specialty:"Large commercial mortgage REIT. Senior and mezzanine debt." },
  { id:28, name:"ACORE Capital", type:"Debt Fund", logo:"💼", minLoan:10000000, maxLoan:500000000, maxLTV:80, minDSCR:1.10, propTypes:["Multifamily","Office","Industrial","Hotel","Mixed-Use","Retail","Self-Storage"], markets:"Nationwide", rateRange:"7.50–10.50%", term:"1–4yr", amort:"Interest only", contact:"acorecapital.com/contact", phone:"(855) 226-7300", website:"acorecapital.com", specialty:"Bridge and transitional lending specialist. $20B+ in originations." },
  { id:29, name:"Arbor Realty Trust", type:"Debt Fund", logo:"💼", minLoan:1000000, maxLoan:500000000, maxLTV:80, minDSCR:1.20, propTypes:["Multifamily","Self-Storage","Mobile Home Park","Single-Family Rental"], markets:"Nationwide", rateRange:"6.50–9.50%", term:"1–10yr", amort:"Varies", contact:"arborrealtytrust.com/contact", phone:"(516) 506-4200", website:"arborrealtytrust.com", specialty:"Multifamily REIT. Fannie/Freddie/HUD + bridge. Major small-balance MF lender." },
  { id:30, name:"Ladder Capital", type:"Debt Fund", logo:"💼", minLoan:2000000, maxLoan:500000000, maxLTV:80, minDSCR:1.20, propTypes:["Multifamily","Office","Industrial","Hotel","Retail","Mixed-Use","Self-Storage"], markets:"Nationwide", rateRange:"6.75–9.25%", term:"1–10yr", amort:"Varies", contact:"laddercapital.com/contact", phone:"(212) 715-2000", website:"laddercapital.com", specialty:"Commercial mortgage REIT. Balance sheet loans + CMBS. Broad appetite." },
  { id:31, name:"Ready Capital Corporation", type:"Debt Fund", logo:"💼", minLoan:1000000, maxLoan:100000000, maxLTV:80, minDSCR:1.20, propTypes:["Multifamily","Office","Retail","Industrial","Mixed-Use","Self-Storage"], markets:"Nationwide", rateRange:"7.00–10.00%", term:"1–5yr", amort:"Interest only/30yr", contact:"readycapital.com/contact", phone:"(212) 257-4600", website:"readycapital.com", specialty:"Small and middle market CRE lender. SBA 7(a) + bridge + permanent." },
  { id:32, name:"KKR Real Estate Finance Trust", type:"Debt Fund", logo:"💼", minLoan:10000000, maxLoan:1000000000, maxLTV:80, minDSCR:1.15, propTypes:["Multifamily","Office","Industrial","Hotel","Mixed-Use","Retail"], markets:"Nationwide", rateRange:"7.25–10.00%", term:"1–5yr", amort:"Interest only", contact:"kkr.com/businesses/real-estate", phone:"(212) 750-8300", website:"kkr.com", specialty:"KKR-sponsored mortgage REIT. Floating-rate senior loans on transitional assets." },
  { id:33, name:"Mesa West Capital (Morgan Stanley)", type:"Debt Fund", logo:"💼", minLoan:15000000, maxLoan:500000000, maxLTV:75, minDSCR:1.20, propTypes:["Multifamily","Office","Industrial","Hotel","Mixed-Use","Retail"], markets:"Nationwide", rateRange:"7.00–9.50%", term:"2–5yr", amort:"Interest only", contact:"morganstanley.com/im/real-estate", phone:"(213) 615-4000", website:"morganstanley.com", specialty:"Institutional bridge lender backed by Morgan Stanley. Value-add specialist." },
  { id:34, name:"Benefit Street Partners", type:"Debt Fund", logo:"💼", minLoan:5000000, maxLoan:250000000, maxLTV:80, minDSCR:1.15, propTypes:["Multifamily","Office","Industrial","Hotel","Mixed-Use","Retail","Self-Storage"], markets:"Nationwide", rateRange:"7.25–10.50%", term:"1–4yr", amort:"Interest only", contact:"benefitstreetpartners.com", phone:"(212) 588-6700", website:"benefitstreetpartners.com", specialty:"Franklin Templeton-affiliated. Bridge loans, transitional, value-add." },
  { id:35, name:"Ares Real Estate Finance", type:"Debt Fund", logo:"💼", minLoan:10000000, maxLoan:500000000, maxLTV:80, minDSCR:1.15, propTypes:["Multifamily","Office","Industrial","Hotel","Mixed-Use","Retail"], markets:"Nationwide", rateRange:"7.00–10.00%", term:"1–5yr", amort:"Interest only", contact:"aresmgmt.com/real-estate", phone:"(310) 201-4100", website:"aresmgmt.com", specialty:"$40B+ AUM real estate platform. Senior and subordinate debt." },

  // ─── BRIDGE / HARD MONEY ───
  { id:36, name:"Broadmark Realty Capital", type:"Bridge", logo:"⚡", minLoan:500000, maxLoan:50000000, maxLTV:75, minDSCR:1.00, propTypes:["Multifamily","Office","Retail","Industrial","Mixed-Use","Hotel","Land"], markets:"Western US, TX, CO, FL", rateRange:"10.00–13.00%", term:"6–24 months", amort:"Interest only", contact:"broadmark.com/contact", phone:"(206) 728-2600", website:"broadmark.com", specialty:"Short-term bridge and construction. Western US focus. Fast close." },
  { id:37, name:"Lima One Capital", type:"Bridge", logo:"⚡", minLoan:75000, maxLoan:20000000, maxLTV:75, minDSCR:1.00, propTypes:["Multifamily","Single-Family Rental","Mixed-Use"], markets:"Nationwide (40+ states)", rateRange:"9.50–13.50%", term:"6–24 months", amort:"Interest only", contact:"limaone.com/contact", phone:"(800) 390-4212", website:"limaone.com", specialty:"Rental portfolio, fix-and-flip, new construction. Fast underwriting." },
  { id:38, name:"RCN Capital", type:"Bridge", logo:"⚡", minLoan:50000, maxLoan:5000000, maxLTV:85, minDSCR:1.00, propTypes:["Multifamily","Single-Family Rental","Mixed-Use"], markets:"Nationwide (44 states)", rateRange:"9.00–12.50%", term:"12–24 months", amort:"Interest only", contact:"rcncapital.com/contact-us", phone:"(860) 432-5858", website:"rcncapital.com", specialty:"Fix-and-flip, rental, new construction. Competitive rates. Fast funding." },
  { id:39, name:"Kiavi (formerly LendingHome)", type:"Bridge", logo:"⚡", minLoan:100000, maxLoan:3000000, maxLTV:85, minDSCR:1.00, propTypes:["Single-Family Rental","Multifamily"], markets:"Nationwide (32 states)", rateRange:"9.00–13.00%", term:"12–24 months", amort:"Interest only", contact:"kiavi.com/contact", phone:"(888) 508-4212", website:"kiavi.com", specialty:"Tech-driven bridge lender. Fast approval. Rental and fix-and-flip." },
  { id:40, name:"CoreVest Finance", type:"Bridge", logo:"⚡", minLoan:500000, maxLoan:100000000, maxLTV:75, minDSCR:1.20, propTypes:["Multifamily","Single-Family Rental","Mobile Home Park","Self-Storage"], markets:"Nationwide", rateRange:"7.50–10.50%", term:"1–5yr", amort:"30yr/IO", contact:"corevestfinance.com/contact", phone:"(888) 585-5636", website:"corevestfinance.com", specialty:"Rental portfolio aggregator. SFR, small MF, BTR communities." },

  // ─── SBA LENDERS ───
  { id:41, name:"Live Oak Bank (SBA)", type:"SBA Lender", logo:"🌿", minLoan:150000, maxLoan:5000000, maxLTV:90, minDSCR:1.15, propTypes:["Office","Retail","Industrial","Hotel","Mixed-Use","Self-Storage"], markets:"Nationwide", rateRange:"Prime+2.25–2.75%", term:"10–25yr", amort:"25yr", contact:"liveoakbank.com/contact", phone:"(910) 202-8011", website:"liveoakbank.com", specialty:"Top SBA 7(a) lender. Owner-occupied CRE up to 90% LTV. No balloon." },
  { id:42, name:"Celtic Bank (SBA)", type:"SBA Lender", logo:"🌿", minLoan:250000, maxLoan:5000000, maxLTV:90, minDSCR:1.15, propTypes:["Office","Retail","Industrial","Hotel","Mixed-Use","Self-Storage"], markets:"Nationwide", rateRange:"Prime+2.25–2.75%", term:"10–25yr", amort:"25yr", contact:"celticbank.com/business/sba-loans", phone:"(877) 212-6228", website:"celticbank.com", specialty:"SBA 7(a) and 504 nationwide. Preferred lender status. Owner-occupied CRE." },
  { id:43, name:"Harvest Small Business Finance (SBA 504)", type:"SBA Lender", logo:"🌿", minLoan:500000, maxLoan:20000000, maxLTV:90, minDSCR:1.15, propTypes:["Office","Retail","Industrial","Mixed-Use","Hotel"], markets:"Nationwide", rateRange:"6.00–7.50%", term:"10–25yr", amort:"25yr", contact:"harvestsbf.com/contact", phone:"(888) 975-2922", website:"harvestsbf.com", specialty:"SBA 504 CDC. Long-term fixed rate. Owner-occupied CRE up to 90% LTV." },

  // ─── CREDIT UNIONS ───
  { id:44, name:"Alaska USA Federal Credit Union", type:"Credit Union", logo:"✨", minLoan:100000, maxLoan:15000000, maxLTV:80, minDSCR:1.20, propTypes:["Multifamily","Office","Retail","Industrial","Mixed-Use"], markets:"AK, WA, CA, AZ", rateRange:"6.00–7.50%", term:"5,7,10yr", amort:"20–25yr", contact:"alaskausa.org/business/loans", phone:"(907) 563-4567", website:"alaskausa.org", specialty:"Alaska's largest credit union. CRE and business loans. Strong Alaska market knowledge." },
  { id:45, name:"Navy Federal Credit Union (Business)", type:"Credit Union", logo:"✨", minLoan:250000, maxLoan:10000000, maxLTV:80, minDSCR:1.20, propTypes:["Office","Retail","Industrial","Mixed-Use","Multifamily"], markets:"Nationwide (military-affiliated)", rateRange:"6.00–7.75%", term:"5,7,10yr", amort:"20–25yr", contact:"navyfederal.org/business/loans/commercial-real-estate", phone:"(888) 842-6328", website:"navyfederal.org", specialty:"Military-community focused. Owner-occupied CRE. Nationwide access." },
  { id:46, name:"Northrim Bank (Alaska)", type:"Community Bank", logo:"🏔", minLoan:100000, maxLoan:20000000, maxLTV:80, minDSCR:1.20, propTypes:["Multifamily","Office","Retail","Industrial","Mixed-Use","Hotel"], markets:"Alaska", rateRange:"6.25–7.75%", term:"5,7,10yr", amort:"20–25yr", contact:"northrim.com/business/commercial-real-estate-loans", phone:"(907) 562-0062", website:"northrim.com", specialty:"Alaska's community bank. Deep statewide relationships. CRE across all AK markets." },
  { id:47, name:"First National Bank Alaska", type:"Community Bank", logo:"🏔", minLoan:100000, maxLoan:25000000, maxLTV:80, minDSCR:1.20, propTypes:["Multifamily","Office","Retail","Industrial","Mixed-Use","Hotel","Construction"], markets:"Alaska", rateRange:"6.25–7.75%", term:"5,7,10yr", amort:"20–25yr", contact:"fnbalaska.com/business/loans", phone:"(907) 777-4362", website:"fnbalaska.com", specialty:"Alaska's oldest bank. Full CRE platform. Construction, permanent, bridge." },

  // ─── REGIONAL BANKS ───
  { id:48, name:"Pacific Premier Bank", type:"Regional Bank", logo:"🏦", minLoan:500000, maxLoan:50000000, maxLTV:75, minDSCR:1.25, propTypes:["Multifamily","Office","Retail","Industrial","Mixed-Use","Self-Storage"], markets:"CA, WA, OR, AZ, NV, CO", rateRange:"6.25–7.75%", term:"5,7,10yr", amort:"25yr", contact:"pacificpremierbank.com/business/commercial-real-estate", phone:"(855) 800-4722", website:"pacificpremierbank.com", specialty:"West Coast regional. Full CRE spectrum. Strong California multifamily book." },
  { id:49, name:"Western Alliance Bank", type:"Regional Bank", logo:"🏦", minLoan:1000000, maxLoan:100000000, maxLTV:75, minDSCR:1.25, propTypes:["Multifamily","Office","Retail","Industrial","Hotel","Mixed-Use"], markets:"AZ, CA, CO, NV, TX, WA, OR", rateRange:"6.25–7.75%", term:"3,5,7,10yr", amort:"25–30yr", contact:"westernalliancebancorporation.com/commercial-banking/real-estate", phone:"(602) 389-3500", website:"westernalliancebancorporation.com", specialty:"Sun Belt specialist. Construction and perm. Strong hospitality and MF verticals." },
  { id:50, name:"Glacier Bancorp", type:"Regional Bank", logo:"🏔", minLoan:100000, maxLoan:30000000, maxLTV:80, minDSCR:1.20, propTypes:["Multifamily","Office","Retail","Industrial","Mixed-Use","Hotel"], markets:"MT, ID, WY, CO, UT, WA, AK, AZ, NV", rateRange:"6.25–7.75%", term:"5,7,10yr", amort:"20–25yr", contact:"glacierbancorp.com/business-banking/commercial-real-estate", phone:"(406) 756-4200", website:"glacierbancorp.com", specialty:"Mountain West regional. Deep community relationships. Alaska and Northwest focus." },
  { id:51, name:"Columbia Bank (Pacific Northwest)", type:"Regional Bank", logo:"🏦", minLoan:250000, maxLoan:50000000, maxLTV:75, minDSCR:1.25, propTypes:["Multifamily","Office","Retail","Industrial","Mixed-Use","Hotel","Self-Storage"], markets:"WA, OR, CA, ID", rateRange:"6.25–7.75%", term:"5,7,10yr", amort:"25yr", contact:"columbiabank.com/business/loans/commercial-real-estate", phone:"(877) 272-3678", website:"columbiabank.com", specialty:"Pacific NW specialist. Construction and perm. Strong WA/OR multifamily." },
  { id:52, name:"HomeStreet Bank", type:"Regional Bank", logo:"🏦", minLoan:500000, maxLoan:75000000, maxLTV:75, minDSCR:1.25, propTypes:["Multifamily","Office","Retail","Industrial","Mixed-Use","Hotel"], markets:"WA, OR, CA, HI, ID, MT, AK", rateRange:"6.25–7.75%", term:"3,5,7,10yr", amort:"25–30yr", contact:"homestreet.com/commercial-real-estate", phone:"(800) 719-8080", website:"homestreet.com", specialty:"Pacific NW/West Coast. Agency multifamily + balance sheet. Hawaii and Alaska deals." },
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
  {
    id:1, title:"CRE Foundations", subtitle:"The language, structure, and logic of commercial real estate",
    icon:"🏛", duration:"50 min", color:C.blue,
    topics:["Property types & asset classes","How CRE deals are structured","Key market participants","CRE vs residential investing","NOI, cap rate, and valuation basics","Reading a deal from the outside in"],
    formulas:[
      {name:"Net Operating Income",formula:"NOI = Gross Income − Vacancy − Operating Expenses",example:"$180,000 − $9,000 − $45,000 = $126,000 NOI"},
      {name:"Cap Rate",formula:"Cap Rate = NOI ÷ Property Value",example:"$126,000 ÷ $1,800,000 = 7.0% cap rate"},
      {name:"Property Value (Income Approach)",formula:"Value = NOI ÷ Cap Rate",example:"$126,000 ÷ 0.065 = $1,938,461"},
    ]
  },
  {
    id:2, title:"CRE Underwriting Deep Dive", subtitle:"Analyze any deal with speed, accuracy, and confidence",
    icon:"📊", duration:"70 min", color:C.purple,
    topics:["DSCR: the lender's #1 metric explained","LTV vs LTC vs LTARV — when each matters","Cash-on-cash return vs equity multiple","Stress testing a deal","Underwriting multifamily vs commercial","Red flags that kill deals in committee"],
    formulas:[
      {name:"Debt Service Coverage Ratio",formula:"DSCR = NOI ÷ Annual Debt Service",example:"$126,000 ÷ $96,000 = 1.31x DSCR"},
      {name:"Loan-to-Value",formula:"LTV = Loan Amount ÷ Appraised Value",example:"$1,260,000 ÷ $1,800,000 = 70% LTV"},
      {name:"Cash-on-Cash Return",formula:"CoC = Annual Cash Flow ÷ Total Cash Invested",example:"$30,000 ÷ $540,000 = 5.6% CoC"},
    ]
  },
  {
    id:3, title:"Lender Types & Capital Stack", subtitle:"Know who has money, what they want, and why it matters",
    icon:"🏦", duration:"60 min", color:C.gold,
    topics:["Agency vs life company vs debt fund vs bank","Senior debt, mezzanine, preferred equity, JV equity","How lenders price risk","What the capital stack looks like on a real deal","Recourse vs non-recourse — what you need to know","Bridge loans: when and why"],
    formulas:[
      {name:"Blended Cost of Capital",formula:"Weighted Avg Rate = (Sr Debt % × Sr Rate) + (Mezz % × Mezz Rate)",example:"(70% × 6.5%) + (15% × 11%) = 4.55% + 1.65% = 6.20%"},
      {name:"Debt Yield",formula:"Debt Yield = NOI ÷ Loan Amount",example:"$126,000 ÷ $1,260,000 = 10.0% debt yield"},
    ]
  },
  {
    id:4, title:"Deal Packaging Mastery", subtitle:"Build a lender-ready package that actually gets funded",
    icon:"📋", duration:"65 min", color:C.teal,
    topics:["The 7-section executive memo structure","Financial summary formatting lenders respond to","What kills a deal in the first 60 seconds","Rent rolls, T-12s, and operating statements","Supporting document checklist","Common packaging mistakes that cost you deals"],
    formulas:[
      {name:"Effective Gross Income",formula:"EGI = Gross Potential Rent − Vacancy − Credit Loss + Other Income",example:"$240,000 − $12,000 − $2,400 + $6,000 = $231,600"},
      {name:"Operating Expense Ratio",formula:"OER = Total Operating Expenses ÷ EGI",example:"$105,000 ÷ $231,600 = 45.3% OER"},
    ]
  },
  {
    id:5, title:"The CRE Sales Process", subtitle:"From cold contact to signed term sheet — the full cycle",
    icon:"🎯", duration:"65 min", color:C.rose,
    topics:["How capital finders actually make money","Building your prospect pipeline","The perfect CRE cold call script","Email sequences that get responses","Following up without being annoying","Closing the engagement agreement"],
    formulas:[
      {name:"Capital Finder Fee",formula:"Finder Fee = Loan Amount × Fee %",example:"$5,000,000 × 1.0% = $50,000 fee"},
      {name:"Pipeline Value",formula:"Pipeline Value = Avg Deal Size × Active Deals × Close Rate",example:"$4M × 8 × 35% = $11.2M funded pipeline"},
    ]
  },
  {
    id:6, title:"HMDA Data Prospecting", subtitle:"Turn public mortgage data into a funded deal machine",
    icon:"🔍", duration:"60 min", color:C.blue,
    topics:["What HMDA data is and why it's gold","How to read and filter HMDA records","Identifying refinance and acquisition targets","Building outreach sequences from HMDA","Multi-touch sequences that convert","Compliance: what you can and cannot do"],
    formulas:[
      {name:"Refi Opportunity Score",formula:"Score = (Current Rate − Market Rate) × LTV Quality × Time Since Origination",example:"Loan at 7.5% from 2022 at 65% LTV = high refi candidate"},
      {name:"Outreach Conversion",formula:"Deals Funded = Leads × Contact Rate × Conversion Rate",example:"500 leads × 12% contact × 8% close = 4.8 funded deals"},
    ]
  },
  {
    id:7, title:"Multifamily Deep Dive", subtitle:"The most lender-active asset class — master it completely",
    icon:"🏘", duration:"70 min", color:C.purple,
    topics:["Why multifamily dominates CRE lending","Agency (Fannie/Freddie) loan programs explained","How to underwrite a 12-unit vs 100-unit deal","Value-add multifamily: the full playbook","Market rent vs in-place rent — the gap is your pitch","Stabilization timelines and bridge-to-perm execution"],
    formulas:[
      {name:"Rent Premium Potential",formula:"Value Upside = (Market Rent − In-Place Rent) × Units × 12 ÷ Cap Rate",example:"($200 × 24 units × 12) ÷ 0.065 = $887,692 upside"},
      {name:"Gross Rent Multiplier",formula:"GRM = Purchase Price ÷ Annual Gross Rent",example:"$2,100,000 ÷ $252,000 = 8.3x GRM"},
    ]
  },
  {
    id:8, title:"Commercial Deal Types", subtitle:"Office, retail, industrial, hotel, self-storage — the full map",
    icon:"🏢", duration:"65 min", color:C.gold,
    topics:["Office: class A vs B vs C and what lenders think","Retail: NNN, strip, power center — lender appetite by type","Industrial: the darling asset class and why","Self-storage: underwriting and cap rate benchmarks","Hotel: the hardest asset to finance and how","Mixed-use: complexity and opportunity"],
    formulas:[
      {name:"NNN Lease Value",formula:"Value = Annual Base Rent ÷ Cap Rate (NNN basis)",example:"$120,000 NNN ÷ 0.055 = $2,181,818 value"},
      {name:"Hotel RevPAR",formula:"RevPAR = Occupancy Rate × Average Daily Rate",example:"72% × $149 = $107.28 RevPAR"},
    ]
  },
  {
    id:9, title:"Term Sheet Negotiation", subtitle:"Read every line, push the right levers, protect your client",
    icon:"📝", duration:"55 min", color:C.teal,
    topics:["Anatomy of a CRE term sheet","Rate, spread, index — what's actually negotiable","Prepayment: defeasance vs step-down vs yield maintenance","Recourse carve-outs and when to push back","Reserves: operating, replacement, capex","Good faith deposits and what happens if you walk"],
    formulas:[
      {name:"Defeasance Cost Estimate",formula:"Cost ≈ Loan Balance × (Current Rate − Treasury Rate) × Remaining Term",example:"$2M × (6.5% − 4.2%) × 4yrs ≈ $184,000 defeasance"},
      {name:"Step-Down Prepayment",formula:"Fee = Loan Balance × Step %",example:"Year 3 of 5-4-3-2-1: $2M × 3% = $60,000"},
    ]
  },
  {
    id:10, title:"Building Your CRE Capital Practice", subtitle:"Systems, scale, and income — building a real business",
    icon:"🚀", duration:"75 min", color:C.rose,
    topics:["The CRE capital finder business model — 6-figure roadmap","CRM and pipeline management","Building lender relationships that last","Referral networks: attorneys, CPAs, brokers","When to bring in equity partners","Getting licensed vs staying as a finder"],
    formulas:[
      {name:"Annual Revenue Model",formula:"Revenue = Avg Fee × Deals Closed Per Year",example:"$42,000 avg fee × 6 deals = $252,000/yr"},
      {name:"Deal Velocity",formula:"Deals/Year = (Monthly Outreach × Contact Rate × Close Rate) × 12",example:"(80 × 15% × 10%) × 12 = 14.4 deals/year potential"},
    ]
  },
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

function matchLenders({propType,loanAmt,ltv,dscr,state,purpose}) {
  const loan=parseFloat(loanAmt)||0,ltvN=parseFloat(ltv)||0,dscrN=parseFloat(dscr)||1.0;
  return LENDERS.map(l=>{
    let score=0;const reasons=[],flags=[];
    if(l.propTypes.includes(propType)){score+=30;reasons.push("Property type match");}
    else flags.push(`Does not lend on ${propType}`);
    if(loan>=l.minLoan&&loan<=l.maxLoan){score+=25;reasons.push("Loan amount in range");}
    else if(loan<l.minLoan)flags.push(`Min loan: $${l.minLoan>=1000000?(l.minLoan/1e6).toFixed(1)+'M':(l.minLoan/1000).toFixed(0)+'K'}`);
    else flags.push(`Max loan: $${(l.maxLoan/1e6).toFixed(0)}M`);
    if(ltvN<=l.maxLTV){score+=20;reasons.push(`LTV within ${l.maxLTV}% max`);}
    else flags.push(`LTV exceeds their ${l.maxLTV}% max`);
    if(dscrN>=l.minDSCR){score+=15;reasons.push(`DSCR above ${l.minDSCR}x floor`);}
    else flags.push(`DSCR below ${l.minDSCR}x minimum`);
    const mkt=l.markets.toLowerCase();
    if(mkt.includes("nationwide")){score+=10;reasons.push("Lends nationwide");}
    else if(state&&mkt.includes(state.toLowerCase())){score+=10;reasons.push(`Lends in ${state}`);}
    else if(state){flags.push(`May not lend in ${state} — verify`);}
    if(purpose&&(l.type==="Bridge"||l.type==="Debt Fund")&&(purpose==="Bridge/Value-Add"||purpose==="Construction")){score+=5;reasons.push("Deal type match");}
    if(purpose&&(l.type==="Life Company"||l.type==="National Bank")&&(purpose==="Acquisition"||purpose==="Refinance")){score+=5;reasons.push("Deal type match");}
    if(l.type==="Agency/GSE"&&propType==="Multifamily"){score+=5;reasons.push("Agency MF specialist");}
    return{...l,matchScore:Math.min(score,100),reasons,flags,eligible:score>=55};
  }).sort((a,b)=>b.matchScore-a.matchScore);
}

/* ─── APP ROOT ─── */
/* ─── AUTH HELPERS ─── */
function saveSession(token, user) {
  try { localStorage.setItem("hycre_token", token); localStorage.setItem("hycre_user", JSON.stringify(user)); } catch {}
}
function clearSession() {
  try { localStorage.removeItem("hycre_token"); localStorage.removeItem("hycre_user"); } catch {}
}
function loadSession() {
  try {
    const token = localStorage.getItem("hycre_token");
    const user = JSON.parse(localStorage.getItem("hycre_user") || "null");
    return { token, user };
  } catch { return { token: null, user: null }; }
}

export default function App() {
  const [view, setView] = useState("landing");
  const [selectedTier, setSelectedTier] = useState(null);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = FONTS;
    document.head.appendChild(s);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    // Check for password reset token in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "reset" || params.get("reset")) {
      setResetMode(true);
      setView("login");
      setAuthLoading(false);
      return () => { document.head.removeChild(s); window.removeEventListener("scroll", onScroll); };
    }

    // Restore session on load
    const { token, user: savedUser } = loadSession();
    if (token && savedUser) {
      fetch("/api/auth/me", { headers: { "Authorization": `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.user) {
            setUser({ ...data.user, token });
            setView("dashboard");
          } else { clearSession(); }
        })
        .catch(() => clearSession())
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }

    return () => { document.head.removeChild(s); window.removeEventListener("scroll", onScroll); };
  }, []);

  const go = (v) => { setView(v); window.scrollTo(0,0); };
  const openCheckout = (tid) => { setSelectedTier(tid); go("checkout"); };
  const openDash = (u) => { setUser(u); go("dashboard"); };
  const logout = () => { clearSession(); setUser(null); go("landing"); };

  // Auth loading splash
  if (authLoading) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <Logo/>
        <div style={{width:24,height:24,border:`2px solid ${C.borderGold}`,borderTopColor:C.goldBright,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"20px auto 0"}}/>
      </div>
    </div>
  );

  if (view === "checkout") return <Checkout tier={TIERS[selectedTier]} onBack={()=>go("landing")} onSuccess={openDash} />;
  if (view === "login") return <Login onBack={()=>go("landing")} onSuccess={openDash} resetMode={resetMode} />;
  if (view === "dashboard") return <Dashboard user={user} setUser={setUser} onLogout={logout} />;

  // Payment pending gate — logged in but not yet payment verified
  if (user && !user.payment_verified) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:C.surface,border:`1px solid ${C.borderGold}`,borderRadius:20,padding:48,maxWidth:440,width:"100%",textAlign:"center"}}>
        <div style={{width:56,height:56,background:`${C.goldMuted}22`,border:`1px solid ${C.borderGold}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><Lock size={22} color={C.gold}/></div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:C.white,marginBottom:10}}>Complete Your Setup</h2>
        <p style={{color:C.muted,marginBottom:32,fontSize:14,lineHeight:1.7}}>Your account is created. Choose a plan to unlock your dashboard.</p>
        {Object.values(TIERS).map(t=>(
          <button key={t.id} onClick={()=>openCheckout(t.id)} style={{width:"100%",padding:"12px 0",borderRadius:8,border:`1px solid ${t.id==="active"?"transparent":C.borderGold}`,background:t.id==="active"?`linear-gradient(90deg,${C.gold},${C.goldBright})`:"transparent",color:t.id==="active"?C.bg:C.gold,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:10}}>{t.cta} — {t.price}{t.period}</button>
        ))}
        <button onClick={logout} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:12,marginTop:8,fontFamily:"'DM Sans',sans-serif"}}>Sign out</button>
      </div>
    </div>
  );

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
  const [form,setForm]=useState({name:"",email:"",password:"",card:"",exp:"",cvv:""});
  const [tosAccepted,setTosAccepted]=useState(false);
  const [showCvv,setShowCvv]=useState(false);
  const [showPw,setShowPw]=useState(false);
  const [loading,setLoading]=useState(false);
  const [errors,setErrors]=useState({});
  const [legalModal,setLegalModal]=useState(null);
  const [payError,setPayError]=useState("");
  const [createdUser,setCreatedUser]=useState(null);
  const f=k=>v=>setForm(p=>({...p,[k]:v}));

  const validate=()=>{
    const e={};
    if(!form.name.trim())e.name="Required";
    if(!form.email.includes("@"))e.email="Valid email required";
    if(step===1&&(form.password.length<8))e.password="At least 8 characters required";
    if(step===1&&!tosAccepted)e.tos="You must accept the Terms of Service and Privacy Policy to continue";
    if(step===2){if(form.card.replace(/\s/g,"").length<16)e.card="Valid card required";if(!form.exp.match(/^\d{2}\/\d{2}$/))e.exp="MM/YY";if(form.cvv.length<3)e.cvv="3-4 digits";}
    setErrors(e);return Object.keys(e).length===0;
  };

  const next=async()=>{
    if(!validate())return;
    if(step===1){setStep(2);return;}
    setLoading(true);setPayError("");
    try {
      // Step 1: Create Supabase account
      const signupRes = await fetch("/api/auth/signup",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email:form.email,name:form.name,password:form.password||form.email.split("@")[0]+"Hycre24!",tier:tier.id,tosAccepted:true})
      });
      const signupData = await signupRes.json();
      if(!signupRes.ok && signupData.error !== "An account with this email already exists."){
        setPayError(signupData.error||"Account creation failed.");setLoading(false);return;
      }

      // Step 2: Process payment
      const payRes = await fetch("/api/payment",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({tier:tier.id,name:form.name,email:form.email,amount:tier.price,period:tier.period,card:form.card,exp:form.exp,cvv:form.cvv})
      });
      const payData = await payRes.json();
      if(!payRes.ok||!payData.success){setPayError(payData.error||"Payment failed. Please check your card details.");setLoading(false);return;}

      // Step 3: Update user to payment_verified in Supabase
      if(signupData.user?.id){
        await fetch(`https://vvkdnzqgtajeouxlliuk.supabase.co/auth/v1/admin/users/${signupData.user.id}`,{
          method:"PUT",
          headers:{"apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a2RuenFndGFqZW91eGxsaXVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTAwOTE4NiwiZXhwIjoyMDg2NTg1MTg2fQ.Q61WGhT0KHUbrVc3FiRzQN-vhmy53dEqaad4w4c_Z9o","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a2RuenFndGFqZW91eGxsaXVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTAwOTE4NiwiZXhwIjoyMDg2NTg1MTg2fQ.Q61WGhT0KHUbrVc3FiRzQN-vhmy53dEqaad4w4c_Z9o","Content-Type":"application/json"},
          body:JSON.stringify({user_metadata:{name:form.name,tier:tier.id,plan_status:"active",payment_verified:true,payment_verified_at:new Date().toISOString(),transaction_id:payData.transaction_id}})
        });
      }

      // Step 4: Save session
      if(signupData.access_token){
        const userData={...signupData.user,token:signupData.access_token,payment_verified:true,plan_status:"active"};
        saveSession(signupData.access_token,userData);
        setCreatedUser(userData);
      }

      // Step 5: Notify admin
      fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"new_signup",name:form.name,email:form.email,tier:tier.id,amount:`${tier.price}${tier.period}`})});

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
        <button onClick={()=>onSuccess(createdUser||{name:form.name,email:form.email,tier:tier.id,payment_verified:true})} style={{...btnGold,width:"100%",padding:"13px 0",fontSize:15}}>Enter Dashboard →</button>
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
              <FI label="Password" val={form.password} set={f("password")} ph="Min 8 characters" type={showPw?"text":"password"} err={errors.password} suffix={<button type="button" onClick={()=>setShowPw(s=>!s)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,padding:0}}>{showPw?<EyeOff size={13}/>:<Eye size={13}/>}</button>}/>
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
function Login({onBack,onSuccess,resetMode}) {
  const [form,setForm]=useState({email:"",password:""});
  const [showPw,setShowPw]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [mode,setMode]=useState(resetMode?"reset":"login");
  const [resetSent,setResetSent]=useState(false);
  const [resetEmail,setResetEmail]=useState("");
  const [legalModal,setLegalModal]=useState(null);

  const handle=async()=>{
    if(!form.email||!form.password)return;
    setLoading(true);setError("");
    try {
      const res = await fetch("/api/auth/signin",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email:form.email,password:form.password})
      });
      const data = await res.json();
      if(!res.ok||!data.success){setError(data.error||"Invalid email or password.");setLoading(false);return;}
      saveSession(data.access_token,data.user);
      onSuccess({...data.user,token:data.access_token});
    } catch(err){
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  };

  const sendReset=async()=>{
    if(!resetEmail.includes("@"))return;
    setLoading(true);
    await fetch("/api/auth/reset-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"request",email:resetEmail})});
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
              {error&&<div style={{marginBottom:14,padding:"10px 14px",background:C.dangerBg,border:`1px solid ${C.dangerBorder}`,borderRadius:8,fontSize:12,color:C.danger}}>{error}</div>}
              <button onClick={handle} disabled={loading||!form.email||!form.password} style={{...btnGold,width:"100%",padding:"12px 0",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:loading?.7:1}}>
                {loading?<><div style={{width:13,height:13,border:`2px solid ${C.bg}55`,borderTopColor:C.bg,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>Signing In...</>:"Sign In"}
              </button>
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
  {id:"prospecting",icon:Target,label:"Client Acquisition",badge:"NEW"},
  {id:"packager",icon:FileText,label:"Deal Packager"},
  {id:"underwriting",icon:BarChart3,label:"Underwriting Suite"},
  {id:"lenders",icon:Database,label:"Lender Engine"},
  {id:"apex",icon:Award,label:"APEX Scoring"},
  {id:"settings",icon:Shield,label:"Account & Billing"},
];

function Dashboard({user,setUser,onLogout}) {
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
          {sidebarOpen&&<div style={{fontSize:9,fontFamily:"'DM Mono',monospace",letterSpacing:".12em",color:C.blue,padding:"8px 8px 4px",textTransform:"uppercase"}}>Platform</div>}
          {DASH_NAV.slice(0,5).map(n=><SideBtn key={n.id} n={n} active={active===n.id} open={sidebarOpen} onClick={()=>setActive(n.id)}/>)}
          {sidebarOpen&&<div style={{fontSize:9,fontFamily:"'DM Mono',monospace",letterSpacing:".12em",color:C.muted,padding:"10px 8px 4px",textTransform:"uppercase"}}>Tools</div>}
          {DASH_NAV.slice(5,9).map(n=><SideBtn key={n.id} n={n} active={active===n.id} open={sidebarOpen} onClick={()=>setActive(n.id)}/>)}
          {sidebarOpen&&<div style={{fontSize:9,fontFamily:"'DM Mono',monospace",letterSpacing:".12em",color:C.muted,padding:"10px 8px 4px",textTransform:"uppercase"}}>Account</div>}
          {DASH_NAV.slice(9).map(n=><SideBtn key={n.id} n={n} active={active===n.id} open={sidebarOpen} onClick={()=>setActive(n.id)}/>)}
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
          {active==="settings"&&<AccountSettings user={user} setUser={setUser} onLogout={onLogout}/>}
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
/* ─── HUIT BRAIN MODES ─── */
const HB_MODES = [
  {id:"general",label:"General Advisor",icon:"🧠",color:"C.blue",desc:"CRE capital markets expert — any question",
   system:"You are Huit Brain, the AI advisor for HyCRE.ai — a premium CRE capital intelligence platform. You are a senior commercial real estate capital markets expert with 20+ years of experience across debt origination, underwriting, and advisory. Be concise, direct, and expert. Use specific numbers, benchmarks, and real-world examples. Format responses clearly with headers and bullets when appropriate."},
  {id:"deal",label:"Deal Analyzer",icon:"📋",color:"C.gold",desc:"Analyze any deal — feasibility, structure, risks",
   system:"You are a senior CRE deal analyst at HyCRE.ai. When analyzing deals, calculate and assess: cap rate, DSCR, LTV, debt yield, cash-on-cash, IRR potential, lender fit, and key risks. Always structure analysis with: Deal Overview, Key Metrics, Strengths, Risks & Concerns, and Recommendation (Fund / Conditional / Pass). Use specific numbers. Flag anything that would cause a lender decline."},
  {id:"lender",label:"Lender Strategy",icon:"🏦",color:"C.teal",desc:"Who to call, how to pitch, which lender fits",
   system:"You are a senior CRE capital advisor specializing in lender strategy at HyCRE.ai. Help users identify the right lender type for their deal, how to approach them, what to lead with, and how to structure the pitch. Reference specific lender types: agency (Fannie/Freddie), life companies (MetLife, PGIM, NY Life), national banks (JPMorgan, Wells Fargo, US Bank), CMBS conduits, debt funds (Blackstone, ACORE, Arbor), bridge lenders, SBA lenders, and regional banks. Be specific about lender appetite, rate ranges, typical terms, and what each lender type prioritizes."},
  {id:"underwriting",label:"Underwriting",icon:"📊",color:"C.purple",desc:"Check numbers, stress test, lender benchmarks",
   system:"You are a senior CRE underwriter at HyCRE.ai. Help users underwrite deals accurately. Provide specific benchmarks: DSCR floors (1.20x-1.35x by lender type), max LTV by property type and lender, cap rate ranges by market and asset class, debt yield floors (7-10%), breakeven analysis, and stress test guidance. Walk through calculations step by step. Flag any metrics that fall outside typical lender acceptance criteria. Reference real market rates and benchmarks as of 2025."},
  {id:"outreach",label:"Outreach Coach",icon:"🎯",color:"C.rose",desc:"Scripts, pitches, cold call coaching",
   system:"You are a senior CRE business development coach at HyCRE.ai. Help users craft compelling outreach to property owners, lenders, and referral sources. Provide specific scripts, email templates, LinkedIn messages, and cold call frameworks. For borrower outreach: lead with the HMDA opportunity, rate gap, maturity risk, or value-add upside. For lender outreach: lead with the deal quality, your relationship, and why it's a fit. Always be specific, professional, and value-led — never generic."},
  {id:"termsheet",label:"Term Sheet",icon:"📝",color:"C.warn",desc:"Review terms, negotiate, flag risks",
   system:"You are a senior CRE loan advisor at HyCRE.ai specializing in term sheet review and negotiation. When reviewing terms, assess: interest rate (fixed vs float, spread, index), amortization and IO period, LTV and loan sizing, prepayment (defeasance, step-down, yield maintenance), recourse vs non-recourse and carve-outs, reserves (operating, replacement, capex), extensions, personal guaranty requirements, and covenants. Flag anything unusual, explain what is and isn't negotiable, and provide specific negotiation language."},
];

const HB_PROMPTS = {
  general:[
    {cat:"Fundamentals",qs:["What DSCR do most life companies require for multifamily?","Explain debt yield and why lenders care about it more than LTV","What's the difference between recourse and non-recourse CRE loans?","How does defeasance work and when should I avoid it?"]},
    {cat:"Markets",qs:["What are current cap rate benchmarks for multifamily nationally?","How has the 10-year Treasury affected CRE lending in 2025?","Which asset classes do lenders favor right now?","What's happening with CMBS spreads?"]},
    {cat:"Alaska CRE",qs:["What makes Alaska CRE different from the lower-48?","Which lenders actively lend in Alaska?","What cap rates should I expect for Anchorage multifamily?","How does seasonal vacancy affect Alaska MF underwriting?"]},
  ],
  deal:[
    {cat:"Analysis",qs:["Analyze this deal: 12-unit MF, $1.8M, $126K NOI, 70% LTV at 6.75%","What's the max loan on a deal with $200K NOI at 1.25x DSCR, 6.75%, 25yr?","Is a 5.8% cap rate on industrial good in today's market?","Red flag check: office building, 78% occupied, $420K NOI, $5.2M ask"]},
    {cat:"Feasibility",qs:["How do I know if a deal can support bridge-to-perm financing?","What NOI do I need to support a $3M loan at today's rates?","When does a value-add deal pencil vs. not pencil?","Walk me through a quick back-of-envelope for a $2M acquisition"]},
  ],
  lender:[
    {cat:"Matching",qs:["Best lender type for a $4M stabilized multifamily in Seattle?","Who lends on small-balance CRE under $1M?","Which lenders do interest-only on bridge deals?","Fannie vs Freddie vs HUD — when does each make sense?"]},
    {cat:"Approach",qs:["How do I cold approach a life company for a $10M deal?","What do lenders want to see in a first submission?","How long does a CMBS deal typically take to close?","What's a debt fund vs a bridge lender — when do I use each?"]},
  ],
  underwriting:[
    {cat:"Calculations",qs:["Calculate max loan: $180K NOI, 1.25x DSCR, 6.75%, 25yr amort","What's the DSCR on $155K NOI with a $1.4M loan at 6.5%?","Stress test this deal to 8% rates: $175K NOI, $1.75M loan, 25yr","What debt yield does a CMBS lender require?"]},
    {cat:"Benchmarks",qs:["What OER is typical for multifamily in Anchorage?","What vacancy rate do lenders underwrite for retail?","What cap rate should I use for self-storage in a secondary market?","What's a typical replacement reserve per unit for 1990s MF?"]},
  ],
  outreach:[
    {cat:"Borrowers",qs:["Write a cold email to a MF owner whose loan matures in 9 months","How do I open a cold call to a property owner about refinancing?","LinkedIn message to a commercial property owner — best approach?","What's the best hook for a borrower who financed in 2021 at 3.5%?"]},
    {cat:"Lenders",qs:["How do I introduce a new deal to a lender I've never worked with?","What's the best follow-up after submitting a deal package?","How do I ask for a term sheet without seeming desperate?","Best way to build a lender relationship before you have a deal?"]},
  ],
  termsheet:[
    {cat:"Review",qs:["Explain defeasance vs step-down prepayment — which is better?","What's a fair spread on a 10-year life company loan today?","Is a 3-year IO period on a bridge loan standard?","Red flags in a term sheet I should push back on?"]},
    {cat:"Negotiate",qs:["How do I push back on a reserve requirement that seems too high?","What recourse carve-outs should I fight to remove?","Is a 1% origination fee standard or is that high?","How do I get a lower spread on a life company term sheet?"]},
  ],
};

const CRE_BENCHMARKS = [
  {label:"Agency MF DSCR",value:"1.25x min",note:"Fannie/Freddie floor"},
  {label:"Life Co. DSCR",value:"1.30–1.35x",note:"Conservative floors"},
  {label:"Bridge DSCR",value:"1.10–1.15x",note:"On stabilized NOI"},
  {label:"CMBS Debt Yield",value:"8–10%+",note:"NOI ÷ Loan Amount"},
  {label:"10-Yr Treasury",value:"~4.40%",note:"As of Q2 2025"},
  {label:"SOFR 30-Day",value:"~5.30%",note:"Current"},
  {label:"CRE Avg Rate",value:"6.50–7.50%",note:"Perm loans"},
  {label:"MF Cap Rate",value:"5.0–5.8%",note:"Stabilized, major MSA"},
  {label:"Industrial Cap",value:"5.0–5.5%",note:"Net-leased"},
  {label:"Retail (NNN)",value:"5.5–6.5%",note:"Investment grade"},
];

function HuitBrain() {
  const [sessions,setSessions]=useState(()=>{try{return JSON.parse(localStorage.getItem("hb_sessions")||"[]");}catch{return[];}});
  const [activeSession,setActiveSession]=useState(null);
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [mode,setMode]=useState("general");
  const [dealCtx,setDealCtx]=useState("");
  const [showDealCtx,setShowDealCtx]=useState(false);
  const [showHistory,setShowHistory]=useState(false);
  const [followUps,setFollowUps]=useState([]);
  const bottomRef=useRef(null);
  const inputRef=useRef(null);

  const currentMode=HB_MODES.find(m=>m.id===mode)||HB_MODES[0];
  const modeColor={general:C.blue,deal:C.gold,lender:C.teal,underwriting:C.purple,outreach:C.rose,termsheet:C.warn}[mode]||C.blue;

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);

  const saveSessions=(s)=>{setSessions(s);try{localStorage.setItem("hb_sessions",JSON.stringify(s));}catch{}};

  const newChat=()=>{
    setMessages([]);setActiveSession(null);setInput("");setFollowUps([]);setShowDealCtx(false);
    inputRef.current?.focus();
  };

  const loadSession=(s)=>{setMessages(s.messages);setActiveSession(s.id);setMode(s.mode||"general");setFollowUps([]);};

  const saveSession=(msgs,sid)=>{
    const preview=msgs.find(m=>m.role==="user")?.content?.slice(0,60)||"New conversation";
    if(sid){
      const updated=sessions.map(s=>s.id===sid?{...s,messages:msgs,preview,updatedAt:Date.now()}:s);
      saveSessions(updated);
    } else {
      const newId=Date.now().toString();
      const newSession={id:newId,messages:msgs,preview,mode,createdAt:Date.now(),updatedAt:Date.now()};
      saveSessions([newSession,...sessions.slice(0,19)]);
      setActiveSession(newId);
      return newId;
    }
    return sid;
  };

  const deleteSession=(id,e)=>{e.stopPropagation();saveSessions(sessions.filter(s=>s.id!==id));if(activeSession===id)newChat();};

  const buildSystem=()=>{
    let sys=currentMode.system;
    if(dealCtx.trim()) sys+=`\n\nACTIVE DEAL CONTEXT (user has provided this deal — reference it in your responses):\n${dealCtx}`;
    sys+="\n\nFormatting: Use ## for main headers, ### for subheaders, **bold** for key metrics and terms, - for bullet points. Include specific numbers. Be concise but thorough.";
    return sys;
  };

  const send=async(text)=>{
    const msg=text||input.trim();if(!msg||loading)return;
    setInput("");setFollowUps([]);
    const hist=[...messages,{role:"user",content:msg,ts:Date.now()}];
    setMessages(hist);setLoading(true);
    try{
      const reply=await callAI(buildSystem(),msg,messages);
      const updated=[...hist,{role:"assistant",content:reply,mode,ts:Date.now()}];
      setMessages(updated);
      const sid=saveSession(updated,activeSession);
      if(!activeSession)setActiveSession(sid);
      // Generate follow-up suggestions
      genFollowUps(reply,msg);
    }catch{setMessages(p=>[...p,{role:"assistant",content:"Connection error. Please retry.",ts:Date.now()}]);}
    setLoading(false);
  };

  const genFollowUps=async(reply,question)=>{
    try{
      const r=await callAI(
        "Generate 3 short follow-up questions a CRE professional would ask after this Q&A. Return JSON only: {questions:[\"q1\",\"q2\",\"q3\"]}",
        `Q: ${question}\nA: ${reply.slice(0,400)}`
      );
      const clean=r.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      setFollowUps(parsed.questions||[]);
    }catch{setFollowUps([]);}
  };

  const copyMsg=(text)=>navigator.clipboard.writeText(text);

  const exportConvo=()=>{
    const text=messages.map(m=>`${m.role==="user"?"You":"Huit Brain"}: ${m.content}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text).then(()=>alert("Conversation copied to clipboard"));
  };

  const renderMessage=(content,isUser)=>{
    if(isUser)return<div style={{fontSize:13,color:C.bg,lineHeight:1.7}}>{content}</div>;
    const lines=content.split('\n');
    return(
      <div style={{fontSize:13,color:C.text,lineHeight:1.8}}>
        {lines.map((line,i)=>{
          if(line.startsWith('## '))return<div key={i} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:modeColor,fontWeight:600,margin:"14px 0 5px",borderBottom:`1px solid ${modeColor}22`,paddingBottom:3}}>{line.replace('## ','')}</div>;
          if(line.startsWith('### '))return<div key={i} style={{fontSize:13,fontWeight:600,color:C.white,margin:"10px 0 4px"}}>{line.replace('### ','')}</div>;
          if(line.startsWith('- ')||line.startsWith('• '))return<div key={i} style={{paddingLeft:12,margin:"3px 0",display:"flex",gap:7}}><span style={{color:modeColor,flexShrink:0,marginTop:2}}>▸</span><span dangerouslySetInnerHTML={{__html:line.slice(2).replace(/\*\*(.*?)\*\*/g,'<strong style="color:#DDE2EE">$1</strong>')}}/></div>;
          if(line.match(/^\d+\./))return<div key={i} style={{paddingLeft:12,margin:"3px 0",display:"flex",gap:7}}><span style={{color:modeColor,flexShrink:0,fontWeight:600,minWidth:16}}>{line.match(/^\d+/)[0]}.</span><span dangerouslySetInnerHTML={{__html:line.replace(/^\d+\.\s*/,'').replace(/\*\*(.*?)\*\*/g,'<strong style="color:#DDE2EE">$1</strong>')}}/></div>;
          if(line==='')return<div key={i} style={{height:6}}/>;
          return<div key={i} style={{margin:"2px 0"}} dangerouslySetInnerHTML={{__html:line.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#DDE2EE">$1</strong>')}}/>;
        })}
      </div>
    );
  };

  const prompts=HB_PROMPTS[mode]||HB_PROMPTS.general;

  return(
    <div className="au" style={{display:"flex",gap:14,height:"calc(100vh - 130px)",maxWidth:1200}}>

      {/* ─── LEFT: History Panel ─── */}
      <div style={{width:showHistory?200:42,flexShrink:0,display:"flex",flexDirection:"column",gap:8,transition:"width .2s"}}>
        <button onClick={()=>setShowHistory(s=>!s)} style={{width:"100%",padding:"8px",borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:showHistory?"flex-start":"center",gap:6,fontSize:11,fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}>
          <Clock size={13}/>{showHistory&&<span>History</span>}
        </button>
        {showHistory&&(
          <>
            <button onClick={newChat} style={{...btnGold,padding:"7px 10px",fontSize:11,display:"flex",alignItems:"center",gap:5}}><Zap size={11}/>New Chat</button>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:5}}>
              {sessions.length===0&&<p style={{fontSize:10,color:C.dim,textAlign:"center",marginTop:8}}>No history yet</p>}
              {sessions.map(s=>(
                <div key={s.id} onClick={()=>loadSession(s)} style={{background:activeSession===s.id?`${C.goldMuted}18`:C.surface,border:`1px solid ${activeSession===s.id?C.borderGold:C.border}`,borderRadius:7,padding:"8px 10px",cursor:"pointer",position:"relative",group:"true"}}>
                  <div style={{fontSize:10,color:activeSession===s.id?C.gold:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:16}}>{s.preview}</div>
                  <div style={{fontSize:8,color:C.dim,marginTop:3}}>{new Date(s.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                  <button onClick={e=>deleteSession(s.id,e)} style={{position:"absolute",top:6,right:6,background:"none",border:"none",color:C.dim,cursor:"pointer",padding:0,opacity:.6,fontSize:10}}>✕</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ─── CENTER: Chat ─── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",minWidth:0}}>
        {/* Header */}
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{width:32,height:32,borderRadius:8,background:`${modeColor}18`,border:`1px solid ${modeColor}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>{currentMode.icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:C.white}}>Huit Brain — {currentMode.label}</div>
            <div style={{fontSize:10,color:C.teal,display:"flex",alignItems:"center",gap:4}}><div style={{width:4,height:4,borderRadius:"50%",background:C.teal,animation:"pulse 2s infinite"}}/>Online · 24/7 CRE Expert{dealCtx&&<span style={{color:C.gold,marginLeft:6}}>· Deal context active</span>}</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setShowDealCtx(s=>!s)} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${showDealCtx?C.borderGold:C.border}`,background:showDealCtx?`${C.goldMuted}18`:"transparent",color:showDealCtx?C.gold:C.muted,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:4}}><FileText size={10}/>Deal Context</button>
            {messages.length>0&&<button onClick={exportConvo} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:4}}><Download size={10}/>Export</button>}
            {messages.length>0&&<button onClick={newChat} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>New Chat</button>}
          </div>
        </div>

        {/* Deal Context Panel */}
        {showDealCtx&&(
          <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.borderGold}`,background:`${C.goldMuted}08`}}>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".1em",marginBottom:6}}>ACTIVE DEAL CONTEXT — AI will reference this deal in all responses</div>
            <textarea value={dealCtx} onChange={e=>setDealCtx(e.target.value)} placeholder="Paste your deal here: address, price, NOI, LTV, loan terms, property type, market, sponsor, anything relevant..." rows={3} style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",fontSize:12,color:C.text,fontFamily:"'DM Sans',sans-serif",resize:"vertical",boxSizing:"border-box",outline:"none",lineHeight:1.5}}/>
            <div style={{display:"flex",gap:8,marginTop:6}}>
              <button onClick={()=>setDealCtx("")} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:10,fontFamily:"'DM Sans',sans-serif"}}>Clear</button>
              <button onClick={()=>setShowDealCtx(false)} style={{...btnGold,padding:"4px 12px",fontSize:10}}>Set Context →</button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={{flex:1,overflow:"auto",padding:"16px 18px"}}>
          {messages.length===0&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",opacity:.7}}>
              <div style={{fontSize:40,marginBottom:14}}>{currentMode.icon}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.white,marginBottom:6}}>Huit Brain — {currentMode.label}</div>
              <p style={{fontSize:12,color:C.muted,textAlign:"center",maxWidth:400,lineHeight:1.6,marginBottom:20}}>{currentMode.desc}</p>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",maxWidth:560}}>
                {(prompts[0]?.qs||[]).slice(0,3).map((q,i)=>(
                  <button key={i} onClick={()=>send(q)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:11,color:C.muted,lineHeight:1.5,fontFamily:"'DM Sans',sans-serif",maxWidth:180,textAlign:"left"}}>{q}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:14,justifyContent:m.role==="user"?"flex-end":"flex-start",alignItems:"flex-start"}}>
              {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:7,background:`${modeColor}18`,border:`1px solid ${modeColor}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,fontSize:14}}>{currentMode.icon}</div>}
              <div style={{maxWidth:"78%",position:"relative",group:"true"}}>
                <div style={{background:m.role==="user"?`linear-gradient(135deg,${C.gold},${C.goldBright})`:C.card,border:m.role==="user"?"none":`1px solid ${C.border}`,borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",padding:"11px 14px"}}>
                  {renderMessage(m.content,m.role==="user")}
                </div>
                {m.role==="assistant"&&<button onClick={()=>copyMsg(m.content)} style={{position:"absolute",top:6,right:6,background:"none",border:"none",color:C.dim,cursor:"pointer",padding:2,opacity:.5,display:"flex",alignItems:"center"}} title="Copy"><Copy size={10}/></button>}
                {m.ts&&<div style={{fontSize:8,color:C.dim,marginTop:3,textAlign:m.role==="user"?"right":"left"}}>{new Date(m.ts).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>}
              </div>
              {m.role==="user"&&<div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${C.gold},${C.goldBright})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}><User size={13} color={C.bg}/></div>}
            </div>
          ))}
          {loading&&(
            <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:7,background:`${modeColor}18`,border:`1px solid ${modeColor}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14}}>{currentMode.icon}</div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"12px 12px 12px 4px",padding:"12px 16px",display:"flex",gap:5,alignItems:"center"}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:modeColor,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>)}
              </div>
            </div>
          )}
          {/* Follow-up suggestions */}
          {followUps.length>0&&!loading&&(
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4,marginBottom:8,paddingLeft:36}}>
              {followUps.map((q,i)=>(
                <button key={i} onClick={()=>send(q)} style={{background:`${modeColor}11`,border:`1px solid ${modeColor}33`,borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:10,color:modeColor,lineHeight:1.4,fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}>{q}</button>
              ))}
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={`Ask Huit Brain anything about ${currentMode.desc.toLowerCase()}...`} rows={2} style={{flex:1,background:C.card,border:`1px solid ${input.trim()?modeColor+"66":C.border}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:C.text,outline:"none",resize:"none",fontFamily:"'DM Sans',sans-serif",lineHeight:1.5,transition:"border-color .2s"}}/>
            <button onClick={()=>send()} disabled={!input.trim()||loading} style={{width:40,height:40,borderRadius:9,background:input.trim()?`linear-gradient(135deg,${modeColor},${modeColor}CC)`:C.dim,border:"none",cursor:input.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .2s"}}><Send size={14} color={C.white}/></button>
          </div>
          <div style={{fontSize:9,color:C.dim,marginTop:5,textAlign:"center"}}>Enter to send · Shift+Enter for new line · AI may make errors — verify critical numbers</div>
        </div>
      </div>

      {/* ─── RIGHT: Modes + Prompts + Benchmarks ─── */}
      <div style={{width:210,flexShrink:0,display:"flex",flexDirection:"column",gap:10,overflowY:"auto"}}>
        {/* Mode Selector */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:12}}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:8}}>EXPERT MODE</div>
          {HB_MODES.map(m=>(
            <button key={m.id} onClick={()=>{setMode(m.id);setFollowUps([]);}} style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"7px 8px",borderRadius:7,border:`1px solid ${mode===m.id?C.borderGold:C.border}`,background:mode===m.id?`${C.goldMuted}18`:"transparent",color:mode===m.id?C.white:C.muted,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:5,textAlign:"left",transition:"all .15s"}}>
              <span style={{fontSize:14}}>{m.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:mode===m.id?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Prompts */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:12,flex:1,overflow:"hidden"}}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:8}}>QUICK PROMPTS</div>
          {prompts.map(cat=>(
            <div key={cat.cat} style={{marginBottom:10}}>
              <div style={{fontSize:8,color:modeColor,fontFamily:"'DM Mono',monospace",letterSpacing:".08em",marginBottom:5}}>{cat.cat.toUpperCase()}</div>
              {cat.qs.map((q,i)=>(
                <button key={i} onClick={()=>send(q)} style={{width:"100%",textAlign:"left",background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 9px",cursor:"pointer",fontSize:10,color:C.muted,lineHeight:1.5,fontFamily:"'DM Sans',sans-serif",marginBottom:4,display:"block"}} onMouseEnter={e=>{e.target.style.color=C.text;e.target.style.borderColor=modeColor+"66";}} onMouseLeave={e=>{e.target.style.color=C.muted;e.target.style.borderColor=C.border;}}>{q}</button>
              ))}
            </div>
          ))}
        </div>

        {/* Market Benchmarks */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:12}}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:8}}>CRE BENCHMARKS</div>
          {CRE_BENCHMARKS.map((b,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,paddingBottom:6,borderBottom:i<CRE_BENCHMARKS.length-1?`1px solid ${C.border}`:"none"}}>
              <div>
                <div style={{fontSize:9,color:C.dim,marginBottom:1}}>{b.label}</div>
                <div style={{fontSize:8,color:C.dim,opacity:.6}}>{b.note}</div>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:600,color:C.goldBright,textAlign:"right"}}>{b.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MASTERCLASS ─── */
function MasterClass() {
  const [activeMod,setActiveMod]=useState(null);
  const [view,setView]=useState("lesson");
  const [lesson,setLesson]=useState(null);
  const [loading,setLoading]=useState(false);
  const [quiz,setQuiz]=useState(null);
  const [qLoading,setQLoading]=useState(false);
  const [answers,setAnswers]=useState({});
  const [submitted,setSubmitted]=useState(false);
  const [feedback,setFeedback]=useState(null);
  const [progress,setProgress]=useState(()=>{try{return JSON.parse(localStorage.getItem("hycre_mc_progress")||"{}");}catch{return{};}});
  const [showFormulas,setShowFormulas]=useState(false);

  const saveProgress=(mods)=>{setProgress(mods);try{localStorage.setItem("hycre_mc_progress",JSON.stringify(mods));}catch{}};
  const completed=Object.values(progress).filter(v=>v==="complete").length;
  const allComplete=completed===MODULES.length;

  const loadLesson=async(mod)=>{
    setActiveMod(mod);setLesson(null);setQuiz(null);setAnswers({});setSubmitted(false);setFeedback(null);setView("lesson");setShowFormulas(false);setLoading(true);
    if(progress[mod.id]!=="complete")saveProgress({...progress,[mod.id]:"started"});
    try{
      const r=await callAI(
        "You are a senior CRE capital markets educator writing a premium training lesson for CRE professionals. Write a detailed, expert-level lesson. Use ## for main section headers. Use **bold** for key terms and numbers. Use bullet points (- ) for lists. Include real dollar amounts, percentages, and market data. Be specific, practical, and authoritative. Write approximately 1,400-1,600 words. Structure: ## Overview, ## Core Concepts, ## Real-World Examples (2-3 specific deal scenarios with real numbers), ## Common Mistakes to Avoid, ## Key Takeaways, ## What to Do This Week (3 specific action items)",
        "Write a complete expert CRE training lesson: \""+mod.title+"\" — "+mod.subtitle+". Cover in depth: "+mod.topics.join(", ")+". Include specific dollar amounts, percentages, market benchmarks, and real deal examples. This should read like content from a $2,995 CRE course."
      );
      setLesson(r);
    }catch{setLesson("Error loading lesson. Please try again.");}
    setLoading(false);
  };

  const loadQuiz=async()=>{
    setQLoading(true);setView("quiz");
    try{
      const r=await callAI(
        "Generate a 5-question multiple choice quiz. Return ONLY valid JSON, no markdown, no backticks. Format exactly: {questions:[{q:string,options:[string,string,string,string],answer:number,explanation:string,difficulty:\"easy\"|\"medium\"|\"hard\"}]}",
        "Create a 5-question CRE professional quiz on: \""+activeMod.title+"\". Topics: "+activeMod.topics.join(", ")+". Mix difficulty: 1 easy, 2 medium, 2 hard. Test practical knowledge a CRE capital finder needs on the job. Include specific numbers and scenarios. Explanations should be 2-3 sentences. JSON only."
      );
      const clean=r.replace(/```json|```/g,"").trim();
      setQuiz(JSON.parse(clean));
    }catch{setQuiz({questions:[{q:"Quiz unavailable — please retry.",options:["OK"],answer:0,explanation:"",difficulty:"easy"}]});}
    setQLoading(false);
  };

  const submitQuiz=()=>{
    setSubmitted(true);
    const correct=quiz.questions.filter((q,i)=>parseInt(answers[i])===q.answer).length;
    const score=Math.round((correct/quiz.questions.length)*100);
    setFeedback({score,correct,total:quiz.questions.length});
    if(score>=70)saveProgress({...progress,[activeMod.id]:"complete"});
  };

  if(!activeMod) return (
    <div className="au" style={{maxWidth:820}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}>
        <div><h2 style={H2}>CRE AI MasterClass</h2><p style={{...Sub,marginBottom:0}}>10-module professional training. Expert AI lessons, formula reference cards, and certification quizzes.</p></div>
        {allComplete&&<button onClick={()=>{setActiveMod("cert");}} style={{...btnGold,padding:"8px 18px",fontSize:12,display:"flex",alignItems:"center",gap:6}}><Award size={13}/>View Certificate</button>}
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 20px",marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontSize:13,color:C.text,fontWeight:500}}>{completed} of {MODULES.length} modules complete</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.gold}}>{Math.round((completed/MODULES.length)*100)}%</span>
        </div>
        <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(completed/MODULES.length)*100}%`,background:`linear-gradient(90deg,${C.gold},${C.goldBright})`,transition:"width .6s ease",borderRadius:3}}/>
        </div>
        <div style={{display:"flex",gap:24,marginTop:12}}>
          {[["Complete",completed],["Remaining",MODULES.length-completed],["Est. Total",MODULES.length*1.1+"h"]].map(([l,v])=>(
            <div key={l}><div style={{fontSize:18,fontWeight:600,color:C.white,fontFamily:"'Cormorant Garamond',serif"}}>{v}</div><div style={{fontSize:10,color:C.dim}}>{l}</div></div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {MODULES.map((m,idx)=>{
          const prog=progress[m.id];
          return(
            <div key={m.id} onClick={()=>loadLesson(m)} style={{background:C.surface,border:`1px solid ${prog==="complete"?C.successBorder:prog==="started"?C.borderGold:C.border}`,borderRadius:14,padding:"18px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,transition:"border-color .2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=prog==="complete"?C.successBorder:m.color}
              onMouseLeave={e=>e.currentTarget.style.borderColor=prog==="complete"?C.successBorder:prog==="started"?C.borderGold:C.border}>
              <div style={{width:48,height:48,borderRadius:12,background:`${m.color}14`,border:`1px solid ${m.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{m.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.dim}}>MODULE {String(idx+1).padStart(2,"0")}</span>
                  {prog==="complete"&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:C.successBg,color:C.success,fontFamily:"'DM Mono',monospace"}}>COMPLETE</span>}
                  {prog==="started"&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:`${C.warn}18`,color:C.warn,fontFamily:"'DM Mono',monospace"}}>IN PROGRESS</span>}
                </div>
                <h3 style={{fontSize:14,fontWeight:600,color:C.white,marginBottom:3}}>{m.title}</h3>
                <p style={{fontSize:11,color:C.muted}}>{m.subtitle}</p>
                <div style={{display:"flex",gap:14,marginTop:6}}>
                  <span style={{fontSize:10,color:C.dim}}><Clock size={9} style={{verticalAlign:"middle",marginRight:3}}/>{m.duration}</span>
                  <span style={{fontSize:10,color:C.dim}}>{m.topics.length} topics</span>
                  {m.formulas&&<span style={{fontSize:10,color:C.dim}}>{m.formulas.length} formulas</span>}
                </div>
              </div>
              <button style={{flexShrink:0,display:"flex",alignItems:"center",gap:5,background:prog==="complete"?C.successBg:"transparent",border:`1px solid ${prog==="complete"?C.successBorder:m.color}55`,borderRadius:7,padding:"7px 14px",color:prog==="complete"?C.success:m.color,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
                {prog==="complete"?<><CheckCircle size={11}/>Review</>:prog==="started"?<><Play size={11}/>Continue</>:<><Play size={11}/>Start</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  if(activeMod==="cert") return (
    <div className="au" style={{maxWidth:700}}>
      <button onClick={()=>setActiveMod(null)} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,marginBottom:20,fontFamily:"'DM Sans',sans-serif"}}>← Back to MasterClass</button>
      <div style={{background:`linear-gradient(135deg,${C.surface},#0D1525)`,border:`2px solid ${C.borderGold}`,borderRadius:20,padding:"48px 44px",textAlign:"center"}}>
        <div style={{width:64,height:64,background:`linear-gradient(135deg,${C.gold},${C.goldBright})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><Award size={30} color={C.bg}/></div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:".2em",color:C.gold,marginBottom:8}}>CERTIFICATE OF COMPLETION</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,color:C.white,fontWeight:600,marginBottom:4}}>CRE AI MasterClass</h1>
        <p style={{color:C.muted,fontSize:14,marginBottom:28}}>Has successfully completed all 10 modules of the HyCRE.ai Commercial Real Estate Capital Intelligence Training Program</p>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 24px",display:"inline-block",marginBottom:28}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.muted,marginBottom:4}}>CREDENTIAL EARNED</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:C.goldBright}}>CRE Capital Intelligence Specialist™</div>
          <div style={{fontSize:11,color:C.dim,marginTop:4}}>Issued by HyCRE.ai · A Huit.AI Product · Built From Alaska.</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
          {[["10","Modules"],["50+","Topics"],["30+","Formulas"]].map(([v,l])=>(
            <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 8px"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:C.goldBright,fontWeight:700}}>{v}</div>
              <div style={{fontSize:10,color:C.muted}}>{l}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>window.print()} style={{...btnGold,padding:"10px 28px",fontSize:13,display:"inline-flex",alignItems:"center",gap:7}}><Download size={14}/>Print / Save PDF</button>
      </div>
    </div>
  );

  return (
    <div className="au" style={{maxWidth:800}}>
      <button onClick={()=>setActiveMod(null)} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>← Back to MasterClass</button>
      <div style={{background:C.surface,border:`1px solid ${activeMod.color}44`,borderRadius:14,padding:"18px 20px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:46,height:46,borderRadius:11,background:`${activeMod.color}14`,border:`1px solid ${activeMod.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{activeMod.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.dim,marginBottom:3}}>MODULE {String(MODULES.findIndex(m=>m.id===activeMod.id)+1).padStart(2,"0")} · {activeMod.duration}</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:C.white,fontWeight:600,marginBottom:2}}>{activeMod.title}</h2>
            <p style={{fontSize:12,color:C.muted}}>{activeMod.subtitle}</p>
          </div>
          {progress[activeMod.id]==="complete"&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",background:C.successBg,border:`1px solid ${C.successBorder}`,borderRadius:6}}><CheckCircle size={11} color={C.success}/><span style={{fontSize:10,color:C.success}}>Complete</span></div>}
        </div>
        <div style={{display:"flex",gap:8,marginTop:16,borderTop:`1px solid ${C.border}`,paddingTop:14,flexWrap:"wrap"}}>
          {[["lesson","📖 Lesson"],["quiz","✏️ Quiz"]].map(([v,l])=>(
            <button key={v} onClick={()=>v==="quiz"&&!quiz?loadQuiz():setView(v)} disabled={v==="quiz"&&loading} style={{padding:"6px 16px",borderRadius:7,border:`1px solid ${view===v?activeMod.color:C.border}`,background:view===v?`${activeMod.color}18`:"transparent",color:view===v?activeMod.color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:view===v?600:400}}>
              {v==="quiz"&&qLoading?"Loading...":l}
            </button>
          ))}
          {activeMod.formulas&&activeMod.formulas.length>0&&<button onClick={()=>setShowFormulas(s=>!s)} style={{padding:"6px 16px",borderRadius:7,border:`1px solid ${showFormulas?C.borderGold:C.border}`,background:showFormulas?`${C.goldMuted}18`:"transparent",color:showFormulas?C.gold:C.muted,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginLeft:"auto"}}>📐 Formulas ({activeMod.formulas.length})</button>}
        </div>
      </div>

      {showFormulas&&activeMod.formulas&&activeMod.formulas.length>0&&(
        <div style={{background:C.surface,border:`1px solid ${C.borderGold}`,borderRadius:12,padding:"16px 20px",marginBottom:16}}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".1em",marginBottom:12}}>FORMULA REFERENCE CARD · {activeMod.title.toUpperCase()}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {activeMod.formulas.map((f,i)=>(
              <div key={i} style={{background:C.card,borderRadius:9,padding:"12px 14px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:11,fontWeight:600,color:C.text,marginBottom:6}}>{f.name}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.gold,background:`${C.goldMuted}11`,padding:"6px 10px",borderRadius:5,marginBottom:6}}>{f.formula}</div>
                <div style={{fontSize:10,color:C.dim}}>Example: {f.example}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view==="lesson"&&(
        <>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
            {activeMod.topics.map((t,i)=><span key={i} style={{fontSize:10,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,padding:"3px 9px",color:C.dim}}>{t}</span>)}
          </div>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:28}}>
            {loading?(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"48px 0"}}>
                <div style={{width:32,height:32,border:`2px solid ${C.borderGold}`,borderTopColor:C.goldBright,borderRadius:"50%",animation:"spin 1s linear infinite",marginBottom:14}}/>
                <p style={{color:C.muted,fontSize:13,marginBottom:4}}>Generating expert lesson...</p>
                <p style={{color:C.dim,fontSize:11}}>Building a full 1,500-word lesson on {activeMod.title}</p>
              </div>
            ):(
              <div style={{fontSize:13,color:C.text,lineHeight:1.9}}>
                {lesson&&lesson.split('\n').map((line,i)=>{
                  if(line.startsWith('## '))return<h2 key={i} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:activeMod.color,margin:"24px 0 10px",fontWeight:600,borderBottom:`1px solid ${activeMod.color}22`,paddingBottom:6}}>{line.replace('## ','')}</h2>;
                  if(line.startsWith('### '))return<h3 key={i} style={{fontSize:14,color:C.white,margin:"16px 0 6px",fontWeight:600}}>{line.replace('### ','')}</h3>;
                  if(line.match(/^\*\*(.*)\*\*$/)&&!line.match(/\*\*.*\*\*.*\*\*/))return<p key={i} style={{fontWeight:600,color:C.white,margin:"8px 0 4px"}}>{line.replace(/\*\*/g,'')}</p>;
                  if(line.startsWith('- ')||line.startsWith('• '))return<div key={i} style={{paddingLeft:16,margin:"4px 0",display:"flex",gap:8}}><span style={{color:activeMod.color,flexShrink:0,marginTop:3}}>▸</span><span>{line.slice(2)}</span></div>;
                  if(line==='')return<div key={i} style={{height:8}}/>;
                  return<p key={i} style={{margin:"4px 0"}} dangerouslySetInnerHTML={{__html:line.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#DDE2EE">$1</strong>')}}></p>;
                })}
              </div>
            )}
          </div>
        </>
      )}

      {view==="quiz"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {qLoading?(
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"48px 28px",display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{width:28,height:28,border:`2px solid ${C.borderGold}`,borderTopColor:C.goldBright,borderRadius:"50%",animation:"spin 1s linear infinite",marginBottom:12}}/>
              <p style={{color:C.muted,fontSize:13}}>Generating 5-question quiz...</p>
            </div>
          ):quiz&&(
            <>
              <p style={{fontSize:12,color:C.muted,marginBottom:4}}>{submitted?`Score: ${feedback?.correct}/${feedback?.total} correct — ${feedback?.score}%`:`Answer all ${quiz.questions?.length} questions to submit`}</p>
              {quiz.questions&&quiz.questions.map((q,qi)=>{
                const diffColor=q.difficulty==="hard"?C.danger:q.difficulty==="medium"?C.warn:C.success;
                return(
                  <div key={qi} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 18px 14px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:`${activeMod.color}22`,border:`1px solid ${activeMod.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:activeMod.color,flexShrink:0}}>{qi+1}</div>
                      <div style={{flex:1}}>
                        {q.difficulty&&<span style={{fontSize:8,padding:"1px 6px",borderRadius:3,background:`${diffColor}18`,color:diffColor,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",display:"inline-block",marginBottom:5}}>{q.difficulty}</span>}
                        <p style={{fontSize:13,fontWeight:500,color:C.white,lineHeight:1.5}}>{q.q}</p>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {q.options&&q.options.map((opt,oi)=>{
                        const sel=parseInt(answers[qi])===oi;
                        const corr=submitted&&oi===q.answer;
                        const wrong=submitted&&sel&&oi!==q.answer;
                        return(
                          <button key={oi} onClick={()=>!submitted&&setAnswers(a=>({...a,[qi]:oi}))}
                            style={{textAlign:"left",padding:"10px 14px",borderRadius:8,border:`1px solid ${corr?C.successBorder:wrong?C.dangerBorder:sel?C.borderGold:C.border}`,background:corr?C.successBg:wrong?C.dangerBg:sel?`${C.goldMuted}18`:"transparent",color:corr?C.success:wrong?C.danger:sel?C.gold:C.muted,fontSize:12,cursor:submitted?"default":"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:8,transition:"all .15s"}}>
                            <span style={{width:16,height:16,borderRadius:"50%",border:`1px solid ${corr?C.success:wrong?C.danger:sel?C.gold:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              {corr&&<Check size={9} color={C.success}/>}{wrong&&<X size={9} color={C.danger}/>}
                              {!corr&&!wrong&&sel&&<div style={{width:6,height:6,borderRadius:"50%",background:C.gold}}/>}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {submitted&&q.explanation&&<div style={{marginTop:10,padding:"10px 12px",background:C.card,borderRadius:7,border:`1px solid ${C.border}`,fontSize:11,color:C.muted,lineHeight:1.6}}><span style={{color:C.gold,fontWeight:600}}>💡 </span>{q.explanation}</div>}
                  </div>
                );
              })}
              {!submitted?(
                <button onClick={submitQuiz} disabled={Object.keys(answers).length<(quiz.questions&&quiz.questions.length||0)} style={{...btnGold,padding:"12px 0",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:Object.keys(answers).length<(quiz.questions&&quiz.questions.length||0)?0.5:1}}>
                  <CheckCircle size={14}/>Submit Answers
                </button>
              ):feedback&&(
                <div style={{background:feedback.score>=70?C.successBg:C.warnBg,border:`1px solid ${feedback.score>=70?C.successBorder:C.warnBorder}`,borderRadius:12,padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                    <div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:feedback.score>=70?C.success:C.warn,marginBottom:4}}>{feedback.score}%</div>
                      <div style={{fontSize:13,color:feedback.score>=70?C.success:C.warn,fontWeight:500}}>{feedback.correct}/{feedback.total} correct · {feedback.score>=70?"Module complete! 🎉":"Need 70% to pass — review the lesson and retry."}</div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      {feedback.score<70&&<button onClick={()=>{setAnswers({});setSubmitted(false);setFeedback(null);}} style={{...btnOutline,padding:"8px 16px",fontSize:12}}>Retry Quiz</button>}
                      {feedback.score>=70&&<button onClick={()=>setActiveMod(null)} style={{...btnGold,padding:"8px 18px",fontSize:12}}>
                        {allComplete?"View Certificate →":"Next Module →"}
                      </button>}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
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
const PIPELINE_STAGES = [
  {id:"new",label:"New Lead",color:C.blue,prob:5},
  {id:"contacted",label:"Contacted",color:C.teal,prob:15},
  {id:"engaged",label:"Engaged",color:C.gold,prob:30},
  {id:"meeting",label:"Meeting Set",color:C.purple,prob:55},
  {id:"proposal",label:"Proposal Sent",color:C.warn,prob:75},
  {id:"closed",label:"Closed",color:C.success,prob:100},
];
const CHANNELS=[
  {id:"email",label:"Email",icon:"✉️"},
  {id:"linkedin",label:"LinkedIn",icon:"💼"},
  {id:"phone",label:"Cold Call Script",icon:"📞"},
  {id:"sms",label:"SMS",icon:"💬"},
];
const HMDA_STATES=["AK","WA","OR","CA","TX","CO","FL","NY","GA","NC","MT","ID","AZ","NV","TN","TN"];
const TOUCH_COUNTS=[
  {id:1,label:"1-Touch Teaser"},
  {id:3,label:"3-Touch Standard"},
  {id:5,label:"5-Touch Campaign"},
];

function ProspectingEngine() {
  const [tab,setTab]=useState("search"); // search | outreach | pipeline | analytics
  const [filters,setFilters]=useState({propType:"Multifamily",state:"AK",minLoan:"500000",maxLoan:"5000000",year:"2023",count:"20"});
  const [prospects,setProspects]=useState([]);
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [selected,setSelected]=useState([]);
  const [pipeline,setPipeline]=useState(()=>{try{return JSON.parse(localStorage.getItem("hycre_pipeline")||"[]");}catch{return[];}});
  const [outreach,setOutreach]=useState(null);
  const [oLoading,setOLoading]=useState(false);
  const [channel,setChannel]=useState("email");
  const [touches,setTouches]=useState(3);
  const [tone,setTone]=useState("professional");
  const [myValue,setMyValue]=useState("better rates, higher LTV, and non-recourse structures through HyCRE.ai");
  const [detail,setDetail]=useState(null);
  const [copiedOut,setCopiedOut]=useState(false);
  const ff=k=>v=>setFilters(p=>({...p,[k]:v}));

  const savePipeline=(p)=>{setPipeline(p);try{localStorage.setItem("hycre_pipeline",JSON.stringify(p));}catch{}};

  // Search prospects
  const search=async()=>{
    setLoading(true);setSearched(true);setSelected([]);setOutreach(null);
    try{
      const params=new URLSearchParams({action:"search",...filters});
      const r=await fetch(`/api/prospects?${params}`);
      const d=await r.json();
      setProspects(d.prospects||[]);
    }catch{
      // Fallback: generate client-side if API fails
      setProspects(generateLocal(filters));
    }
    setLoading(false);
  };

  // Local fallback generator
  const generateLocal=(f)=>{
    const cities={AK:["Anchorage","Fairbanks","Juneau","Wasilla","Palmer"],WA:["Seattle","Tacoma","Bellevue","Spokane"],TX:["Dallas","Austin","Houston","San Antonio"],FL:["Miami","Tampa","Orlando","Jacksonville"],OR:["Portland","Eugene","Salem","Bend"],CO:["Denver","Boulder","Fort Collins","Aurora"],CA:["Los Angeles","San Diego","San Francisco","Sacramento"]};
    const lenders=["Wells Fargo","JPMorgan Chase","Fannie Mae (DUS)","Berkadia","Walker & Dunlop","Pacific Premier Bank","KeyBank","U.S. Bank","Northrim Bank","Alaska USA FCU","CMBS Conduit","Bridge Fund","Arbor Realty","Ready Capital"];
    const pfx=["Summit","Pacific","Northern","Alpine","Denali","Cascade","Pioneer","Heritage","Frontier","Landmark","Meridian","Premier","Clearwater","BlueSky","Anchor","Arctic","Eagle","Mesa","Ridge","Harbor"];
    const sfx=["LLC","LP","Holdings","Capital","Properties","Group","Ventures","Investments","Partners","Fund"];
    const ct=cities[f.state]||cities.AK,min=parseFloat(f.minLoan)||500000,max=parseFloat(f.maxLoan)||5000000;
    const yr=parseInt(f.year)||2023;
    const origRate={2017:4.2,2018:4.8,2019:4.1,2020:3.5,2021:3.2,2022:5.8,2023:7.1,2024:6.9}[yr]||6.5;
    const pts=["Multifamily","Office","Retail","Industrial","Hotel","Self-Storage","Mixed-Use"];
    const count=parseInt(f.count)||20;
    return Array.from({length:count},(_,i)=>{
      const p1=pfx[Math.floor(Math.random()*pfx.length)],p2=pfx[Math.floor(Math.random()*pfx.length)],st=sfx[Math.floor(Math.random()*sfx.length)];
      const pType=f.propType==="All"?pts[i%pts.length]:f.propType;
      const loanAmt=Math.round((min+Math.random()*(max-min))/50000)*50000;
      const lender=lenders[Math.floor(Math.random()*lenders.length)];
      const rateGap=parseFloat((6.85-origRate).toFixed(2));
      const ageScore=yr<=2022?30:10,rateScore=Math.min(Math.abs(rateGap)*8,25),sizeScore=loanAmt>=2000000?20:15,typeScore=["Multifamily","Industrial"].includes(pType)?10:5;
      const refiScore=Math.min(Math.round(ageScore+rateScore+sizeScore+typeScore+Math.random()*10),100);
      const oppType=yr<=2021?"Maturity Risk / Refi":yr<=2022?"Rate & Term Refi":"Bridge / Refinance";
      return{id:i+1,company:`${p1} ${p2} ${st}`,propType:pType,state:f.state,city:ct[i%ct.length],loanAmt,lender,year:f.year,origRate,rateGap,oppType,refiScore,priority:refiScore>=70?"Hot":refiScore>=50?"Warm":"Cold",stage:"new",notes:"",lastContacted:null};
    }).sort((a,b)=>b.refiScore-a.refiScore);
  };

  const toggle=(id)=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const selectAll=()=>setSelected(selected.length===prospects.length?[]:prospects.map(p=>p.id));

  const genOutreach=async()=>{
    const sel=prospects.filter(p=>selected.includes(p.id));
    if(!sel.length)return;
    setOLoading(true);setOutreach(null);setTab("outreach");
    const p=sel[0];
    const touchLabels={email:["Cold Opener","Value Add","Social Proof","Final Follow-Up","Break-Up"],linkedin:["Connection Request + Note","First DM","Value Message","Check-In","Last Attempt"],phone:["Cold Call Script","Follow-Up Call","Voicemail Script","Final Call","Close Attempt"],sms:["Intro Text","Value Text","Follow-Up Text","Meeting Request","Final Text"]};
    const channelGuide={email:"Write professional email with subject line (SUBJECT: ...) then body. Each email 100-150 words max.",linkedin:"Write LinkedIn message. 300 char max for connection note, 500 for DMs. Natural, not salesy.",phone:"Write word-for-word call script with opening, value prop, objection handlers, and close. Include [PAUSE] markers.",sms:"Write SMS text. Under 160 chars. Direct, professional, value-focused."};
    const toneGuide={professional:"Formal, authoritative, institutional quality",consultative:"Advisor tone, asking questions, value-focused",urgent:"Time-sensitive, maturity/rate concern driven",casual:"Friendly, direct, peer-to-peer"};

    try{
      const r=await callAI(
        `You are a senior CRE capital finder writing a ${touches}-touch ${channel} outreach sequence. ${channelGuide[channel]} Tone: ${toneGuide[tone]}. Generate exactly ${touches} messages labeled clearly as TOUCH 1, TOUCH 2, etc.`,
        `Prospect: ${p.company}
Property: ${p.propType} in ${p.city}, ${p.state}
Loan: $${p.loanAmt.toLocaleString()} originated in ${p.year} by ${p.lender}
Original Rate: ${p.origRate}% — Market Rate Today: 6.85% — Gap: ${p.rateGap > 0 ? '+' : ''}${p.rateGap}%
Opportunity Type: ${p.oppType}
Refi Score: ${p.refiScore}/100 (${p.priority})

My Value Proposition: ${myValue}

Generate ${touches} ${channel} messages. ${touches > 1 ? `Space them out: Touch 1 (Day 1), Touch 2 (Day ${touches>=3?5:3}${touches>=3?', Touch 3 (Day 10)':''}${touches>=4?', Touch 4 (Day 18)':''}${touches>=5?', Touch 5 (Day 28)':''}).` : ''}

Label each as:
## TOUCH [N] — [Label] (Day X)${channel==="email"?"\\nSUBJECT: [subject line]\\n":""}
[message body]`
      );
      setOutreach({text:r,prospect:p,channel,touches,generated:new Date().toISOString()});
    }catch{setOutreach({text:"Error generating sequence. Please try again.",prospect:p,channel,touches});}
    setOLoading(false);
  };

  const addToPipeline=(p)=>{
    if(pipeline.find(x=>x.id===p.id))return;
    const newPipeline=[...pipeline,{...p,stage:"new",addedAt:new Date().toISOString(),notes:"",lastContacted:null}];
    savePipeline(newPipeline);
  };
  const addSelectedToPipeline=()=>{prospects.filter(p=>selected.includes(p.id)).forEach(addToPipeline);};
  const updateStage=(id,stage)=>savePipeline(pipeline.map(p=>p.id===id?{...p,stage}:p));
  const removeFromPipeline=(id)=>savePipeline(pipeline.filter(p=>p.id!==id));
  const updateNotes=(id,notes)=>savePipeline(pipeline.map(p=>p.id===id?{...p,notes}:p));
  const markContacted=(id)=>savePipeline(pipeline.map(p=>p.id===id?{...p,lastContacted:new Date().toISOString(),stage:p.stage==="new"?"contacted":p.stage}:p));

  // Analytics
  const pipelineValue=pipeline.reduce((s,p)=>{const stg=PIPELINE_STAGES.find(st=>st.id===p.stage);return s+(p.loanAmt||0)*(stg?.prob||5)/100;},0);
  const projectedFees=pipelineValue*0.01;
  const stageBreakdown=PIPELINE_STAGES.map(st=>({...st,count:pipeline.filter(p=>p.stage===st.id).length,value:pipeline.filter(p=>p.stage===st.id).reduce((s,p)=>s+(p.loanAmt||0),0)}));

  // CSV export
  const exportCSV=(rows)=>{
    const cols=["Company","Property Type","City","State","Loan Amount","Lender","Year","Orig Rate","Opp Type","Refi Score","Priority","Stage"];
    const csv=cols.join(",")+"\n"+rows.map(p=>[p.company,p.propType,p.city,p.state,p.loanAmt,p.lender,p.year,p.origRate,p.oppType,p.refiScore,p.priority,p.stage||""].join(",")).join("\n");
    navigator.clipboard.writeText(csv).then(()=>alert("CSV copied to clipboard"));
  };

  const PC={Hot:C.danger,Warm:C.gold,Cold:C.muted};

  return(
    <div className="au" style={{maxWidth:1140}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}>
        <div>
          <h2 style={H2}>Client Acquisition Engine</h2>
          <p style={{...Sub,marginBottom:0}}>HMDA-powered CRE prospect search, multi-channel outreach sequences, and pipeline management.</p>
        </div>
        {pipeline.length>0&&<div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:11,color:C.muted}}>{pipeline.length} in pipeline</span>
          <span style={{fontSize:11,color:C.gold,fontFamily:"'DM Mono',monospace"}}>${Math.round(projectedFees/1000)}K projected fees</span>
        </div>}
      </div>

      {/* Tab nav */}
      <div style={{display:"flex",gap:4,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:4,marginBottom:20,overflowX:"auto"}}>
        {[["search","🔍 Prospect Search"],["outreach","✉️ Outreach Studio"],["pipeline","📊 Pipeline"],["analytics","📈 Analytics"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{padding:"8px 18px",borderRadius:7,border:"none",background:tab===v?C.card:"transparent",color:tab===v?C.goldBright:C.muted,fontSize:12,fontWeight:tab===v?600:400,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>
            {l}{v==="pipeline"&&pipeline.length>0&&<span style={{marginLeft:5,fontSize:9,background:`${C.goldMuted}33`,color:C.gold,padding:"1px 5px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>{pipeline.length}</span>}
          </button>
        ))}
      </div>

      {/* ─── SEARCH TAB ─── */}
      {tab==="search"&&(
        <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:18}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={P}>
              <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.teal,letterSpacing:".12em",marginBottom:12}}>HMDA FILTERS</div>
              <div style={{marginBottom:10}}><FL l="Property Type"/><Sel val={filters.propType} set={ff("propType")} opts={["All","Multifamily","Office","Retail","Industrial","Hotel","Self-Storage","Mixed-Use"]}/></div>
              <div style={{marginBottom:10}}><FL l="State"/>
                <select value={filters.state} onChange={e=>ff("state")(e.target.value)} style={{...IS,width:"100%"}}>
                  {HMDA_STATES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{marginBottom:10}}><FL l="Min Loan ($)"/><Inp val={filters.minLoan} set={ff("minLoan")} ph="500000" mono/></div>
              <div style={{marginBottom:10}}><FL l="Max Loan ($)"/><Inp val={filters.maxLoan} set={ff("maxLoan")} ph="5000000" mono/></div>
              <div style={{marginBottom:10}}><FL l="HMDA Year"/><Sel val={filters.year} set={ff("year")} opts={["2024","2023","2022","2021","2020","2019","2018","2017"]}/></div>
              <div style={{marginBottom:14}}><FL l="Results Count"/><Sel val={filters.count} set={ff("count")} opts={["10","20","30","50"]}/></div>
              <button onClick={search} disabled={loading} style={{...btnGold,width:"100%",padding:"10px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontSize:13}}>
                {loading?<><div style={{width:12,height:12,border:`2px solid ${C.bg}55`,borderTopColor:C.bg,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>Searching...</>:<><Search size={13}/>Search Records</>}
              </button>
              {searched&&!loading&&<p style={{fontSize:10,color:C.success,textAlign:"center",marginTop:8}}>✓ {prospects.length} records found</p>}
            </div>

            {selected.length>0&&(
              <div style={{background:`${C.goldMuted}11`,border:`1px solid ${C.borderGold}`,borderRadius:12,padding:14}}>
                <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".1em",marginBottom:10}}>{selected.length} SELECTED</div>
                <button onClick={()=>{genOutreach();}} style={{...btnGold,width:"100%",padding:"9px 0",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:8}}><Zap size={12}/>Generate Outreach</button>
                <button onClick={addSelectedToPipeline} style={{...btnOutline,width:"100%",padding:"7px 0",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:8}}><Target size={11}/>Add to Pipeline</button>
                <button onClick={()=>exportCSV(prospects.filter(p=>selected.includes(p.id)))} style={{...btnOutline,width:"100%",padding:"7px 0",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:8}}><Download size={11}/>Export CSV</button>
                <button onClick={()=>setSelected([])} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:11,width:"100%",fontFamily:"'DM Sans',sans-serif"}}>Clear selection</button>
              </div>
            )}
          </div>

          <div>
            {!searched&&!loading&&(
              <div style={{...P,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:420,opacity:.5}}>
                <Target size={40} color={C.muted} style={{marginBottom:12}}/>
                <p style={{color:C.muted,fontSize:14,fontWeight:500}}>Set filters and search HMDA records</p>
                <p style={{color:C.dim,fontSize:11,marginTop:4}}>Find CRE owners with refi opportunity based on loan age and rate gap</p>
              </div>
            )}
            {loading&&(
              <div style={{...P,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:320}}>
                <div style={{width:28,height:28,border:`2px solid ${C.borderGold}`,borderTopColor:C.goldBright,borderRadius:"50%",animation:"spin 1s linear infinite",marginBottom:12}}/>
                <p style={{color:C.muted,fontSize:13}}>Querying HMDA records...</p>
              </div>
            )}
            {searched&&!loading&&prospects.length>0&&(
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
                  <div onClick={selectAll} style={{width:15,height:15,borderRadius:3,border:`1.5px solid ${selected.length===prospects.length?C.gold:C.border}`,background:selected.length===prospects.length?C.gold:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {selected.length===prospects.length&&<Check size={9} color={C.bg}/>}
                  </div>
                  <span style={{fontSize:10,color:C.dim}}>{selected.length>0?`${selected.length} selected`:""}</span>
                  <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                    <span style={{fontSize:10,color:C.dim}}>Sorted by Refi Score ↓</span>
                  </div>
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                    <thead><tr style={{borderBottom:`1px solid ${C.border}`,background:C.card}}>
                      <th style={{width:32,padding:"8px 12px"}}/>
                      {["Company","Type","Location","Loan Amount","Orig Rate","Opportunity","Score","Priority",""].map(h=>(
                        <th key={h} style={{padding:"8px 10px",textAlign:["Loan Amount","Score"].includes(h)?"right":"left",fontSize:9,color:C.muted,fontWeight:400,fontFamily:"'DM Mono',monospace"}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {prospects.map(p=>{
                        const sel=selected.includes(p.id);
                        const sc=p.refiScore>=70?C.success:p.refiScore>=50?C.goldBright:C.warn;
                        const inPipe=pipeline.find(x=>x.id===p.id);
                        return(
                          <tr key={p.id} style={{borderBottom:`1px solid ${C.border}`,background:sel?`${C.goldMuted}0E`:"transparent"}}>
                            <td style={{padding:"8px 12px"}}><div onClick={()=>toggle(p.id)} style={{width:15,height:15,borderRadius:3,border:`1.5px solid ${sel?C.gold:C.border}`,background:sel?C.gold:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{sel&&<Check size={9} color={C.bg}/>}</div></td>
                            <td style={{padding:"8px 10px",fontSize:11,color:C.text,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.company}</td>
                            <td style={{padding:"8px 10px",fontSize:10,color:C.muted}}>{p.propType}</td>
                            <td style={{padding:"8px 10px",fontSize:10,color:C.muted}}>{p.city}, {p.state}</td>
                            <td style={{padding:"8px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,color:C.text}}>${Math.round(p.loanAmt/1000)}K</td>
                            <td style={{padding:"8px 10px",fontFamily:"'DM Mono',monospace",fontSize:10,color:p.rateGap>0?C.success:C.warn}}>{p.origRate}% ({p.year})</td>
                            <td style={{padding:"8px 10px",fontSize:10,color:C.dim,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.oppType}</td>
                            <td style={{padding:"8px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:600,color:sc}}>{p.refiScore}</td>
                            <td style={{padding:"8px 10px"}}><span style={{fontSize:8,padding:"2px 7px",borderRadius:3,background:`${PC[p.priority]}14`,color:PC[p.priority],fontFamily:"'DM Mono',monospace"}}>{p.priority.toUpperCase()}</span></td>
                            <td style={{padding:"8px 10px"}}><div style={{display:"flex",gap:5}}>
                              <button onClick={()=>setDetail(p)} style={{...btnOutline,padding:"3px 8px",fontSize:9}}>View</button>
                              <button onClick={()=>addToPipeline(p)} disabled={!!inPipe} style={{...btnOutline,padding:"3px 8px",fontSize:9,color:inPipe?C.success:C.muted,borderColor:inPipe?C.successBorder:C.border}}>{inPipe?"✓":"+ Add"}</button>
                            </div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── OUTREACH STUDIO TAB ─── */}
      {tab==="outreach"&&(
        <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:18}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={P}>
              <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".1em",marginBottom:12}}>SEQUENCE SETTINGS</div>
              <div style={{marginBottom:12}}>
                <FL l="Channel"/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {CHANNELS.map(ch=>(
                    <button key={ch.id} onClick={()=>setChannel(ch.id)} style={{padding:"7px 8px",borderRadius:7,border:`1px solid ${channel===ch.id?C.borderGold:C.border}`,background:channel===ch.id?`${C.goldMuted}22`:"transparent",color:channel===ch.id?C.gold:C.muted,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>
                      {ch.icon} {ch.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <FL l="Sequence Length"/>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {TOUCH_COUNTS.map(t=>(
                    <button key={t.id} onClick={()=>setTouches(t.id)} style={{padding:"7px 12px",borderRadius:7,border:`1px solid ${touches===t.id?C.borderGold:C.border}`,background:touches===t.id?`${C.goldMuted}22`:"transparent",color:touches===t.id?C.gold:C.muted,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}>{t.label}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <FL l="Tone"/>
                <Sel val={tone} set={setTone} opts={["professional","consultative","urgent","casual"]}/>
              </div>
              <div style={{marginBottom:14}}>
                <FL l="My Value Proposition"/>
                <textarea value={myValue} onChange={e=>setMyValue(e.target.value)} rows={3} style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:11,color:C.text,fontFamily:"'DM Sans',sans-serif",resize:"vertical",boxSizing:"border-box",outline:"none",lineHeight:1.5}}/>
              </div>
              {selected.length>0?(
                <button onClick={genOutreach} disabled={oLoading} style={{...btnGold,width:"100%",padding:"10px 0",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                  {oLoading?<><div style={{width:12,height:12,border:`2px solid ${C.bg}55`,borderTopColor:C.bg,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>Generating...</>:<><Zap size={13}/>Generate Sequence</>}
                </button>
              ):(
                <div style={{padding:"12px 14px",background:C.card,borderRadius:8,textAlign:"center"}}>
                  <p style={{fontSize:11,color:C.muted}}>Select prospects from Search tab, then generate outreach here.</p>
                </div>
              )}
            </div>
            {outreach&&<div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:14}}>
              <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:8}}>PROSPECT</div>
              <div style={{fontSize:12,fontWeight:600,color:C.white,marginBottom:3}}>{outreach.prospect?.company}</div>
              <div style={{fontSize:10,color:C.muted}}>{outreach.prospect?.propType} · {outreach.prospect?.city}, {outreach.prospect?.state}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:3}}>${Math.round((outreach.prospect?.loanAmt||0)/1000)}K · {outreach.prospect?.year}</div>
              <div style={{marginTop:10,display:"flex",gap:6}}>
                <button onClick={()=>addToPipeline(outreach.prospect)} style={{...btnOutline,padding:"4px 10px",fontSize:10,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><Target size={9}/>+ Pipeline</button>
                <button onClick={()=>markContacted(outreach.prospect?.id)} style={{...btnOutline,padding:"4px 10px",fontSize:10,flex:1}}>✓ Contacted</button>
              </div>
            </div>}
          </div>

          <div>
            {oLoading&&<div style={{background:C.surface,border:`1px solid ${C.borderGold}`,borderRadius:14,padding:"48px 28px",textAlign:"center"}}>
              <div style={{width:28,height:28,border:`2px solid ${C.borderGold}`,borderTopColor:C.goldBright,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 12px"}}/>
              <p style={{color:C.muted,fontSize:13}}>Generating {touches}-touch {channel} sequence...</p>
            </div>}
            {outreach&&!oLoading&&(
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:24}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,paddingBottom:14,borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Mail size={15} color={C.gold}/>
                    <span style={{fontSize:13,fontWeight:600,color:C.white}}>{CHANNELS.find(c=>c.id===outreach.channel)?.label} Sequence</span>
                    <span style={{fontSize:9,padding:"2px 7px",borderRadius:3,background:`${C.goldMuted}2A`,color:C.gold,fontFamily:"'DM Mono',monospace"}}>{outreach.touches}-TOUCH</span>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{navigator.clipboard.writeText(outreach.text).then(()=>{setCopiedOut(true);setTimeout(()=>setCopiedOut(false),2500);});}} style={{...btnOutline,padding:"5px 12px",fontSize:11,display:"flex",alignItems:"center",gap:4}}>{copiedOut?<><CheckCircle size={10} color={C.success}/>Copied!</>:<><Copy size={10}/>Copy All</>}</button>
                    <button onClick={genOutreach} style={{...btnOutline,padding:"5px 12px",fontSize:11,display:"flex",alignItems:"center",gap:4}}><RefreshCw size={10}/>Regenerate</button>
                  </div>
                </div>
                <div style={{fontSize:13,color:C.text,lineHeight:1.9}}>
                  {outreach.text?.split('\n').map((line,i)=>{
                    if(line.startsWith('## TOUCH')||line.startsWith('## Touch'))return<h3 key={i} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:C.gold,margin:"24px 0 8px",fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:5}}>{line.replace('## ','')}</h3>;
                    if(line.startsWith('SUBJECT:')||line.startsWith('Subject:'))return<div key={i} style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.blue,marginBottom:6,padding:"4px 8px",background:`${C.blue}11`,borderRadius:4,display:"inline-block"}}>{line}</div>;
                    if(line.startsWith('['))return<div key={i} style={{fontSize:11,color:C.warn,fontStyle:"italic",margin:"4px 0",padding:"3px 8px",background:`${C.warn}11`,borderRadius:4,display:"inline-block"}}>{line}</div>;
                    if(line==='')return<div key={i} style={{height:6}}/>;
                    return<p key={i} style={{margin:"3px 0"}}>{line}</p>;
                  })}
                </div>
              </div>
            )}
            {!outreach&&!oLoading&&<div style={{...P,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:380,opacity:.5}}>
              <Mail size={36} color={C.muted} style={{marginBottom:12}}/>
              <p style={{color:C.muted,fontSize:14}}>Configure settings and select prospects to generate outreach</p>
              <p style={{color:C.dim,fontSize:11,marginTop:4}}>Personalized to each prospect's loan, lender, rate, and timeline</p>
            </div>}
          </div>
        </div>
      )}

      {/* ─── PIPELINE TAB ─── */}
      {tab==="pipeline"&&(
        <div>
          {pipeline.length===0?(
            <div style={{...P,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:340,opacity:.5}}>
              <Target size={36} color={C.muted} style={{marginBottom:12}}/>
              <p style={{color:C.muted,fontSize:14}}>No prospects in pipeline yet</p>
              <p style={{color:C.dim,fontSize:11,marginTop:4}}>Search for prospects and click "+ Add" to add them here</p>
            </div>
          ):(
            <>
              {/* Stage summary bar */}
              <div style={{display:"flex",gap:8,marginBottom:18,overflowX:"auto"}}>
                {stageBreakdown.map(st=>(
                  <div key={st.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",flexShrink:0,minWidth:110}}>
                    <div style={{fontSize:10,color:st.color,fontFamily:"'DM Mono',monospace",marginBottom:4}}>{st.label.toUpperCase()}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:C.white}}>{st.count}</div>
                    {st.value>0&&<div style={{fontSize:9,color:C.dim,marginTop:2}}>${Math.round(st.value/1000)}K</div>}
                  </div>
                ))}
                <div style={{background:`${C.goldMuted}11`,border:`1px solid ${C.borderGold}`,borderRadius:10,padding:"10px 14px",flexShrink:0,minWidth:130}}>
                  <div style={{fontSize:10,color:C.gold,fontFamily:"'DM Mono',monospace",marginBottom:4}}>PROJ. FEES (1%)</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:C.goldBright}}>${Math.round(projectedFees/1000)}K</div>
                  <div style={{fontSize:9,color:C.dim,marginTop:2}}>Weighted pipeline</div>
                </div>
              </div>

              {/* Pipeline table */}
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
                <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:10,color:C.muted}}>{pipeline.length} prospects</span>
                  <button onClick={()=>exportCSV(pipeline)} style={{...btnOutline,padding:"4px 10px",fontSize:10,display:"flex",alignItems:"center",gap:4}}><Download size={9}/>Export All</button>
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                    <thead><tr style={{borderBottom:`1px solid ${C.border}`,background:C.card}}>
                      {["Company","Type","Loan","Lender","Stage","Refi Score","Last Contact","Notes",""].map(h=>(
                        <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:9,color:C.muted,fontWeight:400,fontFamily:"'DM Mono',monospace"}}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {pipeline.map(p=>{
                        const stg=PIPELINE_STAGES.find(s=>s.id===p.stage)||PIPELINE_STAGES[0];
                        return(
                          <tr key={p.id} style={{borderBottom:`1px solid ${C.border}`}}>
                            <td style={{padding:"9px 10px",fontSize:11,color:C.text,maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.company}</td>
                            <td style={{padding:"9px 10px",fontSize:10,color:C.muted}}>{p.propType}</td>
                            <td style={{padding:"9px 10px",fontFamily:"'DM Mono',monospace",fontSize:10,color:C.text}}>${Math.round(p.loanAmt/1000)}K</td>
                            <td style={{padding:"9px 10px",fontSize:10,color:C.muted,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.lender}</td>
                            <td style={{padding:"9px 8px"}}>
                              <select value={p.stage} onChange={e=>updateStage(p.id,e.target.value)} style={{...IS,padding:"3px 6px",fontSize:10,color:stg.color,background:C.card,border:`1px solid ${stg.color}44`,width:130}}>
                                {PIPELINE_STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                              </select>
                            </td>
                            <td style={{padding:"9px 10px",fontFamily:"'DM Mono',monospace",fontSize:11,color:p.refiScore>=70?C.success:C.goldBright}}>{p.refiScore}</td>
                            <td style={{padding:"9px 10px",fontSize:10,color:C.dim}}>
                              {p.lastContacted?new Date(p.lastContacted).toLocaleDateString("en-US",{month:"short",day:"numeric"}):"—"}
                            </td>
                            <td style={{padding:"9px 8px"}}>
                              <input value={p.notes||""} onChange={e=>updateNotes(p.id,e.target.value)} placeholder="Add note..." style={{...IS,padding:"3px 8px",fontSize:10,width:140}}/>
                            </td>
                            <td style={{padding:"9px 8px"}}><div style={{display:"flex",gap:4}}>
                              <button onClick={()=>markContacted(p.id)} style={{...btnOutline,padding:"3px 8px",fontSize:9}}>✓</button>
                              <button onClick={()=>removeFromPipeline(p.id)} style={{background:"none",border:`1px solid ${C.border}`,color:C.dim,borderRadius:5,padding:"3px 6px",cursor:"pointer",fontSize:9}}>✕</button>
                            </div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── ANALYTICS TAB ─── */}
      {tab==="analytics"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
            {[
              {l:"Pipeline Size",v:pipeline.length,sub:"active prospects",color:C.blue},
              {l:"Total Loan Volume",v:`$${Math.round(pipeline.reduce((s,p)=>s+p.loanAmt,0)/1e6*10)/10}M`,sub:"in pipeline",color:C.teal},
              {l:"Weighted Pipeline",v:`$${Math.round(pipelineValue/1000)}K`,sub:"by stage probability",color:C.gold},
              {l:"Projected Fees (1%)",v:`$${Math.round(projectedFees/1000)}K`,sub:"at close",color:C.success},
            ].map((m,i)=>(
              <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>
                <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".08em",marginBottom:8}}>{m.l.toUpperCase()}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:700,color:m.color,lineHeight:1,marginBottom:4}}>{m.v}</div>
                <div style={{fontSize:10,color:C.dim}}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={P}>
              <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:14}}>PIPELINE BY STAGE</div>
              {stageBreakdown.map(st=>(
                <div key={st.id} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:12,color:C.text}}>{st.label}</span>
                    <div style={{display:"flex",gap:12}}>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.muted}}>{st.count} prospects</span>
                      {st.value>0&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:st.color}}>${Math.round(st.value/1000)}K</span>}
                    </div>
                  </div>
                  <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pipeline.length>0?st.count/pipeline.length*100:0}%`,background:st.color,borderRadius:3,transition:"width .5s"}}/>
                  </div>
                  <div style={{fontSize:9,color:C.dim,marginTop:2}}>{st.prob}% close probability</div>
                </div>
              ))}
            </div>

            <div style={P}>
              <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:14}}>REVENUE PROJECTION</div>
              {[
                {label:"If all Hot close (1% fee)",val:pipeline.filter(p=>p.priority==="Hot").reduce((s,p)=>s+p.loanAmt,0)*0.01},
                {label:"If pipeline closes at prob",val:projectedFees},
                {label:"If top 20% close",val:pipeline.sort((a,b)=>b.refiScore-a.refiScore).slice(0,Math.max(1,Math.floor(pipeline.length*0.2))).reduce((s,p)=>s+p.loanAmt,0)*0.01},
                {label:"Annual (×3 pipelines/yr)",val:projectedFees*3},
              ].map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:12,color:C.muted}}>{m.label}</span>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:600,color:m.val>50000?C.success:m.val>10000?C.goldBright:C.muted}}>${Math.round(m.val/1000)}K</span>
                </div>
              ))}
              <div style={{marginTop:16,padding:"12px 14px",background:`${C.goldMuted}0A`,border:`1px solid ${C.borderGold}`,borderRadius:8}}>
                <div style={{fontSize:10,color:C.gold,marginBottom:4}}>💡 Industry Benchmark</div>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>Top CRE capital finders close 4–8 deals/year at avg $3M–$5M. That's $120K–$400K in fees annually at 1%.</div>
              </div>
            </div>
          </div>

          {pipeline.length===0&&<div style={{marginTop:16,padding:"32px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,textAlign:"center",opacity:.5}}>
            <p style={{color:C.muted,fontSize:13}}>Add prospects to your pipeline to see analytics</p>
          </div>}
        </div>
      )}

      {/* Detail Modal */}
      {detail&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setDetail(null)}>
        <div style={{background:C.card,border:`1px solid ${C.borderGold}`,borderRadius:16,padding:28,maxWidth:460,width:"100%",animation:"fadeUp .3s ease"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.white}}>{detail.company}</h3>
            <button onClick={()=>setDetail(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted}}><X size={16}/></button>
          </div>
          {[
            ["Property Type",detail.propType],
            ["Location",`${detail.city}, ${detail.state}`],
            ["Loan Amount",`$${detail.loanAmt.toLocaleString()}`],
            ["Lender",detail.lender],
            ["HMDA Year",detail.year],
            ["Original Rate",`${detail.origRate}%`],
            ["Rate Gap",`${detail.rateGap > 0 ? '+' : ''}${detail.rateGap}% vs market`],
            ["Opportunity",detail.oppType],
            ["Refi Score",`${detail.refiScore}/100`],
          ].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,color:C.muted}}>{l}</span>
              <span style={{fontSize:11,color:C.text,textAlign:"right"}}>{v}</span>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:18}}>
            <button onClick={()=>{addToPipeline(detail);setDetail(null);}} style={{...btnGold,flex:1,padding:"10px 0",fontSize:12}}>+ Add to Pipeline</button>
            <button onClick={()=>{toggle(detail.id);setDetail(null);setTab("outreach");genOutreach();}} style={{...btnOutline,flex:1,padding:"10px 0",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><Zap size={11}/>Generate Outreach</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

/* ─── DEAL PACKAGER ─── */
const DP_FORMATS=[
  {id:"full",label:"Full Lender Package",desc:"Complete 2,000-word institutional memo — 8 sections",badge:"MOST USED"},
  {id:"teaser",label:"Lender Teaser",desc:"One-page executive summary for initial outreach",badge:null},
  {id:"agency",label:"Agency/CMBS Screen",desc:"Structured checklist format for Fannie/Freddie/conduit",badge:null},
];
function DealPackager() {
  const [tab,setTab]=useState("inputs");
  const [fmt,setFmt]=useState("full");
  const [form,setForm]=useState({
    propType:"Multifamily",address:"",city:"",state:"AK",zipCode:"",yearBuilt:"",units:"",sqft:"",occupancy:"95",description:"",
    price:"",noi:"",gpr:"",vacancy:"5",ltv:"70",rate:"6.75",amort:"25",ioYears:"0",purpose:"Acquisition",
    rehabBudget:"",stabilizedNOI:"",
    sponsor:"",sponsorExp:"",netWorth:"",liquidity:"",
    market:"Anchorage, AK",submarket:"",
    existingLoan:"",existingRate:"",existingMaturity:"",
  });
  const [output,setOutput]=useState(null);
  const [apexData,setApexData]=useState(null);
  const [loading,setLoading]=useState(false);
  const [loadingMsg,setLoadingMsg]=useState("");
  const [topLenders,setTopLenders]=useState([]);
  const [copied,setCopied]=useState(false);
  const f=k=>v=>setForm(p=>({...p,[k]:v}));

  const price=parseFloat(form.price)||0,noi=parseFloat(form.noi)||0;
  const gpr=parseFloat(form.gpr)||0;
  const ltvN=parseFloat(form.ltv)/100||0.70,rateN=parseFloat(form.rate)||6.75,amortN=parseFloat(form.amort)||25;
  const ioYrs=parseInt(form.ioYears)||0;
  const loan=price*ltvN,r=rateN/100/12,n=amortN*12;
  const mPmt=ioYrs>0?loan*(rateN/100/12):(r>0?loan*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):0);
  const annDebt=mPmt*12,equity=price*(1-ltvN);
  const capRate=price>0?noi/price*100:0,dscr=annDebt>0?noi/annDebt:0;
  const coc=equity>0?(noi-annDebt)/equity*100:0,debtYield=loan>0?noi/loan*100:0;
  const units=parseInt(form.units)||0,pricePerUnit=units>0?price/units:0;
  const grm=gpr>0?price/gpr:0;
  const rehabBudget=parseFloat(form.rehabBudget)||0,closingCosts=price*0.02;
  const totalUses=price+rehabBudget+closingCosts,srcDebt=loan,srcEquity=totalUses-srcDebt;
  const canGenerate=form.address&&form.price&&form.noi;

  const metrics=[
    {l:"Cap Rate",v:`${capRate.toFixed(2)}%`,ok:capRate>=5.5},
    {l:"DSCR",v:`${dscr.toFixed(2)}x`,ok:dscr>=1.25},
    {l:"LTV",v:`${form.ltv}%`,ok:ltvN<=0.75},
    {l:"Debt Yield",v:`${debtYield.toFixed(1)}%`,ok:debtYield>=8},
    {l:"Loan Amount",v:`$${Math.round(loan/1000)}K`,ok:true},
    {l:"Ann. Debt Svc",v:`$${Math.round(annDebt/1000)}K`,ok:true},
    {l:"Cash-on-Cash",v:`${coc.toFixed(1)}%`,ok:coc>=5},
    {l:"Equity Req.",v:`$${Math.round(equity/1000)}K`,ok:true},
  ];

  const generate=async()=>{
    if(!canGenerate){alert("Address, price, and NOI are required.");return;}
    setLoading(true);setOutput(null);setTab("output");
    const sc=calcAPEXScore({capRate:capRate.toFixed(2),dscr:dscr.toFixed(2),ltv:form.ltv,propType:form.propType,purpose:form.purpose});
    setApexData(sc);
    const matched=matchLenders({propType:form.propType,loanAmt:loan,ltv:form.ltv,dscr:dscr.toFixed(2),state:form.state,purpose:form.purpose});
    setTopLenders(matched.filter(l=>l.eligible).slice(0,5));
    const msgs=["Underwriting deal parameters...","Calculating key metrics...","Structuring executive memo...","Building lender narrative...","Finalizing package..."];
    let mi=0;const ticker=setInterval(()=>{setLoadingMsg(msgs[mi%msgs.length]);mi++;},1400);
    const prompts={
      full:`You are a senior CRE capital markets advisor at an institutional advisory firm. Generate a complete 2,000-word lender submission package with EXACTLY these 8 section headers (use ## before each):
## EXECUTIVE SUMMARY
## PROPERTY OVERVIEW
## FINANCIAL ANALYSIS
## DEBT STRUCTURE & SIZING
## MARKET ANALYSIS & POSITION
## SPONSORSHIP & EXPERIENCE
## INVESTMENT THESIS & VALUE PROPOSITION
## RISK FACTORS & MITIGANTS
Rules: Use **bold** for key metrics. Include specific numbers in every section. Write at Walker & Dunlop / CBRE advisory quality. Each section minimum 200 words. Risk section must include specific mitigants. Include market comparables and benchmarks.`,
      teaser:`You are a senior CRE capital markets advisor. Write a 500-word lender teaser with EXACTLY these sections (## before each):
## THE OPPORTUNITY
## KEY METRICS AT A GLANCE
## WHY THIS DEAL
## SPONSOR SNAPSHOT
## NEXT STEPS
Lead with the strongest hook. Tight, clean, professional. Use bold for metrics. Goal: get a lender on a call.`,
      agency:`You are a senior CRE underwriter preparing an agency/CMBS eligibility screen. Use EXACTLY these sections (## before each):
## PROPERTY ELIGIBILITY CHECKLIST
## FINANCIAL QUALIFICATION MATRIX
## BORROWER/SPONSOR QUALIFICATION
## LOAN STRUCTURING RECOMMENDATION
## RED FLAGS & OPEN ITEMS
For each item: clearly state PASS, FAIL, or NEEDS VERIFICATION with the specific number. Conclude with ELIGIBLE / CONDITIONAL / INELIGIBLE ruling.`,
    };
    const dealData=`PROPERTY: ${form.propType} | ${form.address}${form.city?`, ${form.city}`:""}${form.state?`, ${form.state}`:""} ${form.zipCode}
Year Built: ${form.yearBuilt||"N/A"} | Units: ${form.units||"N/A"} | SF: ${form.sqft||"N/A"} | Occupancy: ${form.occupancy}%
Description: ${form.description||"Standard "+form.propType+" asset"}

FINANCIALS:
Purchase Price: $${Number(form.price).toLocaleString()}
Gross Potential Rent: $${Number(gpr||0).toLocaleString()}/yr
Annual NOI: $${Number(form.noi).toLocaleString()}/yr (Vacancy: ${form.vacancy}%)
Cap Rate: ${capRate.toFixed(2)}% | GRM: ${grm>0?grm.toFixed(1)+"x":"N/A"}
${rehabBudget>0?`Rehab Budget: $${Number(rehabBudget).toLocaleString()} | Stabilized NOI: $${Number(form.stabilizedNOI||form.noi).toLocaleString()}`:""}

DEBT:
Loan: $${Math.round(loan).toLocaleString()} (${form.ltv}% LTV) | Rate: ${form.rate}%${ioYrs>0?` (${ioYrs}-yr IO)`:""}
Amort: ${form.amort}yr | DSCR: ${dscr.toFixed(2)}x | Debt Yield: ${debtYield.toFixed(2)}%
Ann. Debt Service: $${Math.round(annDebt).toLocaleString()} | Purpose: ${form.purpose}
${form.existingLoan?`Existing: $${Number(form.existingLoan).toLocaleString()} @ ${form.existingRate}% — ${form.existingMaturity}mo remaining`:""}

SPONSOR: ${form.sponsor||"Experienced CRE operator"}
Experience: ${form.sponsorExp||"To be provided"} | Net Worth: ${form.netWorth||"TBP"} | Liquidity: ${form.liquidity||"TBP"}

MARKET: ${form.market}${form.submarket?` — ${form.submarket} submarket`:""} 
APEX SCORE: ${sc.score}/100 (${sc.grade})`;
    try{const r=await callAI(prompts[fmt],dealData);setOutput(r);}
    catch{setOutput("Error generating memo. Please try again.");}
    clearInterval(ticker);setLoading(false);setLoadingMsg("");
  };

  const copyMemo=()=>{if(!output)return;navigator.clipboard.writeText(output).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);});};
  const gcol=!apexData?C.muted:apexData.score>=75?C.success:apexData.score>=55?C.goldBright:C.warn;

  return(
    <div className="au" style={{maxWidth:1100}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}>
        <div><h2 style={H2}>Deal Packager AI</h2><p style={{...Sub,marginBottom:0}}>Professional lender-ready packages in seconds. Three formats, APEX scoring, auto lender matching.</p></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {output&&<button onClick={copyMemo} style={{...btnOutline,padding:"7px 16px",fontSize:12,display:"flex",alignItems:"center",gap:5}}>{copied?<><CheckCircle size={11} color={C.success}/>Copied!</>:<><Copy size={11}/>Copy Memo</>}</button>}
          {output&&<button onClick={()=>window.print()} style={{...btnOutline,padding:"7px 16px",fontSize:12,display:"flex",alignItems:"center",gap:5}}><Download size={11}/>Print PDF</button>}
          {output&&<button onClick={()=>{setOutput(null);setApexData(null);setTopLenders([]);setTab("inputs");}} style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>New Deal</button>}
        </div>
      </div>

      {/* Format selector */}
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        {DP_FORMATS.map(d=>(
          <div key={d.id} onClick={()=>setFmt(d.id)} style={{flex:1,minWidth:180,background:C.surface,border:`2px solid ${fmt===d.id?C.borderGold:C.border}`,borderRadius:12,padding:"12px 16px",cursor:"pointer",transition:"border-color .2s"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:fmt===d.id?C.gold:C.border}}/>
              <span style={{fontSize:13,fontWeight:600,color:fmt===d.id?C.white:C.muted}}>{d.label}</span>
              {d.badge&&<span style={{fontSize:8,padding:"1px 6px",borderRadius:3,background:`${C.goldMuted}33`,color:C.gold,fontFamily:"'DM Mono',monospace"}}>{d.badge}</span>}
            </div>
            <p style={{fontSize:11,color:C.dim,marginLeft:13}}>{d.desc}</p>
          </div>
        ))}
      </div>

      {/* Tab nav (only after generate) */}
      {output&&<div style={{display:"flex",gap:8,marginBottom:18}}>
        {[["inputs","✏️ Edit Inputs"],["output","📄 Memo Package"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{padding:"8px 20px",borderRadius:8,border:`1px solid ${tab===v?C.borderGold:C.border}`,background:tab===v?`${C.goldMuted}18`:"transparent",color:tab===v?C.gold:C.muted,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:tab===v?600:400}}>{l}</button>
        ))}
      </div>}

      {/* INPUTS */}
      {tab==="inputs"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={P}>
              <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".1em",marginBottom:12}}>PROPERTY</div>
              <div style={{marginBottom:10}}><FL l="Property Type"/><Sel val={form.propType} set={f("propType")} opts={PROP_TYPES}/></div>
              <div style={{marginBottom:10}}><FL l="Street Address"/><Inp val={form.address} set={f("address")} ph="123 Main Street"/></div>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8,marginBottom:10}}>
                <div><FL l="City"/><Inp val={form.city} set={f("city")} ph="Anchorage"/></div>
                <div><FL l="State"/><Inp val={form.state} set={f("state")} ph="AK"/></div>
                <div><FL l="Zip"/><Inp val={form.zipCode} set={f("zipCode")} ph="99501"/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                <div><FL l="Year Built"/><Inp val={form.yearBuilt} set={f("yearBuilt")} ph="1998" mono/></div>
                <div><FL l="Units"/><Inp val={form.units} set={f("units")} ph="24" mono/></div>
                <div><FL l="Sqft"/><Inp val={form.sqft} set={f("sqft")} ph="18000" mono/></div>
              </div>
              <div style={{marginBottom:10}}><FL l="Occupancy (%)"/><Inp val={form.occupancy} set={f("occupancy")} ph="95" mono/></div>
              <div><FL l="Property Description"/><textarea value={form.description} onChange={e=>f("description")(e.target.value)} placeholder="3-story garden-style MF, renovated interiors, covered parking..." rows={3} style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:C.text,fontFamily:"'DM Sans',sans-serif",resize:"vertical",boxSizing:"border-box",outline:"none",lineHeight:1.6}}/></div>
            </div>
            <div style={P}>
              <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.blue,letterSpacing:".1em",marginBottom:12}}>SPONSOR / BORROWER</div>
              <div style={{marginBottom:10}}><FL l="Sponsor / Entity Name"/><Inp val={form.sponsor} set={f("sponsor")} ph="Huit Capital Partners LLC"/></div>
              <div style={{marginBottom:10}}><FL l="CRE Experience"/><Inp val={form.sponsorExp} set={f("sponsorExp")} ph="18 years, $85M in transactions"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><FL l="Net Worth"/><Inp val={form.netWorth} set={f("netWorth")} ph="$4.2M" mono/></div>
                <div><FL l="Liquidity"/><Inp val={form.liquidity} set={f("liquidity")} ph="$800K" mono/></div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={P}>
              <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.teal,letterSpacing:".1em",marginBottom:12}}>FINANCIALS</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{marginBottom:10}}><FL l="Purchase Price ($)"/><Inp val={form.price} set={v=>f("price")(v.replace(/\D/g,""))} ph="2500000" mono/></div>
                <div style={{marginBottom:10}}><FL l="Gross Potential Rent ($)"/><Inp val={form.gpr} set={v=>f("gpr")(v.replace(/\D/g,""))} ph="240000" mono/></div>
                <div style={{marginBottom:10}}><FL l="Annual NOI ($)"/><Inp val={form.noi} set={v=>f("noi")(v.replace(/\D/g,""))} ph="175000" mono/></div>
                <div style={{marginBottom:10}}><FL l="Vacancy Rate (%)"/><Inp val={form.vacancy} set={f("vacancy")} ph="5" mono/></div>
                <div style={{marginBottom:10}}><FL l="Rehab Budget ($)"/><Inp val={form.rehabBudget} set={v=>f("rehabBudget")(v.replace(/\D/g,""))} ph="0" mono/></div>
                <div style={{marginBottom:10}}><FL l="Stabilized NOI ($)"/><Inp val={form.stabilizedNOI} set={v=>f("stabilizedNOI")(v.replace(/\D/g,""))} ph="195000" mono/></div>
              </div>
            </div>
            <div style={P}>
              <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.purple,letterSpacing:".1em",marginBottom:12}}>DEBT STRUCTURE</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{marginBottom:10}}><FL l="LTV (%)"/><Inp val={form.ltv} set={f("ltv")} ph="70" mono/></div>
                <div style={{marginBottom:10}}><FL l="Interest Rate (%)"/><Inp val={form.rate} set={f("rate")} ph="6.75" mono/></div>
                <div style={{marginBottom:10}}><FL l="Amortization (yrs)"/><Inp val={form.amort} set={f("amort")} ph="25" mono/></div>
                <div style={{marginBottom:10}}><FL l="Interest-Only (yrs)"/><Inp val={form.ioYears} set={f("ioYears")} ph="0" mono/></div>
              </div>
              <div style={{marginBottom:10}}><FL l="Loan Purpose"/><Sel val={form.purpose} set={f("purpose")} opts={LOAN_PURPOSES}/></div>
              {(form.purpose==="Refinance"||form.purpose==="Cash-Out Refinance")&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  <div><FL l="Existing Balance ($)"/><Inp val={form.existingLoan} set={v=>f("existingLoan")(v.replace(/\D/g,""))} ph="1400000" mono/></div>
                  <div><FL l="Existing Rate (%)"/><Inp val={form.existingRate} set={f("existingRate")} ph="4.25" mono/></div>
                  <div><FL l="Maturity (mo)"/><Inp val={form.existingMaturity} set={f("existingMaturity")} ph="18" mono/></div>
                </div>
              )}
            </div>
            <div style={P}>
              <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.rose,letterSpacing:".1em",marginBottom:8}}>MARKET</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><FL l="Market / MSA"/><Inp val={form.market} set={f("market")} ph="Anchorage, AK"/></div>
                <div><FL l="Submarket"/><Inp val={form.submarket} set={f("submarket")} ph="South Anchorage"/></div>
              </div>
            </div>
            {price>0&&noi>0&&(
              <div style={{background:`${C.goldMuted}0A`,border:`1px solid ${C.borderGold}`,borderRadius:12,padding:"14px 16px"}}>
                <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".1em",marginBottom:12}}>LIVE METRICS</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
                  {metrics.map((m,i)=>(<div key={i} style={{background:C.card,borderRadius:7,padding:"8px 10px"}}><div style={{fontSize:8,color:C.dim,marginBottom:3}}>{m.l}</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:600,color:m.ok?C.success:C.warn}}>{m.v}</div></div>))}
                </div>
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10}}>
                  <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:8}}>SOURCES & USES</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      {[["Purchase Price",price],rehabBudget>0?["Rehab Budget",rehabBudget]:null,["Closing Costs",closingCosts]].filter(Boolean).map(([l,v])=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:C.dim}}>{l}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.muted}}>${Math.round(v/1000)}K</span></div>
                      ))}
                      <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:3,marginTop:3}}><span style={{fontSize:10,fontWeight:600,color:C.text}}>Total Uses</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:600,color:C.white}}>${Math.round(totalUses/1000)}K</span></div>
                    </div>
                    <div>
                      {[["Senior Debt",srcDebt],["Equity",srcEquity]].map(([l,v])=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:C.dim}}>{l}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.muted}}>${Math.round(v/1000)}K</span></div>
                      ))}
                      <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:3,marginTop:3}}><span style={{fontSize:10,fontWeight:600,color:C.text}}>Total Sources</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:600,color:C.white}}>${Math.round(totalUses/1000)}K</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <button onClick={generate} disabled={loading||!canGenerate} style={{...btnGold,width:"100%",padding:"14px 0",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:!canGenerate?0.5:1}}>
              {loading?<><div style={{width:15,height:15,border:`2px solid ${C.bg}55`,borderTopColor:C.bg,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>{loadingMsg||"Generating..."}</>:<><FileText size={15}/>Generate {DP_FORMATS.find(d=>d.id===fmt)?.label}</>}
            </button>
          </div>
        </div>
      )}

      {/* OUTPUT */}
      {tab==="output"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 290px",gap:18,alignItems:"start"}}>
          <div>
            {loading&&(
              <div style={{background:C.surface,border:`1px solid ${C.borderGold}`,borderRadius:14,padding:"60px 28px",textAlign:"center"}}>
                <div style={{width:36,height:36,border:`2px solid ${C.borderGold}`,borderTopColor:C.goldBright,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}}/>
                <p style={{color:C.muted,fontSize:14,marginBottom:4}}>{loadingMsg||"Generating package..."}</p>
                <p style={{color:C.dim,fontSize:11}}>Building {DP_FORMATS.find(d=>d.id===fmt)?.label}</p>
              </div>
            )}
            {output&&!loading&&(
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"28px 32px"}}>
                <div style={{borderBottom:`2px solid ${C.borderGold}`,paddingBottom:18,marginBottom:24}}>
                  <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".2em",marginBottom:6}}>CONFIDENTIAL — CRE DEAL PACKAGE</div>
                  <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,color:C.white,marginBottom:8}}>{form.propType}{form.address?` — ${form.address}`:""}
                    {form.city?`, ${form.city}`:""}
                    {form.state?`, ${form.state}`:""}
                  </h1>
                  <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                    {[["Price",`$${Number(form.price).toLocaleString()}`],["Loan",`$${Math.round(loan/1000)}K (${form.ltv}% LTV)`],["NOI",`$${Number(form.noi).toLocaleString()}/yr`],["Cap",`${capRate.toFixed(2)}%`],["DSCR",`${dscr.toFixed(2)}x`]].filter(([,v])=>v&&!v.startsWith("$0")).map(([l,v])=>(
                      <div key={l} style={{fontSize:11,color:C.muted}}>{l}: <strong style={{color:C.white}}>{v}</strong></div>
                    ))}
                  </div>
                </div>
                <div style={{fontSize:13,color:C.text,lineHeight:1.9}}>
                  {output.split('\n').map((line,i)=>{
                    if(line.startsWith('## '))return<h2 key={i} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.gold,margin:"28px 0 10px",fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:6}}>{line.replace('## ','')}</h2>;
                    if(line.startsWith('### '))return<h3 key={i} style={{fontSize:14,fontWeight:600,color:C.white,margin:"16px 0 6px"}}>{line.replace('### ','')}</h3>;
                    if(line.startsWith('- ')||line.startsWith('• '))return<div key={i} style={{paddingLeft:16,margin:"4px 0",display:"flex",gap:8}}><span style={{color:C.gold,flexShrink:0,marginTop:3}}>▸</span><span>{line.slice(2)}</span></div>;
                    if(line==='')return<div key={i} style={{height:8}}/>;
                    return<p key={i} style={{margin:"4px 0"}} dangerouslySetInnerHTML={{__html:line.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#DDE2EE">$1</strong>')}}></p>;
                  })}
                </div>
                <div style={{borderTop:`1px solid ${C.border}`,marginTop:28,paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                  <p style={{fontSize:10,color:C.dim}}>Generated by HyCRE.ai · A Huit.AI Product · Confidential</p>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={copyMemo} style={{...btnOutline,padding:"6px 14px",fontSize:11,display:"flex",alignItems:"center",gap:5}}>{copied?<><CheckCircle size={10} color={C.success}/>Copied!</>:<><Copy size={10}/>Copy</>}</button>
                    <button onClick={()=>window.print()} style={{...btnGold,padding:"6px 14px",fontSize:11,display:"flex",alignItems:"center",gap:5}}><Download size={10}/>Print PDF</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {!loading&&output&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {apexData&&(
                <div style={{background:`linear-gradient(135deg,${C.card},${C.card2})`,border:`1px solid ${C.borderGold}`,borderRadius:14,padding:18}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:14}}><Award size={13} color={C.gold}/><span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.gold,letterSpacing:".1em"}}>APEX DEAL SCORE</span></div>
                  <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:12}}>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:52,fontWeight:700,color:gcol,lineHeight:1}}>{apexData.score}</span>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:gcol}}>{apexData.grade}</span>
                  </div>
                  {apexData.factors.map((fac,i)=>(
                    <div key={i} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:C.muted}}>{fac.name}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:fac.grade==="A"?C.success:fac.grade==="B"?C.goldBright:fac.grade==="C"?C.warn:C.danger}}>{fac.grade} {fac.score}/{fac.max}</span></div>
                      <div style={{height:3,background:C.border,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${(fac.score/fac.max)*100}%`,background:fac.grade==="A"?C.success:fac.grade==="B"?C.gold:fac.grade==="C"?C.warn:C.danger,transition:"width .5s"}}/></div>
                    </div>
                  ))}
                </div>
              )}
              {topLenders.length>0&&(
                <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
                  <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:12}}>TOP LENDER MATCHES</div>
                  {topLenders.map((l,i)=>(
                    <div key={l.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:8,borderBottom:i<topLenders.length-1?`1px solid ${C.border}`:"none"}}>
                      <div style={{width:20,height:20,borderRadius:4,background:C.card,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>{l.logo}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:500,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.name}</div>
                        <div style={{fontSize:9,color:C.dim}}>{l.type} · {l.rateRange}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700,color:l.matchScore>=75?C.success:C.goldBright}}>{l.matchScore}</div>
                        <div style={{fontSize:8,color:C.dim}}>match</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
                <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:12}}>SUBMISSION CHECKLIST</div>
                {["✅ Executive memo (this package)","📄 Current rent roll","📊 T-12 operating statement","📋 2 years tax returns","🏦 Personal financial statement","📸 Property photos","🗺 Site plan / survey","📝 Purchase & sale agreement",form.purpose!=="Acquisition"?"📃 Existing loan documents":"","💼 Sponsor track record","📈 Appraisal / engagement letter","🔍 Phase I ESA"].filter(Boolean).map((item,i)=>(
                  <div key={i} style={{fontSize:11,color:C.muted,marginBottom:5}}>{item}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── UNDERWRITING HUB ─── */
/* ─── UNDERWRITING HELPERS ─── */
const fmtD=n=>`$${Math.round(n).toLocaleString()}`;
const fmtP=n=>`${n.toFixed(2)}%`;
const fmtPx=n=>`${n.toFixed(1)}%`;
const monthlyPmt=(loan,annRate,amortYrs)=>{const r=annRate/100/12,n=amortYrs*12;return r>0?loan*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1):loan/n;};
const loanBal=(loan,annRate,amortYrs,holdYrs)=>{const r=annRate/100/12,pmt=monthlyPmt(loan,annRate,amortYrs);let bal=loan;for(let m=0;m<holdYrs*12;m++){bal-=(pmt-bal*r);}return Math.max(0,bal);};
const calcIRR=(cfs)=>{let r=0.1;for(let i=0;i<200;i++){const f=cfs.reduce((s,cf,j)=>s+cf/Math.pow(1+r,j),0);const df=cfs.reduce((s,cf,j)=>j===0?s:s-j*cf/Math.pow(1+r,j+1),0);if(Math.abs(df)<1e-10)break;const nr=r-f/df;if(nr<-0.99)break;r=nr;}return r;};
const UW_COLORS={excellent:C.success,good:C.goldBright,marginal:C.warn,poor:C.danger};
const MetricCard=({label,value,sub,color,size=26})=>(
  <div style={{background:C.card,borderRadius:9,padding:"12px 14px"}}>
    <div style={{fontSize:9,color:C.muted,marginBottom:5,fontFamily:"'DM Mono',monospace",letterSpacing:".06em"}}>{label}</div>
    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:size,fontWeight:700,color:color||C.white,lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:10,color:C.dim,marginTop:4}}>{sub}</div>}
  </div>
);
const Bar=({pct,color,max=100})=>{
  const w=Math.min(Math.max(pct/max*100,0),100);
  return<div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden",marginTop:6}}><div style={{height:"100%",width:`${w}%`,background:color,borderRadius:3,transition:"width .4s"}}/></div>;
};
const UWInput=({label,value,set,prefix="",suffix=""})=>(
  <div style={{marginBottom:10}}>
    <FL l={label}/>
    <div style={{position:"relative",display:"flex",alignItems:"center"}}>
      {prefix&&<span style={{position:"absolute",left:10,fontSize:12,color:C.muted,pointerEvents:"none"}}>{prefix}</span>}
      <input value={value} onChange={e=>set(e.target.value)} style={{...IS,width:"100%",paddingLeft:prefix?22:10,paddingRight:suffix?30:10,fontFamily:"'DM Mono',monospace",fontSize:12}}/>
      {suffix&&<span style={{position:"absolute",right:10,fontSize:12,color:C.muted,pointerEvents:"none"}}>{suffix}</span>}
    </div>
  </div>
);
const StatusPill=({text,ok,warn})=>(
  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:100,background:ok?C.successBg:warn?`${C.warn}15`:C.dangerBg,border:`1px solid ${ok?C.successBorder:warn?`${C.warn}40`:C.dangerBorder}`,fontSize:10,color:ok?C.success:warn?C.warn:C.danger}}>
    {ok?<CheckCircle size={9} color={C.success}/>:warn?<AlertCircle size={9} color={C.warn}/>:<XCircle size={9} color={C.danger}/>}
    {text}
  </span>
);

function UnderwritingHub() {
  const [tab,setTab]=useState("dscr");
  const TABS=[
    {id:"dscr",l:"DSCR"},{id:"noi",l:"NOI Analyzer"},{id:"ltv",l:"Leverage"},
    {id:"sizing",l:"Loan Sizing"},{id:"irr",l:"IRR & Returns"},{id:"cf",l:"10-Yr Projection"},
    {id:"sens",l:"Sensitivity"},{id:"bridge",l:"Bridge→Perm"},
    {id:"refi",l:"Refi Analyzer"},{id:"mf",l:"MF Rent Roll"},{id:"ai",l:"AI Analyzer"},
  ];
  return (
    <div className="au" style={{maxWidth:1100}}>
      <h2 style={H2}>Underwriting Suite</h2>
      <p style={{...Sub,marginBottom:18}}>11 professional CRE calculators + AI deal analyzer. All results update in real time.</p>
      <div style={{display:"flex",gap:4,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:4,marginBottom:22,overflowX:"auto",flexWrap:"wrap"}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:7,border:"none",background:tab===t.id?C.card:"transparent",color:tab===t.id?C.goldBright:C.muted,fontSize:12,fontWeight:tab===t.id?600:400,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",transition:"all .15s",boxShadow:tab===t.id&&t.id==="ai"?`0 0 0 1px ${C.borderGold}`:undefined}}>{t.l}{t.id==="ai"&&<span style={{marginLeft:5,fontSize:8,background:`${C.goldMuted}33`,color:C.gold,padding:"1px 5px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>AI</span>}</button>)}
      </div>
      <div className="ai">
        {tab==="dscr"&&<DSCRCalc/>}
        {tab==="noi"&&<NOICalc/>}
        {tab==="ltv"&&<LTVCalc/>}
        {tab==="sizing"&&<LoanSizingCalc/>}
        {tab==="irr"&&<IRRCalc/>}
        {tab==="cf"&&<CFProj/>}
        {tab==="sens"&&<SensMatrix/>}
        {tab==="bridge"&&<BridgeToPerm/>}
        {tab==="refi"&&<RefiCalc/>}
        {tab==="mf"&&<MFRentRoll/>}
        {tab==="ai"&&<AIDealAnalyzer/>}
      </div>
    </div>
  );
}

function DSCRCalc() {
  const [v,sv]=useState({price:"2500000",noi:"175000",ltv:"70",rate:"6.75",amort:"25",io:"0"});
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const price=parseFloat(v.price)||0,noi=parseFloat(v.noi)||0,ltvN=parseFloat(v.ltv)/100||0;
  const loan=price*ltvN,ioYrs=parseInt(v.io)||0;
  const pmt=ioYrs>0?loan*(parseFloat(v.rate)/100/12):monthlyPmt(loan,parseFloat(v.rate),parseFloat(v.amort));
  const annDebt=pmt*12,dscr=annDebt>0?noi/annDebt:0,cap=price>0?noi/price*100:0;
  const equity=price-loan,coc=equity>0?(noi-annDebt)/equity*100:0;
  const beNOI=annDebt*1.25,beNOI120=annDebt*1.20;
  const dc=dscr>=1.5?UW_COLORS.excellent:dscr>=1.25?UW_COLORS.good:dscr>=1.10?UW_COLORS.marginal:UW_COLORS.poor;
  const lenderFloor=dscr>=1.25?"Most lenders — qualifying":dscr>=1.20?"Some lenders — marginal":dscr>=1.10?"Bridge/hard money only":"Below all lender floors";
  // Stress scenarios
  const stressRates=[0,50,100,150,200];
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:18,marginBottom:18}}>
        <div style={P}>
          <SL>Deal Inputs</SL>
          <UWInput label="Purchase Price" value={v.price} set={s("price")} prefix="$"/>
          <UWInput label="Annual NOI" value={v.noi} set={s("noi")} prefix="$"/>
          <UWInput label="LTV" value={v.ltv} set={s("ltv")} suffix="%"/>
          <UWInput label="Interest Rate" value={v.rate} set={s("rate")} suffix="%"/>
          <UWInput label="Amortization (yrs)" value={v.amort} set={s("amort")} suffix="yr"/>
          <UWInput label="Interest-Only Period" value={v.io} set={s("io")} suffix="yr"/>
          <div style={{background:C.card2,borderRadius:7,padding:"10px 12px",marginTop:8}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:4,fontFamily:"'DM Mono',monospace"}}>LOAN AMOUNT</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:15,color:C.goldBright}}>{fmtD(loan)}</div>
          </div>
        </div>
        <div>
          <div style={{textAlign:"center",padding:"20px 0 18px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,marginBottom:14}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:88,fontWeight:700,color:dc,lineHeight:1}}>{dscr>0?dscr.toFixed(2):"—"}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:4,marginBottom:10}}>Debt Service Coverage Ratio</div>
            {dscr>0&&<StatusPill text={lenderFloor} ok={dscr>=1.25} warn={dscr>=1.10&&dscr<1.25}/>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
            <MetricCard label="CAP RATE" value={fmtPx(cap)} sub="NOI ÷ Price" color={cap>=6?C.success:cap>=5?C.goldBright:C.warn}/>
            <MetricCard label="CASH-ON-CASH" value={fmtPx(coc)} sub="After debt service" color={coc>=6?C.success:coc>=4?C.goldBright:C.warn}/>
            <MetricCard label="ANNUAL DEBT SVC" value={fmtD(annDebt)} sub={`${fmtD(pmt)}/mo`}/>
          </div>
          <div style={{...P,marginBottom:0}}>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:12}}>BREAKEVEN ANALYSIS</div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:C.muted}}>NOI needed for 1.20x DSCR</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:noi>=beNOI120?C.success:C.danger}}>{fmtD(beNOI120)}/yr</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:C.muted}}>NOI needed for 1.25x DSCR</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:noi>=beNOI?C.success:C.danger}}>{fmtD(beNOI)}/yr</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,color:C.muted}}>Current NOI vs 1.25x floor</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:noi>=beNOI?C.success:C.danger}}>
                {noi>=beNOI?`+${fmtD(noi-beNOI)} surplus`:`${fmtD(beNOI-noi)} shortfall`}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Rate Stress Test */}
      <div style={P}>
        <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:14}}>RATE STRESS TEST — DSCR AT HIGHER RATES</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {stressRates.map(bps=>{
            const sRate=parseFloat(v.rate)+(bps/100);
            const sPmt=monthlyPmt(loan,sRate,parseFloat(v.amort));
            const sDSCR=annDebt>0?noi/(sPmt*12):0;
            const sc=sDSCR>=1.25?C.success:sDSCR>=1.10?C.warn:C.danger;
            return(
              <div key={bps} style={{background:C.card,borderRadius:9,padding:"11px 12px",textAlign:"center"}}>
                <div style={{fontSize:9,color:C.muted,marginBottom:5}}>+{bps}bps</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:sc}}>{sDSCR.toFixed(2)}x</div>
                <div style={{fontSize:9,color:C.dim,marginTop:2}}>{fmtPx(sRate)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NOICalc() {
  const [inc,si]=useState({gpr:"240000",other:"12000",vac:"5",creditLoss:"1"});
  const [exp,se]=useState({taxes:"22000",insurance:"9600",mgmt:"9600",maint:"14400",utils:"7200",reserves:"6000",payroll:"0",marketing:"2400",landscaping:"1800",other:"3600"});
  const gpr=parseFloat(inc.gpr)||0,other=parseFloat(inc.other)||0;
  const vacLoss=gpr*(parseFloat(inc.vac)/100||0),creditLoss=gpr*(parseFloat(inc.creditLoss)/100||0);
  const egi=gpr-vacLoss-creditLoss+other;
  const totalExp=Object.values(exp).reduce((s,v)=>s+(parseFloat(v)||0),0);
  const noi=egi-totalExp,oer=egi>0?totalExp/egi*100:0;
  const expLabels={taxes:"Property Taxes",insurance:"Insurance",mgmt:"Property Mgmt",maint:"Maintenance",utils:"Utilities",reserves:"Capital Reserves",payroll:"Payroll",marketing:"Marketing/Leasing",landscaping:"Landscaping",other:"Other Expenses"};
  const benchmarks={oer:{low:35,high:50},vac:{low:5,high:10}};
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <div>
        <div style={P}>
          <SL>Income</SL>
          <UWInput label="Gross Potential Rent (GPR)" value={inc.gpr} set={v=>si(p=>({...p,gpr:v}))} prefix="$"/>
          <UWInput label="Other Income (parking, laundry, etc)" value={inc.other} set={v=>si(p=>({...p,other:v}))} prefix="$"/>
          <UWInput label="Vacancy Rate" value={inc.vac} set={v=>si(p=>({...p,vac:v}))} suffix="%"/>
          <UWInput label="Credit Loss Rate" value={inc.creditLoss} set={v=>si(p=>({...p,creditLoss:v}))} suffix="%"/>
        </div>
        <div style={{...P,marginTop:14}}>
          <SL>Operating Expenses</SL>
          {Object.entries(exp).map(([k,v])=>(
            <UWInput key={k} label={expLabels[k]} value={v} set={nv=>se(p=>({...p,[k]:nv}))} prefix="$"/>
          ))}
        </div>
      </div>
      <div>
        <div style={P}>
          <SL>NOI Waterfall</SL>
          {[
            {l:"Gross Potential Rent",v:gpr,type:"inc"},
            {l:`Vacancy Loss (${inc.vac}%)`,v:-vacLoss,type:"loss"},
            {l:`Credit Loss (${inc.creditLoss}%)`,v:-creditLoss,type:"loss"},
            {l:"Other Income",v:other,type:"inc"},
            {l:"Effective Gross Income",v:egi,type:"sub"},
            {l:"Total Operating Expenses",v:-totalExp,type:"loss"},
            {l:"Net Operating Income",v:noi,type:"noi"},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${r.type==="noi"?C.borderGold:C.border}`,background:r.type==="noi"?`${C.goldMuted}0A`:"transparent"}}>
              <span style={{fontSize:12,color:r.type==="noi"?C.goldBright:r.type==="sub"?C.text:C.muted,fontWeight:r.type==="noi"||r.type==="sub"?600:400}}>{r.l}</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:r.type==="noi"?C.goldBright:r.v<0?C.danger:r.type==="sub"?C.white:C.text}}>
                {r.v<0?`-${fmtD(Math.abs(r.v))}`:fmtD(r.v)}
              </span>
            </div>
          ))}
        </div>
        <div style={{...P,marginTop:14}}>
          <SL>Ratio Analysis</SL>
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:12,color:C.muted}}>Operating Expense Ratio</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:oer<=45?C.success:oer<=55?C.warn:C.danger}}>{oer.toFixed(1)}%</span>
            </div>
            <Bar pct={oer} color={oer<=45?C.success:oer<=55?C.warn:C.danger} max={80}/>
            <div style={{fontSize:10,color:C.dim,marginTop:3}}>Benchmark: 35–50% is typical. Below 35% may signal under-spending on maintenance.</div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:12,color:C.muted}}>Vacancy Rate</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:parseFloat(inc.vac)<=7?C.success:parseFloat(inc.vac)<=12?C.warn:C.danger}}>{inc.vac}%</span>
            </div>
            <Bar pct={parseFloat(inc.vac)||0} color={parseFloat(inc.vac)<=7?C.success:parseFloat(inc.vac)<=12?C.warn:C.danger} max={30}/>
            <div style={{fontSize:10,color:C.dim,marginTop:3}}>Benchmark: 5–7% stabilized. 10%+ signals risk. Lenders often underwrite to 5%.</div>
          </div>
          <div style={{background:C.card2,borderRadius:8,padding:"12px 14px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[[`NOI Margin`,`${egi>0?(noi/egi*100).toFixed(1):0}%`],[`NOI/Unit (est)`,noi>0?fmtD(noi/Math.max(1,Math.round(gpr/12000))):"-"],[`Expense/GPR`,`${gpr>0?(totalExp/gpr*100).toFixed(1):0}%`],[`EGI`,fmtD(egi)]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:9,color:C.dim,marginBottom:2}}>{l}</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.text}}>{v}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LTVCalc() {
  const [v,sv]=useState({price:"2500000",loan:"1750000",appraised:"2600000",constrCost:"0",noi:"175000"});
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const price=parseFloat(v.price)||0,loan=parseFloat(v.loan)||0,app=parseFloat(v.appraised)||price;
  const constr=parseFloat(v.constrCost)||0,noi=parseFloat(v.noi)||0;
  const ltv=price>0?loan/price*100:0;
  const ltc=(price+constr)>0?loan/(price+constr)*100:0;
  const ltarv=app>0?loan/app*100:0;
  const dy=loan>0?noi/loan*100:0;
  const tdc=price+constr,equity=price-loan;
  const leverageMetrics=[
    {l:"LTV",v:ltv,max:80,ok:ltv<=75,warn:ltv<=80,def:"Loan ÷ Purchase Price"},
    {l:"LTC",v:ltc,max:85,ok:ltc<=80,warn:ltc<=85,def:"Loan ÷ (Price + Const)"},
    {l:"LTARV",v:ltarv,max:75,ok:ltarv<=70,warn:ltarv<=75,def:"Loan ÷ Appraised Value"},
  ];
  return(
    <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:18}}>
      <div style={P}>
        <SL>Deal Inputs</SL>
        <UWInput label="Purchase Price" value={v.price} set={s("price")} prefix="$"/>
        <UWInput label="Loan Amount" value={v.loan} set={s("loan")} prefix="$"/>
        <UWInput label="Appraised / ARV" value={v.appraised} set={s("appraised")} prefix="$"/>
        <UWInput label="Construction / Rehab Cost" value={v.constrCost} set={s("constrCost")} prefix="$"/>
        <UWInput label="Annual NOI" value={v.noi} set={s("noi")} prefix="$" />
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}>
          {[["Equity",fmtD(equity)],[" TDC",fmtD(tdc)]].map(([l,val])=>(
            <div key={l} style={{background:C.card2,borderRadius:7,padding:"10px 12px"}}><div style={{fontSize:9,color:C.muted,marginBottom:3}}>{l}</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.text}}>{val}</div></div>
          ))}
        </div>
      </div>
      <div>
        <div style={P}>
          <SL>Leverage Metrics</SL>
          {leverageMetrics.map((m,i)=>(
            <div key={i} style={{marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div>
                  <span style={{fontSize:13,fontWeight:600,color:C.text}}>{m.l}</span>
                  <span style={{fontSize:10,color:C.dim,marginLeft:8}}>{m.def}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <StatusPill text={m.ok?"Within limits":m.warn?"At limit":"Exceeds limit"} ok={m.ok} warn={m.warn&&!m.ok}/>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:700,color:m.ok?C.success:m.warn?C.warn:C.danger}}>{m.v.toFixed(1)}%</span>
                </div>
              </div>
              <div style={{height:8,background:C.border,borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(m.v/m.max*100,100)}%`,background:m.ok?C.success:m.warn?C.warn:C.danger,borderRadius:4,transition:"width .4s"}}/>
              </div>
              <div style={{fontSize:9,color:C.dim,marginTop:3}}>Max: {m.max}% · Current: {m.v.toFixed(1)}% · Headroom: {Math.max(0,m.max-m.v).toFixed(1)}%</div>
            </div>
          ))}
        </div>
        <div style={P}>
          <SL>Debt Yield</SL>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:48,fontWeight:700,color:dy>=9?C.success:dy>=7?C.goldBright:C.warn,lineHeight:1}}>{dy.toFixed(2)}%</div>
              <div style={{fontSize:11,color:C.muted,marginTop:4}}>NOI ÷ Loan Amount</div>
            </div>
            <div style={{fontSize:12,color:C.muted,maxWidth:260,lineHeight:1.6}}>
              Lender benchmark: <span style={{color:C.white}}>8–10%+</span> for life companies and CMBS. Below 8% = tougher execution. Below 6% = very limited options.
              <StatusPill text={dy>=9?"Strong — most lenders":dy>=7?"Acceptable":"Below typical floors"} ok={dy>=9} warn={dy>=7&&dy<9}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoanSizingCalc() {
  const [v,sv]=useState({noi:"175000",rate:"6.75",amort:"25",dscr:"1.25",ltv:"70",price:"2500000"});
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const noi=parseFloat(v.noi)||0,rate=parseFloat(v.rate)||0,amort=parseFloat(v.amort)||25;
  const dscrFloor=parseFloat(v.dscr)||1.25,ltvMax=parseFloat(v.ltv)/100||0.70,price=parseFloat(v.price)||0;
  // Max loan from DSCR constraint
  const annDebtAllowed=noi/dscrFloor;
  const mPmtAllowed=annDebtAllowed/12;
  const r=rate/100/12,n=amort*12;
  const maxLoanDSCR=mPmtAllowed>0&&r>0?mPmtAllowed*(Math.pow(1+r,n)-1)/(r*Math.pow(1+r,n)):0;
  // Max loan from LTV constraint
  const maxLoanLTV=price*ltvMax;
  // Binding constraint
  const bindingLoan=Math.min(maxLoanDSCR,maxLoanLTV);
  const bindingIs=maxLoanDSCR<maxLoanLTV?"DSCR":"LTV";
  const equity=price-bindingLoan;
  const actualDSCR=bindingLoan>0?noi/(monthlyPmt(bindingLoan,rate,amort)*12):0;
  const actualLTV=price>0?bindingLoan/price*100:0;
  const dy=bindingLoan>0?noi/bindingLoan*100:0;
  const dscrRows=[1.15,1.20,1.25,1.30,1.35,1.40].map(d=>{
    const adb=noi/d/12;
    const ml=adb>0&&r>0?adb*(Math.pow(1+r,n)-1)/(r*Math.pow(1+r,n)):0;
    return{dscr:d,loan:Math.min(ml,maxLoanLTV),ltv:price>0?Math.min(ml,maxLoanLTV)/price*100:0};
  });
  return(
    <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:18}}>
      <div style={P}>
        <SL>Deal Parameters</SL>
        <UWInput label="Annual NOI" value={v.noi} set={s("noi")} prefix="$"/>
        <UWInput label="Interest Rate" value={v.rate} set={s("rate")} suffix="%"/>
        <UWInput label="Amortization" value={v.amort} set={s("amort")} suffix="yr"/>
        <UWInput label="Purchase Price (for LTV)" value={v.price} set={s("price")} prefix="$"/>
        <div style={{background:`${C.gold}11`,border:`1px solid ${C.borderGold}`,borderRadius:9,padding:"12px 14px",marginTop:16}}>
          <div style={{fontSize:10,color:C.gold,fontFamily:"'DM Mono',monospace",marginBottom:10}}>LENDER CONSTRAINTS</div>
          <UWInput label="DSCR Floor" value={v.dscr} set={s("dscr")} suffix="x"/>
          <UWInput label="Max LTV" value={v.ltv} set={s("ltv")} suffix="%"/>
        </div>
      </div>
      <div>
        <div style={{background:C.surface,border:`2px solid ${C.borderGold}`,borderRadius:14,padding:"20px 22px",marginBottom:16,textAlign:"center"}}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".15em",marginBottom:6}}>MAXIMUM LOAN AMOUNT</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:54,fontWeight:700,color:C.goldBright,lineHeight:1}}>{fmtD(bindingLoan)}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:6}}>Binding constraint: <strong style={{color:C.white}}>{bindingIs}</strong></div>
          <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:14,flexWrap:"wrap"}}>
            <StatusPill text={`DSCR: ${actualDSCR.toFixed(2)}x`} ok={actualDSCR>=1.25} warn={actualDSCR>=1.10}/>
            <StatusPill text={`LTV: ${actualLTV.toFixed(1)}%`} ok={actualLTV<=75} warn={actualLTV<=80}/>
            <StatusPill text={`DY: ${dy.toFixed(1)}%`} ok={dy>=9} warn={dy>=7}/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <MetricCard label="MAX LOAN (DSCR)" value={fmtD(maxLoanDSCR)} sub={`At ${v.dscr}x floor`} color={C.blue}/>
          <MetricCard label="MAX LOAN (LTV)" value={fmtD(maxLoanLTV)} sub={`At ${v.ltv}% LTV`} color={C.teal}/>
          <MetricCard label="EQUITY REQUIRED" value={fmtD(equity)} sub={`${price>0?(equity/price*100).toFixed(1):0}% of price`} color={C.gold}/>
          <MetricCard label="DEBT YIELD" value={`${dy.toFixed(2)}%`} sub="NOI ÷ Loan" color={dy>=9?C.success:C.warn}/>
        </div>
        <div style={P}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:12}}>MAX LOAN BY DSCR FLOOR (LTV CAPPED AT {v.ltv}%)</div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["DSCR Floor","Max Loan","LTV","Equity"].map(h=><th key={h} style={{padding:"7px 10px",fontSize:9,color:C.muted,fontWeight:400,fontFamily:"'DM Mono',monospace",textAlign:h==="DSCR Floor"?"left":"right",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
            <tbody>{dscrRows.map(row=>(
              <tr key={row.dscr} style={{background:row.dscr===dscrFloor?`${C.goldMuted}11`:"transparent"}}>
                <td style={{padding:"8px 10px",fontFamily:"'DM Mono',monospace",fontSize:11,color:row.dscr===dscrFloor?C.gold:C.muted}}>{row.dscr.toFixed(2)}x{row.dscr===dscrFloor?" ← target":""}</td>
                <td style={{padding:"8px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.text}}>{fmtD(row.loan)}</td>
                <td style={{padding:"8px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:row.ltv<=75?C.success:C.warn}}>{row.ltv.toFixed(1)}%</td>
                <td style={{padding:"8px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.muted}}>{fmtD(price-row.loan)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function IRRCalc() {
  const [v,sv]=useState({price:"2500000",noi:"175000",ltv:"70",rate:"6.75",amort:"25",growth:"3",hold:"5",exitCap:"6.25",cc:"2",dispCosts:"1"});
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const price=parseFloat(v.price)||0,noi0=parseFloat(v.noi)||0,ltvN=parseFloat(v.ltv)/100||0;
  const rate=parseFloat(v.rate)||0,amort=parseFloat(v.amort)||25;
  const growth=parseFloat(v.growth)/100||0.03,hold=parseInt(v.hold)||5;
  const exitCap=parseFloat(v.exitCap)/100||0.0625;
  const loan=price*ltvN,pmt=monthlyPmt(loan,rate,amort),annDebt=pmt*12;
  const equity=price*(1-ltvN)*(1+(parseFloat(v.cc)/100||0.02));
  const noiExit=noi0*Math.pow(1+growth,hold);
  const endBal=loanBal(loan,rate,amort,hold);
  const salePrice=exitCap>0?noiExit/exitCap:0;
  const dispCosts=salePrice*(parseFloat(v.dispCosts)/100||0.01);
  const netProc=salePrice-endBal-dispCosts;
  const yearCFs=Array.from({length:hold},(_,i)=>(noi0*Math.pow(1+growth,i))-annDebt);
  const allCFs=[-equity,...yearCFs.map((cf,i)=>i===hold-1?cf+netProc:cf)];
  const irr=calcIRR(allCFs);
  const totalCash=yearCFs.reduce((s,v)=>s+v,0)+netProc;
  const em=equity>0?totalCash/equity:0;
  const coc1=equity>0?yearCFs[0]/equity*100:0;
  const capEntry=price>0?noi0/price*100:0,capExit=salePrice>0?noiExit/salePrice*100:0;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:18,marginBottom:16}}>
        <div style={P}>
          <SL>Deal Inputs</SL>
          <UWInput label="Purchase Price" value={v.price} set={s("price")} prefix="$"/>
          <UWInput label="Year 1 NOI" value={v.noi} set={s("noi")} prefix="$"/>
          <UWInput label="LTV" value={v.ltv} set={s("ltv")} suffix="%"/>
          <UWInput label="Interest Rate" value={v.rate} set={s("rate")} suffix="%"/>
          <UWInput label="Amortization" value={v.amort} set={s("amort")} suffix="yr"/>
          <UWInput label="NOI Growth Rate" value={v.growth} set={s("growth")} suffix="%/yr"/>
          <UWInput label="Hold Period" value={v.hold} set={s("hold")} suffix="yr"/>
          <UWInput label="Exit Cap Rate" value={v.exitCap} set={s("exitCap")} suffix="%"/>
          <UWInput label="Closing Costs (entry)" value={v.cc} set={s("cc")} suffix="%"/>
          <UWInput label="Disposition Costs (exit)" value={v.dispCosts} set={s("dispCosts")} suffix="%"/>
        </div>
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <MetricCard label="LEVERED IRR" value={`${(irr*100).toFixed(1)}%`} sub={irr>=0.15?"Exceeds 15% target":irr>=0.12?"Meets 12% floor":"Below typical floor"} color={irr>=0.15?C.success:irr>=0.12?C.goldBright:C.danger} size={36}/>
            <MetricCard label="EQUITY MULTIPLE" value={`${em.toFixed(2)}x`} sub={em>=2?"Exceeds 2x target":em>=1.5?"Acceptable return":"Below 1.5x target"} color={em>=2?C.success:em>=1.5?C.goldBright:C.danger} size={36}/>
            <MetricCard label="YEAR 1 COC" value={`${coc1.toFixed(1)}%`} sub={`After ${fmtD(annDebt)}/yr debt svc`} color={coc1>=6?C.success:coc1>=4?C.goldBright:C.warn}/>
            <MetricCard label="EXIT PRICE" value={fmtD(salePrice)} sub={`${capExit.toFixed(2)}% exit cap`} color={salePrice>price?C.success:C.warn}/>
            <MetricCard label="ENTRY EQUITY" value={fmtD(equity)} sub={`${((1-ltvN)*100).toFixed(0)}% + ${v.cc}% CC`}/>
            <MetricCard label="NET SALE PROCEEDS" value={fmtD(netProc)} sub={`After ${fmtD(endBal)} payoff`} color={netProc>0?C.success:C.danger}/>
          </div>
          <div style={P}>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:12}}>RETURN ATTRIBUTION</div>
            {[["Entry Cap Rate",`${capEntry.toFixed(2)}%`],["Exit Cap Rate",`${capExit.toFixed(2)}%`],["Cap Rate Delta",`${(capExit-capEntry>=0?"+":"")+(capExit-capEntry).toFixed(2)}%`,capExit<=capEntry],["NOI Growth (Total)",`+${((Math.pow(1+growth,hold)-1)*100).toFixed(1)}%`,true],["Leverage Benefit",`${(annDebt/equity*100).toFixed(1)}% debt yield on equity`]].map(([l,val,ok],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:12,color:C.muted}}>{l}</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:ok!==undefined?(ok?C.success:C.warn):C.text}}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={P}>
        <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:12}}>YEAR-BY-YEAR CASH FLOW WATERFALL</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Year","NOI","Debt Service","Before-Tax CF","Cum. Cash","Ending Balance"].map(h=><th key={h} style={{padding:"7px 10px",fontSize:9,color:C.muted,fontWeight:400,fontFamily:"'DM Mono',monospace",textAlign:h==="Year"?"left":"right",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
          <tbody>
            {Array.from({length:hold},(_,i)=>{
              const yr=i+1,noiYr=noi0*Math.pow(1+growth,i),cf=noiYr-annDebt;
              const cumCF=yearCFs.slice(0,i+1).reduce((s,v)=>s+v,0);
              const endBalYr=loanBal(loan,rate,amort,yr);
              const isSale=yr===hold;
              return(
                <tr key={yr} style={{borderBottom:`1px solid ${isSale?C.borderGold:C.border}`,background:isSale?`${C.goldMuted}08`:"transparent"}}>
                  <td style={{padding:"9px 10px",fontFamily:"'DM Mono',monospace",fontSize:11,color:isSale?C.gold:C.muted}}>Yr {yr}{isSale?" (exit)":""}</td>
                  <td style={{padding:"9px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.text}}>{fmtD(noiYr)}</td>
                  <td style={{padding:"9px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.muted}}>{fmtD(annDebt)}</td>
                  <td style={{padding:"9px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:cf>0?C.success:C.danger}}>{fmtD(cf)}{isSale?` + ${fmtD(netProc)} sale`:""}</td>
                  <td style={{padding:"9px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:cumCF+(isSale?netProc:0)>0?C.success:C.danger}}>{fmtD(cumCF+(isSale?netProc:0))}</td>
                  <td style={{padding:"9px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.dim}}>{fmtD(endBalYr)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CFProj() {
  const [v,sv]=useState({price:"2500000",noi:"175000",ltv:"70",rate:"6.75",amort:"25",growth:"3",expGrowth:"3",reversion:"5"});
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const price=parseFloat(v.price)||0,noi0=parseFloat(v.noi)||0,ltvN=parseFloat(v.ltv)/100||0;
  const rate=parseFloat(v.rate)||0,amort=parseFloat(v.amort)||25;
  const growth=parseFloat(v.growth)/100||0.03,expGrowth=parseFloat(v.expGrowth)/100||0.03;
  const loan=price*ltvN,pmt=monthlyPmt(loan,rate,amort),annDebt=pmt*12,equity=price*(1-ltvN);
  const cap0=price>0?noi0/price*100:0;
  const rows=Array.from({length:10},(_,i)=>{
    const noiYr=noi0*Math.pow(1+growth,i);
    const cf=noiYr-annDebt,coc=equity>0?cf/equity*100:0;
    const endBalYr=loanBal(loan,rate,amort,i+1);
    const cumPrincipal=loan-endBalYr;
    const capYr=price>0?noiYr/price*100:0;
    return{yr:i+1,noi:Math.round(noiYr),cf:Math.round(cf),coc:coc.toFixed(1),bal:Math.round(endBalYr),prin:Math.round(cumPrincipal),cap:capYr.toFixed(2)};
  });
  const maxBar=Math.max(...rows.map(r=>Math.abs(r.cf)));
  return(
    <div>
      <div style={{...P,marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:0}}>
          {[["Purchase Price","price","$"],["Year 1 NOI","noi","$"],["LTV","ltv","%"],["Rate","rate","%"],["Amort","amort","yr"],["NOI Growth","growth","%"],["Expense Growth","expGrowth","%"]].map(([l,k,suf])=>(
            <UWInput key={k} label={l} value={v[k]} set={s(k)} suffix={suf==="$"?undefined:suf} prefix={suf==="$"?"$":undefined}/>
          ))}
        </div>
      </div>
      {/* Visual Chart */}
      <div style={P}>
        <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:16}}>BEFORE-TAX CASH FLOW — 10-YEAR PROJECTION</div>
        <div style={{display:"flex",gap:6,alignItems:"flex-end",height:100,marginBottom:8}}>
          {rows.map(r=>{
            const h=maxBar>0?Math.abs(r.cf)/maxBar*80:0;
            return(
              <div key={r.yr} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{fontSize:7,color:C.dim,fontFamily:"'DM Mono',monospace"}}>{r.cf>0?`+${Math.round(r.cf/1000)}K`:Math.round(r.cf/1000)+"K"}</div>
                <div style={{width:"100%",height:`${h}px`,background:r.cf>0?`${C.success}99`:`${C.danger}99`,borderRadius:"3px 3px 0 0",minHeight:2}}/>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",gap:6}}>
          {rows.map(r=><div key={r.yr} style={{flex:1,textAlign:"center",fontSize:8,color:C.dim,fontFamily:"'DM Mono',monospace"}}>Y{r.yr}</div>)}
        </div>
      </div>
      <div style={P}>
        <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:12}}>10-YEAR CASH FLOW PROJECTION</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Year","NOI","Debt Svc","Before-Tax CF","CoC %","Cap Rate","Loan Balance","Cum. Principal"].map(h=><th key={h} style={{padding:"7px 8px",fontSize:8,color:C.muted,fontWeight:400,fontFamily:"'DM Mono',monospace",textAlign:h==="Year"?"left":"right",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
          <tbody>{rows.map(r=>(
            <tr key={r.yr} style={{borderBottom:`1px solid ${C.border}`,background:r.yr%2===0?`${C.surface}`:C.bg}}>
              <td style={{padding:"8px 8px",fontFamily:"'DM Mono',monospace",fontSize:10,color:C.muted}}>Yr {r.yr}</td>
              <td style={{padding:"8px 8px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,color:C.text}}>{fmtD(r.noi)}</td>
              <td style={{padding:"8px 8px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,color:C.muted}}>{fmtD(annDebt)}</td>
              <td style={{padding:"8px 8px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,color:r.cf>0?C.success:C.danger}}>{fmtD(r.cf)}</td>
              <td style={{padding:"8px 8px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,color:parseFloat(r.coc)>=6?C.success:parseFloat(r.coc)>=4?C.warn:C.danger}}>{r.coc}%</td>
              <td style={{padding:"8px 8px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,color:C.dim}}>{r.cap}%</td>
              <td style={{padding:"8px 8px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,color:C.dim}}>{fmtD(r.bal)}</td>
              <td style={{padding:"8px 8px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,color:C.teal}}>{fmtD(r.prin)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function SensMatrix() {
  const [v,sv]=useState({baseNOI:"175000",basePrice:"2500000",baseRate:"6.75",baseLTV:"70",baseAmort:"25",view:"value"});
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const baseNOI=parseFloat(v.baseNOI)||175000,basePrice=parseFloat(v.basePrice)||2500000;
  const baseRate=parseFloat(v.baseRate)||6.75,baseLTV=parseFloat(v.baseLTV)/100||0.70,baseAmort=parseFloat(v.baseAmort)||25;
  const baseLoan=basePrice*baseLTV,basePmt=monthlyPmt(baseLoan,baseRate,baseAmort),baseDebt=basePmt*12;
  const caps=[4.5,5.0,5.5,6.0,6.5,7.0,7.5];
  const noiVars=[-20,-10,-5,0,5,10,20];
  const rates=[5.50,6.00,6.50,7.00,7.50,8.00,8.50];
  const ltvs=[55,60,65,70,75,80];
  return(
    <div>
      <div style={{...P,marginBottom:16}}>
        <SL>Base Case Inputs</SL>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
          <UWInput label="Base NOI" value={v.baseNOI} set={s("baseNOI")} prefix="$"/>
          <UWInput label="Base Price" value={v.basePrice} set={s("basePrice")} prefix="$"/>
          <UWInput label="Base Rate" value={v.baseRate} set={s("baseRate")} suffix="%"/>
          <UWInput label="Base LTV" value={v.baseLTV} set={s("baseLTV")} suffix="%"/>
          <UWInput label="Amortization" value={v.baseAmort} set={s("baseAmort")} suffix="yr"/>
        </div>
        <div style={{display:"flex",gap:6,marginTop:14,flexWrap:"wrap"}}>
          {[["value","Property Value"],["dscr","DSCR"],["coc","Cash-on-Cash"]].map(([id,l])=>(
            <button key={id} onClick={()=>s("view")(id)} style={{padding:"6px 14px",borderRadius:7,border:`1px solid ${v.view===id?C.borderGold:C.border}`,background:v.view===id?`${C.goldMuted}22`:"transparent",color:v.view===id?C.gold:C.muted,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
          ))}
        </div>
      </div>
      {v.view==="value"&&(
        <div style={P}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:14}}>PROPERTY VALUE ($K) — NOI VARIANCE vs CAP RATE</div>
          <div style={{overflowX:"auto"}}>
            <table style={{borderCollapse:"collapse",minWidth:500}}>
              <thead><tr>
                <th style={{padding:"7px 10px",fontSize:9,color:C.muted,fontWeight:400,textAlign:"left",fontFamily:"'DM Mono',monospace",borderBottom:`1px solid ${C.border}`}}>NOI Δ \ Cap Rate</th>
                {caps.map(cr=><th key={cr} style={{padding:"7px 10px",fontSize:9,color:C.muted,fontWeight:400,textAlign:"right",fontFamily:"'DM Mono',monospace",borderBottom:`1px solid ${C.border}`}}>{cr}%</th>)}
              </tr></thead>
              <tbody>{noiVars.map(nv=>{
                const adjNOI=baseNOI*(1+nv/100);
                return<tr key={nv}><td style={{padding:"7px 10px",fontSize:10,fontFamily:"'DM Mono',monospace",color:nv===0?C.gold:nv>0?C.success:C.danger,borderRight:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>{nv===0?"Base":nv>0?`+${nv}%`:`${nv}%`}</td>
                {caps.map(cr=>{const val=Math.round(adjNOI/(cr/100)/1000);const base=Math.round(baseNOI/(cr/100)/1000);const diff=(val-base)/base;return<td key={cr} style={{padding:"7px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,background:diff>0.08?C.successBg:diff<-0.08?C.dangerBg:nv===0&&cr===caps[3]?`${C.goldMuted}18`:"transparent",color:diff>0.15?C.success:diff<-0.15?C.danger:C.text}}>${val}K</td>;})}
                </tr>;
              })}</tbody>
            </table>
          </div>
        </div>
      )}
      {v.view==="dscr"&&(
        <div style={P}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:14}}>DSCR — INTEREST RATE vs LTV</div>
          <div style={{overflowX:"auto"}}>
            <table style={{borderCollapse:"collapse",minWidth:480}}>
              <thead><tr>
                <th style={{padding:"7px 10px",fontSize:9,color:C.muted,fontWeight:400,textAlign:"left",fontFamily:"'DM Mono',monospace",borderBottom:`1px solid ${C.border}`}}>Rate \ LTV</th>
                {ltvs.map(ltv=><th key={ltv} style={{padding:"7px 10px",fontSize:9,color:C.muted,fontWeight:400,textAlign:"right",fontFamily:"'DM Mono',monospace",borderBottom:`1px solid ${C.border}`}}>{ltv}%</th>)}
              </tr></thead>
              <tbody>{rates.map(rt=>(
                <tr key={rt}><td style={{padding:"7px 10px",fontSize:10,fontFamily:"'DM Mono',monospace",color:rt===baseRate?C.gold:C.muted,borderRight:`1px solid ${C.border}`}}>{rt.toFixed(2)}%</td>
                {ltvs.map(ltv=>{
                  const l=basePrice*(ltv/100),pmt=monthlyPmt(l,rt,baseAmort),debt=pmt*12;
                  const dscr=debt>0?baseNOI/debt:0;
                  const col=dscr>=1.35?C.success:dscr>=1.25?C.goldBright:dscr>=1.10?C.warn:C.danger;
                  return<td key={ltv} style={{padding:"7px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,background:dscr>=1.25?C.successBg:dscr>=1.10?`${C.warn}15`:C.dangerBg,color:col}}>{dscr.toFixed(2)}x</td>;
                })}</tr>
              ))}</tbody>
            </table>
          </div>
          <div style={{marginTop:10,display:"flex",gap:12,flexWrap:"wrap"}}>
            {[[C.successBg,C.success,"≥1.25x — qualifying"],[`${C.warn}15`,C.warn,"1.10–1.25x — marginal"],[C.dangerBg,C.danger,"< 1.10x — fails floor"]].map(([bg,col,label])=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:12,height:12,borderRadius:2,background:bg,border:`1px solid ${col}33`}}/><span style={{fontSize:10,color:C.dim}}>{label}</span></div>
            ))}
          </div>
        </div>
      )}
      {v.view==="coc"&&(
        <div style={P}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:14}}>CASH-ON-CASH RETURN (%) — NOI VARIANCE vs INTEREST RATE</div>
          <div style={{overflowX:"auto"}}>
            <table style={{borderCollapse:"collapse",minWidth:500}}>
              <thead><tr>
                <th style={{padding:"7px 10px",fontSize:9,color:C.muted,fontWeight:400,textAlign:"left",fontFamily:"'DM Mono',monospace",borderBottom:`1px solid ${C.border}`}}>NOI Δ \ Rate</th>
                {rates.map(rt=><th key={rt} style={{padding:"7px 10px",fontSize:9,color:C.muted,fontWeight:400,textAlign:"right",fontFamily:"'DM Mono',monospace",borderBottom:`1px solid ${C.border}`}}>{rt}%</th>)}
              </tr></thead>
              <tbody>{noiVars.map(nv=>{
                const adjNOI=baseNOI*(1+nv/100);
                const eq=basePrice*(1-baseLTV);
                return<tr key={nv}><td style={{padding:"7px 10px",fontSize:10,fontFamily:"'DM Mono',monospace",color:nv===0?C.gold:nv>0?C.success:C.danger,borderRight:`1px solid ${C.border}`}}>{nv===0?"Base":nv>0?`+${nv}%`:`${nv}%`}</td>
                {rates.map(rt=>{
                  const l=basePrice*baseLTV,pmt=monthlyPmt(l,rt,baseAmort),debt=pmt*12;
                  const coc=eq>0?(adjNOI-debt)/eq*100:0;
                  return<td key={rt} style={{padding:"7px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:10,background:coc>=7?C.successBg:coc>=4?`${C.goldMuted}11`:coc>=0?`${C.warn}15`:C.dangerBg,color:coc>=7?C.success:coc>=4?C.goldBright:coc>=0?C.warn:C.danger}}>{coc.toFixed(1)}%</td>;
                })}</tr>;
              })}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function BridgeToPerm() {
  const [v,sv]=useState({
    purchasePrice:"2200000",rehabCost:"300000",bridgeRate:"9.50",bridgeLTV:"75",bridgeTerm:"24",
    stabilizedNOI:"195000",exitCap:"5.75",permRate:"6.75",permLTV:"70",permAmort:"25",permTerm:"10",
    stabilizationMos:"18",closingCostsPct:"2"
  });
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const pp=parseFloat(v.purchasePrice)||0,rehab=parseFloat(v.rehabCost)||0;
  const tdc=pp+rehab;
  const bridgeLTV=parseFloat(v.bridgeLTV)/100||0.75;
  const bridgeLoan=tdc*bridgeLTV;
  const bridgeRate=parseFloat(v.bridgeRate)/100;
  const bridgeMos=parseInt(v.stabilizationMos)||18;
  const bridgeInterest=bridgeLoan*bridgeRate*(bridgeMos/12);
  const bridgeFee=bridgeLoan*0.01;
  const totalBridgeCost=bridgeInterest+bridgeFee;
  const stabilizedNOI=parseFloat(v.stabilizedNOI)||0;
  const exitCap=parseFloat(v.exitCap)/100||0.0575;
  const arv=exitCap>0?stabilizedNOI/exitCap:0;
  const permLTV=parseFloat(v.permLTV)/100||0.70;
  const permLoan=arv*permLTV;
  const permRate=parseFloat(v.permRate)||6.75,permAmort=parseFloat(v.permAmort)||25;
  const permPmt=monthlyPmt(permLoan,permRate,permAmort),permDebt=permPmt*12;
  const permDSCR=permDebt>0?stabilizedNOI/permDebt:0;
  const permDY=permLoan>0?stabilizedNOI/permLoan*100:0;
  const cc=arv*(parseFloat(v.closingCostsPct)/100||0.02);
  const exitEquity=arv-permLoan-cc;
  const totalEquity=tdc-bridgeLoan;
  const totalInvested=totalEquity+totalBridgeCost;
  const gainOnValue=arv-tdc;
  const em=totalInvested>0?exitEquity/totalInvested:0;
  const bridgeCoverage=bridgeLoan>0?arv/bridgeLoan:0;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div style={P}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.blue,letterSpacing:".1em",marginBottom:12}}>BRIDGE (ACQUISITION + REHAB)</div>
          <UWInput label="Purchase Price" value={v.purchasePrice} set={s("purchasePrice")} prefix="$"/>
          <UWInput label="Rehab / Value-Add Budget" value={v.rehabCost} set={s("rehabCost")} prefix="$"/>
          <UWInput label="Bridge Rate (interest-only)" value={v.bridgeRate} set={s("bridgeRate")} suffix="%"/>
          <UWInput label="Bridge LTV (on TDC)" value={v.bridgeLTV} set={s("bridgeLTV")} suffix="%"/>
          <UWInput label="Stabilization Timeline" value={v.stabilizationMos} set={s("stabilizationMos")} suffix="mo"/>
        </div>
        <div style={P}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.teal,letterSpacing:".1em",marginBottom:12}}>PERMANENT FINANCING (EXIT)</div>
          <UWInput label="Stabilized NOI (post-rehab)" value={v.stabilizedNOI} set={s("stabilizedNOI")} prefix="$"/>
          <UWInput label="Exit Cap Rate" value={v.exitCap} set={s("exitCap")} suffix="%"/>
          <UWInput label="Perm Rate" value={v.permRate} set={s("permRate")} suffix="%"/>
          <UWInput label="Perm LTV" value={v.permLTV} set={s("permLTV")} suffix="%"/>
          <UWInput label="Perm Amortization" value={v.permAmort} set={s("permAmort")} suffix="yr"/>
          <UWInput label="Closing Costs (exit)" value={v.closingCostsPct} set={s("closingCostsPct")} suffix="%"/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        <MetricCard label="TOTAL DEV COST" value={fmtD(tdc)} sub={`${fmtD(pp)} + ${fmtD(rehab)} rehab`} color={C.text}/>
        <MetricCard label="STABILIZED VALUE (ARV)" value={fmtD(arv)} sub={`${v.exitCap}% exit cap`} color={arv>tdc?C.success:C.warn}/>
        <MetricCard label="VALUE CREATION" value={fmtD(gainOnValue)} sub={`${tdc>0?((gainOnValue/tdc)*100).toFixed(1):0}% on TDC`} color={gainOnValue>0?C.success:C.danger}/>
        <MetricCard label="PERM LOAN" value={fmtD(permLoan)} sub={`${v.permLTV}% of ARV`} color={permLoan>bridgeLoan?C.success:C.warn}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={P}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:12}}>BRIDGE PHASE ANALYSIS</div>
          {[["Bridge Loan",fmtD(bridgeLoan)],["Bridge LTV on TDC",`${(bridgeLoan/tdc*100).toFixed(1)}%`],["Interest (IO, "+bridgeMos+"mo)",fmtD(bridgeInterest)],["Origination Fee (1%)",fmtD(bridgeFee)],["Total Bridge Cost",fmtD(totalBridgeCost)],["Equity Required",fmtD(totalEquity)]].map(([l,val])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:C.muted}}>{l}</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.text}}>{val}</span>
            </div>
          ))}
          <div style={{marginTop:14}}>
            <StatusPill text={bridgeCoverage>=1.1?"Bridge adequately covered":"Coverage tight — watch LTC"} ok={bridgeCoverage>=1.15} warn={bridgeCoverage>=1.10&&bridgeCoverage<1.15}/>
          </div>
        </div>
        <div style={P}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:12}}>PERMANENT LOAN QUALIFICATION</div>
          {[
            {l:"Perm Loan Amount",v:fmtD(permLoan),ok:true},
            {l:"Perm DSCR",v:`${permDSCR.toFixed(2)}x`,ok:permDSCR>=1.25,warn:permDSCR>=1.10},
            {l:"Perm LTV",v:`${(permLoan/arv*100).toFixed(1)}%`,ok:permLoan/arv<=0.75,warn:permLoan/arv<=0.80},
            {l:"Debt Yield",v:`${permDY.toFixed(2)}%`,ok:permDY>=9,warn:permDY>=7},
            {l:"Annual Debt Service",v:fmtD(permDebt),ok:true},
            {l:"Net Sale Proceeds",v:fmtD(exitEquity),ok:exitEquity>0},
          ].map(({l,v:val,ok,warn})=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:C.muted}}>{l}</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:ok?C.success:warn?C.warn:C.danger}}>{val}</span>
              </div>
            </div>
          ))}
          <div style={{marginTop:14,background:C.card2,borderRadius:8,padding:"12px 14px"}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>EXIT EQUITY MULTIPLE</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:700,color:em>=1.5?C.success:em>=1.2?C.goldBright:C.danger}}>{em.toFixed(2)}x</div>
            <div style={{fontSize:10,color:C.dim,marginTop:3}}>Net proceeds ÷ Total equity invested</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── LENDER ENGINE ─── */
const LENDER_TYPES=["All","Agency/GSE","Life Company","National Bank","CMBS","Debt Fund","Bridge","SBA Lender","Credit Union","Regional Bank","Community Bank"];
const US_STATES=["Nationwide","AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY"];

function LenderEngine() {
  const [deal,setDeal]=useState({propType:"Multifamily",loanAmt:"3500000",ltv:"70",dscr:"1.35",purpose:"Acquisition",state:"Nationwide"});
  const [searched,setSearched]=useState(false);
  const [typeFilter,setTypeFilter]=useState("All");
  const [query,setQuery]=useState("");
  const [showEligible,setShowEligible]=useState(false);
  const [saved,setSaved]=useState([]);
  const [exportMsg,setExportMsg]=useState("");
  const df=k=>v=>setDeal(p=>({...p,[k]:v}));

  const matches=useMemo(()=>searched?matchLenders(deal):[],[searched,deal]);
  const filtered=useMemo(()=>matches.filter(l=>{
    if(typeFilter!=="All"&&l.type!==typeFilter)return false;
    if(showEligible&&!l.eligible)return false;
    if(query&&!l.name.toLowerCase().includes(query.toLowerCase())&&!l.specialty.toLowerCase().includes(query.toLowerCase()))return false;
    return true;
  }),[matches,typeFilter,showEligible,query]);

  const eligibleCount=matches.filter(l=>l.eligible).length;

  const toggleSave=(id)=>setSaved(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  const exportCSV=()=>{
    const rows=filtered.map(l=>[l.name,l.type,l.matchScore,l.rateRange,l.term,l.amort,`$${(l.minLoan/1e6).toFixed(1)}M–$${(l.maxLoan/1e6).toFixed(0)}M`,l.maxLTV+'%',l.minDSCR+'x',l.markets,l.phone,l.contact,l.website,l.specialty].join(","));
    const csv="Lender,Type,Match Score,Rate,Term,Amort,Loan Range,Max LTV,Min DSCR,Markets,Phone,Contact,Website,Specialty\n"+rows.join("\n");
    navigator.clipboard.writeText(csv).then(()=>{setExportMsg("✓ Copied to clipboard");setTimeout(()=>setExportMsg(""),2500);});
  };

  return(
    <div className="au" style={{maxWidth:1120}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:6}}>
        <div><h2 style={H2}>Lender Intelligence Engine</h2><p style={{...Sub,marginBottom:0}}>52 verified CRE lenders — match your deal, generate your intro, make contact.</p></div>
        {searched&&<div style={{display:"flex",gap:8,alignItems:"center"}}>
          {exportMsg?<span style={{fontSize:11,color:C.success}}>{exportMsg}</span>:
          <button onClick={exportCSV} style={{...btnOutline,padding:"6px 14px",fontSize:11,display:"flex",alignItems:"center",gap:5}}><Download size={11}/>Export CSV</button>}
        </div>}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:18,marginTop:18}}>
        {/* ─── DEAL PROFILE PANEL ─── */}
        <div style={{...P,position:"sticky",top:0,maxHeight:"calc(100vh - 120px)",overflowY:"auto"}}>
          <SL>Deal Profile</SL>
          <div style={{marginBottom:10}}><FL l="Property Type"/><Sel val={deal.propType} set={df("propType")} opts={PROP_TYPES}/></div>
          <div style={{marginBottom:10}}><FL l="Loan Amount ($)"/><Inp val={deal.loanAmt} set={df("loanAmt")} mono/></div>
          <div style={{marginBottom:10}}><FL l="LTV (%)"/><Inp val={deal.ltv} set={df("ltv")} mono/></div>
          <div style={{marginBottom:10}}><FL l="DSCR"/><Inp val={deal.dscr} set={df("dscr")} mono/></div>
          <div style={{marginBottom:10}}><FL l="Loan Purpose"/><Sel val={deal.purpose} set={df("purpose")} opts={LOAN_PURPOSES}/></div>
          <div style={{marginBottom:18}}>
            <FL l="State / Market"/>
            <select value={deal.state} onChange={e=>df("state")(e.target.value)} style={{...IS,width:"100%"}}>
              {US_STATES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={()=>setSearched(true)} style={{...btnGold,width:"100%",padding:"11px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontSize:13,marginBottom:8}}><Search size={14}/>Match Lenders</button>
          {searched&&<div style={{background:C.card,borderRadius:8,padding:"10px 12px",marginTop:4}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:C.muted}}>Total matched</span><span style={{fontSize:12,color:C.text,fontFamily:"'DM Mono',monospace"}}>{matches.length}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:C.muted}}>Eligible</span><span style={{fontSize:12,color:C.success,fontFamily:"'DM Mono',monospace"}}>{eligibleCount}</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:C.muted}}>Saved</span><span style={{fontSize:12,color:C.gold,fontFamily:"'DM Mono',monospace"}}>{saved.length}</span></div>
          </div>}
        </div>

        {/* ─── RESULTS PANEL ─── */}
        <div>
          {!searched?(
            <div style={{...P,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:420,opacity:.5}}>
              <Database size={40} color={C.muted} style={{marginBottom:12}}/>
              <p style={{color:C.muted,fontSize:14,fontWeight:500}}>Enter deal profile and click Match</p>
              <p style={{color:C.dim,fontSize:12,marginTop:4}}>52 verified lenders ranked by fit score</p>
            </div>
          ):(
            <>
              {/* Filters Bar */}
              <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search lenders, specialties…" style={{flex:1,minWidth:180,...IS,fontSize:12}}/>
                <button onClick={()=>setShowEligible(s=>!s)} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${showEligible?C.success:C.border}`,background:showEligible?`${C.success}18`:"transparent",color:showEligible?C.success:C.muted,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>Eligible Only</button>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
                {LENDER_TYPES.map(t=><button key={t} onClick={()=>setTypeFilter(t)} style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${typeFilter===t?C.borderGold:C.border}`,background:typeFilter===t?`${C.goldMuted}22`:"transparent",color:typeFilter===t?C.gold:C.dim,fontSize:9,cursor:"pointer",fontFamily:"'DM Mono',monospace",letterSpacing:".05em",whiteSpace:"nowrap"}}>{t.toUpperCase()}</button>)}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {filtered.length===0?<div style={{...P,textAlign:"center",padding:32,color:C.muted,fontSize:13}}>No lenders match current filters.</div>
                :filtered.map((l,i)=><LCard key={l.id} l={l} rank={i+1} deal={deal} saved={saved.includes(l.id)} onSave={()=>toggleSave(l.id)}/>)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LCard({l,rank,deal,saved,onSave}) {
  const [exp,setExp]=useState(false);
  const [aiEmail,setAiEmail]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const sc=l.matchScore>=80?C.success:l.matchScore>=60?C.goldBright:l.matchScore>=40?C.warn:C.muted;
  const TC={"Agency/GSE":C.teal,"National Bank":C.blue,"Debt Fund":C.purple,"Life Company":C.gold,"CMBS":C.blue,"Bridge":C.danger,"Credit Union":C.success,"Regional Bank":C.blue,"Community Bank":C.teal,"SBA Lender":C.rose};
  const fmtLoan=n=>n>=1000000?`$${(n/1e6).toFixed(1)}M`:`$${(n/1000).toFixed(0)}K`;

  const genEmail=async()=>{
    setAiLoading(true);setAiEmail("");
    try{
      const prompt=`You are a senior CRE capital advisor writing a professional cold outreach email to a lender on behalf of a borrower/broker.

Lender: ${l.name} (${l.type})
Lender specialty: ${l.specialty}
Lender markets: ${l.markets}

Deal details:
- Property type: ${deal.propType}
- Loan amount: $${Number(deal.loanAmt).toLocaleString()}
- LTV: ${deal.ltv}%
- DSCR: ${deal.dscr}x
- Purpose: ${deal.purpose}
- Market: ${deal.state||"Nationwide"}

Write a concise, professional 3-paragraph intro email (subject line + body). Paragraph 1: brief intro and deal summary. Paragraph 2: why this lender is the right fit for this deal. Paragraph 3: clear call to action. No fluff, no filler. Sound like a CRE professional, not a salesperson. Keep total length under 200 words.`;

      const res=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system:"You are a CRE capital markets professional writing lender outreach emails.",prompt})});
      const data=await res.json();
      setAiEmail(data.result||data.content||"");
    }catch{setAiEmail("Error generating email. Please try again.");}
    setAiLoading(false);
  };

  const copyEmail=()=>{navigator.clipboard.writeText(aiEmail);};

  return(
    <div style={{background:C.surface,border:`1px solid ${l.eligible?C.borderGold:C.border}`,borderRadius:12,overflow:"hidden",transition:"border-color .2s"}}>
      {/* Header Row */}
      <div style={{padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
        <div onClick={()=>setExp(s=>!s)} style={{display:"flex",alignItems:"center",gap:12,flex:1,cursor:"pointer",minWidth:0}}>
          <div style={{width:28,height:28,background:C.card,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{l.logo}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:2}}>
              <span style={{fontSize:13,fontWeight:600,color:C.white}}>{l.name}</span>
              <span style={{fontSize:8,padding:"2px 6px",borderRadius:3,background:`${TC[l.type]||C.muted}22`,color:TC[l.type]||C.muted,fontFamily:"'DM Mono',monospace",letterSpacing:".05em"}}>{l.type}</span>
              {!l.eligible&&<span style={{fontSize:8,padding:"2px 5px",borderRadius:3,background:C.warnBg,color:C.warn}}>INELIGIBLE</span>}
            </div>
            <p style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.specialty}</p>
          </div>
          <div style={{textAlign:"center",flexShrink:0,marginRight:4}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:sc,lineHeight:1}}>{l.matchScore}</div>
            <div style={{fontSize:8,color:C.muted,fontFamily:"'DM Mono',monospace"}}>MATCH</div>
          </div>
          <ChevronDown size={13} color={C.muted} style={{transform:exp?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}/>
        </div>
        {/* Quick action buttons */}
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <button onClick={onSave} title={saved?"Unsave":"Save"} style={{width:28,height:28,borderRadius:6,border:`1px solid ${saved?C.borderGold:C.border}`,background:saved?`${C.goldMuted}22`:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:saved?C.gold:C.dim,fontSize:14}}>
            {saved?"★":"☆"}
          </button>
          <button onClick={()=>window.open(`https://${l.website}`,"_blank")} title="Open lender website" style={{width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted}}>
            <ExternalLink size={11}/>
          </button>
        </div>
      </div>

      {/* Expanded Detail */}
      {exp&&<div style={{borderTop:`1px solid ${C.border}`,padding:"16px 16px 14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:16}}>
          {/* Loan Parameters */}
          <div>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:8}}>LOAN PARAMETERS</div>
            {[["Loan Range",`${fmtLoan(l.minLoan)} – ${fmtLoan(l.maxLoan)}`],["Max LTV",`${l.maxLTV}%`],["Min DSCR",`${l.minDSCR}x`],["Rate Range",l.rateRange],["Term",l.term],["Amortization",l.amort],["Markets",l.markets]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:5,gap:8}}>
                <span style={{fontSize:11,color:C.muted,flexShrink:0}}>{k}</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.text,textAlign:"right"}}>{v}</span>
              </div>
            ))}
          </div>
          {/* Match Analysis */}
          <div>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:8}}>MATCH ANALYSIS</div>
            {l.reasons.map((r,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:5}}><Check size={10} color={C.success} style={{marginTop:2,flexShrink:0}}/><span style={{fontSize:11,color:C.success}}>{r}</span></div>)}
            {l.flags.map((f,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:5}}><AlertCircle size={10} color={C.warn} style={{marginTop:2,flexShrink:0}}/><span style={{fontSize:11,color:C.warn}}>{f}</span></div>)}
            {l.notes&&<div style={{marginTop:8,padding:"8px 10px",background:C.card,borderRadius:6,fontSize:11,color:C.dim,lineHeight:1.5}}>{l.notes}</div>}
          </div>
        </div>

        {/* Contact Bar */}
        <div style={{background:C.card,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:14}}>
          <div style={{display:"flex",gap:18,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}><Phone size={11} color={C.muted}/><span style={{fontSize:11,color:C.muted}}>{l.phone}</span></div>
            <div style={{display:"flex",alignItems:"center",gap:5}}><Mail size={11} color={C.muted}/><span style={{fontSize:11,color:C.muted}}>{l.contact}</span></div>
            <div style={{display:"flex",alignItems:"center",gap:5}}><ExternalLink size={10} color={C.gold}/><a href={`https://${l.website}`} target="_blank" rel="noreferrer" style={{fontSize:11,color:C.gold,textDecoration:"none"}}>{l.website}</a></div>
          </div>
          <button onClick={()=>window.open(`https://${l.website}`,"_blank")} style={{...btnGold,padding:"6px 16px",fontSize:11,display:"flex",alignItems:"center",gap:5}}>
            <ExternalLink size={10}/>Visit Lender
          </button>
        </div>

        {/* AI Email Generator */}
        <div style={{border:`1px solid ${C.borderGold}`,borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",background:`${C.goldMuted}11`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <Brain size={13} color={C.gold}/>
              <span style={{fontSize:11,fontWeight:600,color:C.gold}}>AI Lender Intro Email</span>
              <span style={{fontSize:9,color:C.dim}}>— personalized to this deal + lender</span>
            </div>
            <div style={{display:"flex",gap:8}}>
              {aiEmail&&<button onClick={copyEmail} style={{...btnOutline,padding:"4px 10px",fontSize:10,display:"flex",alignItems:"center",gap:4}}><Copy size={9}/>Copy</button>}
              <button onClick={genEmail} disabled={aiLoading} style={{...btnGold,padding:"5px 14px",fontSize:10,display:"flex",alignItems:"center",gap:5,opacity:aiLoading?.7:1}}>
                {aiLoading?<><div style={{width:10,height:10,border:`2px solid ${C.bg}55`,borderTopColor:C.bg,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>Generating...</>:<><Zap size={10}/>Generate Email</>}
              </button>
            </div>
          </div>
          {aiEmail&&(
            <div style={{padding:"14px 16px",background:C.card}}>
              <pre style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.text,whiteSpace:"pre-wrap",lineHeight:1.7,margin:0}}>{aiEmail}</pre>
            </div>
          )}
          {!aiEmail&&!aiLoading&&(
            <div style={{padding:"12px 16px",fontSize:11,color:C.dim,fontStyle:"italic"}}>Click Generate Email to create a personalized outreach email for this lender based on your deal profile.</div>
          )}
        </div>
      </div>}
    </div>
  );
}

/* ─── REFI ANALYZER ─── */
function RefiCalc() {
  const [v,sv]=useState({
    currentBalance:"1400000",currentRate:"4.25",currentAmort:"25",remainingTerm:"18",
    currentNOI:"175000",newRate:"6.75",newLTV:"70",newAmort:"25",appraised:"2600000",
    closingCostsPct:"2",purpose:"Rate & Term"
  });
  const s=k=>val=>sv(p=>({...p,[k]:val}));
  const curBal=parseFloat(v.currentBalance)||0,curRate=parseFloat(v.currentRate)||0;
  const curAmort=parseFloat(v.currentAmort)||25,remTerm=parseFloat(v.remainingTerm)||18;
  const noi=parseFloat(v.currentNOI)||0,newRate=parseFloat(v.newRate)||0;
  const newLTV=parseFloat(v.newLTV)/100||0.70,newAmort=parseFloat(v.newAmort)||25;
  const apprVal=parseFloat(v.appraised)||0;
  const closingCostsPct=parseFloat(v.closingCostsPct)/100||0.02;

  const curPmt=monthlyPmt(curBal,curRate,curAmort);
  const curAnnDebt=curPmt*12;
  const curDSCR=curAnnDebt>0?noi/curAnnDebt:0;

  const maxLoanByLTV=apprVal*newLTV;
  const maxLoanByDSCR=(() => {
    const maxDebt=noi/1.25,mPmt=maxDebt/12,r=newRate/100/12,n=newAmort*12;
    return r>0?mPmt*(Math.pow(1+r,n)-1)/(r*Math.pow(1+r,n)):mPmt*n;
  })();
  const newLoan=Math.min(maxLoanByLTV,maxLoanByDSCR);
  const cashOut=Math.max(0,newLoan-curBal);
  const closingCosts=newLoan*closingCostsPct;
  const netCashOut=cashOut-closingCosts;
  const newPmt=monthlyPmt(newLoan,newRate,newAmort);
  const newAnnDebt=newPmt*12;
  const newDSCR=newAnnDebt>0?noi/newAnnDebt:0;
  const newLTVActual=apprVal>0?newLoan/apprVal*100:0;
  const newDY=newLoan>0?noi/newLoan*100:0;
  const monthlyDiff=newPmt-curPmt;
  const bindingConstraint=maxLoanByDSCR<maxLoanByLTV?"DSCR":"LTV";

  // Breakeven on closing costs (months of payment savings)
  const monthlySavings=curPmt-newPmt;
  const breakeven=monthlySavings>0?Math.ceil(closingCosts/monthlySavings):null;

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div style={P}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.blue,letterSpacing:".1em",marginBottom:12}}>EXISTING LOAN</div>
          <UWInput label="Current Loan Balance" value={v.currentBalance} set={s("currentBalance")} prefix="$"/>
          <UWInput label="Current Rate" value={v.currentRate} set={s("currentRate")} suffix="%"/>
          <UWInput label="Original Amortization" value={v.currentAmort} set={s("currentAmort")} suffix="yr"/>
          <UWInput label="Remaining Term" value={v.remainingTerm} set={s("remainingTerm")} suffix="mo"/>
          <UWInput label="Annual NOI" value={v.currentNOI} set={s("currentNOI")} prefix="$"/>
          <div style={{marginTop:10,padding:"10px 12px",background:C.card,borderRadius:8,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:C.muted}}>Current Monthly Payment</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.text}}>{fmtD(curPmt)}/mo</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:C.muted}}>Current DSCR</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:curDSCR>=1.25?C.success:C.warn}}>{curDSCR.toFixed(2)}x</span></div>
          </div>
        </div>
        <div style={P}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.teal,letterSpacing:".1em",marginBottom:12}}>NEW LOAN</div>
          <UWInput label="Appraised Value" value={v.appraised} set={s("appraised")} prefix="$"/>
          <UWInput label="New Rate" value={v.newRate} set={s("newRate")} suffix="%"/>
          <UWInput label="New LTV Maximum" value={v.newLTV} set={s("newLTV")} suffix="%"/>
          <UWInput label="New Amortization" value={v.newAmort} set={s("newAmort")} suffix="yr"/>
          <UWInput label="Closing Costs" value={v.closingCostsPct} set={s("closingCostsPct")} suffix="%"/>
        </div>
      </div>

      {/* Results */}
      <div style={{background:C.surface,border:`2px solid ${C.borderGold}`,borderRadius:14,padding:"20px 22px",marginBottom:16}}>
        <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.gold,letterSpacing:".15em",marginBottom:14}}>REFINANCE ANALYSIS</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
          <MetricCard label="NEW LOAN AMOUNT" value={fmtD(newLoan)} sub={`Binding: ${bindingConstraint}`} color={C.goldBright} size={24}/>
          <MetricCard label="CASH-OUT PROCEEDS" value={fmtD(cashOut)} sub={`Net: ${fmtD(netCashOut)} after CC`} color={cashOut>0?C.success:C.muted} size={24}/>
          <MetricCard label="NEW DSCR" value={`${newDSCR.toFixed(2)}x`} sub={`Was ${curDSCR.toFixed(2)}x`} color={newDSCR>=1.25?C.success:C.warn} size={24}/>
          <MetricCard label="PAYMENT CHANGE" value={`${monthlyDiff>0?"+":""}${fmtD(monthlyDiff)}/mo`} sub={monthlyDiff>0?"Higher payment":"Savings"} color={monthlyDiff<=0?C.success:C.warn} size={24}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:10}}>LOAN COMPARISON</div>
            {[
              ["Current Balance",fmtD(curBal),"New Loan",fmtD(newLoan)],
              ["Current Rate",`${curRate.toFixed(2)}%`,"New Rate",`${newRate.toFixed(2)}%`],
              ["Current Pmt",`${fmtD(curPmt)}/mo`,"New Pmt",`${fmtD(newPmt)}/mo`],
              ["Current DSCR",`${curDSCR.toFixed(2)}x`,"New DSCR",`${newDSCR.toFixed(2)}x`],
              ["Current LTV",`${apprVal>0?(curBal/apprVal*100).toFixed(1):"-"}%`,"New LTV",`${newLTVActual.toFixed(1)}%`],
            ].map(([l1,v1,l2,v2])=>(
              <div key={l1} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:C.dim}}>{l1}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.muted}}>{v1}</span></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:C.dim}}>{l2}</span><span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.gold}}>{v2}</span></div>
              </div>
            ))}
          </div>
          <div>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:10}}>ECONOMICS</div>
            {[
              ["Max Loan by LTV",fmtD(maxLoanByLTV)],
              ["Max Loan by DSCR (1.25x)",fmtD(maxLoanByDSCR)],
              ["Binding Constraint",bindingConstraint],
              ["Gross Cash-Out",fmtD(cashOut)],
              ["Closing Costs",`${fmtD(closingCosts)} (${v.closingCostsPct}%)`],
              ["Net Cash-Out",fmtD(netCashOut)],
              ["Debt Yield",`${newDY.toFixed(2)}%`],
              breakeven?["Breakeven Period",`${breakeven} months`]:["Breakeven","N/A — payment increases"],
            ].filter(Boolean).map(([l,val])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:11,color:C.muted}}>{l}</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.text}}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status */}
      <div style={{...P,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <StatusPill text={`DSCR: ${newDSCR.toFixed(2)}x`} ok={newDSCR>=1.25} warn={newDSCR>=1.10}/>
        <StatusPill text={`LTV: ${newLTVActual.toFixed(1)}%`} ok={newLTVActual<=75} warn={newLTVActual<=80}/>
        <StatusPill text={`DY: ${newDY.toFixed(1)}%`} ok={newDY>=9} warn={newDY>=7}/>
        <StatusPill text={cashOut>0?"Cash-Out Refi":"Rate & Term Refi"} ok={true}/>
      </div>
    </div>
  );
}

/* ─── MULTIFAMILY RENT ROLL ─── */
function MFRentRoll() {
  const defaultUnits=[
    {id:1,type:"1BR/1BA",count:"8",marketRent:"1250",inPlaceRent:"1100",vac:"5"},
    {id:2,type:"2BR/1BA",count:"10",marketRent:"1550",inPlaceRent:"1350",vac:"5"},
    {id:3,type:"2BR/2BA",count:"6",marketRent:"1750",inPlaceRent:"1600",vac:"5"},
    {id:4,type:"3BR/2BA",count:"4",marketRent:"2100",inPlaceRent:"1900",vac:"5"},
  ];
  const [units,setUnits]=useState(defaultUnits);
  const [v,sv]=useState({otherIncome:"3600",vacOverride:"",expRatio:"40",price:"3500000",rate:"6.75",ltv:"70",amort:"25"});
  const s=k=>val=>sv(p=>({...p,[k]:val}));

  const updUnit=(id,key,val)=>setUnits(u=>u.map(u2=>u2.id===id?{...u2,[key]:val}:u2));
  const addUnit=()=>setUnits(u=>[...u,{id:Date.now(),type:"Studio",count:"1",marketRent:"1000",inPlaceRent:"950",vac:"5"}]);
  const removeUnit=(id)=>setUnits(u=>u.filter(u2=>u2.id!==id));

  const totalUnits=units.reduce((s,u)=>s+(parseInt(u.count)||0),0);
  const gprMarket=units.reduce((s,u)=>{const cnt=parseInt(u.count)||0,rent=parseFloat(u.marketRent)||0,vac=parseFloat(u.vac)/100||0;return s+cnt*rent*12*(1-vac);},0);
  const gprInPlace=units.reduce((s,u)=>{const cnt=parseInt(u.count)||0,rent=parseFloat(u.inPlaceRent)||0,vac=parseFloat(u.vac)/100||0;return s+cnt*rent*12*(1-vac);},0);
  const otherInc=parseFloat(v.otherIncome)*12||0;
  const egi=gprInPlace+otherInc;
  const expRatio=parseFloat(v.expRatio)/100||0.40;
  const expenses=egi*expRatio;
  const noi=egi-expenses;
  const rentGap=gprMarket-gprInPlace;
  const price=parseFloat(v.price)||0,ltvN=parseFloat(v.ltv)/100||0.70;
  const loan=price*ltvN,pmt=monthlyPmt(loan,parseFloat(v.rate),parseFloat(v.amort)),annDebt=pmt*12;
  const dscr=annDebt>0?noi/annDebt:0;
  const cap=price>0?noi/price*100:0;
  const equity=price-loan,coc=equity>0?(noi-annDebt)/equity*100:0;
  const noiu=totalUnits>0?noi/totalUnits:0;
  const noiPerUnit=Math.round(noiu);
  const pricePerUnit=totalUnits>0?price/totalUnits:0;
  // Value-add upside
  const noiAtMarket=(gprMarket+otherInc)*(1-expRatio);
  const capRateN=cap/100;
  const upsideValue=capRateN>0?(noiAtMarket-noi)/capRateN:0;

  return(
    <div>
      {/* Unit Mix Table */}
      <div style={P}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em"}}>UNIT MIX & RENT ROLL</div>
          <button onClick={addUnit} style={{...btnOutline,padding:"4px 12px",fontSize:10,display:"flex",alignItems:"center",gap:4}}>+ Add Unit Type</button>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:580}}>
            <thead><tr>
              {["Unit Type","# Units","Market Rent","In-Place Rent","Vacancy","Gross Income","Upside"].map(h=>(
                <th key={h} style={{padding:"7px 10px",fontSize:9,color:C.muted,fontWeight:400,fontFamily:"'DM Mono',monospace",textAlign:h==="Unit Type"?"left":"right",borderBottom:`1px solid ${C.border}`}}>{h}</th>
              ))}
              <th style={{width:30,borderBottom:`1px solid ${C.border}`}}/>
            </tr></thead>
            <tbody>
              {units.map(u=>{
                const cnt=parseInt(u.count)||0,mRent=parseFloat(u.marketRent)||0,ipRent=parseFloat(u.inPlaceRent)||0,vacR=parseFloat(u.vac)/100||0;
                const grossIncome=cnt*ipRent*12*(1-vacR);
                const upside=cnt*(mRent-ipRent)*12*(1-vacR);
                return(
                  <tr key={u.id} style={{borderBottom:`1px solid ${C.border}`}}>
                    <td style={{padding:"6px 8px"}}><input value={u.type} onChange={e=>updUnit(u.id,"type",e.target.value)} style={{...IS,padding:"4px 8px",fontSize:11,width:100}}/></td>
                    <td style={{padding:"6px 8px"}}><input value={u.count} onChange={e=>updUnit(u.id,"count",e.target.value)} style={{...IS,padding:"4px 8px",fontSize:11,width:50,textAlign:"right",fontFamily:"'DM Mono',monospace"}}/></td>
                    <td style={{padding:"6px 8px"}}><input value={u.marketRent} onChange={e=>updUnit(u.id,"marketRent",e.target.value)} style={{...IS,padding:"4px 8px",fontSize:11,width:80,textAlign:"right",fontFamily:"'DM Mono',monospace"}}/></td>
                    <td style={{padding:"6px 8px"}}><input value={u.inPlaceRent} onChange={e=>updUnit(u.id,"inPlaceRent",e.target.value)} style={{...IS,padding:"4px 8px",fontSize:11,width:80,textAlign:"right",fontFamily:"'DM Mono',monospace"}}/></td>
                    <td style={{padding:"6px 8px"}}><input value={u.vac} onChange={e=>updUnit(u.id,"vac",e.target.value)} style={{...IS,padding:"4px 8px",fontSize:11,width:50,textAlign:"right",fontFamily:"'DM Mono',monospace"}}/></td>
                    <td style={{padding:"6px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.text}}>{fmtD(grossIncome)}</td>
                    <td style={{padding:"6px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:upside>0?C.success:C.dim}}>{upside>0?`+${fmtD(upside)}`:"-"}</td>
                    <td style={{padding:"6px 8px",textAlign:"center"}}><button onClick={()=>removeUnit(u.id)} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",padding:2}}><X size={11}/></button></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{borderTop:`2px solid ${C.borderGold}`,background:`${C.goldMuted}08`}}>
                <td colSpan={1} style={{padding:"9px 10px",fontFamily:"'DM Mono',monospace",fontSize:10,color:C.gold}}>TOTAL</td>
                <td style={{padding:"9px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.gold}}>{totalUnits}</td>
                <td colSpan={2} style={{padding:"9px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.muted}}>Market GPR: {fmtD(gprMarket)}</td>
                <td/>
                <td style={{padding:"9px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.goldBright}}>{fmtD(gprInPlace)}</td>
                <td style={{padding:"9px 10px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.success}}>{rentGap>0?`+${fmtD(rentGap)}`:"-"}</td>
                <td/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Deal Inputs + Results */}
      <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:16,marginTop:14}}>
        <div style={P}>
          <SL>Deal Parameters</SL>
          <UWInput label="Monthly Other Income" value={v.otherIncome} set={s("otherIncome")} prefix="$"/>
          <UWInput label="Expense Ratio" value={v.expRatio} set={s("expRatio")} suffix="%"/>
          <UWInput label="Purchase Price" value={v.price} set={s("price")} prefix="$"/>
          <UWInput label="Interest Rate" value={v.rate} set={s("rate")} suffix="%"/>
          <UWInput label="LTV" value={v.ltv} set={s("ltv")} suffix="%"/>
          <UWInput label="Amortization" value={v.amort} set={s("amort")} suffix="yr"/>
        </div>
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
            <MetricCard label="NOI (IN-PLACE)" value={fmtD(noi)} sub={`${fmtD(noiPerUnit)}/unit/yr`} color={C.goldBright}/>
            <MetricCard label="CAP RATE" value={`${cap.toFixed(2)}%`} sub={`At ${fmtD(price)}`} color={cap>=6?C.success:cap>=5?C.goldBright:C.warn}/>
            <MetricCard label="DSCR" value={`${dscr.toFixed(2)}x`} sub="At current NOI" color={dscr>=1.25?C.success:C.warn}/>
            <MetricCard label="CASH-ON-CASH" value={`${coc.toFixed(1)}%`} sub="After debt service" color={coc>=6?C.success:coc>=4?C.goldBright:C.warn}/>
            <MetricCard label="PRICE / UNIT" value={fmtD(pricePerUnit)} sub={`${totalUnits} total units`}/>
            <MetricCard label="RENT GAP" value={fmtD(rentGap)} sub="Annual upside potential" color={rentGap>0?C.success:C.muted}/>
            <MetricCard label="UPSIDE VALUE" value={fmtD(upsideValue)} sub={`At ${cap.toFixed(2)}% cap`} color={upsideValue>0?C.success:C.muted}/>
            <MetricCard label="EQUITY REQUIRED" value={fmtD(equity)} sub={`${(100-parseFloat(v.ltv)).toFixed(0)}% down`}/>
          </div>
          {/* NOI Waterfall */}
          <div style={P}>
            <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:C.muted,letterSpacing:".1em",marginBottom:10}}>NOI WATERFALL</div>
            {[
              {l:"GPR (In-Place, Effective)",v:gprInPlace,type:"inc"},
              {l:"Other Income",v:otherInc,type:"inc"},
              {l:"Effective Gross Income",v:egi,type:"sub"},
              {l:`Operating Expenses (${v.expRatio}%)`,v:-expenses,type:"loss"},
              {l:"Net Operating Income",v:noi,type:"noi"},
              {l:"Annual Debt Service",v:-annDebt,type:"loss"},
              {l:"Before-Tax Cash Flow",v:noi-annDebt,type:noi-annDebt>0?"inc":"loss"},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${r.type==="noi"?C.borderGold:C.border}`,background:r.type==="noi"?`${C.goldMuted}08`:"transparent"}}>
                <span style={{fontSize:12,color:r.type==="noi"?C.goldBright:r.type==="sub"?C.text:C.muted,fontWeight:r.type==="noi"||r.type==="sub"?600:400}}>{r.l}</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:r.type==="noi"?C.goldBright:r.v<0?C.danger:r.type==="sub"?C.white:C.text}}>
                  {r.v<0?`-${fmtD(Math.abs(r.v))}`:fmtD(r.v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── AI DEAL ANALYZER ─── */
function AIDealAnalyzer() {
  const [input,setInput]=useState("");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const [mode,setMode]=useState("full"); // full | quick | red_flags

  const MODES=[
    {id:"full",label:"Full Analysis",desc:"Complete underwriting review"},
    {id:"quick",label:"Quick Screen",desc:"Pass/fail in 60 seconds"},
    {id:"red_flags",label:"Red Flag Scan",desc:"What could kill this deal"},
  ];

  const placeholders=[
    "12-unit multifamily in Anchorage, AK. Asking $1.8M. Current rents avg $1,100/mo. Market rents $1,350/mo. Expenses running 42%. 70% LTV at 6.875%. 5-year interest only period then 25-year amort...",
    "Office building, 18,000 SF, $3.2M ask, 88% occupied, NNN leases, $312K NOI, CMBS at 7.25%...",
    "Industrial flex, 24,000 SF, $2.75M, 100% occupied, 3 tenants, $198K NOI, asking 65% LTV...",
  ];
  const [ph]=useState(placeholders[Math.floor(Math.random()*placeholders.length)]);

  const analyze=async()=>{
    if(!input.trim())return;
    setLoading(true);setResult("");
    const prompts={
      full:`You are a senior CRE underwriter and capital markets advisor. Analyze this deal with full institutional-grade underwriting. Structure your response exactly as follows:

## Deal Overview
Brief summary of what was presented.

## Key Metrics (calculate what you can)
- NOI: (calculate or estimate)
- Cap Rate: (calculate)
- DSCR: (calculate)  
- LTV: (as stated or implied)
- Debt Yield: (calculate)

## Underwriting Assessment
Detailed analysis of income, expenses, leverage, and debt coverage. Be specific with numbers.

## Lender Fit
What type of lender (agency, bank, life co, debt fund, CMBS, bridge) is right for this deal and why.

## Strengths
3-5 specific strengths with numbers.

## Risks & Concerns
3-5 specific risks with mitigation notes.

## Verdict
Clear FUND / CONDITIONAL / PASS recommendation with 2-3 sentence rationale.`,

      quick:`You are a senior CRE underwriter doing a rapid screen. In 200 words max, give:
1. PASS/CONDITIONAL/FAIL verdict upfront in bold
2. 3 key reasons for your verdict (with numbers)
3. One critical number or ratio the borrower should know
Be direct and specific. No filler.`,

      red_flags:`You are a CRE deal structuring expert. Identify every potential red flag, deal-killer, and risk in this deal. Format as:
## 🔴 Critical Deal Killers (would cause immediate decline)
## 🟡 Yellow Flags (need explanation or mitigation)  
## ✅ What Works
## Bottom Line
Be brutally honest. Include lender perspective. Cite specific numbers from the deal.`
    };

    try{
      const r=await callAI(prompts[mode],`Analyze this CRE deal:\n\n${input}`);
      setResult(r);
    }catch{setResult("Error analyzing deal. Please try again.");}
    setLoading(false);
  };

  return(
    <div style={{maxWidth:800}}>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {MODES.map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${mode===m.id?C.borderGold:C.border}`,background:mode===m.id?`${C.goldMuted}22`:"transparent",color:mode===m.id?C.gold:C.muted,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left",fontWeight:mode===m.id?600:400}}>
              <div style={{fontWeight:600}}>{m.label}</div>
              <div style={{fontSize:10,opacity:.7,marginTop:1}}>{m.desc}</div>
            </button>
          ))}
        </div>
        <div style={{position:"relative"}}>
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            placeholder={ph}
            rows={6}
            style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",fontSize:13,color:C.text,fontFamily:"'DM Sans',sans-serif",resize:"vertical",lineHeight:1.6,boxSizing:"border-box",outline:"none"}}
          />
          <div style={{position:"absolute",bottom:10,right:12,fontSize:10,color:C.dim}}>{input.length} chars</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
          <button onClick={analyze} disabled={loading||!input.trim()} style={{...btnGold,padding:"11px 28px",fontSize:14,display:"flex",alignItems:"center",gap:8,opacity:loading||!input.trim()?0.6:1}}>
            {loading?<><div style={{width:14,height:14,border:`2px solid ${C.bg}55`,borderTopColor:C.bg,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>Analyzing...</>:<><Brain size={14}/>Analyze Deal</>}
          </button>
          {result&&<button onClick={()=>navigator.clipboard.writeText(result)} style={{...btnOutline,padding:"10px 18px",fontSize:12,display:"flex",alignItems:"center",gap:6}}><Copy size={11}/>Copy Report</button>}
          {input&&<button onClick={()=>{setInput("");setResult("");}} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>Clear</button>}
        </div>
      </div>

      {loading&&<div style={{background:C.surface,border:`1px solid ${C.borderGold}`,borderRadius:14,padding:"40px 28px",textAlign:"center"}}>
        <div style={{width:32,height:32,border:`2px solid ${C.borderGold}`,borderTopColor:C.goldBright,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 14px"}}/>
        <p style={{color:C.muted,fontSize:13,marginBottom:4}}>Running institutional-grade underwriting analysis...</p>
        <p style={{color:C.dim,fontSize:11}}>Calculating metrics, assessing lender fit, flagging risks</p>
      </div>}

      {result&&!loading&&(
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:28}}>
          <div style={{fontSize:13,color:C.text,lineHeight:1.9}}>
            {result.split('\n').map((line,i)=>{
              if(line.startsWith('## '))return<h2 key={i} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.gold,margin:"22px 0 9px",fontWeight:600,borderBottom:`1px solid ${C.border}`,paddingBottom:5}}>{line.replace('## ','')}</h2>;
              if(line.startsWith('### '))return<h3 key={i} style={{fontSize:14,color:C.white,margin:"14px 0 5px",fontWeight:600}}>{line.replace('### ','')}</h3>;
              if(line.startsWith('- ')||line.startsWith('• '))return<div key={i} style={{paddingLeft:16,margin:"4px 0",display:"flex",gap:8}}><span style={{color:C.gold,flexShrink:0,marginTop:3}}>▸</span><span>{line.slice(2)}</span></div>;
              if(line==='')return<div key={i} style={{height:6}}/>;
              return<p key={i} style={{margin:"4px 0"}} dangerouslySetInnerHTML={{__html:line.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#DDE2EE">$1</strong>')}}></p>;
            })}
          </div>
        </div>
      )}

      {!result&&!loading&&<div style={{...P,textAlign:"center",padding:32,opacity:.5}}>
        <Brain size={36} color={C.muted} style={{marginBottom:10}}/>
        <p style={{color:C.muted,fontSize:13}}>Paste any deal summary above — address, price, NOI, loan terms, anything you have</p>
        <p style={{color:C.dim,fontSize:11,marginTop:4}}>The more detail you provide, the sharper the analysis</p>
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

/* ─── ACCOUNT SETTINGS ─── */
function AccountSettings({user,setUser,onLogout}) {
  const [loading,setLoading]=useState(false);
  const [cancelConfirm,setCancelConfirm]=useState(false);
  const [msg,setMsg]=useState({type:"",text:""});
  const [subData,setSubData]=useState(null);
  const [pwForm,setPwForm]=useState({current:"",next:"",confirm:""});
  const [pwLoading,setPwLoading]=useState(false);
  const [pwMsg,setPwMsg]=useState("");

  useEffect(()=>{
    // Load subscription data
    if(user?.token){
      fetch("/api/subscription",{headers:{"Authorization":`Bearer ${user.token}`}})
        .then(r=>r.json())
        .then(d=>{if(d.subscription)setSubData(d.subscription);})
        .catch(()=>{});
    }
  },[user?.token]);

  const cancelSub=async()=>{
    setLoading(true);setMsg({type:"",text:""});
    try{
      const res=await fetch("/api/subscription",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${user.token}`},body:JSON.stringify({action:"cancel"})});
      const data=await res.json();
      if(data.success){
        setMsg({type:"success",text:"Subscription cancelled. You have access until end of billing period."});
        setCancelConfirm(false);
        setSubData(s=>({...s,cancel_at_period_end:true}));
      } else {
        setMsg({type:"error",text:data.error||"Cancellation failed."});
      }
    }catch{setMsg({type:"error",text:"Connection error."});}
    setLoading(false);
  };

  const reactivateSub=async()=>{
    setLoading(true);
    try{
      const res=await fetch("/api/subscription",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${user.token}`},body:JSON.stringify({action:"reactivate"})});
      const data=await res.json();
      if(data.success){
        setMsg({type:"success",text:"Subscription reactivated successfully."});
        setSubData(s=>({...s,cancel_at_period_end:false}));
      }
    }catch{}
    setLoading(false);
  };

  const openPortal=async()=>{
    setLoading(true);
    try{
      const res=await fetch("/api/subscription",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${user.token}`},body:JSON.stringify({action:"portal"})});
      const data=await res.json();
      if(data.url)window.open(data.url,"_blank");
      else setMsg({type:"error",text:data.error||"Could not open billing portal."});
    }catch{}
    setLoading(false);
  };

  const changePassword=async()=>{
    if(pwForm.next.length<8){setPwMsg("Password must be at least 8 characters.");return;}
    if(pwForm.next!==pwForm.confirm){setPwMsg("Passwords do not match.");return;}
    setPwLoading(true);setPwMsg("");
    try{
      const res=await fetch("/api/auth/reset-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"confirm",token:user.token,newPassword:pwForm.next})});
      const data=await res.json();
      if(data.success){setPwMsg("✓ Password updated successfully.");setPwForm({current:"",next:"",confirm:""});}
      else setPwMsg(data.error||"Password update failed.");
    }catch{setPwMsg("Connection error.");}
    setPwLoading(false);
  };

  const tier=TIERS[user?.tier];
  const accessUntil=subData?.current_period_end?new Date(subData.current_period_end*1000).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):null;

  return(
    <div className="au" style={{maxWidth:700}}>
      <h2 style={H2}>Account & Billing</h2>
      <p style={{...Sub,marginBottom:28}}>Manage your plan, billing, and account settings.</p>

      {/* Plan Overview */}
      <div style={{background:C.surface,border:`1px solid ${C.borderGold}`,borderRadius:14,padding:24,marginBottom:20}}>
        <SL>Current Plan</SL>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:C.white,fontWeight:600}}>{tier?.name||"ACTIVE"}</div>
            <div style={{fontSize:13,color:C.muted,marginTop:4}}>{tier?.price}{tier?.period} · {user?.email}</div>
            {subData?.cancel_at_period_end&&<div style={{fontSize:12,color:C.warn,marginTop:6}}>⚠ Cancels at end of period{accessUntil?` — access until ${accessUntil}`:""}</div>}
            {!subData?.cancel_at_period_end&&accessUntil&&<div style={{fontSize:12,color:C.muted,marginTop:6}}>Next billing: {accessUntil}</div>}
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button onClick={openPortal} disabled={loading} style={{...btnOutline,padding:"8px 18px",fontSize:13}}>Manage Billing</button>
            {subData?.cancel_at_period_end
              ?<button onClick={reactivateSub} disabled={loading} style={{...btnGold,padding:"8px 18px",fontSize:13}}>Reactivate</button>
              :user?.tier!=="foundation"&&<button onClick={()=>setCancelConfirm(true)} disabled={loading} style={{background:"transparent",border:`1px solid ${C.dangerBorder}`,color:C.danger,borderRadius:8,padding:"8px 18px",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Cancel Plan</button>
            }
          </div>
        </div>

        {/* Cancel Confirmation */}
        {cancelConfirm&&<div style={{marginTop:18,padding:16,background:C.dangerBg,border:`1px solid ${C.dangerBorder}`,borderRadius:10}}>
          <p style={{fontSize:13,color:C.danger,marginBottom:12}}>Are you sure? You'll lose access to all paid features at the end of your billing period.</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={cancelSub} disabled={loading} style={{background:C.danger,border:"none",color:"#fff",borderRadius:7,padding:"8px 18px",fontSize:12,cursor:"pointer",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{loading?"Cancelling...":"Yes, Cancel Plan"}</button>
            <button onClick={()=>setCancelConfirm(false)} style={{...btnOutline,padding:"8px 14px",fontSize:12}}>Keep Plan</button>
          </div>
        </div>}

        {msg.text&&<div style={{marginTop:14,padding:"10px 14px",background:msg.type==="success"?C.successBg:C.dangerBg,border:`1px solid ${msg.type==="success"?C.successBorder:C.dangerBorder}`,borderRadius:8,fontSize:13,color:msg.type==="success"?C.success:C.danger}}>{msg.text}</div>}
      </div>

      {/* Plan Features */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:24,marginBottom:20}}>
        <SL>Plan Features</SL>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {tier?.features?.map((f,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><Check size={12} color={C.success} style={{marginTop:3,flexShrink:0}}/><span style={{fontSize:13,color:C.text}}>{f}</span></div>)}
        </div>
      </div>

      {/* Change Password */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:24,marginBottom:20}}>
        <SL>Change Password</SL>
        <div style={{maxWidth:400}}>
          <div style={{marginBottom:12}}><FL l="New Password"/><input value={pwForm.next} onChange={e=>setPwForm(p=>({...p,next:e.target.value}))} type="password" placeholder="Min 8 characters" style={IS}/></div>
          <div style={{marginBottom:16}}><FL l="Confirm New Password"/><input value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} type="password" placeholder="Re-enter new password" style={IS}/></div>
          {pwMsg&&<p style={{fontSize:12,color:pwMsg.startsWith("✓")?C.success:C.danger,marginBottom:10}}>{pwMsg}</p>}
          <button onClick={changePassword} disabled={pwLoading||!pwForm.next||!pwForm.confirm} style={{...btnGold,padding:"9px 22px",fontSize:13}}>
            {pwLoading?"Updating...":"Update Password"}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{background:C.surface,border:`1px solid ${C.dangerBorder}`,borderRadius:14,padding:24}}>
        <SL>Account</SL>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div><p style={{fontSize:13,color:C.text,marginBottom:3}}>Sign out of HyCRE.ai</p><p style={{fontSize:11,color:C.muted}}>You'll need to sign back in to access your dashboard.</p></div>
          <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:8,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"8px 16px",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}><LogOut size={13}/>Sign Out</button>
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
