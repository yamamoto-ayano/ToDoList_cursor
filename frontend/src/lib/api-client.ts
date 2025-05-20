import type {
  Todo,
  TodoResponse,
  TodoListResponse,
  CreateTodoInput,
  UpdateTodoInput,
  ApiResponse,
} from '../../../../shared/types/todo';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://floral-truth-ed9d.daigaku-150207.workers.dev';

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.error?.message || 'An unexpected error occurred',
      response.status,
      data.error?.code
    );
  }

  return data;
}

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_BASE}/todos`, { 
    cache: 'no-store',
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await handleResponse<TodoListResponse>(response);
  return data.data ?? [];
}

export async function addTodo(input: CreateTodoInput): Promise<Todo> {
  const response = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await handleResponse<TodoResponse>(response);
  if (!data.data) {
    throw new ApiError('Failed to create todo', response.status);
  }
  return data.data;
}

export async function toggleTodo(id: number, completed: boolean): Promise<Todo> {
  const input: UpdateTodoInput = { completed };
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await handleResponse<TodoResponse>(response);
  if (!data.data) {
    throw new ApiError('Failed to update todo', response.status);
  }
  return data.data;
}

export async function deleteTodo(id: number): Promise<{ id: number }> {
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await handleResponse<ApiResponse<{ id: number }>>(response);
  if (!data.data) {
    throw new ApiError('Failed to delete todo', response.status);
  }
  return data.data;
} 