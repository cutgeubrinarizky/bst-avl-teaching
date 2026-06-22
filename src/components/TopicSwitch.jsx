export default function TopicSwitch({ topic, setTopic }) {
  return (
    <nav className="topic-switch" aria-label="Pilih materi tree">
      <span className="topic-switch-label">Materi:</span>
      <button
        type="button"
        className={topic === "avl" ? "active" : ""}
        onClick={() => setTopic("avl")}
      >
        AVL Tree
      </button>
      <button
        type="button"
        className={topic === "rbt" ? "active" : ""}
        onClick={() => setTopic("rbt")}
      >
        Red-Black Tree
      </button>
      <button
        type="button"
        className={topic === "btree" ? "active" : ""}
        onClick={() => setTopic("btree")}
      >
        B-Tree
      </button>
      <button
        type="button"
        className={topic === "heap" ? "active" : ""}
        onClick={() => setTopic("heap")}
      >
        Heap
      </button>
      <button
        type="button"
        className={topic === "dsu" ? "active" : ""}
        onClick={() => setTopic("dsu")}
      >
        Disjoint Set
      </button>
    </nav>
  );
}
