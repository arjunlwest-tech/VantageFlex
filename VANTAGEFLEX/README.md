# Vantage Flex

**Premium AI-Powered Fitness Platform**

Vantage Flex is a static web application for generating workouts, meal plans, and recipes. Built with vanilla JavaScript and ready for Cloudflare Pages deployment.

## Features

- 🤖 **AI Workout Generator** - Personalized routines based on your level and goals
- 🏋️ **Equipment-Based Workouts** - Generate workouts using only your available equipment
- 🥗 **Smart Meal Plans** - Nutrition plans with macro tracking
- 🍳 **Recipe Generator** - Custom recipes based on your ingredients
- 🎯 **Quest System** - Complete daily challenges for XP
- 🏆 **Global Leaderboard** - Compete with other users
- 🌓 **Light/Dark Mode** - Toggle between themes
- ✨ **Smooth Animations** - 20+ animation effects throughout

## Cloudflare Pages Deployment

### Method 1: Git Integration (Recommended)

1. Push your code to GitHub/GitLab
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Go to **Pages** → **Create a project**
4. Connect your Git repository
5. Configure build settings:
   - **Build command:** (leave empty - static site)
   - **Build output directory:** `/`
6. Click **Save and Deploy**

### Method 2: Direct Upload

1. Zip all files in the `VANTAGEFLEX` folder
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Go to **Pages** → **Create a project** → **Upload assets**
4. Upload your zip file
5. Deploy!

### Method 3: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy .
```

## Project Structure

```
VANTAGEFLEX/
├── index.html          # Home / Workout Generator
├── equipment.html      # Equipment-based workouts
├── meal-plans.html     # Meal planning
├── recipes.html        # Recipe generator
├── quests.html         # Daily quests
├── leaderboard.html    # Global rankings
├── dashboard.html      # User stats & history
├── about.html          # About page
├── privacy.html        # Privacy policy
├── subscription.html   # Pricing
├── 404.html           # Error page
├── styles.css         # Main stylesheet
├── app.js             # Core utilities & data
├── workout.js         # Workout generator logic
├── equipment.js       # Equipment page logic
├── meal-plans.js      # Meal planning logic
├── recipes.js         # Recipe logic
├── quests.js          # Quest system with camera
├── leaderboard.js     # Leaderboard logic
├── dashboard.js       # Dashboard logic
├── _headers           # Cloudflare headers config
├── _redirects         # Cloudflare redirects config
└── README.md          # This file
```

## Configuration Files

### `_headers`
Security headers and caching rules for Cloudflare Pages:
- X-Frame-Options, X-Content-Type-Options
- Content Security Policy
- Long-term caching for static assets

### `_redirects`
URL routing configuration:
- Clean URLs without `.html` extension
- Trailing slash handling
- Custom path redirects

## Local Development

No build process required! Simply open any HTML file in your browser:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

## Technologies

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **AI/ML:** TensorFlow.js (for pose detection in quests)
- **Storage:** LocalStorage (client-side persistence)
- **Hosting:** Cloudflare Pages
- **Fonts:** Inter (Google Fonts)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Notes

- All data is stored locally in the browser (LocalStorage)
- No backend server required
- Camera access only needed for quest verification feature
- Google Ads integration included (optional)

## License

© 2026 Vantage Flex. Forged by Vantage Suites.
