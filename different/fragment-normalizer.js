// different/fragment-normalizer.js
// Draft backend adapter for Replace-Erase.
// It converts pasted fragments into one complete HTML document.
// This file is intentionally not loaded by index.html yet.

(function (global) {
  "use strict";

  const DEFAULT_HEAD = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
  ];

  function cleanShell(text) {
    return String(text || "")
      .replace(/^\uFEFF/, "")
      .replace(/<!doctype[^>]*>/gi, "")
      .replace(/<\/?html\b[^>]*>/gi, "")
      .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "")
      .replace(/<body\b[^>]*>/gi, "")
      .replace(/<\/body>/gi, "")
      .trim();
  }

  function extractBlocks(source, tagName) {
    const blocks = [];
    const pattern = new RegExp(
      '<' + tagName + '\\b[^>]*>[\\s\\S]*?<\\/' + tagName + '>',
      'gi'
    );

    const withoutBlocks = String(source || "").replace(pattern, match => {
      blocks.push(match);
      return "";
    });

    return { blocks, rest: withoutBlocks };
  }

  function getInnerBlock(block, tagName) {
    return String(block || "")
      .replace(new RegExp('^<' + tagName + '\\b[^>]*>', 'i'), "")
      .replace(new RegExp('<\\/' + tagName + '>$', 'i'), "")
      .trim();
  }

  function getDocumentParts(source) {
    const fullHead = String(source).match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
    const fullBody = String(source).match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);

    if (fullHead || fullBody || /<html\b/i.test(source)) {
      return {
        head: fullHead ? fullHead[1] : "",
        body: fullBody ? fullBody[1] : cleanShell(source)
      };
    }

    return {
      head: "",
      body: String(source)
    };
  }

  function normalizeForReplaceErase(source) {
    const input = String(source == null ? "" : source).trim();
    if (!input) return "";

    const parts = getDocumentParts(input);

    const headStyles = extractBlocks(parts.head, "style");
    const bodyStyles = extractBlocks(parts.body, "style");
    const headScripts = extractBlocks(headStyles.rest, "script");
    const bodyScripts = extractBlocks(bodyStyles.rest, "script");

    const headContent = cleanShell(headScripts.rest);
    const bodyContent = cleanShell(bodyScripts.rest);
    const styles = [
      ...headStyles.blocks.map(block => getInnerBlock(block, "style")),
      ...bodyStyles.blocks.map(block => getInnerBlock(block, "style"))
    ].filter(Boolean);

    const scripts = [
      ...headScripts.blocks,
      ...bodyScripts.blocks
    ].filter(Boolean);

    const titleMatch = headContent.match(/<title\b[^>]*>[\s\S]*?<\/title>/i);
    const title = titleMatch ? titleMatch[0] : "<title>Replace-Erase Preview</title>";
    const remainingHead = titleMatch
      ? headContent.replace(titleMatch[0], "").trim()
      : headContent;

    return [
      "<!DOCTYPE html>",
      '<html lang="en">',
      "<head>",
      ...DEFAULT_HEAD,
      title,
      remainingHead,
      ...styles.map(css => `<style>\\n${css}\\n</style>`),
      "</head>",
      "<body>",
      bodyContent,
      ...scripts,
      "</body>",
      "</html>"
    ].filter(Boolean).join("\n");
  }

  global.normalizeForReplaceErase = normalizeForReplaceErase;
})(window);
