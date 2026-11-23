import { User, Role } from '../types';
import { mockStorage } from '../mocks/mockStorage';
import { DEMO_USERS } from '../mocks/mockData';

export const authService = {
  async login(email: string, _password: string):Promise<{ user: User; token: string }> {
    // Artificial latency for realistic loading experience
    await new Promise((resolve) => setTimeout(resolve, 500));

    const normalizedEmail = email.toLowerCase().trim();

    // Check demo accounts
    let matchedUser: User | undefined;
    if (normalizedEmail.includes('director') || normalizedEmail.includes('admin')) {
      matchedUser = DEMO_USERS.admin;
    } else if (normalizedEmail.includes('focal.se') || normalizedEmail.includes('aisha')) {
      matchedUser = DEMO_USERS.focal_se;
    } else if (normalizedEmail.includes('focal') || normalizedEmail.includes('tariq')) {
      matchedUser = DEMO_USERS.focal_cs;
    } else if (normalizedEmail.includes('student') || normalizedEmail.includes('hamza')) {
      matchedUser = DEMO_USERS.student;
    } else {
      // Check if student exists in mock students
      const students = mockStorage.getStudents();
      const std = students.find((s) => s.email.toLowerCase() === normalizedEmail);
      if (std) {
        matchedUser = {
          id: std.id,
          name: std.fullName,
          email: std.email,
          role: 'STUDENT',
          departmentId: std.departmentId,
          departmentName: std.departmentName,
          rollNumber: std.rollNumber,
          batchId: std.batchId,
          batchName: std.batchName,
          cellNumber: std.cellNumber,
          cnic: std.cnic,
        };
      }
    }

    if (!matchedUser) {
      // Default to student if not recognized
      matchedUser = DEMO_USERS.student;
    }

    mockStorage.setCurrentUser(matchedUser);
    return {
      user: matchedUser,
      token: `jwt-${matchedUser.role.toLowerCase()}-${Date.now()}`,
    };
  },

  async logout(): Promise<void> {
    mockStorage.clearAuth();
  },

  getCurrentUser(): User | null {
    return mockStorage.getCurrentUser();
  },

  async switchRole(role: Role, departmentCode?: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    let targetUser: User;
    if (role === 'ADMIN') {
      targetUser = DEMO_USERS.admin;
    } else if (role === 'FOCAL_PERSON') {
      targetUser = departmentCode === 'SE' ? DEMO_USERS.focal_se : DEMO_USERS.focal_cs;
    } else {
      targetUser = DEMO_USERS.student;
    }
    mockStorage.setCurrentUser(targetUser);
    return targetUser;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const current = mockStorage.getCurrentUser();
    const updated = { ...current, ...updates };
    mockStorage.setCurrentUser(updated);

    // If student, update student record as well
    if (current.role === 'STUDENT') {
      const students = mockStorage.getStudents();
      const std = students.find((s) => s.id === current.id);
      if (std) {
        if (updates.cellNumber) std.cellNumber = updates.cellNumber;
        if (updates.email) std.email = updates.email;
        mockStorage.saveStudent(std);
      }
    }

    return updated;
  },
};
