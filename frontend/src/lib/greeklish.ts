// ── First-name dictionary ─────────────────────────────────────────────────────
// Common Greek names in Greeklish → proper Greek with correct accents.
// Keys are lowercase. Add entries here as needed.
const FIRST_NAME_DICT: Record<string, string> = {
  // Male
  alexandros: 'Αλέξανδρος', alexis: 'Αλέξης', alexios: 'Αλέξιος',
  anastasios: 'Αναστάσιος', anastasis: 'Αναστάσης',
  andreas: 'Ανδρέας',
  angelos: 'Άγγελος',
  antonis: 'Αντώνης', antonios: 'Αντώνιος',
  apostolos: 'Απόστολος',
  athanasios: 'Αθανάσιος', thanasis: 'Θανάσης', thanos: 'Θάνος',
  christos: 'Χρήστος', xristos: 'Χρήστος', hristos: 'Χρήστος',
  constantinos: 'Κωνσταντίνος', konstantinos: 'Κωνσταντίνος',
  costas: 'Κώστας', kostas: 'Κώστας',
  dimitris: 'Δημήτρης', dimitrios: 'Δημήτριος', dimos: 'Δήμος',
  dionysis: 'Διονύσης',
  efthymios: 'Ευθύμιος', efthimis: 'Ευθύμης',
  emmanouil: 'Εμμανουήλ', manolis: 'Μανώλης',
  evangelos: 'Ευάγγελος', vangelis: 'Βαγγέλης',
  filippos: 'Φίλιππος', philippos: 'Φίλιππος',
  fotios: 'Φώτιος', fotis: 'Φώτης',
  georgios: 'Γεώργιος', giorgos: 'Γιώργος',
  giannis: 'Γιάννης', ioannis: 'Ιωάννης', yannis: 'Γιάννης', john: 'Ιωάννης',
  ilias: 'Ηλίας', elias: 'Ηλίας',
  iraklis: 'Ηρακλής', heraklis: 'Ηρακλής',
  kyriakos: 'Κυριάκος',
  lampros: 'Λάμπρος',
  leonidas: 'Λεωνίδας',
  loukas: 'Λουκάς', lukas: 'Λουκάς', lucas: 'Λουκάς',
  marios: 'Μάριος', markos: 'Μάρκος',
  michail: 'Μιχαήλ', michalis: 'Μιχάλης', mixalis: 'Μιχάλης',
  nikos: 'Νίκος', nikolaos: 'Νικόλαος', nikolas: 'Νικόλας',
  panagiotis: 'Παναγιώτης', panos: 'Πάνος',
  paraskevas: 'Παρασκευάς',
  pavlos: 'Παύλος', paul: 'Παύλος',
  petros: 'Πέτρος', peter: 'Πέτρος',
  sotiris: 'Σωτήρης', sotirios: 'Σωτήριος',
  spiros: 'Σπύρος', spyros: 'Σπύρος', spyridon: 'Σπυρίδων',
  stavros: 'Σταύρος',
  stefanos: 'Στέφανος', stephanos: 'Στέφανος',
  stratos: 'Στράτος',
  theodoros: 'Θεόδωρος', thodoris: 'Θοδωρής',
  thomas: 'Θωμάς',
  vasilis: 'Βασίλης', vasileios: 'Βασίλειος', vassilis: 'Βασίλης',
  // Female
  aikaterini: 'Αικατερίνη', katerina: 'Κατερίνα',
  anastasia: 'Αναστασία',
  anna: 'Άννα',
  antonia: 'Αντωνία',
  apostolia: 'Αποστολία',
  areti: 'Αρετή',
  argiro: 'Αργυρώ',
  athanasia: 'Αθανασία',
  christina: 'Χριστίνα', xristina: 'Χριστίνα',
  chrysa: 'Χρύσα', chrysanthi: 'Χρυσάνθη',
  danae: 'Δανάη',
  despina: 'Δέσποινα',
  dimitra: 'Δήμητρα',
  eirini: 'Ειρήνη', irini: 'Ειρήνη',
  eleni: 'Ελένη', heleni: 'Ελένη',
  eleftheria: 'Ελευθερία',
  emmanouela: 'Εμμανουέλα',
  evagelia: 'Ευαγγελία', evangelia: 'Ευαγγελία',
  fotini: 'Φωτεινή', foteini: 'Φωτεινή',
  georgia: 'Γεωργία',
  ioanna: 'Ιωάννα',
  kalliopi: 'Καλλιόπη',
  kyriaki: 'Κυριακή',
  lamprini: 'Λαμπρινή',
  loukia: 'Λουκία',
  magda: 'Μάγδα', magdalini: 'Μαγδαληνή',
  maria: 'Μαρία', mary: 'Μαρία', marianna: 'Μαριάννα', marina: 'Μαρίνα',
  nikoleta: 'Νικολέτα',
  panagiota: 'Παναγιώτα',
  paraskevi: 'Παρασκευή',
  penelope: 'Πηνελόπη',
  rania: 'Ράνια',
  sofia: 'Σοφία', sophia: 'Σοφία',
  stamatia: 'Σταματία',
  stella: 'Στέλλα',
  styliani: 'Στυλιανή',
  theodora: 'Θεοδώρα',
  vasiliki: 'Βασιλική',
  zoe: 'Ζωή', zoi: 'Ζωή',
};

// ── Rule-based transliteration (for last names / unknown names) ───────────────
// Digraphs must be checked before single chars — order matters.
const DIGRAPHS: [string, string][] = [
  ['ou', 'ου'], ['th', 'θ'], ['ch', 'χ'], ['ph', 'φ'],
  ['ps', 'ψ'], ['ks', 'ξ'], ['xi', 'ξ'],
  ['mp', 'μπ'], ['nt', 'ντ'], ['gk', 'γκ'], ['nk', 'γκ'],
  ['ts', 'τσ'], ['tz', 'τζ'],
  ['au', 'αυ'], ['eu', 'ευ'],
  ['ai', 'αι'], ['ei', 'ει'], ['oi', 'οι'],
  ['yi', 'γι'],
];

const CHARS: Record<string, string> = {
  a: 'α', b: 'β', c: 'κ', d: 'δ', e: 'ε', f: 'φ', g: 'γ', h: 'χ',
  i: 'ι', j: 'τζ', k: 'κ', l: 'λ', m: 'μ', n: 'ν', o: 'ο', p: 'π',
  q: 'κ', r: 'ρ', s: 'σ', t: 'τ', u: 'υ', v: 'β', w: 'ω', x: 'ξ',
  y: 'υ', z: 'ζ',
};

function rulesBased(input: string): string {
  const lower = input.toLowerCase();
  let result = '';
  let i = 0;
  while (i < lower.length) {
    // Try digraphs first
    let matched = false;
    for (const [src, dst] of DIGRAPHS) {
      if (lower.startsWith(src, i)) {
        result += dst;
        i += src.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += CHARS[lower[i]] ?? lower[i];
      i++;
    }
  }
  // Greek final sigma: σ at end of a word → ς
  result = result.replace(/σ(\s|$)/g, 'ς$1');
  if (result.endsWith('σ')) result = result.slice(0, -1) + 'ς';
  // Capitalise first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Convert a Greeklish name to Greek. Dictionary is tried first (exact accents),
 *  falling back to rule-based transliteration (no accents but correct letters). */
export function greeklishToGreek(name: string): string {
  if (!name.trim()) return '';
  const key = name.trim().toLowerCase();
  if (FIRST_NAME_DICT[key]) return FIRST_NAME_DICT[key];
  return rulesBased(name.trim());
}
