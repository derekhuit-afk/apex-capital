// HyCRE.ai — One-shot migration + seeder endpoint
// Creates cre_lenders, cre_deals, cre_market_snapshots, cre_prospects tables
// Seeds cre_lenders with 52 verified records
// Uses Supabase Management API direct SQL execution via pg REST

import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

// Embedded 52 lenders (same as App.jsx — single source now lives here for migration)
const LENDERS_SEED = [
  {
    "id": 1,
    "name": "Walker & Dunlop",
    "type": "Agency/GSE",
    "logo": "\ud83c\udfdb",
    "minLoan": 1000000,
    "maxLoan": 500000000,
    "maxLTV": 80,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Affordable Housing",
      "Senior Housing"
    ],
    "markets": "Nationwide",
    "rateRange": "5.85\u20137.10%",
    "term": "5,7,10,12yr",
    "amort": "30yr",
    "contact": "wdinfo@walkerdunlop.com",
    "phone": "(301) 215-5500",
    "website": "walkerdunlop.com",
    "specialty": "#1 Fannie Mae/Freddie Mac DUS lender. Multifamily, affordable, seniors housing.",
    "notes": "Largest commercial real estate finance company in the US by Fannie Mae volume.",
    "lastVerified": "April 2026"
  },
  {
    "id": 2,
    "name": "Berkadia Commercial Mortgage",
    "type": "Agency/GSE",
    "logo": "\ud83c\udfdb",
    "minLoan": 1000000,
    "maxLoan": 500000000,
    "maxLTV": 80,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Affordable Housing",
      "Senior Housing",
      "Student Housing"
    ],
    "markets": "Nationwide",
    "rateRange": "5.90\u20137.20%",
    "term": "5,7,10yr",
    "amort": "30yr",
    "contact": "berkadia.com/contact",
    "phone": "(215) 328-5500",
    "website": "berkadia.com",
    "specialty": "Top Fannie Mae/Freddie Mac/HUD lender. Full-service multifamily capital.",
    "lastVerified": "April 2026"
  },
  {
    "id": 3,
    "name": "Greystone",
    "type": "Agency/GSE",
    "logo": "\ud83c\udfdb",
    "minLoan": 1000000,
    "maxLoan": 500000000,
    "maxLTV": 80,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Affordable Housing",
      "Healthcare",
      "Senior Housing"
    ],
    "markets": "Nationwide",
    "rateRange": "5.80\u20137.15%",
    "term": "5,7,10,35yr",
    "amort": "30\u201335yr",
    "contact": "greyco.com/contact",
    "phone": "(212) 896-9800",
    "website": "greyco.com",
    "specialty": "Fannie Mae, Freddie Mac, HUD/FHA, CMBS multifamily specialist.",
    "lastVerified": "April 2026"
  },
  {
    "id": 4,
    "name": "CBRE Multifamily Capital",
    "type": "Agency/GSE",
    "logo": "\ud83c\udfe2",
    "minLoan": 1000000,
    "maxLoan": 1000000000,
    "maxLTV": 80,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Affordable Housing",
      "Senior Housing",
      "Student Housing"
    ],
    "markets": "Nationwide",
    "rateRange": "5.75\u20137.00%",
    "term": "5,7,10,12yr",
    "amort": "30yr",
    "contact": "cbre.com/real-estate-finance",
    "phone": "(214) 979-6100",
    "website": "cbre.com",
    "specialty": "Fannie/Freddie DUS, HUD, life company, CMBS, bridge. Full spectrum.",
    "lastVerified": "April 2026"
  },
  {
    "id": 5,
    "name": "Lument (formerly ORIX Real Estate Capital)",
    "type": "Agency/GSE",
    "logo": "\ud83c\udfdb",
    "minLoan": 1000000,
    "maxLoan": 500000000,
    "maxLTV": 80,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Affordable Housing",
      "Senior Housing",
      "Healthcare"
    ],
    "markets": "Nationwide",
    "rateRange": "5.85\u20137.20%",
    "term": "5,7,10,35yr",
    "amort": "30\u201335yr",
    "contact": "lument.com/contact",
    "phone": "(212) 543-7000",
    "website": "lument.com",
    "specialty": "Fannie/Freddie/HUD multifamily, senior housing, healthcare lending.",
    "lastVerified": "April 2026"
  },
  {
    "id": 6,
    "name": "MetLife Investment Management",
    "type": "Life Company",
    "logo": "\ud83c\udfe2",
    "minLoan": 10000000,
    "maxLoan": 500000000,
    "maxLTV": 65,
    "minDSCR": 1.3,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Retail",
      "Hotel"
    ],
    "markets": "Top 30 MSAs",
    "rateRange": "5.50\u20136.75%",
    "term": "10,15,20yr",
    "amort": "25\u201330yr",
    "contact": "metlife.com/institutional/strategies/real-estate",
    "phone": "(973) 355-4000",
    "website": "metlife.com",
    "specialty": "Core, core-plus stabilized assets. One of largest CRE debt investors in the US.",
    "lastVerified": "April 2026"
  },
  {
    "id": 7,
    "name": "PGIM Real Estate Finance (Prudential)",
    "type": "Life Company",
    "logo": "\ud83c\udfe2",
    "minLoan": 5000000,
    "maxLoan": 500000000,
    "maxLTV": 65,
    "minDSCR": 1.3,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Retail",
      "Hotel",
      "Self-Storage"
    ],
    "markets": "Top 50 MSAs",
    "rateRange": "5.55\u20136.80%",
    "term": "10,15,20yr",
    "amort": "25\u201330yr",
    "contact": "pgimrealestate.com/contact",
    "phone": "(973) 367-7521",
    "website": "pgimrealestate.com",
    "specialty": "Global institutional lender. Full capital stack across asset types.",
    "lastVerified": "April 2026"
  },
  {
    "id": 8,
    "name": "New York Life Real Estate Investors",
    "type": "Life Company",
    "logo": "\ud83c\udfe2",
    "minLoan": 5000000,
    "maxLoan": 300000000,
    "maxLTV": 65,
    "minDSCR": 1.3,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Retail"
    ],
    "markets": "Top 30 MSAs",
    "rateRange": "5.50\u20136.70%",
    "term": "10,15,20yr",
    "amort": "25\u201330yr",
    "contact": "newyorklifeinvestments.com",
    "phone": "(212) 576-7000",
    "website": "newyorklifeinvestments.com",
    "specialty": "Long-term fixed rate. Conservative underwriting. Core stabilized properties.",
    "lastVerified": "April 2026"
  },
  {
    "id": 9,
    "name": "Northwestern Mutual Real Estate",
    "type": "Life Company",
    "logo": "\ud83c\udfe2",
    "minLoan": 10000000,
    "maxLoan": 400000000,
    "maxLTV": 65,
    "minDSCR": 1.35,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Retail"
    ],
    "markets": "Top 25 MSAs",
    "rateRange": "5.45\u20136.65%",
    "term": "10,15,20yr",
    "amort": "25\u201330yr",
    "contact": "northwesternmutual.com/financial-professionals/real-estate",
    "phone": "(414) 271-1444",
    "website": "northwesternmutual.com",
    "specialty": "Conservative life company. Premier core assets only. Ultra-long term fixed.",
    "lastVerified": "April 2026"
  },
  {
    "id": 10,
    "name": "Principal Real Estate Investors",
    "type": "Life Company",
    "logo": "\ud83c\udfe2",
    "minLoan": 5000000,
    "maxLoan": 300000000,
    "maxLTV": 65,
    "minDSCR": 1.3,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Retail",
      "Hotel"
    ],
    "markets": "Top 50 MSAs",
    "rateRange": "5.60\u20136.85%",
    "term": "10,15,20yr",
    "amort": "25\u201330yr",
    "contact": "principalam.com/real-estate",
    "phone": "(515) 247-0920",
    "website": "principalam.com",
    "specialty": "Life company with full real estate debt platform.",
    "lastVerified": "April 2026"
  },
  {
    "id": 11,
    "name": "Pacific Life Real Estate Finance",
    "type": "Life Company",
    "logo": "\ud83c\udfe2",
    "minLoan": 5000000,
    "maxLoan": 200000000,
    "maxLTV": 65,
    "minDSCR": 1.3,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Retail"
    ],
    "markets": "Top 50 MSAs",
    "rateRange": "5.60\u20136.90%",
    "term": "10,15,20yr",
    "amort": "25\u201330yr",
    "contact": "pacificlife.com/corporate/contact-us",
    "phone": "(949) 219-3011",
    "website": "pacificlife.com",
    "specialty": "Life company CRE debt. Strong multifamily appetite. West Coast presence.",
    "lastVerified": "April 2026"
  },
  {
    "id": 12,
    "name": "Nuveen Real Estate (TIAA)",
    "type": "Life Company",
    "logo": "\ud83c\udfe2",
    "minLoan": 10000000,
    "maxLoan": 500000000,
    "maxLTV": 65,
    "minDSCR": 1.35,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Retail",
      "Hotel"
    ],
    "markets": "Top 25 MSAs",
    "rateRange": "5.45\u20136.60%",
    "term": "10,15,20yr",
    "amort": "25\u201330yr",
    "contact": "nuveen.com/real-estate",
    "phone": "(312) 917-8146",
    "website": "nuveen.com",
    "specialty": "TIAA-backed life company. Top-tier institutional CRE debt.",
    "lastVerified": "April 2026"
  },
  {
    "id": 13,
    "name": "JPMorgan Chase Commercial Real Estate",
    "type": "National Bank",
    "logo": "\ud83c\udfe6",
    "minLoan": 1000000,
    "maxLoan": 1000000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Hotel",
      "Mixed-Use"
    ],
    "markets": "Nationwide",
    "rateRange": "6.00\u20137.75%",
    "term": "3,5,7,10yr",
    "amort": "25\u201330yr",
    "contact": "jpmorgan.com/commercial-banking/real-estate",
    "phone": "(877) 425-8100",
    "website": "jpmorgan.com",
    "specialty": "Largest US bank by assets. Full CRE capital solutions. Balance sheet + conduit.",
    "lastVerified": "April 2026"
  },
  {
    "id": 14,
    "name": "Wells Fargo Commercial Real Estate",
    "type": "National Bank",
    "logo": "\ud83c\udfe6",
    "minLoan": 1000000,
    "maxLoan": 500000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Self-Storage"
    ],
    "markets": "Nationwide",
    "rateRange": "6.10\u20137.80%",
    "term": "3,5,7,10yr",
    "amort": "25\u201330yr",
    "contact": "wellsfargo.com/com/financing/commercial-real-estate",
    "phone": "(800) 869-3557",
    "website": "wellsfargo.com",
    "specialty": "Full-service CRE. Construction, bridge, permanent. Major DUS lender.",
    "lastVerified": "April 2026"
  },
  {
    "id": 15,
    "name": "Bank of America Commercial Real Estate",
    "type": "National Bank",
    "logo": "\ud83c\udfe6",
    "minLoan": 2000000,
    "maxLoan": 500000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Hotel",
      "Mixed-Use"
    ],
    "markets": "Nationwide",
    "rateRange": "6.00\u20137.70%",
    "term": "3,5,7,10yr",
    "amort": "25\u201330yr",
    "contact": "bofasecurities.com/investment-banking/real-estate.html",
    "phone": "(800) 432-1000",
    "website": "bankofamerica.com",
    "specialty": "Balance sheet lending. LIHTC, construction, perm. Strong institutional relationships.",
    "lastVerified": "April 2026"
  },
  {
    "id": 16,
    "name": "U.S. Bank Real Estate Finance",
    "type": "National Bank",
    "logo": "\ud83c\udfe6",
    "minLoan": 1000000,
    "maxLoan": 300000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Senior Housing"
    ],
    "markets": "Nationwide",
    "rateRange": "6.05\u20137.65%",
    "term": "3,5,7,10yr",
    "amort": "25\u201330yr",
    "contact": "usbank.com/business-banking/commercial-real-estate.html",
    "phone": "(800) 872-2657",
    "website": "usbank.com",
    "specialty": "Midwest and Western US focus. LIHTC, construction, permanent, bridge.",
    "lastVerified": "April 2026"
  },
  {
    "id": 17,
    "name": "PNC Real Estate",
    "type": "National Bank",
    "logo": "\ud83c\udfe6",
    "minLoan": 1000000,
    "maxLoan": 300000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Senior Housing"
    ],
    "markets": "Nationwide",
    "rateRange": "6.10\u20137.70%",
    "term": "3,5,7,10yr",
    "amort": "25\u201330yr",
    "contact": "pnc.com/en/commercial-banking/products/realestate.html",
    "phone": "(888) 762-2265",
    "website": "pnc.com",
    "specialty": "Full CRE capital stack. Strong Mid-Atlantic, Southeast, Midwest presence.",
    "lastVerified": "April 2026"
  },
  {
    "id": 18,
    "name": "Truist Real Estate Capital",
    "type": "National Bank",
    "logo": "\ud83c\udfe6",
    "minLoan": 1000000,
    "maxLoan": 300000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Affordable Housing"
    ],
    "markets": "Nationwide",
    "rateRange": "6.10\u20137.75%",
    "term": "3,5,7,10yr",
    "amort": "25\u201330yr",
    "contact": "truist.com/solutions/commercial/real-estate",
    "phone": "(800) 878-4782",
    "website": "truist.com",
    "specialty": "Former BB&T/SunTrust. Strong Southeast, Mid-Atlantic, Florida presence.",
    "lastVerified": "April 2026"
  },
  {
    "id": 19,
    "name": "KeyBank Real Estate Capital",
    "type": "National Bank",
    "logo": "\ud83c\udfe6",
    "minLoan": 1000000,
    "maxLoan": 300000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Affordable Housing",
      "Senior Housing"
    ],
    "markets": "Nationwide",
    "rateRange": "6.00\u20137.60%",
    "term": "3,5,7,10yr",
    "amort": "25\u201330yr",
    "contact": "key.com/business/industries/real-estate.jsp",
    "phone": "(888) 539-4247",
    "website": "key.com",
    "specialty": "Full-service CRE. Multifamily specialist. Strong Midwest, Pacific Northwest.",
    "lastVerified": "April 2026"
  },
  {
    "id": 20,
    "name": "Regions Real Estate Capital",
    "type": "National Bank",
    "logo": "\ud83c\udfe6",
    "minLoan": 1000000,
    "maxLoan": 200000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Hotel",
      "Mixed-Use"
    ],
    "markets": "Southeast, Midwest, Texas",
    "rateRange": "6.10\u20137.70%",
    "term": "3,5,7,10yr",
    "amort": "25\u201330yr",
    "contact": "regions.com/commercial-banking/real-estate",
    "phone": "(800) 734-4667",
    "website": "regions.com",
    "specialty": "Southeast and South-Central US specialist. Deep local market knowledge.",
    "lastVerified": "April 2026"
  },
  {
    "id": 21,
    "name": "Starwood Mortgage Capital",
    "type": "CMBS",
    "logo": "\ud83d\udcca",
    "minLoan": 3000000,
    "maxLoan": 500000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Office",
      "Retail",
      "Hotel",
      "Industrial",
      "Multifamily",
      "Mixed-Use"
    ],
    "markets": "Nationwide",
    "rateRange": "6.40\u20137.50%",
    "term": "10yr",
    "amort": "30yr",
    "contact": "starwood.com/realestate/contact.html",
    "phone": "(305) 695-6300",
    "website": "starwood.com",
    "specialty": "Major CMBS conduit lender. Non-recourse 10yr fixed. Full property spectrum.",
    "lastVerified": "April 2026"
  },
  {
    "id": 22,
    "name": "Goldman Sachs Real Estate Finance",
    "type": "CMBS",
    "logo": "\ud83d\udcca",
    "minLoan": 10000000,
    "maxLoan": 2000000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Office",
      "Retail",
      "Hotel",
      "Industrial",
      "Multifamily",
      "Mixed-Use"
    ],
    "markets": "Nationwide",
    "rateRange": "6.20\u20137.25%",
    "term": "10yr",
    "amort": "30yr",
    "contact": "goldmansachs.com/businesses/invest-manage/real-estate",
    "phone": "(212) 902-1000",
    "website": "goldmansachs.com",
    "specialty": "Institutional CMBS. Major deals, trophy assets. Full capital stack.",
    "lastVerified": "April 2026"
  },
  {
    "id": 23,
    "name": "Morgan Stanley Real Estate",
    "type": "CMBS",
    "logo": "\ud83d\udcca",
    "minLoan": 5000000,
    "maxLoan": 1000000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Office",
      "Retail",
      "Hotel",
      "Industrial",
      "Multifamily",
      "Mixed-Use"
    ],
    "markets": "Nationwide",
    "rateRange": "6.25\u20137.30%",
    "term": "10yr",
    "amort": "30yr",
    "contact": "morganstanley.com/im/real-estate",
    "phone": "(212) 761-4000",
    "website": "morganstanley.com",
    "specialty": "Global CMBS issuance. Institutional-grade properties and sponsors.",
    "lastVerified": "April 2026"
  },
  {
    "id": 24,
    "name": "Citigroup Commercial Mortgage Trust",
    "type": "CMBS",
    "logo": "\ud83d\udcca",
    "minLoan": 5000000,
    "maxLoan": 500000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Office",
      "Retail",
      "Hotel",
      "Industrial",
      "Multifamily",
      "Mixed-Use"
    ],
    "markets": "Nationwide",
    "rateRange": "6.30\u20137.35%",
    "term": "10yr",
    "amort": "30yr",
    "contact": "citibank.com/commercial-mortgage",
    "phone": "(212) 559-1000",
    "website": "citi.com",
    "specialty": "Top-tier CMBS conduit. Full loan-to-securitization platform.",
    "lastVerified": "April 2026"
  },
  {
    "id": 25,
    "name": "Rialto Mortgage Finance",
    "type": "CMBS",
    "logo": "\ud83d\udcca",
    "minLoan": 2000000,
    "maxLoan": 150000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Office",
      "Retail",
      "Hotel",
      "Industrial",
      "Multifamily",
      "Mixed-Use",
      "Self-Storage"
    ],
    "markets": "Nationwide",
    "rateRange": "6.45\u20137.55%",
    "term": "10yr",
    "amort": "30yr",
    "contact": "rialtomortgage.com",
    "phone": "(305) 485-2060",
    "website": "rialtomortgage.com",
    "specialty": "Conduit specialist. Broad property type coverage. Competitive non-recourse pricing.",
    "lastVerified": "April 2026"
  },
  {
    "id": 26,
    "name": "Blackstone Real Estate Debt Strategies",
    "type": "Debt Fund",
    "logo": "\ud83d\udcbc",
    "minLoan": 10000000,
    "maxLoan": 5000000000,
    "maxLTV": 80,
    "minDSCR": 1.15,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Retail",
      "Self-Storage"
    ],
    "markets": "Nationwide",
    "rateRange": "7.00\u201310.00%",
    "term": "1\u20135yr",
    "amort": "Interest only",
    "contact": "blackstone.com/businesses/breds",
    "phone": "(212) 583-5000",
    "website": "blackstone.com",
    "specialty": "World's largest alternative asset manager. Bridge, transitional, value-add at scale.",
    "lastVerified": "April 2026"
  },
  {
    "id": 27,
    "name": "Starwood Property Trust",
    "type": "Debt Fund",
    "logo": "\ud83d\udcbc",
    "minLoan": 10000000,
    "maxLoan": 1000000000,
    "maxLTV": 80,
    "minDSCR": 1.15,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Retail"
    ],
    "markets": "Nationwide",
    "rateRange": "7.25\u201310.50%",
    "term": "1\u20135yr",
    "amort": "Interest only",
    "contact": "starwoodpropertytrust.com",
    "phone": "(203) 422-8000",
    "website": "starwoodpropertytrust.com",
    "specialty": "Large commercial mortgage REIT. Senior and mezzanine debt.",
    "lastVerified": "April 2026"
  },
  {
    "id": 28,
    "name": "ACORE Capital",
    "type": "Debt Fund",
    "logo": "\ud83d\udcbc",
    "minLoan": 10000000,
    "maxLoan": 500000000,
    "maxLTV": 80,
    "minDSCR": 1.1,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Retail",
      "Self-Storage"
    ],
    "markets": "Nationwide",
    "rateRange": "7.50\u201310.50%",
    "term": "1\u20134yr",
    "amort": "Interest only",
    "contact": "acorecapital.com/contact",
    "phone": "(855) 226-7300",
    "website": "acorecapital.com",
    "specialty": "Bridge and transitional lending specialist. $20B+ in originations.",
    "lastVerified": "April 2026"
  },
  {
    "id": 29,
    "name": "Arbor Realty Trust",
    "type": "Debt Fund",
    "logo": "\ud83d\udcbc",
    "minLoan": 1000000,
    "maxLoan": 500000000,
    "maxLTV": 80,
    "minDSCR": 1.2,
    "propTypes": [
      "Multifamily",
      "Self-Storage",
      "Mobile Home Park",
      "Single-Family Rental"
    ],
    "markets": "Nationwide",
    "rateRange": "6.50\u20139.50%",
    "term": "1\u201310yr",
    "amort": "Varies",
    "contact": "arborrealtytrust.com/contact",
    "phone": "(516) 506-4200",
    "website": "arborrealtytrust.com",
    "specialty": "Multifamily REIT. Fannie/Freddie/HUD + bridge. Major small-balance MF lender.",
    "lastVerified": "April 2026"
  },
  {
    "id": 30,
    "name": "Ladder Capital",
    "type": "Debt Fund",
    "logo": "\ud83d\udcbc",
    "minLoan": 2000000,
    "maxLoan": 500000000,
    "maxLTV": 80,
    "minDSCR": 1.2,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Hotel",
      "Retail",
      "Mixed-Use",
      "Self-Storage"
    ],
    "markets": "Nationwide",
    "rateRange": "6.75\u20139.25%",
    "term": "1\u201310yr",
    "amort": "Varies",
    "contact": "laddercapital.com/contact",
    "phone": "(212) 715-2000",
    "website": "laddercapital.com",
    "specialty": "Commercial mortgage REIT. Balance sheet loans + CMBS. Broad appetite.",
    "lastVerified": "April 2026"
  },
  {
    "id": 31,
    "name": "Ready Capital Corporation",
    "type": "Debt Fund",
    "logo": "\ud83d\udcbc",
    "minLoan": 1000000,
    "maxLoan": 100000000,
    "maxLTV": 80,
    "minDSCR": 1.2,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Mixed-Use",
      "Self-Storage"
    ],
    "markets": "Nationwide",
    "rateRange": "7.00\u201310.00%",
    "term": "1\u20135yr",
    "amort": "Interest only/30yr",
    "contact": "readycapital.com/contact",
    "phone": "(212) 257-4600",
    "website": "readycapital.com",
    "specialty": "Small and middle market CRE lender. SBA 7(a) + bridge + permanent.",
    "lastVerified": "April 2026"
  },
  {
    "id": 32,
    "name": "KKR Real Estate Finance Trust",
    "type": "Debt Fund",
    "logo": "\ud83d\udcbc",
    "minLoan": 10000000,
    "maxLoan": 1000000000,
    "maxLTV": 80,
    "minDSCR": 1.15,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Retail"
    ],
    "markets": "Nationwide",
    "rateRange": "7.25\u201310.00%",
    "term": "1\u20135yr",
    "amort": "Interest only",
    "contact": "kkr.com/businesses/real-estate",
    "phone": "(212) 750-8300",
    "website": "kkr.com",
    "specialty": "KKR-sponsored mortgage REIT. Floating-rate senior loans on transitional assets.",
    "lastVerified": "April 2026"
  },
  {
    "id": 33,
    "name": "Mesa West Capital (Morgan Stanley)",
    "type": "Debt Fund",
    "logo": "\ud83d\udcbc",
    "minLoan": 15000000,
    "maxLoan": 500000000,
    "maxLTV": 75,
    "minDSCR": 1.2,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Retail"
    ],
    "markets": "Nationwide",
    "rateRange": "7.00\u20139.50%",
    "term": "2\u20135yr",
    "amort": "Interest only",
    "contact": "morganstanley.com/im/real-estate",
    "phone": "(213) 615-4000",
    "website": "morganstanley.com",
    "specialty": "Institutional bridge lender backed by Morgan Stanley. Value-add specialist.",
    "lastVerified": "April 2026"
  },
  {
    "id": 34,
    "name": "Benefit Street Partners",
    "type": "Debt Fund",
    "logo": "\ud83d\udcbc",
    "minLoan": 5000000,
    "maxLoan": 250000000,
    "maxLTV": 80,
    "minDSCR": 1.15,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Retail",
      "Self-Storage"
    ],
    "markets": "Nationwide",
    "rateRange": "7.25\u201310.50%",
    "term": "1\u20134yr",
    "amort": "Interest only",
    "contact": "benefitstreetpartners.com",
    "phone": "(212) 588-6700",
    "website": "benefitstreetpartners.com",
    "specialty": "Franklin Templeton-affiliated. Bridge loans, transitional, value-add.",
    "lastVerified": "April 2026"
  },
  {
    "id": 35,
    "name": "Ares Real Estate Finance",
    "type": "Debt Fund",
    "logo": "\ud83d\udcbc",
    "minLoan": 10000000,
    "maxLoan": 500000000,
    "maxLTV": 80,
    "minDSCR": 1.15,
    "propTypes": [
      "Multifamily",
      "Office",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Retail"
    ],
    "markets": "Nationwide",
    "rateRange": "7.00\u201310.00%",
    "term": "1\u20135yr",
    "amort": "Interest only",
    "contact": "aresmgmt.com/real-estate",
    "phone": "(310) 201-4100",
    "website": "aresmgmt.com",
    "specialty": "$40B+ AUM real estate platform. Senior and subordinate debt.",
    "lastVerified": "April 2026"
  },
  {
    "id": 36,
    "name": "Broadmark Realty Capital",
    "type": "Bridge",
    "logo": "\u26a1",
    "minLoan": 500000,
    "maxLoan": 50000000,
    "maxLTV": 75,
    "minDSCR": 1,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Mixed-Use",
      "Hotel",
      "Land"
    ],
    "markets": "Western US, TX, CO, FL",
    "rateRange": "10.00\u201313.00%",
    "term": "6\u201324 months",
    "amort": "Interest only",
    "contact": "broadmark.com/contact",
    "phone": "(206) 728-2600",
    "website": "broadmark.com",
    "specialty": "Short-term bridge and construction. Western US focus. Fast close.",
    "lastVerified": "April 2026"
  },
  {
    "id": 37,
    "name": "Lima One Capital",
    "type": "Bridge",
    "logo": "\u26a1",
    "minLoan": 75000,
    "maxLoan": 20000000,
    "maxLTV": 75,
    "minDSCR": 1,
    "propTypes": [
      "Multifamily",
      "Single-Family Rental",
      "Mixed-Use"
    ],
    "markets": "Nationwide (40+ states)",
    "rateRange": "9.50\u201313.50%",
    "term": "6\u201324 months",
    "amort": "Interest only",
    "contact": "limaone.com/contact",
    "phone": "(800) 390-4212",
    "website": "limaone.com",
    "specialty": "Rental portfolio, fix-and-flip, new construction. Fast underwriting.",
    "lastVerified": "April 2026"
  },
  {
    "id": 38,
    "name": "RCN Capital",
    "type": "Bridge",
    "logo": "\u26a1",
    "minLoan": 50000,
    "maxLoan": 5000000,
    "maxLTV": 85,
    "minDSCR": 1,
    "propTypes": [
      "Multifamily",
      "Single-Family Rental",
      "Mixed-Use"
    ],
    "markets": "Nationwide (44 states)",
    "rateRange": "9.00\u201312.50%",
    "term": "12\u201324 months",
    "amort": "Interest only",
    "contact": "rcncapital.com/contact-us",
    "phone": "(860) 432-5858",
    "website": "rcncapital.com",
    "specialty": "Fix-and-flip, rental, new construction. Competitive rates. Fast funding.",
    "lastVerified": "April 2026"
  },
  {
    "id": 39,
    "name": "Kiavi (formerly LendingHome)",
    "type": "Bridge",
    "logo": "\u26a1",
    "minLoan": 100000,
    "maxLoan": 3000000,
    "maxLTV": 85,
    "minDSCR": 1,
    "propTypes": [
      "Single-Family Rental",
      "Multifamily"
    ],
    "markets": "Nationwide (32 states)",
    "rateRange": "9.00\u201313.00%",
    "term": "12\u201324 months",
    "amort": "Interest only",
    "contact": "kiavi.com/contact",
    "phone": "(888) 508-4212",
    "website": "kiavi.com",
    "specialty": "Tech-driven bridge lender. Fast approval. Rental and fix-and-flip.",
    "lastVerified": "April 2026"
  },
  {
    "id": 40,
    "name": "CoreVest Finance",
    "type": "Bridge",
    "logo": "\u26a1",
    "minLoan": 500000,
    "maxLoan": 100000000,
    "maxLTV": 75,
    "minDSCR": 1.2,
    "propTypes": [
      "Multifamily",
      "Single-Family Rental",
      "Mobile Home Park",
      "Self-Storage"
    ],
    "markets": "Nationwide",
    "rateRange": "7.50\u201310.50%",
    "term": "1\u20135yr",
    "amort": "30yr/IO",
    "contact": "corevestfinance.com/contact",
    "phone": "(888) 585-5636",
    "website": "corevestfinance.com",
    "specialty": "Rental portfolio aggregator. SFR, small MF, BTR communities.",
    "lastVerified": "April 2026"
  },
  {
    "id": 41,
    "name": "Live Oak Bank (SBA)",
    "type": "SBA Lender",
    "logo": "\ud83c\udf3f",
    "minLoan": 150000,
    "maxLoan": 5000000,
    "maxLTV": 90,
    "minDSCR": 1.15,
    "propTypes": [
      "Office",
      "Retail",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Self-Storage"
    ],
    "markets": "Nationwide",
    "rateRange": "Prime+2.25\u20132.75%",
    "term": "10\u201325yr",
    "amort": "25yr",
    "contact": "liveoakbank.com/contact",
    "phone": "(910) 202-8011",
    "website": "liveoakbank.com",
    "specialty": "Top SBA 7(a) lender. Owner-occupied CRE up to 90% LTV. No balloon.",
    "lastVerified": "April 2026"
  },
  {
    "id": 42,
    "name": "Celtic Bank (SBA)",
    "type": "SBA Lender",
    "logo": "\ud83c\udf3f",
    "minLoan": 250000,
    "maxLoan": 5000000,
    "maxLTV": 90,
    "minDSCR": 1.15,
    "propTypes": [
      "Office",
      "Retail",
      "Industrial",
      "Hotel",
      "Mixed-Use",
      "Self-Storage"
    ],
    "markets": "Nationwide",
    "rateRange": "Prime+2.25\u20132.75%",
    "term": "10\u201325yr",
    "amort": "25yr",
    "contact": "celticbank.com/business/sba-loans",
    "phone": "(877) 212-6228",
    "website": "celticbank.com",
    "specialty": "SBA 7(a) and 504 nationwide. Preferred lender status. Owner-occupied CRE.",
    "lastVerified": "April 2026"
  },
  {
    "id": 43,
    "name": "Harvest Small Business Finance (SBA 504)",
    "type": "SBA Lender",
    "logo": "\ud83c\udf3f",
    "minLoan": 500000,
    "maxLoan": 20000000,
    "maxLTV": 90,
    "minDSCR": 1.15,
    "propTypes": [
      "Office",
      "Retail",
      "Industrial",
      "Mixed-Use",
      "Hotel"
    ],
    "markets": "Nationwide",
    "rateRange": "6.00\u20137.50%",
    "term": "10\u201325yr",
    "amort": "25yr",
    "contact": "harvestsbf.com/contact",
    "phone": "(888) 975-2922",
    "website": "harvestsbf.com",
    "specialty": "SBA 504 CDC. Long-term fixed rate. Owner-occupied CRE up to 90% LTV.",
    "lastVerified": "April 2026"
  },
  {
    "id": 44,
    "name": "Alaska USA Federal Credit Union",
    "type": "Credit Union",
    "logo": "\u2728",
    "minLoan": 100000,
    "maxLoan": 15000000,
    "maxLTV": 80,
    "minDSCR": 1.2,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Mixed-Use"
    ],
    "markets": "AK, WA, CA, AZ",
    "rateRange": "6.00\u20137.50%",
    "term": "5,7,10yr",
    "amort": "20\u201325yr",
    "contact": "alaskausa.org/business/loans",
    "phone": "(907) 563-4567",
    "website": "alaskausa.org",
    "specialty": "Alaska's largest credit union. CRE and business loans. Strong Alaska market knowledge.",
    "lastVerified": "April 2026"
  },
  {
    "id": 45,
    "name": "Navy Federal Credit Union (Business)",
    "type": "Credit Union",
    "logo": "\u2728",
    "minLoan": 250000,
    "maxLoan": 10000000,
    "maxLTV": 80,
    "minDSCR": 1.2,
    "propTypes": [
      "Office",
      "Retail",
      "Industrial",
      "Mixed-Use",
      "Multifamily"
    ],
    "markets": "Nationwide (military-affiliated)",
    "rateRange": "6.00\u20137.75%",
    "term": "5,7,10yr",
    "amort": "20\u201325yr",
    "contact": "navyfederal.org/business/loans/commercial-real-estate",
    "phone": "(888) 842-6328",
    "website": "navyfederal.org",
    "specialty": "Military-community focused. Owner-occupied CRE. Nationwide access.",
    "lastVerified": "April 2026"
  },
  {
    "id": 46,
    "name": "Northrim Bank (Alaska)",
    "type": "Community Bank",
    "logo": "\ud83c\udfd4",
    "minLoan": 100000,
    "maxLoan": 20000000,
    "maxLTV": 80,
    "minDSCR": 1.2,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Mixed-Use",
      "Hotel"
    ],
    "markets": "Alaska",
    "rateRange": "6.25\u20137.75%",
    "term": "5,7,10yr",
    "amort": "20\u201325yr",
    "contact": "northrim.com/business/commercial-real-estate-loans",
    "phone": "(907) 562-0062",
    "website": "northrim.com",
    "specialty": "Alaska's community bank. Deep statewide relationships. CRE across all AK markets.",
    "lastVerified": "April 2026"
  },
  {
    "id": 47,
    "name": "First National Bank Alaska",
    "type": "Community Bank",
    "logo": "\ud83c\udfd4",
    "minLoan": 100000,
    "maxLoan": 25000000,
    "maxLTV": 80,
    "minDSCR": 1.2,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Mixed-Use",
      "Hotel",
      "Construction"
    ],
    "markets": "Alaska",
    "rateRange": "6.25\u20137.75%",
    "term": "5,7,10yr",
    "amort": "20\u201325yr",
    "contact": "fnbalaska.com/business/loans",
    "phone": "(907) 777-4362",
    "website": "fnbalaska.com",
    "specialty": "Alaska's oldest bank. Full CRE platform. Construction, permanent, bridge.",
    "lastVerified": "April 2026"
  },
  {
    "id": 48,
    "name": "Pacific Premier Bank",
    "type": "Regional Bank",
    "logo": "\ud83c\udfe6",
    "minLoan": 500000,
    "maxLoan": 50000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Mixed-Use",
      "Self-Storage"
    ],
    "markets": "CA, WA, OR, AZ, NV, CO",
    "rateRange": "6.25\u20137.75%",
    "term": "5,7,10yr",
    "amort": "25yr",
    "contact": "pacificpremierbank.com/business/commercial-real-estate",
    "phone": "(855) 800-4722",
    "website": "pacificpremierbank.com",
    "specialty": "West Coast regional. Full CRE spectrum. Strong California multifamily book.",
    "lastVerified": "April 2026"
  },
  {
    "id": 49,
    "name": "Western Alliance Bank",
    "type": "Regional Bank",
    "logo": "\ud83c\udfe6",
    "minLoan": 1000000,
    "maxLoan": 100000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Hotel",
      "Mixed-Use"
    ],
    "markets": "AZ, CA, CO, NV, TX, WA, OR",
    "rateRange": "6.25\u20137.75%",
    "term": "3,5,7,10yr",
    "amort": "25\u201330yr",
    "contact": "westernalliancebancorporation.com/commercial-banking/real-estate",
    "phone": "(602) 389-3500",
    "website": "westernalliancebancorporation.com",
    "specialty": "Sun Belt specialist. Construction and perm. Strong hospitality and MF verticals.",
    "lastVerified": "April 2026"
  },
  {
    "id": 50,
    "name": "Glacier Bancorp",
    "type": "Regional Bank",
    "logo": "\ud83c\udfd4",
    "minLoan": 100000,
    "maxLoan": 30000000,
    "maxLTV": 80,
    "minDSCR": 1.2,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Mixed-Use",
      "Hotel"
    ],
    "markets": "MT, ID, WY, CO, UT, WA, AK, AZ, NV",
    "rateRange": "6.25\u20137.75%",
    "term": "5,7,10yr",
    "amort": "20\u201325yr",
    "contact": "glacierbancorp.com/business-banking/commercial-real-estate",
    "phone": "(406) 756-4200",
    "website": "glacierbancorp.com",
    "specialty": "Mountain West regional. Deep community relationships. Alaska and Northwest focus.",
    "lastVerified": "April 2026"
  },
  {
    "id": 51,
    "name": "Columbia Bank (Pacific Northwest)",
    "type": "Regional Bank",
    "logo": "\ud83c\udfe6",
    "minLoan": 250000,
    "maxLoan": 50000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Mixed-Use",
      "Hotel",
      "Self-Storage"
    ],
    "markets": "WA, OR, CA, ID",
    "rateRange": "6.25\u20137.75%",
    "term": "5,7,10yr",
    "amort": "25yr",
    "contact": "columbiabank.com/business/loans/commercial-real-estate",
    "phone": "(877) 272-3678",
    "website": "columbiabank.com",
    "specialty": "Pacific NW specialist. Construction and perm. Strong WA/OR multifamily.",
    "lastVerified": "April 2026"
  },
  {
    "id": 52,
    "name": "HomeStreet Bank",
    "type": "Regional Bank",
    "logo": "\ud83c\udfe6",
    "minLoan": 500000,
    "maxLoan": 75000000,
    "maxLTV": 75,
    "minDSCR": 1.25,
    "propTypes": [
      "Multifamily",
      "Office",
      "Retail",
      "Industrial",
      "Mixed-Use",
      "Hotel"
    ],
    "markets": "WA, OR, CA, HI, ID, MT, AK",
    "rateRange": "6.25\u20137.75%",
    "term": "3,5,7,10yr",
    "amort": "25\u201330yr",
    "contact": "homestreet.com/commercial-real-estate",
    "phone": "(800) 719-8080",
    "website": "homestreet.com",
    "specialty": "Pacific NW/West Coast. Agency multifamily + balance sheet. Hawaii and Alaska deals.",
    "lastVerified": "April 2026"
  }
];

// The schema migration SQL
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS cre_lenders (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  logo TEXT,
  min_loan BIGINT,
  max_loan BIGINT,
  max_ltv NUMERIC(5,2),
  min_dscr NUMERIC(4,2),
  prop_types TEXT[],
  markets TEXT,
  rate_range TEXT,
  term TEXT,
  amort TEXT,
  contact TEXT,
  phone TEXT,
  website TEXT,
  specialty TEXT,
  notes TEXT,
  last_verified TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cre_lenders_type ON cre_lenders(type);
CREATE INDEX IF NOT EXISTS idx_cre_lenders_active ON cre_lenders(active);
ALTER TABLE cre_lenders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cre_lenders_public_read ON cre_lenders;
CREATE POLICY cre_lenders_public_read ON cre_lenders FOR SELECT USING (active = true);
DROP POLICY IF EXISTS cre_lenders_service_write ON cre_lenders;
CREATE POLICY cre_lenders_service_write ON cre_lenders FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS cre_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  deal_name TEXT,
  property_type TEXT,
  address TEXT, city TEXT, state TEXT, zip TEXT,
  units INTEGER, sqft INTEGER, year_built INTEGER,
  purchase_price BIGINT, noi BIGINT,
  ltv NUMERIC(5,2), dscr NUMERIC(4,2), cap_rate NUMERIC(5,2),
  loan_purpose TEXT, loan_amount BIGINT,
  rate NUMERIC(5,3), term_years INTEGER, amort_years INTEGER,
  sponsor_name TEXT, sponsor_experience TEXT,
  status TEXT DEFAULT 'draft',
  apex_score INTEGER,
  ai_analysis JSONB, matched_lenders JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cre_deals_user_id ON cre_deals(user_id);
ALTER TABLE cre_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cre_deals_owner_all ON cre_deals;
CREATE POLICY cre_deals_owner_all ON cre_deals FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS cre_market_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_at TIMESTAMPTZ DEFAULT NOW(),
  t10y NUMERIC(5,2), t5y NUMERIC(5,2), t2y NUMERIC(5,2),
  sofr NUMERIC(5,2), effr NUMERIC(5,2), prime NUMERIC(5,2),
  source TEXT, raw_json JSONB
);
CREATE INDEX IF NOT EXISTS idx_cre_market_snapshot_at ON cre_market_snapshots(snapshot_at DESC);
ALTER TABLE cre_market_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cre_market_public_read ON cre_market_snapshots;
CREATE POLICY cre_market_public_read ON cre_market_snapshots FOR SELECT USING (true);
DROP POLICY IF EXISTS cre_market_service_write ON cre_market_snapshots;
CREATE POLICY cre_market_service_write ON cre_market_snapshots FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS cre_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  company TEXT, prop_type TEXT, state TEXT, city TEXT,
  loan_amount BIGINT, orig_lender TEXT, orig_year INTEGER,
  orig_rate NUMERIC(5,2), rate_gap NUMERIC(5,2),
  opp_type TEXT, refi_score INTEGER, priority TEXT,
  source TEXT DEFAULT 'hmda_simulator',
  hmda_lei TEXT,
  stage TEXT DEFAULT 'new', notes TEXT,
  last_contacted TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cre_prospects_user_id ON cre_prospects(user_id);
ALTER TABLE cre_prospects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cre_prospects_owner_all ON cre_prospects;
CREATE POLICY cre_prospects_owner_all ON cre_prospects FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION cre_set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS cre_lenders_updated ON cre_lenders;
CREATE TRIGGER cre_lenders_updated BEFORE UPDATE ON cre_lenders FOR EACH ROW EXECUTE FUNCTION cre_set_updated_at();
DROP TRIGGER IF EXISTS cre_deals_updated ON cre_deals;
CREATE TRIGGER cre_deals_updated BEFORE UPDATE ON cre_deals FOR EACH ROW EXECUTE FUNCTION cre_set_updated_at();
DROP TRIGGER IF EXISTS cre_prospects_updated ON cre_prospects;
CREATE TRIGGER cre_prospects_updated BEFORE UPDATE ON cre_prospects FOR EACH ROW EXECUTE FUNCTION cre_set_updated_at();
`;

// Try to ensure exec_sql helper exists (created once, stays for future migrations)
async function ensureExecSql() {
  // Use the Supabase SQL API via direct REST to pg
  // This tries to run DDL via a workaround — we'll use the REST endpoint for the exec_sql function if it exists
  // If it doesn't exist, we return a helpful error and the user can create it manually once
  return true;
}

async function runSqlViaRpc(sql) {
  // Call the exec_sql RPC if it exists
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  return { status: r.status, text: await r.text() };
}

async function seedLenders() {
  const payload = LENDERS_SEED.map(l => ({
    id: l.id,
    name: l.name,
    type: l.type,
    logo: l.logo || null,
    min_loan: l.minLoan || null,
    max_loan: l.maxLoan || null,
    max_ltv: l.maxLTV || null,
    min_dscr: l.minDSCR || null,
    prop_types: l.propTypes || [],
    markets: l.markets || null,
    rate_range: l.rateRange || null,
    term: l.term || null,
    amort: l.amort || null,
    contact: l.contact || null,
    phone: l.phone || null,
    website: l.website || null,
    specialty: l.specialty || null,
    notes: l.notes || null,
    last_verified: l.lastVerified || 'April 2026',
    active: true,
  }));

  const r = await fetch(`${SUPABASE_URL}/rest/v1/cre_lenders?on_conflict=id`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  return { status: r.status, seeded: r.ok ? payload.length : 0, body: text.slice(0, 500) };
}

export default async function handler(req, res) {
  if (req.query.key !== 'migrate_2026_04_17') return res.status(403).json({ error: 'forbidden' });

  const results = { steps: [] };

  // Step 1: Try to run schema SQL via RPC
  const ddl = await runSqlViaRpc(SCHEMA_SQL);
  results.steps.push({ step: 'schema', ...ddl });

  // Step 2: If schema creation succeeded (or already existed), seed lenders
  // First check if table exists by querying it
  const check = await fetch(`${SUPABASE_URL}/rest/v1/cre_lenders?select=count`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Prefer': 'count=exact', 'Range': '0-0' },
  });
  results.steps.push({ step: 'check_table', status: check.status, range: check.headers.get('content-range') });

  if (check.ok) {
    const seed = await seedLenders();
    results.steps.push({ step: 'seed_lenders', ...seed });
  } else {
    results.steps.push({
      step: 'seed_skipped',
      reason: 'cre_lenders table not accessible — exec_sql RPC likely missing',
      manual_fix: 'Run this in Supabase SQL editor: CREATE OR REPLACE FUNCTION public.exec_sql(query text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN EXECUTE query; END; $$;',
    });
  }

  return res.status(200).json(results);
}
