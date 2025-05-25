// src/stores/learning.js
import { defineStore } from 'pinia';
import { db } from '@/db';                  // Your Dexie instance
import { apiClient } from '@/services/api'; // Your (mock) backend API client

export const useLearningStore = defineStore('learning', {
  state: () => ({
    lessons: [],
    currentLesson: null,
    notesForCurrentLesson: [],
    isLoading: false,
    isOffline: false,
  }),
  actions: {
    async initializeData() {
      this.isLoading = true;
      try {
        // 1. Try to load initial data from IndexedDB
        const localLessons = await db.lessons.toArray();
        if (localLessons.length > 0) {
          this.lessons = localLessons;
          console.log('Lessons loaded from IndexedDB.');
        }

        // 2. (Optional) Check online status and try to sync from backend
        // Note: navigator.onLine is a basic check. For more robust checks, ping an endpoint.
        if (navigator.onLine) {
          this.isOffline = false;
          try {
            const serverLessons = await apiClient.get('/lessons'); // Fetch from backend
            // For a learning app, we'll sync by overwriting if server has more recent/authoritative data
            // Or a more complex merge strategy if updates can happen both ways
            const currentLocalIds = new Set(localLessons.map(l => l.id));
            const newLessons = serverLessons.filter(sl => !currentLocalIds.has(sl.id));
            const updatedLessons = serverLessons.filter(sl => currentLocalIds.has(sl.id));

            await db.lessons.clear(); // For simplicity, re-add all
            await db.lessons.bulkAdd(serverLessons);
            this.lessons = serverLessons; // Update Pinia state
            console.log('Lessons synced from server.');

          } catch (networkError) {
            console.warn('Could not sync with server, potentially offline or server error:', networkError);
            this.isOffline = true;
          }
        } else {
          this.isOffline = true;
          console.log('App is offline, primarily using IndexedDB data.');
        }

      } catch (dbError) {
        console.error('Error initializing data from IndexedDB:', dbError);
      } finally {
        this.isLoading = false;
      }
    },

    async selectLesson(lessonId) {
      this.currentLesson = await db.lessons.get(lessonId);
      this.notesForCurrentLesson = await db.notes.where({ lessonId: lessonId }).toArray();
    },

    async updateLessonProgress(lessonId, progress) {
      try {
        await db.lessons.update(lessonId, { progress });
        // Update Pinia state immediately to reflect in UI
        const lessonIndex = this.lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex > -1) {
          this.lessons[lessonIndex].progress = progress;
        }

        // (Optional) If online, send update to backend
        if (navigator.onLine) {
          try {
             await apiClient.post(`/lessons/${lessonId}/progress`, { progress });
             console.log(`Progress for lesson ${lessonId} synced to server.`);
          } catch (networkError) {
             console.warn('Failed to sync progress to server:', networkError);
             // Here, you might want to mark this lesson's progress as 'pending_sync'
             // in IndexedDB so you can try again later.
          }
        } else {
          console.log('Progress updated locally, will sync when online.');
        }
      } catch (error) {
        console.error('Failed to update lesson progress in IndexedDB:', error);
      }
    },

    async addNote(lessonId, noteText) {
      const newNote = {
        lessonId,
        text: noteText,
        timestamp: Date.now(),
      };
      try {
        const id = await db.notes.add(newNote); // Dexie returns the auto-generated ID
        this.notesForCurrentLesson.push({ ...newNote, id }); // Update Pinia state

        // (Optional) Send to backend
        if (navigator.onLine) {
          try {
            await apiClient.post('/notes', newNote);
            console.log('Note synced to server.');
          } catch (networkError) {
            console.warn('Failed to sync note to server:', networkError);
             // Mark note as 'pending_sync' in IndexedDB
          }
        }
      } catch (error) {
        console.error('Failed to add note to IndexedDB:', error);
      }
    },

    // A simple action to reset all data for testing
    async resetAllData() {
      await db.lessons.clear();
      await db.quizzes.clear();
      await db.notes.clear();
      this.lessons = [];
      this.currentLesson = null;
      this.notesForCurrentLesson = [];
      console.log('All local data cleared.');
      await this.initializeData(); // Re-initialize from server/mock
    }
  },
});
