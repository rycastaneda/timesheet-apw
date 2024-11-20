export interface TimesheetData {
  id: number;
  startTime: Date;
  completionTime: Date;
  email: string;
  name: string;
  date: Date;
  type: string;
  remarks: string;
}

export interface MergedTimesheetData extends TimesheetData {
  timeIn: Date | null;
  timeOut: Date | null;
}
