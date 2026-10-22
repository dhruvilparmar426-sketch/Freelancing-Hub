Freelancing Hub — Developer/User login split + Developer Studio

Files:
- index.html: public user landing page; now includes a separate Developer Studio entry link.
- login.html: existing combined user login flow, unchanged in purpose.
- signup.html: shared signup page; choose Developer to create a developer account or User / Client for a user account.
- developer-login.html: dedicated developer-only login page.
- developer.html: developer-only dashboard with profile setup, product catalogue, and multi-step product creator.
- style.css, script.js, developer.png, user.png: original site assets.

Developer flow:
1. From the public landing page, choose Developer Studio.
2. Create an account from the developer login page (choose Developer on signup), then sign in.
3. Complete Developer profile: display name, professional title, email, specialty, about, portfolio URL and optional profile image.
4. Add product using the step-by-step wizard:
   - Step 1: title, category, description
   - Step 2: sample image and sample description
   - Step 3: Basic, Standard and Premium package prices, delivery durations and included features
   - Step 4: review and publish
5. View and delete listings from My products. Data persists in the same browser for this demo.

Access separation:
- developer.html checks that the current demo session role is Developer. Users without a developer session are redirected to developer-login.html.
- The public landing page remains the user-facing landing page; developer functionality is on the separate Developer Studio page.

Run:
Keep all files in the same folder and open index.html through a local web server or your hosting environment.

IMPORTANT SECURITY / PRODUCTION NOTE:
This is a front-end prototype. Existing demo signup/login stores passwords in localStorage, and developer profile/product records are stored in browser localStorage. This is not secure production authentication and does not upload products to a shared server. Before public deployment, implement backend authentication, password hashing, server-side sessions, database storage, role-based authorization, and secure image uploads (e.g. PHP + MySQL or another backend). The image uploader currently limits images to 2 MB and stores image data in this browser only.


=== LANDING PAGE MARKETPLACE (new) ===
Everything below happens on index.html, with no page reloads:
- Landing page opens first. Visitors can browse without logging in.
- Login once: the session is kept in localStorage, so login.html is not shown again (it redirects back to the landing page). Header then shows "<name>'s Profile" and Sign out.
- Search (hero box) finds categories, services and developers while typing.
- Category -> sub-categories (chips) -> each sub-category shows its own products.
- "Explore more" opens the product: image, title, description, developer + rating, delivery time, price and 3 packages (Basic / Standard / Premium).
- "Buy Now" -> payment (Card / UPI / Net Banking). If not logged in, the visitor is sent to login and the purchase continues right after login.
- Profile: details, My orders, and "Rate developer" (1-5 stars) after an order.
- Developers section: ratings + profile + their services. Developers who register and publish in Developer Studio appear here first, and their products appear in the category/sub-category they chose.

New files: catalog.js (categories, sample developers/products, loader for real Developer Studio data), market.js (all marketplace logic), market.css (styles).
Changed: index.html, script.js, developer.html (now has Category + Sub-category dropdowns).

NOTE: 9 categories x 3 sub-categories x 3 sample products = 81 sample products by 16 sample developers, so the site never looks empty. Replace/remove them in catalog.js when you have enough real listings.
Payment is a DEMO: no real money is processed and card details are never stored. Connect Razorpay/Stripe + a backend before going live.
Because data is stored in each browser (localStorage), a developer's listings are only visible in that same browser. To show them to all visitors you need a shared backend/database (e.g. Firebase, Supabase or PHP + MySQL).


VISUAL UPDATE: Product listings now use category-matched photographic thumbnails from Unsplash. An internet connection is needed for remote photos. Uploaded product sample images still take priority. Brand display name updated to Freelancing Hub.


GEMINI AI CHATBOT + VOICE ASSISTANT SETUP
========================================
This project now includes a Gemini-powered chat widget and browser voice input / spoken replies. The live AI needs a Gemini API key and Node.js backend; it will not answer with Gemini when opened by double-clicking index.html.

1. Install Node.js (LTS) on your computer.
2. Extract this ZIP and open a terminal in this project folder.
3. Run: npm install
4. Copy .env.example to a new file named .env.
5. Get a Gemini API key from Google AI Studio (https://aistudio.google.com/apikey) and put it in .env as GEMINI_API_KEY=your_key. Never publish or share your .env file.
6. Run: npm start
7. Open http://localhost:3000 in your browser.

Voice input uses browser speech recognition and may require microphone permission and a supported browser. Spoken replies use the browser's speech synthesis. For public hosting, deploy the Node server and configure GEMINI_API_KEY as a private environment variable. Do not upload .env or expose the API key in client-side JavaScript. API usage may be billed or subject to Google AI quotas.


UPDATED USER EXPERIENCE
=======================
- User mode is browse-only: service cards use an Explore more action. There are no Buy Now or payment actions in the public catalogue.
- Product details show the tools/software used and compare Basic, Standard and Premium package information.
- Sample catalogue contains 81 sample products across 9 categories and 27 sub-categories. Sample thumbnails use different Unsplash photo IDs within each category; internet access is required.
- Developer Studio now asks developers to list their real tools/software for each product; these appear to users on the product details page.
- Developer login redirects directly to Developer Studio. A developer session is redirected away from the user marketplace.
- The Gemini assistant is available in both user and developer pages. The API key is read only by the Node backend from a local .env file and is never placed in browser JavaScript.

SECURITY REMINDER
=================
This ZIP intentionally does NOT include a .env file or any API key. Copy .env.example to .env and add your own key locally. If an earlier ZIP containing a real key was shared or uploaded anywhere, revoke that key in Google AI Studio and create a replacement before continuing. Demo login still stores passwords in localStorage and is not production-safe.


ORDER REQUESTS + DEVELOPER ORDER BOX (UPDATED)
==============================================
- Product cards still show only “Explore more”; no Buy Now button is shown on the public listing cards.
- Inside a product's Explore details, users can choose a package and send an order request with a project description. This is a request workflow, not real payment processing.
- Developer Studio has an Order box tab. Developers can review customer requirements, accept an order with a note/suggestions, then use the single “Deliver order” action and optionally add delivery details.
- Order status and developer/delivery notes are reflected in the user's My orders panel.
- IMPORTANT: this is browser localStorage demo data. For different users/devices or public deployment, connect a shared database and authenticated backend; localStorage does not securely share orders between different browsers/devices.
