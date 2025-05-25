<template>
  <main class="home-view">
    <h1>My Learning Path</h1>
    <p v-if="learningStore.isLoading">Loading content...</p>
    <p v-if="learningStore.isOffline" class="status-offline">
      You are currently offline. Content might be outdated.
    </p>
    <p v-else class="status-online">You are online. Data is synced.</p>

    <button @click="learningStore.resetAllData()" class="reset-button">
      Reset All Local Data & Re-sync
    </button>

    <hr />

    <h2>Lessons</h2>
    <ul class="lesson-list">
      <li v-for="lesson in learningStore.lessons" :key="lesson.id" class="lesson-item">
        <a @click="learningStore.selectLesson(lesson.id)" class="lesson-title-link">
          {{ lesson.title }}
        </a>
        <span class="lesson-progress"> - Progress: {{ lesson.progress }}%</span>
        <button @click="learningStore.updateLessonProgress(lesson.id, Math.min(100, lesson.progress + 10))">
          +10%
        </button>
      </li>
    </ul>

    <div v-if="learningStore.currentLesson" class="current-lesson-details">
      <h3>{{ learningStore.currentLesson.title }}</h3>
      <p class="lesson-content">{{ learningStore.currentLesson.content }}</p>

      <div class="note-input-section">
        <textarea v-model="newNoteText" placeholder="Add a note..." class="note-textarea"></textarea>
        <button @click="addCurrentNote()" class="add-note-button">Save Note</button>
      </div>

      <h4 v-if="learningStore.notesForCurrentLesson.length > 0">Your Notes:</h4>
      <p v-else>No notes for this lesson yet.</p>
      <ul class="notes-list">
        <li v-for="note in learningStore.notesForCurrentLesson" :key="note.id" class="note-item">
          {{ note.text }} ({{ new Date(note.timestamp).toLocaleDateString() }})
        </li>
      </ul>
    </div>
    <div v-else class="select-lesson-prompt">
      <p>Select a lesson from the list above to view its details and add notes.</p>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useLearningStore } from '@/stores/learning';

const learningStore = useLearningStore();
const newNoteText = ref('');

// Action to add a note to the currently selected lesson
const addCurrentNote = () => {
  if (learningStore.currentLesson && newNoteText.value.trim()) {
    learningStore.addNote(learningStore.currentLesson.id, newNoteText.value.trim());
    newNoteText.value = ''; // Clear input after adding
  }
};

onMounted(() => {
  learningStore.initializeData(); // Load data when component mounts
});
</script>

<style scoped>
.home-view {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
}

h1, h2, h3, h4 {
  color: #333;
}

.status-offline {
  color: orange;
  font-weight: bold;
}

.status-online {
  color: green;
}

.reset-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.reset-button:hover {
  background-color: #d32f2f;
}

hr {
  margin: 1.5rem 0;
  border: 0;
  border-top: 1px dashed #eee;
}

.lesson-list {
  list-style: none;
  padding: 0;
}

.lesson-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.lesson-title-link {
  flex-grow: 1;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
  font-weight: bold;
}

.lesson-title-link:hover {
  color: #0056b3;
}

.lesson-progress {
  margin-left: 1rem;
  font-size: 0.9em;
  color: #555;
}

.lesson-item button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}

.lesson-item button:hover {
  background-color: #45a049;
}

.current-lesson-details {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #e9f7ff;
  border: 1px solid #b3e0ff;
  border-radius: 8px;
}

.lesson-content {
  line-height: 1.6;
  color: #444;
}

.note-input-section {
  display: flex;
  margin-top: 1rem;
  gap: 0.5rem;
}

.note-textarea {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  min-height: 60px;
}

.add-note-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.add-note-button:hover {
  background-color: #0056b3;
}

.notes-list {
  list-style: disc;
  padding-left: 20px;
  margin-top: 1rem;
}

.note-item {
  margin-bottom: 0.5rem;
  color: #555;
}

.select-lesson-prompt {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #fffacd;
  border: 1px solid #ffe08a;
  border-radius: 5px;
  text-align: center;
  color: #664f00;
}
</style>
