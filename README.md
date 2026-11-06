# Alan James — Portfolio

A responsive personal portfolio with a real-time Three.js sculpture, a six-project gallery, project case studies, experience, and contact links.

## Preview locally

No package installation or build step is required. With Python installed, run from the repository root:

```sh
python -m http.server 8000 --directory dist
```

Then open `http://localhost:8000`. Serve the site over HTTP; opening `index.html` directly as a file will block the JavaScript module used by the 3D scene.

## Files

| File | Purpose |
| --- | --- |
| `dist/index.html` | Page structure, project previews, biography, and experience |
| `dist/styles.css` | Responsive layouts, illustration styling, and transitions |
| `dist/app.js` | Case studies, qualities, filters, dialogs, and hover interactions |
| `dist/scene.js` | Three.js sculpture, lighting, rendering, and input controls |
| `dist/assets/` | Bundled Three.js, local Manrope fonts, and their licenses |

## Interaction and accessibility

- Drag the sculpture or focus it and use the arrow keys to rotate it.
- Choose one of six materials, change rendering quality, or pause the animation.
- Open each of the six qualities to see an example from Alan's work.
- Filter projects and open their case studies. Escape closes a dialog and returns focus to its trigger.
- Reduced-motion preferences disable automatic rotation and decorative motion. A CSS sculpture appears if WebGL is unavailable.
- Rendering pauses when the scene is outside the viewport or the page is hidden. Pixel count is capped to limit GPU work.

## Hosting

Upload the contents of `dist/` to a static host, or configure the host's publish directory as `dist`. No build command, backend, API keys, or environment variables are needed. Asset URLs are relative, so the site can also be hosted under a subdirectory.

The contact section uses email links and a copy-email button. Project artwork is illustrative; the case studies link to the corresponding repositories and available demos.

## Editing

Update profile and experience content in `dist/index.html`. Update the case studies and quality examples in `dist/app.js`. Keep project button identifiers synchronized between these files.

Third-party licenses are preserved in `dist/assets/MANROPE-OFL.txt` and `dist/assets/THREE-LICENSE.txt`.
