export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

export interface ApiError {
  status: number;
  data: {
    success: false;
    message: string;
    errors?: Record<string, string>;
  };
}
