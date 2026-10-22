/* Freelancing Hub marketplace (runs on the landing page, no page reloads)
   categories → sub-categories → products → Explore product details
   + search, profile, developers with ratings, orders and reviews.
   Demo only: data lives in this browser (localStorage). */
(function () {
  'use strict';
  const F = window.FLH;
  const root = document.getElementById('marketRoot');
  if (!F || !root) return;

  /* ---------------- utilities ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '₹' + Number(n).toLocaleString('en-IN');
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { toast('Browser storage is full or blocked.'); return false; } }
  };
  const currentUser = () => LS.get('freelancingHubCurrentUser', null);

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  /* ---------------- data ---------------- */
  const CATS = F.CATS;
  let products = [], devs = [], pById = {}, dById = {};

  function refresh() {
    const real = F.loadReal();
    products = real.products.concat(F.buildSeed());
    devs = real.devs.concat(F.DEVS);
    pById = {}; products.forEach(p => { pById[p.id] = p; });
    dById = {}; devs.forEach(d => { dById[d.id] = d; });
  }

  const catName = id => (F.catById(id) || {}).name || '';
  const minPrice = p => Math.min.apply(null, p.packages.map(x => x.price));
  const minDuration = p => (p.packages[0] || {}).duration || '—';

  /* ratings = sample base rating (sample devs) + real reviews left by buyers */
  const allReviews = () => LS.get('flhReviews', []);
  function devRating(id) {
    const d = dById[id];
    const rv = allReviews().filter(r => r.devId === id);
    let sum = rv.reduce((a, r) => a + r.rating, 0), n = rv.length;
    if (d && d.rating) { sum += d.rating * d.reviews; n += d.reviews; }
    return { avg: n ? sum / n : 0, count: n };
  }
  function ratingHtml(id) {
    const r = devRating(id);
    return r.count
      ? `<span class="rate"><span class="st">★</span> <b>${r.avg.toFixed(1)}</b> <small>(${r.count})</small></span>`
      : '<span class="rate new">New · no ratings yet</span>';
  }
  function avatar(d, size) {
    if (d.avatar) return `<img class="av" style="width:${size}px;height:${size}px" src="${esc(d.avatar)}" alt="">`;
    const h = d.hue != null ? d.hue : ((String(d.name).charCodeAt(0) * 37) % 360);
    const ch = esc((String(d.name).trim()[0] || '?').toUpperCase());
    return `<span class="av" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px;background:hsl(${h} 45% 36%)">${ch}</span>`;
  }

  /* ---------------- state + views ---------------- */
  const st = { view: 'cats', catId: null, subId: 'all', q: '' };

  function productsOf(catId, subId) {
    return products.filter(p => p.catId === catId && (!subId || p.subId === subId));
  }

  function prodCard(p) {
    const d = dById[p.devId] || { name: 'Developer' };
    return `<article class="prod-card">
      <div class="prod-img"><img loading="lazy" src="${esc(p.image)}" alt="${esc(p.title)}"><span class="pill">${esc(p.subName)}</span></div>
      <div class="prod-body">
        <h4>${esc(p.title)}</h4>
        <button type="button" class="dev-row" data-act="dev" data-id="${esc(p.devId)}">${avatar(d, 26)}<span class="dn">${esc(d.name)}</span>${ratingHtml(p.devId)}</button>
        <p class="prod-desc">${esc(p.desc)}</p>
        <div class="prod-tools"><small>Tools used</small><span>${(p.tools || (F.TOOL_STACKS && F.TOOL_STACKS[p.catId]) || []).slice(0,3).map(t => `<i>${esc(t)}</i>`).join('')}</span></div>
        <div class="prod-foot">
          <div class="price-box"><small>Starting at</small><b>${money(minPrice(p))}</b><small>from ${esc(minDuration(p))}</small></div>
          <button type="button" class="btn btn-dark" data-act="product" data-id="${esc(p.id)}">Explore more</button>
        </div>
      </div></article>`;
  }

  function catsView() {
    const total = products.length;
    return `<div class="section-heading">
        <span class="section-kicker">POPULAR SERVICES</span>
        <h2>Explore Our Categories</h2>
        <p>Pick a category, open a sub-category and compare services from real developers. <b>${CATS.length}</b> categories · <b>${total}</b> services · <b>${devs.length}</b> developers.</p>
      </div>
      <div class="cat-grid">${CATS.map(c => {
        const n = productsOf(c.id).length;
        return `<button type="button" class="cat-card" data-act="cat" data-id="${c.id}">
          <div class="cat-art" style="background:linear-gradient(145deg,hsl(${c.hue},55%,40%),hsl(${(c.hue + 45) % 360},60%,20%))"><span>${esc(c.icon)}</span></div>
          <div class="cat-body"><h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p>
          <div class="cat-meta">${c.subs.length} sub-categories · ${n} services</div><span class="card-arrow">↗</span></div></button>`;
      }).join('')}</div>`;
  }

  function catView() {
    const c = F.catById(st.catId);
    if (!c) { st.view = 'cats'; return catsView(); }
    const chips = `<div class="sub-chips">
      <button type="button" class="chip ${st.subId === 'all' ? 'active' : ''}" data-act="sub" data-id="all">All <small>${productsOf(c.id).length}</small></button>
      ${c.subs.map(s => `<button type="button" class="chip ${st.subId === s.id ? 'active' : ''}" data-act="sub" data-id="${s.id}">${esc(s.name)} <small>${productsOf(c.id, s.id).length}</small></button>`).join('')}
    </div>`;
    const subs = st.subId === 'all' ? c.subs : c.subs.filter(s => s.id === st.subId);
    const blocks = subs.map(s => {
      const list = productsOf(c.id, s.id);
      return `<div class="sub-block"><div class="sub-head"><h3>${esc(s.name)}</h3><span>${list.length} services</span></div>
        ${list.length ? `<div class="prod-grid">${list.map(prodCard).join('')}</div>` : '<p class="muted">No services here yet.</p>'}</div>`;
    }).join('');
    return `<div class="crumbs"><button type="button" class="back-categories" data-act="home">← Back to all categories</button><span>›</span><b>${esc(c.name)}</b></div>
      <div class="cat-head"><h2>${esc(c.name)}</h2><p>${esc(c.blurb)}</p></div>${chips}${blocks}`;
  }

  /* ---------------- search ---------------- */
  function runSearch(q) {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    const has = text => tokens.every(t => text.indexOf(t) > -1);
    const cats = CATS.filter(c => has((c.name + ' ' + c.blurb + ' ' + c.subs.map(s => s.name).join(' ')).toLowerCase()));
    const prods = products.filter(p => {
      const d = dById[p.devId] || {};
      return has([p.title, p.desc, p.catName, p.subName, d.name, d.title].join(' ').toLowerCase());
    });
    const ds = devs.filter(d => has([d.name, d.title, d.bio || '', (d.cats || []).map(catName).join(' ')].join(' ').toLowerCase()));
    return { cats, prods, ds };
  }

  function searchView() {
    const q = st.q.trim();
    const r = runSearch(q);
    const none = !r.cats.length && !r.prods.length && !r.ds.length;
    return `<div class="crumbs"><button type="button" data-act="home">All categories</button><span>›</span><b>Search</b></div>
      <div class="cat-head"><h2>Results for “${esc(q)}”</h2>
        <p>${r.prods.length} services · ${r.ds.length} developers · ${r.cats.length} categories
        <button type="button" class="link-btn" data-act="clear">Clear search</button></p></div>
      ${none ? '<div class="empty-state"><h3>No matches found</h3><p>Try another word, like “logo”, “website”, “video” or a developer’s name.</p></div>' : ''}
      ${r.cats.length ? `<div class="sub-block"><div class="sub-head"><h3>Categories</h3></div><div class="sub-chips">${r.cats.map(c => `<button type="button" class="chip" data-act="cat" data-id="${c.id}">${esc(c.name)}</button>`).join('')}</div></div>` : ''}
      ${r.ds.length ? `<div class="sub-block"><div class="sub-head"><h3>Developers</h3><span>${r.ds.length}</span></div><div class="dev-grid">${r.ds.slice(0, 8).map(devCard).join('')}</div></div>` : ''}
      ${r.prods.length ? `<div class="sub-block"><div class="sub-head"><h3>Services</h3><span>${r.prods.length}</span></div><div class="prod-grid">${r.prods.slice(0, 30).map(prodCard).join('')}</div>${r.prods.length > 30 ? '<p class="muted center">Showing the first 30 results. Refine your search to narrow down.</p>' : ''}</div>` : ''}`;
  }

  function render() {
    root.innerHTML = st.view === 'search' ? searchView() : st.view === 'cat' ? catView() : catsView();
  }
  function scrollToMarket() {
    const el = $('#services');
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------------- developers ---------------- */
  let showAllDevs = false;
  function sortedDevs() {
    return devs.slice().sort((a, b) => {
      if (!!a.real !== !!b.real) return a.real ? -1 : 1;
      const ra = devRating(a.id), rb = devRating(b.id);
      return (rb.avg - ra.avg) || (rb.count - ra.count);
    });
  }
  function devCard(d) {
    const tags = (d.cats || []).slice(0, 3).map(id => `<span class="tag">${esc(catName(id))}</span>`).join('');
    const n = products.filter(p => p.devId === d.id).length;
    return `<article class="dev-card">
      ${avatar(d, 64)}
      <h4>${esc(d.name)}${d.real ? ' <span class="new-badge">Member</span>' : ''}</h4>
      <p class="dev-title">${esc(d.title)}</p>
      <div>${ratingHtml(d.id)}</div>
      <div class="tags">${tags}</div>
      <p class="dev-sub">${n} service${n === 1 ? '' : 's'}${d.city ? ' · ' + esc(d.city) : ''}</p>
      <button type="button" class="btn btn-outline" data-act="dev" data-id="${esc(d.id)}">View profile</button></article>`;
  }
  function renderDevs() {
    const grid = $('#devGrid'), more = $('#devMore');
    if (!grid) return;
    const list = sortedDevs();
    grid.innerHTML = (showAllDevs ? list : list.slice(0, 8)).map(devCard).join('');
    if (more) {
      more.hidden = list.length <= 8;
      more.textContent = showAllDevs ? 'Show fewer developers' : 'Show all ' + list.length + ' developers';
    }
  }

  function devModal(id) {
    const d = dById[id];
    if (!d) return;
    const r = devRating(id);
    const rv = allReviews().filter(x => x.devId === id).slice(-5).reverse();
    const list = products.filter(p => p.devId === id);
    const link = d.portfolio && /^https?:\/\//i.test(d.portfolio) ? `<a class="link-btn" href="${esc(d.portfolio)}" target="_blank" rel="noopener noreferrer">Portfolio ↗</a>` : '';
    openModal(`<button type="button" class="modal-x" data-act="close" aria-label="Close">×</button>
      <div class="dev-profile">
        ${avatar(d, 92)}
        <div>
          <h2>${esc(d.name)} ${d.real ? '<span class="new-badge">Member</span>' : ''}</h2>
          <p class="dev-title">${esc(d.title)}${d.city ? ' · ' + esc(d.city) : ''}${d.exp ? ' · ' + d.exp + ' yrs experience' : ''}</p>
          <div class="big-rate">${ratingHtml(d.id)} ${r.count ? `<span class="stars">${'★'.repeat(Math.round(r.avg))}${'☆'.repeat(5 - Math.round(r.avg))}</span>` : ''}</div>
          <div class="tags">${(d.cats || []).map(c => `<span class="tag">${esc(catName(c))}</span>`).join('')}</div>
          ${link}
        </div>
      </div>
      ${d.bio ? `<p class="pd-desc">${esc(d.bio)}</p>` : ''}
      ${rv.length ? `<h3 class="pkg-title">Recent reviews</h3><div class="reviews">${rv.map(x => `<div class="review"><b>${'★'.repeat(x.rating)}${'☆'.repeat(5 - x.rating)}</b> <small>${esc(x.by)} · ${new Date(x.at).toLocaleDateString('en-IN')}</small>${x.text ? `<p>${esc(x.text)}</p>` : ''}</div>`).join('')}</div>` : ''}
      <h3 class="pkg-title">Services by ${esc(d.name)} (${list.length})</h3>
      ${list.length ? `<div class="prod-grid in-modal">${list.map(prodCard).join('')}</div>` : '<p class="muted">No services published yet.</p>'}`, 'wide');
  }

  /* ---------------- modal system ---------------- */
  const mroot = $('#modalRoot');
  function openModal(html, cls) {
    mroot.innerHTML = `<div class="modal-back"><div class="modal ${cls || ''}" role="dialog" aria-modal="true">${html}</div></div>`;
    mroot.classList.add('open');
    document.body.classList.add('no-scroll');
    const m = $('.modal', mroot);
    if (m) m.scrollTop = 0;
  }
  function closeModal() {
    mroot.classList.remove('open');
    mroot.innerHTML = '';
    document.body.classList.remove('no-scroll');
  }

  /* ---------------- product detail ---------------- */
  function pkgCard(p, pk) {
    const pop = pk.name === 'Standard';
    return `<div class="pkg ${pop ? 'popular' : ''}">
      ${pop ? '<span class="ribbon">Most popular</span>' : ''}
      <h4>${esc(pk.name)}</h4>
      <div class="pkg-price">${money(pk.price)}</div>
      <div class="pkg-time">⏱ Delivery in ${esc(pk.duration)}</div>
      <ul>${pk.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
      <div class="pkg-note">Included in this package</div></div>`;
  }

  function trackDeveloperMetric(p, metric) {
    if (!p || !p.devId || !String(p.devId).startsWith('r:')) return;
    const email = String(p.devId).slice(2).toLowerCase();
    if (!email) return;
    const key = 'flhAnalytics:' + email;
    const data = LS.get(key, { views: 0, clicks: 0 });
    data[metric] = Number(data[metric] || 0) + 1;
    LS.set(key, data);
  }

  function productModal(id) {
    const p = pById[id];
    if (!p) return;
    trackDeveloperMetric(p, 'views');
    const d = dById[p.devId] || { name: 'Developer', title: '' };
    openModal(`<button type="button" class="modal-x" data-act="close" aria-label="Close">×</button>
      <div class="pd-grid">
        <div class="pd-media"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div>
        <div class="pd-info">
          <div class="pd-badges"><span class="pill">${esc(p.catName)}</span><span class="pill alt">${esc(p.subName)}</span></div>
          <h2>${esc(p.title)}</h2>
          <button type="button" class="dev-row big" data-act="dev" data-id="${esc(p.devId)}">${avatar(d, 40)}<span class="dn">${esc(d.name)}<small>${esc(d.title)}</small></span>${ratingHtml(p.devId)}</button>
          <p class="pd-desc">${esc(p.desc)}</p>
          ${p.sampleDesc ? `<p class="pd-desc muted"><b>About the sample:</b> ${esc(p.sampleDesc)}</p>` : ''}
          <div class="pd-quick">
            <div><small>Delivery time</small><b>from ${esc(minDuration(p))}</b></div>
            <div><small>Starting price</small><b>${money(minPrice(p))}</b></div>
          </div>
        </div>
      </div>
      <div class="tools-panel"><div><span class="eyebrow">TOOLS & TECHNOLOGIES</span><h3>What tools are used?</h3></div><div class="tool-chips">${(p.tools || (F.TOOL_STACKS && F.TOOL_STACKS[p.catId]) || []).map(t => `<span>${esc(t)}</span>`).join('') || '<span>Tools depend on the developer’s workflow</span>'}</div></div><h3 class="pkg-title">Compare package details</h3>
      <div class="pkg-grid">${p.packages.map(pk => pkgCard(p, pk)).join('')}</div>
      ${currentUser() && currentUser().role === 'Developer' ? '' : `<div class="order-request-box"><h3>Ready to start?</h3><p class="muted">Choose a package and tell the developer what you need. No instant checkout.</p><div class="field"><label for="requestTier">Choose package</label><select id="requestTier">${p.packages.map(pk => `<option value="${esc(pk.name)}">${esc(pk.name)} · ${money(pk.price)} · ${esc(pk.duration)}</option>`).join('')}</select></div><div class="field"><label for="requestBrief">Project description / requirements</label><textarea id="requestBrief" maxlength="1500" placeholder="Describe your requirements, deadline, preferred style, files needed, or questions..."></textarea></div><button type="button" class="btn btn-dark" data-act="requestOrder" data-id="${esc(p.id)}">Send order request</button><p class="muted" style="font-size:12px">The developer can review, accept, suggest changes and mark the work delivered.</p></div>`}`, 'wide');
  }

  /* ---------------- order request workflow ---------------- */
  function requestOrder(id) {
    const p = pById[id], u = currentUser();
    if (!p) return;
    if (!u) { sessionStorage.setItem('flhPendingRequest', JSON.stringify({ id })); sessionStorage.setItem('freelancingHubRole', 'User'); toast('Please sign in as a user to send an order request.'); location.href = 'login.html'; return; }
    if (u.role === 'Developer') { toast('Developer accounts cannot place orders. Switch to User Mode.'); return; }
    const tier = ($('#requestTier') || {}).value || (p.packages[0] || {}).name;
    const pk = p.packages.find(x => x.name === tier) || p.packages[0];
    const brief = (($('#requestBrief') || {}).value || '').trim();
    const d = dById[p.devId] || { name: 'Developer' };
    const email = String(u.email).toLowerCase();
    const order = { id:'FLH-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random()*90+10), productId:p.id, title:p.title, tier:pk.name, price:pk.price, duration:pk.duration, devId:p.devId, devName:d.name, devEmail:d.email || (String(p.devId).startsWith('r:') ? String(p.devId).slice(2) : ''), customerEmail:email, customerName:u.name || 'Customer', customerBrief:brief, status:'Requested', method:'Order request', at:new Date().toISOString(), developerNote:'', deliveryNote:'', acceptedAt:null, deliveredAt:null };
    const buyerKey='flhOrders:'+email, buyerOrders=LS.get(buyerKey,[]); buyerOrders.unshift(order); LS.set(buyerKey,buyerOrders);
    const all=LS.get('flhAllOrders',[]); all.unshift(order); LS.set('flhAllOrders',all);
    openModal(`<button type="button" class="modal-x" data-act="close" aria-label="Close">×</button><div class="pay-success"><div class="tick">✓</div><h2>Order request sent</h2><p class="pay-sub">Your request for <b>${esc(p.title)}</b> has been saved. The developer can accept it, send suggestions, and deliver the work from Developer Studio.</p><ul class="pay-lines light"><li><span>Order ID</span><b>${esc(order.id)}</b></li><li><span>Package</span><b>${esc(pk.name)}</b></li><li><span>Price estimate</span><b>${money(pk.price)}</b></li><li><span>Status</span><b>Requested</b></li></ul><div class="pay-actions"><button type="button" class="pay-btn" data-act="profile">View my orders</button><button type="button" class="pay-btn ghost" data-act="close">Continue exploring</button></div></div>`, 'wide');
  }

  /* ---------------- legacy demo checkout handlers (not exposed in browse-only UI) ---------------- */
  function buy(id, tier) {
    const p = pById[id];
    if (!p) return;
    const u = currentUser();
    if (!u) {
      sessionStorage.setItem('flhPending', JSON.stringify({ id, tier }));
      sessionStorage.setItem('freelancingHubRole', 'User');
      toast('Please log in to continue with your purchase…');
      setTimeout(() => { location.href = 'login.html'; }, 900);
      return;
    }
    const d = dById[p.devId];
    if (d && d.real && d.email && String(d.email).toLowerCase() === String(u.email).toLowerCase()) {
      toast("This is your own listing, so you can't buy it.");
      return;
    }
    paymentModal(p, tier);
  }

  function resume() {
    let pend = null;
    try { pend = JSON.parse(sessionStorage.getItem('flhPending') || 'null'); } catch (e) { /* ignore */ }
    if (!pend || !currentUser()) return;
    sessionStorage.removeItem('flhPending');
    if (pById[pend.id]) buy(pend.id, pend.tier);
  }
  window.flhResume = resume;

  /* ---- legacy demo payment code (not exposed in browse-only UI) ---- */
  const pay = { id: null, tier: null, mode: 'card' };
  const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Bank of Baroda', 'Punjab National Bank'];

  function payFields(mode) {
    if (mode === 'upi') {
      return `<label for="payUpi">UPI ID</label><input id="payUpi" placeholder="name@upi" autocomplete="off">`;
    }
    if (mode === 'bank') {
      return `<label for="payBank">Choose your bank</label><select id="payBank"><option value="">Select bank</option>${BANKS.map(b => `<option>${esc(b)}</option>`).join('')}</select>`;
    }
    return `<label for="payName">Name on card</label><input id="payName" placeholder="Your name" autocomplete="cc-name">
      <label for="payNum">Card number</label>
      <div class="input-wrap"><input id="payNum" inputmode="numeric" placeholder="1234 5678 9012 3456" maxlength="19" autocomplete="cc-number"><span class="brand-tag" id="payBrand"></span></div>
      <div class="pay-row"><div><label for="payExp">Expiry</label><input id="payExp" inputmode="numeric" placeholder="MM/YY" maxlength="5" autocomplete="cc-exp"></div>
      <div><label for="payCvv">CVV</label><input id="payCvv" type="password" inputmode="numeric" placeholder="•••" maxlength="3" autocomplete="cc-csc"></div></div>`;
  }

  function paymentModal(p, tier) {
    const pk = p.packages.find(x => x.name === tier) || p.packages[0];
    const d = dById[p.devId] || { name: 'Developer' };
    pay.id = p.id; pay.tier = pk.name; pay.mode = 'card';
    openModal(`<button type="button" class="modal-x" data-act="close" aria-label="Close">×</button>
      <div class="pay-grid">
        <aside class="pay-sum">
          <img src="${esc(p.image)}" alt="">
          <span class="pill">${esc(pk.name)} package</span>
          <h3>${esc(p.title)}</h3>
          <p class="muted">by ${esc(d.name)}</p>
          <ul class="pay-lines">
            <li><span>Delivery</span><b>${esc(pk.duration)}</b></li>
            <li><span>${esc(pk.name)} package</span><b>${money(pk.price)}</b></li>
            <li class="total"><span>Total</span><b>${money(pk.price)}</b></li>
          </ul>
        </aside>
        <section class="pay-card" id="payCard">
          <h2>PAYMENT</h2>
          <p class="pay-sub">Choose how you’d like to pay</p>
          <div class="pay-tabs">
            <button type="button" class="active" data-act="paytab" data-mode="card">Card</button>
            <button type="button" data-act="paytab" data-mode="upi">UPI</button>
            <button type="button" data-act="paytab" data-mode="bank">Net Banking</button>
          </div>
          <div id="payFields">${payFields('card')}</div>
          <div class="pay-msg" id="payMsg" role="alert"></div>
          <button type="button" class="pay-btn" id="payBtn" data-act="pay">PAY ${money(pk.price)}</button>
          <p class="pay-note">🔒 Demo checkout. No real payment is processed. Test card: 4111 1111 1111 1111</p>
        </section>
      </div>`, 'wide pay-modal');
  }

  const luhn = n => { let s = 0, alt = false; for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; } return s % 10 === 0; };
  function expValid(v) {
    const m = /^(\d{2})\/(\d{2})$/.exec(v);
    if (!m) return false;
    const mm = +m[1], yy = 2000 + (+m[2]), now = new Date();
    return mm >= 1 && mm <= 12 && (yy > now.getFullYear() || (yy === now.getFullYear() && mm >= now.getMonth() + 1));
  }
  const flag = (id, bad) => { const el = document.getElementById(id); if (el) el.classList.toggle('err', bad); return bad; };

  function doPay() {
    const msg = $('#payMsg');
    msg.textContent = '';
    let method = '';
    if (pay.mode === 'card') {
      const num = ($('#payNum').value || '').replace(/\s/g, '');
      const bad = [
        flag('payName', ($('#payName').value || '').trim().length < 3),
        flag('payNum', num.length < 13 || !luhn(num)),
        flag('payExp', !expValid($('#payExp').value || '')),
        flag('payCvv', ($('#payCvv').value || '').length !== 3)
      ];
      if (bad.some(Boolean)) { msg.textContent = 'Please check the highlighted fields.'; return; }
      method = 'Card •••• ' + num.slice(-4);
    } else if (pay.mode === 'upi') {
      const v = ($('#payUpi').value || '').trim();
      if (flag('payUpi', !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v))) { msg.textContent = 'Enter a valid UPI ID (for example name@upi).'; return; }
      method = 'UPI';
    } else {
      const b = $('#payBank').value;
      if (flag('payBank', !b)) { msg.textContent = 'Please choose your bank.'; return; }
      method = 'Net Banking (' + b + ')';
    }
    const btn = $('#payBtn');
    btn.disabled = true; btn.textContent = 'Processing…';
    setTimeout(() => completeOrder(method), 1100);
  }

  function completeOrder(method) {
    const p = pById[pay.id], u = currentUser();
    if (!p || !u) { closeModal(); return; }
    const pk = p.packages.find(x => x.name === pay.tier) || p.packages[0];
    const d = dById[p.devId] || { name: 'Developer' };
    const order = {
      id: 'FLH-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10),
      productId: p.id, title: p.title, tier: pk.name, price: pk.price, duration: pk.duration,
      devId: p.devId, devName: d.name, method: method, at: new Date().toISOString()
    };
    const key = 'flhOrders:' + String(u.email).toLowerCase();
    const list = LS.get(key, []);
    list.unshift(order);
    LS.set(key, list);
    const card = $('#payCard');
    if (card) {
      card.innerHTML = `<div class="pay-success"><div class="tick">✓</div><h2>Payment Successful</h2>
        <p class="pay-sub">Thank you, ${esc(u.name)}! Your order is confirmed.</p>
        <ul class="pay-lines light"><li><span>Order ID</span><b>${esc(order.id)}</b></li><li><span>Service</span><b>${esc(order.title)}</b></li><li><span>Package</span><b>${esc(order.tier)}</b></li><li><span>Paid</span><b>${money(order.price)}</b></li><li><span>Method</span><b>${esc(order.method)}</b></li></ul>
        <p class="pay-note">After delivery, rate ${esc(d.name)} from your profile → My orders.</p>
        <div class="pay-actions"><button type="button" class="pay-btn" data-act="profile">View my orders</button><button type="button" class="pay-btn ghost" data-act="close">Continue browsing</button></div></div>`;
    }
  }

  /* ---------------- profile, orders, rating ---------------- */
  function profileModal() {
    const u = currentUser();
    if (!u) return;
    const email = String(u.email).toLowerCase();
    const isDev = u.role === 'Developer';
    const orders = LS.get('flhOrders:' + email, []);
    const reviews = allReviews();
    const dp = isDev ? LS.get('freelancingHubDeveloperProfile:' + email, null) : null;
    const myProds = isDev ? LS.get('freelancingHubProducts:' + email, []) : [];
    const img = (dp && dp.avatar) || (isDev ? 'developer.png' : 'user.png');
    const r = isDev ? devRating('r:' + email) : null;
    const joined = u.joinedAt ? new Date(u.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

    openModal(`<button type="button" class="modal-x" data-act="close" aria-label="Close">×</button>
      <div class="dev-profile">
        <img class="av" style="width:92px;height:92px;background:#fff" src="${esc(img)}" alt="">
        <div>
          <h2>${esc(u.name)} <span class="new-badge">${esc(u.role || 'User')}</span></h2>
          <p class="dev-title">${esc(u.email)}${u.phone ? ' · ' + esc(u.phone) : ''}</p>
          ${joined ? `<p class="dev-sub">Last signed in ${esc(joined)}</p>` : ''}
          ${isDev ? `<div class="big-rate">${ratingHtml('r:' + email)}</div>` : ''}
        </div>
      </div>
      ${isDev ? `<div class="pd-quick"><div><small>Services published</small><b>${myProds.length}</b></div><div><small>Profile</small><b>${dp && dp.bio ? 'Complete' : 'Incomplete'}</b></div></div>
        <div class="pay-actions left"><a class="btn btn-dark" href="developer.html">Open Developer Studio →</a></div>` : ''}
      <h3 class="pkg-title">My orders (${orders.length})</h3>
      ${orders.length ? `<div class="orders">${orders.map(o => {
        const rated = reviews.find(x => x.orderId === o.id);
        return `<div class="order"><div><b>${esc(o.title)}</b><small>${esc(o.tier)} · ${esc(o.duration)} · ${esc(o.devName)}</small><small>${esc(o.id)} · ${new Date(o.at).toLocaleDateString('en-IN')} · ${esc(o.method || 'Order')}</small>${o.developerNote ? `<small><b>Developer note:</b> ${esc(o.developerNote)}</small>` : ''}${o.deliveryNote ? `<small><b>Delivery:</b> ${esc(o.deliveryNote)}</small>` : ''}</div>
          <div class="order-side"><b>${money(o.price)}</b><span class="ok">${esc(o.status || 'Requested')}</span>
          ${rated ? `<span class="rated">You rated ${'★'.repeat(rated.rating)}</span>` : `<button type="button" class="btn btn-outline" data-act="rate" data-order="${esc(o.id)}">Rate developer</button>`}</div></div>`;
      }).join('')}</div>` : '<div class="empty-state"><p>No orders yet. Explore a service and send an order request to a developer.</p></div>'}
      <div class="pay-actions left"><button type="button" class="btn btn-outline" data-act="signout">Sign out</button></div>`, 'wide');
  }
  window.flhOpenProfile = profileModal;

  let rateState = { orderId: null, value: 0 };
  function rateModal(orderId) {
    const u = currentUser();
    if (!u) return;
    const o = LS.get('flhOrders:' + String(u.email).toLowerCase(), []).find(x => x.id === orderId);
    if (!o) return;
    rateState = { orderId, value: 0 };
    openModal(`<button type="button" class="modal-x" data-act="close" aria-label="Close">×</button>
      <div class="rate-box"><h2>Rate ${esc(o.devName)}</h2><p class="muted">${esc(o.title)} · ${esc(o.tier)}</p>
      <div class="star-input" id="starInput">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-act="star" data-v="${i}" aria-label="${i} star${i > 1 ? 's' : ''}">★</button>`).join('')}</div>
      <textarea id="rateText" maxlength="300" placeholder="Share a few words about your experience (optional)"></textarea>
      <div class="pay-msg" id="rateMsg" role="alert"></div>
      <div class="pay-actions left"><button type="button" class="btn btn-dark" data-act="submitRate">Submit rating</button><button type="button" class="btn btn-outline" data-act="profile">Cancel</button></div></div>`);
  }
  function setStars(v) {
    rateState.value = v;
    $$('#starInput button').forEach(b => b.classList.toggle('on', +b.dataset.v <= v));
  }
  function submitRate() {
    const u = currentUser();
    if (!u) return;
    if (!rateState.value) { $('#rateMsg').textContent = 'Please choose 1 to 5 stars.'; return; }
    const o = LS.get('flhOrders:' + String(u.email).toLowerCase(), []).find(x => x.id === rateState.orderId);
    if (!o) return;
    const list = allReviews();
    if (list.some(x => x.orderId === o.id)) { profileModal(); return; }
    list.push({ devId: o.devId, orderId: o.id, rating: rateState.value, text: ($('#rateText').value || '').trim(), by: u.name, at: new Date().toISOString() });
    if (LS.set('flhReviews', list)) {
      toast('Thanks! Your rating was saved.');
      renderAll();
      profileModal();
    }
  }

  /* ---------------- events ---------------- */
  function renderAll() { render(); renderDevs(); }

  function openCat(id) {
    st.view = 'cat'; st.catId = id; st.subId = 'all';
    render(); scrollToMarket();
  }

  document.addEventListener('click', e => {
    if (e.target.classList && e.target.classList.contains('modal-back')) { closeModal(); return; }
    const popular = e.target.closest('.popular a[data-category]');
    if (popular) {
      e.preventDefault();
      const c = F.catByName(popular.dataset.category);
      const input = $('#serviceSearch');
      if (input) input.value = '';
      if (c) openCat(c.id);
      return;
    }
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const act = t.dataset.act, id = t.dataset.id;
    switch (act) {
      case 'cat': closeModal(); openCat(id); break;
      case 'sub': st.subId = id; render(); break;
      case 'home': st.view = 'cats'; st.catId = null; st.subId = 'all'; render(); break;
      case 'clear': { const i = $('#serviceSearch'); if (i) i.value = ''; st.view = 'cats'; st.q = ''; render(); break; }
      case 'product': { const viewed = pById[id]; trackDeveloperMetric(viewed, 'clicks'); productModal(id); break; }
      case 'requestOrder': requestOrder(id); break;
      case 'dev': devModal(id); break;
      case 'buy': break;
      case 'close': closeModal(); break;
      case 'allDevs': showAllDevs = !showAllDevs; renderDevs(); break;
      case 'paytab':
        pay.mode = t.dataset.mode;
        $$('.pay-tabs button').forEach(b => b.classList.toggle('active', b === t));
        $('#payFields').innerHTML = payFields(pay.mode);
        $('#payMsg').textContent = '';
        break;
      case 'pay': doPay(); break;
      case 'profile': profileModal(); break;
      case 'rate': rateModal(t.dataset.order); break;
      case 'star': setStars(+t.dataset.v); break;
      case 'submitRate': submitRate(); break;
      case 'signout':
        localStorage.removeItem('freelancingHubCurrentUser');
        sessionStorage.removeItem('freelancingHubShowWelcome');
        location.href = 'index.html';
        break;
    }
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && mroot.classList.contains('open')) closeModal(); });

  // payment field formatting
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'payNum') {
      const v = el.value.replace(/\D/g, '').slice(0, 16);
      el.value = v.replace(/(.{4})/g, '$1 ').trim();
      const b = $('#payBrand');
      if (b) b.textContent = /^4/.test(v) ? 'VISA' : /^5[1-5]/.test(v) ? 'MASTERCARD' : /^6/.test(v) ? 'RUPAY' : '';
    } else if (el.id === 'payExp') {
      let v = el.value.replace(/\D/g, '').slice(0, 4);
      if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
      el.value = v;
    } else if (el.id === 'payCvv') {
      el.value = el.value.replace(/\D/g, '').slice(0, 3);
    }
  });

  // search
  const form = $('#searchForm'), input = $('#serviceSearch');
  function doSearch(scroll) {
    const q = (input.value || '').trim();
    if (!q) { if (st.view === 'search') { st.view = 'cats'; render(); } return; }
    st.view = 'search'; st.q = q;
    render();
    if (scroll) scrollToMarket();
  }
  if (form && input) {
    form.addEventListener('submit', e => { e.preventDefault(); doSearch(true); });
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const q = input.value.trim();
        if (q.length >= 2) doSearch(false);
        else if (!q && st.view === 'search') { st.view = 'cats'; render(); }
      }, 250);
    });
  }

  // other tabs (e.g. Developer Studio) publishing products → refresh the catalogue
  window.addEventListener('storage', ev => {
    if (ev.key && /^freelancingHub(Products|DeveloperProfile):|^flhReviews$/.test(ev.key)) { refresh(); renderAll(); }
  });

  /* ---------------- start ---------------- */
  refresh();
  renderAll();
  if (!window.flhWelcomeShown) resume();
})();
