export class ImportResultDto {
  success: boolean;
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: ImportErrorDto[];
  message: string;
}

export class ImportErrorDto {
  row: number;
  studentId?: string;
  field?: string;
  error: string;
}
