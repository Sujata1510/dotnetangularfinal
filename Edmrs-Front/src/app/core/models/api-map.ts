import { LookupDto } from './common.model';
import { ApiPage, AssignmentRecord, EmployeeRecord, ProjectRecord } from './warehouse.model';

type Row = Record<string, unknown>;

export function asLookupList(raw: unknown): LookupDto[] {
  return asArray(raw).map((row) => ({
    id: num(row, 'id', 'Id'),
    name: text(row, 'name', 'Name')
  }));
}

export function asProjectPage(raw: unknown): ApiPage<ProjectRecord> {
  return asPage(raw, asProject);
}

export function asEmployeePage(raw: unknown): ApiPage<EmployeeRecord> {
  return asPage(raw, asEmployee);
}

export function asAssignments(raw: unknown): AssignmentRecord[] {
  return asArray(raw).map(asAssignment);
}

function asProject(row: Row): ProjectRecord {
  return {
    projectID: num(row, 'projectID', 'ProjectID'),
    projectCode: text(row, 'projectCode', 'ProjectCode'),
    projectName: text(row, 'projectName', 'ProjectName'),
    clientName: text(row, 'clientName', 'ClientName'),
    departmentName: text(row, 'departmentName', 'DepartmentName'),
    startDate: text(row, 'startDate', 'StartDate'),
    endDate: text(row, 'endDate', 'EndDate') || null,
    budget: num(row, 'budget', 'Budget'),
    status: text(row, 'status', 'Status')
  };
}

function asEmployee(row: Row): EmployeeRecord {
  const firstName = text(row, 'firstName', 'FirstName');
  const lastName = text(row, 'lastName', 'LastName');
  return {
    employeeID: num(row, 'employeeID', 'EmployeeID'),
    employeeCode: text(row, 'employeeCode', 'EmployeeCode'),
    firstName,
    lastName,
    fullName: text(row, 'fullName', 'FullName') || `${firstName} ${lastName}`.trim(),
    email: text(row, 'email', 'Email'),
    phone: text(row, 'phone', 'Phone'),
    hireDate: text(row, 'hireDate', 'HireDate'),
    isActive: Boolean(row['isActive'] ?? row['IsActive']),
    departmentID: num(row, 'departmentID', 'DepartmentID'),
    departmentName: text(row, 'departmentName', 'DepartmentName'),
    positionID: num(row, 'positionID', 'PositionID'),
    positionTitle: text(row, 'positionTitle', 'PositionTitle'),
    locationID: num(row, 'locationID', 'LocationID'),
    locationName: text(row, 'locationName', 'LocationName')
  };
}

function asAssignment(row: Row): AssignmentRecord {
  return {
    employeeID: num(row, 'employeeID', 'EmployeeID'),
    employeeCode: text(row, 'employeeCode', 'EmployeeCode'),
    employeeName: text(row, 'employeeName', 'EmployeeName'),
    projectID: num(row, 'projectID', 'ProjectID'),
    projectName: text(row, 'projectName', 'ProjectName'),
    role: text(row, 'role', 'Role'),
    allocationPercentage: num(row, 'allocationPercentage', 'AllocationPercentage'),
    startDate: text(row, 'startDate', 'StartDate'),
    endDate: text(row, 'endDate', 'EndDate') || null
  };
}

function asPage<T>(raw: unknown, mapItem: (row: Row) => T): ApiPage<T> {
  const body = (raw ?? {}) as Row;
  const items = asArray(body['items'] ?? body['Items']).map(mapItem);
  const pageSize = num(body, 'pageSize', 'PageSize') || items.length || 1;
  const totalCount = num(body, 'totalCount', 'TotalCount') || items.length;
  const totalPages = num(body, 'totalPages', 'TotalPages') || Math.ceil(totalCount / pageSize);
  return {
    items,
    totalCount,
    pageIndex: num(body, 'pageIndex', 'PageIndex') || 1,
    pageSize,
    totalPages
  };
}

function asArray(raw: unknown): Row[] {
  return Array.isArray(raw) ? (raw as Row[]) : [];
}

function text(row: Row, camel: string, pascal: string): string {
  const value = row[camel] ?? row[pascal];
  return value == null ? '' : String(value);
}

function num(row: Row, camel: string, pascal: string): number {
  const value = Number(row[camel] ?? row[pascal] ?? 0);
  return Number.isFinite(value) ? value : 0;
}
