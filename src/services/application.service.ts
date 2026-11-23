import { Application, Student, Internship, FocalPerson, User } from '../types';
import { mockStorage } from '../mocks/mockStorage';

export const applicationService = {
  async getAll(): Promise<Application[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockStorage.getApplications();
  },

  async getByStudentId(studentId: string): Promise<Application[]> {
    const list = await this.getAll();
    return list.filter((a) => a.studentId === studentId);
  },

  async getByDepartmentId(departmentId: string): Promise<Application[]> {
    const list = await this.getAll();
    return list.filter((a) => a.departmentId === departmentId);
  },

  async getById(id: string): Promise<Application | undefined> {
    const list = await this.getAll();
    return list.find((a) => a.id === id);
  },

  async create(data: {
    student: Student;
    internship: Internship;
    statementOfPurpose?: string;
    resumeFileName?: string;
  }): Promise<Application> {
    await new Promise((r) => setTimeout(r, 300));
    return mockStorage.createApplication(data);
  },

  async focalPersonReview(
    applicationId: string,
    action: 'FORWARD' | 'REJECT',
    remarks: string,
    reviewer: FocalPerson | User
  ): Promise<Application> {
    await new Promise((r) => setTimeout(r, 300));
    return mockStorage.focalPersonReview(applicationId, action, remarks, reviewer);
  },

  async directorReview(
    applicationId: string,
    action: 'APPROVE' | 'REJECT',
    remarks: string,
    reviewer: User
  ): Promise<Application> {
    await new Promise((r) => setTimeout(r, 300));
    return mockStorage.directorReview(applicationId, action, remarks, reviewer);
  },
};
