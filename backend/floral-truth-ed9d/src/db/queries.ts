export const TODO_QUERIES = {
  GET_ALL: 'SELECT * FROM todos ORDER BY id DESC',
  GET_BY_ID: 'SELECT * FROM todos WHERE id = ?',
  CREATE: 'INSERT INTO todos (text, completed) VALUES (?, 0)',
  UPDATE_COMPLETED: 'UPDATE todos SET completed = ? WHERE id = ?',
  DELETE: 'DELETE FROM todos WHERE id = ?',
} as const; 