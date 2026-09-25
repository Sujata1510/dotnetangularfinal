export interface ApiPage<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface ProjectRecord {
  projectID: number;
  projectCode: string;
  projectName: string;
  clientName: string;
  departmentName: string;
  startDate: string;
  endDate: string | null;
  budget: number;
  status: string;
}

export interface EmployeeRecord {
  employeeID: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  hireDate: string;
  isActive: boolean;
  departmentID: number;
  departmentName: string;
  positionID: number;
  positionTitle: string;
  locationID: number;
  locationName: string;
}

export interface AssignmentRecord {
  employeeID: number;
  employeeCode: string;
  employeeName: string;
  projectID: number;
  projectName: string;
  role: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string | null;
}

export interface UserRecord {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdDate: string;
}

export type BoardBucket = 'todo' | 'doing' | 'done';

export function boardBucket(status: string): BoardBucket {
  const value = status.toLowerCase();
  if (value.includes('complete') || value.includes('closed') || value.includes('done')) {
    return 'done';
  }
  if (value.includes('active') || value.includes('progress') || value.includes('doing')) {
    return 'doing';
  }
  return 'todo';
}

export function statusTone(status: string): 'on-track' | 'at-risk' | 'off-track' {
  const value = status.toLowerCase();
  if (value.includes('hold') || value.includes('risk') || value.includes('delay')) {
    return 'at-risk';
  }
  if (value.includes('cancel') || value.includes('block')) {
    return 'off-track';
  }
  return 'on-track';
}
