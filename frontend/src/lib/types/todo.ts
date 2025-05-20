export type Todo = {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
};

export type CreateTodoInput = {
  text: string;
};

export type UpdateTodoInput = {
  completed: boolean;
};

export type ApiResponse<T> = {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
};

export type TodoResponse = ApiResponse<Todo>;
export type TodoListResponse = ApiResponse<Todo[]>; 