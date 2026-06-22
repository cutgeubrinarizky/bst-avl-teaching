import { useState } from "react";
import TopicSwitch from "./components/TopicSwitch";
import AvlTeachingApp from "./features/avl/AvlTeachingApp";
import BTreeTeachingApp from "./features/btree/BTreeTeachingApp";
import DisjointSetTeachingApp from "./features/disjoint-set/DisjointSetTeachingApp";
import HeapTeachingApp from "./features/heap/HeapTeachingApp";
import RedBlackTree from "./features/rbt/RedBlackTree";
import "./App.css";

export default function App() {
  const [topic, setTopic] = useState("avl");

  return (
    <>
      <TopicSwitch topic={topic} setTopic={setTopic} />
      {topic === "rbt" ? <RedBlackTree /> : null}
      {topic === "btree" ? <BTreeTeachingApp /> : null}
      {topic === "heap" ? <HeapTeachingApp /> : null}
      {topic === "dsu" ? <DisjointSetTeachingApp /> : null}
      {topic === "avl" ? <AvlTeachingApp /> : null}
    </>
  );
}
