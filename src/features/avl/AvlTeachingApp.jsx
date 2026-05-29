import { useMemo, useState } from "react";
import TreeCanvas from "./TreeCanvas";
import {
  DEFAULT_CODE,
  DELETION_OPERATION_STEPS,
  HIGHLIGHT_LEGEND,
  PPT_EXAMPLES,
  PPT_HIGHLIGHT_LEGEND,
  SOURCE_CODE_DETAILS,
  buildAVLRotationLab,
  buildTree,
  getHeight,
  lessonPoints,
  runTreeCode,
} from "./avlLogic";

export default function AvlTeachingApp() {
  const [mode, setMode] = useState("avl");
  const [bulkInput, setBulkInput] = useState("30,20,10,25,40,50");
  const [currentValues, setCurrentValues] = useState([30, 20, 10, 25, 40, 50]);
  const [singleInput, setSingleInput] = useState("");
  const [deleteInput, setDeleteInput] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [rotationCase, setRotationCase] = useState("LL");
  const [rotationStep, setRotationStep] = useState(0);
  const [pptExample, setPptExample] = useState("insert12");
  const [pptStep, setPptStep] = useState(0);
  const [deleteStep, setDeleteStep] = useState(0);
  const [codeInput, setCodeInput] = useState(DEFAULT_CODE);
  const [sourceDetail, setSourceDetail] = useState("create");

  const parsedBulk = useMemo(
    () =>
      bulkInput
        .split(",")
        .map((n) => Number.parseInt(n.trim(), 10))
        .filter((n) => !Number.isNaN(n)),
    [bulkInput],
  );

  const uniqueValues = (values) => {
    const seen = new Set();
    return values.filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  };

  const { root, logs } = useMemo(() => buildTree(currentValues, mode), [currentValues, mode]);
  const codeResult = useMemo(() => runTreeCode(codeInput), [codeInput]);

  const rotationScenario = useMemo(() => buildAVLRotationLab(rotationCase), [rotationCase]);
  const rotationSteps = rotationScenario.steps;
  const stepCount = rotationSteps.length;
  const safeRotationStep = Math.min(Math.max(0, rotationStep), Math.max(0, stepCount - 1));
  const rotationStepData = rotationSteps[safeRotationStep] ?? rotationSteps[0];

  const pptScenario = PPT_EXAMPLES[pptExample];
  const pptSteps = pptScenario.steps;
  const pptStepCount = pptSteps.length;
  const safePptStep = Math.min(Math.max(0, pptStep), Math.max(0, pptStepCount - 1));
  const pptStepData = pptSteps[safePptStep] ?? pptSteps[0];
  const deleteStepCount = DELETION_OPERATION_STEPS.length;
  const safeDeleteStep = Math.min(Math.max(0, deleteStep), Math.max(0, deleteStepCount - 1));
  const deleteStepData = DELETION_OPERATION_STEPS[safeDeleteStep] ?? DELETION_OPERATION_STEPS[0];
  const sourceDetailData = SOURCE_CODE_DETAILS[sourceDetail];

  function applyBulkValues() {
    setCurrentValues(uniqueValues(parsedBulk));
    setSelectedNode(null);
  }

  function addSingleValue() {
    const next = Number.parseInt(singleInput.trim(), 10);
    if (Number.isNaN(next)) return;
    setCurrentValues((prev) => uniqueValues([...prev, next]));
    setSingleInput("");
  }

  function deleteSingleValue() {
    const target = Number.parseInt(deleteInput.trim(), 10);
    if (Number.isNaN(target)) return;
    setCurrentValues((prev) => prev.filter((value) => value !== target));
    setDeleteInput("");
    if (selectedNode?.value === target) {
      setSelectedNode(null);
    }
  }

  function deleteSelectedNode() {
    if (!selectedNode) return;
    const target = selectedNode.value;
    setCurrentValues((prev) => prev.filter((value) => value !== target));
    setSelectedNode(null);
  }

  function resetBuilder() {
    setCurrentValues([]);
    setSelectedNode(null);
  }

  function setRotationCaseSafe(nextCase) {
    setRotationCase(nextCase);
    setRotationStep(0);
  }

  function setPptExampleSafe(nextExample) {
    setPptExample(nextExample);
    setPptStep(0);
  }

  function loadSoftwareExercise() {
    setCodeInput(`#include <stdio.h>
#include <stdlib.h>

struct Node {
  char key;
  struct Node *left;
  struct Node *right;
  int height;
};

int height(struct Node *node) {
  if (node == NULL)
    return 0;

  return node->height;
}

int getBalance(struct Node *node) {
  if (node == NULL)
    return 0;

  return height(node->left) - height(node->right);
}

struct Node *insertNode(struct Node *node, char key) {
  if (node == NULL)
    return newNode(key);

  if (key < node->key)
    node->left = insertNode(node->left, key);
  else if (key > node->key)
    node->right = insertNode(node->right, key);
  else
    return node;

  int balance = getBalance(node);

  if (balance > 1 && key < node->left->key)
    return rightRotate(node);

  if (balance < -1 && key > node->right->key)
    return leftRotate(node);

  return node;
}

int main() {
  struct Node *root = NULL;

  root = insertNode(root, 'S');
  root = insertNode(root, 'O');
  root = insertNode(root, 'F');
  root = insertNode(root, 'T');
  root = insertNode(root, 'W');
  root = insertNode(root, 'A');
  root = insertNode(root, 'R');
  root = insertNode(root, 'E');

  root = deleteNode(root, 'W');
  root = deleteNode(root, 'O');

  return 0;
}`);
  }


  return (
    <main className="app-shell">
      <header className="hero">
        <p className="kicker">AVL Tree Interactive Teaching App</p>
        <h1>Visual AVL Playground yang Lebih Interaktif</h1>
        <p>
          Diambil dari materi slide: konsep AVL, balance factor, insertion, dan rebalancing.
          Bagian Rotation Lab mensimulasikan insert AVL sebenarnya (bukan pohon statis dari BST).
        </p>
      </header>

      <section className="card lesson-card">
        <h2>Inti Materi AVL</h2>
        <div className="lesson-grid">
          {lessonPoints.map((point) => (
            <div key={point} className="lesson-item">
              {point}
            </div>
          ))}
        </div>
      </section>

      <section className="card builder-card">
        <div className="section-head">
          <div>
            <h2>Interactive Builder</h2>
            <p>Bangun tree pakai mode BST atau AVL, klik node untuk lihat BF dan height.</p>
          </div>
          <div className="mode-switch">
            <button
              type="button"
              className={mode === "bst" ? "active" : ""}
              onClick={() => setMode("bst")}
            >
              BST
            </button>
            <button
              type="button"
              className={mode === "avl" ? "active" : ""}
              onClick={() => setMode("avl")}
            >
              AVL
            </button>
          </div>
        </div>

        <div className="builder-grid">
          <aside className="panel">
            <h3>Input Data</h3>
            <label className="label">Batch insert (pisahkan dengan koma)</label>
            <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} />
            <button type="button" onClick={applyBulkValues} className="btn primary">
              Terapkan Batch
            </button>

            <label className="label">Tambah 1 angka</label>
            <div className="inline-input">
              <input
                value={singleInput}
                onChange={(e) => setSingleInput(e.target.value)}
                placeholder="contoh: 26"
              />
              <button type="button" onClick={addSingleValue} className="btn">
                Insert
              </button>
            </div>

            <label className="label">Hapus 1 angka</label>
            <div className="inline-input">
              <input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="contoh: 25"
              />
              <button type="button" onClick={deleteSingleValue} className="btn danger">
                Hapus
              </button>
            </div>
            <button type="button" onClick={resetBuilder} className="btn ghost">
              Reset Tree
            </button>

            <div className="stats-grid">
              <div className="stat">
                <span>Total Node</span>
                <strong>{currentValues.length}</strong>
              </div>
              <div className="stat">
                <span>Tinggi Tree</span>
                <strong>{getHeight(root)}</strong>
              </div>
            </div>
          </aside>

          <div className="canvas-panel">
            <TreeCanvas root={root} selected={selectedNode} onSelect={setSelectedNode} mode={mode} />
          </div>

          <aside className="panel dark">
            <h3>Node Inspector</h3>
            {selectedNode ? (
              <div className="inspector-list">
                <p>
                  Value: <strong>{selectedNode.value}</strong>
                </p>
                <p>
                  Height: <strong>{selectedNode.height}</strong>
                </p>
                <p>
                  BF: <strong>{selectedNode.bf}</strong>
                </p>
                <p>
                  Status:{" "}
                  <strong>
                    {mode === "avl"
                      ? Math.abs(selectedNode.bf) <= 1
                        ? "Balanced"
                        : "Unbalanced"
                      : "BST Mode (tidak auto-balance)"}
                  </strong>
                </p>
                <button type="button" className="btn danger" onClick={deleteSelectedNode}>
                  Hapus Node Ini
                </button>
              </div>
            ) : (
              <p className="muted">Klik node pada canvas untuk melihat detail.</p>
            )}
            <h3>Rotation Log</h3>
            {mode === "bst" ? (
              <p className="muted">BST tidak melakukan rotasi otomatis.</p>
            ) : logs.length ? (
              <ul className="log-list">
                {logs.slice(-6).map((log) => (
                  <li key={log}>{log}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">Belum ada rotasi pada input saat ini.</p>
            )}
          </aside>
        </div>
      </section>

      <section className="card rotation-card rotation-lab-section">
        <div className="section-head">
          <div>
            <h2>Rotation Lab — simulasi insert AVL</h2>
            <p>
              Setiap tab LL / RR / LR / RL memakai urutan penyisipan AVL: daun baru → cek BF → rotasi
              otomatis seperti di algoritma. Bukan pohon digambar manual.
            </p>
          </div>
          <div className="case-tabs case-tabs-wide">
            {["LL", "RR", "LR", "RL"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRotationCaseSafe(item)}
                className={rotationCase === item ? "active" : ""}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="rotation-meta-bar">
          <div>
            <strong>{rotationScenario.meta.title}</strong>
            <p className="muted small-margin">{rotationScenario.meta.formula}</p>
          </div>
          <p className="muted meta-hint">{rotationScenario.meta.insertHint}</p>
        </div>

        <div className="rotation-layout">
          <div className="rotation-canvas-wrap">
            <div className="rotation-canvas-header">
              <span className="step-badge">{rotationStepData.short}</span>
              <span className="rotation-step-counter">
                Langkah {safeRotationStep + 1} / {stepCount}
              </span>
            </div>
            <div className="canvas-panel rotation-canvas-panel">
              {rotationStepData.tree ? (
                <TreeCanvas
                  root={rotationStepData.tree}
                  selected={null}
                  onSelect={() => {}}
                  mode="avl"
                  highlights={rotationStepData.highlights}
                  layoutOptions={{ gapX: 64, gapY: 88, nodeR: 20 }}
                />
              ) : (
                <div className="canvas-empty rotation-intro-canvas">
                  <p>
                    <strong>Langkah awal.</strong> Pohon muncul setelah mulai penyisipan; geser ke langkah 2 atau
                    klik nomor di bawah.
                  </p>
                </div>
              )}
            </div>
            <div className="legend-row">
              {HIGHLIGHT_LEGEND.map((item) => (
                <div key={item.key} className={`legend-chip legend-${item.key}`}>
                  <span className="legend-dot" />
                  <span>
                    <strong>{item.label}</strong>
                    <span className="legend-desc">{item.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="panel rotation-side-panel">
            <h3 className="rotation-side-title">{rotationStepData.title}</h3>
            <ul className="rotation-bullet-list">
              {rotationStepData.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <label className="label">Pilih langkah</label>
            <input
              type="range"
              min={0}
              max={stepCount - 1}
              value={safeRotationStep}
              onChange={(e) => setRotationStep(Number(e.target.value))}
              className="rotation-range"
            />
            <div className="step-nav">
              <button
                type="button"
                className="btn"
                disabled={safeRotationStep <= 0}
                onClick={() =>
                  setRotationStep((s) => {
                    const c = Math.min(Math.max(0, s), Math.max(0, stepCount - 1));
                    return Math.max(0, c - 1);
                  })
                }
              >
                ← Sebelumnya
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={safeRotationStep >= stepCount - 1}
                onClick={() =>
                  setRotationStep((s) => {
                    const c = Math.min(Math.max(0, s), Math.max(0, stepCount - 1));
                    return Math.min(Math.max(0, stepCount - 1), c + 1);
                  })
                }
              >
                Berikutnya →
              </button>
            </div>

            <div className="step-timeline">
              {rotationSteps.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`timeline-dot ${i === safeRotationStep ? "active" : ""}`}
                  title={s.short}
                  onClick={() => setRotationStep(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="card ppt-example-card">
        <div className="section-head">
          <div>
            <h2>Contoh PPT Interaktif</h2>
            <p>
              Contoh panjang dari slide dijadikan walkthrough: geser langkahnya untuk melihat node yang
              disisipkan, node yang melanggar AVL, dan rotasi yang memperbaiki tree.
            </p>
          </div>
          <div className="case-tabs case-tabs-wide">
            {Object.keys(PPT_EXAMPLES).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPptExampleSafe(key)}
                className={pptExample === key ? "active" : ""}
              >
                {key === "insert12" ? "Insert 12" : key === "insert26" ? "Insert 26" : "Delete 60"}
              </button>
            ))}
          </div>
        </div>

        <div className="ppt-meta">
          <div>
            <strong>{pptScenario.title}</strong>
            <p className="muted small-margin">{pptScenario.source}</p>
          </div>
          <span className="step-badge">{pptStepData.short}</span>
        </div>

        <div className="ppt-example-layout">
          <div className="canvas-panel ppt-canvas-panel">
            <TreeCanvas
              root={pptStepData.tree}
              selected={null}
              onSelect={() => {}}
              mode="avl"
              highlights={pptStepData.highlights}
              layoutOptions={{ gapX: 74, gapY: 88, nodeR: 21, offsetX: 54 }}
            />
          </div>

          <aside className="panel ppt-step-panel">
            <div className="rotation-canvas-header">
              <span className="rotation-step-counter">
                Langkah {safePptStep + 1} / {pptStepCount}
              </span>
            </div>
            <h3 className="rotation-side-title">{pptStepData.title}</h3>
            <ul className="rotation-bullet-list">
              {pptStepData.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>

            <label className="label">Pilih langkah contoh</label>
            <input
              type="range"
              min={0}
              max={pptStepCount - 1}
              value={safePptStep}
              onChange={(e) => setPptStep(Number(e.target.value))}
              className="rotation-range"
            />
            <div className="step-nav">
              <button
                type="button"
                className="btn"
                disabled={safePptStep <= 0}
                onClick={() => setPptStep((s) => Math.max(0, s - 1))}
              >
                ← Sebelumnya
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={safePptStep >= pptStepCount - 1}
                onClick={() => setPptStep((s) => Math.min(pptStepCount - 1, s + 1))}
              >
                Berikutnya →
              </button>
            </div>
            <div className="step-timeline">
              {pptSteps.map((step, i) => (
                <button
                  key={step.short}
                  type="button"
                  className={`timeline-dot ${i === safePptStep ? "active" : ""}`}
                  title={step.title}
                  onClick={() => setPptStep(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </aside>
        </div>

        <div className="legend-row ppt-legend-row">
          {PPT_HIGHLIGHT_LEGEND.map((item) => (
            <div key={item.key} className={`legend-chip legend-${item.key}`}>
              <span className="legend-dot" />
              <span>
                <strong>{item.label}</strong>
                <span className="legend-desc">{item.desc}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="card deletion-operation-card">
        <div className="section-head">
          <div>
            <h2>Ilustrasi Operation Deletion</h2>
            <p>
              Walkthrough ini memperlihatkan deletion secara umum: hapus daun, hapus node satu anak,
              hapus node dua anak dengan successor, lalu cek ulang balance AVL.
            </p>
          </div>
          <span className="step-badge">
            Langkah {safeDeleteStep + 1} / {deleteStepCount}
          </span>
        </div>

        <div className="deletion-operation-layout">
          <div className="canvas-panel deletion-canvas-panel">
            <TreeCanvas
              root={deleteStepData.tree}
              selected={null}
              onSelect={() => {}}
              mode="avl"
              highlights={deleteStepData.highlights}
              layoutOptions={{ gapX: 76, gapY: 88, nodeR: 21, offsetX: 54 }}
            />
          </div>

          <aside className="panel deletion-step-panel">
            <div className="rotation-canvas-header">
              <span className="step-badge">{deleteStepData.short}</span>
              <span className="rotation-step-counter">
                {safeDeleteStep + 1} dari {deleteStepCount}
              </span>
            </div>
            <h3 className="rotation-side-title">{deleteStepData.title}</h3>
            <ul className="rotation-bullet-list">
              {deleteStepData.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>

            {deleteStepData.code ? (
              <pre className="source-code-block source-code-block-small deletion-code-snippet">
                <code>{deleteStepData.code}</code>
              </pre>
            ) : null}

            <label className="label">Pilih langkah deletion</label>
            <input
              type="range"
              min={0}
              max={deleteStepCount - 1}
              value={safeDeleteStep}
              onChange={(e) => setDeleteStep(Number(e.target.value))}
              className="rotation-range"
            />
            <div className="step-nav">
              <button
                type="button"
                className="btn"
                disabled={safeDeleteStep <= 0}
                onClick={() => setDeleteStep((s) => Math.max(0, s - 1))}
              >
                ← Sebelumnya
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={safeDeleteStep >= deleteStepCount - 1}
                onClick={() => setDeleteStep((s) => Math.min(deleteStepCount - 1, s + 1))}
              >
                Berikutnya →
              </button>
            </div>
            <div className="step-timeline">
              {DELETION_OPERATION_STEPS.map((step, i) => (
                <button
                  key={step.short}
                  type="button"
                  className={`timeline-dot ${i === safeDeleteStep ? "active" : ""}`}
                  title={step.title}
                  onClick={() => setDeleteStep(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="card source-detail-card">
        <div className="section-head">
          <div>
            <h2>Bedah Source Code</h2>
            <p>
              Bagian ini memecah kode seperti bahan presentasi: fokus ke insert, delete, dan cara
              menghitung level node dari root.
            </p>
          </div>
          <div className="case-tabs case-tabs-wide">
            {Object.entries(SOURCE_CODE_DETAILS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSourceDetail(key)}
                className={sourceDetail === key ? "active" : ""}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="source-detail-layout">
          <div className="panel source-code-panel">
            <div className="code-toolbar">
              <span className="step-badge">{sourceDetailData.label}</span>
              <span className="rotation-step-counter">source code C</span>
            </div>
            <div className="source-block-stack">
              {sourceDetailData.blocks.map((block) => (
                <article key={block.title} className="source-step-card">
                  <div className="source-step-text">
                    <h3>{block.title}</h3>
                    <p>{block.explain}</p>
                  </div>
                  <pre className="source-code-block source-code-block-small">
                    <code>{block.code}</code>
                  </pre>
                </article>
              ))}
            </div>
          </div>

          <aside className="panel dark source-explain-panel">
            <h3>{sourceDetailData.title}</h3>
            <p className="muted">{sourceDetailData.subtitle}</p>
            <ul className="rotation-bullet-list source-bullet-list">
              {sourceDetailData.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <details className="full-code-details">
              <summary>Lihat versi fungsi lengkap</summary>
              <pre className="source-code-block">
                <code>{sourceDetailData.code}</code>
              </pre>
            </details>
          </aside>
        </div>
      </section>

      <section className="card code-card">
        <div className="section-head">
          <div>
            <h2>Full C Code Playground</h2>
            <p>Editor ini memuat source code AVL lengkap seperti materi: struct, helper, rotasi, insert, delete, traversal, dan main.</p>
          </div>
          <div className="case-tabs case-tabs-wide">
            <button type="button" className="active">
              Full Code
            </button>
            <button type="button" onClick={() => setCodeInput(DEFAULT_CODE)}>
              Insert 12
            </button>
            <button type="button" onClick={loadSoftwareExercise}>
              SOFTWARE
            </button>
          </div>
        </div>

        <div className="code-layout">
          <aside className="panel code-panel">
            <div className="code-toolbar">
              <span className="step-badge">C Source</span>
              <span className="rotation-step-counter">{codeResult.values.length} node</span>
            </div>
            <textarea
              className="code-editor"
              spellCheck="false"
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value)}
              aria-label="AVL C code editor"
            />
          </aside>

          <div className="canvas-panel code-canvas-panel">
            <TreeCanvas
              root={codeResult.root}
              selected={null}
              onSelect={() => {}}
              mode={codeResult.mode}
              highlights={codeResult.highlights}
              layoutOptions={{ gapX: 52, gapY: 84, nodeR: 20, offsetX: 36, minWidth: 560 }}
            />
          </div>

          <aside className="panel dark code-output-panel">
            <h3>Output</h3>
            <div className="stats-grid compact-stats">
              <div className="stat">
                <span>Mode</span>
                <strong>{codeResult.mode.toUpperCase()}</strong>
              </div>
              <div className="stat">
                <span>Tinggi</span>
                <strong>{getHeight(codeResult.root)}</strong>
              </div>
            </div>

            {codeResult.errors.length ? (
              <>
                <h3>Error</h3>
                <ul className="log-list error-list">
                  {codeResult.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="muted">Kode valid. Tree sudah mengikuti pemanggilan fungsi di editor.</p>
            )}

            <h3>Trace</h3>
            {codeResult.trace.length ? (
              <ul className="log-list trace-list">
                {codeResult.trace.slice(-8).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">Belum ada pemanggilan `insertNode` atau `deleteNode`.</p>
            )}

            <h3>Rotation Log</h3>
            {codeResult.logs.length ? (
              <ul className="log-list">
                {codeResult.logs.slice(-6).map((log) => (
                  <li key={log}>{log}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">Belum ada rotasi dari kode ini.</p>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
