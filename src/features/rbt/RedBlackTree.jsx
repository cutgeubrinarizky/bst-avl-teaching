import { useMemo, useState } from "react";

const CORE_POINTS = [
  "Red-Black Tree adalah Binary Search Tree yang tiap node punya warna: merah atau hitam.",
  "Root selalu hitam, semua NIL/external node dianggap hitam, dan node merah tidak boleh punya anak merah.",
  "Setiap jalur dari sebuah node ke NIL descendant harus memiliki jumlah node hitam yang sama.",
  "RBT memakai warna node dan black-height; perbaikannya lewat recoloring dan rotation.",
  "Insert dimulai seperti BST biasa, node baru selalu merah, lalu violation diperbaiki dari parent dan uncle.",
];

const APPLICATIONS = [
  "Java Collections: TreeSet, TreeMap, dan implementasi struktur berbasis ordered map.",
  "C++ Standard Template Library: map, multimap, set, dan multiset umumnya dibangun di atas tree seimbang.",
  "Linux Completely Fair Scheduler memakai RBT untuk mengatur proses secara efisien.",
  "Virtual memory management dan operasi mmap/munmap di Linux memakai RBT untuk pemetaan memori.",
  "Database indexing dan routing table memerlukan operasi search/insert/delete dengan worst-case guarantee.",
];

const INSERT_CASES = [
  {
    name: "Parent Black",
    title: "Parent hitam: tidak ada violation",
    bullets: [
      "Node baru q dimasukkan sebagai node merah.",
      "Jika parent p berwarna hitam, aturan RBT tetap aman.",
      "Tidak perlu recolor dan tidak perlu rotation.",
    ],
  },
  {
    name: "Uncle Red",
    title: "Uncle merah: recoloring",
    bullets: [
      "Jika parent p merah dan uncle s juga merah, terjadi double red.",
      "Ubah parent dan uncle menjadi hitam.",
      "Ubah grandparent menjadi merah, lalu lanjut cek ke atas.",
    ],
  },
  {
    name: "LL / RR",
    title: "Uncle hitam dan jalur lurus: single rotation",
    bullets: [
      "Jika parent merah, uncle hitam, dan jalurnya kiri-kiri atau kanan-kanan, lakukan single rotation di grandparent.",
      "Node yang naik menjadi hitam.",
      "Ex-grandparent menjadi merah agar black-height tetap terjaga.",
    ],
  },
  {
    name: "LR / RL",
    title: "Uncle hitam dan jalur siku: double rotation",
    bullets: [
      "Jika jalur dari grandparent ke node baru berbelok, lakukan rotation pertama di parent.",
      "Setelah jalur lurus, lakukan rotation kedua di grandparent.",
      "Pivot terakhir dibuat hitam dan kedua anaknya dibuat merah.",
    ],
  },
];

const DELETE_RULES = [
  {
    title: "Node yang dihapus merah",
    desc: "Langsung hapus seperti BST. Tidak ada black-height yang hilang, jadi tidak perlu perbaikan.",
  },
  {
    title: "Node hitam dengan child merah",
    desc: "Ganti node dengan child tersebut, lalu recolor child menjadi hitam.",
  },
  {
    title: "Node hitam dengan child hitam/NIL",
    desc: "Muncul double black. Perbaikan ditentukan dari sibling dan warna keponakan sibling.",
  },
  {
    title: "Sibling merah",
    desc: "Ubah sibling menjadi hitam, parent menjadi merah, lalu rotate di parent. Setelah itu cek kasus double black lagi.",
  },
  {
    title: "Sibling hitam, dua nephew hitam",
    desc: "Recolor sibling menjadi merah dan pindahkan double black ke parent.",
  },
  {
    title: "Sibling hitam, ada nephew merah",
    desc: "Lakukan single atau double rotation, lalu recolor agar double black hilang.",
  },
];

const CODE_DETAILS = {
  node: {
    label: "Attributes",
    title: "Struktur Node RBT",
    code: `struct Node {
  int data;
  enum Color color;
  struct Node *left;
  struct Node *right;
  struct Node *parent;
};`,
    bullets: [
      "Data menyimpan key yang dibandingkan seperti BST.",
      "Color adalah bit tambahan utama: RED atau BLACK.",
      "Pointer parent memudahkan naik ke grandparent dan mencari uncle saat fix violation.",
    ],
  },
  create: {
    label: "Create Node",
    title: "Node Baru Selalu Merah",
    code: `struct Node *createNode(int data) {
  struct Node *node = malloc(sizeof(struct Node));
  node->data = data;
  node->color = RED;
  node->left = NULL;
  node->right = NULL;
  node->parent = NULL;
  return node;
}`,
    bullets: [
      "Slide updated menekankan node baru selalu inserted as red.",
      "Warna merah dipilih supaya black-height tidak langsung berubah.",
      "Jika parent hitam, insertion selesai tanpa repair.",
    ],
  },
  insert: {
    label: "BST Insert",
    title: "Masuk Dulu Seperti BST",
    code: `if (data < root->data)
  root->left = insert(root->left, data);
else if (data > root->data)
  root->right = insert(root->right, data);

fixViolation(root, nodeBaru);`,
    bullets: [
      "Posisi node ditentukan murni oleh aturan BST.",
      "RBT tidak memilih posisi berdasarkan warna.",
      "Setelah node merah terpasang, baru dicek apakah ada double red.",
    ],
  },
  rotate: {
    label: "Rotation",
    title: "Left Rotate dan Right Rotate",
    code: `leftRotate(root, x);
rightRotate(root, y);`,
    bullets: [
      "Rotation dipakai saat uncle hitam dan recoloring saja tidak cukup.",
      "Single rotation dipakai untuk LL/RR.",
      "Double rotation dipakai untuk LR/RL, mirip pola AVL.",
    ],
  },
  fix: {
    label: "Fix Insert",
    title: "Perbaikan Warna Setelah Insert",
    code: `while (node != root && node->parent->color == RED) {
  parent = node->parent;
  grandparent = parent->parent;
  uncle = sibling(parent);

  if (uncle != NULL && uncle->color == RED)
    recolor(parent, uncle, grandparent);
  else
    rotateAndRecolor(node, parent, grandparent);
}

root->color = BLACK;`,
    bullets: [
      "Masalah utama insert adalah red child di bawah red parent.",
      "Uncle merah berarti cukup recolor.",
      "Uncle hitam atau NULL berarti rotation, lalu recolor pivot.",
      "Root selalu dikunci kembali menjadi hitam.",
    ],
  },
  delete: {
    label: "Delete",
    title: "Deletion dan Double Black",
    code: `if (deletedNodeColor == RED)
  return;

if (replacementColor == RED)
  replacement->color = BLACK;
else
  fixDoubleBlack(replacement);`,
    bullets: [
      "Delete fisik tetap mengikuti BST delete.",
      "Jika target punya dua anak, cari inorder successor: node terkecil di subtree kanan.",
      "Kasus berat muncul saat node hitam diganti child hitam/NIL, karena black-height berkurang.",
    ],
  },
};

const DEFAULT_RBT_CODE = `#include <stdio.h>
#include <stdlib.h>

enum Color { RED, BLACK };

struct Node {
  int data;
  enum Color color;
  struct Node *left;
  struct Node *right;
  struct Node *parent;
};

int main() {
  struct Node *root = NULL;

  root = insertNode(root, 10);
  root = insertNode(root, 20);
  root = insertNode(root, 30);
  root = insertNode(root, 15);
  root = insertNode(root, 25);
  root = insertNode(root, 5);
  root = deleteNode(root, 20);

  return 0;
}`;

const RBT_DELETE_STEPS = [
  {
    short: "Awal",
    title: "Tree awal sebelum deletion",
    tree: treeFromRbSpec(
      rbSpec(20, "black", rbSpec(10, "black", rbSpec(5, "red"), rbSpec(15, "red")), rbSpec(30, "black", rbSpec(25, "red"), rbSpec(40, "red"))),
    ),
    highlight: 20,
    bullets: [
      "Deletion RBT tetap dimulai dengan pencarian BST.",
      "Warna node target menentukan apakah black-height berkurang.",
      "Contoh ini memakai target 20 supaya terlihat proses successor dan validasi warna.",
    ],
    code: `target = search(root, 20);`,
  },
  {
    short: "Successor",
    title: "Target dua anak diganti inorder successor",
    tree: treeFromRbSpec(
      rbSpec(25, "black", rbSpec(10, "black", rbSpec(5, "red"), rbSpec(15, "red")), rbSpec(30, "black", null, rbSpec(40, "red"))),
    ),
    highlight: 25,
    bullets: [
      "Karena node 20 punya dua anak, key diganti dengan successor dari subtree kanan.",
      "Successor adalah 25, yaitu node paling kiri di subtree kanan.",
      "Node 25 fisik kemudian dihapus dari posisi lamanya.",
    ],
    code: `successor = minValueNode(root->right);
root->data = successor->data;`,
  },
  {
    short: "Kasus merah",
    title: "Jika node fisik yang hilang merah, selesai",
    tree: treeFromRbSpec(
      rbSpec(25, "black", rbSpec(10, "black", rbSpec(5, "red"), rbSpec(15, "red")), rbSpec(30, "black", null, rbSpec(40, "red"))),
    ),
    highlight: 30,
    bullets: [
      "Pada contoh ini successor 25 berwarna merah.",
      "Menghapus node merah tidak mengurangi black-height.",
      "Tidak ada double black, jadi tidak perlu rotation atau recoloring tambahan.",
    ],
    code: `if (deletedColor == RED)
  return root;`,
  },
  {
    short: "Double black",
    title: "Kasus berat: black node hilang",
    tree: treeFromRbSpec(
      rbSpec(25, "black", rbSpec(10, "black", rbSpec(5, "red"), rbSpec(15, "red")), rbSpec(40, "black", rbSpec(30, "red"))),
    ),
    highlight: 40,
    bullets: [
      "Jika node hitam yang hilang diganti NIL/black child, muncul double black.",
      "Perbaikannya melihat sibling: merah, hitam dengan dua nephew hitam, atau hitam dengan nephew merah.",
      "Tujuannya selalu sama: black-height tiap path kembali sama.",
    ],
    code: `if (deletedColor == BLACK && replacementColor == BLACK)
  fixDoubleBlack(replacement);`,
  },
  {
    short: "Valid",
    title: "Akhir: root hitam dan tidak ada double red",
    tree: treeFromRbSpec(
      rbSpec(25, "black", rbSpec(10, "black", rbSpec(5, "red"), rbSpec(15, "red")), rbSpec(40, "black", rbSpec(30, "red"))),
    ),
    highlight: 25,
    bullets: [
      "Root tetap hitam.",
      "Tidak ada node merah yang memiliki anak merah.",
      "Black-height tiap jalur menuju NIL kembali konsisten.",
    ],
    code: `root->color = BLACK;`,
  },
];

function makeRbNode(value, color = "red") {
  return { value, color, left: null, right: null, parent: null };
}

function rbSpec(value, color = "black", left = null, right = null) {
  return { value, color, left, right };
}

function treeFromRbSpec(spec, parent = null) {
  if (!spec) return null;
  const node = makeRbNode(spec.value, spec.color);
  node.parent = parent;
  node.left = treeFromRbSpec(spec.left, node);
  node.right = treeFromRbSpec(spec.right, node);
  return node;
}

function compareValues(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function parseValue(raw) {
  const value = raw.trim();
  const quoted = value.match(/^["'](.+)["']$/);
  if (quoted) return quoted[1].toUpperCase();
  const numberValue = Number(value);
  if (value !== "" && Number.isFinite(numberValue)) return numberValue;
  if (/^[A-Za-z]$/.test(value)) return value.toUpperCase();
  return null;
}

function parseValues(raw) {
  return raw
    .split(/[,\s]+/)
    .map(parseValue)
    .filter((value) => value !== null);
}

function getColor(node) {
  return node ? node.color : "black";
}

function rotateLeft(root, x) {
  const y = x.right;
  if (!y) return root;
  x.right = y.left;
  if (y.left) y.left.parent = x;
  y.parent = x.parent;
  if (!x.parent) root = y;
  else if (x === x.parent.left) x.parent.left = y;
  else x.parent.right = y;
  y.left = x;
  x.parent = y;
  return root;
}

function rotateRight(root, y) {
  const x = y.left;
  if (!x) return root;
  y.left = x.right;
  if (x.right) x.right.parent = y;
  x.parent = y.parent;
  if (!y.parent) root = x;
  else if (y === y.parent.left) y.parent.left = x;
  else y.parent.right = x;
  x.right = y;
  y.parent = x;
  return root;
}

function cloneTree(node) {
  if (!node) return null;
  return {
    value: node.value,
    color: node.color,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

function insertRb(root, value, logs = []) {
  const z = makeRbNode(value);
  let y = null;
  let x = root;

  while (x) {
    y = x;
    const comparison = compareValues(z.value, x.value);
    if (comparison === 0) {
      logs.push(`${value} sudah ada, duplikat dilewati.`);
      return root;
    }
    x = comparison < 0 ? x.left : x.right;
  }

  z.parent = y;
  if (!y) root = z;
  else if (compareValues(z.value, y.value) < 0) y.left = z;
  else y.right = z;

  logs.push(`Insert ${value} sebagai node merah.`);
  root = fixInsert(root, z, logs);
  root.color = "black";
  root.parent = null;
  return root;
}

function fixInsert(root, z, logs) {
  while (z.parent && z.parent.color === "red") {
    const parent = z.parent;
    const grand = parent.parent;
    if (!grand) break;

    if (parent === grand.left) {
      const uncle = grand.right;
      if (getColor(uncle) === "red") {
        parent.color = "black";
        uncle.color = "black";
        grand.color = "red";
        logs.push(`Uncle ${uncle.value} merah -> recolor parent ${parent.value}, uncle ${uncle.value}, grandparent ${grand.value}.`);
        z = grand;
      } else {
        if (z === parent.right) {
          logs.push(`Pola LR di grandparent ${grand.value} -> left rotate pada parent ${parent.value}.`);
          z = parent;
          root = rotateLeft(root, z);
        }
        z.parent.color = "black";
        z.parent.parent.color = "red";
        logs.push(`Pola LL -> right rotate pada grandparent ${z.parent.parent.value}, lalu recolor.`);
        root = rotateRight(root, z.parent.parent);
      }
    } else {
      const uncle = grand.left;
      if (getColor(uncle) === "red") {
        parent.color = "black";
        uncle.color = "black";
        grand.color = "red";
        logs.push(`Uncle ${uncle.value} merah -> recolor parent ${parent.value}, uncle ${uncle.value}, grandparent ${grand.value}.`);
        z = grand;
      } else {
        if (z === parent.left) {
          logs.push(`Pola RL di grandparent ${grand.value} -> right rotate pada parent ${parent.value}.`);
          z = parent;
          root = rotateRight(root, z);
        }
        z.parent.color = "black";
        z.parent.parent.color = "red";
        logs.push(`Pola RR -> left rotate pada grandparent ${z.parent.parent.value}, lalu recolor.`);
        root = rotateLeft(root, z.parent.parent);
      }
    }
  }
  return root;
}

function buildRbt(values) {
  let root = null;
  const logs = [];
  values.forEach((value) => {
    root = insertRb(root, value, logs);
  });
  return { root, logs };
}

function countNodes(node) {
  if (!node) return 0;
  return countNodes(node.left) + countNodes(node.right) + 1;
}

function findNode(node, value) {
  if (!node) return null;
  const comparison = compareValues(value, node.value);
  if (comparison === 0) return node;
  return comparison < 0 ? findNode(node.left, value) : findNode(node.right, value);
}

function validateRbt(root) {
  const issues = [];
  if (root && root.color !== "black") issues.push("Root belum black.");

  function walk(node) {
    if (!node) return 1;
    if (node.color === "red") {
      if (getColor(node.left) === "red" || getColor(node.right) === "red") {
        issues.push(`Double red di sekitar node ${node.value}.`);
      }
    }

    const leftBh = walk(node.left);
    const rightBh = walk(node.right);
    if (leftBh !== rightBh) {
      issues.push(`Black-height tidak sama di node ${node.value}.`);
    }
    return leftBh + (node.color === "black" ? 1 : 0);
  }

  const blackHeight = walk(root);
  return {
    valid: issues.length === 0,
    blackHeight,
    issues: [...new Set(issues)],
  };
}

function parseCodeValue(raw) {
  return parseValue(raw.replace(/;$/, ""));
}

function parseCodeValues(raw) {
  return raw
    .split(",")
    .map(parseCodeValue)
    .filter((value) => value !== null);
}

function lastCodeArgument(raw) {
  const parts = raw.split(",");
  return parts.at(-1) ?? raw;
}

function stripCodeComment(line) {
  const hashIndex = line.indexOf("#");
  const slashIndex = line.indexOf("//");
  const cutPoints = [hashIndex, slashIndex].filter((index) => index >= 0);
  const cleaned = cutPoints.length ? line.slice(0, Math.min(...cutPoints)) : line;
  return cleaned.trim().replace(/;$/, "").trim();
}

function getRunnableCodeLines(source) {
  const lines = source.split(/\r?\n/);
  const mainIndex = lines.findIndex((line) => /\bint\s+main\s*\(/i.test(line));
  if (mainIndex < 0) {
    return lines.map((raw, index) => ({ raw, lineNumber: index + 1 }));
  }

  const runnable = [];
  let depth = 0;
  let enteredMain = false;

  for (let index = mainIndex; index < lines.length; index += 1) {
    const raw = lines[index];
    const opens = (raw.match(/{/g) ?? []).length;
    const closes = (raw.match(/}/g) ?? []).length;

    if (!enteredMain) {
      depth += opens - closes;
      enteredMain = opens > 0;
      continue;
    }

    if (depth <= 0) break;
    const trimmed = raw.trim();
    if (trimmed !== "}" && trimmed !== "};") {
      runnable.push({ raw, lineNumber: index + 1 });
    }
    depth += opens - closes;
  }

  return runnable;
}

function shouldSkipCodeLine(line) {
  return (
    line === "{" ||
    line === "}" ||
    /^#/.test(line) ||
    /^if\b/i.test(line) ||
    /^else\b/i.test(line) ||
    /^while\b/i.test(line) ||
    /^for\b/i.test(line) ||
    /^return\b/i.test(line) ||
    /^enum\b/i.test(line) ||
    /^struct\b/i.test(line) ||
    /^printf\s*\(/i.test(line) ||
    /^\w+->/i.test(line)
  );
}

function runRbtCode(source) {
  let values = [];
  const errors = [];
  const trace = [];

  const unique = (nextValues) => {
    const seen = new Set();
    return nextValues.filter((value) => {
      const key = `${typeof value}:${value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  getRunnableCodeLines(source).forEach(({ raw: rawLine, lineNumber }) => {
    const line = stripCodeComment(rawLine);
    if (!line || shouldSkipCodeLine(line)) return;

    const nullRootMatch = line.match(/^\w+\s*=\s*NULL$/i);
    const insertMatch = line.match(/^(?:\w+\s*=\s*)?(insert|insertNode)\s*\((.+)\)$/i);
    const insertManyMatch = line.match(/^insertMany\s*\(\s*\[(.*)\]\s*\)$/i);
    const deleteMatch = line.match(/^(?:\w+\s*=\s*)?(delete|remove|deleteNode)\s*\((.+)\)$/i);
    const clearMatch = line.match(/^clear\s*\(\s*\)$/i);

    if (insertMatch) {
      const value = parseCodeValue(lastCodeArgument(insertMatch[2]));
      if (value === null) {
        errors.push(`Baris ${lineNumber}: nilai insert tidak valid.`);
        return;
      }
      values = unique([...values, value]);
      trace.push(`Baris ${lineNumber}: insert ${value} sebagai red node`);
      return;
    }

    if (insertManyMatch) {
      const nextValues = parseCodeValues(insertManyMatch[1]);
      if (!nextValues.length) {
        errors.push(`Baris ${lineNumber}: insertMany perlu minimal satu nilai.`);
        return;
      }
      values = unique([...values, ...nextValues]);
      trace.push(`Baris ${lineNumber}: insertMany ${nextValues.join(", ")}`);
      return;
    }

    if (deleteMatch) {
      const value = parseCodeValue(lastCodeArgument(deleteMatch[2]));
      if (value === null) {
        errors.push(`Baris ${lineNumber}: nilai delete tidak valid.`);
        return;
      }
      values = values.filter((item) => item !== value);
      trace.push(`Baris ${lineNumber}: delete ${value}, lalu rebuild warna RBT dari sequence tersisa`);
      return;
    }

    if (clearMatch || nullRootMatch) {
      values = [];
      trace.push(`Baris ${lineNumber}: clear tree`);
      return;
    }

    errors.push(`Baris ${lineNumber}: baris ini belum bisa divisualkan.`);
  });

  const { root, logs } = buildRbt(values);
  return {
    values,
    root,
    logs,
    trace,
    errors,
    validation: validateRbt(root),
  };
}

function buildWalkthrough(sequenceText) {
  let root = null;
  const steps = [];
  const values = sequenceText.includes(" ") || sequenceText.includes(",")
    ? parseValues(sequenceText)
    : sequenceText.split("");

  values.forEach((value, index) => {
    const logs = [];
    root = insertRb(root, value, logs);
    const hasRepair = logs.some((log) => /recolor|rotate|pola/i.test(log));
    steps.push({
      value,
      index,
      tree: cloneTree(root),
      logs,
      title: `Insert ${values.slice(0, index + 1).join(" ")}`,
      subtitle: logs.length ? logs.at(-1) : `${value} masuk tanpa perubahan tambahan.`,
      repaired: hasRepair,
    });
  });

  return steps;
}

function getBlackHeight(node) {
  if (!node) return 1;
  return getBlackHeight(node.left) + (node.color === "black" ? 1 : 0);
}

function getDepth(node) {
  if (!node) return 0;
  return Math.max(getDepth(node.left), getDepth(node.right)) + 1;
}

function getLayout(root) {
  if (!root) return { nodes: [], edges: [], width: 620, height: 260 };
  const nodes = [];
  const edges = [];
  const gapY = 96;
  const offsetY = 68;
  const gapX = 72;
  const offsetX = 54;
  let index = 0;

  function walk(node, level, parent = null) {
    if (!node) return null;
    const left = walk(node.left, level + 1, node.value);
    const x = index * gapX + offsetX;
    index += 1;
    nodes.push({
      value: node.value,
      color: node.color,
      x,
      y: level * gapY + offsetY,
      depth: level,
      parent,
      blackHeight: getBlackHeight(node),
    });
    const right = walk(node.right, level + 1, node.value);
    if (left) edges.push({ from: node.value, to: left });
    if (right) edges.push({ from: node.value, to: right });
    return node.value;
  }

  walk(root, 0);
  const depth = getDepth(root);
  return {
    nodes,
    edges,
    width: Math.max(720, index * gapX + offsetX * 2),
    height: Math.max(340, depth * gapY + 110),
  };
}

function RbtTreeCanvas({ root, highlight, selected, onSelect = () => {} }) {
  const { nodes, edges, width, height } = useMemo(() => getLayout(root), [root]);

  if (!root) {
    return <div className="canvas-empty">Belum ada node. Masukkan sequence dulu.</div>;
  }

  return (
    <div className="tree-scroll">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="tree-svg rbt-svg"
      >
        {edges.map((edge) => {
          const from = nodes.find((node) => node.value === edge.from);
          const to = nodes.find((node) => node.value === edge.to);
          if (!from || !to) return null;
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className="tree-edge rbt-edge"
            />
          );
        })}
        {nodes.map((node) => {
          const isRed = node.color === "red";
          const isHighlighted = highlight === node.value || selected?.value === node.value;
          return (
            <g key={node.value} className="tree-node-group" onClick={() => onSelect(node)}>
              <text x={node.x} y={node.y - 38} textAnchor="middle" className="rbt-bh-label">
                BH {node.blackHeight}
              </text>
              <circle
                cx={node.x}
                cy={node.y}
                r={23}
                className={`rbt-node ${isRed ? "red" : "black"} ${isHighlighted ? "focus" : ""}`}
              />
              <text x={node.x} y={node.y + 5} textAnchor="middle" className="tree-node-text">
                {node.value}
              </text>
              <circle cx={node.x + 17} cy={node.y - 17} r={5} className={`rbt-color-dot ${isRed ? "red" : "black"}`} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ColorLegend() {
  return (
    <div className="legend-row rbt-legend">
      <div className="legend-chip rbt-legend-black">
        <span className="legend-dot" />
        <span>
          <strong>Black node</strong>
          <span className="legend-desc">Menambah black-height pada path.</span>
        </span>
      </div>
      <div className="legend-chip rbt-legend-red">
        <span className="legend-dot" />
        <span>
          <strong>Red node</strong>
          <span className="legend-desc">Tidak boleh punya parent merah.</span>
        </span>
      </div>
      <div className="legend-chip rbt-legend-nil">
        <span className="legend-dot" />
        <span>
          <strong>NIL node</strong>
          <span className="legend-desc">External leaf konseptual, selalu hitam.</span>
        </span>
      </div>
      <div className="legend-chip rbt-legend-focus">
        <span className="legend-dot" />
        <span>
          <strong>Highlight kuning</strong>
          <span className="legend-desc">Node terakhir/aktif, bukan warna RBT.</span>
        </span>
      </div>
    </div>
  );
}

function simplifyLog(log) {
  if (log.includes("Uncle")) return "Uncle merah -> recolor parent, uncle, dan grandparent.";
  if (log.includes("Pola LR")) return "Pola LR -> rotate kiri di parent, lalu lanjut repair.";
  if (log.includes("Pola RL")) return "Pola RL -> rotate kanan di parent, lalu lanjut repair.";
  if (log.includes("Pola LL")) return "Pola LL -> rotate kanan di grandparent, lalu recolor.";
  if (log.includes("Pola RR")) return "Pola RR -> rotate kiri di grandparent, lalu recolor.";
  if (log.includes("duplikat")) return log;
  return log.replace("sebagai node merah.", "masuk sebagai node merah.");
}

export default function RedBlackTree() {
  const [sequenceInput, setSequenceInput] = useState("A L G O R I T H M");
  const [singleInput, setSingleInput] = useState("");
  const [deleteInput, setDeleteInput] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [walkthroughText, setWalkthroughText] = useState("ALGORITHM");
  const [walkStep, setWalkStep] = useState(0);
  const [caseIndex, setCaseIndex] = useState(0);
  const [deleteStep, setDeleteStep] = useState(0);
  const [codeDetail, setCodeDetail] = useState("node");
  const [codeInput, setCodeInput] = useState(DEFAULT_RBT_CODE);

  const values = useMemo(() => parseValues(sequenceInput), [sequenceInput]);
  const builderResult = useMemo(() => buildRbt(values), [values]);
  const nodeCount = useMemo(() => countNodes(builderResult.root), [builderResult.root]);
  const validation = useMemo(() => validateRbt(builderResult.root), [builderResult.root]);
  const walkthrough = useMemo(() => buildWalkthrough(walkthroughText.toUpperCase()), [walkthroughText]);
  const safeWalkStep = Math.min(Math.max(0, walkStep), Math.max(0, walkthrough.length - 1));
  const currentWalk = walkthrough[safeWalkStep] ?? null;
  const selectedCase = INSERT_CASES[caseIndex];
  const safeDeleteStep = Math.min(Math.max(0, deleteStep), RBT_DELETE_STEPS.length - 1);
  const deleteStepData = RBT_DELETE_STEPS[safeDeleteStep];
  const detail = CODE_DETAILS[codeDetail];
  const codeResult = useMemo(() => runRbtCode(codeInput), [codeInput]);

  function setSequenceFromValues(nextValues) {
    setSequenceInput(nextValues.join(" "));
  }

  function addSingleValue() {
    const value = parseValue(singleInput);
    if (value === null) return;
    const exists = values.some((item) => compareValues(item, value) === 0);
    setSequenceFromValues(exists ? values : [...values, value]);
    setSingleInput("");
  }

  function deleteSingleValue() {
    const value = parseValue(deleteInput);
    if (value === null) return;
    setSequenceFromValues(values.filter((item) => compareValues(item, value) !== 0));
    if (selectedNode && compareValues(selectedNode.value, value) === 0) setSelectedNode(null);
    setDeleteInput("");
  }

  function deleteSelectedNode() {
    if (!selectedNode) return;
    setSequenceFromValues(values.filter((item) => compareValues(item, selectedNode.value) !== 0));
    setSelectedNode(null);
  }

  return (
    <main className="app-shell rbt-shell">
      <header className="hero rbt-hero">
        <p className="kicker">Red-Black Tree Interactive Teaching App</p>
        <h1>Materi Red-Black Tree dari Slide</h1>
        <p>
          Ringkasan konsep, properties, insert dengan uncle node, rotation, deletion double-black,
          dan simulasi sequence seperti contoh ALGORITHM / LABCOMPUTING.
        </p>
      </header>

      <section className="card lesson-card rbt-card">
        <div className="section-head">
          <div>
            <h2>Inti Materi RBT</h2>
            <p>Disusun dari slide “Red Black Tree” dan “RBT slide updated”.</p>
          </div>
          <span className="step-badge rbt-step-badge">Color + Black-Height</span>
        </div>
        <div className="lesson-grid">
          {CORE_POINTS.map((point) => (
            <div key={point} className="lesson-item rbt-lesson-item">
              {point}
            </div>
          ))}
        </div>
      </section>

      <section className="card rbt-properties-card">
        <div className="section-head">
          <div>
            <h2>Properties dan Validasi</h2>
            <p>BST baru disebut Red-Black Tree jika semua aturan ini terpenuhi.</p>
          </div>
        </div>
        <div className="rbt-property-grid">
          {["Setiap node berwarna red atau black.", "Root harus black.", "Semua NIL/external nodes adalah black.", "Red node tidak boleh punya red child.", "Semua path ke NIL punya black-height yang sama."].map((item, index) => (
            <article key={item} className="rbt-property">
              <span>{index + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card builder-card rbt-builder-card">
        <div className="section-head">
          <div>
            <h2>Interactive RBT Builder</h2>
            <p>Masukkan huruf atau angka. Insert diproses seperti BST, node baru merah, lalu fix violation.</p>
          </div>
        </div>
        <div className="builder-grid rbt-builder-grid">
          <aside className="panel">
            <h3>Input Sequence</h3>
            <label className="label">Sequence insert</label>
            <textarea value={sequenceInput} onChange={(event) => setSequenceInput(event.target.value)} />
            <div className="rbt-presets">
              <button type="button" className="btn" onClick={() => setSequenceInput("A L G O R I T H M")}>
                ALGORITHM
              </button>
              <button type="button" className="btn" onClick={() => setSequenceInput("L A B C O M P U T I N G")}>
                LABCOMPUTING
              </button>
              <button type="button" className="btn ghost" onClick={() => setSequenceInput("")}>
                Clear
              </button>
            </div>
            <label className="label">Tambah 1 nilai</label>
            <div className="inline-input">
              <input value={singleInput} onChange={(event) => setSingleInput(event.target.value)} placeholder="contoh: 42 / K" />
              <button type="button" className="btn" onClick={addSingleValue}>
                Insert
              </button>
            </div>
            <label className="label">Hapus 1 nilai</label>
            <div className="inline-input">
              <input value={deleteInput} onChange={(event) => setDeleteInput(event.target.value)} placeholder="contoh: 20 / A" />
              <button type="button" className="btn danger" onClick={deleteSingleValue}>
                Hapus
              </button>
            </div>
            <div className="stats-grid">
              <div className="stat">
                <span>Total Node</span>
                <strong>{nodeCount}</strong>
              </div>
              <div className="stat">
                <span>Root</span>
                <strong>{builderResult.root?.value ?? "-"}</strong>
              </div>
            </div>
          </aside>
          <div className="canvas-panel rbt-canvas-panel">
            <RbtTreeCanvas root={builderResult.root} highlight={values.at(-1)} selected={selectedNode} onSelect={setSelectedNode} />
          </div>
          <aside className="panel dark">
            <h3>Node Inspector</h3>
            {selectedNode ? (
              <div className="inspector-list">
                <p>
                  Value: <strong>{selectedNode.value}</strong>
                </p>
                <p>
                  Color: <strong>{findNode(builderResult.root, selectedNode.value)?.color ?? "-"}</strong>
                </p>
                <p>
                  Black-height: <strong>{findNode(builderResult.root, selectedNode.value) ? getBlackHeight(findNode(builderResult.root, selectedNode.value)) : "-"}</strong>
                </p>
                <button type="button" className="btn danger" onClick={deleteSelectedNode}>
                  Hapus Node Ini
                </button>
              </div>
            ) : (
              <p className="muted">Klik node pada canvas untuk melihat detail warna dan black-height.</p>
            )}
            <h3>Ringkasan Tree</h3>
            <div className="rbt-summary-grid">
              <div className="stat">
                <span>Root</span>
                <strong>{builderResult.root?.value ?? "-"}</strong>
              </div>
              <div className="stat">
                <span>Warna Root</span>
                <strong>{builderResult.root ? "Black" : "-"}</strong>
              </div>
              <div className="stat">
                <span>Node Terakhir</span>
                <strong>{values.at(-1) ?? "-"}</strong>
              </div>
              <div className="stat">
                <span>Status</span>
                <strong>{validation.valid ? "Valid" : "Check"}</strong>
              </div>
            </div>
            {validation.issues.length ? (
              <ul className="log-list error-list">
                {validation.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : null}
            <h3>Repair Terakhir</h3>
            {builderResult.logs.length ? (
              <ul className="log-list trace-list">
                {builderResult.logs.slice(-6).map((log, index) => (
                  <li key={`${log}-${index}`}>{simplifyLog(log)}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">Belum ada insert yang diproses.</p>
            )}
            <ColorLegend />
          </aside>
        </div>
      </section>

      <section className="card ppt-example-card rbt-walk-card">
        <div className="section-head">
          <div>
            <h2>Insertion Walkthrough dari Slide</h2>
            <p>Contoh ALGORITHM pada slide 13-21 dan LABCOMPUTING pada slide 29-32 bisa diputar langkahnya.</p>
          </div>
          <div className="case-tabs case-tabs-wide">
            <button type="button" className={walkthroughText === "ALGORITHM" ? "active" : ""} onClick={() => { setWalkthroughText("ALGORITHM"); setWalkStep(0); }}>
              ALGORITHM
            </button>
            <button type="button" className={walkthroughText === "LABCOMPUTING" ? "active" : ""} onClick={() => { setWalkthroughText("LABCOMPUTING"); setWalkStep(0); }}>
              LABCOMPUTING
            </button>
          </div>
        </div>

        <div className="ppt-example-layout">
          <div className="canvas-panel ppt-canvas-panel rbt-walk-canvas">
            <RbtTreeCanvas root={currentWalk?.tree} highlight={currentWalk?.value} />
          </div>
          <aside className="panel ppt-step-panel">
            <div className="rotation-canvas-header">
              <span className="step-badge rbt-step-badge">{currentWalk ? `Insert ${currentWalk.value}` : "Kosong"}</span>
              <span className="rotation-step-counter">
                Langkah {walkthrough.length ? safeWalkStep + 1 : 0} / {walkthrough.length}
              </span>
            </div>
            <h3 className="rotation-side-title">{currentWalk?.title ?? "Belum ada sequence"}</h3>
            <p className="muted">{currentWalk?.subtitle ?? "Pilih preset atau isi sequence."}</p>
            <ul className="rotation-bullet-list">
              {(currentWalk?.logs ?? []).map((log, index) => (
                <li key={`${log}-${index}`}>{simplifyLog(log)}</li>
              ))}
              {currentWalk?.repaired ? (
                <li>Repair dilakukan karena ada double red, lalu aturan warna dikembalikan valid.</li>
              ) : (
                <li>Pada langkah ini tidak ada double red yang perlu diperbaiki.</li>
              )}
            </ul>
            <label className="label">Pilih langkah insertion</label>
            <input
              type="range"
              min={0}
              max={Math.max(0, walkthrough.length - 1)}
              value={safeWalkStep}
              onChange={(event) => setWalkStep(Number(event.target.value))}
              className="rotation-range"
            />
            <div className="step-nav">
              <button type="button" className="btn" disabled={safeWalkStep <= 0} onClick={() => setWalkStep((step) => Math.max(0, step - 1))}>
                Sebelumnya
              </button>
              <button type="button" className="btn primary" disabled={safeWalkStep >= walkthrough.length - 1} onClick={() => setWalkStep((step) => Math.min(walkthrough.length - 1, step + 1))}>
                Berikutnya
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className="card rotation-card rbt-case-card">
        <div className="section-head">
          <div>
            <h2>Fix Violation: Uncle Node</h2>
            <p>Slide menekankan keputusan utama: warna uncle menentukan recolor atau rotation.</p>
          </div>
          <div className="case-tabs case-tabs-wide">
            {INSERT_CASES.map((item, index) => (
              <button key={item.name} type="button" className={caseIndex === index ? "active" : ""} onClick={() => setCaseIndex(index)}>
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <div className="rbt-case-layout">
          <article className="panel rbt-case-explain">
            <span className="step-badge rbt-step-badge">{selectedCase.name}</span>
            <h3>{selectedCase.title}</h3>
            <ul className="rotation-bullet-list">
              {selectedCase.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
          <article className="panel dark rbt-analogy">
            <h3>Analogy dari Slide</h3>
            <p>
              AVL seperti perfeksionis yang menjaga tree sangat rata. Red-Black Tree lebih pragmatis:
              selama aturan warna dan black-height aman, tree cukup diperbaiki dengan recolor atau satu-dua rotation.
            </p>
          </article>
        </div>
      </section>

      <section className="card deletion-operation-card rbt-delete-card">
        <div className="section-head">
          <div>
            <h2>Operation Deletion RBT</h2>
            <p>Walkthrough deletion menampilkan successor, node merah yang aman dihapus, dan kasus double black.</p>
          </div>
          <span className="step-badge rbt-step-badge">
            Langkah {safeDeleteStep + 1} / {RBT_DELETE_STEPS.length}
          </span>
        </div>
        <div className="deletion-operation-layout">
          <div className="canvas-panel deletion-canvas-panel rbt-canvas-panel">
            <RbtTreeCanvas root={deleteStepData.tree} highlight={deleteStepData.highlight} />
          </div>
          <aside className="panel deletion-step-panel">
            <div className="rotation-canvas-header">
              <span className="step-badge rbt-step-badge">{deleteStepData.short}</span>
              <span className="rotation-step-counter">
                {safeDeleteStep + 1} dari {RBT_DELETE_STEPS.length}
              </span>
            </div>
            <h3 className="rotation-side-title">{deleteStepData.title}</h3>
            <ul className="rotation-bullet-list">
              {deleteStepData.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <pre className="source-code-block source-code-block-small deletion-code-snippet">
              <code>{deleteStepData.code}</code>
            </pre>
            <label className="label">Pilih langkah deletion</label>
            <input
              type="range"
              min={0}
              max={RBT_DELETE_STEPS.length - 1}
              value={safeDeleteStep}
              onChange={(event) => setDeleteStep(Number(event.target.value))}
              className="rotation-range"
            />
            <div className="step-nav">
              <button type="button" className="btn" disabled={safeDeleteStep <= 0} onClick={() => setDeleteStep((step) => Math.max(0, step - 1))}>
                Sebelumnya
              </button>
              <button
                type="button"
                className="btn primary"
                disabled={safeDeleteStep >= RBT_DELETE_STEPS.length - 1}
                onClick={() => setDeleteStep((step) => Math.min(RBT_DELETE_STEPS.length - 1, step + 1))}
              >
                Berikutnya
              </button>
            </div>
          </aside>
        </div>
        <div className="rbt-delete-grid rbt-rule-strip">
          {DELETE_RULES.map((rule) => (
            <article key={rule.title} className="rbt-delete-rule">
              <h3>{rule.title}</h3>
              <p>{rule.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card source-detail-card rbt-source-card">
        <div className="section-head">
          <div>
            <h2>Bedah Source Code RBT</h2>
            <p>Bagian ini mengikuti slide updated: attributes, create node, BST insert, rotation, fix violation, dan deletion.</p>
          </div>
          <div className="case-tabs case-tabs-wide">
            {Object.entries(CODE_DETAILS).map(([key, item]) => (
              <button key={key} type="button" className={codeDetail === key ? "active" : ""} onClick={() => setCodeDetail(key)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="source-detail-layout">
          <div className="panel source-code-panel">
            <div className="code-toolbar">
              <span className="step-badge rbt-step-badge">{detail.label}</span>
              <span className="rotation-step-counter">C / pseudo C</span>
            </div>
            <pre className="source-code-block">
              <code>{detail.code}</code>
            </pre>
          </div>
          <aside className="panel dark source-explain-panel">
            <h3>{detail.title}</h3>
            <ul className="rotation-bullet-list source-bullet-list">
              {detail.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="card code-card rbt-code-card">
        <div className="section-head">
          <div>
            <h2>Full C Code Playground RBT</h2>
            <p>Editor membaca operasi insert/delete pada main, lalu memvisualkan tree dengan aturan warna RBT.</p>
          </div>
          <div className="case-tabs case-tabs-wide">
            <button type="button" className="active">
              RBT Code
            </button>
            <button type="button" onClick={() => setCodeInput(DEFAULT_RBT_CODE)}>
              Reset
            </button>
            <button
              type="button"
              onClick={() =>
                setCodeInput(`int main() {
  struct Node *root = NULL;

  insertMany([41, 38, 31, 12, 19, 8]);
  root = deleteNode(root, 12);
  root = insertNode(root, 25);

  return 0;
}`)
              }
            >
              CLRS
            </button>
          </div>
        </div>

        <div className="code-layout">
          <aside className="panel code-panel">
            <div className="code-toolbar">
              <span className="step-badge rbt-step-badge">RBT Source</span>
              <span className="rotation-step-counter">{codeResult.values.length} node</span>
            </div>
            <textarea
              className="code-editor"
              spellCheck="false"
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value)}
              aria-label="RBT C code editor"
            />
          </aside>

          <div className="canvas-panel code-canvas-panel rbt-canvas-panel">
            <RbtTreeCanvas root={codeResult.root} highlight={codeResult.values.at(-1)} />
          </div>

          <aside className="panel dark code-output-panel">
            <h3>Output</h3>
            <div className="stats-grid compact-stats">
              <div className="stat">
                <span>Black-height</span>
                <strong>{codeResult.validation.blackHeight}</strong>
              </div>
              <div className="stat">
                <span>Status</span>
                <strong>{codeResult.validation.valid ? "Valid" : "Check"}</strong>
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
              <p className="muted">Kode valid. Operasi sudah divisualkan sebagai Red-Black Tree.</p>
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
            <h3>Repair Log</h3>
            {codeResult.logs.length ? (
              <ul className="log-list trace-list">
                {codeResult.logs.slice(-8).map((log, index) => (
                  <li key={`${log}-${index}`}>{simplifyLog(log)}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">Belum ada recolor atau rotation.</p>
            )}
          </aside>
        </div>
      </section>

      <section className="card rbt-app-card">
        <div className="section-head">
          <div>
            <h2>Real World Application</h2>
            <p>RBT dipakai saat operasi ordered data butuh worst-case search, insertion, dan deletion yang stabil.</p>
          </div>
        </div>
        <div className="lesson-grid">
          {APPLICATIONS.map((item) => (
            <div key={item} className="lesson-item rbt-lesson-item">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
