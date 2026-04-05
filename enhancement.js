(() => {
  const waitForApp = () => typeof window.els !== 'undefined' && typeof window.state !== 'undefined';
  if (!waitForApp()) return;

  const style = document.createElement('style');
  style.textContent = `
    .skip-link{
      position:absolute;
      left:12px;
      top:12px;
      transform:translateY(-180%);
      padding:10px 14px;
      border-radius:12px;
      background:var(--accent);
      color:#fff;
      text-decoration:none;
      z-index:9999;
    }
    .skip-link:focus{transform:translateY(0)}
    .search-row{display:grid;gap:8px;margin-top:8px}
    .search-row input{max-width:100%}
    .warning-list,.history-list{display:grid;gap:8px}
    .warning-item,.history-item{
      padding:10px 12px;
      border:1px solid var(--border);
      border-radius:14px;
      background:rgba(148,163,184,.08);
      line-height:1.45;
      display:grid;
      gap:4px;
    }
    .warning-item{border-color:rgba(245,158,11,.35);background:rgba(245,158,11,.10)}
    .warning-title{font-weight:700}
    .changed{background:rgba(245,158,11,.22);border-radius:6px;padding:0 2px}
    .json-box{min-height:190px;resize:vertical;white-space:pre-wrap}
    .history-meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}
    .history-actions{display:flex;flex-wrap:wrap;gap:8px}
    .history-item button{justify-self:start}
    .perf-note{color:var(--warn);font-weight:700}
    .mini-muted{color:var(--muted);font-size:.84rem;line-height:1.45}
    .rule-io-grid{display:grid;gap:10px}
    .rule-io-grid textarea{min-height:180px}
    .json-summary{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}
  `;
  document.head.appendChild(style);

  const body = document.body;
  const main = document.querySelector('main.wrap');
  if (main && !main.id) main.id = 'mainContent';
  if (body && !document.querySelector('.skip-link')) {
    const skip = document.createElement('a');
    skip.href = '#mainContent';
    skip.className = 'skip-link';
    skip.textContent = 'Skip to content';
    body.prepend(skip);
  }

  const forwardCard = document.getElementById('forwardInput')?.closest('.card');
  const reverseCard = document.getElementById('reverseInput')?.closest('.card');
  const romanizerPanel = document.getElementById('romanizer-panel');
  const rulesPanel = document.getElementById('rules-panel');
  const rulesGrid = rulesPanel?.querySelector('.grid-2');
  const rulesSecondCard = rulesGrid?.querySelectorAll('.card')?.[1];

  if (forwardCard && !document.getElementById('forwardExampleSearch')) {
    const search = document.createElement('div');
    search.className = 'search-row';
    search.innerHTML = '<input id="forwardExampleSearch" type="search" placeholder="Search examples" aria-label="Search forward examples">';
    const examples = document.getElementById('forwardExamples');
    examples?.after(search);
    const warn = document.createElement('div');
    warn.id = 'forwardWarnings';
    warn.className = 'warning-list';
    warn.setAttribute('aria-live', 'polite');
    search.after(warn);
  }
  if (reverseCard && !document.getElementById('reverseExampleSearch')) {
    const search = document.createElement('div');
    search.className = 'search-row';
    search.innerHTML = '<input id="reverseExampleSearch" type="search" placeholder="Search examples" aria-label="Search reverse examples">';
    const examples = document.getElementById('reverseExamples');
    examples?.after(search);
    const warn = document.createElement('div');
    warn.id = 'reverseWarnings';
    warn.className = 'warning-list';
    warn.setAttribute('aria-live', 'polite');
    search.after(warn);
  }

  if (romanizerPanel && !document.getElementById('historyList')) {
    const historyCard = document.createElement('section');
    historyCard.className = 'card';
    historyCard.innerHTML = `
      <div class="section-title">
        <h2>History panel</h2>
        <span class="badge"><strong>Mode:</strong> Session only</span>
      </div>
      <p class="small-note">Recent inputs appear here during this session. Click an item to restore it.</p>
      <div class="actions">
        <button type="button" id="clearHistoryBtn" class="danger">Clear history</button>
      </div>
      <div id="historyList" class="history-list" aria-live="polite"></div>
    `;
    document.getElementById('forwardBreakdown')?.closest('.card')?.after(historyCard);
  }

  if (rulesPanel && !document.getElementById('rulesJsonArea')) {
    const controls = rulesPanel.querySelector('.actions');
    if (controls) {
      controls.insertAdjacentHTML('beforeend', '<button type="button" id="undoRulesBtn" class="secondary">Undo</button><button type="button" id="redoRulesBtn" class="secondary">Redo</button>');
    }
    const jsonCard = document.createElement('section');
    jsonCard.className = 'card';
    jsonCard.innerHTML = `
      <div class="section-title">
        <h2>JSON import/export</h2>
        <span class="badge"><strong>Portable:</strong> Yes</span>
      </div>
      <p class="small-note">Export your custom rules to JSON, copy them, or paste JSON back here to import during this session.</p>
      <div class="rule-io-grid">
        <textarea id="rulesJsonArea" class="json-box" placeholder="Exported JSON appears here, or paste JSON to import"></textarea>
        <div class="actions">
          <button type="button" id="exportRulesBtn" class="blue">Export JSON</button>
          <button type="button" id="copyRulesJsonBtn">Copy JSON</button>
          <button type="button" id="importRulesBtn" class="orange">Import JSON</button>
          <button type="button" id="downloadRulesJsonBtn" class="secondary">Download JSON</button>
          <input id="rulesImportFile" type="file" accept="application/json,.json" class="hidden" />
        </div>
        <p class="mini-muted">Import expects an array of rule objects with source, target, direction, and enabled fields.</p>
      </div>
    `;
    rulesGrid?.after(jsonCard);
  }

  const historyKey = 'romanizer-history-v2';
  let history = loadHistory();
  let historySignature = '';
  let undoStack = [];
  let redoStack = [];
  let updateTimer = null;

  const forwardExampleSearch = document.getElementById('forwardExampleSearch');
  const reverseExampleSearch = document.getElementById('reverseExampleSearch');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const rulesJsonArea = document.getElementById('rulesJsonArea');
  const exportRulesBtn = document.getElementById('exportRulesBtn');
  const copyRulesJsonBtn = document.getElementById('copyRulesJsonBtn');
  const importRulesBtn = document.getElementById('importRulesBtn');
  const downloadRulesJsonBtn = document.getElementById('downloadRulesJsonBtn');
  const rulesImportFile = document.getElementById('rulesImportFile');
  const undoRulesBtn = document.getElementById('undoRulesBtn');
  const redoRulesBtn = document.getElementById('redoRulesBtn');

  function loadHistory() {
    return [];
  }

  function saveHistory() {
    // Intentionally not persisted between sessions.
  }

  function getCurrentDirection() {
    return state.tab === 'reverse' ? 'reverse' : 'forward';
  }

  function currentInputEl() {
    return getCurrentDirection() === 'reverse' ? els.reverseInput : els.forwardInput;
  }

  function currentOutputEl() {
    return getCurrentDirection() === 'reverse' ? els.reverseOutput : els.forwardOutput;
  }

  function currentMode() {
    return getCurrentDirection() === 'reverse' ? state.reverseMode : state.forwardMode;
  }

  function currentProcessedText() {
    return currentOutputEl().textContent || '';
  }

  function recordHistoryItem() {
    const direction = getCurrentDirection();
    const input = currentInputEl().value;
    const output = currentProcessedText();
    if (!input.trim()) return;
    const signature = [direction, state.batch ? 'batch' : 'single', currentMode(), state.profile, input, output].join('\u241f');
    if (signature === historySignature) return;
    historySignature = signature;
    history = history.filter(item => item.signature !== signature);
    history.unshift({
      signature,
      direction,
      mode: currentMode(),
      batch: state.batch,
      profile: state.profile,
      input,
      output,
      ts: Date.now()
    });
    history = history.slice(0, 12);
    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    if (!historyList) return;
    if (!history.length) {
      historyList.innerHTML = '<div class="history-item"><div class="warning-title">No history yet.</div><div class="mini-muted">Type or paste text to create recent items.</div></div>';
      return;
    }
    historyList.innerHTML = history.map((item, index) => `
      <div class="history-item">
        <div class="history-meta">
          <span class="badge"><strong>${item.direction === 'forward' ? 'Forward' : 'Reverse'}</strong></span>
          <span class="badge">${item.batch ? 'Batch' : 'Single'}</span>
          <span class="badge">${item.mode.toUpperCase()}</span>
          <span class="mini-muted">${new Date(item.ts).toLocaleString()}</span>
        </div>
        <div class="mini-muted">${escapeHtml(truncate(item.input, 120))}</div>
        <div class="history-actions">
          <button type="button" data-history-index="${index}">Restore</button>
          <button type="button" class="secondary" data-history-copy="${index}">Copy output</button>
        </div>
      </div>
    `).join('');
  }

  function truncate(text, limit) {
    const value = String(text);
    return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
  }

  function applyHistoryItem(index) {
    const item = history[index];
    if (!item) return;
    if (item.direction === 'forward') {
      setTab('romanizer');
      els.forwardInput.value = item.input;
    } else {
      setTab('reverse');
      els.reverseInput.value = item.input;
    }
    setTimeout(() => {
      renderAll();
      enhancedUpdate();
    }, 0);
  }

  function clearHistory() {
    history = [];
    historySignature = '';
    saveHistory();
    renderHistory();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function isPerformanceMode(text) {
    const words = (text.match(/[A-Za-zА-Яа-яЁёІіЇїЄєҐґЪъЬь'’]+/g) || []).length;
    return text.length > 8000 || words > 1200;
  }

  function buildWarnings(direction, text, lang, performanceMode) {
    const warnings = new Map();
    const add = (key, textValue) => {
      if (!warnings.has(key)) warnings.set(key, textValue);
    };
    if (!text.trim()) return [];
    if (performanceMode) add('performance', 'Performance mode is active for this long input, so the detailed breakdown is simplified.');
    if (direction === 'forward') {
      if (window.isMixedScript && isMixedScript(text)) add('mixed', 'Mixed Cyrillic and Latin input detected. Romanization works best on one script at a time.');
      const langDetect = activeLanguageFor('forward', text);
      for (const token of text.match(TOKEN_RE) || []) {
        if (!(langDetect === 'ru' ? isCyrillicToken(token, 'ru') : isCyrillicToken(token, 'ua'))) continue;
        const details = getRomanizedWord(token, langDetect);
        for (const entry of details.trace || []) {
          if (/after consonant/i.test(entry.rule) && /apostrophe|e|o|u|a/i.test(entry.rule)) {
            add(`ctx-${entry.rule}`, 'Some letters use context-sensitive rules, especially e/yo/yu/ya after consonants.');
          }
          if (/soft sign/i.test(entry.rule) || /hard sign/i.test(entry.rule)) {
            add('signs', 'Soft and hard signs can change the output in context.');
          }
        }
      }
    } else {
      if (/[aeiouy]{2,}/i.test(text) || /(?:ye|yo|yu|ya|gh|shch|sch)/i.test(text)) {
        add('ambiguous', 'Reverse transliteration is approximate for ambiguous Latin sequences.');
      }
      if (/'/.test(text)) add('apostrophe', 'Apostrophes are treated as soft-sign markers in reverse transliteration.');
    }
    return [...warnings.values()];
  }

  function renderWarnings(direction, text, lang, performanceMode) {
    const el = direction === 'forward' ? document.getElementById('forwardWarnings') : document.getElementById('reverseWarnings');
    if (!el) return;
    const warnings = buildWarnings(direction, text, lang, performanceMode);
    if (!warnings.length) {
      el.innerHTML = '';
      return;
    }
    el.innerHTML = warnings.map(item => `
      <div class="warning-item">
        <div class="warning-title">Warning</div>
        <div>${escapeHtml(item)}</div>
      </div>
    `).join('');
  }

  function renderHighlightedLine(line, direction, lang, performanceMode) {
    if (!line) return '';
    if (performanceMode) {
      const plain = direction === 'forward' ? forwardTransliterate(line) : reverseTransliterate(line);
      return escapeHtml(plain);
    }
    return escapeHtml(line).replace(TOKEN_RE, token => {
      const isWord = direction === 'forward' ? isCyrillicToken(token, lang) : isLatinToken(token);
      if (!isWord) return escapeHtml(token);
      const translated = direction === 'forward'
        ? styleForwardWord(token, getRomanizedWord(token, lang).result, lang)
        : styleReverseWord(token, getReverseWord(token, lang).result);
      const changed = translated !== token;
      const safe = escapeHtml(translated);
      return changed ? `<span class="changed">${safe}</span>` : safe;
    });
  }

  function renderHighlightedOutput(text, direction, lang, performanceMode) {
    const lines = String(text).split(/\r?\n/);
    return lines.map(line => renderHighlightedLine(line, direction, lang, performanceMode)).join('<br>');
  }

  function updateOutput(direction) {
    const text = direction === 'forward' ? els.forwardInput.value : els.reverseInput.value;
    const lang = activeLanguageFor(direction, text);
    const outputEl = direction === 'forward' ? els.forwardOutput : els.reverseOutput;
    const performanceMode = isPerformanceMode(text);
    const raw = direction === 'forward'
      ? (state.batch ? text.split(/\r?\n/).map(line => forwardTransliterate(line)).join('\n') : forwardTransliterate(text))
      : (state.batch ? text.split(/\r?\n/).map(line => reverseTransliterate(line)).join('\n') : reverseTransliterate(text));
    outputEl.innerHTML = renderHighlightedOutput(raw, direction, lang, performanceMode);
    renderWarnings(direction, text, lang, performanceMode);

    const breakdownEl = direction === 'forward' ? document.getElementById('forwardBreakdown') : document.getElementById('reverseBreakdown');
    if (breakdownEl) {
      if (performanceMode) {
        breakdownEl.innerHTML = '<div class="breakdown-empty"><span class="perf-note">Performance mode is active.</span> Detailed breakdown is disabled for long input.</div>';
      } else {
        breakdownEl.innerHTML = state.batch ? buildBatchBreakdown(text, direction, lang) : buildBreakdown(text, direction, lang);
      }
    }

    if (direction === 'forward' && document.getElementById('forwardNote')) {
      document.getElementById('forwardNote').textContent = performanceMode
        ? 'Performance mode is active for long input. Detailed breakdown is simplified.'
        : (state.batch ? 'Batch mode transliterates one line at a time and keeps line breaks. Copy pairs exports each line as input → output.' : 'The output keeps punctuation, spaces, and line breaks. Copy pairs exports one line per input line as input → output.');
    }
    if (direction === 'reverse' && document.getElementById('reverseNote')) {
      document.getElementById('reverseNote').textContent = performanceMode
        ? 'Performance mode is active for long input. Detailed breakdown is simplified.'
        : (state.batch ? 'Batch mode transliterates one line at a time and keeps line breaks. Copy pairs exports each line as input → output.' : 'The output keeps punctuation, spaces, and line breaks. The reverse mapping is approximate for ambiguous Latin sequences.');
    }
  }

  function renderEnhancedOutputs() {
    updateOutput('forward');
    updateOutput('reverse');
  }

  function applyExampleSearch() {
    const apply = (root, query) => {
      if (!root) return;
      const q = String(query || '').trim().toLowerCase();
      root.querySelectorAll('button[data-sample]').forEach(button => {
        const label = button.textContent.toLowerCase();
        button.classList.toggle('hidden', q ? !label.includes(q) : false);
      });
    };
    apply(document.getElementById('forwardExamples'), forwardExampleSearch?.value);
    apply(document.getElementById('reverseExamples'), reverseExampleSearch?.value);
  }

  function syncRulesJsonArea() {
    if (!rulesJsonArea) return;
    rulesJsonArea.value = JSON.stringify(state.customRules || [], null, 2);
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function validateRules(value) {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) throw new Error('JSON must be an array.');
    const rules = parsed.map(item => {
      if (!item || typeof item !== 'object') throw new Error('Each rule must be an object.');
      return {
        source: String(item.source ?? ''),
        target: String(item.target ?? ''),
        direction: item.direction === 'forward' || item.direction === 'reverse' ? item.direction : 'both',
        enabled: item.enabled !== false
      };
    });
    return rules;
  }

  function captureRuleSnapshot() {
    try {
      return JSON.stringify(state.customRules || []);
    } catch {
      return '[]';
    }
  }

  function pushUndoSnapshot() {
    const snapshot = captureRuleSnapshot();
    if (!undoStack.length || undoStack[undoStack.length - 1] !== snapshot) {
      undoStack.push(snapshot);
      undoStack = undoStack.slice(-40);
    }
    redoStack = [];
    updateUndoRedoButtons();
  }

  function updateUndoRedoButtons() {
    if (undoRulesBtn) undoRulesBtn.disabled = !undoStack.length;
    if (redoRulesBtn) redoRulesBtn.disabled = !redoStack.length;
  }

  function restoreRules(snapshot, targetStack, sourceStack) {
    try {
      const rules = validateRules(snapshot);
      if (sourceStack === undoStack) {
        redoStack.push(captureRuleSnapshot());
      } else {
        undoStack.push(captureRuleSnapshot());
      }
      state.customRules = rules;
      saveRules();
      renderRuleEditor();
      renderPriorityView();
      renderAll();
      syncRulesJsonArea();
      updateUndoRedoButtons();
    } catch (error) {
      alert(error.message);
    }
  }

  function undoRules() {
    if (!undoStack.length) return;
    const current = captureRuleSnapshot();
    const snapshot = undoStack.pop();
    redoStack.push(current);
    try {
      state.customRules = validateRules(snapshot);
      saveRules();
      renderRuleEditor();
      renderPriorityView();
      renderAll();
      syncRulesJsonArea();
    } catch (error) {
      alert(error.message);
    }
    updateUndoRedoButtons();
  }

  function redoRules() {
    if (!redoStack.length) return;
    const current = captureRuleSnapshot();
    const snapshot = redoStack.pop();
    undoStack.push(current);
    try {
      state.customRules = validateRules(snapshot);
      saveRules();
      renderRuleEditor();
      renderPriorityView();
      renderAll();
      syncRulesJsonArea();
    } catch (error) {
      alert(error.message);
    }
    updateUndoRedoButtons();
  }

  function exportRules(download = false) {
    const json = JSON.stringify(state.customRules || [], null, 2);
    syncRulesJsonArea();
    if (download) {
      downloadText('romanizer-rules.json', json);
    }
    return json;
  }

  function importRulesFromText(text) {
    const rules = validateRules(text);
    state.customRules = rules;
    saveRules();
    renderRuleEditor();
    renderPriorityView();
    renderAll();
    syncRulesJsonArea();
  }

  function enhancedUpdate() {
    renderEnhancedOutputs();
    applyExampleSearch();
    renderHistory();
    syncRulesJsonArea();
    updateUndoRedoButtons();
  }

  document.addEventListener('input', () => {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(enhancedUpdate, 0);
  }, true);
  document.addEventListener('change', () => {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(enhancedUpdate, 0);
  }, true);
  document.addEventListener('click', event => {
    const sampleBtn = event.target.closest('[data-sample]');
    const historyBtn = event.target.closest('[data-history-index]');
    const historyCopyBtn = event.target.closest('[data-history-copy]');
    if (sampleBtn || historyBtn || historyCopyBtn) {
      clearTimeout(updateTimer);
      updateTimer = setTimeout(enhancedUpdate, 0);
    }
  }, true);

  forwardExampleSearch?.addEventListener('input', applyExampleSearch);
  reverseExampleSearch?.addEventListener('input', applyExampleSearch);

  historyList?.addEventListener('click', event => {
    const restoreBtn = event.target.closest('[data-history-index]');
    const copyBtn = event.target.closest('[data-history-copy]');
    if (restoreBtn) {
      applyHistoryItem(Number(restoreBtn.dataset.historyIndex));
    }
    if (copyBtn) {
      const item = history[Number(copyBtn.dataset.historyCopy)];
      if (item) navigator.clipboard.writeText(item.output || '').catch(() => {});
    }
  });
  clearHistoryBtn?.addEventListener('click', clearHistory);

  if (rulesPanel) {
    rulesPanel.addEventListener('click', event => {
      if (event.target.closest('#addRuleBtn') || event.target.closest('#saveRulesBtn') || event.target.closest('#resetRulesBtn') || event.target.closest('.rule-row button') || event.target.closest('#importRulesBtn')) {
        pushUndoSnapshot();
      }
    }, true);
  }

  undoRulesBtn?.addEventListener('click', undoRules);
  redoRulesBtn?.addEventListener('click', redoRules);

  exportRulesBtn?.addEventListener('click', () => {
    exportRules(false);
    enhancedUpdate();
  });
  copyRulesJsonBtn?.addEventListener('click', async () => {
    const json = exportRules(false);
    try {
      await navigator.clipboard.writeText(json);
      copyRulesJsonBtn.textContent = 'Copied';
      setTimeout(() => copyRulesJsonBtn.textContent = 'Copy JSON', 1200);
    } catch {
      copyRulesJsonBtn.textContent = 'Copy failed';
      setTimeout(() => copyRulesJsonBtn.textContent = 'Copy JSON', 1200);
    }
  });
  downloadRulesJsonBtn?.addEventListener('click', () => exportRules(true));
  importRulesBtn?.addEventListener('click', async () => {
    const fromArea = rulesJsonArea?.value?.trim();
    if (fromArea) {
      try {
        importRulesFromText(fromArea);
        enhancedUpdate();
        return;
      } catch (error) {
        alert(error.message);
        return;
      }
    }
    rulesImportFile?.click();
  });
  rulesImportFile?.addEventListener('change', async () => {
    const file = rulesImportFile.files?.[0];
    if (!file) return;
    const text = await file.text();
    importRulesFromText(text);
    rulesImportFile.value = '';
    enhancedUpdate();
  });

  rulesJsonArea?.addEventListener('input', () => {
    try {
      validateRules(rulesJsonArea.value);
      rulesJsonArea.setCustomValidity('');
    } catch (error) {
      rulesJsonArea.setCustomValidity(error.message);
    }
  });

  const ruleEditor = document.getElementById('ruleEditor');
  ruleEditor?.addEventListener('change', () => {
    syncRulesJsonArea();
    enhancedUpdate();
  });
  ruleEditor?.addEventListener('input', () => {
    syncRulesJsonArea();
  });

  syncRulesJsonArea();
  renderHistory();
  enhancedUpdate();
  updateUndoRedoButtons();

  const firstRuleButton = document.getElementById('addRuleBtn');
  if (firstRuleButton) firstRuleButton.setAttribute('aria-describedby', '');
})();
