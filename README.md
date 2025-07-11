# 🍸 Cocktail Gallery

A modern, responsive web application for managing your cocktail collection with beautiful animations and local database storage.

## Features

- **📸 Image Upload**: Add photos of your cocktails with preview functionality
- **🗄️ Local Storage**: Uses IndexedDB to store cocktail data locally in your browser
- **🎨 Beautiful UI**: Modern design with smooth animations and keyframe effects
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **🗑️ Delete Functionality**: Remove cocktails with confirmation
- **✨ Smooth Animations**: Fade-in, slide-in, and hover effects throughout

## How to Use

1. **Open the Application**

   - Simply open `cocktail-gallery.html` in your web browser
   - No server setup required - it works entirely in the browser

2. **Add a Cocktail**

   - Fill in the cocktail name
   - List the ingredients
   - Upload a photo (you'll see a preview)
   - Click "Add Cocktail"

3. **View Your Collection**

   - All your cocktails appear in the gallery on the right
   - Hover over cards to see delete buttons
   - Images are stored locally in your browser

4. **Delete Cocktails**
   - Hover over a cocktail card
   - Click the red "×" button
   - Confirm the deletion

## Technical Details

### Architecture

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks)
- **Database**: IndexedDB (browser's local database)
- **Storage**: Images converted to base64 and stored locally
- **Animations**: CSS keyframes and transitions

### Key Animations

- **fadeInDown**: Header title entrance
- **slideInLeft**: Upload form entrance
- **slideInRight**: Gallery entrance
- **fadeInUp**: Individual cocktail cards
- **pulse**: Title continuous animation
- **spin**: Loading spinner
- **successPulse**: Success feedback

### Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses IndexedDB for data persistence

## File Structure

```
cocktail-gallery/
├── cocktail-gallery.html    # Main HTML file
├── styles.css              # All CSS styles and animations
├── database.js             # IndexedDB database operations
├── app.js                  # Main application logic
└── README.md              # This file
```

## Data Storage

All data is stored locally in your browser using IndexedDB:

- Cocktail names and ingredients
- Image data (converted to base64)
- Creation and update timestamps

**Note**: Data is stored per browser/device. If you clear browser data, your cocktails will be lost.

## Customization

### Adding New Animations

Add new keyframe animations in `styles.css`:

```css
@keyframes yourAnimation {
  from {
    /* starting state */
  }
  to {
    /* ending state */
  }
}
```

### Changing Colors

Modify the CSS variables in `styles.css`:

- Primary gradient: `#667eea` to `#764ba2`
- Success color: `#4CAF50`
- Error color: `#f44336`

### Database Schema

The IndexedDB stores cocktails with this structure:

```javascript
{
    id: number,
    name: string,
    ingredients: string,
    imageUrl: string (base64),
    fileName: string,
    createdAt: string (ISO date),
    updatedAt: string (ISO date)
}
```

## Development

To modify the application:

1. **Add Features**: Edit `app.js` for new functionality
2. **Change Styling**: Modify `styles.css` for visual changes
3. **Database Changes**: Update `database.js` for data structure changes

## Browser Support

- ✅ Chrome 58+
- ✅ Firefox 55+
- ✅ Safari 10.1+
- ✅ Edge 79+

## License

This project is open source and available under the MIT License.
