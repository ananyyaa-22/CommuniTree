/**
 * Utility types and helper interfaces for CommuniTree platform
 */

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: Date;
}

// Pagination interface for lists
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Generic filter interface
export interface FilterOptions {
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Location coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Date range filter
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Generic ID type for type safety
export type EntityId = string;

// Component props with children
export interface WithChildren {
  children: React.ReactNode;
}

// Component props with className
export interface WithClassName {
  className?: string;
}

// Loading state wrapper
export interface LoadingState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// Event handler types
export type EventHandler<T = void> = (event: T) => void;
export type AsyncEventHandler<T = void> = (event: T) => Promise<void>;

// Form field types
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
}

// Modal props interface
export interface ModalProps extends WithChildren, WithClassName {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}