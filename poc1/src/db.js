// src/db.js
import Dexie from 'dexie';

export const db = new Dexie('learningAppDb');

db.version(1).stores({
  lessons: '++id, title, content, progress',
  quizzes: '++id, lessonId, question, options, correctAnswer, userScore',
  notes: '++id, lessonId, text, timestamp',
});

// Optional: For schema upgrades, you would add new .version() blocks
/*
db.version(2).stores({
  lessons: '++id, title, content, progress, lastAccessed',
  quizzes: '++id, lessonId, question, options, correctAnswer, userScore',
  notes: '++id, lessonId, text, timestamp',
}).upgrade(tx => {
    // Example: add 'lastAccessed' to existing lessons
    return tx.lessons.toCollection().modify(lesson => {
        lesson.lastAccessed = Date.now();
    });
});
*/
