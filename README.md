<<<<<<< HEAD
# Golden Skills - Skill Development Platform

A modern, responsive website for Golden Skills - a premium skill-development platform designed to help learners grow through practical experience by completing real-world tasks inside a mobile application.

## 🌟 Project Overview

Golden Skills is a comprehensive learning platform that bridges the gap between theoretical knowledge and practical application. Users can develop skills, complete real-world tasks, and earn rewards through our mobile application.

## 🎨 Design Features

### Color Scheme
- **Primary Color:** Dark Red (#390910)
- **Secondary Color:** Reddish Brown (#772218)
- **Accent Color:** Gold (#D4AF37)
- **Background:** Light Cream (#F9F6F2)
- **Text:** Dark Brown (#2B1B1B)

### Typography
- **Headings:** Poppins (SemiBold - 600)
- **Body Text:** Inter (Regular - 400)
- **Buttons:** Inter (Medium - 500)

## 🚀 Features

### Navigation
- **Fixed navbar** with gradient background
- **Active page indication** with gold underline
- **Responsive mobile menu** with auto-close functionality
- **Smooth hover effects** on navigation links
- **Logo integration** with brand text

### Hero Section
- **Full-screen background image** with gradient overlay
- **Left-aligned content** taking half the screen on desktop
- **Gradient text effects** for key words
- **Call-to-action button** with hover animations
- **Yellow accent line** at the bottom

### Cards Section
- **Full-width image cards** without text content
- **Three feature cards:** Learn New Skills, Work on Real Tasks, Earn Rewards
- **Hover effects** with smooth animations
- **Responsive grid layout** using Bootstrap

### About Section
- **Left-aligned content** for better readability
- **Mission image section** with responsive images
  - Desktop: Horizontal mission image
  - Mobile: Vertical mission image for better mobile experience
- **Vision section** with text and image layout
- **Clean typography** and spacing

### Courses Section
- **Three course cards** with GIF images
- **Course categories:** Content Writing, Digital Marketing, Graphic Basics
- **"View in App" buttons** with bold text
- **How It Works workflow** with 4 steps:
  1. Download the app
  2. Learn skills
  3. Complete tasks
  4. Earn rewards
- **Responsive arrows:** Horizontal on desktop, vertical on mobile

### Tasks Section
- **Full-width image cards** for task types
- **Three task categories:** Learn, Apply, Reward
- **Clean card design** without text content
- **Note section** explaining mobile app requirement

### Footer
- **Gradient background** matching navbar
- **App store download links** (Google Play, App Store)
- **Social media integration** (Instagram)
- **Legal links** and copyright information
- **Three-column layout** on desktop

## 🛠️ Technical Stack

### Frontend
- **React 18** - Modern React with functional components
- **React Router DOM** - Client-side routing
- **Bootstrap 5** - Responsive design framework
- **CSS3** - Custom styling with CSS variables
- **Font Awesome** - Icons for UI elements
- **Google Fonts** - Poppins and Inter typography

### Build Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and quality
- **Modern JavaScript (ES6+)**

## 📱 Responsive Design

### Breakpoints (Bootstrap)
- **Extra Small (xs):** <576px
- **Small (sm):** 576px - 767px
- **Medium (md):** 768px - 991px
- **Large (lg):** 992px - 1199px
- **Extra Large (xl):** ≥1200px

### Mobile Features
- **Responsive navigation** with hamburger menu
- **Mobile-optimized images** for mission section
- **Vertical workflow arrows** on small screens
- **Touch-friendly buttons** and interactions
- **Optimized typography** scaling

## 🎯 Key Functionalities

### Navigation System
- **Active page detection** using React Router's useLocation
- **Smooth scrolling** and transitions
- **Mobile menu auto-close** when links are clicked
- **Hover effects** with underline animations

### Image Management
- **Responsive images** with proper aspect ratios
- **Mobile-specific images** for better mobile experience
- **Optimized loading** with proper alt texts
- **Hover animations** and scaling effects

### User Experience
- **Consistent left-aligned content** for better readability
- **Smooth animations** and transitions
- **Professional gradient backgrounds**
- **Clear visual hierarchy** with proper typography
- **Accessible design** with proper contrast ratios

## 📂 Project Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   ├── bg.jpeg (Hero background)
│   │   ├── golden logo.jpeg (Logo)
│   │   ├── our mission.png (Desktop mission)
│   │   ├── ourmission mobile.png (Mobile mission)
│   │   ├── VISION.png (Vision image)
│   │   ├── earn reward.png (Card image)
│   │   ├── new skill.png (Card image)
│   │   ├── work on real task.png (Card image)
│   │   ├── learn.png (Task image)
│   │   ├── appply.png (Task image)
│   │   ├── reward.png (Task image)
│   │   ├── content writing.gif (Course GIF)
│   │   ├── digital.gif (Course GIF)
│   │   └── graphic basic.gif (Course GIF)
│   ├── components/
│   │   ├── Navbar.jsx & Navbar.css
│   │   ├── Hero.jsx & Hero.css
│   │   ├── Cards.jsx & Cards.css
│   │   ├── About.jsx & About.css
│   │   ├── Courses.jsx & Courses.css
│   │   ├── Tasks.jsx & Tasks.css
│   │   └── Footer.jsx & Footer.css
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Courses.jsx
│   │   └── Tasks.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css (CSS variables)
│   └── main.jsx
├── package.json
└── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd golden-skills
   ```

2. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
cd frontend
npm run build
```

### Preview Production Build

```bash
cd frontend
npm run preview
```

## 🌐 Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel with the included `vercel.json` configuration file.

#### Automatic Deployment
1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Vercel Configuration
The `vercel.json` file handles:
- **SPA Routing:** Redirects all routes to `index.html` for client-side routing
- **Build Command:** Automatically builds the frontend
- **Output Directory:** Points to `frontend/dist`
- **Install Command:** Installs dependencies in the frontend directory

### Other Deployment Options

#### Netlify
1. Build the project: `cd frontend && npm run build`
2. Upload the `frontend/dist` folder to Netlify
3. Add redirect rule: `/* /index.html 200`

#### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json: `"homepage": "https://yourusername.github.io/golden-skills"`
3. Add deploy script: `"deploy": "gh-pages -d frontend/dist"`
4. Run: `npm run deploy`

## 🎨 Customization

### Colors
Update CSS variables in `src/index.css`:
```css
:root {
  --primary-color: #390910;
  --accent-color: #D4AF37;
  --background-color: #F9F6F2;
  --text-color: #2B1B1B;
}
```

### Typography
Modify font families in `src/index.css`:
```css
:root {
  --heading-font: 'Poppins', 'Inter', sans-serif;
  --body-font: 'Inter', 'Poppins', sans-serif;
}
```

### Images
Replace images in `src/assets/` directory with your own assets.

## 📱 Mobile App Integration

The website promotes a mobile application where users can:
- Access skill-based courses
- Complete real-world tasks
- Earn performance-based rewards
- Track learning progress

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For questions or support regarding Golden Skills platform:
- Website: [Your Website URL]
- Email: [Your Email]
- Social Media: [@GoldenSkills](https://instagram.com/goldenskills)

## 🙏 Acknowledgments

- **Bootstrap** for responsive design framework
- **Font Awesome** for beautiful icons
- **Google Fonts** for typography
- **React** community for excellent documentation
- **Vite** for fast development experience

---

**Golden Skills** - Empowering individuals to learn, apply, and grow with confidence through practical skill development.
=======
#golden skills
>>>>>>> 45fccc0a0cf830ca30e2ecfa86382cf54d47db9a
