export interface LookupDto {
  id: number;
  name: string;
}

export interface PagedResult<T> {
  items: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}