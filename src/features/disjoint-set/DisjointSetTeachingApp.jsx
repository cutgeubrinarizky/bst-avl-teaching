import { useMemo, useState } from "react";

const LESSON_POINTS = [
  "Disjoint Set menyimpan kumpulan himpunan yang saling lepas: satu elemen hanya berada di satu set.",
  "Operasi utama hanya dua: find untuk mencari representative/root, dan union untuk menggabungkan dua set.",
  "Struktur ini sering disebut Union-Find karena dua operasi itu menjadi inti semua algoritmanya.",
  "Path compression membuat node yang dilewati saat find langsung menunjuk ke root.",
  "Union by rank atau union by size menjaga tree tetap pendek agar operasi tetap sangat cepat.",
];

const TERMS = [
  {
    title: "Representative",
    body: "Root yang menjadi wakil satu set. Jika find(A) dan find(B) sama, A dan B berada dalam komponen yang sama.",
  },
  {
    title: "Parent Array",
    body: "Setiap elemen menyimpan parent-nya sendiri. Root punya parent ke dirinya sendiri, misalnya parent[3] = 3.",
  },
  {
    title: "Rank",
    body: "Perkiraan tinggi tree. Saat dua root rank-nya sama digabung, rank root baru dinaikkan satu.",
  },
  {
    title: "Size",
    body: "Jumlah anggota set. Union by size menempelkan tree kecil ke root tree besar.",
  },
];

const COMPLEXITIES = [
  { op: "makeSet", value: "O(1)", note: "Setiap elemen dibuat sebagai root dirinya sendiri." },
  { op: "find tanpa optimasi", value: "O(n)", note: "Tree bisa menjadi rantai panjang." },
  { op: "find + path compression", value: "Hampir O(1)", note: "Secara amortized O(alpha(n)), sangat dekat konstan." },
  { op: "union + rank/size", value: "Hampir O(1)", note: "Root lebih pendek ditempel ke root yang lebih kuat." },
];

const APPLICATIONS = [
  "Deteksi cycle pada undirected graph.",
  "Kruskal Minimum Spanning Tree.",
  "Menghitung connected components.",
  "Percolation, dynamic connectivity, dan grouping akun/data yang terhubung.",
  "Mengecek apakah dua item berada dalam kelompok yang sama dengan cepat.",
];

const DEEP_EXPLANATIONS = [
  {
    tag: "Masalahnya",
    title: "Kita cuma ingin tahu: mereka satu geng atau bukan?",
    body: [
      "Bayangkan ada banyak orang yang awalnya belum saling kenal. Setiap kali ada informasi baru, misalnya 0 berteman dengan 1, lalu 1 berteman dengan 3, kita perlu cepat menjawab: apakah 0 dan 3 sekarang satu kelompok?",
      "Disjoint Set dibuat untuk pertanyaan seperti itu. Ia tidak peduli urutan data, nilai terbesar, atau traversal lengkap. Fokusnya tajam: gabungkan kelompok dan cek apakah dua elemen sudah berada di kelompok yang sama.",
    ],
    example: "Kalau find(0) dan find(3) sama-sama menghasilkan 0, berarti 0 dan 3 satu kelompok.",
  },
  {
    tag: "Ide intinya",
    title: "Setiap kelompok cukup punya satu wakil",
    body: [
      "Daripada menghafal semua anggota kelompok, setiap elemen cukup punya jalur menuju satu wakil. Wakil ini disebut root atau representative.",
      "Saat kita menjalankan find(x), kita sedang bertanya: ketua kelompok x siapa? Kalau dua elemen punya ketua yang sama, mereka satu set.",
    ],
    example: "same(a, b) sebenarnya hanya find(a) === find(b). Simpel, tapi sangat kuat.",
  },
  {
    tag: "Cara baca",
    title: "Parent array itu peta jalan menuju wakil",
    body: [
      "Isi parent[x] berarti x sedang menunjuk ke siapa. Kalau parent[5] = 2, maka 5 mengikuti 2. Kalau parent[2] = 0, maka 2 mengikuti 0. Kalau parent[0] = 0, berhenti: 0 adalah root.",
      "Kalau digambar, parent array membentuk beberapa tree kecil. Kumpulan tree ini disebut forest. Satu tree sama dengan satu kelompok.",
    ],
    example: "parent[4] = 3, parent[3] = 0, parent[0] = 0 berarti find(4) = 0.",
  },
  {
    tag: "Kenapa perlu DSU?",
    title: "Karena mengganti label satu-satu itu melelahkan",
    body: [
      "Cara naifnya: simpan label kelompok di setiap elemen. Masalahnya, saat dua kelompok besar digabung, kita harus mengganti label banyak elemen sekaligus.",
      "Disjoint Set lebih cerdik. Ia tidak merapikan semua anggota saat union. Ia cukup menyambungkan satu root ke root lain. Nanti saat find dipanggil, path compression membantu merapikan jalurnya sedikit demi sedikit.",
    ],
    example: "Union besar tidak perlu menyentuh semua anggota. Cukup parent[rootB] = rootA.",
  },
];

const INVARIANTS = [
  "Setiap elemen punya tepat satu parent.",
  "Root selalu memenuhi parent[root] = root.",
  "Dua elemen berada di set yang sama jika dan hanya jika find(a) === find(b).",
  "Union hanya boleh mengubah parent dari root, bukan sembarang node.",
  "Path compression tidak mengubah isi kelompok, hanya memperpendek jalur menuju root.",
  "Rank bukan selalu tinggi aktual setelah path compression; rank hanya alat bantu untuk memilih root saat union.",
];

const OPERATION_DETAILS = [
  {
    title: "makeSet(x)",
    body: "Membuat set baru berisi satu elemen. parent[x] diisi x sendiri, rank[x] biasanya 0, dan size[x] biasanya 1. Pada awal program, makeSet dilakukan untuk semua elemen.",
    code: `parent[x] = x
rank[x] = 0
size[x] = 1`,
  },
  {
    title: "find(x)",
    body: "Mencari root dari x dengan mengikuti parent berulang sampai menemukan elemen yang parent-nya dirinya sendiri. Nilai root inilah representative set.",
    code: `while parent[x] != x:
  x = parent[x]
return x`,
  },
  {
    title: "find(x) dengan path compression",
    body: "Saat find berjalan dari x ke root, semua node yang dilewati dibuat langsung menunjuk root. Operasi ini membuat query berikutnya pada node yang sama atau jalur yang sama menjadi lebih cepat.",
    code: `if parent[x] != x:
  parent[x] = find(parent[x])
return parent[x]`,
  },
  {
    title: "union(a, b)",
    body: "Pertama cari root a dan root b. Jika root sama, tidak ada yang perlu digabung. Jika berbeda, sambungkan salah satu root ke root lainnya.",
    code: `ra = find(a)
rb = find(b)
if ra != rb:
  parent[rb] = ra`,
  },
  {
    title: "same(a, b)",
    body: "Operasi ini biasanya bukan fungsi baru di struktur inti. Ia hanya wrapper untuk membandingkan representative dua elemen.",
    code: `same(a, b) = find(a) == find(b)`,
  },
];

const IMPLEMENTATION_VARIANTS = [
  {
    title: "Union by Rank",
    body: "Rank memperkirakan tinggi tree. Root dengan rank lebih kecil ditempel ke root dengan rank lebih besar. Jika rank sama, pilih salah satu root lalu naikkan rank root yang dipilih.",
  },
  {
    title: "Union by Size",
    body: "Root dengan jumlah anggota lebih sedikit ditempel ke root dengan anggota lebih banyak. Variasi ini mudah dipahami karena size benar-benar berarti jumlah elemen di komponen root.",
  },
  {
    title: "Quick Find",
    body: "Menyimpan id komponen langsung pada setiap elemen. same sangat cepat, tetapi union mahal karena banyak label harus diganti. Cocok untuk menjelaskan ide awal, bukan praktik umum.",
  },
  {
    title: "Quick Union",
    body: "Menggunakan parent tree seperti Disjoint Set dasar. Union lebih murah daripada Quick Find, tetapi tanpa rank/size tree bisa menjadi rantai panjang.",
  },
];

const MANUAL_TRACE = [
  {
    op: "makeSet 0..5",
    parent: "[0, 1, 2, 3, 4, 5]",
    note: "Semua elemen menjadi root dirinya sendiri.",
  },
  {
    op: "union(0, 1)",
    parent: "[0, 0, 2, 3, 4, 5]",
    note: "Root 1 ditempel ke root 0.",
  },
  {
    op: "union(1, 2)",
    parent: "[0, 0, 0, 3, 4, 5]",
    note: "find(1) menghasilkan 0, jadi root 2 ditempel ke root 0.",
  },
  {
    op: "union(3, 4)",
    parent: "[0, 0, 0, 3, 3, 5]",
    note: "Terbentuk komponen baru {3,4}.",
  },
  {
    op: "same(2, 4)",
    parent: "[0, 0, 0, 3, 3, 5]",
    note: "find(2)=0 dan find(4)=3, jadi false.",
  },
  {
    op: "union(2, 4)",
    parent: "[0, 0, 0, 0, 3, 5]",
    note: "Komponen {0,1,2} dan {3,4} digabung.",
  },
  {
    op: "find(4)",
    parent: "[0, 0, 0, 0, 0, 5]",
    note: "Path compression membuat 4 langsung menunjuk root 0.",
  },
];

const COMMON_MISTAKES = [
  "Melakukan union langsung pada a dan b, bukan pada root find(a) dan find(b). Ini bisa merusak struktur set.",
  "Menganggap rank selalu sama dengan tinggi aktual tree. Setelah path compression, tinggi aktual bisa turun, tetapi rank tidak harus ikut turun.",
  "Lupa mengecek root sama sebelum union. Pada graph, kondisi root sama berarti edge tersebut membentuk cycle.",
  "Menggunakan Disjoint Set untuk graph berarah tanpa analisis tambahan. Cycle detection DSU yang umum berlaku untuk undirected graph.",
  "Mengira Disjoint Set bisa menghapus koneksi dengan mudah. Struktur ini cocok untuk union bertambah, bukan split/delete edge umum.",
  "Memakai size dari node non-root sebagai ukuran komponen. Size yang bermakna biasanya hanya disimpan akurat pada root.",
];

const EXERCISES = [
  "Mulai dari parent [0,1,2,3,4]. Jalankan union(0,1), union(2,3), union(1,3). Tentukan root setiap elemen.",
  "Pada graph edge: 0-1, 1-2, 2-0, tentukan edge mana yang pertama kali membuat cycle.",
  "Bandingkan hasil parent array sebelum dan sesudah find(4) jika 4 -> 3 -> 2 -> 0.",
  "Jelaskan dengan kalimat sendiri mengapa union by size membuat tree cenderung pendek.",
  "Buat contoh operasi same(a,b) yang awalnya false, lalu menjadi true setelah satu operasi union.",
];

const STORY_CARDS = [
  {
    label: "Bayangkan kelas",
    title: "Setiap kelompok punya ketua",
    body: "Anggota tidak perlu hafal semua teman satu kelompok. Cukup tahu jalur menuju ketua. Kalau dua orang ketuanya sama, berarti mereka satu kelompok.",
    footer: "Ketua = representative/root",
  },
  {
    label: "Saat gabung",
    title: "Dua ketua berunding",
    body: "Union bukan menyambung sembarang anggota. Kita cari ketua masing-masing dulu, lalu satu ketua menjadi bawahan ketua lain.",
    footer: "union(a,b) selalu pakai find(a) dan find(b)",
  },
  {
    label: "Saat cari ketua",
    title: "Jalur dibuat lebih pendek",
    body: "Kalau anggota harus melewati beberapa orang untuk sampai ketua, path compression membuat ia langsung menunjuk ketua setelah pencarian selesai.",
    footer: "Find berikutnya jadi lebih cepat",
  },
];

const WALKTHROUGH_STEPS = [
  {
    short: "makeSet",
    title: "Awal: setiap elemen adalah set sendiri",
    parent: [0, 1, 2, 3, 4, 5, 6],
    rank: [0, 0, 0, 0, 0, 0, 0],
    highlight: [0, 1, 2, 3, 4, 5, 6],
    code: `for i = 0..6:
  parent[i] = i
  rank[i] = 0`,
    bullets: [
      "Belum ada hubungan antar elemen.",
      "Setiap elemen adalah root karena parent[i] = i.",
      "Ada 7 set terpisah: {0}, {1}, {2}, {3}, {4}, {5}, {6}.",
    ],
  },
  {
    short: "union(0,1)",
    title: "Gabungkan 0 dan 1",
    parent: [0, 0, 2, 3, 4, 5, 6],
    rank: [1, 0, 0, 0, 0, 0, 0],
    highlight: [0, 1],
    code: `root0 = find(0) = 0
root1 = find(1) = 1
rank sama, parent[1] = 0
rank[0]++`,
    bullets: [
      "Root 0 dan root 1 berbeda, jadi union boleh dilakukan.",
      "Karena rank sama, salah satu root dipilih sebagai parent.",
      "Rank root 0 naik karena tinggi tree bertambah.",
    ],
  },
  {
    short: "union(2,3)",
    title: "Gabungkan 2 dan 3",
    parent: [0, 0, 2, 2, 4, 5, 6],
    rank: [1, 0, 1, 0, 0, 0, 0],
    highlight: [2, 3],
    code: `root2 = 2
root3 = 3
parent[3] = 2
rank[2]++`,
    bullets: [
      "Set {2} dan {3} menjadi satu komponen.",
      "Sekarang ada dua tree kecil: root 0 dan root 2.",
      "Elemen lain masih sendiri-sendiri.",
    ],
  },
  {
    short: "union(1,3)",
    title: "Gabungkan dua komponen",
    parent: [0, 0, 0, 2, 4, 5, 6],
    rank: [2, 0, 1, 0, 0, 0, 0],
    highlight: [0, 1, 2, 3],
    code: `find(1) = 0
find(3) = 2
rank[0] == rank[2]
parent[2] = 0
rank[0]++`,
    bullets: [
      "find(1) tidak berhenti di 1, tetapi naik ke root 0.",
      "find(3) naik ke root 2.",
      "Karena root berbeda, dua komponen digabung menjadi {0,1,2,3}.",
    ],
  },
  {
    short: "find(3)",
    title: "Path compression memperpendek jalur",
    parent: [0, 0, 0, 0, 4, 5, 6],
    rank: [2, 0, 1, 0, 0, 0, 0],
    highlight: [3, 2, 0],
    code: `find(3):
  parent[3] = 2
  parent[2] = 0
  root = 0
  parent[3] = 0`,
    bullets: [
      "Sebelum compression, 3 menunjuk ke 2, lalu 2 menunjuk ke 0.",
      "Setelah find selesai, 3 langsung menunjuk ke 0.",
      "Find berikutnya untuk 3 akan jauh lebih pendek.",
    ],
  },
  {
    short: "cycle",
    title: "Deteksi cycle: edge 0-3 ditolak",
    parent: [0, 0, 0, 0, 4, 5, 6],
    rank: [2, 0, 1, 0, 0, 0, 0],
    highlight: [0, 3],
    code: `edge (0, 3)
find(0) = 0
find(3) = 0
root sama -> edge membuat cycle`,
    bullets: [
      "Jika dua endpoint sudah punya representative yang sama, mereka sudah terhubung.",
      "Menambahkan edge baru di antara mereka akan membentuk cycle.",
      "Inilah alasan Disjoint Set sangat cocok untuk Kruskal dan cycle detection.",
    ],
  },
];

const GRAPH_EDGES = [
  [0, 1],
  [1, 2],
  [3, 4],
  [2, 4],
  [0, 4],
  [5, 6],
];

const GRAPH_NODES = [
  { id: 0, x: 80, y: 82 },
  { id: 1, x: 190, y: 45 },
  { id: 2, x: 300, y: 92 },
  { id: 3, x: 120, y: 210 },
  { id: 4, x: 270, y: 215 },
  { id: 5, x: 420, y: 95 },
  { id: 6, x: 455, y: 220 },
];

const DEFAULT_OPS = `union 0 1
union 2 3
union 1 3
find 3
same 0 3
union 4 5
union 3 5`;

function createDsu(size) {
  return {
    parent: Array.from({ length: size }, (_, index) => index),
    rank: Array.from({ length: size }, () => 0),
    size: Array.from({ length: size }, () => 1),
  };
}

function findRoot(dsu, value, compress, logs) {
  if (dsu.parent[value] === value) return value;
  const before = dsu.parent[value];
  const root = findRoot(dsu, before, compress, logs);
  if (compress && dsu.parent[value] !== root) {
    logs.push(`Path compression: parent[${value}] dari ${before} menjadi ${root}.`);
    dsu.parent[value] = root;
  }
  return root;
}

function unionByRank(dsu, a, b, compress, logs) {
  const rootA = findRoot(dsu, a, compress, logs);
  const rootB = findRoot(dsu, b, compress, logs);
  if (rootA === rootB) {
    logs.push(`union(${a}, ${b}) ditolak: root sama (${rootA}), berarti sudah satu set.`);
    return false;
  }
  if (dsu.rank[rootA] < dsu.rank[rootB]) {
    dsu.parent[rootA] = rootB;
    dsu.size[rootB] += dsu.size[rootA];
    logs.push(`Root ${rootA} ditempel ke root ${rootB} karena rank lebih kecil.`);
  } else if (dsu.rank[rootA] > dsu.rank[rootB]) {
    dsu.parent[rootB] = rootA;
    dsu.size[rootA] += dsu.size[rootB];
    logs.push(`Root ${rootB} ditempel ke root ${rootA} karena rank lebih kecil.`);
  } else {
    dsu.parent[rootB] = rootA;
    dsu.rank[rootA] += 1;
    dsu.size[rootA] += dsu.size[rootB];
    logs.push(`Rank sama: root ${rootB} ditempel ke ${rootA}, rank[${rootA}] naik.`);
  }
  return true;
}

function runOperations(raw, count, compress) {
  const dsu = createDsu(count);
  const logs = [];
  const errors = [];

  raw.split(/\r?\n/).forEach((line, index) => {
    const parts = line.trim().toLowerCase().split(/\s+/);
    if (!parts[0]) return;
    const [op, left, right] = parts;
    const a = Number.parseInt(left, 10);
    const b = Number.parseInt(right, 10);
    const lineLabel = `Baris ${index + 1}`;
    if (!["union", "find", "same"].includes(op)) {
      errors.push(`${lineLabel}: operasi "${op}" belum didukung.`);
      return;
    }
    if (!Number.isInteger(a) || a < 0 || a >= count) {
      errors.push(`${lineLabel}: elemen pertama tidak valid.`);
      return;
    }
    if ((op === "union" || op === "same") && (!Number.isInteger(b) || b < 0 || b >= count)) {
      errors.push(`${lineLabel}: elemen kedua tidak valid.`);
      return;
    }
    if (op === "union") {
      logs.push(`${lineLabel}: union(${a}, ${b})`);
      unionByRank(dsu, a, b, compress, logs);
    }
    if (op === "find") {
      const root = findRoot(dsu, a, compress, logs);
      logs.push(`${lineLabel}: find(${a}) = ${root}.`);
    }
    if (op === "same") {
      const rootA = findRoot(dsu, a, compress, logs);
      const rootB = findRoot(dsu, b, compress, logs);
      logs.push(`${lineLabel}: same(${a}, ${b}) = ${rootA === rootB ? "true" : "false"} (${rootA} vs ${rootB}).`);
    }
  });

  return { ...dsu, logs, errors };
}

function getGroups(parent) {
  const roots = parent.map((_, index) => {
    let current = index;
    while (parent[current] !== current) current = parent[current];
    return current;
  });
  return roots.reduce((groups, root, index) => {
    if (!groups[root]) groups[root] = [];
    groups[root].push(index);
    return groups;
  }, {});
}

function DisjointSetDiagram({ parent, rank, highlight = [] }) {
  const groups = getGroups(parent);
  return (
    <div className="dsu-diagram">
      {Object.entries(groups).map(([root, members]) => (
        <article key={root} className="dsu-group">
          <div className="dsu-root">
            <span>Root</span>
            <strong>{root}</strong>
            <small>rank {rank[root] ?? 0}</small>
          </div>
          <div className="dsu-members">
            {members.map((member) => (
              <div key={member} className={`dsu-node ${highlight.includes(member) ? "active" : ""}`}>
                <strong>{member}</strong>
                <span>p: {parent[member]}</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function ParentTable({ parent, rank, size }) {
  return (
    <div className="dsu-table-wrap">
      <table className="dsu-table">
        <thead>
          <tr>
            <th>i</th>
            {parent.map((_, index) => <th key={index}>{index}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>parent[i]</td>
            {parent.map((item, index) => <td key={index}>{item}</td>)}
          </tr>
          <tr>
            <td>rank[i]</td>
            {rank.map((item, index) => <td key={index}>{item}</td>)}
          </tr>
          {size ? (
            <tr>
              <td>size[i]</td>
              {size.map((item, index) => <td key={index}>{item}</td>)}
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function GraphCycleCanvas({ edgeLimit, accepted, rejected }) {
  const visibleEdges = GRAPH_EDGES.slice(0, edgeLimit);
  const nodeById = Object.fromEntries(GRAPH_NODES.map((node) => [node.id, node]));
  const rejectedKeys = new Set(rejected.map(([a, b]) => `${a}-${b}`));
  const acceptedKeys = new Set(accepted.map(([a, b]) => `${a}-${b}`));

  return (
    <div className="dsu-graph-canvas">
      <svg viewBox="0 0 540 285" role="img" aria-label="Visual graph untuk deteksi cycle dengan Disjoint Set">
        {visibleEdges.map(([a, b]) => {
          const from = nodeById[a];
          const to = nodeById[b];
          const key = `${a}-${b}`;
          const status = rejectedKeys.has(key) ? "rejected" : acceptedKeys.has(key) ? "accepted" : "";
          return (
            <g key={key}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={`dsu-graph-edge ${status}`} />
              <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8} className={`dsu-graph-edge-label ${status}`}>
                {status === "rejected" ? "cycle" : "union"}
              </text>
            </g>
          );
        })}
        {GRAPH_NODES.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r="24" className="dsu-graph-node" />
            <text x={node.x} y={node.y + 5} textAnchor="middle" className="dsu-graph-node-text">{node.id}</text>
          </g>
        ))}
      </svg>
      <div className="dsu-graph-legend">
        <span><b className="accepted" /> Edge diterima: root berbeda, lakukan union.</span>
        <span><b className="rejected" /> Edge ditolak: root sama, cycle terbentuk.</span>
      </div>
    </div>
  );
}

function MiniSet({ title, root, members }) {
  return (
    <div className="dsu-mini-set">
      <div className="dsu-mini-root">
        <span>ketua</span>
        <strong>{root}</strong>
      </div>
      <div className="dsu-mini-members">
        {members.map((member) => (
          <span key={member}>{member}</span>
        ))}
      </div>
      <small>{title}</small>
    </div>
  );
}

function StoryIllustration() {
  return (
    <section className="card dsu-card dsu-story-card">
      <div className="section-head">
        <div>
          <h2>Ilustrasi Gampangnya</h2>
          <p>Pikirkan Disjoint Set seperti kelompok belajar: setiap kelompok punya satu ketua sebagai wakil.</p>
        </div>
        <span className="step-badge dsu-badge">Analogi</span>
      </div>

      <div className="dsu-story-grid">
        {STORY_CARDS.map((item) => (
          <article key={item.title} className="dsu-story-panel">
            <span className="dsu-story-label">{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <strong>{item.footer}</strong>
          </article>
        ))}
      </div>

      <div className="dsu-analogy-flow">
        <MiniSet title="Kelompok A" root="0" members={["1", "2"]} />
        <div className="dsu-flow-action">
          <span>union(2, 4)</span>
          <strong>cari ketua dulu</strong>
        </div>
        <MiniSet title="Kelompok B" root="3" members={["4", "5"]} />
        <div className="dsu-flow-result">
          <span>hasil</span>
          <MiniSet title="Kelompok gabungan" root="0" members={["1", "2", "3", "4", "5"]} />
        </div>
      </div>
    </section>
  );
}

function OperationComic() {
  return (
    <section className="card dsu-card">
      <div className="section-head">
        <div>
          <h2>Alur Operasi dalam 3 Gambar</h2>
          <p>Urutannya pendek: mulai sendiri, cari ketua, lalu sambungkan root yang berbeda.</p>
        </div>
      </div>
      <div className="dsu-comic-grid">
        <article className="dsu-comic-panel">
          <span className="dsu-comic-number">1</span>
          <h3>makeSet</h3>
          <div className="dsu-dot-row">
            {["0", "1", "2", "3"].map((item) => <span key={item}>{item}</span>)}
          </div>
          <p>Semua elemen berdiri sendiri. parent tiap elemen menunjuk dirinya sendiri.</p>
        </article>
        <article className="dsu-comic-panel">
          <span className="dsu-comic-number">2</span>
          <h3>find</h3>
          <div className="dsu-chain">
            <span>4</span><b>→</b><span>2</span><b>→</b><span className="root">0</span>
          </div>
          <p>Ikuti parent sampai root. Jawaban find(4) adalah 0.</p>
        </article>
        <article className="dsu-comic-panel">
          <span className="dsu-comic-number">3</span>
          <h3>union</h3>
          <div className="dsu-union-picture">
            <span>root 0</span>
            <b>←</b>
            <span>root 3</span>
          </div>
          <p>Kalau root berbeda, satu root ditempel ke root lain. Kelompoknya resmi bergabung.</p>
        </article>
      </div>
    </section>
  );
}

function CompressionIllustration() {
  return (
    <section className="card dsu-card">
      <div className="section-head">
        <div>
          <h2>Path Compression Secara Visual</h2>
          <p>Intinya bukan mengubah kelompok, tetapi memotong jalan supaya pencarian berikutnya lebih singkat.</p>
        </div>
        <span className="step-badge dsu-badge">Before / After</span>
      </div>
      <div className="dsu-before-after">
        <article className="dsu-path-card">
          <h3>Sebelum find(4)</h3>
          <div className="dsu-chain tall">
            <span>4</span><b>→</b><span>3</span><b>→</b><span>2</span><b>→</b><span className="root">0</span>
          </div>
          <p>4 harus melewati 3 dan 2 sebelum sampai root 0.</p>
        </article>
        <div className="dsu-compress-arrow">
          <span>find(4)</span>
          <strong>kompres jalur</strong>
        </div>
        <article className="dsu-path-card">
          <h3>Sesudah find(4)</h3>
          <div className="dsu-star-root">
            <span className="root">0</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
          </div>
          <p>2, 3, dan 4 bisa langsung menunjuk root 0. Set tetap sama, jalurnya saja lebih pendek.</p>
        </article>
      </div>
    </section>
  );
}

export default function DisjointSetTeachingApp() {
  const [stepIndex, setStepIndex] = useState(0);
  const [countInput, setCountInput] = useState("7");
  const [opsInput, setOpsInput] = useState(DEFAULT_OPS);
  const [compress, setCompress] = useState(true);
  const [edgeLimit, setEdgeLimit] = useState(4);

  const count = Math.min(12, Math.max(2, Number.parseInt(countInput, 10) || 7));
  const result = useMemo(() => runOperations(opsInput, count, compress), [opsInput, count, compress]);
  const step = WALKTHROUGH_STEPS[stepIndex];
  const graphResult = useMemo(() => {
    const dsu = createDsu(7);
    const logs = [];
    const accepted = [];
    const rejected = [];
    GRAPH_EDGES.slice(0, edgeLimit).forEach(([a, b]) => {
      const rootA = findRoot(dsu, a, true, logs);
      const rootB = findRoot(dsu, b, true, logs);
      if (rootA === rootB) {
        rejected.push([a, b]);
        logs.push(`Edge ${a}-${b} ditolak karena membentuk cycle.`);
      } else {
        unionByRank(dsu, a, b, true, logs);
        accepted.push([a, b]);
      }
    });
    return { ...dsu, logs, accepted, rejected };
  }, [edgeLimit]);

  return (
    <main className="app-shell dsu-shell">
      <header className="hero dsu-hero">
        <p className="kicker">Union-Find Teaching App</p>
        <h1>Materi Disjoint Set</h1>
        <p>Belajar struktur data Disjoint Set dari konsep himpunan terpisah, find, union, path compression, union by rank, sampai contoh graph.</p>
      </header>

      <section className="card dsu-card">
        <div className="section-head">
          <div>
            <h2>Inti Materi Disjoint Set</h2>
            <p>Gunakan Disjoint Set saat pertanyaan utamanya: dua elemen ini sudah satu kelompok atau belum?</p>
          </div>
          <span className="step-badge dsu-badge">Union-Find</span>
        </div>
        <div className="lesson-grid">
          {LESSON_POINTS.map((point) => <div key={point} className="lesson-item dsu-lesson-item">{point}</div>)}
        </div>
      </section>

      <StoryIllustration />

      <section className="card dsu-card">
        <div className="section-head">
          <div>
            <h2>Cerita Inti Disjoint Set</h2>
            <p>Versi santainya: kita mengurus banyak kelompok, lalu ingin cek koneksi antar anggota secepat mungkin.</p>
          </div>
        </div>
        <div className="dsu-reading-grid">
          {DEEP_EXPLANATIONS.map((item) => (
            <article key={item.title} className="dsu-reading-card">
              <span className="dsu-reading-tag">{item.tag}</span>
              <h3>{item.title}</h3>
              {item.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <div className="dsu-example-box">
                <strong>Contoh cepat</strong>
                <span>{item.example}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card dsu-card">
        <div className="section-head">
          <div>
            <h2>Konsep Penting</h2>
            <p>Empat istilah ini cukup untuk membaca hampir semua implementasi Disjoint Set.</p>
          </div>
        </div>
        <div className="rbt-property-grid">
          {TERMS.map((item, index) => (
            <article key={item.title} className="rbt-property dsu-property">
              <span>{index + 1}</span>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <OperationComic />

      <section className="card dsu-card">
        <div className="section-head">
          <div>
            <h2>Aturan yang Harus Selalu Benar</h2>
            <p>Invariant ini adalah pegangan saat menulis, membaca, atau men-debug implementasi Union-Find.</p>
          </div>
        </div>
        <div className="dsu-invariant-grid">
          {INVARIANTS.map((item, index) => (
            <div key={item} className="dsu-invariant">
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card dsu-card">
        <div className="section-head">
          <div>
            <h2>Detail Operasi</h2>
            <p>Setiap operasi kecil, tetapi urutannya penting. Terutama union harus memakai root, bukan elemen mentah.</p>
          </div>
        </div>
        <div className="dsu-operation-grid">
          {OPERATION_DETAILS.map((item) => (
            <article key={item.title} className="panel dsu-operation-card">
              <h3>{item.title}</h3>
              <p className="muted">{item.body}</p>
              <pre className="source-code-block source-code-block-small dsu-code-snippet"><code>{item.code}</code></pre>
            </article>
          ))}
        </div>
      </section>

      <CompressionIllustration />

      <section className="card dsu-card">
        <div className="section-head">
          <div>
            <h2>Step-by-Step Union-Find</h2>
            <p>Contoh lengkap dari makeSet sampai path compression dan cycle detection.</p>
          </div>
          <div className="case-tabs case-tabs-wide">
            {WALKTHROUGH_STEPS.map((item, index) => (
              <button key={item.short} type="button" className={stepIndex === index ? "active" : ""} onClick={() => setStepIndex(index)}>
                {item.short}
              </button>
            ))}
          </div>
        </div>

        <div className="dsu-walk-layout">
          <div className="canvas-panel dsu-canvas-panel">
            <DisjointSetDiagram parent={step.parent} rank={step.rank} highlight={step.highlight} />
            <ParentTable parent={step.parent} rank={step.rank} />
          </div>
          <aside className="panel dark">
            <span className="step-badge dsu-badge">{step.short}</span>
            <h3>{step.title}</h3>
            <ul className="rotation-bullet-list">{step.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
            <pre className="source-code-block source-code-block-small dsu-code-snippet"><code>{step.code}</code></pre>
            <div className="step-nav">
              <button type="button" className="btn" disabled={stepIndex <= 0} onClick={() => setStepIndex((value) => Math.max(0, value - 1))}>Sebelumnya</button>
              <button type="button" className="btn primary" disabled={stepIndex >= WALKTHROUGH_STEPS.length - 1} onClick={() => setStepIndex((value) => Math.min(WALKTHROUGH_STEPS.length - 1, value + 1))}>Berikutnya</button>
            </div>
          </aside>
        </div>
      </section>

      <section className="card dsu-card">
        <div className="section-head">
          <div>
            <h2>Trace Manual</h2>
            <p>Contoh ini menunjukkan bagaimana parent array berubah setelah setiap operasi.</p>
          </div>
        </div>
        <div className="dsu-trace-table-wrap">
          <table className="dsu-trace-table">
            <thead>
              <tr>
                <th>Operasi</th>
                <th>Parent Array</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {MANUAL_TRACE.map((row) => (
                <tr key={row.op}>
                  <td>{row.op}</td>
                  <td><code>{row.parent}</code></td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card builder-card dsu-card">
        <div className="section-head">
          <div>
            <h2>Interactive Disjoint Set Lab</h2>
            <p>Tulis operasi sederhana, lalu lihat parent array, rank, size, dan log prosesnya.</p>
          </div>
          <label className="dsu-toggle">
            <input type="checkbox" checked={compress} onChange={(event) => setCompress(event.target.checked)} />
            Path compression
          </label>
        </div>

        <div className="builder-grid dsu-builder-grid">
          <aside className="panel">
            <h3>Input Operasi</h3>
            <label className="label">Jumlah elemen (2 sampai 12)</label>
            <input type="text" value={countInput} onChange={(event) => setCountInput(event.target.value)} />
            <label className="label">Operasi</label>
            <textarea className="dsu-ops-editor" value={opsInput} onChange={(event) => setOpsInput(event.target.value)} />
            <div className="code-help">
              <code>union 0 1</code>
              <code>find 3</code>
              <code>same 0 3</code>
            </div>
            <div className="rbt-presets">
              <button type="button" className="btn" onClick={() => setOpsInput(DEFAULT_OPS)}>Contoh Dasar</button>
              <button type="button" className="btn" onClick={() => setOpsInput("union 0 1\nunion 1 2\nunion 2 3\nfind 3\nsame 0 3")}>Compression</button>
              <button type="button" className="btn ghost" onClick={() => setOpsInput("")}>Clear</button>
            </div>
          </aside>

          <div className="canvas-panel dsu-canvas-panel">
            <DisjointSetDiagram parent={result.parent} rank={result.rank} />
            <ParentTable parent={result.parent} rank={result.rank} size={result.size} />
          </div>

          <aside className="panel dark">
            <h3>Output</h3>
            <div className="stats-grid compact-stats">
              <div className="stat"><span>Set Aktif</span><strong>{Object.keys(getGroups(result.parent)).length}</strong></div>
              <div className="stat"><span>Elemen</span><strong>{count}</strong></div>
            </div>
            {result.errors.length ? <ul className="log-list error-list">{result.errors.map((error) => <li key={error}>{error}</li>)}</ul> : <p className="muted">Operasi valid untuk visualizer ini.</p>}
            <h3>Trace</h3>
            <ul className="log-list trace-list">{result.logs.slice(-10).map((log, index) => <li key={`${log}-${index}`}>{log}</li>)}</ul>
          </aside>
        </div>
      </section>

      <section className="card dsu-card">
        <div className="section-head">
          <div>
            <h2>Variasi Implementasi</h2>
            <p>Semua variasi mengejar tujuan yang sama: union dan find cepat, tetapi tradeoff-nya berbeda.</p>
          </div>
        </div>
        <div className="dsu-reading-grid dsu-variant-grid">
          {IMPLEMENTATION_VARIANTS.map((item) => (
            <article key={item.title} className="dsu-reading-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card dsu-card">
        <div className="section-head">
          <div>
            <h2>Contoh Graph: Deteksi Cycle</h2>
            <p>Disjoint Set sering dipakai di graph tidak berarah. Edge diproses satu per satu; jika dua endpoint sudah satu root, edge baru membuat cycle.</p>
          </div>
          <span className="step-badge dsu-badge">{edgeLimit} edge diproses</span>
        </div>
        <input
          type="range"
          min={1}
          max={GRAPH_EDGES.length}
          value={edgeLimit}
          onChange={(event) => setEdgeLimit(Number(event.target.value))}
          className="rotation-range"
        />
        <div className="dsu-graph-layout">
          <div className="panel">
            <h3>Urutan Edge</h3>
            <div className="dsu-edge-list">
              {GRAPH_EDGES.map(([a, b], index) => {
                const isRejected = graphResult.rejected.some(([x, y]) => x === a && y === b);
                return (
                  <span key={`${a}-${b}`} className={index < edgeLimit ? (isRejected ? "rejected" : "accepted") : ""}>
                    {a}-{b}
                  </span>
                );
              })}
            </div>
            <p className="muted">Hijau berarti edge diterima. Merah berarti edge ditolak karena root endpoint sama.</p>
          </div>
          <div className="canvas-panel dsu-canvas-panel">
            <GraphCycleCanvas edgeLimit={edgeLimit} accepted={graphResult.accepted} rejected={graphResult.rejected} />
          </div>
          <div className="canvas-panel dsu-canvas-panel">
            <DisjointSetDiagram parent={graphResult.parent} rank={graphResult.rank} />
          </div>
          <aside className="panel dark">
            <h3>Trace Graph</h3>
            <ul className="log-list trace-list">{graphResult.logs.slice(-8).map((log, index) => <li key={`${log}-${index}`}>{log}</li>)}</ul>
          </aside>
        </div>
      </section>

      <section className="card dsu-card">
        <div className="section-head">
          <div>
            <h2>Kesalahan Umum</h2>
            <p>Bagian ini penting karena bug Disjoint Set biasanya kecil, tetapi efeknya membuat seluruh komponen salah.</p>
          </div>
        </div>
        <div className="dsu-mistake-list">
          {COMMON_MISTAKES.map((item, index) => (
            <article key={item} className="dsu-mistake">
              <span>{index + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card dsu-card">
        <div className="section-head">
          <div>
            <h2>Kompleksitas dan Kegunaan</h2>
            <p>Gabungan path compression dan union by rank membuat Disjoint Set sangat cepat untuk data besar.</p>
          </div>
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
        <div className="rbt-case-layout dsu-usage-layout">
          <div className="panel">
            <h3>Kapan Dipakai</h3>
            <ul className="rotation-bullet-list">{APPLICATIONS.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <aside className="panel dark">
            <h3>Pola Implementasi</h3>
            <pre className="source-code-block source-code-block-small dsu-code-snippet"><code>{`int find(int x) {
  if (parent[x] != x)
    parent[x] = find(parent[x]);
  return parent[x];
}

void unionSet(int a, int b) {
  int ra = find(a), rb = find(b);
  if (ra == rb) return;
  if (rank[ra] < rank[rb]) parent[ra] = rb;
  else if (rank[ra] > rank[rb]) parent[rb] = ra;
  else {
    parent[rb] = ra;
    rank[ra]++;
  }
}`}</code></pre>
          </aside>
        </div>
      </section>

      <section className="card dsu-card">
        <div className="section-head">
          <div>
            <h2>Latihan Pemahaman</h2>
            <p>Gunakan lab interaktif di atas untuk mengecek jawaban latihan ini.</p>
          </div>
        </div>
        <ol className="dsu-exercise-list">
          {EXERCISES.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </section>
    </main>
  );
}
