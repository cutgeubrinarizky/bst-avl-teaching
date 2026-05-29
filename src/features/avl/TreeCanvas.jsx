import { useMemo } from "react";
import { getLayout } from "./avlLogic";

export default function TreeCanvas({ root, selected, onSelect, mode, highlights = {}, layoutOptions = {} }) {
  const { nodes, edges, width, height } = useMemo(
    () => getLayout(root, layoutOptions),
    [root, layoutOptions],
  );

  if (!root) {
    return <div className="canvas-empty">Belum ada node. Tambahkan angka dulu.</div>;
  }

  const defaultR = layoutOptions.nodeR ?? 22;

  return (
    <div className="tree-scroll">
      <svg width={width} height={height} className="tree-svg">
        {edges.map((edge) => {
          const from = nodes.find((n) => n.value === edge.from);
          const to = nodes.find((n) => n.value === edge.to);
          if (!from || !to) return null;
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className="tree-edge"
            />
          );
        })}
        {nodes.map((node) => {
          const active = selected?.value === node.value;
          const role = highlights[node.value];
          const bad = mode === "avl" && Math.abs(node.bf) > 1 && !role;
          const r = node.r ?? defaultR;
          const cls = ["tree-node"];
          if (active) cls.push("active");
          if (bad) cls.push("bad");
          if (role === "pivot") cls.push("hl-pivot");
          if (role === "child") cls.push("hl-child");
          if (role === "grand") cls.push("hl-grand");

          return (
            <g key={node.id} onClick={() => onSelect(node)} className="tree-node-group">
              <circle cx={node.x} cy={node.y} r={r} className={cls.join(" ")} />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                className="tree-node-text"
                style={{ fontSize: r > 22 ? 13 : 14 }}
              >
                {node.value}
              </text>
              <text x={node.x} y={node.y - r - 10} textAnchor="middle" className="tree-node-meta">
                BF {node.bf}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
