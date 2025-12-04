# Static Components Library

This folder contains static HTML/Tailwind CSS versions of the Netflix Clone components. These files are designed for easy reference, prototyping, and future development work.

## 📁 Structure

```
static/
├── index.html              # Main landing page with component overview
└── components/
    ├── hero.html          # Hero section with video background
    ├── button.html        # Button component with variants
    ├── movie-card.html    # Movie/TV show card component
    ├── navbar.html        # Navigation bar with side menu
    ├── search.html        # Search input component
    └── carousel.html      # Horizontal scrolling carousel
```

## 🚀 Quick Start

1. **Open the library**: Open `static/index.html` in your browser to see the component overview
2. **View individual components**: Click on any component card to see detailed examples
3. **Copy and use**: Each component page includes usage examples you can copy directly

## 🎨 Components

### Hero Component
- Full-width hero section with background image/video support
- Gradient overlays for text readability
- Action buttons (Play, More Info)
- Mute control and age rating badge
- Responsive design

### Button Component
Three variants:
- **Primary**: White background, black text
- **Secondary**: Semi-transparent gray background
- **Ghost**: Transparent with hover effect

Three sizes: Small, Medium, Large

### Movie Card Component
- Aspect ratio: 2:3 (poster format)
- Hover effects with scale animation
- Metadata overlay (match percentage, year, quality)
- Responsive grid layout

### Navbar Component
- Fixed position with gradient background
- Collapsible side menu
- Icon-based navigation
- Overlay backdrop when menu is open

### Search Component
Multiple variants:
- Default search with icon
- Search with clear button
- Compact search
- Expandable search

### Carousel Component
- Horizontal scrolling with smooth behavior
- Navigation arrows (appear on hover)
- Hidden scrollbar
- Responsive card sizing

## 🛠️ Technology Stack

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first styling (via CDN)
- **Vanilla JavaScript**: Interactive functionality
- **Google Fonts**: Inter font family

## 💡 Usage

All components use Tailwind CSS via CDN, so no build process is required. Simply:

1. Copy the HTML markup from any component file
2. Paste into your project
3. Customize as needed

Each component file includes:
- Complete working example
- Multiple variants/sizes
- Usage code snippets
- Inline documentation

## 🎯 Features

- **No dependencies**: All components work standalone
- **Fully responsive**: Mobile-first design approach
- **Accessible**: Focus states and ARIA labels included
- **Dark theme**: Netflix-style color scheme
- **Interactive**: JavaScript functionality included

## 🔧 Customization

### Colors
The color scheme is defined in the Tailwind config:
```javascript
colors: {
    'netflix-red': '#e50914',
    'netflix-black': '#141414',
}
```

### Fonts
Using Inter font family from Google Fonts. Change in the `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Focus Styles
TV/Keyboard navigation focus styles:
```css
:focus-visible {
    outline: 3px solid white;
    outline-offset: 2px;
    z-index: 50;
}
```

## 📝 Notes

- All components use absolute positioning where needed for overlays
- Images use TMDB URLs as examples (replace with your own)
- JavaScript functions are inline for simplicity
- Components are optimized for modern browsers

## 🔗 Integration

To integrate these components into the main Next.js application:

1. Convert HTML to JSX syntax
2. Replace inline styles with CSS modules or styled-components
3. Add TypeScript types
4. Connect to API data
5. Add state management as needed

## 📄 License

These components are part of the Netflix Clone project and follow the same license.
