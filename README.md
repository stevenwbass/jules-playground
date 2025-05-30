# 3D Text on Tumbler Visualization

This project demonstrates rendering user-input text onto a 3D model of a tumbler (currently using a placeholder model) in real-time using three.js.

## Features

-   **Text Input**: Users can type any text into a text field.
-   **Font Selection**: Users can select a font from a dropdown list (currently affects the 2D canvas texture).
-   **3D Visualization**: The text is rendered onto a 3D model on the right side of the page.
-   **Interactive Camera**: The 3D model can be rotated and zoomed using mouse controls (OrbitControls).

## How to Run

1.  Clone or download this repository.
2.  **Serve the project via a local HTTP server.** Due to the use of ES modules (`import` statements in JavaScript), `index.html` cannot be opened directly from the file system.
    -   Navigate to the project directory in your terminal.
    -   **Using Python:**
        -   For Python 3: `python -m http.server`
        -   For Python 2: `python -m SimpleHTTPServer`
        -   Then open `http://localhost:8000` (or the port indicated by the server) in your browser.
    -   **Using Node.js:**
        -   If you have `npx` (usually comes with npm 5.2+): `npx http-server .`
        -   Alternatively, install `http-server` globally: `npm install -g http-server`, then run: `http-server .`
        -   Then open `http://localhost:8080` (or the port indicated by the server) in your browser.
3.  Ensure you have an internet connection if assets are still loaded from CDNs (though the primary reason for the server is for ES module compatibility).

## Technical Details

-   **Library**: [three.js](https://threejs.org/) (r128) is used for 3D rendering.
    -   `GLTFLoader` is used for loading 3D models.
    -   `FontLoader` is used for loading three.js compatible font files.
    -   `TextGeometry` is available for creating 3D text meshes (though the current implementation primarily uses 2D canvas texturing).
    -   `OrbitControls` provides camera interaction.
-   **Text Rendering Method**: The text is currently rendered onto a 2D HTML canvas, which is then used as a texture (`THREE.CanvasTexture`) applied to the 3D model's material.
-   **3D Model**:
    -   The application attempts to load a GLTF model from a CDN. Currently, it uses a sample model (`MetalRoughSpheres.glb` from KhronosGroup) as a placeholder.
    -   If the GLTF model fails to load, it falls back to a procedurally generated cylinder.
    -   **Note**: To display an actual Stanley 40oz tumbler, the `modelUrl` in `script.js` needs to be updated to point to a suitable `.gltf` or `.glb` file.
-   **Fonts**:
    -   The font dropdown primarily influences the font used for rendering text on the 2D canvas texture.
    -   A default three.js font (`helvetiker_regular.typeface.json`) is loaded for potential use with `TextGeometry`.

## Future Improvements

-   Integrate an accurate 3D model of a Stanley 40oz tumbler.
-   Improve UV mapping and texture application for better text placement on the specific tumbler model.
-   Implement true 3D text using `TextGeometry` and allow selection of multiple 3D fonts.
-   More robust error handling and user feedback.
