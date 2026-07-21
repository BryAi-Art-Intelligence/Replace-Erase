# Different

Backend drafts for future Replace-Erase behavior.

This folder is intentionally not connected to `index.html`, and nothing here is loaded through an iframe. It is a preparation area for solving the fragment problem before changing the live app.

## The problem

A pasted fragment such as:

```html
<button class="jobsite-button">
  <span>JOBSITE</span>
</button>

<style>
.jobsite-button {
  background: white;
}
</style>
```

is valid as a browser fragment, but it is not a complete HTML document. Replace-Erase can display the fragment as visible source, and a later build can lose the document shell or put CSS in the wrong place.

## Draft solution

- `fragment-normalizer.js` contains `normalizeForReplaceErase(source)`.
- It always returns a complete `<!DOCTYPE html>` document.
- It preserves existing full documents.
- It moves `<style>` blocks into `<head>`.
- It keeps markup in `<body>`.
- It moves `<script>` blocks to the end of `<body>`.
- It adds basic charset and viewport metadata.
- `fragment-normalizer.test.html` is a standalone text-only test harness. It is not part of the live app.

## Future integration point

The eventual integration belongs at the boundary where pasted text becomes the final rendered/exported document. The live app should still keep its internal editable pieces, but the render/export boundary should call:

```js
const readyDocument = normalizeForReplaceErase(pastedOrBuiltCode);
```

That integration is deliberately not being made yet.
