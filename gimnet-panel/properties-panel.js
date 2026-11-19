// GİM NET properties panel – DOM part. No libraries needed.
//
//   const panel = createPropertiesPanel(document.getElementById('panel'), {
//     getNetwork: () => network,                 // current network object
//     onChange: (newNetwork, info) => { network = newNetwork; redraw(); },
//   });
//   panel.select('P2');      // when the user clicks a node or pipe
//   panel.select(null);      // when nothing is selected
//   panel.setLanguage('tr'); // 'en' or 'tr'
import { applyEdit, findItem, getFields } from './panel-model.js';

const TEXT = {
  en: { title: 'Properties', none: 'Select a node or a pipe to see its values.', id: 'ID',
        junction: 'Junction', reservoir: 'Reservoir', tank: 'Tank', pipe: 'Pipe',
        from: 'From node', to: 'To node', more: 'Other values', stale: 'Results are out of date. Calculate again.' },
  tr: { title: 'Özellikler', none: 'Değerlerini görmek için bir düğüm veya boru seçin.', id: 'Kimlik',
        junction: 'Düğüm', reservoir: 'Rezervuar', tank: 'Depo', pipe: 'Boru',
        from: 'Başlangıç düğümü', to: 'Bitiş düğümü', more: 'Diğer değerler', stale: 'Sonuçlar güncel değil. Yeniden hesaplayın.' },
};

export function createPropertiesPanel(container, { getNetwork, onChange }) {
  let lang = 'en';
  let selectedId = null;
  let staleNotice = false;

  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v);
    }
    kids.forEach((c) => n.append(c));
    return n;
  };

  function row(field, item, idx) {
    const inputId = `gp-${selectedId}-${field.key}`.replace(/\W/g, '_');
    const errId = inputId + '-err';
    const label = el('label', { for: inputId }, field[lang], field.unit ? el('span', { class: 'gp-unit' }, ` (${field.unit})`) : '');
    const err = el('div', { class: 'gp-error', id: errId, role: 'alert' });

    let input;
    if (field.type === 'enum') {
      input = el('select', { id: inputId }, ...field.values.map((v) => el('option', { value: v }, v)));
      input.value = item[field.key];
    } else {
      input = el('input', { id: inputId, type: 'text', inputmode: 'decimal', autocomplete: 'off' });
      input.value = item[field.key];
    }
    input.setAttribute('aria-describedby', errId);

    const commit = () => {
      const res = applyEdit(getNetwork(), selectedId, field.key, input.value);
      if (!res.ok) {
        input.setAttribute('aria-invalid', 'true');
        err.textContent = res.error[lang];
        return;
      }
      input.removeAttribute('aria-invalid');
      err.textContent = '';
      input.value = findItem(res.network, selectedId).item[field.key]; // normalised number
      staleNotice = res.resultsStale;
      onChange(res.network, { id: selectedId, field: field.key, resultsStale: res.resultsStale });
      render();
    };
    input.addEventListener('change', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commit();
      if (e.key === 'Escape') { input.value = findItem(getNetwork(), selectedId).item[field.key]; input.removeAttribute('aria-invalid'); err.textContent = ''; }
    });
    return el('div', { class: 'gp-row' + (field.main ? ' gp-main' : '') }, label, input, err);
  }

  function render() {
    const t = TEXT[lang];
    container.replaceChildren();
    container.classList.add('gp-panel');
    container.append(el('h2', {}, t.title));
    const network = getNetwork();
    const found = selectedId && network ? findItem(network, selectedId) : null;
    if (!found) { container.append(el('p', { class: 'gp-empty' }, t.none)); return; }

    container.append(el('div', { class: 'gp-head' }, el('strong', {}, `${t[found.kind]} `), el('code', {}, found.item.id)));
    const fields = getFields(found.kind, network.options);
    const form = el('form', { onsubmit: (e) => e.preventDefault() });
    if (found.kind === 'pipe') {
      form.append(el('p', { class: 'gp-conn' }, `${t.from}: `, el('code', {}, found.item.from), `  →  ${t.to}: `, el('code', {}, found.item.to)));
    }
    fields.forEach((f, i) => form.append(row(f, found.item, i)));
    container.append(form);
    if (staleNotice) container.append(el('p', { class: 'gp-stale', role: 'status' }, t.stale));
  }

  return {
    select(id) { selectedId = id; render(); },
    setLanguage(l) { lang = l === 'tr' ? 'tr' : 'en'; render(); },
    refresh: render,
    clearStaleNotice() { staleNotice = false; render(); },
  };
}
