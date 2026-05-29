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
    </nav>
  );
}
