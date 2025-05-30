// Ensure script runs after HTML is loaded
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const fontSelect = document.getElementById('font-select');
    const tumblerContainer = document.getElementById('tumbler-container');

    // --- Font Setup ---
    const fonts = {
        'Arial': 'Arial, sans-serif', // System font, not directly loadable by FontLoader as .json
        'Verdana': 'Verdana, sans-serif',
        // For 3D text, we need actual font files (e.g., .json or .ttf converted to three.js font format)
        // We'll use a default three.js font for now.
        // The dropdown will select styles, but the actual 3D font might be limited initially.
    };

    // Store the loaded three.js font
    let currentThreeFont = null;
    // Store the main tumbler object
    let tumblerObject = null;
    // Texture for the text
    let textTexture = null;
    let textMaterial = null;

    // Populate Font Dropdown (simplified for now, actual 3D font change is complex)
    function populateFontDropdown() {
        // Add a default option that we know we can load for 3D
        const defaultOption = document.createElement('option');
        defaultOption.value = 'helvetiker_regular'; // three.js default font name
        defaultOption.textContent = 'Default 3D Font'; // This will be used for the 2D canvas texture font style
        fontSelect.appendChild(defaultOption);

        // Add other system fonts for conceptual selection, though they won't directly map to 3D fonts yet
        for (const fontName in fonts) {
            const option = document.createElement('option');
            option.value = fonts[fontName]; // This value would be for CSS font-family
            option.textContent = fontName;
            // fontSelect.appendChild(option); // Commenting out to avoid confusion for now
        }
        // Set the default selected font to be the one we use for 2D canvas rendering
        // For consistency, let's use a common system font for the 2D canvas if 'Default 3D Font' is selected
        // or ensure createTextCanvas uses a generic font if 'helvetiker_regular' is chosen.
        // For now, the value 'helvetiker_regular' will be passed to createTextCanvas, which will use it as font-family.
        // This might not be ideal, as 'helvetiker_regular' isn't a standard CSS font.
        // Let's ensure the first option's value is a valid CSS font family for the canvas.
        defaultOption.value = 'Arial, sans-serif'; // Make the default option use Arial for the canvas.
                                                  // The 3D 'helvetiker_regular' font is loaded separately for potential TextGeometry.
    }
    populateFontDropdown();

    // --- three.js Setup ---
    let scene, camera, renderer, controls;
    const loader = new THREE.GLTFLoader();
    const fontLoader = new THREE.FontLoader();

    function initThreeJS() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xeeeeee);

        camera = new THREE.PerspectiveCamera(75, tumblerContainer.clientWidth / tumblerContainer.clientHeight, 0.1, 1000);
        camera.position.set(0, 1.5, 4); // Adjusted for a typical model size

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(tumblerContainer.clientWidth, tumblerContainer.clientHeight);
        renderer.physicallyCorrectLights = true; // For GLTF models
        renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better color
        renderer.outputEncoding = THREE.sRGBEncoding; // Correct color output
        tumblerContainer.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true; // If we add shadows later
        scene.add(directionalLight);

        if (typeof THREE.OrbitControls === 'function') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 1;
            controls.maxDistance = 20;
            controls.target.set(0, 1, 0); // Adjust target to focus on typical model height
            controls.update();
        } else {
            console.warn("THREE.OrbitControls not found.");
        }

        // Load the default three.js font (for potential future use with TextGeometry)
        fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_regular.typeface.json', function (font) {
            currentThreeFont = font;
            console.log("Three.js default font (helvetiker_regular) loaded.");
            // Load tumbler model after font is loaded
            loadTumblerModel();
        }, undefined, function (error) {
            console.error('FontLoader error:', error);
            // Fallback: if font fails, load model anyway
            loadTumblerModel();
        });

        window.addEventListener('resize', onWindowResize, false);
        animate();
    }

    function loadTumblerModel() {
        // Material that will receive the text texture
        textMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080, // Grey
            metalness: 0.5,
            roughness: 0.5,
            map: null // Initially no map
        });

        // Placeholder: Generic Cylinder if GLTF fails or as a starting point
        const cylinderGeo = new THREE.CylinderGeometry(0.5, 0.6, 2, 32); // radTop, radBot, height, segments
        const cylinder = new THREE.Mesh(cylinderGeo, textMaterial); // Use textMaterial here
        cylinder.position.y = 1; // Adjust so base is at 0

        // Attempt to load a GLTF model
        // Using a generic model URL for demonstration. Replace with an actual Stanley 40oz tumbler model URL.
        const modelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MetalRoughSpheres/glTF-Binary/MetalRoughSpheres.glb';
        // NOTE: The above model is NOT a tumbler. It's a set of spheres, used for testing GLTF loading and material application.

        loader.load(modelUrl, function (gltf) {
            console.log("GLTF model loaded successfully.");
            tumblerObject = gltf.scene;

            // Adjust scale and position for the MetalRoughSpheres model (example)
            // This will vary greatly depending on the actual model used.
            tumblerObject.scale.set(0.5, 0.5, 0.5);
            tumblerObject.position.y = 1.0;

            let appliedMaterial = false;
            tumblerObject.traverse(function (child) {
                if (child.isMesh && !appliedMaterial) {
                    // Apply the textMaterial to the first suitable mesh found.
                    // For MetalRoughSpheres, it has multiple spheres, we'll target one.
                    child.material = textMaterial;
                    appliedMaterial = true;
                    // Enable shadows if desired
                    // child.castShadow = true;
                    // child.receiveShadow = true;
                }
            });

            if (!appliedMaterial) {
                console.warn("Could not find a suitable mesh in the GLTF to apply text material. Using fallback.");
                scene.add(cylinder); // Add placeholder if no mesh was suitable or model is empty
                tumblerObject = cylinder; // Set tumblerObject to the cylinder
            } else {
                 scene.add(tumblerObject);
            }
            updateTextOnTumbler(); // Initial text update
        }, undefined, function (error) {
            console.error('GLTFLoader error:', error);
            console.log("Using placeholder cylinder as tumbler model due to GLTF loading error.");
            tumblerObject = cylinder;
            scene.add(tumblerObject);
            updateTextOnTumbler();
        });
    }

    function createTextCanvas(text, fontCss) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const canvasResolution = 1024;

        let fontSize = Math.max(60, 200 - text.length * 5);
        canvas.width = canvasResolution;
        // Make canvas taller to better fit text that might wrap or be multi-line conceptually on a cylinder
        canvas.height = canvasResolution; // Changed to square, can be adjusted

        context.fillStyle = 'rgba(255, 255, 255, 0.0)'; // Transparent background for texture
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear with transparency

        context.font = `${fontSize}px ${fontCss}`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'black';
        // Simple text wrapping (manual) if text is too long
        const maxTextWidth = canvas.width * 0.9;
        let lines = [text];
        if (context.measureText(text).width > maxTextWidth) {
            lines = [];
            let currentLine = '';
            const words = text.split(' ');
            for (let word of words) {
                if (context.measureText(currentLine + word).width < maxTextWidth) {
                    currentLine += (currentLine === '' ? '' : ' ') + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
        }

        const lineHeight = fontSize * 1.2;
        const totalTextHeight = lines.length * lineHeight;
        let startY = (canvas.height - totalTextHeight) / 2 + lineHeight / 2 - (fontSize*0.1); // Adjust for baseline offset

        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], canvas.width / 2, startY + i * lineHeight);
        }

        return canvas;
    }

    function updateTextOnTumbler() {
        if (!tumblerObject || !textMaterial) {
            console.log("Tumbler object or material not ready for text update.");
            return;
        }

        const currentText = textInput.value;
        // The fontSelect.value is now always a CSS font-family string (e.g., "Arial, sans-serif")
        const selectedFontCss = fontSelect.value;

        const textCanvas = createTextCanvas(currentText, selectedFontCss);
        if (textTexture) {
            textTexture.dispose();
        }
        textTexture = new THREE.CanvasTexture(textCanvas);
        // Ensure texture updates correctly, especially with transparency
        textTexture.needsUpdate = true;

        // UV mapping might require adjustments based on the model
        // For a cylinder, typically you want to repeat vertically, not horizontally.
        textTexture.wrapS = THREE.ClampToEdgeWrapping; // Horizontal
        textTexture.wrapT = THREE.RepeatWrapping;   // Vertical (if text wraps around tumbler top to bottom)
                                                    // Or ClampToEdgeWrapping if it's a label not meant to repeat.
        // textTexture.repeat.set(1, 1); // Adjust repeat if necessary for the model's UVs
        // textTexture.offset.set(0, 0); // Adjust offset if necessary

        // Make the material transparent if the canvas texture has transparency
        textMaterial.transparent = true;
        textMaterial.map = textTexture;
        textMaterial.needsUpdate = true;

        console.log(`Updated text to: "${currentText}" with font: "${selectedFontCss}"`);
    }


    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = tumblerContainer.clientWidth / tumblerContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(tumblerContainer.clientWidth, tumblerContainer.clientHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        if (controls) {
            controls.update();
        }
        if (scene && camera) {
            renderer.render(scene, camera);
        }
    }

    initThreeJS();

    textInput.addEventListener('input', updateTextOnTumbler);
    fontSelect.addEventListener('change', updateTextOnTumbler);
});
