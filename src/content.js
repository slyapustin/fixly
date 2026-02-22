(() => {
  let lastSelectionState = null;

  function showToast(message, kind = 'info') {
    const existing = document.getElementById('fixly-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'fixly-toast';
    toast.textContent = message;

    const bg = kind === 'success' ? '#0f766e' : kind === 'error' ? '#b91c1c' : '#111827';

    Object.assign(toast.style, {
      position: 'fixed',
      right: '16px',
      bottom: '16px',
      zIndex: '2147483647',
      background: bg,
      color: '#fff',
      padding: '10px 12px',
      borderRadius: '10px',
      fontSize: '13px',
      lineHeight: '1.3',
      boxShadow: '0 8px 20px rgba(0,0,0,.25)',
      maxWidth: '360px',
    });

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  }

  function getActiveTextField() {
    const el = document.activeElement;
    if (!el) return null;
    if (el.tagName === 'TEXTAREA') return el;
    if (el.tagName === 'INPUT' && ['text', 'search', 'email', 'url', 'tel', 'password'].includes(el.type)) return el;
    return null;
  }

  function captureSelectionState() {
    const field = getActiveTextField();
    if (field && typeof field.selectionStart === 'number' && typeof field.selectionEnd === 'number') {
      const start = field.selectionStart;
      const end = field.selectionEnd;
      if (start !== end) {
        return {
          kind: 'field',
          element: field,
          start,
          end,
          text: field.value.slice(start, end),
        };
      }
    }

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;

    const range = sel.getRangeAt(0);
    const text = sel.toString();
    if (!text || !text.trim()) return null;

    return {
      kind: 'range',
      range: range.cloneRange(),
      text,
    };
  }

  function applyFixedText(state, fixedText) {
    if (!state) return false;

    if (state.kind === 'field') {
      const el = state.element;
      if (!el || !el.isConnected) return false;

      const before = el.value.slice(0, state.start);
      const after = el.value.slice(state.end);
      el.value = before + fixedText + after;

      const pos = state.start + fixedText.length;
      el.selectionStart = el.selectionEnd = pos;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }

    if (state.kind === 'range') {
      try {
        const range = state.range;
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

  async function performFix(selectedTextFromMessage) {
    const state = captureSelectionState();
    lastSelectionState = state;

    const text = (state?.text || selectedTextFromMessage || '').trim();
    if (!text) {
      showToast('No selected text found.', 'error');
      return { ok: false, error: 'No selected text found.' };
    }

    showToast('Fixing text…', 'info');

    try {
      const fixed = await requestFix(text);
      const finalText = fixed || text;

      const applied = applyFixedText(lastSelectionState, finalText);
      if (applied) {
        showToast('✅ Text fixed', 'success');
      } else {
        await navigator.clipboard.writeText(finalText);
        showToast('📋 Fixed text copied to clipboard', 'success');
      }

      return { ok: true };
    } catch (err) {
      showToast(`❌ ${err.message || 'Fix failed'}`, 'error');
      return { ok: false, error: err?.message || 'Fix failed' };
    }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.action !== 'fixSelection') return;

    performFix(message.selectedText)
      .then((result) => sendResponse?.(result))
      .catch((err) => sendResponse?.({ ok: false, error: err?.message || 'Fix failed' }));

    return true;
  });

  console.log('Fixly content script loaded');
})();
