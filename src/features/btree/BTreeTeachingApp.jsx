import { useMemo, useState } from "react";

const LESSON_POINTS = [
  "B-Tree adalah search tree multiway: satu node bisa menyimpan lebih dari satu key.",
  "Semua leaf berada pada level yang sama, sehingga tinggi tree tetap pendek.",
  "Untuk minimum degree t, tiap node non-root punya minimal t - 1 key dan maksimal 2t - 1 key.",
  "Insert dilakukan ke leaf. Jika child penuh, child di-split dan median naik ke parent.",
  "B-Tree umum dipakai pada database dan file system karena mengurangi jumlah akses disk.",
];

const BTREE_PROPERTIES = [
  "Root boleh punya key lebih sedikit daripada node lain.",
  "Semua key dalam node selalu sorted.",
  "Child ke-i menyimpan range key di antara key i-1 dan key i.",
  "Semua leaf harus berada di level yang sama.",
  "Split dilakukan sebelum turun ke child penuh agar insert ke leaf selalu aman.",
];

const COMPLEXITIES = [
  { op: "Search", value: "O(log n)", note: "Jumlah level kecil karena node bercabang banyak." },
  { op: "Insert", value: "O(log n)", note: "Turun ke leaf, split jika node penuh." },
  { op: "Delete", value: "O(log n)", note: "Bisa borrow atau merge untuk menjaga minimum key." },
  { op: "Range scan", value: "O(log n + k)", note: "Cari awal range, lalu baca k key berikutnya." },
];

const INSERT_STEPS = [
  {
    short: "Cari Leaf",
    title: "Step 1: cari leaf tujuan untuk insert 17",
    beforeLabel: "Tree sebelum insert",
    beforeTree: nodeFromSpec({
      keys: [10],
      children: [{ keys: [5, 6, 7] }, { keys: [12, 20, 30] }],
    }),
    afterLabel: "Path yang dipilih",
    afterTree: nodeFromSpec({
      keys: [10],
      children: [{ keys: [5, 6, 7] }, { keys: [12, 20, 30] }],
    }),
    highlight: 10,
    code: `insert(17)
17 > 10
turun ke child kanan [12, 20, 30]`,
    bullets: [
      "Mulai dari root [10].",
      "Karena 17 lebih besar dari 10, arah insert ke child kanan.",
      "Child kanan adalah leaf [12, 20, 30], jadi proses turun berhenti di sana.",
    ],
  },
  {
    short: "Insert",
    title: "Step 2: sisipkan key di leaf secara sorted",
    beforeLabel: "Leaf tujuan sebelum insert",
    beforeTree: nodeFromSpec({
      keys: [10],
      children: [{ keys: [5, 6, 7] }, { keys: [12, 20, 30] }],
    }),
    afterLabel: "Leaf setelah insert",
    afterTree: nodeFromSpec({
      keys: [10],
      children: [{ keys: [5, 6, 7] }, { keys: [12, 17, 20, 30] }],
    }),
    highlight: 17,
    code: `leaf = [12, 20, 30]
insert 17 di antara 12 dan 20
leaf = [12, 17, 20, 30]`,
    bullets: [
      "Key tidak ditaruh asal di ujung, tapi disisipkan sesuai urutan.",
      "Leaf berubah dari [12, 20, 30] menjadi [12, 17, 20, 30].",
      "Untuk t = 3 batasnya 5 key, jadi belum perlu split.",
    ],
  },
  {
    short: "Split",
    title: "Step 3: kalau child tujuan penuh, split dulu",
    beforeLabel: "Child penuh sebelum turun",
    beforeTree: nodeFromSpec({
      keys: [10],
      children: [{ keys: [1, 3, 5, 6, 7] }, { keys: [12, 20] }],
    }),
    afterLabel: "Child setelah split",
    afterTree: nodeFromSpec({
      keys: [5, 10],
      children: [{ keys: [1, 3] }, { keys: [6, 7] }, { keys: [12, 20] }],
    }),
    highlight: 5,
    code: `target child = [1, 3, 5, 6, 7]
median = 5
parent [10] -> [5, 10]
child -> [1, 3] dan [6, 7]`,
    bullets: [
      "Sebelum insert 4, child kiri sudah penuh karena punya 5 key.",
      "Median 5 dinaikkan ke parent.",
      "Key kiri median menjadi node [1, 3], key kanan median menjadi node [6, 7].",
    ],
  },
  {
    short: "Root Split",
    title: "Step 4: root split membuat tinggi tree naik",
    beforeLabel: "Root penuh",
    beforeTree: nodeFromSpec({ keys: [5, 6, 10, 12, 20] }),
    afterLabel: "Root baru setelah split",
    afterTree: nodeFromSpec({
      keys: [10],
      children: [{ keys: [5, 6] }, { keys: [12, 20, 30] }],
    }),
    highlight: 10,
    code: `root = [5, 6, 10, 12, 20]
median = 10
new root = [10]
insert 30 ke child kanan [12, 20, 30]`,
    bullets: [
      "Kalau root penuh, buat root baru kosong di atas root lama.",
      "Median 10 naik menjadi root baru.",
      "Setelah itu insert 30 dilanjutkan ke child kanan, dan tinggi tree bertambah satu level.",
    ],
  },
];

const DELETE_RULES = [
  "Jika key ada di leaf dan node masih cukup key, hapus langsung.",
  "Jika child kekurangan key, pinjam dari sibling yang punya lebih banyak key.",
  "Jika sibling tidak bisa meminjamkan, merge child dengan sibling dan turunkan key parent.",
  "Jika key ada di internal node, ganti dengan predecessor atau successor lalu hapus di leaf.",
];

const APPLICATIONS = [
  "Database index seperti B-Tree/B+Tree untuk mempercepat pencarian record.",
  "File system memakai variasi B-Tree untuk metadata dan block mapping.",
  "Storage engine memilih node besar agar satu node cocok dengan ukuran page disk.",
  "Range query lebih efisien karena key tersimpan terurut dan tinggi tree rendah.",
];

const SPLIT_EXAMPLES = {
  rootSplit: {
    label: "Root Split",
    title: "Insert 30 ke root yang sudah penuh",
    degree: 3,
    steps: [
      {
        short: "Awal",
        title: "Root penuh sebelum insert",
        tree: nodeFromSpec({ keys: [5, 6, 10, 12, 20] }),
        highlight: 30,
        code: `t = 3
maxKey = 2t - 1 = 5
root = [5, 6, 10, 12, 20]
insert 30`,
        bullets: [
          "Untuk t = 3, node maksimal punya 5 key.",
          "Root sudah penuh, jadi insert tidak langsung dimasukkan ke root.",
          "Algoritma membuat root baru kosong lebih dulu.",
        ],
      },
      {
        short: "Median",
        title: "Ambil median untuk dinaikkan",
        tree: nodeFromSpec({ keys: [5, 6, 10, 12, 20] }),
        highlight: 10,
        code: `medianIndex = t - 1 = 2
median = root.keys[2] = 10`,
        bullets: [
          "Median adalah key ke-3, yaitu 10.",
          "Key di kiri median menjadi child kiri.",
          "Key di kanan median menjadi child kanan.",
        ],
      },
      {
        short: "Split",
        title: "Median naik menjadi root baru",
        tree: nodeFromSpec({
          keys: [10],
          children: [{ keys: [5, 6] }, { keys: [12, 20] }],
        }),
        highlight: 10,
        code: `newRoot = [10]
leftChild = [5, 6]
rightChild = [12, 20]`,
        bullets: [
          "Root lama pecah menjadi dua child.",
          "Tinggi B-Tree naik satu level.",
          "Sekarang root tidak penuh, jadi insert bisa dilanjutkan.",
        ],
      },
      {
        short: "Turun",
        title: "Pilih child untuk key 30",
        tree: nodeFromSpec({
          keys: [10],
          children: [{ keys: [5, 6] }, { keys: [12, 20] }],
        }),
        highlight: 30,
        code: `30 > 10
turun ke child kanan [12, 20]`,
        bullets: [
          "Karena 30 lebih besar dari 10, arah turun adalah child kanan.",
          "Child kanan belum penuh.",
          "Key baru akan dimasukkan di leaf tersebut.",
        ],
      },
      {
        short: "Selesai",
        title: "30 masuk ke leaf kanan",
        tree: nodeFromSpec({
          keys: [10],
          children: [{ keys: [5, 6] }, { keys: [12, 20, 30] }],
        }),
        highlight: 30,
        code: `rightChild = [12, 20, 30]
insert selesai`,
        bullets: [
          "Leaf tetap sorted setelah 30 dimasukkan.",
          "Jumlah key di leaf kanan masih aman.",
          "Semua leaf tetap berada pada level yang sama.",
        ],
      },
    ],
  },
  childSplit: {
    label: "Child Split",
    title: "Insert 4 saat child tujuan sudah penuh",
    degree: 3,
    steps: [
      {
        short: "Awal",
        title: "Root aman, tetapi child kiri penuh",
        tree: nodeFromSpec({
          keys: [10],
          children: [{ keys: [1, 3, 5, 6, 7] }, { keys: [12, 20] }],
        }),
        highlight: 4,
        code: `root = [10]
target child = [1, 3, 5, 6, 7]
insert 4`,
        bullets: [
          "Root tidak penuh, jadi tidak perlu root split.",
          "Karena 4 < 10, algoritma akan turun ke child kiri.",
          "Child kiri penuh, maka child harus di-split sebelum turun.",
        ],
      },
      {
        short: "Split Child",
        title: "Median child naik ke parent",
        tree: nodeFromSpec({
          keys: [5, 10],
          children: [{ keys: [1, 3] }, { keys: [6, 7] }, { keys: [12, 20] }],
        }),
        highlight: 5,
        code: `median child = 5
parent [10] menjadi [5, 10]
child pecah: [1, 3] dan [6, 7]`,
        bullets: [
          "Median 5 masuk ke root.",
          "Child penuh pecah menjadi dua node.",
          "Jumlah child parent bertambah dari 2 menjadi 3.",
        ],
      },
      {
        short: "Pilih Ulang",
        title: "Bandingkan ulang setelah parent berubah",
        tree: nodeFromSpec({
          keys: [5, 10],
          children: [{ keys: [1, 3] }, { keys: [6, 7] }, { keys: [12, 20] }],
        }),
        highlight: 4,
        code: `4 < 5
turun ke child paling kiri [1, 3]`,
        bullets: [
          "Setelah split, parent punya key baru yaitu 5.",
          "Arah turun harus dihitung ulang.",
          "Karena 4 < 5, targetnya child paling kiri.",
        ],
      },
      {
        short: "Selesai",
        title: "4 masuk ke leaf yang sudah aman",
        tree: nodeFromSpec({
          keys: [5, 10],
          children: [{ keys: [1, 3, 4] }, { keys: [6, 7] }, { keys: [12, 20] }],
        }),
        highlight: 4,
        code: `leftChild = [1, 3, 4]
insert selesai`,
        bullets: [
          "Key 4 masuk terurut di leaf kiri.",
          "Tidak ada node yang melebihi batas 5 key.",
          "B-Tree tetap valid untuk t = 3.",
        ],
      },
    ],
  },
};

const DEFAULT_CODE = `int main() {
  BTree *tree = createBTree(3);

  insert(tree, 10);
  insert(tree, 20);
  insert(tree, 5);
  insert(tree, 6);
  insert(tree, 12);
  insert(tree, 30);
  insert(tree, 7);
  insert(tree, 17);
  deleteKey(tree, 6);

  return 0;
}`;

function parseValues(raw) {
  return raw
    .split(/[,\s]+/)
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((value) => Number.isFinite(value));
}

function unique(values) {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function createNode(leaf = true) {
  return { keys: [], children: [], leaf };
}

function nodeFromSpec(spec) {
  return {
    keys: spec.keys,
    children: (spec.children ?? []).map(nodeFromSpec),
    leaf: !spec.children?.length,
  };
}

function splitChild(parent, index, degree, logs) {
  const child = parent.children[index];
  const sibling = createNode(child.leaf);
  const median = child.keys[degree - 1];

  sibling.keys = child.keys.slice(degree);
  child.keys = child.keys.slice(0, degree - 1);

  if (!child.leaf) {
    sibling.children = child.children.slice(degree);
    child.children = child.children.slice(0, degree);
  }

  parent.keys.splice(index, 0, median);
  parent.children.splice(index + 1, 0, sibling);
  parent.leaf = false;
  logs.push(`Split node, median ${median} naik ke parent.`);
}

function insertNonFull(node, value, degree, logs) {
  let index = node.keys.length - 1;

  if (node.leaf) {
    while (index >= 0 && value < node.keys[index]) index -= 1;
    node.keys.splice(index + 1, 0, value);
    logs.push(`Insert ${value} ke leaf [${node.keys.join(", ")}].`);
    return;
  }

  while (index >= 0 && value < node.keys[index]) index -= 1;
  index += 1;

  if (node.children[index].keys.length === 2 * degree - 1) {
    splitChild(node, index, degree, logs);
    if (value > node.keys[index]) index += 1;
  }

  insertNonFull(node.children[index], value, degree, logs);
}

function insertBTree(root, value, degree, logs) {
  if (!root) {
    const node = createNode(true);
    node.keys.push(value);
    logs.push(`Root dibuat dengan key ${value}.`);
    return node;
  }

  if (root.keys.includes(value)) {
    logs.push(`${value} sudah ada, duplikat dilewati.`);
    return root;
  }

  if (root.keys.length === 2 * degree - 1) {
    const nextRoot = createNode(false);
    nextRoot.children.push(root);
    splitChild(nextRoot, 0, degree, logs);
    insertNonFull(nextRoot, value, degree, logs);
    return nextRoot;
  }

  insertNonFull(root, value, degree, logs);
  return root;
}

function buildBTree(values, degree) {
  let root = null;
  const logs = [];
  unique(values).forEach((value) => {
    root = insertBTree(root, value, degree, logs);
  });
  return { root, logs };
}

function countKeys(node) {
  if (!node) return 0;
  return node.keys.length + node.children.reduce((sum, child) => sum + countKeys(child), 0);
}

function getHeight(node) {
  if (!node) return 0;
  if (node.leaf) return 1;
  return 1 + Math.max(...node.children.map(getHeight));
}

function validateBTree(root, degree) {
  const issues = [];
  const leafDepths = [];

  function walk(node, depth, isRoot, min, max) {
    if (!node) return;
    if (!isRoot && node.keys.length < degree - 1) issues.push(`Node [${node.keys.join(", ")}] kurang key.`);
    if (node.keys.length > 2 * degree - 1) issues.push(`Node [${node.keys.join(", ")}] terlalu penuh.`);
    node.keys.forEach((key, index) => {
      if (index > 0 && key <= node.keys[index - 1]) issues.push(`Key tidak terurut di [${node.keys.join(", ")}].`);
      if (min !== null && key <= min) issues.push(`${key} melewati batas minimum subtree.`);
      if (max !== null && key >= max) issues.push(`${key} melewati batas maksimum subtree.`);
    });
    if (node.leaf) {
      leafDepths.push(depth);
      return;
    }
    if (node.children.length !== node.keys.length + 1) issues.push(`Jumlah child tidak cocok di [${node.keys.join(", ")}].`);
    node.children.forEach((child, index) => {
      const childMin = index === 0 ? min : node.keys[index - 1];
      const childMax = index === node.keys.length ? max : node.keys[index];
      walk(child, depth + 1, false, childMin, childMax);
    });
  }

  walk(root, 0, true, null, null);
  if (new Set(leafDepths).size > 1) issues.push("Leaf tidak berada di level yang sama.");
  return { valid: issues.length === 0, issues: [...new Set(issues)] };
}

function layoutBTree(root) {
  if (!root) return { nodes: [], edges: [], width: 720, height: 300 };
  const nodes = [];
  const edges = [];
  let cursor = 70;
  let nextId = 0;
  const gapY = 108;

  function walk(node, depth, parentId = null) {
    const id = nextId;
    nextId += 1;
    const childXs = node.children.map((child) => walk(child, depth + 1, id));
    const width = Math.max(82, node.keys.length * 34 + 26);
    const x = childXs.length ? (childXs[0] + childXs.at(-1)) / 2 : cursor;
    if (!childXs.length) cursor += width + 42;
    nodes.push({ id, node, x, y: 62 + depth * gapY, width });
    if (parentId !== null) edges.push({ from: parentId, to: id });
    return x;
  }

  walk(root, 0);
  const maxDepth = Math.max(...nodes.map((node) => node.y));
  return { nodes, edges, width: Math.max(720, cursor + 80), height: Math.max(340, maxDepth + 100) };
}

function BTreeCanvas({ root, selected, onSelect, highlight }) {
  const layout = useMemo(() => layoutBTree(root), [root]);
  if (!root) return <div className="canvas-empty">Belum ada key. Masukkan sequence dulu.</div>;

  return (
    <div className="tree-scroll">
      <svg width="100%" height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} className="tree-svg">
        {layout.edges.map((edge) => {
          const from = layout.nodes.find((node) => node.id === edge.from);
          const to = layout.nodes.find((node) => node.id === edge.to);
          return (
            <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y + 25} x2={to.x} y2={to.y - 25} className="tree-edge btree-edge" />
          );
        })}
        {layout.nodes.map((item) => (
          <g key={item.id} className="btree-node-group" onClick={() => onSelect(item.node)}>
            <rect
              x={item.x - item.width / 2}
              y={item.y - 24}
              width={item.width}
              height={48}
              rx={8}
              className={`btree-node-box ${selected === item.node ? "active" : ""}`}
            />
            {item.node.keys.map((key, index) => {
              const keyX = item.x - item.width / 2 + 18 + index * 34;
              return (
                <g key={key}>
                  <rect x={keyX - 12} y={item.y - 16} width={28} height={32} rx={6} className={highlight === key ? "btree-key active" : "btree-key"} />
                  <text x={keyX + 2} y={item.y + 5} textAnchor="middle" className="tree-node-text">
                    {key}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

function runBTreeCode(source) {
  const values = [];
  const trace = [];
  const errors = [];

  source.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.replace(/\/\/.*$/, "").trim().replace(/;$/, "");
    const insertMatch = line.match(/insert\s*\([^,]+,\s*(-?\d+)\)$/i);
    const deleteMatch = line.match(/deleteKey\s*\([^,]+,\s*(-?\d+)\)$/i);
    if (insertMatch) {
      const value = Number(insertMatch[1]);
      if (!values.includes(value)) values.push(value);
      trace.push(`Baris ${index + 1}: insert ${value}`);
    } else if (deleteMatch) {
      const value = Number(deleteMatch[1]);
      const target = values.indexOf(value);
      if (target >= 0) values.splice(target, 1);
      trace.push(`Baris ${index + 1}: delete ${value}`);
    } else if (/^(insert|deleteKey)\b/i.test(line)) {
      errors.push(`Baris ${index + 1}: format operasi belum didukung.`);
    }
  });

  return { values, trace, errors, ...buildBTree(values, 3) };
}

export default function BTreeTeachingApp() {
  const [sequenceInput, setSequenceInput] = useState("10 20 5 6 12 30 7 17");
  const [degree, setDegree] = useState(3);
  const [singleInput, setSingleInput] = useState("");
  const [deleteInput, setDeleteInput] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [splitExampleKey, setSplitExampleKey] = useState("rootSplit");
  const [splitStep, setSplitStep] = useState(0);
  const [codeInput, setCodeInput] = useState(DEFAULT_CODE);

  const values = useMemo(() => unique(parseValues(sequenceInput)), [sequenceInput]);
  const result = useMemo(() => buildBTree(values, degree), [values, degree]);
  const validation = useMemo(() => validateBTree(result.root, degree), [result.root, degree]);
  const codeResult = useMemo(() => runBTreeCode(codeInput), [codeInput]);
  const step = INSERT_STEPS[stepIndex];
  const splitExample = SPLIT_EXAMPLES[splitExampleKey];
  const safeSplitStep = Math.min(Math.max(0, splitStep), splitExample.steps.length - 1);
  const splitStepData = splitExample.steps[safeSplitStep];

  function setValues(nextValues) {
    setSequenceInput(unique(nextValues).join(" "));
    setSelectedNode(null);
  }

  function addValue() {
    const value = Number.parseInt(singleInput.trim(), 10);
    if (!Number.isFinite(value)) return;
    setValues([...values, value]);
    setSingleInput("");
  }

  function deleteValue() {
    const value = Number.parseInt(deleteInput.trim(), 10);
    if (!Number.isFinite(value)) return;
    setValues(values.filter((item) => item !== value));
    setDeleteInput("");
  }

  const selectedPath = selectedNode?.keys?.length ? selectedNode.keys.join(", ") : null;

  return (
    <main className="app-shell btree-shell">
      <header className="hero btree-hero">
        <p className="kicker">B-Tree Interactive Teaching App</p>
        <h1>Materi B-Tree</h1>
        <p>Visualisasi node multi-key, split median, validasi degree, dan contoh operasi yang sering muncul di database indexing.</p>
      </header>

      <section className="card lesson-card btree-card">
        <div className="section-head">
          <div>
            <h2>Inti Materi B-Tree</h2>
            <p>Fokus pada aturan degree, split, dan alasan B-Tree cocok untuk penyimpanan block-based.</p>
          </div>
          <span className="step-badge btree-badge">Multiway Search Tree</span>
        </div>
        <div className="lesson-grid">
          {LESSON_POINTS.map((point) => (
            <div key={point} className="lesson-item btree-lesson-item">{point}</div>
          ))}
        </div>
      </section>

      <section className="card btree-card">
        <div className="section-head">
          <div>
            <h2>Split Process Lab</h2>
            <p>Contoh lengkap saat node penuh: median naik, node pecah, lalu insert dilanjutkan ke child yang benar.</p>
          </div>
          <div className="case-tabs case-tabs-wide">
            {Object.entries(SPLIT_EXAMPLES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={splitExampleKey === key ? "active" : ""}
                onClick={() => {
                  setSplitExampleKey(key);
                  setSplitStep(0);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ppt-meta btree-process-meta">
          <div>
            <strong>{splitExample.title}</strong>
            <p className="muted small-margin">Minimum degree t = {splitExample.degree}, maksimal key per node = {2 * splitExample.degree - 1}</p>
          </div>
          <span className="step-badge btree-badge">{splitStepData.short}</span>
        </div>

        <div className="deletion-operation-layout">
          <div className="canvas-panel btree-canvas-panel btree-process-canvas">
            <BTreeCanvas root={splitStepData.tree} selected={null} onSelect={() => {}} highlight={splitStepData.highlight} />
          </div>

          <aside className="panel deletion-step-panel">
            <div className="rotation-canvas-header">
              <span className="rotation-step-counter">
                Langkah {safeSplitStep + 1} / {splitExample.steps.length}
              </span>
            </div>
            <h3 className="rotation-side-title">{splitStepData.title}</h3>
            <ul className="rotation-bullet-list">
              {splitStepData.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <pre className="source-code-block source-code-block-small deletion-code-snippet btree-code-snippet">
              <code>{splitStepData.code}</code>
            </pre>
            <label className="label">Pilih langkah split</label>
            <input
              type="range"
              min={0}
              max={splitExample.steps.length - 1}
              value={safeSplitStep}
              onChange={(event) => setSplitStep(Number(event.target.value))}
              className="rotation-range"
            />
            <div className="step-nav">
              <button type="button" className="btn" disabled={safeSplitStep <= 0} onClick={() => setSplitStep((step) => Math.max(0, step - 1))}>
                Sebelumnya
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={safeSplitStep >= splitExample.steps.length - 1}
                onClick={() => setSplitStep((step) => Math.min(splitExample.steps.length - 1, step + 1))}
              >
                Berikutnya
              </button>
            </div>
            <div className="step-timeline">
              {splitExample.steps.map((item, index) => (
                <button
                  key={item.short}
                  type="button"
                  className={`timeline-dot ${index === safeSplitStep ? "active" : ""}`}
                  title={item.title}
                  onClick={() => setSplitStep(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="card btree-card">
        <div className="section-head">
          <div>
            <h2>Properties dan Kompleksitas</h2>
            <p>Aturan ini yang membedakan B-Tree dari BST biasa.</p>
          </div>
        </div>
        <div className="rbt-property-grid">
          {BTREE_PROPERTIES.map((item, index) => (
            <article key={item} className="rbt-property btree-property">
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

      <section className="card builder-card btree-card">
        <div className="section-head">
          <div>
            <h2>Interactive B-Tree Builder</h2>
            <p>Ubah degree dan sequence untuk melihat kapan node split dan median naik.</p>
          </div>
        </div>
        <div className="builder-grid btree-builder-grid">
          <aside className="panel">
            <h3>Input Data</h3>
            <label className="label">Minimum degree</label>
            <input type="range" min={2} max={4} value={degree} onChange={(event) => setDegree(Number(event.target.value))} className="rotation-range" />
            <p className="muted">t = {degree}, maksimal key per node = {2 * degree - 1}</p>
            <label className="label">Sequence insert</label>
            <textarea value={sequenceInput} onChange={(event) => setSequenceInput(event.target.value)} />
            <div className="rbt-presets">
              <button type="button" className="btn" onClick={() => setSequenceInput("10 20 5 6 12 30 7 17")}>Contoh 1</button>
              <button type="button" className="btn" onClick={() => setSequenceInput("1 3 7 10 11 13 14 15 18 16 19 24 25 26 21")}>Contoh Split</button>
              <button type="button" className="btn ghost" onClick={() => setValues([])}>Clear</button>
            </div>
            <label className="label">Tambah 1 angka</label>
            <div className="inline-input">
              <input value={singleInput} onChange={(event) => setSingleInput(event.target.value)} placeholder="contoh: 22" />
              <button type="button" className="btn" onClick={addValue}>Insert</button>
            </div>
            <label className="label">Hapus 1 angka</label>
            <div className="inline-input">
              <input value={deleteInput} onChange={(event) => setDeleteInput(event.target.value)} placeholder="contoh: 12" />
              <button type="button" className="btn danger" onClick={deleteValue}>Hapus</button>
            </div>
            <div className="stats-grid">
              <div className="stat"><span>Total Key</span><strong>{countKeys(result.root)}</strong></div>
              <div className="stat"><span>Tinggi</span><strong>{getHeight(result.root)}</strong></div>
            </div>
          </aside>

          <div className="canvas-panel btree-canvas-panel">
            <BTreeCanvas root={result.root} selected={selectedNode} onSelect={setSelectedNode} highlight={values.at(-1)} />
          </div>

          <aside className="panel dark">
            <h3>Node Inspector</h3>
            {selectedNode ? (
              <div className="inspector-list">
                <p>Keys: <strong>[{selectedPath}]</strong></p>
                <p>Jumlah key: <strong>{selectedNode.keys.length}</strong></p>
                <p>Status: <strong>{selectedNode.keys.length <= 2 * degree - 1 ? "Valid" : "Overflow"}</strong></p>
              </div>
            ) : (
              <p className="muted">Klik node untuk melihat isi key.</p>
            )}
            <h3>Validasi</h3>
            {validation.valid ? <p className="muted">Tree valid untuk degree {degree}.</p> : (
              <ul className="log-list error-list">{validation.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
            )}
            <h3>Split Log</h3>
            <ul className="log-list trace-list">
              {result.logs.slice(-7).map((log, index) => <li key={`${log}-${index}`}>{log}</li>)}
            </ul>
          </aside>
        </div>
      </section>

      <section className="card btree-card">
        <div className="section-head">
          <div>
            <h2>Insert Walkthrough</h2>
            <p>Contoh konkret urutan insert: cari leaf, sisipkan key, split child penuh, lalu root split.</p>
          </div>
          <div className="case-tabs case-tabs-wide">
            {INSERT_STEPS.map((item, index) => (
              <button key={item.short} type="button" className={stepIndex === index ? "active" : ""} onClick={() => setStepIndex(index)}>{item.short}</button>
            ))}
          </div>
        </div>
        <div className="insert-walkthrough-grid">
          <div className="insert-visual-stack">
            <div className="insert-mini-canvas">
              <div className="mini-canvas-label">{step.beforeLabel}</div>
              <BTreeCanvas root={step.beforeTree} selected={null} onSelect={() => {}} highlight={step.highlight} />
            </div>
            <div className="insert-mini-canvas">
              <div className="mini-canvas-label">{step.afterLabel}</div>
              <BTreeCanvas root={step.afterTree} selected={null} onSelect={() => {}} highlight={step.highlight} />
            </div>
          </div>

          <div className="panel insert-step-panel">
            <span className="step-badge btree-badge">{step.short}</span>
            <h3>{step.title}</h3>
            <pre className="source-code-block source-code-block-small btree-code-snippet insert-code-snippet">
              <code>{step.code}</code>
            </pre>
            <ol className="insert-step-list">
              {step.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ol>
            <div className="step-nav">
              <button type="button" className="btn" disabled={stepIndex <= 0} onClick={() => setStepIndex((index) => Math.max(0, index - 1))}>
                Sebelumnya
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={stepIndex >= INSERT_STEPS.length - 1}
                onClick={() => setStepIndex((index) => Math.min(INSERT_STEPS.length - 1, index + 1))}
              >
                Berikutnya
              </button>
            </div>
          </div>

          <aside className="panel dark insert-delete-panel">
            <h3>Deletion Rules</h3>
            <ul className="rotation-bullet-list">{DELETE_RULES.map((rule) => <li key={rule}>{rule}</li>)}</ul>
          </aside>
        </div>
      </section>

      <section className="card btree-card">
        <div className="section-head">
          <div>
            <h2>Real World Application</h2>
            <p>B-Tree dibuat untuk data besar yang tidak nyaman jika tiap perbandingan berarti akses node kecil satu-satu.</p>
          </div>
        </div>
        <div className="lesson-grid">
          {APPLICATIONS.map((item) => (
            <div key={item} className="lesson-item btree-lesson-item">{item}</div>
          ))}
        </div>
      </section>

      <section className="card code-card btree-code-card">
        <div className="section-head">
          <div>
            <h2>C Code Playground</h2>
            <p>Parser sederhana membaca pemanggilan `insert(tree, n)` dan `deleteKey(tree, n)`.</p>
          </div>
        </div>
        <div className="code-layout">
          <aside className="panel code-panel">
            <div className="code-toolbar"><span className="step-badge btree-badge">C Source</span><span className="rotation-step-counter">{codeResult.values.length} key</span></div>
            <textarea className="code-editor" spellCheck="false" value={codeInput} onChange={(event) => setCodeInput(event.target.value)} aria-label="B-Tree C code editor" />
          </aside>
          <div className="canvas-panel code-canvas-panel btree-canvas-panel">
            <BTreeCanvas root={codeResult.root} selected={null} onSelect={() => {}} highlight={codeResult.values.at(-1)} />
          </div>
          <aside className="panel dark code-output-panel">
            <h3>Output</h3>
            {codeResult.errors.length ? <ul className="log-list error-list">{codeResult.errors.map((error) => <li key={error}>{error}</li>)}</ul> : <p className="muted">Kode valid untuk visualizer ini.</p>}
            <h3>Trace</h3>
            <ul className="log-list trace-list">{codeResult.trace.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
