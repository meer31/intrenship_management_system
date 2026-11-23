import { CompletionReport, User, Student, ReportStatus } from '../types';
import { mockStorage } from '../mocks/mockStorage';

export const reportService = {
  async getAll(): Promise<CompletionReport[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockStorage.getReports();
  },

  async getByDepartmentId(departmentId: string): Promise<CompletionReport[]> {
    const list = await this.getAll();
    return list.filter((r) => r.departmentId === departmentId);
  },

  async getByStudentId(studentId: string): Promise<CompletionReport[]> {
    const list = await this.getAll();
    return list.filter((r) => r.studentId === studentId);
  },

  async getById(id: string): Promise<CompletionReport | undefined> {
    const list = await this.getAll();
    return list.find((r) => r.id === id);
  },

  async submitReport(data: {
    applicationId: string;
    student: User | Student;
    internshipTitle: string;
    companyName: string;
    reportSummary: string;
    fileName: string;
    fileSize: string;
  }): Promise<CompletionReport> {
    await new Promise((r) => setTimeout(r, 400));
    return mockStorage.submitReport(data);
  },

  async reviewReport(
    reportId: string,
    status: ReportStatus,
    grade: 'Satisfactory' | 'Unsatisfactory' | 'Excellent',
    remarks: string,
    reviewerName: string
  ): Promise<CompletionReport> {
    await new Promise((r) => setTimeout(r, 300));
    return mockStorage.reviewReport(reportId, status, grade, remarks, reviewerName);
  },
};
