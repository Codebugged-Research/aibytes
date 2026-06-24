/*
 * Turns a teach card (plain title + HTML body) into an ordered list of word
 * tokens with character offsets, so Byte can read it aloud while the matching
 * word lights up (karaoke). Bold/italic emphasis from the HTML is preserved.
 */

function tokenizePlain(text, tokens, fmt, cursorRef) {
  const parts = (text || '').split(/(\s+)/);
  parts.forEach((p) => {
    if (p === '') return;
    if (/^\s+$/.test(p)) {
      cursorRef.plain += ' ';
    } else {
      const start = cursorRef.plain.length;
      cursorRef.plain += p;
      tokens.push({ text: p, bold: fmt.bold, italic: fmt.italic, start, end: cursorRef.plain.length });
    }
  });
}

function walk(node, tokens, fmt, cursorRef) {
  node.childNodes.forEach((n) => {
    if (n.nodeType === 3) {
      tokenizePlain(n.textContent, tokens, fmt, cursorRef);
    } else if (n.nodeType === 1) {
      const tag = n.tagName.toLowerCase();
      if (tag === 'br') {
        tokens.push({ br: true });
        cursorRef.plain += ' ';
        return;
      }
      walk(n, tokens, {
        bold: fmt.bold || tag === 'strong' || tag === 'b',
        italic: fmt.italic || tag === 'em' || tag === 'i',
      }, cursorRef);
    }
  });
}

function tokenizeHtml(html) {
  const cursorRef = { plain: '' };
  const tokens = [];
  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = html || '';
    walk(el, tokens, { bold: false, italic: false }, cursorRef);
  } else {
    tokenizePlain((html || '').replace(/<[^>]+>/g, ''), tokens, { bold: false, italic: false }, cursorRef);
  }
  return { tokens, plain: cursorRef.plain };
}

/*
 * buildNarration(title, bodyHtml) -> {
 *   speakText,                       // full string passed to TTS
 *   titleTokens, bodyTokens,         // for rendering (bodyTokens may include {br:true})
 *   wordCount,                       // total highlightable words
 *   ranges,                          // [{start,end}] global char range per word index
 * }
 * Each rendered word token carries `.wi` = its global word index.
 */
export function buildNarration(title, bodyHtml) {
  const t = tokenizeHtml(title || '');     // title is plain, but reuse the walker
  const b = tokenizeHtml(bodyHtml || '');

  const titlePlain = t.plain.trim() ? t.plain : (title || '');
  const bodyOffset = titlePlain.length + 2; // ". "
  const speakText = `${titlePlain}. ${b.plain}`.trim();

  const ranges = [];
  let wi = 0;

  const titleTokens = t.tokens.map((tok) => {
    const out = { ...tok, wi };
    ranges[wi] = { start: tok.start, end: tok.end };
    wi += 1;
    return out;
  });

  const bodyTokens = b.tokens.map((tok) => {
    if (tok.br) return { br: true };
    const out = { ...tok, wi };
    ranges[wi] = { start: bodyOffset + tok.start, end: bodyOffset + tok.end };
    wi += 1;
    return out;
  });

  return { speakText, titleTokens, bodyTokens, wordCount: wi, ranges };
}

/* Map a TTS boundary charIndex to the nearest word index. */
export function wordAtChar(ranges, charIndex) {
  let idx = -1;
  for (let i = 0; i < ranges.length; i += 1) {
    if (ranges[i].start <= charIndex) idx = i;
    else break;
  }
  return idx;
}
