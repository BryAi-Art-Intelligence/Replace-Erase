// 3-cleanup.js
// Quietly cleans the pasted code before Replace & Erase cuts it into parts.
// Removes wrapper junk and decides whether cleaned HTML belongs in head or body.

function removePasteJunk(text){
  return text
    .replace(/^\s*[\w\-(). ]+\.(png|jpg|jpeg|gif|webp|svg)\s*\n+/i, "")
    .trim();
}

function cleanHTMLShell(html){
  return html
    .replace(/<!doctype[^>]*>/gi, "")
    .replace(/<\/?html[^>]*>/gi, "")
    .replace(/<\/?body[^>]*>/gi, "")
    .trim();
}

function isHeadTag(text){
  const trimmed = text.trim();
  return (
    /^<meta\b/i.test(trimmed) ||
    /^<title\b/i.test(trimmed) ||
    /^<link\b/i.test(trimmed) ||
    /^<base\b/i.test(trimmed)
  );
}

function pushCleanHTML(parts, html){
  const cleanedHTML = cleanHTMLShell(html);
  if (!cleanedHTML) return;

  parts.push({
    type: isHeadTag(cleanedHTML) ? "head" : "html",
    content: cleanedHTML
  });
}
