(() => {
  const BUTTON_ID = 'fixlyFloatingBtn';

  let selectionState = null;
  let hideTimer = null;

  const btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.type = 'button';
  btn.title = 'Fix selected text with AI';
  btn.textContent = '✨';
  Object.assign(btn.style, {
    position: 'absolute',
    display: 'none',
    zIndex: '2147483647',
    padding: '5px',
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
    border: 'none',
    height: '32px',
    width: '32px',
    lineHeight: '1',
    fontSize: '20px',
    fontFamily: 'Arial, sans-serif',
    userSelect: 'none',
    alignItems: 'center',
    justifyContent: 'center',
  });

  btn.onmouseover = () => {
    btn.style.transform = 'scale(1.15)';
    btn.style.transition = 'transform 0.12s';
  };
  btn.onmouseout = () => {
    btn.style.transform = 'scale(1)';
  };

  function appendButton() {
    if (!document.body || document.getElementById(BUTTON_ID)) return;
    document.body.appendChild(btn);
  }

  function showButtonAt(x, y) {
    appendButton();
    btn.style.left = `${Math.max(8, Math.round(window.scrollX + x + 10))}px`;
    btn.style.top = `${Math.max(8, Math.round(window.scrollY + y + 12))}px`;
    btn.style.display = 'flex';
  }

  function hideButtonSoon(ms = 50) {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      btn.style.display = 'none';
    }, ms);
  }

  function getActiveTextField() {
    const el = document.activeElement;
    if (!el) return null;
    if (el.tagName === 'TEXTAREA') return el;
    if (el.tagName === 'INPUT' && ['text', 'search', 'email', 'url', 'tel', 'password'].includes(el.type)) return el;
    return null;
  }

  function captureSelectionState() {
    // 1) input/textarea selection
    const field = getActiveTextField();
    if (field && typeof field.selectionStart === 'number' && typeof field.selectionEnd === 'number') {
      const start = field.selectionStart;
      const end = field.selectionEnd;
      if (start !== end) {
        selectionState = {
          kind: 'field',
          element: field,
          start,
          end,
          text: field.value.slice(start, end),
        };

        // best-effort placement for input/textarea: near element corner
        const r = field.getBoundingClientRect();
        showButtonAt(r.right - 10, r.bottom - 6);
        return;
      }
    }

    // 2) normal/contenteditable selection
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      selectionState = null;
      hideButtonSoon();
      return;
    }

    const range = sel.getRangeAt(0);
    const text = sel.toString();
    if (!text || !text.trim()) {
      selectionState = null;
      hideButtonSoon();
      return;
    }

    selectionState = {
      kind: 'range',
      range: range.cloneRange(),
      text,
    };

    const rect = range.getBoundingClientRect();
    showButtonAt(rect.right, rect.bottom);
  }

  function getSelectedText() {
    return selectionState?.text?.trim() || '';
  }

  function applyFixedText(fixedText) {
    if (!selectionState) return false;

    if (selectionState.kind === 'field') {
      const el = selectionState.element;
      if (!el || !el.isConnected) return false;

      const before = el.value.slice(0, selectionState.start);
      const after = el.value.slice(selectionState.end);
      el.value = before + fixedText + after;

      const pos = selectionState.start + fixedText.length;
      el.selectionStart = el.selectionEnd = pos;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }

    if (selectionState.kind === 'range') {
      const range = selectionState.range;
      if (!range) return false;

      try {
        range.deleteContents();
        const node = document.createTextNode(fixedText);
        range.insertNode(node);

        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          const endRange = document.createRange();
          endRange.setStartAfter(node);
          endRange.collapse(true);
          sel.addRange(endRange);
        }
        return true;
      } catch (_e) {
        return false;
      }
    }

    return false;
  }

  function resetButtonState() {
    btn.textContent = '✨';
    btn.style.cursor = 'pointer';
    btn.disabled = false;
  }

  async function requestFix(text) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['provider', 'openai_api_key'], (cfg) => {
        const provider = cfg.provider || 'openai';
        const request = { action: 'fixText', text };

        if (provider === 'openai') {
          if (!cfg.openai_api_key) {
            reject(new Error('Please set your OpenAI API key in Fixly settings.'));
            return;
          }
          request.apiKey = cfg.openai_api_key;
        }

        chrome.runtime.sendMessage(request, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (!response) {
            reject(new Error('No response from background script'));
            return;
          }
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          resolve((response.fixedText || '').trim());
        });
      });
    });
  }

  btn.addEventListener('mousedown', (e) => {
    // prevent losing selection before click handler
    e.preventDefault();
  });

  async function performFixFromSelection() {
    const selectedText = getSelectedText();
    if (!selectedText) {
      hideButtonSoon(0);
      return;
    }

    btn.textContent = '⏳';
    btn.style.cursor = 'default';
    btn.disabled = true;

    try {
      const fixed = await requestFix(selectedText);
      const applied = applyFixedText(fixed || selectedText);
      if (!applied) {
        await navigator.clipboard.writeText(fixed || selectedText);
        alert('Could not replace text on this page. Corrected text copied to clipboard.');
      }
    } catch (err) {
      alert(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      selectionState = null;
      resetButtonState();
      hideButtonSoon(0);
    }
  }

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    await performFixFromSelection();
  });

  // selection updates
  document.addEventListener('selectionchange', () => {
    // debounce tiny UI jitters
    setTimeout(captureSelectionState, 0);
  });

  document.addEventListener('keydown', (e) => {
    // update after keyboard-driven selection changes (Shift+Arrows, Cmd/Ctrl+A)
    if (e.shiftKey || e.key === 'a' || e.key === 'A') {
      setTimeout(captureSelectionState, 0);
    }
  });

  document.addEventListener('mousedown', (event) => {
    if (event.target !== btn) hideButtonSoon();
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.action !== 'fixSelection') return;

    captureSelectionState();
    if (!getSelectedText()) {
      sendResponse?.({ ok: false, error: 'No selection found on page.' });
      return;
    }

    performFixFromSelection()
      .then(() => sendResponse?.({ ok: true }))
      .catch((err) => sendResponse?.({ ok: false, error: err?.message || 'Failed to fix selection.' }));

    return true;
  });

  // initialize when body is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', appendButton, { once: true });
  } else {
    appendButton();
  }

  console.log('Fixly content script loaded');
})();
