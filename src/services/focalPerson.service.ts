import { FocalPerson } from '../types';
import { mockStorage } from '../mocks/mockStorage';

export const focalPersonService = {
  async getAll(): Promise<FocalPerson[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockStorage.getFocalPersons();
  },

  async getById(id: string): Promise<FocalPerson | undefined> {
    const list = await this.getAll();
    return list.find((fp) => fp.id === id);
  },

  async save(data: Partial<FocalPerson> & { fullName: string; email: string; assignedDepartmentId: string }): Promise<FocalPerson> {
    await new Promise((r) => setTimeout(r, 300));
    return mockStorage.saveFocalPerson(data);
  },

  async toggleStatus(id: string): Promise<FocalPerson | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    return mockStorage.toggleFocalPersonStatus(id);
  },
};
