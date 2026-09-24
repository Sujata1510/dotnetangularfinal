export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: number;
  departmentName?: string;
  positionId: number;
  positionName?: string;
  salary: number;
  status: 'Active' | 'Inactive' | 'On Leave';
  hireDate: string;
}

export interface EmployeeFilterParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  departmentId?: number;
}