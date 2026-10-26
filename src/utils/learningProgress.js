// ============================================================
// Cryptium - Learning & Gamification Progress Utilities
// Manages XP, completed missions, completed exercises per module,
// and learning path progression in localStorage.
// 100% backward compatible with 'cryptium_learning_progress_v1'
// ============================================================

export const PROGRESS_STORAGE_KEY = 'cryptium_learning_progress_v1';

export const MODULE_ORDER = [
  'fundamentos',
  'simetrica',
  'asimetrica',
  'hash',
  'firmas',
  'criptoanalisis',
];

/**
 * Loads stored learning progress with robust fallbacks.
 */
export function getGamifiedProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return {
        explored: ['fundamentos'],
        completed: [],
        xp: 0,
        completedMissions: {},
        completedExercises: {
          fundamentos: [],
          simetrica: [],
          asimetrica: [],
          hash: [],
          firmas: [],
          criptoanalisis: [],
        },
      };
    }
    const parsed = JSON.parse(raw);
    const completedExercises = typeof parsed.completedExercises === 'object' && parsed.completedExercises !== null
      ? parsed.completedExercises
      : {};

    // Ensure all 6 modules have an array in completedExercises
    MODULE_ORDER.forEach((id) => {
      if (!Array.isArray(completedExercises[id])) {
        // If module was previously marked completed, mark exercises 1..4 as completed
        if (Array.isArray(parsed.completed) && parsed.completed.includes(id)) {
          completedExercises[id] = [1, 2, 3, 4];
        } else {
          completedExercises[id] = [];
        }
      }
    });

    return {
      explored: Array.isArray(parsed.explored) ? parsed.explored : ['fundamentos'],
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      completedMissions: typeof parsed.completedMissions === 'object' && parsed.completedMissions !== null ? parsed.completedMissions : {},
      completedExercises,
    };
  } catch {
    return {
      explored: ['fundamentos'],
      completed: [],
      xp: 0,
      completedMissions: {},
      completedExercises: {
        fundamentos: [],
        simetrica: [],
        asimetrica: [],
        hash: [],
        firmas: [],
        criptoanalisis: [],
      },
    };
  }
}

/**
 * Gets specific progress for a given module.
 * @param {string} moduleId
 * @returns {{ completedCount: number, isCompleted: boolean, completedList: number[] }}
 */
export function getModuleExerciseProgress(moduleId) {
  const progress = getGamifiedProgress();
  const list = progress.completedExercises[moduleId] || [];
  const isCompleted = progress.completed.includes(moduleId) || list.length >= 4;
  return {
    completedCount: list.length,
    isCompleted,
    completedList: list,
  };
}

/**
 * Records individual exercise completion within a module.
 * @param {string} moduleId - e.g. 'fundamentos'
 * @param {number} exerciseNumber - 1, 2, 3, or 4
 * @param {number} xpAmount - XP for this exercise (default 25)
 * @returns {{ updated: object, earnedXp: number, moduleCompletedNow: boolean }}
 */
export function recordExerciseCompletion(moduleId, exerciseNumber, xpAmount = 25) {
  try {
    const current = getGamifiedProgress();
    const currentList = current.completedExercises[moduleId] || [];
    const isNewExercise = !currentList.includes(exerciseNumber);

    const updatedList = isNewExercise
      ? [...currentList, exerciseNumber].sort((a, b) => a - b)
      : currentList;

    const earnedXp = isNewExercise ? xpAmount : 0;
    const newXp = (current.xp || 0) + earnedXp;

    let newCompleted = [...current.completed];
    let moduleCompletedNow = false;

    // If 4 exercises are done and module not yet marked complete
    if (updatedList.length >= 4 && !newCompleted.includes(moduleId)) {
      newCompleted.push(moduleId);
      moduleCompletedNow = true;
    }

    // Unlock next module in explored list
    const currentIndex = MODULE_ORDER.indexOf(moduleId);
    const nextModuleId = currentIndex >= 0 && currentIndex < MODULE_ORDER.length - 1
      ? MODULE_ORDER[currentIndex + 1]
      : null;

    let newExplored = [...current.explored];
    if (!newExplored.includes(moduleId)) {
      newExplored.push(moduleId);
    }
    if (nextModuleId && !newExplored.includes(nextModuleId)) {
      newExplored.push(nextModuleId);
    }

    const updated = {
      ...current,
      explored: newExplored,
      completed: newCompleted,
      xp: newXp,
      completedExercises: {
        ...current.completedExercises,
        [moduleId]: updatedList,
      },
      completedMissions: {
        ...current.completedMissions,
        [moduleId]: {
          completed: updatedList.length >= 4,
          completedAt: current.completedMissions[moduleId]?.completedAt || (updatedList.length >= 4 ? new Date().toISOString() : null),
          xpEarned: (current.completedMissions[moduleId]?.xpEarned || 0) + earnedXp,
        },
      },
    };

    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
    return { updated, earnedXp, moduleCompletedNow };
  } catch (err) {
    console.error('Error al guardar progreso del ejercicio:', err);
    return { updated: null, earnedXp: 0, moduleCompletedNow: false };
  }
}

/**
 * Marks a module mission as completed, unlocks subsequent stages,
 * and awards legitimate XP (preventing infinite duplicate farming).
 * @param {string} moduleId - e.g. 'fundamentos' or 'simetrica'
 * @param {number} xpAmount - XP awarded for completing this mission
 * @returns {{ updated: object, earnedXp: number, isFirstTime: boolean }}
 */
export function recordMissionCompletion(moduleId, xpAmount = 100) {
  try {
    const current = getGamifiedProgress();
    const isFirstTime = !current.completed.includes(moduleId);

    const newCompleted = isFirstTime
      ? [...current.completed, moduleId]
      : current.completed;

    const currentIndex = MODULE_ORDER.indexOf(moduleId);
    const nextId = currentIndex >= 0 && currentIndex < MODULE_ORDER.length - 1
      ? MODULE_ORDER[currentIndex + 1]
      : null;

    let newExplored = [...current.explored];
    if (!newExplored.includes(moduleId)) {
      newExplored.push(moduleId);
    }
    if (nextId && !newExplored.includes(nextId)) {
      newExplored.push(nextId);
    }

    // Award XP only if not awarded before for this module
    const previousRecord = current.completedMissions[moduleId];
    const earnedXp = previousRecord?.completed ? 0 : xpAmount;
    const newXp = (current.xp || 0) + earnedXp;

    const updated = {
      ...current,
      explored: newExplored,
      completed: newCompleted,
      xp: newXp,
      completedExercises: {
        ...current.completedExercises,
        [moduleId]: [1, 2, 3, 4],
      },
      completedMissions: {
        ...current.completedMissions,
        [moduleId]: {
          completed: true,
          completedAt: previousRecord?.completedAt || new Date().toISOString(),
          xpEarned: (previousRecord?.xpEarned || 0) + earnedXp,
        },
      },
    };

    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
    return { updated, earnedXp, isFirstTime };
  } catch (err) {
    console.error('Error al guardar progreso de la misión:', err);
    return { updated: null, earnedXp: 0, isFirstTime: false };
  }
}
