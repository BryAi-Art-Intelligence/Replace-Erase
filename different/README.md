# Different

Standalone future-build scenarios for Replace-Erase.

Every file in this folder is a complete HTML document. Each one can be rendered by itself and safely used as a future source when building the final page.

These files are intentionally not connected to the main index and are not loaded through an iframe.

## Files

- `button.html` — standalone JOBSITE button scenario.
- `jobsite-text-logo.html` — standalone one-line JOBSITE website text-logo scenario.

## Rule for future files

When a new visual scenario is saved here:

1. Start with `<!DOCTYPE html>`.
2. Include the complete `<html>`, `<head>`, and `<body>` structure.
3. Keep the CSS and JavaScript inside that file unless the scenario specifically needs an asset.
4. Do not add it to the main index until the final build is ready.
