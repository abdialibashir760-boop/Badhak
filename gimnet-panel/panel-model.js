// GİM NET properties panel – data logic (no DOM, easy to test).
// Field names and units follow GİM NET DATA FORMAT v0.1.
// Group 3 writes only the NETWORK part of the file, never "results".

export const KINDS = { junctions: 'junction', reservoirs: 'reservoir', tanks: 'tank', pipes: 'pipe' };

const num = (key, en, tr, unit, rules = {}) => ({ key, en, tr, unit, type: 'number', ...rules });

// "main" fields are the five values asked in the project guide.
export function getFields(kind, options = {}) {
  const dw = options.headloss === 'DW';
  switch (kind) {
    case 'junction':
      return [
        num('elevation', 'Elevation', 'Kot', 'm', { main: true }),
        num('demand', 'Demand', 'Talep', 'L/s', { main: true }),
      ];
    case 'reservoir':
      return [num('head', 'Total head', 'Toplam yük', 'm')];
    case 'tank':
      return [
        num('elevation', 'Elevation', 'Kot', 'm'),
        num('init_level', 'Initial level', 'Başlangıç su seviyesi', 'm', { min: 0 }),
        num('min_level', 'Minimum level', 'Minimum seviye', 'm', { min: 0 }),
        num('max_level', 'Maximum level', 'Maksimum seviye', 'm', { min: 0 }),
        // unit of tank diameter is not stated in v0.1; "diameter = mm" rule is used
        num('diameter', 'Diameter', 'Çap', 'mm', { gt: 0 }),
      ];
    case 'pipe':
      return [
        num('length', 'Length', 'Uzunluk', 'm', { gt: 0, main: true }),
        num('diameter', 'Diameter', 'Çap', 'mm', { gt: 0, main: true }),
        num('roughness', dw ? 'Roughness (Darcy-Weisbach)' : 'Roughness (Hazen-Williams C)',
          dw ? 'Pürüzlülük (Darcy-Weisbach)' : 'Pürüzlülük (Hazen-Williams C)',
          dw ? 'mm' : '', { gt: 0, main: true }),
        num('minor_loss', 'Minor loss K', 'Yerel kayıp K', '', { min: 0 }),
        { key: 'status', en: 'Status', tr: 'Durum', unit: '', type: 'enum', values: ['OPEN', 'CLOSED', 'CV'] },
      ];
    default:
      return [];
  }
}

export function findItem(network, id) {
  for (const [list, kind] of Object.entries(KINDS)) {
    const item = (network[list] || []).find((it) => it.id === id);
    if (item) return { kind, item };
  }
  return null;
}

// Text typed by the user -> value. Accepts "12,5" (Turkish decimal comma).
export function parseValue(field, text) {
  const raw = String(text).trim();
  if (field.type === 'enum') {
    return field.values.includes(raw) ? { ok: true, value: raw } : { ok: false, error: { en: 'Choose one of: ' + field.values.join(', '), tr: 'Şunlardan birini seçin: ' + field.values.join(', ') } };
  }
  if (raw === '') return { ok: false, error: { en: 'A value is required.', tr: 'Bir değer gerekli.' } };
  const value = Number(raw.replace(',', '.'));
  if (!Number.isFinite(value)) return { ok: false, error: { en: 'Enter a number.', tr: 'Bir sayı girin.' } };
  if (field.gt !== undefined && !(value > field.gt)) return { ok: false, error: { en: `Must be greater than ${field.gt}.`, tr: `${field.gt} değerinden büyük olmalı.` } };
  if (field.min !== undefined && value < field.min) return { ok: false, error: { en: `Must be at least ${field.min}.`, tr: `En az ${field.min} olmalı.` } };
  return { ok: true, value };
}

// Checks that depend on other fields of the same item (tank levels).
function crossCheck(kind, item, key, value) {
  if (kind !== 'tank') return null;
  const t = { ...item, [key]: value };
  if (!(t.min_level <= t.init_level && t.init_level <= t.max_level)) {
    return { en: 'Levels must satisfy min ≤ initial ≤ max.', tr: 'Seviyeler min ≤ başlangıç ≤ maks olmalı.' };
  }
  return null;
}

// Returns { ok, network, error, resultsStale }.
// The original network is not changed; a new object is returned.
export function applyEdit(network, id, key, text) {
  const found = findItem(network, id);
  if (!found) return { ok: false, error: { en: 'Item not found.', tr: 'Öğe bulunamadı.' } };
  const field = getFields(found.kind, network.options).find((f) => f.key === key);
  if (!field) return { ok: false, error: { en: 'Unknown field.', tr: 'Bilinmeyen alan.' } };
  const parsed = parseValue(field, text);
  if (!parsed.ok) return parsed;
  const cross = crossCheck(found.kind, found.item, key, parsed.value);
  if (cross) return { ok: false, error: cross };

  const list = Object.keys(KINDS).find((l) => KINDS[l] === found.kind);
  const next = {
    ...network,
    [list]: network[list].map((it) => (it.id === id ? { ...it, [key]: parsed.value } : it)),
  };
  // Old results no longer match the edited network; the caller decides what to do.
  return { ok: true, network: next, resultsStale: network.results != null };
}
