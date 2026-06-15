import { useMemo, useState } from "react";

const LESSON_POINTS = [
  "Heap adalah complete binary tree: level diisi penuh dari kiri ke kanan.",
  "Max-Heap menyimpan parent >= child, cocok untuk priority terbesar.",
  "Min-Heap menyimpan parent <= child, cocok untuk priority terkecil.",
  "Insert menaruh elemen di posisi terakhir, lalu heapify-up sampai property aman.",
  "Extract root mengganti root dengan elemen terakhir, lalu heapify-down.",
];

const HEAP_PROPERTIES = [
  "Complete binary tree: tidak boleh ada lubang sebelum index terakhir.",
  "Array index 0 adalah root.",
  "Parent dari index i adalah floor((i - 1) / 2).",
  "Child kiri index i adalah 2i + 1 dan child kanan adalah 2i + 2.",
  "Heap property hanya mengatur parent-child, bukan urutan seluruh data.",
];

const COMPLEXITIES = [
  { op: "Peek root", value: "O(1)", note: "Root selalu berada di array index 0." },
  { op: "Insert", value: "O(log n)", note: "Heapify-up mengikuti tinggi complete tree." },
  { op: "Extract root", value: "O(log n)", note: "Heapify-down dari root ke leaf." },
  { op: "Build heap", value: "O(n)", note: "Heapify dari level bawah lebih efisien daripada insert satu per satu." },
];

const HEAP_STEPS = [
  {
    short: "Insert",
    title: "Tambah di index terakhir",
    bullets: [
      "Complete tree dijaga dengan memasukkan elemen di akhir array.",
      "Parent index i adalah Math.floor((i - 1) / 2).",
      "Tidak perlu mencari posisi berdasarkan urutan nilai.",
    ],
  },
  {
    short: "Up",
    title: "Heapify-up",
    bullets: [
      "Bandingkan node baru dengan parent.",
      "Jika melanggar aturan heap, swap dengan parent.",
      "Ulangi sampai root atau property sudah valid.",
    ],
  },
  {
    short: "Extract",
    title: "Ambil root prioritas",
    bullets: [
      "Root adalah nilai prioritas tertinggi untuk max-heap atau terendah untuk min-heap.",
      "Elemen terakhir naik ke root.",
      "Ukuran heap berkurang satu.",
    ],
  },
  {
    short: "Down",
    title: "Heapify-down",
    bullets: [
      "Bandingkan root dengan child terbaik.",
      "Swap dengan child yang lebih prioritas jika perlu.",
      "Berhenti saat parent sudah lebih prioritas dari semua child.",
    ],
  },
];

const APPLICATIONS = [
  "Priority queue untuk task scheduling.",
  "Dijkstra dan Prim memakai heap agar pengambilan prioritas efisien.",
  "Heap sort membangun heap lalu extract root berulang.",
  "Top-K query dan streaming data memakai heap berukuran terbatas.",
];

const PROCESS_EXAMPLES = {
  maxInsert: {
    label: "Max Insert 45",
    title: "Insert 45 pada Max-Heap",
    mode: "max",
    steps: [
      {
        short: "Awal",
        title: "Heap valid sebelum insert",
        heap: [50, 30, 40, 10, 20, 35],
        highlightIndex: null,
        code: `heap = [50, 30, 40, 10, 20, 35]
insert 45`,
        bullets: [
          "Root 50 adalah nilai terbesar saat ini.",
          "Bentuk tree complete karena array terisi dari index 0 sampai 5.",
          "Nilai baru selalu dimasukkan ke index terakhir terlebih dulu.",
        ],
      },
      {
        short: "Append",
        title: "45 masuk ke index terakhir",
        heap: [50, 30, 40, 10, 20, 35, 45],
        highlightIndex: 6,
        code: `heap[6] = 45
parentIndex = floor((6 - 1) / 2) = 2
parent = 40`,
        bullets: [
          "Complete tree tetap aman karena 45 ditempatkan di slot kosong berikutnya.",
          "Parent 45 adalah index 2, nilainya 40.",
          "Untuk Max-Heap, 45 tidak boleh berada di bawah 40.",
        ],
      },
      {
        short: "Swap",
        title: "45 naik melewati parent 40",
        heap: [50, 30, 45, 10, 20, 35, 40],
        highlightIndex: 2,
        code: `45 > 40
swap index 6 dan 2`,
        bullets: [
          "Karena 45 lebih besar dari parent, keduanya ditukar.",
          "45 sekarang berada di index 2.",
          "Masih perlu cek parent barunya.",
        ],
      },
      {
        short: "Cek",
        title: "45 berhenti di bawah root",
        heap: [50, 30, 45, 10, 20, 35, 40],
        highlightIndex: 2,
        code: `parentIndex = floor((2 - 1) / 2) = 0
parent = 50
45 < 50`,
        bullets: [
          "Parent baru 45 adalah root 50.",
          "Karena 45 lebih kecil dari 50, heapify-up berhenti.",
          "Tidak semua insert harus naik sampai root.",
        ],
      },
      {
        short: "Valid",
        title: "Heap property kembali valid",
        heap: [50, 30, 45, 10, 20, 35, 40],
        highlightIndex: 0,
        code: `root = 50
semua parent >= child`,
        bullets: [
          "Root adalah nilai terbesar.",
          "Setiap parent lebih besar atau sama dengan child langsungnya.",
          "Ingat: array tidak sorted, yang dijaga hanya heap property.",
        ],
      },
    ],
  },
  maxDelete: {
    label: "Max Delete",
    title: "Extract root dari Max-Heap",
    mode: "max",
    steps: [
      {
        short: "Awal",
        title: "Root siap diambil",
        heap: [50, 30, 45, 10, 20, 35, 40],
        highlightIndex: 0,
        code: `removed = heap[0] = 50`,
        bullets: [
          "Pada Max-Heap, root adalah prioritas terbesar.",
          "Nilai 50 akan dikeluarkan dari heap.",
          "Slot root harus diisi kembali agar bentuk complete tetap terjaga.",
        ],
      },
      {
        short: "Move Last",
        title: "Elemen terakhir pindah ke root",
        heap: [40, 30, 45, 10, 20, 35],
        highlightIndex: 0,
        code: `last = 40
heap[0] = last
hapus index terakhir`,
        bullets: [
          "Elemen terakhir 40 dipindahkan ke root.",
          "Ukuran heap berkurang satu.",
          "Bentuk complete aman, tetapi heap property belum tentu valid.",
        ],
      },
      {
        short: "Compare",
        title: "Pilih child yang lebih besar",
        heap: [40, 30, 45, 10, 20, 35],
        highlightIndex: 2,
        code: `leftChild = 30
rightChild = 45
bestChild = 45`,
        bullets: [
          "Untuk Max-Heap, parent harus lebih besar dari dua child.",
          "Child kanan 45 lebih besar dari child kiri 30.",
          "Jika root 40 lebih kecil dari 45, swap diperlukan.",
        ],
      },
      {
        short: "Swap",
        title: "40 turun, 45 naik",
        heap: [45, 30, 40, 10, 20, 35],
        highlightIndex: 2,
        code: `40 < 45
swap index 0 dan 2`,
        bullets: [
          "45 naik menjadi root.",
          "40 turun ke index 2.",
          "Masih perlu cek child dari index 2.",
        ],
      },
      {
        short: "Valid",
        title: "Heapify-down selesai",
        heap: [45, 30, 40, 10, 20, 35],
        highlightIndex: 0,
        code: `child index 2 = 35
40 >= 35
selesai`,
        bullets: [
          "Node 40 lebih besar dari child-nya, yaitu 35.",
          "Tidak perlu swap lagi.",
          "Extract root selesai dan heap kembali valid.",
        ],
      },
    ],
  },
  minInsert: {
    label: "Min Insert 15",
    title: "Insert 15 pada Min-Heap",
    mode: "min",
    steps: [
      {
        short: "Awal",
        title: "Heap valid sebelum insert",
        heap: [10, 30, 20, 50, 40, 25],
        highlightIndex: null,
        code: `heap = [10, 30, 20, 50, 40, 25]
insert 15`,
        bullets: [
          "Root 10 adalah nilai terkecil saat ini.",
          "Bentuk tree complete karena array terisi dari index 0 sampai 5.",
          "Nilai baru tetap masuk di slot terakhir terlebih dulu.",
        ],
      },
      {
        short: "Append",
        title: "15 masuk ke index terakhir",
        heap: [10, 30, 20, 50, 40, 25, 15],
        highlightIndex: 6,
        code: `heap[6] = 15
parentIndex = floor((6 - 1) / 2) = 2
parent = 20`,
        bullets: [
          "Parent 15 adalah index 2, nilainya 20.",
          "Untuk Min-Heap, parent harus lebih kecil atau sama dengan child.",
          "Karena 15 lebih kecil dari 20, property heap rusak.",
        ],
      },
      {
        short: "Swap",
        title: "15 naik melewati parent 20",
        heap: [10, 30, 15, 50, 40, 25, 20],
        highlightIndex: 2,
        code: `15 < 20
swap index 6 dan 2`,
        bullets: [
          "Nilai yang lebih kecil punya prioritas lebih tinggi di Min-Heap.",
          "15 naik ke index 2.",
          "Setelah swap, cek parent berikutnya.",
        ],
      },
      {
        short: "Cek",
        title: "15 berhenti di bawah root",
        heap: [10, 30, 15, 50, 40, 25, 20],
        highlightIndex: 2,
        code: `parentIndex = floor((2 - 1) / 2) = 0
parent = 10
15 > 10`,
        bullets: [
          "Parent baru 15 adalah root 10.",
          "Karena 15 lebih besar dari 10, heapify-up berhenti.",
          "Root tetap nilai terkecil.",
        ],
      },
      {
        short: "Valid",
        title: "Heap property kembali valid",
        heap: [10, 30, 15, 50, 40, 25, 20],
        highlightIndex: 0,
        code: `root = 10
semua parent <= child`,
        bullets: [
          "Setiap parent lebih kecil atau sama dengan child langsungnya.",
          "Array tidak harus sorted menaik.",
          "Yang penting hanya relasi parent dan child.",
        ],
      },
    ],
  },
  minDelete: {
    label: "Min Delete",
    title: "Extract root dari Min-Heap",
    mode: "min",
    steps: [
      {
        short: "Awal",
        title: "Root siap diambil",
        heap: [10, 30, 15, 50, 40, 25, 20],
        highlightIndex: 0,
        code: `removed = heap[0] = 10`,
        bullets: [
          "Pada Min-Heap, root adalah prioritas terkecil.",
          "Nilai 10 akan dikeluarkan dari heap.",
          "Elemen terakhir nanti dipakai untuk menutup slot root.",
        ],
      },
      {
        short: "Move Last",
        title: "Elemen terakhir pindah ke root",
        heap: [20, 30, 15, 50, 40, 25],
        highlightIndex: 0,
        code: `last = 20
heap[0] = last
hapus index terakhir`,
        bullets: [
          "Elemen terakhir 20 pindah ke root.",
          "Bentuk complete tetap aman.",
          "Namun root 20 lebih besar dari child 15, jadi perlu heapify-down.",
        ],
      },
      {
        short: "Compare",
        title: "Pilih child yang lebih kecil",
        heap: [20, 30, 15, 50, 40, 25],
        highlightIndex: 2,
        code: `leftChild = 30
rightChild = 15
bestChild = 15`,
        bullets: [
          "Untuk Min-Heap, child yang lebih kecil punya prioritas lebih tinggi.",
          "Child kanan 15 lebih kecil dari child kiri 30.",
          "Karena 20 lebih besar dari 15, swap diperlukan.",
        ],
      },
      {
        short: "Swap",
        title: "20 turun, 15 naik",
        heap: [15, 30, 20, 50, 40, 25],
        highlightIndex: 2,
        code: `20 > 15
swap index 0 dan 2`,
        bullets: [
          "15 naik menjadi root baru.",
          "20 turun ke index 2.",
          "Cek child dari index 2 untuk memastikan property heap.",
        ],
      },
      {
        short: "Valid",
        title: "Heapify-down selesai",
        heap: [15, 30, 20, 50, 40, 25],
        highlightIndex: 0,
        code: `child index 2 = 25
20 <= 25
selesai`,
        bullets: [
          "Node 20 lebih kecil dari child-nya, yaitu 25.",
          "Tidak ada pelanggaran lain.",
          "Extract root selesai dan Min-Heap kembali valid.",
        ],
      },
    ],
  },
};

const DEFAULT_CODE = `int main() {
  Heap heap = createMaxHeap();

  insert(&heap, 42);
  insert(&heap, 18);
  insert(&heap, 64);
  insert(&heap, 7);
  insert(&heap, 30);
  insert(&heap, 55);
  extractRoot(&heap);
  insert(&heap, 80);

  return 0;
}`;

function parseValues(raw) {
  return raw
    .split(/[,\s]+/)
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((value) => Number.isFinite(value));
}

function compare(a, b, mode) {
  return mode === "max" ? a > b : a < b;
}

function heapifyUp(items, index, mode, logs) {
  let current = index;
  while (current > 0) {
    const parent = Math.floor((current - 1) / 2);
    if (!compare(items[current], items[parent], mode)) break;
    logs.push(`Swap ${items[current]} dengan parent ${items[parent]}.`);
    [items[current], items[parent]] = [items[parent], items[current]];
    current = parent;
  }
}

function heapifyDown(items, index, mode, logs) {
  let current = index;
  while (true) {
    const left = current * 2 + 1;
    const right = current * 2 + 2;
    let best = current;
    if (left < items.length && compare(items[left], items[best], mode)) best = left;
    if (right < items.length && compare(items[right], items[best], mode)) best = right;
    if (best === current) break;
    logs.push(`Swap ${items[current]} dengan child ${items[best]}.`);
    [items[current], items[best]] = [items[best], items[current]];
    current = best;
  }
}

function buildHeap(values, mode) {
  const heap = [];
  const logs = [];
  values.forEach((value) => {
    heap.push(value);
    logs.push(`Insert ${value} di index ${heap.length - 1}.`);
    heapifyUp(heap, heap.length - 1, mode, logs);
  });
  return { heap, logs };
}

function extractRoot(heap, mode) {
  const next = [...heap];
  const logs = [];
  if (!next.length) return { heap: next, removed: null, logs };
  const removed = next[0];
  const last = next.pop();
  if (next.length) {
    next[0] = last;
    logs.push(`${last} dipindahkan ke root setelah ${removed} diambil.`);
    heapifyDown(next, 0, mode, logs);
  }
  return { heap: next, removed, logs };
}

function validateHeap(heap, mode) {
  const issues = [];
  heap.forEach((value, index) => {
    const left = index * 2 + 1;
    const right = index * 2 + 2;
    if (left < heap.length && compare(heap[left], value, mode)) issues.push(`Index ${index} melanggar dengan child kiri ${left}.`);
    if (right < heap.length && compare(heap[right], value, mode)) issues.push(`Index ${index} melanggar dengan child kanan ${right}.`);
  });
  return { valid: issues.length === 0, issues };
}

function layoutHeap(heap) {
  if (!heap.length) return { nodes: [], edges: [], width: 720, height: 320 };
  const depth = Math.floor(Math.log2(heap.length)) + 1;
  const width = Math.max(760, 2 ** (depth - 1) * 92);
  const gapY = 92;
  const nodes = heap.map((value, index) => {
    const level = Math.floor(Math.log2(index + 1));
    const position = index - (2 ** level - 1);
    const slots = 2 ** level;
    return {
      value,
      index,
      x: ((position + 1) * width) / (slots + 1),
      y: 58 + level * gapY,
    };
  });
  const edges = nodes.slice(1).map((node) => ({ from: Math.floor((node.index - 1) / 2), to: node.index }));
  return { nodes, edges, width, height: Math.max(340, 90 + depth * gapY) };
}

function HeapCanvas({ heap, selectedIndex, onSelect, highlightIndex }) {
  const layout = useMemo(() => layoutHeap(heap), [heap]);
  if (!heap.length) return <div className="canvas-empty">Heap masih kosong.</div>;

  return (
    <div className="tree-scroll">
      <svg width="100%" height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} className="tree-svg">
        {layout.edges.map((edge) => {
          const from = layout.nodes[edge.from];
          const to = layout.nodes[edge.to];
          return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="tree-edge heap-edge" />;
        })}
        {layout.nodes.map((node) => (
          <g key={node.index} className="tree-node-group" onClick={() => onSelect(node.index)}>
            <circle cx={node.x} cy={node.y} r={24} className={`heap-node ${selectedIndex === node.index || highlightIndex === node.index ? "active" : ""}`} />
            <text x={node.x} y={node.y + 5} textAnchor="middle" className="tree-node-text">{node.value}</text>
            <text x={node.x} y={node.y + 43} textAnchor="middle" className="tree-node-meta">idx {node.index}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function runHeapCode(source) {
  let mode = /createMinHeap/i.test(source) ? "min" : "max";
  const values = [];
  const trace = [];
  const errors = [];

  source.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.replace(/\/\/.*$/, "").trim().replace(/;$/, "");
    if (/createMinHeap/i.test(line)) mode = "min";
    if (/createMaxHeap/i.test(line)) mode = "max";
    const insertMatch = line.match(/insert\s*\([^,]+,\s*(-?\d+)\)$/i);
    const extractMatch = line.match(/extractRoot\s*\(/i);
    if (insertMatch) {
      const value = Number(insertMatch[1]);
      values.push(value);
      trace.push(`Baris ${index + 1}: insert ${value}`);
    } else if (extractMatch) {
      const built = buildHeap(values, mode);
      const extracted = extractRoot(built.heap, mode);
      values.length = 0;
      values.push(...extracted.heap);
      trace.push(`Baris ${index + 1}: extract root ${extracted.removed ?? "-"}`);
    } else if (/^insert\b/i.test(line)) {
      errors.push(`Baris ${index + 1}: format insert belum didukung.`);
    }
  });

  return { mode, values, trace, errors, ...buildHeap(values, mode) };
}

export default function HeapTeachingApp() {
  const [mode, setMode] = useState("max");
  const [sequenceInput, setSequenceInput] = useState("42 18 64 7 30 55");
  const [singleInput, setSingleInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [processKey, setProcessKey] = useState("maxInsert");
  const [processStep, setProcessStep] = useState(0);
  const [codeInput, setCodeInput] = useState(DEFAULT_CODE);

  const values = useMemo(() => parseValues(sequenceInput), [sequenceInput]);
  const result = useMemo(() => buildHeap(values, mode), [values, mode]);
  const validation = useMemo(() => validateHeap(result.heap, mode), [result.heap, mode]);
  const codeResult = useMemo(() => runHeapCode(codeInput), [codeInput]);
  const step = HEAP_STEPS[stepIndex];
  const processExample = PROCESS_EXAMPLES[processKey];
  const safeProcessStep = Math.min(Math.max(0, processStep), processExample.steps.length - 1);
  const processStepData = processExample.steps[safeProcessStep];

  function addValue() {
    const value = Number.parseInt(singleInput.trim(), 10);
    if (!Number.isFinite(value)) return;
    setSequenceInput([...values, value].join(" "));
    setSingleInput("");
  }

  function extractCurrentRoot() {
    const extracted = extractRoot(result.heap, mode);
    setSequenceInput(extracted.heap.join(" "));
    setSelectedIndex(null);
  }

  function removeSelected() {
    if (selectedIndex === null) return;
    setSequenceInput(result.heap.filter((_, index) => index !== selectedIndex).join(" "));
    setSelectedIndex(null);
  }

  const selectedValue = selectedIndex === null ? null : result.heap[selectedIndex];
  const parentIndex = selectedIndex > 0 ? Math.floor((selectedIndex - 1) / 2) : null;

  return (
    <main className="app-shell heap-shell">
      <header className="hero heap-hero">
        <p className="kicker">Heap Interactive Teaching App</p>
        <h1>Materi Heap</h1>
        <p>Playground untuk Max-Heap dan Min-Heap, lengkap dengan array representation, heapify-up, heapify-down, dan extract root.</p>
      </header>

      <section className="card lesson-card heap-card">
        <div className="section-head">
          <div>
            <h2>Inti Materi Heap</h2>
            <p>Heap kuat karena bentuknya complete dan operasi prioritasnya efisien.</p>
          </div>
          <span className="step-badge heap-badge">Priority Queue</span>
        </div>
        <div className="lesson-grid">
          {LESSON_POINTS.map((point) => <div key={point} className="lesson-item heap-lesson-item">{point}</div>)}
        </div>
      </section>

      <section className="card heap-card">
        <div className="section-head">
          <div>
            <h2>Heapify Process Lab</h2>
            <p>Contoh lengkap bagaimana nilai naik saat insert dan turun saat extract root.</p>
          </div>
          <div className="case-tabs case-tabs-wide">
            {Object.entries(PROCESS_EXAMPLES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={processKey === key ? "active" : ""}
                onClick={() => {
                  setProcessKey(key);
                  setProcessStep(0);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ppt-meta heap-process-meta">
          <div>
            <strong>{processExample.title}</strong>
            <p className="muted small-margin">Mode contoh: {processExample.mode === "max" ? "Max-Heap" : "Min-Heap"}</p>
          </div>
          <span className="step-badge heap-badge">{processStepData.short}</span>
        </div>

        <div className="deletion-operation-layout">
          <div className="canvas-panel heap-canvas-panel heap-process-canvas">
            <HeapCanvas
              heap={processStepData.heap}
              selectedIndex={null}
              onSelect={() => {}}
              highlightIndex={processStepData.highlightIndex}
            />
            <div className="heap-array">
              {processStepData.heap.map((value, index) => (
                <button key={`${value}-${index}`} type="button" className={processStepData.highlightIndex === index ? "active" : ""}>
                  <span>{index}</span>
                  <strong>{value}</strong>
                </button>
              ))}
            </div>
          </div>

          <aside className="panel deletion-step-panel">
            <div className="rotation-canvas-header">
              <span className="rotation-step-counter">
                Langkah {safeProcessStep + 1} / {processExample.steps.length}
              </span>
            </div>
            <h3 className="rotation-side-title">{processStepData.title}</h3>
            <ul className="rotation-bullet-list">
              {processStepData.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <pre className="source-code-block source-code-block-small deletion-code-snippet heap-code-snippet">
              <code>{processStepData.code}</code>
            </pre>
            <label className="label">Pilih langkah heapify</label>
            <input
              type="range"
              min={0}
              max={processExample.steps.length - 1}
              value={safeProcessStep}
              onChange={(event) => setProcessStep(Number(event.target.value))}
              className="rotation-range"
            />
            <div className="step-nav">
              <button type="button" className="btn" disabled={safeProcessStep <= 0} onClick={() => setProcessStep((step) => Math.max(0, step - 1))}>
                Sebelumnya
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={safeProcessStep >= processExample.steps.length - 1}
                onClick={() => setProcessStep((step) => Math.min(processExample.steps.length - 1, step + 1))}
              >
                Berikutnya
              </button>
            </div>
            <div className="step-timeline">
              {processExample.steps.map((item, index) => (
                <button
                  key={item.short}
                  type="button"
                  className={`timeline-dot ${index === safeProcessStep ? "active" : ""}`}
                  title={item.title}
                  onClick={() => setProcessStep(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="card heap-card">
        <div className="section-head">
          <div>
            <h2>Properties dan Kompleksitas</h2>
            <p>Heap kuat untuk priority queue karena representasi array-nya sederhana dan tinggi tree rendah.</p>
          </div>
        </div>
        <div className="rbt-property-grid">
          {HEAP_PROPERTIES.map((item, index) => (
            <article key={item} className="rbt-property heap-property">
              <span>{index + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
        <div className="complexity-row">
          {COMPLEXITIES.map((item) => (
            <div key={item.op} className="complexity-chip">
              <span>{item.op}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="card builder-card heap-card">
        <div className="section-head">
          <div>
            <h2>Interactive Heap Builder</h2>
            <p>Sequence diproses sebagai insert berurutan, lalu divisualkan sebagai tree dan array.</p>
          </div>
          <div className="mode-switch">
            <button type="button" className={mode === "max" ? "active" : ""} onClick={() => setMode("max")}>Max-Heap</button>
            <button type="button" className={mode === "min" ? "active" : ""} onClick={() => setMode("min")}>Min-Heap</button>
          </div>
        </div>

        <div className="builder-grid heap-builder-grid">
          <aside className="panel">
            <h3>Input Data</h3>
            <label className="label">Sequence insert</label>
            <textarea value={sequenceInput} onChange={(event) => setSequenceInput(event.target.value)} />
            <div className="rbt-presets">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setMode("max");
                  setSequenceInput("50 30 40 10 20 35 45");
                }}
              >
                Max Insert
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setMode("max");
                  setSequenceInput("50 30 45 10 20 35 40");
                }}
              >
                Max Delete
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setMode("min");
                  setSequenceInput("10 30 20 50 40 25 15");
                }}
              >
                Min Insert
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setMode("min");
                  setSequenceInput("10 30 15 50 40 25 20");
                }}
              >
                Min Delete
              </button>
              <button type="button" className="btn ghost" onClick={() => setSequenceInput("")}>Clear</button>
            </div>
            <label className="label">Tambah 1 angka</label>
            <div className="inline-input">
              <input value={singleInput} onChange={(event) => setSingleInput(event.target.value)} placeholder="contoh: 99" />
              <button type="button" className="btn" onClick={addValue}>Insert</button>
            </div>
            <button type="button" className="btn danger heap-full-btn" onClick={extractCurrentRoot}>Extract Root</button>
            <div className="stats-grid">
              <div className="stat"><span>Root</span><strong>{result.heap[0] ?? "-"}</strong></div>
              <div className="stat"><span>Size</span><strong>{result.heap.length}</strong></div>
            </div>
          </aside>

          <div className="canvas-panel heap-canvas-panel">
            <HeapCanvas heap={result.heap} selectedIndex={selectedIndex} onSelect={setSelectedIndex} highlightIndex={result.heap.length - 1} />
            <div className="heap-array">
              {result.heap.map((value, index) => (
                <button key={`${value}-${index}`} type="button" className={selectedIndex === index ? "active" : ""} onClick={() => setSelectedIndex(index)}>
                  <span>{index}</span>
                  <strong>{value}</strong>
                </button>
              ))}
            </div>
          </div>

          <aside className="panel dark">
            <h3>Node Inspector</h3>
            {selectedIndex !== null && selectedValue !== undefined ? (
              <div className="inspector-list">
                <p>Index: <strong>{selectedIndex}</strong></p>
                <p>Value: <strong>{selectedValue}</strong></p>
                <p>Parent: <strong>{parentIndex === null ? "-" : `${parentIndex} (${result.heap[parentIndex]})`}</strong></p>
                <p>Left child: <strong>{result.heap[selectedIndex * 2 + 1] ?? "-"}</strong></p>
                <p>Right child: <strong>{result.heap[selectedIndex * 2 + 2] ?? "-"}</strong></p>
                <button type="button" className="btn danger" onClick={removeSelected}>Hapus Node Ini</button>
              </div>
            ) : <p className="muted">Klik node atau elemen array untuk melihat relasi index.</p>}
            <h3>Validasi</h3>
            {validation.valid ? <p className="muted">{mode === "max" ? "Max-Heap" : "Min-Heap"} valid.</p> : <ul className="log-list error-list">{validation.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
            <h3>Heapify Log</h3>
            <ul className="log-list trace-list">
              {result.logs.slice(-7).map((log, index) => <li key={`${log}-${index}`}>{log}</li>)}
            </ul>
          </aside>
        </div>
      </section>

      <section className="card heap-card">
        <div className="section-head">
          <div>
            <h2>Operation Walkthrough</h2>
            <p>Fase operasi heap dari insert sampai extract root.</p>
          </div>
          <div className="case-tabs case-tabs-wide">
            {HEAP_STEPS.map((item, index) => <button key={item.short} type="button" className={stepIndex === index ? "active" : ""} onClick={() => setStepIndex(index)}>{item.short}</button>)}
          </div>
        </div>
        <div className="rbt-case-layout">
          <div className="panel">
            <span className="step-badge heap-badge">{step.short}</span>
            <h3>{step.title}</h3>
            <ul className="rotation-bullet-list">{step.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
          </div>
          <aside className="panel dark">
            <h3>Aplikasi Heap</h3>
            <ul className="rotation-bullet-list">{APPLICATIONS.map((item) => <li key={item}>{item}</li>)}</ul>
          </aside>
        </div>
      </section>

      <section className="card code-card heap-code-card">
        <div className="section-head">
          <div>
            <h2>C Code Playground</h2>
            <p>Parser membaca `createMinHeap`, `createMaxHeap`, `insert(&heap, n)`, dan `extractRoot(&heap)`.</p>
          </div>
        </div>
        <div className="code-layout">
          <aside className="panel code-panel">
            <div className="code-toolbar"><span className="step-badge heap-badge">C Source</span><span className="rotation-step-counter">{codeResult.values.length} item</span></div>
            <textarea className="code-editor" spellCheck="false" value={codeInput} onChange={(event) => setCodeInput(event.target.value)} aria-label="Heap C code editor" />
          </aside>
          <div className="canvas-panel code-canvas-panel heap-canvas-panel">
            <HeapCanvas heap={codeResult.heap} selectedIndex={null} onSelect={() => {}} highlightIndex={codeResult.heap.length - 1} />
          </div>
          <aside className="panel dark code-output-panel">
            <h3>Output</h3>
            <div className="stats-grid compact-stats">
              <div className="stat"><span>Mode</span><strong>{codeResult.mode.toUpperCase()}</strong></div>
              <div className="stat"><span>Root</span><strong>{codeResult.heap[0] ?? "-"}</strong></div>
            </div>
            {codeResult.errors.length ? <ul className="log-list error-list">{codeResult.errors.map((error) => <li key={error}>{error}</li>)}</ul> : <p className="muted">Kode valid untuk visualizer ini.</p>}
            <h3>Trace</h3>
            <ul className="log-list trace-list">{codeResult.trace.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
