"use client";
import { useEffect, useState } from "react";
import { fetchTodos, addTodo as apiAddTodo, toggleTodo as apiToggleTodo, deleteTodo as apiDeleteTodo, Todo } from "../components/api";

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
      className="flex flex-col items-center min-h-screen py-10"
      style={{ background: "var(--background)" }}
    >
      <h1
        className="text-3xl mb-8 tracking-widest"
        style={{
          color: "var(--accent)",
          textShadow: "2px 2px 0 #4a4e69, 4px 4px 0 #22223b",
          border: "var(--pixel-border)",
          boxShadow: "var(--pixel-shadow)",
          padding: "16px 32px",
          background: "#1a1a2e",
          borderRadius: 0,
        }}
      >
        ToDo List
      </h1>
      <div
        className="flex gap-2 mb-6 w-full max-w-md"
        style={{
          border: "var(--pixel-border)",
          boxShadow: "var(--pixel-shadow)",
          background: "#22223b",
          padding: 8,
        }}
      >
        <input
          className="flex-1 px-4 py-2 text-base border-none outline-none bg-[#c9ada7] text-[#22223b] placeholder:text-[#4a4e69]"
          style={{
            fontSize: 14,
            border: "var(--pixel-border)",
            boxShadow: "var(--pixel-shadow)",
            borderRadius: 0,
          }}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task..."
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          disabled={loading}
        />
        <button
          className="px-4 py-2 text-white transition"
          style={{
            background: "var(--primary)",
            border: "var(--pixel-border)",
            boxShadow: "var(--pixel-shadow)",
            borderRadius: 0,
            fontWeight: "bold",
            color: "#fff",
            textShadow: "2px 2px 0 #4a4e69",
          }}
          onClick={handleAdd}
          disabled={loading}
        >
          Add
        </button>
      </div>
      <ul className="w-full max-w-md space-y-2">
        {loading && todos.length === 0 && (
          <li
            className="text-center"
            style={{
              color: "#bfc0c0",
              background: "#1a1a2e",
              border: "var(--pixel-border)",
              boxShadow: "var(--pixel-shadow)",
              padding: 16,
              borderRadius: 0,
            }}
          >
            Loading...
          </li>
        )}
        {!loading && todos.length === 0 && (
          <li
            className="text-center"
            style={{
              color: "#bfc0c0",
              background: "#1a1a2e",
              border: "var(--pixel-border)",
              boxShadow: "var(--pixel-shadow)",
              padding: 16,
              borderRadius: 0,
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
              background: todo.completed ? "#9a8c98" : "#f2e9e4",
              color: todo.completed ? "#4a4e69" : "#22223b",
              border: "var(--pixel-border)",
              boxShadow: "var(--pixel-shadow)",
              padding: 12,
              borderRadius: 0,
              textDecoration: todo.completed ? "line-through" : "none",
              opacity: todo.completed ? 0.6 : 1,
              cursor: "pointer",
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
                background: "#fff0f3",
                border: "var(--pixel-border)",
                boxShadow: "var(--pixel-shadow)",
                borderRadius: 0,
                fontWeight: "bold",
                fontSize: 18,
                width: 32,
                height: 32,
                lineHeight: "28px",
                textAlign: "center",
                padding: 0,
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
  );
}
