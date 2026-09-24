/* Note spelling for the lesson pages.
   Roots are named the way their key signature names them. Every other note
   is spelled by letter from its root, so the letter always matches the
   degree: the 3rd of A is C♯ (a C), never D♭; the ♭7 of G♭ would be F♭. */
(function () {
  var LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  var LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
  var ACC = { '-2': '𝄫', '-1': '♭', '0': '', '1': '♯', '2': '𝄪' };
  var ACC_SR = { '-2': ' double flat', '-1': ' flat', '0': '', '1': ' sharp', '2': ' double sharp' };
  var MAJOR = [0, 2, 4, 5, 7, 9, 11]; // semitones above the root for degrees 1–7

  // One name per pitch class, as the key signatures have it
  var KEYS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

  function mod(n, m) { return ((n % m) + m) % m; }

  function parse(name) {
    var chars = Array.from(String(name).trim());
    var letter = LETTERS.indexOf((chars[0] || '').toUpperCase());
    if (letter < 0) throw new Error('Not a note name: ' + name);
    var acc = 0;
    for (var i = 1; i < chars.length; i++) {
      var c = chars[i];
      if (c === '♭' || c === 'b') acc -= 1;
      else if (c === '♯' || c === '#') acc += 1;
      else if (c === '𝄫') acc -= 2;
      else if (c === '𝄪') acc += 2;
      else break;
    }
    return { letter: letter, acc: acc };
  }

  function name(letter, acc) { return LETTERS[letter] + ACC[acc]; }

  function pc(n) { var p = parse(n); return mod(LETTER_PC[p.letter] + p.acc, 12); }

  // The note `semis` half steps and `steps` letters above `root`
  function spell(root, semis, steps) {
    var p = parse(root);
    var letter = mod(p.letter + steps, 7);
    var target = mod(LETTER_PC[p.letter] + p.acc + semis, 12);
    var acc = mod(target - LETTER_PC[letter] + 6, 12) - 6;
    if (acc < -2 || acc > 2) throw new Error('Cannot spell ' + semis + ' semitones as ' + steps + ' steps from ' + root);
    return name(letter, acc);
  }

  // Degree labels as the pages write them: '1', '3', '♭3', '♭7', '𝄫7', '♭9', '♯11', '13', 'R'
  function parseDegree(label) {
    var s = String(label).trim();
    if (/^(r|root)$/i.test(s)) return { num: 1, acc: 0 };
    var acc = 0;
    s = s.replace(/^(𝄫|𝄪|[♭♯#b]+)/, function (m) {
      if (m === '𝄫') acc = -2;
      else if (m === '𝄪') acc = 2;
      else for (var i = 0; i < m.length; i++) acc += (m.charAt(i) === '♯' || m.charAt(i) === '#') ? 1 : -1;
      return '';
    });
    var num = parseInt(s, 10);
    if (!num) throw new Error('Not a degree: ' + label);
    return { num: num, acc: acc };
  }

  function degreeSemis(label) {
    var d = parseDegree(label);
    var n = d.num - 1;
    return MAJOR[n % 7] + 12 * Math.floor(n / 7) + d.acc;
  }

  function degree(root, label) {
    var d = parseDegree(label);
    return spell(root, degreeSemis(label), d.num - 1);
  }

  // Middle-C octave pitch for a root, as the pages' audio expects
  function freq(n) { return 261.63 * Math.pow(2, pc(n) / 12); }

  function sr(n) { var p = parse(n); return LETTERS[p.letter] + ACC_SR[p.acc]; }

  window.JINotes = {
    KEYS: KEYS,
    FOURTHS: [0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7].map(function (i) { return KEYS[i]; }),
    keyName: function (p) { return KEYS[mod(p, 12)]; },
    pc: pc,
    spell: spell,
    degree: degree,
    degreeSemis: degreeSemis,
    freq: freq,
    sr: sr
  };
})();
