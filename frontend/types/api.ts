export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field?: string; message: string }[];
}
