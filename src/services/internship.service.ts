import { Internship } from '../types';
import { mockStorage } from '../mocks/mockStorage';

export const internshipService = {
  async getAll(): Promise<Internship[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockStorage.getInternships();
  },

  async getPublished(): Promise<Internship[]> {
    const list = await this.getAll();
    return list.filter((i) => i.isPublished && i.status !== 'ARCHIVED');
  },

  async getForDepartment(deptId: string): Promise<Internship[]> {
    const list = await this.getAll();
    return list.filter((i) => i.eligibleDepartmentIds.includes(deptId));
  },

  async getById(id: string): Promise<Internship | undefined> {
    const list = await this.getAll();
    return list.find((i) => i.id === id);
  },

  async save(internship: Partial<Internship> & { title: string; companyName: string }): Promise<Internship> {
    await new Promise((r) => setTimeout(r, 300));
    return mockStorage.saveInternship(internship);
  },

  async togglePublish(id: string): Promise<Internship | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    return mockStorage.toggleInternshipPublish(id);
  },

  async delete(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    mockStorage.deleteInternship(id);
  },
};
