import { Student } from '../types';
import { mockStorage } from '../mocks/mockStorage';

export const studentService = {
  async getAll(): Promise<Student[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockStorage.getStudents();
  },

  async getByDepartment(deptId: string): Promise<Student[]> {
    const list = await this.getAll();
    return list.filter((s) => s.departmentId === deptId);
  },

  async getById(id: string): Promise<Student | undefined> {
    const list = await this.getAll();
    return list.find((s) => s.id === id);
  },

  async save(data: Partial<Student> & { fullName: string; rollNumber: string; email: string; departmentId: string; batchId: string }): Promise<Student> {
    await new Promise((r) => setTimeout(r, 300));
    return mockStorage.saveStudent(data);
  },

  async toggleStatus(id: string): Promise<Student | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    return mockStorage.toggleStudentStatus(id);
  },
};
