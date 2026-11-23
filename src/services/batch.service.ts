import { Batch } from '../types';
import { mockStorage } from '../mocks/mockStorage';

export const batchService = {
  async getAll(): Promise<Batch[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockStorage.getBatches();
  },

  async getById(id: string): Promise<Batch | undefined> {
    const list = await this.getAll();
    return list.find((b) => b.id === id);
  },

  async save(batch: Partial<Batch> & { name: string; startYear: number; endYear: number }): Promise<Batch> {
    await new Promise((r) => setTimeout(r, 300));
    return mockStorage.saveBatch(batch);
  },

  async delete(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    mockStorage.deleteBatch(id);
  },
};
