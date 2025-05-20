const API_BASE = "https://floral-truth-ed9d.daigaku-150207.workers.dev";

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
};

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_BASE}/todos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch todos");
  return await res.json();
}

export async function addTodo(text: string): Promise<Todo> {
  const res = await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to add todo");
  return await res.json();
}

export async function toggleTodo(id: number, completed: boolean): Promise<Todo> {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("Failed to update todo");
  return await res.json();
}

export async function deleteTodo(id: number): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete todo");
  return await res.json();
} 