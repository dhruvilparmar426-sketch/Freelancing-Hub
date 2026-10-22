/* Freelancing Hub - shared catalogue data
   Categories, sub-categories, sample developers + sample products,
   and a loader that merges REAL products/developers saved from Developer Studio
   (localStorage keys: freelancingHubProducts:<email> / freelancingHubDeveloperProfile:<email>). */
(function () {
  'use strict';

  /* ---------- Categories (each has 3 sub-categories x 3 products) ---------- */
  const CATS = [
    {
      id: 'web', name: 'Web Development', icon: '</>', hue: 175,
      blurb: 'Websites, web apps and eCommerce stores.',
      feat: ['Responsive design', 'Contact form', 'Basic SEO setup', 'Speed optimisation', 'Admin / CMS access', 'Source files & 30-day support'],
      subs: [
        { id: 'business', name: 'Business Websites', d: 5, desc: 'A fast, mobile-friendly website that presents your business professionally and turns visitors into enquiries.',
          items: [['Modern Business Website', 2999], ['Portfolio Website', 1999], ['Single Page Landing Site', 1499]] },
        { id: 'ecom', name: 'eCommerce Stores', d: 10, desc: 'A complete online shop with product pages, secure checkout and order management so you can start selling quickly.',
          items: [['Shopify Store Setup', 4999], ['WooCommerce Online Shop', 5499], ['Custom Cart & Checkout', 7999]] },
        { id: 'webapps', name: 'Web Apps & Dashboards', d: 14, desc: 'Custom web applications and dashboards built with clean code, role-based access and room to grow.',
          items: [['Admin Dashboard Build', 6999], ['SaaS MVP Frontend', 8999], ['Booking & Appointment System', 5999]] }
      ]
    },
    {
      id: 'mobile', name: 'Mobile Apps', icon: '▢', hue: 215,
      blurb: 'Android, iOS and cross-platform apps.',
      feat: ['Clean UI screens', 'Core features', 'Testing on devices', 'Push notifications', 'Backend / API integration', 'Store-ready build & source code'],
      subs: [
        { id: 'android', name: 'Android Apps', d: 14, desc: 'Native Android apps that feel smooth, load fast and follow current Material design guidelines.',
          items: [['Android App from Scratch', 9999], ['Android UI Revamp', 4999], ['Firebase Powered App', 7999]] },
        { id: 'ios', name: 'iOS Apps', d: 14, desc: 'Polished iOS apps built for iPhone with attention to performance, accessibility and App Store rules.',
          items: [['Native iOS App', 11999], ['iOS App Store Publishing', 2999], ['SwiftUI Prototype', 5999]] },
        { id: 'cross', name: 'Cross-Platform Apps', d: 12, desc: 'One codebase, two platforms. Flutter and React Native apps that save time and budget.',
          items: [['Flutter App Development', 8999], ['React Native MVP', 9499], ['Cross-Platform Delivery App', 12999]] }
      ]
    },
    {
      id: 'ux', name: 'UI/UX Design', icon: '✎', hue: 262,
      blurb: 'Web and mobile app design, prototypes.',
      feat: ['Figma source file', '2 concept options', 'Responsive layouts', 'Interactive prototype', 'Design system / components', 'Developer hand-off & 14-day support'],
      subs: [
        { id: 'appdesign', name: 'Mobile App Design', d: 5, desc: 'Intuitive, modern app screens designed around real user behaviour and ready for developers to build.',
          items: [['Mobile App UI Kit', 2999], ['Onboarding Flow Design', 1799], ['App Redesign', 3999]] },
        { id: 'webdesign', name: 'Website UI Design', d: 4, desc: 'Beautiful, conversion-focused web layouts delivered as organised Figma files with consistent styles.',
          items: [['Landing Page UI in Figma', 1999], ['Dashboard UI Design', 3499], ['Design System Setup', 4499]] },
        { id: 'proto', name: 'Prototyping & Research', d: 6, desc: 'Test ideas early with wireframes, clickable prototypes and clear usability feedback.',
          items: [['Clickable Figma Prototype', 2499], ['Usability Audit', 2999], ['User Flow & Wireframes', 1999]] }
      ]
    },
    {
      id: 'graphic', name: 'Graphic Design', icon: '◆', hue: 345,
      blurb: 'Logos, branding, social media and more.',
      feat: ['2 initial concepts', 'High-resolution PNG & JPG', 'Source file (AI / PSD)', 'Unlimited revisions', 'Print-ready PDF', 'Commercial usage rights'],
      subs: [
        { id: 'logo', name: 'Logo & Branding', d: 3, desc: 'A memorable identity that fits your business, from a simple mark to a complete brand system.',
          items: [['Minimal Logo Design', 999], ['Complete Brand Identity', 3999], ['Brand Style Guide', 2499]] },
        { id: 'social', name: 'Social Media Design', d: 2, desc: 'Scroll-stopping creatives sized perfectly for each platform and consistent with your brand.',
          items: [['Instagram Post Pack', 799], ['YouTube Thumbnails', 599], ['Festival & Offer Creatives', 899]] },
        { id: 'print', name: 'Print & Packaging', d: 4, desc: 'Print-ready artwork with correct bleed, colour profiles and dimensions for your printer.',
          items: [['Brochure & Flyer Design', 1499], ['Product Packaging Design', 2999], ['Business Card & Stationery', 999]] }
      ]
    },
    {
      id: 'video', name: 'Video Editing', icon: '▶', hue: 22,
      blurb: 'Reels, ads, YouTube videos and more.',
      feat: ['Up to 1-minute final cut', 'Colour correction', 'Background music', 'Captions / subtitles', 'Motion graphics & effects', 'Project file & 2 extra formats'],
      subs: [
        { id: 'reels', name: 'Reels & Shorts', d: 2, desc: 'Fast, punchy vertical edits with trending pacing, transitions and captions made for short-form platforms.',
          items: [['Instagram Reel Edit', 699], ['YouTube Shorts Pack', 1299], ['Viral-Style Captions Edit', 899]] },
        { id: 'youtube', name: 'YouTube Videos', d: 4, desc: 'Clean long-form editing with smooth cuts, audio clean-up and colour grading that keeps viewers watching.',
          items: [['YouTube Video Edit', 1499], ['Podcast to Video', 1999], ['Vlog Editing with Colour Grade', 2499]] },
        { id: 'ads', name: 'Ads & Motion Graphics', d: 5, desc: 'Eye-catching promo videos and animation that explain your product and drive action.',
          items: [['Product Promo Video', 3499], ['2D Explainer Animation', 5999], ['Logo Animation', 1499]] }
      ]
    },
    {
      id: 'writing', name: 'Content Writing', icon: '¶', hue: 150,
      blurb: 'Blogs, articles, copywriting and more.',
      feat: ['Up to 500 words', 'Plagiarism-free content', 'Keyword research', 'Up to 1,000 words', '2 free revisions', 'Meta description & proofreading'],
      subs: [
        { id: 'blogs', name: 'Blogs & Articles', d: 3, desc: 'Well-researched, engaging articles written in your brand voice and optimised for search.',
          items: [['SEO Blog Post', 799], ['Long-form Article', 1499], ['Website Content Pack', 2999]] },
        { id: 'copy', name: 'Copywriting', d: 2, desc: 'Persuasive copy that explains your offer clearly and gives readers a reason to act.',
          items: [['Ad Copy & Taglines', 999], ['Product Descriptions Pack', 1299], ['Email Newsletter Copy', 1199]] },
        { id: 'translate', name: 'Translation & Proofreading', d: 3, desc: 'Accurate translation, careful editing and polished scripts with natural, native-sounding language.',
          items: [['English–Hindi–Gujarati Translation', 899], ['Proofreading & Editing', 699], ['Script Writing', 1999]] }
      ]
    },
    {
      id: 'marketing', name: 'Digital Marketing', icon: '↗', hue: 45,
      blurb: 'SEO, social media, ads and strategy.',
      feat: ['Competitor analysis', 'Keyword / audience research', 'Monthly report', 'Strategy call (30 min)', 'Campaign setup & optimisation', 'Priority support for 30 days'],
      subs: [
        { id: 'seo', name: 'SEO', d: 14, desc: 'Improve your search visibility with a clear audit, technical fixes and content recommendations.',
          items: [['Complete SEO Audit', 2999], ['On-Page SEO Optimisation', 4499], ['Local SEO & Google Business', 3499]] },
        { id: 'smm', name: 'Social Media Marketing', d: 14, desc: 'Grow your audience with a consistent content plan, community management and measurable results.',
          items: [['Social Media Management', 5999], ['Instagram Growth Strategy', 3999], ['Influencer Outreach Campaign', 4999]] },
        { id: 'ads', name: 'Paid Ads', d: 7, desc: 'Launch and optimise ad campaigns that reach the right people at a sensible cost.',
          items: [['Google Ads Setup', 3999], ['Meta Ads Campaign', 3499], ['Ad Funnel & Retargeting', 5999]] }
      ]
    },
    {
      id: 'ai', name: 'AI & Automation', icon: '✦', hue: 305,
      blurb: 'Chatbots, workflows and data solutions.',
      feat: ['Requirement analysis', 'Working prototype', 'Integration with your tools', 'Custom training / rules', 'Documentation & hand-over', '30-day maintenance'],
      subs: [
        { id: 'bots', name: 'Chatbots & Assistants', d: 7, desc: 'Smart assistants that answer questions, capture leads and support customers around the clock.',
          items: [['Website AI Chatbot', 4999], ['WhatsApp Business Bot', 5999], ['Customer Support Assistant', 7999]] },
        { id: 'workflow', name: 'Workflow Automation', d: 5, desc: 'Remove repetitive tasks by connecting your apps and automating the boring parts of your work.',
          items: [['Zapier / Make Automation', 2999], ['Google Sheets Automation', 1999], ['Lead Capture Pipeline', 3499]] },
        { id: 'data', name: 'Data & Machine Learning', d: 14, desc: 'Turn raw data into dashboards, predictions and reports you can actually use for decisions.',
          items: [['Data Cleaning & Dashboard', 3999], ['Predictive Model Build', 8999], ['Web Scraper & Reports', 2999]] }
      ]
    },
    {
      id: 'gis', name: 'GIS / Mapping', icon: '◎', hue: 95,
      blurb: 'Web maps, spatial analysis and remote sensing.',
      feat: ['Data collection & cleaning', 'Base map / analysis', 'Styled map outputs', 'Interactive / web version', 'Written report', 'Source data & project files'],
      subs: [
        { id: 'webmaps', name: 'Web Maps', d: 7, desc: 'Interactive maps for your website with search, layers, popups and clean, fast performance.',
          items: [['Interactive Leaflet Web Map', 3999], ['Store Locator Map', 2999], ['Mapbox Dashboard', 5999]] },
        { id: 'analysis', name: 'GIS Analysis', d: 7, desc: 'Reliable spatial analysis with documented methods, clear maps and findings you can present.',
          items: [['Spatial Analysis Report', 4999], ['Site Suitability Study', 6999], ['Land Use Mapping', 5499]] },
        { id: 'remote', name: 'Remote Sensing', d: 10, desc: 'Satellite imagery processing for monitoring land, crops and water with transparent workflows.',
          items: [['Satellite Image Classification', 7999], ['NDVI Crop Monitoring', 5999], ['Flood Mapping with Sentinel', 6999]] }
      ]
    }
  ];

  /* ---------- Sample developers (replace with real ones as people join) ---------- */
  const DEVS = [
    { id: 'd1', name: 'Aarav Mehta', title: 'Full-Stack Web Developer', cats: ['web', 'mobile', 'ai'], rating: 4.9, reviews: 128, exp: 7, city: 'Ahmedabad', hue: 175, bio: 'Full-stack developer who ships clean, maintainable products for startups and small businesses.' },
    { id: 'd2', name: 'Riya Patel', title: 'UI/UX Designer', cats: ['ux', 'graphic'], rating: 4.9, reviews: 96, exp: 6, city: 'Surat', hue: 262, bio: 'Designs simple, friendly interfaces and takes projects from sketch to Figma hand-off.' },
    { id: 'd3', name: 'Kabir Shah', title: 'Mobile App Developer', cats: ['mobile', 'web'], rating: 4.8, reviews: 74, exp: 5, city: 'Rajkot', hue: 215, bio: 'Builds fast Android and iOS apps with reliable backends and clear communication.' },
    { id: 'd4', name: 'Ishita Nair', title: 'Brand & Graphic Designer', cats: ['graphic', 'ux'], rating: 5.0, reviews: 142, exp: 8, city: 'Bengaluru', hue: 345, bio: 'Brand designer focused on logos and identities that look great everywhere.' },
    { id: 'd5', name: 'Vivaan Joshi', title: 'Video Editor & Motion Artist', cats: ['video', 'graphic'], rating: 4.8, reviews: 88, exp: 5, city: 'Vadodara', hue: 22, bio: 'Edits reels, YouTube videos and ads with sharp pacing and clean colour work.' },
    { id: 'd6', name: 'Ananya Iyer', title: 'Content Strategist & Copywriter', cats: ['writing', 'marketing'], rating: 4.9, reviews: 110, exp: 6, city: 'Chennai', hue: 150, bio: 'Writes clear, persuasive content that ranks well and reads even better.' },
    { id: 'd7', name: 'Rohan Kulkarni', title: 'SEO & Growth Marketer', cats: ['marketing', 'writing'], rating: 4.7, reviews: 67, exp: 6, city: 'Pune', hue: 45, bio: 'Helps small businesses grow organic traffic with practical, no-fluff SEO.' },
    { id: 'd8', name: 'Meera Desai', title: 'Flutter Developer', cats: ['mobile', 'ux'], rating: 4.9, reviews: 59, exp: 4, city: 'Ahmedabad', hue: 200, bio: 'Flutter specialist who turns designs into smooth, pixel-perfect apps.' },
    { id: 'd9', name: 'Aditya Verma', title: 'AI / ML Engineer', cats: ['ai', 'gis'], rating: 4.8, reviews: 52, exp: 6, city: 'Hyderabad', hue: 305, bio: 'Builds practical machine-learning tools, chatbots and data pipelines.' },
    { id: 'd10', name: 'Sana Khan', title: 'Social Media & Ads Specialist', cats: ['marketing', 'video'], rating: 4.7, reviews: 81, exp: 5, city: 'Mumbai', hue: 28, bio: 'Plans and runs social and paid campaigns with a focus on measurable results.' },
    { id: 'd11', name: 'Harsh Vyas', title: 'GIS Analyst & Remote Sensing Expert', cats: ['gis', 'ai'], rating: 4.9, reviews: 44, exp: 7, city: 'Gandhinagar', hue: 95, bio: 'GIS professional working with satellite data, spatial analysis and web maps.' },
    { id: 'd12', name: 'Tanvi Rao', title: 'Frontend Engineer', cats: ['web', 'ux'], rating: 4.8, reviews: 91, exp: 5, city: 'Bengaluru', hue: 185, bio: 'Frontend engineer who loves fast, accessible interfaces and tidy code.' },
    { id: 'd13', name: 'Nikhil Bansal', title: 'Automation Engineer', cats: ['ai', 'web'], rating: 4.7, reviews: 38, exp: 4, city: 'Jaipur', hue: 290, bio: 'Automates business workflows so teams can focus on work that matters.' },
    { id: 'd14', name: 'Pooja Chauhan', title: 'Translator & Editor', cats: ['writing', 'marketing'], rating: 4.9, reviews: 73, exp: 9, city: 'Surat', hue: 160, bio: 'Translates and edits English, Hindi and Gujarati content with native-level care.' },
    { id: 'd15', name: 'Yash Parmar', title: 'Motion Designer', cats: ['video', 'ux'], rating: 4.8, reviews: 49, exp: 4, city: 'Vadodara', hue: 12, bio: 'Creates logo animations, explainers and UI motion that bring brands to life.' },
    { id: 'd16', name: 'Divya Menon', title: 'Web GIS Developer', cats: ['gis', 'web'], rating: 4.8, reviews: 36, exp: 5, city: 'Kochi', hue: 110, bio: 'Builds interactive web maps and geospatial dashboards with modern tools.' }
  ];

  /* ---------- helpers ---------- */
  const ALIASES = {
    'website & development': 'web', 'websites & development': 'web',
    'mobile apps': 'mobile', 'mobile app development': 'mobile',
    'graphics & branding': 'graphic',
    'video & animation': 'video',
    'writing & translation': 'writing',
    'ai & automation': 'ai', 'ai / machine learning': 'ai',
    'gis / mapping': 'gis'
  };

  function catById(id) { return CATS.find(c => c.id === id); }
  function catByName(name) {
    const n = String(name || '').trim().toLowerCase();
    if (!n) return null;
    return CATS.find(c => c.name.toLowerCase() === n) || catById(ALIASES[n]) || null;
  }
  function resolveSub(cat, name, text) {
    if (name) {
      const s = cat.subs.find(x => x.name.toLowerCase() === String(name).toLowerCase());
      if (s) return s;
    }
    const t = String(text || '').toLowerCase();
    let best = null, score = 0;
    cat.subs.forEach(s => {
      const words = s.name.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3);
      const sc = words.filter(w => t.includes(w)).length;
      if (sc > score) { best = s; score = sc; }
    });
    return best || cat.subs[0];
  }

  const r50 = n => Math.round(n / 50) * 50;
  const dayText = n => n + (n === 1 ? ' day' : ' days');

  function art(hue, glyph, seed) {
    const h2 = (hue + 45) % 360, a = (seed * 53) % 200, b = (seed * 97) % 150;
    const g = String(glyph).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + hue + ',55%,40%)"/><stop offset="1" stop-color="hsl(' + h2 + ',60%,20%)"/></linearGradient></defs>' +
      '<rect width="600" height="400" fill="url(#g)"/>' +
      '<circle cx="' + (420 + a) + '" cy="' + (60 + b) + '" r="170" fill="#fff" fill-opacity=".07"/>' +
      '<circle cx="' + (80 + b) + '" cy="' + (330 - a / 2) + '" r="120" fill="#fff" fill-opacity=".08"/>' +
      '<rect x="170" y="110" width="260" height="180" rx="22" fill="#fff" fill-opacity=".14" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>' +
      '<rect x="195" y="135" width="90" height="12" rx="6" fill="#fff" fill-opacity=".5"/>' +
      '<rect x="195" y="160" width="140" height="8" rx="4" fill="#fff" fill-opacity=".3"/>' +
      '<text x="300" y="262" font-family="Arial,sans-serif" font-size="78" font-weight="700" fill="#fff" fill-opacity=".92" text-anchor="middle">' + g + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* Distinct real photographic thumbnails from Unsplash. Each category has a pool
     of nine different photos, one per sample service; no repeated category image.
     Internet access is required to load these photographs. */
  const PHOTO_POOLS = {
    web: ['photo-1460925895917-afdab827c52f','photo-1499951360447-b19be8fe80f5','photo-1519389950473-47ba0277781c','photo-1467232004584-a241de8bcf5d','photo-1487014679447-9f8336841d58','photo-1559028012-481c04fa702d','photo-1547658719-da2b51169166','photo-1507238691740-187a5b1d37b8','photo-1516321318423-f06f85e504b3'],
    mobile: ['photo-1512941937669-90a1b58e7e9c','photo-1511707171634-5f897ff02aa9','photo-1551650975-87deedd944c3','photo-1555774698-0b77e0d5fac6','photo-1510557880182-3d4d3cba35a5','photo-1556656793-08538906a9f8','photo-1523206489230-c012c64b2b48','photo-1512428559087-560fa5ceab42','photo-1519389950473-47ba0277781c'],
    ux: ['photo-1559028012-481c04fa702d','photo-1558655146-d09347e92766','photo-1586717791821-3f44a563fa4c','photo-1559028006-448665bd7c7f','photo-1586717791821-3f44a563fa4c','photo-1545235617-9465d2a55698','photo-1551650975-87deedd944c3','photo-1559028012-481c04fa702d','photo-1581291518857-4e27b48ff24e'],
    graphic: ['photo-1626785774573-4b799315345d','photo-1541701494587-cb58502866ab','photo-1545235617-9465d2a55698','photo-1455390582262-044c4295d69f','photo-1561070791-2526d30994b5','photo-1558655146-9f40138edfeb','photo-1513364776144-60967b0f800f','photo-1549490349-8643362247b5','photo-1513364776144-60967b0f800f'],
    video: ['photo-1492619375914-88005aa9e8fb','photo-1574717024653-61fd2cf4d44d','photo-1574375927938-d5a98e8ffe85','photo-1485846234645-a62644f84728','photo-1536240478700-b869070f9279','photo-1574717024453-354056afd6fc','photo-1492619375914-88005aa9e8fa','photo-1516035069371-29a1b244cc32','photo-1502982720700-bfff97f2ecac'],
    writing: ['photo-1455390582262-044c4295d69f','photo-1456324504439-367cee3b3c32','photo-1456513080510-7bf3a84b82f8','photo-1453738773917-9c3eff1db985','photo-1434030216411-0b793f4b4173','photo-1517842645767-c639042777db','photo-1506784983877-45594efa4cbe','photo-1519682337058-a94d519337bc','photo-1501504905252-473c47e087f8'],
    marketing: ['photo-1432888622747-4eb9a8efeb07','photo-1460925895917-afdab827c52f','photo-1553877522-43269d4ea984','photo-1557838923-2985c318be48','photo-1533750349088-cd871a92f312','photo-1611926653458-09294b3142bf','photo-1562577309-4932fdd64cd1','photo-1552664730-d307ca884978','photo-1556761175-b413da4baf72'],
    ai: ['photo-1677442136019-21780ecad995','photo-1485827404703-89b55fcc595e','photo-1620712943543-bcc4688e7485','photo-1518770660439-4636190af475','photo-1535223289827-42f1e9919769','photo-1480796927426-f609979314bd','photo-1451187580459-43490279c0fa','photo-1519389950473-47ba0277781c','photo-1555255707-c07966088b7b'],
    gis: ['photo-1524666041070-9b876761a1ba','photo-1473448912268-2022ce9509d8','photo-1500530855697-b586d89ba3ee','photo-1518005020951-eccb494ad742','photo-1470071459604-3b5ec3a7fe05','photo-1441974231531-c6227db76b6e','photo-1464822759023-fed622ff2c3b','photo-1501785888041-af3ef285b470','photo-1500534623283-312aade485b7']
  };
  const TOOL_STACKS = {
    web: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js'],
    mobile: ['Flutter', 'Dart', 'Android Studio', 'Firebase'],
    ux: ['Figma', 'FigJam', 'Adobe XD', 'Prototyping'],
    graphic: ['Adobe Illustrator', 'Photoshop', 'Canva', 'Figma'],
    video: ['Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve', 'CapCut'],
    writing: ['Google Docs', 'Grammarly', 'Hemingway Editor', 'SEO tools'],
    marketing: ['Google Analytics', 'Google Ads', 'Meta Business Suite', 'Search Console'],
    ai: ['Python', 'Gemini API', 'TensorFlow', 'n8n / Zapier'],
    gis: ['QGIS', 'ArcGIS', 'Google Earth Engine', 'Leaflet']
  };
  const PHOTO_REAL = {
    web: 'photo-1460925895917-afdab827c52f', mobile: 'photo-1512941937669-90a1b58e7e9c',
    ux: 'photo-1559028012-481c04fa702d', graphic: 'photo-1626785774573-4b799315345d',
    video: 'photo-1492619375914-88005aa9e8fb', writing: 'photo-1455390582262-044c4295d69f',
    marketing: 'photo-1432888622747-4eb9a8efeb07', ai: 'photo-1677442136019-21780ecad995',
    gis: 'photo-1524666041070-9b876761a1ba'
  };
  function productPhoto(catId, seed, title) {
    const pool = PHOTO_POOLS[catId] || PHOTO_POOLS.web;
    const index = Math.abs(Number(seed) || 0) % pool.length;
    const id = pool[index] || PHOTO_REAL[catId] || PHOTO_REAL.web;
    return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=1000&q=85';
  }

  /* ---------- sample products (generated) ---------- */
  function buildSeed() {
    const out = [];
    CATS.forEach(c => {
      const pool = DEVS.filter(d => d.cats.includes(c.id));
      let n = 0;
      c.subs.forEach(s => {
        s.items.forEach((it, idx) => {
          const dev = pool[(n++) % pool.length];
          const base = it[1];
          const prices = [base, r50(base * 2.1), r50(base * 3.6)];
          const durs = [s.d, Math.ceil(s.d * 1.6), Math.ceil(s.d * 2.4)];
          const counts = [2, 4, 6];
          out.push({
            id: 's-' + c.id + '-' + s.id + '-' + idx,
            title: it[0], catId: c.id, catName: c.name, subId: s.id, subName: s.name,
            desc: it[0] + ' — ' + s.desc,
            image: productPhoto(c.id, n - 1, it[0]),
            tools: (TOOL_STACKS[c.id] || TOOL_STACKS.web).slice(0, 4),
            devId: dev.id, real: false,
            packages: ['Basic', 'Standard', 'Premium'].map((name, i) => ({
              name, price: prices[i], duration: dayText(durs[i]), features: c.feat.slice(0, counts[i])
            }))
          });
        });
      });
    });
    return out;
  }

  /* ---------- REAL developers & products from Developer Studio ---------- */
  function readJSON(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }

  function loadReal() {
    const PP = 'freelancingHubProducts:', DP = 'freelancingHubDeveloperProfile:';
    const emails = new Set();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.indexOf(PP) === 0) emails.add(k.slice(PP.length));
        else if (k.indexOf(DP) === 0) emails.add(k.slice(DP.length));
      }
    } catch (e) { /* storage unavailable */ }

    const users = readJSON('freelancingHubUsers', []);
    const devs = [], products = [];

    emails.forEach(email => {
      const profile = readJSON(DP + email, null);
      const list = readJSON(PP + email, []);
      if (!profile && !list.length) return;
      const account = users.find(u => String(u.email).toLowerCase() === email && (u.role || 'User') === 'Developer');
      const cat0 = profile && profile.specialty ? catByName(profile.specialty) : null;
      const dev = {
        id: 'r:' + email, email: email, real: true,
        name: (profile && profile.name) || (account && account.name) || email.split('@')[0],
        title: (profile && profile.headline) || 'Freelance Developer',
        bio: (profile && profile.bio) || '',
        avatar: (profile && profile.avatar) || '',
        portfolio: (profile && profile.portfolio) || '',
        cats: cat0 ? [cat0.id] : [],
        rating: 0, reviews: 0
      };
      list.forEach(p => {
        const cat = catByName(p.category) || cat0 || CATS[0];
        const sub = resolveSub(cat, p.subcategory, p.title + ' ' + p.description);
        const feats = (txt, fallback) => {
          const a = String(txt || '').split(/\n|;|,/).map(x => x.trim()).filter(Boolean);
          return a.length ? a : [fallback];
        };
        if (!dev.cats.includes(cat.id)) dev.cats.push(cat.id);
        products.push({
          id: 'r:' + email + ':' + p.id,
          title: p.title, catId: cat.id, catName: cat.name, subId: sub.id, subName: sub.name,
          desc: p.description, sampleDesc: p.sampleDescription || '',
          tools: Array.isArray(p.tools) && p.tools.length ? p.tools : (TOOL_STACKS[cat.id] || TOOL_STACKS.web).slice(0, 4),
          image: p.sampleImage || productPhoto(cat.id, String(p.id).length * 5, p.title),
          devId: dev.id, real: true,
          packages: (p.packages || []).map(pk => ({
            name: pk.name, price: Number(pk.price) || 0, duration: pk.duration || '—',
            features: feats(pk.features, 'Package deliverables as described')
          }))
        });
      });
      devs.push(dev);
    });

    products.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    return { devs, products };
  }

  window.FLH = { CATS, DEVS, catById, catByName, resolveSub, buildSeed, loadReal, TOOL_STACKS, art };
})();
