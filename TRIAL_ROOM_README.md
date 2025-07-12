# Virtual Trial Room

A new feature that allows users to upload photos and try on different clothing items in a 3D environment.

## Features

### Photo Upload
- Drag and drop or click to upload user photos
- Support for common image formats (JPEG, PNG, etc.)
- Real-time preview of uploaded photos
- Option to remove and re-upload photos

### Clothing Selection
- Multiple clothing options including:
  - Classic T-Shirt (White)
  - Blue T-Shirt
  - Red T-Shirt
  - Formal Shirt (White)
  - Denim Jacket (Blue)
- Visual color preview for each clothing item
- Easy selection with hover effects

### 3D Model Interaction
- Interactive 3D model viewer
- Mouse controls for rotation, zoom, and pan
- Real-time clothing color changes
- Responsive design for different screen sizes

## How to Use

1. **Navigate to Trial Room**: Click on "Trial Room" in the navigation menu
2. **Upload Photo**: Click the upload area or drag and drop an image
3. **Select Clothing**: Choose from the available clothing options
4. **Interact with Model**: Use your mouse to rotate and zoom the 3D model
5. **View Results**: See how the selected clothing looks on the model

## Technical Details

- Built with React and TypeScript
- Uses Three.js for 3D rendering
- React Three Fiber for React integration
- Tailwind CSS for styling
- Responsive design for mobile and desktop

## Routes

- `/trial-room` - Main trial room interface
- `/` - Home page with basic 3D model
- `/2d` - 2D pose detection feature

## Future Enhancements

- More clothing items and styles
- Texture mapping for realistic clothing
- Body measurement integration
- Save and share trial results
- AR integration for real-time try-on