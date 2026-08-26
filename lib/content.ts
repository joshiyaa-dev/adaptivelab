import type { Course, Question } from './types';

const Q = (
  id: string, skill: string, d: 1 | 2 | 3 | 4 | 5,
  q: string, options: [string, string, string, string], correct: 0 | 1 | 2 | 3, explain: string, hint?: string,
): Question => ({ id, skill, d, q, options, correct, explain, hint });

const QUESTION_LIST: Question[] = [
  // ---- Web Basics (10) ----
  Q('W1', 'HTML', 1, 'Which tag shows the largest default heading?', ['<h6>', '<h1>', '<head>', '<big>'], 1, '<h1> is the top-level heading.', 'Think about heading hierarchy — 1 through 6.'),
  Q('W2', 'HTML', 2, 'Attribute for unique element identification?', ['class', 'id', 'name', 'key'], 1, 'id must be unique per page.', 'Think "identity" — what makes something uniquely identifiable?'),
  Q('W3', 'CSS', 1, 'CSS rule to color text red?', ['text-color: red;', 'color: red;', 'font-color: red;', 'paint: red;'], 1, 'The property is simply `color`.', 'Try the simplest CSS property name you can think of.'),
  Q('W4', 'CSS', 3, 'Which makes a flex container wrap items?', ['flex-flow: nowrap;', 'flex-wrap: wrap;', 'wrap: true;', 'display: grid;'], 1, 'flex-wrap allows multi-line layouts.', 'The property name contains "wrap" — find it.'),
  Q('W5', 'HTTP', 2, 'Status code for successful POST creation?', ['200', '201', '204', '302'], 1, '201 Created is returned when a resource is created.', 'HTTP has a specific "Created" code.'),
  Q('W6', 'HTTP', 3, 'Which header controls browser caching duration?', ['ETag', 'Cache-Control', 'Cookie', 'Referer'], 1, 'Cache-Control: max-age=… governs freshness.', 'The header name literally says "cache".'),
  Q('W7', 'Accessibility', 3, 'Best way to label an icon-only button?', ['title attribute', 'aria-label', 'placeholder', 'alt on div'], 1, 'aria-label gives an accessible name.', 'ARIA attributes are specifically for accessibility.'),
  Q('W8', 'Web Security', 4, 'Escaping user input primarily prevents…', ['SQL injection & XSS', 'slow loads', 'CORS errors', 'memory leaks'], 0, 'Output encoding neutralizes injected markup/queries.', 'Think about what happens when untrusted HTML reaches the browser.'),
  Q('W9', 'HTML', 2, 'Semantic element for standalone blog post?', ['<section>', '<article>', '<aside>', '<div>'], 1, '<article> = independently distributable content.', 'An element for content that could stand alone.'),
  Q('W10', 'CSS', 4, 'Specificity order (low→high)?', ['element < class < id < inline', 'id < class < element < inline', 'inline < id < class < element', 'class < element < inline < id'], 0, 'Inline styles beat ids beat classes beat elements.', 'The most specific selector wins — what is the most specific?'),

  // ---- JavaScript (10) ----
  Q('J1', 'JS Basics', 1, 'Declare a block-scoped constant?', ['var x', 'let x', 'const x', 'static x'], 2, 'const = block scope + no reassignment.'),
  Q('J2', 'JS Basics', 2, '[1,2,3].map(x=>x*2) returns…', ['[2,4,6]', '6', '[1,2,3,2,4,6]', 'undefined'], 0, 'map transforms each element into a new array.'),
  Q('J3', 'Functions', 2, 'Arrow functions differ from regular because they…', ['cannot take args', 'have no own this', 'are faster always', 'return objects'], 1, 'They inherit this lexically.'),
  Q('J4', 'Async', 3, 'What does await pause?', ['the whole page', 'only its async function', 'all JS timers', 'network stack'], 1, 'Other code keeps running; only that function yields.'),
  Q('J5', 'JS Basics', 3, 'Deep-freezing an object requires…', ['Object.freeze recursively', 'one freeze call', 'const only', 'sealing prototypes'], 0, 'freeze is shallow — nested objects need recursive handling.'),
  Q('J6', 'DOM', 2, 'addEventListener("click", fn) vs onclick= advantage?', ['multiple listeners allowed', 'faster', 'works offline', 'auto-removes'], 0, 'Property syntax overwrites; listeners accumulate.'),
  Q('J7', 'Modules', 3, 'ES module exports are…', ['live bindings', 'copied values', 'globals', 'frozen constants'], 0, 'Importers see updates when the exporter changes them.'),
  Q('J8', 'Errors', 2, 'finally block runs…', ['always', 'only on error', 'only on success', 'never in async'], 0, 'Cleanup runs regardless of outcome.'),
  Q('J9', 'Async', 4, 'Promise.all vs allSettled difference?', ['all rejects fast on first failure', 'identical', 'allSettled rejects first', 'all waits all'], 0, 'all short-circuits on rejection; allSettled never does.'),
  Q('J10', 'JS Basics', 4, 'Event loop: microtasks run…', ['after current task, before render', 'next frame', 'in workers', 'randomly'], 0, 'Promise callbacks flush before the next macrotask/render.'),

  // ---- Python (10) ----
  Q('P1', 'Python Basics', 1, 'Comment syntax in Python?', ['// comment', '# comment', '<!-- -->', '/* */'], 1, 'Hash starts a line comment.'),
  Q('P2', 'Data Structures', 2, 'Fast membership testing structure?', ['list', 'set', 'tuple', 'str'], 1, 'Sets hash members → O(1) average lookup.'),
  Q('P3', 'Functions', 3, 'Decorator @staticmethod means…', ['no self/cls passed', 'private method', 'abstract', 'cached'], 0, 'It behaves like a plain function inside the class namespace.'),
  Q('P4', 'OOP', 3, 'Method resolution order defines…', ['attribute lookup path', 'import order', 'GC timing', 'thread priority'], 0, 'MRO linearizes base classes (C3 algorithm).'),
  Q('P5', 'Python Basics', 2, 'Type of (1,) is…', ['tuple', 'int with parens', 'syntax error', 'list'], 0, 'Trailing comma makes a single-element tuple.'),
  Q('P6', 'Iterators', 3, 'Generator benefit vs list?', ['lazy evaluation saves memory', 'always faster CPU', 'parallel execution', 'typed elements'], 0, 'Values are produced on demand.'),
  Q('P7', 'Errors', 2, 'Catch multiple exception types with…', ['except (A, B):', 'except A or B:', 'except A, B:', 'catch A|B:'], 0, 'Tuple form catches either.'),
  Q('P8', 'Stdlib', 3, 'collections.Counter purpose?', ['count hashable items', 'measure time', 'limit recursion', 'type hints'], 0, 'Multiset with most_common() helpers.'),
  Q('P9', 'Async', 4, 'asyncio.gather vs wait: gather…', ['returns results in order', 'cancels siblings', 'is sequential', 'blocks thread'], 0, 'gather preserves argument order of awaited coroutines.'),
  Q('P10', 'Python Basics', 4, 'Small int caching means…', ['identity holds for -5..256', 'ints are strings', 'no effect', 'floats cached too'], 0, 'CPython interns small ints — is-comparison quirk.'),

  // ---- Data Science (10) ----
  Q('D1', 'Statistics', 2, 'Mean is sensitive to…', ['outliers', 'sample size', 'units', 'sorting'], 0, 'A single extreme value drags it hard.'),
  Q('D2', 'Statistics', 3, 'Central Limit Theorem says sample means approach…', ['normal distribution', 'uniform', 'exponential', 'bimodal'], 0, 'Given enough n and finite variance.'),
  Q('D3', 'Pandas', 2, 'df.loc selects by…', ['label', 'integer position only', 'column dtype', 'mask only'], 0, '.loc = labels; .iloc = positions.'),
  Q('D4', 'ML Concepts', 3, 'Overfitting signature?', ['train high, test low', 'both low', 'both high', 'test > train'], 0, 'Memorized noise fails to generalize.'),
  Q('D5', 'ML Concepts', 4, 'Regularization L1 encourages…', ['sparsity', 'larger weights', 'slower training', 'more features'], 0, 'Absolute penalty zeroes coefficients.'),
  Q('D6', 'Visualization', 1, 'Chart type for distribution shape?', ['histogram', 'pie chart', 'line only', 'table'], 0, 'Histograms bin values to reveal shape.'),
  Q('D7', 'Statistics', 4, 'p-value 0.03 at α=0.05 means…', ['reject H0', 'accept H0 as true', 'prove H1', 'effect is large'], 0, 'Result is statistically significant at that threshold.'),
  Q('D8', 'Pandas', 3, 'groupby().agg() produces…', ['per-group aggregates', 'row-wise ops', 'joins', 'sorts only'], 0, 'Split-apply-combine in one call.'),
  Q('D9', 'ML Concepts', 2, 'Train/test split guards against…', ['leakage of evaluation', 'overfitting data itself', 'missing values', 'imbalanced classes'], 0, 'Held-out data estimates generalization honestly.'),
  Q('D10', 'Statistics', 5, 'Simpson\'s paradox occurs when…', ['aggregates reverse subgroup trends', 'variance is zero', 'n is too large', 'data is numeric'], 0, 'Confounding grouping variable flips the story.'),
];

export const COURSES: Course[] = [
  {
    id: 'web',
    title: 'Web Foundations',
    blurb: 'HTML, CSS, HTTP and security essentials for the modern web.',
    skills: ['HTML', 'CSS', 'HTTP', 'Accessibility', 'Web Security'],
    questionIds: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
  },
  {
    id: 'js',
    title: 'JavaScript Deep Dive',
    blurb: 'From basics to the event loop — build real mental models.',
    skills: ['JS Basics', 'Functions', 'Async', 'DOM', 'Modules', 'Errors'],
    questionIds: ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J9', 'J10'],
  },
  {
    id: 'py',
    title: 'Python for Programmers',
    blurb: 'Idioms, OOP internals and asyncio — beyond tutorials.',
    skills: ['Python Basics', 'Data Structures', 'Functions', 'OOP', 'Iterators', 'Errors', 'Stdlib', 'Async'],
    questionIds: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'],
  },
  {
    id: 'ds',
    title: 'Data Science Essentials',
    blurb: 'Statistics intuition, pandas workflow and ML fundamentals.',
    skills: ['Statistics', 'Pandas', 'ML Concepts', 'Visualization'],
    questionIds: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'],
  },
];


export const QUESTIONS: Record<string, Question> = Object.fromEntries(
  QUESTION_LIST.map((q) => [q.id, q]),
);



// ---- hints for JS (84) ----
// These are appended to the existing questions by patching their hint fields at load time
const HINTS: Record<string, string> = {
  J1: 'Which keyword prevents reassignment?',
  J2: 'What does .map() return — the same array or a new one?',
  J3: 'Arrow functions capture something special from their surrounding scope.',
  J4: 'Other code keeps running while an async function yields.',
  J5: 'freeze() only works one level deep.',
  J6: 'Can you attach multiple handlers with the property syntax?',
  J7: 'Are imports copies or references to the original?',
  J8: 'Which block runs regardless of try/catch outcome?',
  J9: 'all rejects immediately; allSettled is more tolerant.',
  J10: 'Microtasks flush before the next macrotask or render.',
  P1: 'Think hash symbol.',
  P2: 'Which structure uses hashing for O(1) membership?',
  P3: 'No self or cls is passed — just a plain function.',
  P4: 'Python uses an algorithm to linearize base classes.',
  P5: 'A trailing comma does something important here.',
  P6: 'Values are produced on demand — lazy evaluation.',
  P7: 'Use a tuple to catch multiple exception types.',
  P8: 'It counts hashable items and has a most_common() method.',
  P9: 'gather preserves the order of results.',
  P10: 'CPython caches small integers between -5 and 256.',
  D1: 'An extreme outlier drags the mean.',
  D2: 'For large n, the sampling distribution of means becomes bell-shaped.',
  D3: 'Use .loc for labels, .iloc for positions.',
  D4: 'Training accuracy is great but test accuracy is poor.',
  D5: 'L1 penalty drives some weights to exactly zero.',
  D6: 'Bins reveal the shape of a distribution.',
  D7: 'When p < alpha, we reject the null hypothesis.',
  D8: 'Split-apply-combine: group, aggregate, merge back.',
  D9: 'Held-out data gives an honest generalization estimate.',
  D10: 'A lurking variable flips the aggregated trend.',
};

// patch hints into existing questions at module level
for (const [id, hint] of Object.entries(HINTS)) {
  const q = QUESTION_LIST.find((x) => x.id === id);
  if (q) q.hint = hint;
}

