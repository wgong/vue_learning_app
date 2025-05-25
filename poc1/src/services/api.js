// src/services/api.js

// Mock data to simulate fetching from a backend
const mockLessons = [
  { id: 1, title: 'Introduction to Vue 3', content: 'Learn the basics of Vue.js 3 components and reactivity.', progress: 0 },
  { id: 2, title: 'Pinia State Management', content: 'Deep dive into Pinia stores, state, getters, and actions.', progress: 0 },
  { id: 3, title: 'Offline-First with IndexedDB', content: 'Understand how to build applications that work offline.', progress: 0 },
];

const mockNotes = []; // To store mock notes if needed

export const apiClient = {
  // Simulates fetching lessons from a server
  get: async (url) => {
    return new Promise(resolve => {
      setTimeout(() => {
        if (url === '/lessons') {
          resolve(mockLessons);
        } else {
          resolve([]); // Or throw an error for unknown URLs
        }
      }, 500); // Simulate network delay
    });
  },

  // Simulates posting data to a server
  post: async (url, data) => {
    return new Promise(resolve => {
      setTimeout(() => {
        if (url.startsWith('/lessons/') && url.endsWith('/progress')) {
          const lessonId = parseInt(url.split('/')[2]);
          const lesson = mockLessons.find(l => l.id === lessonId);
          if (lesson) {
            lesson.progress = data.progress;
          }
          resolve({ success: true, message: 'Progress updated' });
        } else if (url === '/notes') {
            const newNote = { ...data, id: mockNotes.length + 1 };
            mockNotes.push(newNote);
            resolve(newNote);
        } else {
            resolve({ success: false, message: 'Unknown POST endpoint' });
        }
      }, 500);
    });
  }
};
