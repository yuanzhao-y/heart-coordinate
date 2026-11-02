const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("yuanzhao-test/index.html", "utf8");
const start = html.lastIndexOf("<script>");
const end = html.lastIndexOf("</script>");
if (start < 0 || end < 0) throw new Error("script block not found");
const source = html.slice(start + "<script>".length, end);

const stub = new Proxy(function () {}, {
  get: () => stub,
  set: () => true,
  apply: () => stub,
});

const context = {
  document: {
    querySelector: () => stub,
    createElement: () => stub,
    body: { appendChild: () => {}, removeChild: () => {} },
  },
  navigator: {},
  location: { hash: "" },
  window: { setTimeout: (fn) => fn(), addEventListener: () => {} },
  alert: () => {},
  console,
};
vm.createContext(context);

const probe = `
globalThis.__test = {
  run(input) {
    answers = input.slice();
    const s = scores();
    return { key: classify(s), p: s.p, m: s.m, spread: s.spread, pct: s.pct };
  },
  meta() {
    return {
      questions: QUESTIONS.length,
      dims: DIMS.map((d) => d.key),
      counts: DIMS.map((d) => QUESTIONS.filter((q) => q.dim === d.key).length),
      reverse: QUESTIONS.map((q, i) => (q.reverse ? i + 1 : 0)).filter(Boolean),
      options: QUESTIONS.every((q) => q.opts.length === 5),
    };
  },
};`;

vm.runInContext(source + probe, context, { timeout: 5000 });

const meta = context.__test.meta();
console.log("questions:", meta.questions);
console.log("per-dimension counts:", meta.counts.join(", "));
console.log("reverse items:", meta.reverse.join(", "));
console.log("all items have five options:", meta.options);

const fill = (value) => Array(42).fill(value);
const mixed = (first, second) => [...Array(21).fill(first), ...Array(21).fill(second)];
const cases = [
  ["all 1", fill(1)],
  ["all 5", fill(5)],
  ["first half 5, second half 1", mixed(5, 1)],
  ["first half 1, second half 5", mixed(1, 5)],
  ["all 3", fill(3)],
];
for (const [label, input] of cases) {
  const r = context.__test.run(input);
  console.log(label.padEnd(30), "->", r.key.padEnd(10), "P=" + r.p, "M=" + r.m, "spread=" + r.spread);
}

const seen = new Map();
let seed = 12345;
const rand = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
for (let i = 0; i < 20000; i++) {
  const input = Array.from({ length: 42 }, () => 1 + Math.floor(rand() * 5));
  const r = context.__test.run(input);
  seen.set(r.key, (seen.get(r.key) || 0) + 1);
}
console.log("random sweep types:", [...seen.entries()].map(([k, v]) => `${k}:${v}`).join(" "));
console.log("types covered:", seen.size, "of 9");