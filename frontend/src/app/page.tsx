"use client";
import { useEffect, useState } from "react";
import { fetchTodos, addTodo as apiAddTodo, toggleTodo as apiToggleTodo, deleteTodo as apiDeleteTodo, Todo } from "../components/api";
import CuteCharacter from "./components/CuteCharacter";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 初回ロードでAPIから取得
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchTodos();
        setTodos(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAdd = async () => {
    if (input.trim() === "") return;
    setLoading(true);
    try {
      const todo = await apiAddTodo(input.trim());
      setTodos((prev) => [todo, ...prev]);
      setInput("");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    setLoading(true);
    try {
      const todo = await apiToggleTodo(id, !completed);
      setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await apiDeleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center min-h-screen py-10 relative"
      style={{ 
        background: "linear-gradient(to bottom, #FFF5F2 0%, #FFE4EC 100%)",
        overflow: "hidden"
      }}
    >
      {/* TODOリストのコンテナ */}
      <div className="w-full max-w-md z-10">
        <h1
          className="text-3xl mb-8 tracking-widest text-center"
          style={{
            color: "var(--foreground)",
            textShadow: "2px 2px 0 var(--primary)",
            border: "var(--pixel-border)",
            boxShadow: "var(--pixel-shadow)",
            padding: "16px 32px",
            background: "var(--background)",
            borderRadius: "8px",
          }}
        >
          ToDo List
        </h1>
        <div
          className="flex gap-2 mb-6 w-full"
          style={{
            border: "var(--pixel-border)",
            boxShadow: "var(--pixel-shadow)",
            background: "var(--background)",
            padding: 8,
            borderRadius: "8px",
          }}
        >
          <input
            className="flex-1 px-4 py-2 text-base border-none outline-none"
            style={{
              fontSize: 14,
              border: "var(--pixel-border)",
              background: "var(--primary)",
              color: "var(--foreground)",
              boxShadow: "var(--pixel-shadow)",
              borderRadius: "4px",
              opacity: loading ? 0.7 : 1,
            }}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            disabled={loading}
          />
          <button
            className="px-4 py-2 transition"
            style={{
              background: "var(--secondary)",
              border: "var(--pixel-border)",
              boxShadow: "var(--pixel-shadow)",
              borderRadius: "4px",
              fontWeight: "bold",
              color: "var(--foreground)",
              textShadow: "1px 1px 0 var(--background)",
              opacity: loading ? 0.7 : 1,
            }}
            onClick={handleAdd}
            disabled={loading}
          >
            Add
          </button>
        </div>
        <ul className="w-full space-y-2">
          {loading && todos.length === 0 && (
            <li
              className="text-center"
              style={{
                color: "var(--foreground)",
                background: "var(--background)",
                border: "var(--pixel-border)",
                boxShadow: "var(--pixel-shadow)",
                padding: 16,
                borderRadius: "8px",
                opacity: 0.7,
              }}
            >
              Loading...
            </li>
          )}
          {!loading && todos.length === 0 && (
            <li
              className="text-center"
              style={{
                color: "var(--foreground)",
                background: "var(--background)",
                border: "var(--pixel-border)",
                boxShadow: "var(--pixel-shadow)",
                padding: 16,
                borderRadius: "8px",
              }}
            >
              No tasks yet.
            </li>
          )}
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between"
              style={{
                background: todo.completed ? "var(--secondary)" : "var(--background)",
                color: "var(--foreground)",
                border: "var(--pixel-border)",
                boxShadow: "var(--pixel-shadow)",
                padding: 12,
                borderRadius: "8px",
                textDecoration: todo.completed ? "line-through" : "none",
                opacity: todo.completed ? 0.8 : 1,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <span
                className="flex-1 select-none"
                onClick={() => handleToggle(todo.id, todo.completed)}
              >
                {todo.text}
              </span>
              <button
                className="ml-4"
                style={{
                  color: "var(--danger)",
                  background: "var(--background)",
                  border: "var(--pixel-border)",
                  boxShadow: "var(--pixel-shadow)",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  fontSize: 18,
                  width: 32,
                  height: 32,
                  lineHeight: "28px",
                  textAlign: "center",
                  padding: 0,
                  opacity: loading ? 0.7 : 1,
                }}
                onClick={() => handleDelete(todo.id)}
                aria-label="Delete"
                disabled={loading}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 猫キャラクター */}
      <CuteCharacter />

      {/* 操作説明 */}
      <div style={{
        position: "fixed",
        bottom: 16,
        left: 0,
        width: "100%",
        textAlign: "center",
        color: "#666",
        fontSize: 14,
        zIndex: 100,
      }}>
        ←→キーで移動・スペースでジャンプ
      </div>
    </div>
  );
}
