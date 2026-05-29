import { useState } from "react";
import TopicSwitch from "./components/TopicSwitch";
import AvlTeachingApp from "./features/avl/AvlTeachingApp";
import RedBlackTree from "./features/rbt/RedBlackTree";
import "./App.css";

export default function App() {
  const [topic, setTopic] = useState("avl");

  return (
    <>
      <TopicSwitch topic={topic} setTopic={setTopic} />
      {topic === "rbt" ? <RedBlackTree /> : <AvlTeachingApp />}
    </>
  );
}
