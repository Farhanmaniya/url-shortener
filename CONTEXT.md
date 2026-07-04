# URL Shortener (Shortly) - Context

## Project Info
- Name: Shortly
- Stack: Node.js, Express 5, MongoDB Atlas, Redis Cloud, EJS (server-rendered, NOT React)
- Styling: Tailwind CSS via CDN + Inter font (Google Fonts) — Clean minimal SaaS theme
- Theme tokens: bg #F8FAFC, accent #2563EB blue-600, text #0F172A slate-900, border #E2E8F0
- Port: 3000
- DB: MongoDB Atlas | Redis Cloud (for sessions)
- Syntax: CommonJS throughout (require/module.exports)
- Auth: Session-based (express-session + connect-redis) — NOT JWT

## Folder Structure
url-shortener/
├── config/
│   ├── db.js                    — MongoDB connection (connectDB async function)
│   └── redis.js                 — Redis connection (redisClient + connectRedis async function)
├── controllers/
│   ├── urlController.js         — handleURLShortening, handleURLRedirection, handleGetAnalytics, handleMyLinks
│   └── userController.js        — handleUserRegistration, handleUserLogin, handleUserLogout
├── middleware/
│   └── auth.middleware.js       — isLoggedIn (checks req.session.userId, redirects to /login if missing)
├── models/
│   ├── url.js                   — URL schema
│   └── users.js                 — User schema with pre-save bcrypt hook
├── routes/
│   ├── staticRoutes.js          — GET / (home), GET /login, GET /signup
│   ├── urlRoutes.js             — POST /api/shorten, GET /api/analytics/:shortId, GET /api/mylinks
│   └── userRoutes.js            — POST /user/signup, POST /user/login, POST /user/logout
├── views/
│   ├── partials/
│   │   └── navbar.ejs           — Shared navbar (login/logout state aware via locals.userId)
│   ├── home.ejs                 — Main page: shorten form + recent links table
│   ├── login.ejs                — Login page with error display
│   ├── signup.ejs               — Signup page with error display
│   └── mylinks.ejs              — My Links dashboard (protected, logged-in users only)
├── index.js                     — App entry point
└── .env                         — MONGO_URI, REDIS_URL, SESSION_SECRET

## FULLY COMPLETE ✅
- [x] config/db.js — connectDB, process.exit(1) on failure
- [x] config/redis.js — redisClient + connectRedis, exports both
- [x] index.js — startServer() async: connectDB → connectRedis → register redisStore + session middleware → register routes → app.listen(). res.locals.userId middleware wired after session, before routes.
- [x] models/users.js — username, email (unique), password. Async pre-save hook: bcrypt.hash(password, 10) only if isModified('password'). No next() — Mongoose 9 async hooks use throw/return not next()
- [x] models/url.js — shortId (unique), redirectURL, visitHistory ([{timestamp: Number}]), createdBy (ObjectId ref 'User', default: null)
- [x] middleware/auth.middleware.js — isLoggedIn: checks req.session.userId, redirects /login if missing
- [x] userController.js — signup (auto-login, error.code 11000 → res.render signup with error), login (bcrypt.compare, findOne by email only), logout (session.destroy + clearCookie)
- [x] urlController.js — shorten (crypto.randomBytes, createdBy from session), redirect (findOneAndUpdate pushes timestamp), analytics (visitHistory.length), myLinks (find by createdBy)
- [x] All routes wired correctly
- [x] All 4 EJS pages styled with Tailwind CDN + Inter font
- [x] Navbar partial — shows My Links + Logout when logged in, Login + Sign Up when not
- [x] res.locals.userId — set from session in index.js, available in all EJS templates automatically

## Key Decisions
- Session-based auth (not JWT) — deliberately chosen to learn new concept
- Redis Cloud (not local) — no official Windows Redis support
- EJS not React — server-rendered, genuinely different mental model
- nanoid REMOVED — v5 ESM-only, crashes with require(). Use crypto.randomBytes(4).toString('hex') instead
- Anonymous shortening allowed — createdBy: null for guests, createdBy: userId for logged-in users
- startServer() pattern — redisStore + session middleware + routes ALL inside startServer(), after await connectRedis(). Redis has no command buffering — crashes if used before connected
- express-session default cookie name: 'connect.sid' — used in res.clearCookie() on logout
- req.session.destroy() is callback-style, not async/await
- Duplicate email: error.code === 11000 → res.render('signup', { error })
- Login failure: always same message "Invalid email or password" — never reveal which field failed
- Mongoose 9 async pre hooks: use return (not next()) to skip, no next() call at end

## Signature Design Element
Short IDs displayed in font-mono blue (text-blue-600) throughout — monospace treatment makes the app feel like a developer tool, consistent across home table, mylinks table, and generated URL display.

## Known Cleanup (not done, not blocking)
- service/auth.js — old in-memory session file, can be deleted
- uuid package — still in package.json, no longer used anywhere

## Notes Worth Remembering (📝)
- Session vs JWT: JWT = client carries proof (stateless). Session = server remembers, client carries lookup ID (stateful)
- Redis TTL = physically deletes key when expired. JWT expiry = token still exists, just rejected on check
- In-memory Map session storage dies on server restart. Redis survives — separate process
- req.user = JWT pattern. req.session.userId = session pattern. Don't mix across projects
- Hashing ≠ Encryption. One-way math — never "unhash," only re-hash and compare
- MongoDB duplicate key error code = 11000
- Every catch block needs a guaranteed response — missing fallback = request hangs forever
- 400 = client's fault. 500 = server's fault
- crypto.randomBytes(n).toString('hex') → n×2 hex chars. 4 bytes = 8 chars
- saveUninitialized: false — don't create empty sessions for logged-out visitors
- res.cookie() sets, res.clearCookie() removes
- Never query DB with raw password — findOne({email}) only, then bcrypt.compare() separately
- res.locals.userId = clean way to pass session data to ALL EJS templates without touching every controller
- EJS partials: <%- include('partials/navbar') %> — write once, reuse everywhere