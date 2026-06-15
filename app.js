const DATA = {
  forwardTests: [
    ["ru", "Москва", "Moskva"], 
    ["ru", "подъезд", "podyezd"], 
    ["ru", "Ель", "Yel"], 
    ["ru", "Соёло", "Soyolo"], 
    ["ru", "Соело", "Soyelo"], 
    ["ru", "Щука", "Shchuka"], 
    ["ru", "Новый год", "Novy god"], 
    ["ru", "Набережные", "Naberezhnye"],
    ["ru", "Великий", "Veliky"],
    ["ua", "Україна", "Ukraina"], 
    ["ua", "п’ять", "piat"], 
    ["ua", "Європа", "Yevropa"], 
    ["ua", "Ґанок", "Ganok"], 
    ["ua", "кінець", "kinets"], 
    ["ua", "Ганна", "Hanna"],
    ["ua", "Згорани", "Zghorany"],
    ["ua", "Стрий", "Stryi"]
  ],
  reverseTests: [
    ["ru", "Moskva", "Москва"], 
    ["ru", "podyezd", "подъезд"], 
    ["ru", "Yel", "Ел"], 
    ["ru", "Soyolo", "Соёло"], 
    ["ru", "Soyelo", "Соело"], 
    ["ru", "Shchuka", "Щука"], 
    ["ru", "Novy god", "Новй год"], 
    ["ua", "Ukraina", "Украіна"], 
    ["ua", "piat", "піат"], 
    ["ua", "Yevropa", "Європа"], 
    ["ua", "Ganok", "Ґанок"], 
    ["ua", "kinets", "кінетс"], 
    ["ua", "Hanna", "Ганна"]
  ],
  ruReference: [
    ["А", "a", "A"], ["Б", "b", "B"], ["В", "v", "V"], ["Г", "g", "G"], ["Д", "d", "D"], 
    ["Е", "ye / e", "ye at start, after vowels, ъ, ь; e after consonants; in -ые ending: e"], 
    ["Ё", "yo", "Yo"], ["Ж", "zh", "Zh"], ["З", "z", "Z"], 
    ["И", "i / y", "i usually; y in -ий ending"], 
    ["Й", "y", "y usually; omitted in -ый, -ий endings"], 
    ["К", "k", "K"], ["Л", "l", "L"], ["М", "m", "M"], ["Н", "n", "N"], 
    ["О", "o", "O"], ["П", "p", "P"], ["Р", "r", "R"], ["С", "s", "S"], 
    ["Т", "t", "T"], ["У", "u", "U"], ["Ф", "f", "F"], ["Х", "kh", "Kh"], 
    ["Ц", "ts", "Ts"], ["Ч", "ch", "Ch"], ["Ш", "sh", "Sh"], ["Щ", "shch", "Shch"], 
    ["Ъ", "omitted / y", "Omitted before е, ё, ю, я; y before а, и, о, у, ы, э"], 
    ["Ы", "y", "Y"], 
    ["Ь", "omitted / y", "Omitted before е, ё, ю, я, consonants, and at end; y before а, и, о, у, ы, э"], 
    ["Э", "e", "E"], ["Ю", "yu", "Yu"], ["Я", "ya", "Ya"]
  ],
  uaReference: [
    ["А", "a", "A"], ["Б", "b", "B"], ["В", "v", "V"], ["Г", "h / gh", "h usually; gh after З"], 
    ["Ґ", "g", "G"], ["Д", "d", "D"], ["Е", "e", "E"], 
    ["Є", "ye / ie", "ye word-initially; ie elsewhere"], 
    ["Ж", "zh", "Zh"], ["З", "z", "Z"], ["И", "y", "Y"], ["І", "i", "I"], 
    ["Ї", "yi / i", "yi word-initially; i elsewhere"], 
    ["Й", "y / i", "y word-initially; i elsewhere"], 
    ["К", "k", "K"], ["Л", "l", "L"], ["М", "m", "M"], ["Н", "n", "N"], 
    ["О", "o", "O"], ["П", "p", "P"], ["Р", "r", "R"], ["С", "s", "S"], 
    ["Т", "t", "T"], ["У", "u", "U"], ["Ф", "f", "F"], ["Х", "kh", "Kh"], 
    ["Ц", "ts", "Ts"], ["Ч", "ch", "Ch"], ["Ш", "sh", "Sh"], ["Щ", "shch", "Shch"], 
    ["Ь", "omitted", "Omitted"], 
    ["Ю", "yu / iu", "yu word-initially; iu elsewhere"], 
    ["Я", "ya / ia", "ya word-initially; ia elsewhere"], 
    ["'", "omitted", "Apostrophe omitted"]
  ],
  customRuleSeed: []
};

const els = {};
let state = {
  tab: 'romanizer',
  theme: 'dark',
  profile: 'text',
  batch: false,
  forwardMode: 'auto',
  reverseMode: 'auto',
  customRules: []
};

const RU_LETTERS = new Set('абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split(''));
const UA_LETTERS = new Set('абвгдеёжзийклмнопрстуфхцчшщъыьэюяіїєґ'.split(''));
const RU_CONSONANTS = new Set('бвгджзйклмнпрстфхцчшщ'.split(''));
const RU_VOWELS = new Set('аеёиоуыэюя'.split(''));
const UA_CONSONANTS = new Set('бвгджзйклмнпрстфхцчшщґ'.split(''));
const HUSH = new Set('жшцчщ'.split(''));

const DEFAULT_FORWARD_EXAMPLES = [
  {label: 'Russian sample', value: 'Москва, подъезд, Великий, Ель, Щука, объём, съезд, Новый год'},
  {label: 'Ukrainian sample', value: 'Україна, п’ять, Європа, Ганна, Ґанок, Щастя, кінець, Стрий'},
  {label: 'Edge cases', value: 'подъезд\nНабережные\nЗнам\'янка\nп’ять'}
];
const DEFAULT_REVERSE_EXAMPLES = [
  {label: 'Russian sample', value: 'Moskva, podyezd, Yel, Shchuka, Novy god'},
  {label: 'Ukrainian sample', value: 'Ukraina, piat, Yevropa, Hanna, Ganok'},
  {label: 'Edge cases', value: 'podyezd\nYel\nNovy god\npiat'}
];

const TOKEN_RE = /([A-Za-zА-Яа-яЁёІіЇїЄєҐґЪъЬь'’]+)/gu;
const CYR_RE = /[А-Яа-яЁёІіЇїЄєҐґЪъЬь]/;
const LAT_RE = /[A-Za-z]/;
const UA_HINT_RE = /[іїєґ]/i;
const RU_WORD_RE = /[А-Яа-яЁёЪъЬь]+(?:['’][А-Яа-яЁёЪъЬь]+)*/gu;
const UA_WORD_RE = /[А-Яа-яЁёІіЇїЄєҐґЪъЬь]+(?:['’][А-Яа-яЁёІіЇїЄєҐґЪъЬь]+)*/gu;

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function init() {
  [
    'themeBtn','singleViewBtn','batchViewBtn','profileSelect',
    'forwardMode','reverseMode','forwardInput','reverseInput',
    'forwardOutput','reverseOutput','forwardBreakdown','reverseBreakdown',
    'forwardDetected','forwardActive','forwardChars','forwardLines','forwardScript',
    'reverseDetected','reverseActive','reverseChars','reverseLines','reverseScript',
    'forwardExamples','reverseExamples','forwardPasteBtn','reversePasteBtn',
    'forwardCopyBtn','reverseCopyBtn','forwardCopyPairsBtn','reverseCopyPairsBtn',
    'forwardDownloadBtn','reverseDownloadBtn','forwardLinkBtn','reverseLinkBtn',
    'forwardClearBtn','reverseClearBtn','forwardNote','reverseNote',
    'ruleEditor','addRuleBtn','saveRulesBtn','resetRulesBtn','priorityView',
    'testsResult','runTestsBtn','printReferenceBtn','ruReference','uaReference'
  ].forEach(id => els[id] = $(id));

  const tabButtons = Array.from(document.querySelectorAll('.tabs button[data-tab]'));
  tabButtons.forEach(button => button.addEventListener('click', () => setTab(button.dataset.tab)));

  const url = new URL(window.location.href);
  try {
    ['romanizer-theme','romanizer-profile','romanizer-batch','romanizer-forward-mode','romanizer-reverse-mode','romanizer-active-tab','romanizer-custom-rules']
      .forEach(key => localStorage.removeItem(key));
  } catch {}
  state.tab = ['romanizer', 'reverse', 'rules', 'tests', 'reference'].includes(url.searchParams.get('tab'))
    ? url.searchParams.get('tab')
    : 'romanizer';
  state.theme = url.searchParams.get('theme') === 'light' ? 'light' : 'dark';
  state.profile = url.searchParams.get('profile') === 'names' ? 'names' : 'text';
  state.batch = url.searchParams.get('batch') === '1';
  state.forwardMode = ['ru','ua'].includes(url.searchParams.get('fmode')) ? url.searchParams.get('fmode') : 'auto';
  state.reverseMode = ['ru','ua'].includes(url.searchParams.get('rmode')) ? url.searchParams.get('rmode') : 'auto';
  state.customRules = [];
  applyTheme();
  els.profileSelect.value = state.profile;
  els.forwardMode.value = state.forwardMode;
  els.reverseMode.value = state.reverseMode;
  els.forwardInput.value = url.searchParams.get('ftext') || (state.tab === 'romanizer' ? (url.searchParams.get('text') || '') : '');
  els.reverseInput.value = url.searchParams.get('rtext') || (state.tab === 'reverse' ? (url.searchParams.get('text') || '') : '');
  els.singleViewBtn.classList.toggle('active', !state.batch);
  els.batchViewBtn.classList.toggle('active', state.batch);
  els.singleViewBtn.setAttribute('aria-pressed', String(!state.batch));
  els.batchViewBtn.setAttribute('aria-pressed', String(state.batch));
  setTab(state.tab, false);
  renderExamples();
  renderRuleEditor();
  renderReference();
  wireEvents();
  renderAll();
  registerSW();
}

function wireEvents() {
  els.themeBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    persistSettings();
  });

  els.singleViewBtn.addEventListener('click', () => setBatch(false));
  els.batchViewBtn.addEventListener('click', () => setBatch(true));
  els.profileSelect.addEventListener('change', () => {
    state.profile = els.profileSelect.value;
    persistSettings();
    renderAll();
  });

  els.forwardMode.addEventListener('change', () => {
    state.forwardMode = els.forwardMode.value;
    persistSettings();
    renderAll();
  });
  els.reverseMode.addEventListener('change', () => {
    state.reverseMode = els.reverseMode.value;
    persistSettings();
    renderAll();
  });

  els.forwardInput.addEventListener('input', renderAll);
  els.reverseInput.addEventListener('input', renderAll);

  els.forwardPasteBtn.addEventListener('click', () => pasteInto(els.forwardInput));
  els.reversePasteBtn.addEventListener('click', () => pasteInto(els.reverseInput));

  els.forwardCopyBtn.addEventListener('click', () => copyText(els.forwardOutput.textContent || '', els.forwardCopyBtn, 'Copied', 'Copy failed'));
  els.reverseCopyBtn.addEventListener('click', () => copyText(els.reverseOutput.textContent || '', els.reverseCopyBtn, 'Copied', 'Copy failed'));

  els.forwardCopyPairsBtn.addEventListener('click', () => copyText(getPairsOutput(els.forwardInput.value, 'forward'), els.forwardCopyPairsBtn, 'Pairs copied', 'Copy failed'));
  els.reverseCopyPairsBtn.addEventListener('click', () => copyText(getPairsOutput(els.reverseInput.value, 'reverse'), els.reverseCopyPairsBtn, 'Pairs copied', 'Copy failed'));

  els.forwardDownloadBtn.addEventListener('click', () => downloadText('romanization.txt', state.batch ? getPairsOutput(els.forwardInput.value, 'forward') : forwardTransliterate(els.forwardInput.value)));
  els.reverseDownloadBtn.addEventListener('click', () => downloadText('reverse-transliteration.txt', state.batch ? getPairsOutput(els.reverseInput.value, 'reverse') : reverseTransliterate(els.reverseInput.value)));

  els.forwardLinkBtn.addEventListener('click', () => copyText(buildShareLink('forward'), els.forwardLinkBtn, 'Link copied', 'Copy failed'));
  els.reverseLinkBtn.addEventListener('click', () => copyText(buildShareLink('reverse'), els.reverseLinkBtn, 'Link copied', 'Copy failed'));

  els.forwardClearBtn.addEventListener('click', () => {
    els.forwardInput.value = '';
    renderAll();
    els.forwardInput.focus();
  });
  els.reverseClearBtn.addEventListener('click', () => {
    els.reverseInput.value = '';
    renderAll();
    els.reverseInput.focus();
  });

  document.getElementById('addRuleBtn').addEventListener('click', () => {
    state.customRules.push({ source: '', target: '', direction: 'both', enabled: true });
    renderRuleEditor();
    renderPriorityView();
  });

  document.getElementById('saveRulesBtn').addEventListener('click', () => {
    state.customRules = collectRulesFromEditor();
    saveRules();
    renderAll();
  });

  document.getElementById('resetRulesBtn').addEventListener('click', () => {
    state.customRules = [];
    saveRules();
    renderRuleEditor();
    renderAll();
  });

  document.getElementById('runTestsBtn').addEventListener('click', renderTests);
  document.getElementById('printReferenceBtn').addEventListener('click', () => window.print());

  document.addEventListener('keydown', event => {
    if (event.altKey && !event.ctrlKey && !event.metaKey) {
      const map = { '1': 'romanizer', '2': 'reverse', '3': 'rules', '4': 'tests', '5': 'reference' };
      if (map[event.key]) {
        event.preventDefault();
        setTab(map[event.key]);
      }
    }
    const activeInput = getActiveInput();
    if (event.key === 'Escape' && activeInput) {
      activeInput.value = '';
      renderAll();
    }
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      const text = getActiveOutputText();
      const btn = state.tab === 'reverse' ? els.reverseCopyBtn : els.forwardCopyBtn;
      copyText(text, btn, 'Copied', 'Copy failed');
    }
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      const text = getActiveOutputText();
      const btn = state.tab === 'reverse' ? els.reverseCopyBtn : els.forwardCopyBtn;
      copyText(text, btn, 'Copied', 'Copy failed');
    }
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      const btn = state.tab === 'reverse' ? els.reverseLinkBtn : els.forwardLinkBtn;
      copyText(buildShareLink(state.tab === 'reverse' ? 'reverse' : 'forward'), btn, 'Link copied', 'Copy failed');
    }
  });
}

function loadRules() {
  return [];
}

function saveRules() {}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  els.themeBtn.textContent = `Theme: ${state.theme === 'dark' ? 'Dark' : 'Light'}`;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', state.theme === 'dark' ? '#07111f' : '#f4f7fb');
}

function setBatch(value) {
  state.batch = value;
  els.singleViewBtn.classList.toggle('active', !value);
  els.batchViewBtn.classList.toggle('active', value);
  els.singleViewBtn.setAttribute('aria-pressed', String(!value));
  els.batchViewBtn.setAttribute('aria-pressed', String(value));
  persistSettings();
  renderAll();
}

function setTab(tab, updateHistory = true) {
  state.tab = tab;
  document.querySelectorAll('.tabs button[data-tab]').forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `${tab}-panel`);
  });
  if (updateHistory) persistSettings();
  renderAll();
  if (tab === 'tests') renderTests();
}

function persistSettings() {
  syncUrl();
}

function syncUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set('tab', state.tab);
  url.searchParams.set('theme', state.theme);
  url.searchParams.set('profile', state.profile);
  url.searchParams.set('batch', state.batch ? '1' : '0');
  url.searchParams.set('fmode', state.forwardMode);
  url.searchParams.set('rmode', state.reverseMode);
  if (els.forwardInput.value) url.searchParams.set('ftext', els.forwardInput.value); else url.searchParams.delete('ftext');
  if (els.reverseInput.value) url.searchParams.set('rtext', els.reverseInput.value); else url.searchParams.delete('rtext');
  const currentText = state.tab === 'reverse' ? els.reverseInput.value : els.forwardInput.value;
  if (currentText) url.searchParams.set('text', currentText); else url.searchParams.delete('text');
  window.history.replaceState({}, '', url.toString());
}

function renderExamples() {
  const forwardExamples = DEFAULT_FORWARD_EXAMPLES;
  const reverseExamples = DEFAULT_REVERSE_EXAMPLES;
  els.forwardExamples.innerHTML = forwardExamples.map((item, index) => `<button type="button" class="secondary" data-sample="forward-${index}">${escapeHtml(item.label)}</button>`).join('');
  els.reverseExamples.innerHTML = reverseExamples.map((item, index) => `<button type="button" class="secondary" data-sample="reverse-${index}">${escapeHtml(item.label)}</button>`).join('');
  els.forwardExamples.querySelectorAll('button').forEach((button, index) => {
    button.addEventListener('click', () => {
      els.forwardInput.value = forwardExamples[index].value;
      state.tab = 'romanizer';
      renderAll();
      setTab('romanizer');
      els.forwardInput.focus();
    });
  });
  els.reverseExamples.querySelectorAll('button').forEach((button, index) => {
    button.addEventListener('click', () => {
      els.reverseInput.value = reverseExamples[index].value;
      state.tab = 'reverse';
      renderAll();
      setTab('reverse');
      els.reverseInput.focus();
    });
  });
}

function renderReference() {
  els.ruReference.innerHTML = buildReferenceTable(DATA.ruReference);
  els.uaReference.innerHTML = buildReferenceTable(DATA.uaReference);
}

function buildReferenceTable(rows) {
  return `
    <table>
      <colgroup>
        <col style="width:16%">
        <col style="width:26%">
        <col style="width:58%">
      </colgroup>
      <thead>
        <tr>
          <th>Letter</th>
          <th>Output</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            <td>${escapeHtml(row[0])}</td>
            <td>${escapeHtml(row[1])}</td>
            <td>${escapeHtml(row[2])}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function createRuleRow(rule, index) {
  return `
    <div class="rule-row" data-index="${index}">
      <input class="toggle" type="checkbox" ${rule.enabled ? 'checked' : ''} aria-label="Enable rule ${index + 1}" />
      <input class="source" type="text" placeholder="Source" value="${escapeHtml(rule.source)}" aria-label="Rule source ${index + 1}" />
      <input class="target" type="text" placeholder="Target" value="${escapeHtml(rule.target)}" aria-label="Rule target ${index + 1}" />
      <select class="dir" aria-label="Rule direction ${index + 1}">
        <option value="both"${rule.direction === 'both' ? ' selected' : ''}>Both</option>
        <option value="forward"${rule.direction === 'forward' ? ' selected' : ''}>Forward</option>
        <option value="reverse"${rule.direction === 'reverse' ? ' selected' : ''}>Reverse</option>
      </select>
      <button type="button" class="up" title="Move up">↑</button>
      <button type="button" class="down" title="Move down">↓</button>
      <button type="button" class="del danger" title="Delete rule">×</button>
    </div>
  `;
}

function renderRuleEditor() {
  const rules = state.customRules.length ? state.customRules : [{ source: '', target: '', direction: 'both', enabled: true }];
  els.ruleEditor.innerHTML = rules.map((rule, index) => createRuleRow(rule, index)).join('');
  els.ruleEditor.querySelectorAll('.rule-row').forEach(row => {
    const index = Number(row.dataset.index);
    row.querySelector('.up').addEventListener('click', () => moveRule(index, -1));
    row.querySelector('.down').addEventListener('click', () => moveRule(index, 1));
    row.querySelector('.del').addEventListener('click', () => deleteRule(index));
  });
  renderPriorityView();
}

function collectRulesFromEditor() {
  const rows = Array.from(els.ruleEditor.querySelectorAll('.rule-row'));
  return rows.map(row => ({
    enabled: row.querySelector('.toggle').checked,
    source: row.querySelector('.source').value,
    target: row.querySelector('.target').value,
    direction: row.querySelector('.dir').value
  })).filter(rule => rule.source.length || rule.target.length);
}

function moveRule(index, delta) {
  const rows = collectRulesFromEditor();
  const next = index + delta;
  if (next < 0 || next >= rows.length) return;
  [rows[index], rows[next]] = [rows[next], rows[index]];
  state.customRules = rows;
  renderRuleEditor();
  saveRules();
}

function deleteRule(index) {
  const rows = collectRulesFromEditor();
  rows.splice(index, 1);
  state.customRules = rows;
  renderRuleEditor();
  saveRules();
}

function renderPriorityView() {
  const customItems = state.customRules.length ? state.customRules.map((rule, index) => {
    const dir = rule.direction === 'both' ? 'Both' : rule.direction === 'forward' ? 'Forward' : 'Reverse';
    const stateText = rule.enabled ? 'Enabled' : 'Disabled';
    const source = rule.source || 'Empty source';
    const target = rule.target || 'Empty target';
    return `<div class="shortcut-item"><span>${index + 1}. ${escapeHtml(source)} → ${escapeHtml(target)} <span class="muted">(${escapeHtml(dir)}, ${escapeHtml(stateText)})</span></span><span class="kbd">Custom</span></div>`;
  }).join('') : '<div class="shortcut-item"><span>No custom rules yet.</span><span class="kbd">Idle</span></div>';
  const base = [
    '<div class="shortcut-item"><span>1. Custom rules in table order</span><span class="kbd">Highest</span></div>',
    '<div class="shortcut-item"><span>2. Base transliteration rules</span><span class="kbd">Core</span></div>',
    '<div class="shortcut-item"><span>3. Name profile formatting</span><span class="kbd">Post-process</span></div>',
    '<div class="shortcut-item"><span>4. URL state and theme memory</span><span class="kbd">Saved</span></div>'
  ].join('');
  document.getElementById('priorityView').innerHTML = customItems + base;
}

function applyCustomRules(text, direction) {
  let result = text;
  for (const rule of state.customRules) {
    if (!rule.enabled || !rule.source) continue;
    if (rule.direction !== 'both' && rule.direction !== direction) continue;
    result = result.split(rule.source).join(rule.target);
  }
  return result;
}

function isRuLetter(ch) {
  return RU_LETTERS.has(ch.toLowerCase());
}

function isUaLetter(ch) {
  return UA_LETTERS.has(ch.toLowerCase());
}

function isCyrillicLetter(ch) {
  return CYR_RE.test(ch);
}

function hasLatin(text) {
  return LAT_RE.test(text);
}

function isMixedScript(text) {
  return hasLatin(text) && CYR_RE.test(text);
}

function detectCyrillicLanguage(text) {
  const lower = text.toLowerCase();
  if (/[іїєґ]/.test(lower)) return 'ua';
  return 'ru';
}

function detectLatinLanguage(text) {
  const lower = text.toLowerCase();
  if (/gh|yi/.test(lower)) return 'ua';
  return 'ru';
}

function activeLanguageFor(direction, text) {
  const mode = direction === 'forward' ? state.forwardMode : state.reverseMode;
  if (mode !== 'auto') return mode;
  return direction === 'forward' ? detectCyrillicLanguage(text) : detectLatinLanguage(text);
}

function isAllUppercase(chunk, lang) {
  const check = lang === 'ru' ? isRuLetter : isUaLetter;
  const letters = [...chunk].filter(check);
  return letters.length > 0 && letters.every(ch => ch === ch.toUpperCase());
}

function isTitlecase(chunk, lang) {
  const check = lang === 'ru' ? isRuLetter : isUaLetter;
  const letters = [...chunk].filter(check);
  return letters.length > 0 && letters[0] === letters[0].toUpperCase() && letters.slice(1).every(ch => ch === ch.toLowerCase());
}

function styleForwardWord(chunk, transliterated, lang) {
  if (state.profile === 'names') return titleCaseLatin(transliterated);
  if (isAllUppercase(chunk, lang)) return transliterated.toUpperCase();
  if (isTitlecase(chunk, lang)) return transliterated.charAt(0).toUpperCase() + transliterated.slice(1);
  return transliterated;
}

function isLatinAllUpper(chunk) {
  const letters = [...chunk].filter(ch => /[A-Za-z]/.test(ch));
  return letters.length > 0 && letters.every(ch => ch === ch.toUpperCase());
}

function isLatinTitlecase(chunk) {
  const letters = [...chunk].filter(ch => /[A-Za-z]/.test(ch));
  return letters.length > 0 && letters[0] === letters[0].toUpperCase() && letters.slice(1).every(ch => ch === ch.toLowerCase());
}

function styleReverseWord(source, transliterated) {
  if (state.profile === 'names') return titleCaseCyrillic(transliterated);
  if (isLatinAllUpper(source)) return transliterated.toUpperCase();
  if (isLatinTitlecase(source)) return transliterated.charAt(0).toUpperCase() + transliterated.slice(1);
  return transliterated;
}

function titleCaseLatin(text) {
  return text.replace(/(^|[^A-Za-z]+)([A-Za-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
}

function titleCaseCyrillic(text) {
  return text.replace(/(^|[^А-Яа-яЁёІіЇїЄєҐґ]+)([А-Яа-яЁёІіЇїЄєҐґ])/g, (_, p1, p2) => p1 + p2.toUpperCase());
}

function formatForwardRuleLabel(rule) {
  if (!rule) return rule;
  const replacements = [
    [/^Shch\b/, 'Щ'],
    [/^Sch\b/, 'Щ'],
    [/^Kh\b/, 'Х'],
    [/^Zh\b/, 'Ж'],
    [/^Ch\b/, 'Ч'],
    [/^Sh\b/, 'Ш'],
    [/^Ts\b/, 'Ц'],
    [/^Yo\b/, 'Ё'],
    [/^Ye\b/, 'Е'],
    [/^Yu\b/, 'Ю'],
    [/^Ya\b/, 'Я'],
    [/^Y\b/, 'Й'],
    [/^A\b/, 'А'],
    [/^B\b/, 'Б'],
    [/^V\b/, 'В'],
    [/^G\b/, 'Г'],
    [/^D\b/, 'Д'],
    [/^E\b/, 'Е'],
    [/^Z\b/, 'З'],
    [/^I\b/, 'И'],
    [/^K\b/, 'К'],
    [/^L\b/, 'Л'],
    [/^M\b/, 'М'],
    [/^N\b/, 'Н'],
    [/^O\b/, 'О'],
    [/^P\b/, 'П'],
    [/^R\b/, 'Р'],
    [/^S\b/, 'С'],
    [/^T\b/, 'Т'],
    [/^U\b/, 'У'],
    [/^F\b/, 'Ф'],
    [/^X\b/, 'Х']
  ];
  for (const [re, repl] of replacements) {
    if (re.test(rule)) return rule.replace(re, repl);
  }
  return rule;
}

function romanizeRussianChunk(chunk) {
  const chars = [...chunk];
  const out = [];
  const trace = [];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const low = ch.toLowerCase();

    let prevC = null;
    for (let j = i - 1; j >= 0; j--) {
      let c = chars[j].toLowerCase();
      if (c !== "'" && c !== "’") { prevC = c; break; }
    }

    let nextC = null;
    let nextNextC = null;
    let foundNext = false;
    for (let j = i + 1; j < chars.length; j++) {
      let c = chars[j].toLowerCase();
      if (c !== "'" && c !== "’") {
        if (!foundNext) { nextC = c; foundNext = true; }
        else { nextNextC = c; break; }
      }
    }

    let result = ch;
    let rule = 'Preserved';

    const iotated = new Set(['е', 'ё', 'ю', 'я']);
    const nonIotatedVowels = new Set(['а', 'и', 'о', 'у', 'ы', 'э']);
    const vowels = new Set(['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я']);

    if (low === 'ъ') {
      if (nextC && iotated.has(nextC)) {
        result = '';
        rule = 'Hard sign omitted before iotated vowel';
      } else if (nextC && nonIotatedVowels.has(nextC)) {
        result = 'y';
        rule = 'Hard sign → y before non-iotated vowel';
      } else {
        result = '';
        rule = 'Hard sign omitted';
      }
    } else if (low === 'ь') {
      if (nextC && iotated.has(nextC)) {
        result = '';
        rule = 'Soft sign omitted before iotated vowel';
      } else if (nextC && nonIotatedVowels.has(nextC)) {
        result = 'y';
        rule = 'Soft sign → y before non-iotated vowel';
      } else {
        result = '';
        rule = 'Soft sign omitted';
      }
    } else if (low === "'" || low === "’") {
      result = '';
      rule = 'Apostrophe omitted';
    } else {
      switch (low) {
        case 'а': result = 'a'; rule = 'А → a'; break;
        case 'б': result = 'b'; rule = 'Б → b'; break;
        case 'в': result = 'v'; rule = 'В → v'; break;
        case 'г': result = 'g'; rule = 'Г → g'; break;
        case 'д': result = 'd'; rule = 'Д → d'; break;
        case 'е':
          if (!prevC || vowels.has(prevC) || prevC === 'ъ' || prevC === 'ь') {
            if (prevC === 'ы' && nextC === null) {
              result = 'e';
              rule = 'Е in -ые ending → e';
            } else {
              result = 'ye';
              rule = 'Е at start, after vowel, ъ, ь → ye';
            }
          } else {
            result = 'e';
            rule = 'Е after consonant → e';
          }
          break;
        case 'ё': result = 'yo'; rule = 'Ё → yo'; break;
        case 'ж': result = 'zh'; rule = 'Ж → zh'; break;
        case 'з': result = 'z'; rule = 'З → z'; break;
        case 'и':
          if (nextC === 'й' && nextNextC === null) {
            result = 'y';
            rule = 'И in -ий ending → y';
          } else {
            result = 'i';
            rule = 'И → i';
          }
          break;
        case 'й':
          if ((prevC === 'и' || prevC === 'ы') && nextC === null) {
            result = '';
            rule = 'Й omitted in -ий/-ый ending';
          } else {
            result = 'y';
            rule = 'Й → y';
          }
          break;
        case 'к': result = 'k'; rule = 'К → k'; break;
        case 'л': result = 'l'; rule = 'Л → l'; break;
        case 'м': result = 'm'; rule = 'М → m'; break;
        case 'н': result = 'n'; rule = 'Н → n'; break;
        case 'о': result = 'o'; rule = 'О → o'; break;
        case 'п': result = 'p'; rule = 'П → p'; break;
        case 'р': result = 'r'; rule = 'Р → r'; break;
        case 'с': result = 's'; rule = 'С → s'; break;
        case 'т': result = 't'; rule = 'Т → t'; break;
        case 'у': result = 'u'; rule = 'У → u'; break;
        case 'ф': result = 'f'; rule = 'Ф → f'; break;
        case 'х': result = 'kh'; rule = 'Х → kh'; break;
        case 'ц': result = 'ts'; rule = 'Ц → ts'; break;
        case 'ч': result = 'ch'; rule = 'Ч → ch'; break;
        case 'ш': result = 'sh'; rule = 'Ш → sh'; break;
        case 'щ': result = 'shch'; rule = 'Щ → shch'; break;
        case 'ы':
          if (nextC === 'й' && nextNextC === null) {
            result = 'y';
            rule = 'Ы in -ый ending → y';
          } else {
            result = 'y';
            rule = 'Ы → y';
          }
          break;
        case 'э': result = 'e'; rule = 'Э → e'; break;
        case 'ю': result = 'yu'; rule = 'Ю → yu'; break;
        case 'я': result = 'ya'; rule = 'Я → ya'; break;
      }
    }

    trace.push({ source: ch, result, rule: formatForwardRuleLabel(rule) });
    if (result !== undefined && result !== null) {
      out.push(result);
    }
  }
  return { result: out.join(''), trace };
}

function romanizeUkrainianChunk(chunk) {
  const chars = [...chunk];
  const out = [];
  const trace = [];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const low = ch.toLowerCase();
    
    let prevC = null;
    for(let j = i - 1; j >= 0; j--) {
        let c = chars[j].toLowerCase();
        if (c !== "'" && c !== "’") { prevC = c; break; }
    }

    let result = ch;
    let rule = 'Preserved';

    if (low === "'" || low === "’" || low === 'ь' || low === 'ъ') {
      result = '';
      rule = 'Apostrophe or soft/hard sign omitted';
    } else {
      switch (low) {
        case 'а': result = 'a'; rule = 'А → a'; break;
        case 'б': result = 'b'; rule = 'Б → b'; break;
        case 'в': result = 'v'; rule = 'В → v'; break;
        case 'г':
          if (prevC === 'з') {
            result = 'gh';
            rule = 'Г after З → gh';
          } else {
            result = 'h';
            rule = 'Г → h';
          }
          break;
        case 'ґ': result = 'g'; rule = 'Ґ → g'; break;
        case 'д': result = 'd'; rule = 'Д → d'; break;
        case 'е': result = 'e'; rule = 'Е → e'; break;
        case 'є':
          if (!prevC) {
            result = 'ye';
            rule = 'Є word-initially → ye';
          } else {
            result = 'ie';
            rule = 'Є elsewhere → ie';
          }
          break;
        case 'ж': result = 'zh'; rule = 'Ж → zh'; break;
        case 'з': result = 'z'; rule = 'З → z'; break;
        case 'и': result = 'y'; rule = 'И → y'; break;
        case 'і': result = 'i'; rule = 'І → i'; break;
        case 'ї':
          if (!prevC) {
            result = 'yi';
            rule = 'Ї word-initially → yi';
          } else {
            result = 'i';
            rule = 'Ї elsewhere → i';
          }
          break;
        case 'й':
          if (!prevC) {
            result = 'y';
            rule = 'Й word-initially → y';
          } else {
            result = 'i';
            rule = 'Й elsewhere → i';
          }
          break;
        case 'к': result = 'k'; rule = 'К → k'; break;
        case 'л': result = 'l'; rule = 'Л → l'; break;
        case 'м': result = 'm'; rule = 'М → m'; break;
        case 'н': result = 'n'; rule = 'Н → n'; break;
        case 'о': result = 'o'; rule = 'О → o'; break;
        case 'п': result = 'p'; rule = 'П → p'; break;
        case 'р': result = 'r'; rule = 'Р → r'; break;
        case 'с': result = 's'; rule = 'С → s'; break;
        case 'т': result = 't'; rule = 'Т → t'; break;
        case 'у': result = 'u'; rule = 'У → u'; break;
        case 'ф': result = 'f'; rule = 'Ф → f'; break;
        case 'х': result = 'kh'; rule = 'Х → kh'; break;
        case 'ц': result = 'ts'; rule = 'Ц → ts'; break;
        case 'ч': result = 'ch'; rule = 'Ч → ch'; break;
        case 'ш': result = 'sh'; rule = 'Ш → sh'; break;
        case 'щ': result = 'shch'; rule = 'Щ → shch'; break;
        case 'ю':
          if (!prevC) {
            result = 'yu';
            rule = 'Ю word-initially → yu';
          } else {
            result = 'iu';
            rule = 'Ю elsewhere → iu';
          }
          break;
        case 'я':
          if (!prevC) {
            result = 'ya';
            rule = 'Я word-initially → ya';
          } else {
            result = 'ia';
            rule = 'Я elsewhere → ia';
          }
          break;
      }
    }

    trace.push({ source: ch, result, rule: formatForwardRuleLabel(rule) });
    if (result !== undefined && result !== null) {
      out.push(result);
    }
  }
  return { result: out.join(''), trace };
}

function reverseRussianWord(chunk) {
  const lower = chunk.toLowerCase();
  let i = 0;
  let out = '';
  const trace = [];
  while (i < lower.length) {
    const rest = lower.slice(i);
    const prev = lastCyrillicLetter(out);
    const prevConsonant = prev ? RU_CONSONANTS.has(prev) : false;
    let result = null;
    let rule = '';
    let step = 0;

    if (rest.startsWith('shch')) {
      result = 'щ'; rule = 'Shch → щ'; step = 4;
    } else if (rest.startsWith('sch')) {
      result = 'щ'; rule = 'Sch → щ'; step = 3;
    } else if (rest.startsWith('yo')) {
      result = 'ё'; rule = 'Yo → ё'; step = 2;
    } else if (rest.startsWith('ye')) {
      result = prevConsonant ? 'ъе' : 'е'; rule = prevConsonant ? 'Ye after consonant → ъе' : 'Ye → е'; step = 2;
    } else if (rest.startsWith('yu')) {
      result = prevConsonant ? 'ъю' : 'ю'; rule = prevConsonant ? 'Yu after consonant → ъю' : 'Yu → ю'; step = 2;
    } else if (rest.startsWith('ya')) {
      result = prevConsonant ? 'ъя' : 'я'; rule = prevConsonant ? 'Ya after consonant → ъя' : 'Ya → я'; step = 2;
    } else if (rest.startsWith('zh')) {
      result = 'ж'; rule = 'Zh → ж'; step = 2;
    } else if (rest.startsWith('kh')) {
      result = 'х'; rule = 'Kh → х'; step = 2;
    } else if (rest.startsWith('ts')) {
      result = 'ц'; rule = 'Ts → ц'; step = 2;
    } else if (rest.startsWith('ch')) {
      result = 'ч'; rule = 'Ch → ч'; step = 2;
    } else if (rest.startsWith('sh')) {
      result = 'ш'; rule = 'Sh → ш'; step = 2;
    } else {
      const ch = lower[i];
      switch (ch) {
        case 'a': result = 'а'; rule = 'a → а'; break;
        case 'b': result = 'б'; rule = 'b → б'; break;
        case 'v': result = 'в'; rule = 'v → в'; break;
        case 'g': result = 'г'; rule = 'g → г'; break;
        case 'd': result = 'д'; rule = 'd → д'; break;
        case 'e': result = 'е'; rule = 'e → е'; break;
        case 'z': result = 'з'; rule = 'z → з'; break;
        case 'i': result = 'и'; rule = 'i → и'; break;
        case 'y': result = 'й'; rule = 'y → й'; break;
        case 'k': result = 'к'; rule = 'k → к'; break;
        case 'l': result = 'л'; rule = 'l → л'; break;
        case 'm': result = 'м'; rule = 'm → м'; break;
        case 'n': result = 'н'; rule = 'n → н'; break;
        case 'o': result = 'о'; rule = 'o → о'; break;
        case 'p': result = 'п'; rule = 'p → п'; break;
        case 'r': result = 'р'; rule = 'r → р'; break;
        case 's': result = 'с'; rule = 's → с'; break;
        case 't': result = 'т'; rule = 't → т'; break;
        case 'u': result = 'у'; rule = 'u → у'; break;
        case 'f': result = 'ф'; rule = 'f → ф'; break;
        case 'h': result = 'х'; rule = 'h → х'; break;
        case 'c': result = 'к'; rule = 'c → к'; break;
        default: result = chunk[i]; rule = 'Preserved';
      }
      step = 1;
    }

    out += result;
    trace.push({ source: chunk.slice(i, i + step), result, rule });
    i += step;
  }
  return { result: out, trace };
}

function reverseUkrainianWord(chunk) {
  const lower = chunk.toLowerCase();
  let i = 0;
  let out = '';
  const trace = [];
  while (i < lower.length) {
    const rest = lower.slice(i);
    let result = null;
    let rule = '';
    let step = 0;

    if (rest.startsWith('shch')) {
      result = 'щ'; rule = 'Shch → щ'; step = 4;
    } else if (rest.startsWith('gh')) {
      result = 'г'; rule = 'Gh → г'; step = 2;
    } else if (rest.startsWith('yi')) {
      result = 'ї'; rule = 'Yi → ї'; step = 2;
    } else if (rest.startsWith('ye')) {
      result = 'є'; rule = 'Ye → є'; step = 2;
    } else if (rest.startsWith('yu')) {
      result = 'ю'; rule = 'Yu → ю'; step = 2;
    } else if (rest.startsWith('ya')) {
      result = 'я'; rule = 'Ya → я'; step = 2;
    } else if (rest.startsWith('ie')) {
      result = 'є'; rule = 'Ie → є'; step = 2;
    } else if (rest.startsWith('iu')) {
      result = 'ю'; rule = 'Iu → ю'; step = 2;
    } else if (rest.startsWith('ia')) {
      result = 'я'; rule = 'Ia → я'; step = 2;
    } else if (rest.startsWith('zh')) {
      result = 'ж'; rule = 'Zh → ж'; step = 2;
    } else if (rest.startsWith('kh')) {
      result = 'х'; rule = 'Kh → х'; step = 2;
    } else if (rest.startsWith('ts')) {
      result = 'ц'; rule = 'Ts → ц'; step = 2;
    } else if (rest.startsWith('ch')) {
      result = 'ч'; rule = 'Ch → ч'; step = 2;
    } else if (rest.startsWith('sh')) {
      result = 'ш'; rule = 'Sh → ш'; step = 2;
    } else {
      const ch = lower[i];
      switch (ch) {
        case 'a': result = 'а'; rule = 'a → а'; break;
        case 'b': result = 'б'; rule = 'b → б'; break;
        case 'v': result = 'в'; rule = 'v → в'; break;
        case 'g': result = 'ґ'; rule = 'g → ґ'; break;
        case 'd': result = 'д'; rule = 'd → д'; break;
        case 'e': result = 'е'; rule = 'e → е'; break;
        case 'z': result = 'з'; rule = 'z → з'; break;
        case 'i': result = 'і'; rule = 'i → і'; break;
        case 'y': result = 'и'; rule = 'y → и'; break;
        case 'k': result = 'к'; rule = 'k → к'; break;
        case 'l': result = 'л'; rule = 'l → л'; break;
        case 'm': result = 'м'; rule = 'm → м'; break;
        case 'n': result = 'н'; rule = 'n → н'; break;
        case 'o': result = 'о'; rule = 'o → о'; break;
        case 'p': result = 'п'; rule = 'p → п'; break;
        case 'r': result = 'р'; rule = 'r → р'; break;
        case 's': result = 'с'; rule = 's → с'; break;
        case 't': result = 'т'; rule = 't → т'; break;
        case 'u': result = 'у'; rule = 'u → у'; break;
        case 'f': result = 'ф'; rule = 'f → ф'; break;
        case 'h': result = 'г'; rule = 'h → г'; break;
        case 'c': result = 'к'; rule = 'c → к'; break;
        default: result = chunk[i]; rule = 'Preserved';
      }
      step = 1;
    }

    out += result;
    trace.push({ source: chunk.slice(i, i + step), result, rule });
    i += step;
  }
  return { result: out, trace };
}

function lastCyrillicLetter(text) {
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i].toLowerCase();
    if (CYR_RE.test(ch)) return ch;
  }
  return null;
}

function getRomanizedWord(chunk, lang) {
  return lang === 'ru' ? romanizeRussianChunk(chunk) : romanizeUkrainianChunk(chunk);
}

function getReverseWord(chunk, lang) {
  return lang === 'ru' ? reverseRussianWord(chunk) : reverseUkrainianWord(chunk);
}

function forwardTransliterate(text) {
  const lang = activeLanguageFor('forward', text);
  const applied = applyCustomRules(text, 'forward');
  return applyToTokens(applied, token => {
    if (!isCyrillicToken(token, lang)) return token;
    const { result } = getRomanizedWord(token, lang);
    return styleForwardWord(token, result, lang);
  });
}

function reverseTransliterate(text) {
  const lang = activeLanguageFor('reverse', text);
  const applied = applyCustomRules(text, 'reverse');
  return applyToTokens(applied, token => {
    if (!isLatinToken(token)) return token;
    const { result } = getReverseWord(token, lang);
    return styleReverseWord(token, result);
  });
}

function applyToTokens(text, mapper) {
  return text.replace(TOKEN_RE, token => mapper(token));
}

function isCyrillicToken(token, lang) {
  const re = lang === 'ru' ? RU_WORD_RE : UA_WORD_RE;
  re.lastIndex = 0;
  const ok = re.test(token);
  re.lastIndex = 0;
  return ok;
}

function isLatinToken(token) {
  return /[A-Za-z]/.test(token);
}

function buildBreakdown(text, direction, lang) {
  const tokens = text.match(TOKEN_RE);
  if (!tokens) return '<div class="breakdown-empty">Breakdown will appear here after you enter text.</div>';
  let index = 0;
  const items = [];
  for (const token of tokens) {
    const isWord = direction === 'forward' ? isCyrillicToken(token, lang) : isLatinToken(token);
    if (!isWord) continue;
    index += 1;
    const res = direction === 'forward' ? getRomanizedWord(token, lang) : getReverseWord(token, lang);
    const styled = direction === 'forward' ? styleForwardWord(token, res.result, lang) : styleReverseWord(token, res.result);
    const rules = uniqueRules(res.trace);
    items.push(`
      <div class="entry">
        <div class="entry-head">
          <span class="entry-title">Word ${index}</span>
          <span class="chip">${lang === 'ua' ? 'Ukrainian' : 'Russian'}</span>
        </div>
        <div class="entry-body">
          <div class="pair">
            <div>
              <span class="source-title">Source</span>
              <div class="source">${escapeHtml(token)}</div>
            </div>
            <div>
              <span class="result-title">Result</span>
              <div class="result">${escapeHtml(styled)}</div>
            </div>
          </div>
          <div>
            <span class="rules-title">Rules used</span>
            <div class="segment-line">${rules.length ? rules.map(rule => `<span class="seg">${escapeHtml(rule)}</span>`).join('') : '<span class="seg">No special rules</span>'}</div>
          </div>
        </div>
      </div>
    `);
  }
  return items.length ? items.join('') : '<div class="breakdown-empty">Breakdown will appear here after you enter text.</div>';
}

function uniqueRules(trace) {
  const seen = new Set();
  const out = [];
  for (const item of trace || []) {
    if (!item || !item.rule || seen.has(item.rule)) continue;
    seen.add(item.rule);
    out.push(item.rule);
  }
  return out;
}

function getProcessedText(text, direction) {
  return direction === 'forward' ? forwardTransliterate(text) : reverseTransliterate(text);
}

function getPairsOutput(text, lang) {
  return text.split(/\r?\n/).map(line => {
    const output = applyToTokens(line, token => {
      if (!token.trim()) return token;
      if (lang === 'forward') {
        const l = activeLanguageFor('forward', line);
        if (!isCyrillicToken(token, l)) return token;
        const { result } = getRomanizedWord(token, l);
        return styleForwardWord(token, result, l);
      }
      const l = activeLanguageFor('reverse', line);
      if (!isLatinToken(token)) return token;
      const { result } = getReverseWord(token, l);
      return styleReverseWord(token, result);
    });
    return `${line} → ${output}`;
  }).join('\n');
}

function updateMetrics(direction, text) {
  const detected = direction === 'forward' ? detectCyrillicLanguage(text) : detectLatinLanguage(text);
  const active = activeLanguageFor(direction, text);
  const chars = text.length;
  const lines = text ? text.split(/\r?\n/).length : 0;
  const scriptBadge = direction === 'forward' ? (isMixedScript(text) ? 'Mixed input' : (CYR_RE.test(text) ? 'Cyrillic only' : 'Ready')) : (hasLatin(text) && CYR_RE.test(text) ? 'Mixed input' : (hasLatin(text) ? 'Latin only' : 'Ready'));
  return { detected, active, chars, lines, scriptBadge };
}

function updateForward() {
  const text = els.forwardInput.value;
  const info = updateMetrics('forward', text);
  const output = state.batch ? text.split(/\r?\n/).map(line => getProcessedText(line, 'forward')).join('\n') : getProcessedText(text, 'forward');
  els.forwardOutput.textContent = output;
  els.forwardBreakdown.innerHTML = state.batch ? buildBatchBreakdown(text, 'forward', info.active) : buildBreakdown(text, 'forward', info.active);
  els.forwardDetected.innerHTML = `<strong>Detected:</strong> ${info.detected === 'ua' ? 'Ukrainian' : 'Russian'}`;
  els.forwardActive.innerHTML = `<strong>Active:</strong> ${state.forwardMode === 'auto' ? `Auto · ${info.active === 'ua' ? 'Ukrainian' : 'Russian'}` : (state.forwardMode === 'ua' ? 'Ukrainian' : 'Russian')}`;
  els.forwardChars.innerHTML = `<strong>Characters:</strong> ${info.chars}`;
  els.forwardLines.innerHTML = `<strong>Lines:</strong> ${info.lines}`;
  els.forwardScript.innerHTML = `<strong>Script:</strong> ${info.scriptBadge}`;
  els.forwardScript.className = 'badge' + (info.scriptBadge === 'Mixed input' ? ' orange' : '');
  els.forwardNote.textContent = state.batch ? '' : '';
}

function buildBatchBreakdown(text, direction, lang) {
  const lines = text.split(/\r?\n/);
  const items = [];
  let index = 0;
  lines.forEach((line) => {
    if (!line.trim()) {
      return;
    }
    index += 1;
    const out = getProcessedText(line, direction);
    const ruleSet = new Set();
    const tokens = line.match(TOKEN_RE) || [];
    for (const token of tokens) {
      const isWord = direction === 'forward' ? isCyrillicToken(token, lang) : isLatinToken(token);
      if (!isWord) continue;
      const result = direction === 'forward' ? getRomanizedWord(token, lang) : getReverseWord(token, lang);
      uniqueRules(result.trace).forEach(rule => ruleSet.add(rule));
    }
    items.push(`
      <div class="entry">
        <div class="entry-head">
          <span class="entry-title">Line ${index}</span>
        </div>
        <div class="entry-body">
          <div class="pair">
            <div>
              <span class="source-title">Source</span>
              <div class="source">${escapeHtml(line)}</div>
            </div>
            <div>
              <span class="result-title">Result</span>
              <div class="result">${escapeHtml(out)}</div>
            </div>
          </div>
          <div>
            <span class="rules-title">Rules used</span>
            <div class="segment-line">${ruleSet.size ? [...ruleSet].map(rule => `<span class="seg">${escapeHtml(rule)}</span>`).join('') : '<span class="seg">No special rules</span>'}</div>
          </div>
        </div>
      </div>
    `);
  });

  return items.join('');
}

function updateReverse() {
  const text = els.reverseInput.value;
  const info = updateMetrics('reverse', text);
  const output = state.batch ? text.split(/\r?\n/).map(line => getProcessedText(line, 'reverse')).join('\n') : getProcessedText(text, 'reverse');
  els.reverseOutput.textContent = output;
  els.reverseBreakdown.innerHTML = state.batch ? buildBatchBreakdown(text, 'reverse', info.active) : buildBreakdown(text, 'reverse', info.active);
  els.reverseDetected.innerHTML = `<strong>Detected:</strong> ${info.detected === 'ua' ? 'Ukrainian' : 'Russian'}`;
  els.reverseActive.innerHTML = `<strong>Active:</strong> ${state.reverseMode === 'auto' ? `Auto · ${info.active === 'ua' ? 'Ukrainian' : 'Russian'}` : (state.reverseMode === 'ua' ? 'Ukrainian' : 'Russian')}`;
  els.reverseChars.innerHTML = `<strong>Characters:</strong> ${info.chars}`;
  els.reverseLines.innerHTML = `<strong>Lines:</strong> ${info.lines}`;
  els.reverseScript.innerHTML = `<strong>Script:</strong> ${info.scriptBadge}`;
  els.reverseScript.className = 'badge' + (info.scriptBadge === 'Mixed input' ? ' orange' : '');
  els.reverseNote.textContent = state.batch ? '' : '';
}

function getActiveInput() {
  return state.tab === 'reverse' ? els.reverseInput : els.forwardInput;
}

function getActiveOutputText() {
  return state.tab === 'reverse' ? (els.reverseOutput.textContent || '') : (els.forwardOutput.textContent || '');
}

function renderAll() {
  els.profileSelect.value = state.profile;
  updateForward();
  updateReverse();
  renderPriorityView();
  syncUrl();
}

async function pasteInto(textarea) {
  try {
    const text = await navigator.clipboard.readText();
    textarea.value = text;
    renderAll();
    textarea.focus();
  } catch {
    const prev = textarea === els.forwardInput ? els.forwardPasteBtn : els.reversePasteBtn;
    const old = prev.textContent;
    prev.textContent = 'Paste unavailable';
    setTimeout(() => prev.textContent = old, 1200);
  }
}

async function copyText(text, button, okLabel, failLabel) {
  try {
    await navigator.clipboard.writeText(text);
    const old = button.textContent;
    button.textContent = okLabel;
    setTimeout(() => button.textContent = old, 1200);
  } catch {
    const old = button.textContent;
    button.textContent = failLabel;
    setTimeout(() => button.textContent = old, 1200);
  }
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildShareLink(direction) {
  const url = new URL(window.location.href);
  url.searchParams.set('tab', state.tab);
  url.searchParams.set('theme', state.theme);
  url.searchParams.set('profile', state.profile);
  url.searchParams.set('batch', state.batch ? '1' : '0');
  url.searchParams.set('fmode', state.forwardMode);
  url.searchParams.set('rmode', state.reverseMode);
  const text = direction === 'reverse' ? els.reverseInput.value : els.forwardInput.value;
  if (text) url.searchParams.set('text', text); else url.searchParams.delete('text');
  return url.toString();
}

function renderTests() {
  const rows = [];
  const profile = state.profile;
  DATA.forwardTests.forEach(([mode, input, expected]) => {
    const prevMode = state.forwardMode;
    state.forwardMode = mode;
    const actual = state.batch ? input.split(/\r?\n/).map(line => forwardTransliterate(line)).join('\n') : forwardTransliterate(input);
    rows.push({
      category: 'Forward',
      mode,
      input,
      expected,
      actual,
      pass: actual === expected
    });
    state.forwardMode = prevMode;
  });
  DATA.reverseTests.forEach(([mode, input, expected]) => {
    const prevMode = state.reverseMode;
    state.reverseMode = mode;
    const actual = state.batch ? input.split(/\r?\n/).map(line => reverseTransliterate(line)).join('\n') : reverseTransliterate(input);
    rows.push({
      category: 'Reverse',
      mode,
      input,
      expected,
      actual,
      pass: actual === expected
    });
    state.reverseMode = prevMode;
  });
  state.profile = profile;
  const html = `
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Mode</th>
          <th>Input</th>
          <th>Expected</th>
          <th>Actual</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            <td>${escapeHtml(row.category)}</td>
            <td>${escapeHtml(row.mode.toUpperCase())}</td>
            <td>${escapeHtml(row.input)}</td>
            <td>${escapeHtml(row.expected)}</td>
            <td>${escapeHtml(row.actual)}</td>
            <td class="${row.pass ? 'test-pass' : 'test-fail'}">${row.pass ? 'PASS' : 'FAIL'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="small-note" style="padding:12px 14px">Tests use the current custom rules and the current profile. Reverse transliteration is intentionally best-effort for ambiguous Latin input.</div>
  `;
  els.testsResult.innerHTML = html;
  renderPriorityView();
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations?.().then(registrations => {
    registrations.forEach(registration => registration.unregister().catch(() => {}));
  }).catch(() => {});
  if (window.caches?.keys) {
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).catch(() => {});
  }
}

init();