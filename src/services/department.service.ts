import { Department } from '../types';
import { mockStorage } from '../mocks/mockStorage';

export const departmentService = {
  async getAll(): Promise<Department[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockStorage.getDepartments();
  },

  async getById(id: string): Promise<Department | undefined> {
    const list = await this.getAll();
    return list.find((d) => d.id === id);
  },

  async save(department: Partial<Department> & { name: string; code: string }): Promise<Department> {
    await new Promise((r) => setTimeout(r, 300));
    return mockStorage.saveDepartment(department);
  },

  async delete(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    mockStorage.deleteDepartment(id);
  },
};
