const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const sb = async (path, opts = {}) => {
  const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...opts,
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || 'return=representation',
      ...(opts.headers || {}),
    },
  });
  if (opts.countOnly) {
    const range = r.headers.get('content-range');
    return { count: range ? parseInt(range.split('/')[1]) || 0 : 0 };
  }
  return r.json();
};

// HMDA-based prospect data generator for CRE capital finder use case
function generateHMDAProspects({ propType, state, minLoan, maxLoan, year, count = 20 }) {
  const stateCities = {
    AK: ['Anchorage','Fairbanks','Juneau','Wasilla','Palmer','Kenai','Kodiak','Bethel','Soldotna'],
    WA: ['Seattle','Tacoma','Spokane','Bellevue','Kirkland','Redmond','Olympia','Vancouver','Bellingham'],
    OR: ['Portland','Eugene','Salem','Bend','Hillsboro','Beaverton','Medford','Corvallis'],
    CA: ['Los Angeles','San Diego','San Jose','San Francisco','Fresno','Sacramento','Long Beach','Oakland'],
    TX: ['Dallas','Houston','Austin','San Antonio','Fort Worth','El Paso','Arlington','Plano'],
    FL: ['Miami','Tampa','Orlando','Jacksonville','Fort Lauderdale','Tallahassee','St. Petersburg'],
    CO: ['Denver','Colorado Springs','Aurora','Fort Collins','Lakewood','Boulder','Westminster'],
    AZ: ['Phoenix','Tucson','Mesa','Chandler','Scottsdale','Gilbert','Tempe','Surprise'],
    NY: ['New York City','Buffalo','Rochester','Albany','Yonkers','Syracuse','New Rochelle'],
    GA: ['Atlanta','Augusta','Columbus','Macon','Savannah','Athens','Sandy Springs'],
    NC: ['Charlotte','Raleigh','Greensboro','Durham','Winston-Salem','Fayetteville'],
    MT: ['Billings','Missoula','Great Falls','Bozeman','Butte','Helena','Kalispell'],
    ID: ['Boise','Nampa','Meridian','Idaho Falls','Pocatello','Twin Falls','Coeur d\'Alene'],
  };

  const lendersByType = {
    Agency: ['Fannie Mae (DUS)','Freddie Mac','Berkadia','Walker & Dunlop','Greystone'],
    National: ['Wells Fargo','JPMorgan Chase','Bank of America','U.S. Bank','PNC Bank','KeyBank'],
    Regional: ['Pacific Premier Bank','Western Alliance','HomeStreet Bank','Columbia Bank','Northrim Bank'],
    CMBS: ['DBRS Conduit','Citigroup CMBS','Goldman Sachs','Morgan Stanley CMBS','Rialto'],
    Bridge: ['Mesa West','ACORE Capital','Arbor Realty','Ready Capital','CoreVest Finance'],
    SBA: ['Live Oak Bank','Celtic Bank','U.S. Small Business Administration'],
    Local: ['First National Bank Alaska','Alaska USA FCU','Credit Union 1','Matanuska Valley FCU'],
  };

  const allLenders = Object.values(lendersByType).flat();

  const bizTypes = ['LLC','LP','Partners','Holdings','Capital','Properties','Group','Investments','Ventures','Fund'];
  const bizPrefixes = ['Summit','Pacific','Northern','Alpine','Denali','Cascade','Pioneer','Heritage','Frontier',
    'Landmark','Premier','Horizon','Gateway','Mesa','Ridge','Valley','Harbor','Anchor','Eagle','Arctic',
    'Midnight Sun','Peak','Meridian','Keystone','Clearwater','BlueSky','Coastal','Metro','Prime'];

  const propTypes = propType === 'All' ? ['Multifamily','Office','Retail','Industrial','Hotel','Self-Storage','Mixed-Use'] : [propType];

  const min = parseFloat(minLoan) || 500000;
  const max = parseFloat(maxLoan) || 5000000;
  const cities = stateCities[state] || stateCities['AK'];

  const rateByYear = { '2017':4.2,'2018':4.8,'2019':4.1,'2020':3.5,'2021':3.2,'2022':5.8,'2023':7.1,'2024':6.9 };
  const origRate = rateByYear[year] || 6.5;
  const marketRate = 6.85;
  const rateGap = parseFloat((marketRate - origRate).toFixed(2));

  const prospects = Array.from({ length: count }, (_, i) => {
    const prefix = bizPrefixes[Math.floor(Math.random() * bizPrefixes.length)];
    const prefix2 = bizPrefixes[Math.floor(Math.random() * bizPrefixes.length)];
    const bizType = bizTypes[Math.floor(Math.random() * bizTypes.length)];
    const companyName = `${prefix} ${prefix2} ${bizType}`;

    const pType = propTypes[i % propTypes.length];
    const city = cities[i % cities.length];
    const loanAmt = Math.round((min + Math.random() * (max - min)) / 50000) * 50000;
    const lender = allLenders[Math.floor(Math.random() * allLenders.length)];

    // Refi opportunity score: loan age, rate gap, loan size
    const loanAgeFactor = parseInt(year) <= 2022 ? 30 : 10;
    const rateFactor = rateGap > 0 ? Math.min(rateGap * 8, 25) : 0; // refis make sense when orig rate < current
    const sizeFactor = loanAmt >= 2000000 ? 20 : loanAmt >= 1000000 ? 15 : 10;
    const typeBonus = ['Multifamily','Industrial'].includes(pType) ? 10 : 5;
    const refiScore = Math.min(Math.round(loanAgeFactor + Math.abs(rateFactor) + sizeFactor + typeBonus + Math.random() * 10), 100);

    // Priority tier
    const priority = refiScore >= 70 ? 'Hot' : refiScore >= 50 ? 'Warm' : 'Cold';

    // Opportunity type
    const oppType = rateGap < 0 ? 'Rate Reduction' : parseInt(year) <= 2021 ? 'Maturity Risk / Refi' : parseInt(year) <= 2022 ? 'Rate & Term Refi' : 'Bridge / Refinance';

    return {
      id: i + 1,
      company: companyName,
      propType: pType,
      state,
      city,
      loanAmt,
      lender,
      year,
      origRate,
      rateGap: parseFloat(rateGap.toFixed(2)),
      oppType,
      refiScore,
      priority,
      stage: 'new',
      notes: '',
      lastContacted: null,
    };
  });

  return prospects.sort((a, b) => b.refiScore - a.refiScore);
}

export default async function handler(req, res) {
  const { method, query, body } = req;

  // GET /api/prospects?action=search&propType=...
  if (method === 'GET' && query.action === 'search') {
    const prospects = generateHMDAProspects({
      propType: query.propType || 'Multifamily',
      state: query.state || 'AK',
      minLoan: query.minLoan || '500000',
      maxLoan: query.maxLoan || '5000000',
      year: query.year || '2024',
      count: parseInt(query.count) || 20,
    });
    return res.status(200).json({ prospects, total: prospects.length });
  }

  // GET /api/prospects?action=pipeline — get saved pipeline from Supabase
  if (method === 'GET' && query.action === 'pipeline') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(200).json({ pipeline: [] });
    try {
      const user = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${token}` },
      }).then(r => r.json());
      if (!user?.id) return res.status(200).json({ pipeline: [] });
      const data = await sb(`/saved_searches?select=*&user_id=eq.${user.id}&product=eq.hycre_pipeline&order=created_at.desc&limit=1`);
      const pipeline = data?.[0]?.metadata?.pipeline || [];
      return res.status(200).json({ pipeline });
    } catch { return res.status(200).json({ pipeline: [] }); }
  }

  // POST /api/prospects — save pipeline
  if (method === 'POST' && body?.action === 'save_pipeline') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(200).json({ saved: false });
    try {
      const user = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${token}` },
      }).then(r => r.json());
      if (!user?.id) return res.status(200).json({ saved: false });

      // Upsert pipeline to saved_searches
      const existing = await sb(`/saved_searches?select=id&user_id=eq.${user.id}&product=eq.hycre_pipeline&limit=1`);
      if (existing?.[0]?.id) {
        await sb(`/saved_searches?id=eq.${existing[0].id}`, {
          method: 'PATCH',
          body: JSON.stringify({ metadata: { pipeline: body.pipeline }, updated_at: new Date().toISOString() }),
          prefer: 'return=minimal',
        });
      } else {
        await sb(`/saved_searches`, {
          method: 'POST',
          body: JSON.stringify({
            user_id: user.id,
            product: 'hycre_pipeline',
            query: 'hycre_client_pipeline',
            metadata: { pipeline: body.pipeline },
          }),
          prefer: 'return=minimal',
        });
      }
      return res.status(200).json({ saved: true });
    } catch (err) {
      console.error('Save pipeline error:', err);
      return res.status(200).json({ saved: false });
    }
  }

  return res.status(400).json({ error: 'Invalid request' });
}
