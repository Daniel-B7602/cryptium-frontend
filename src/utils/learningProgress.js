// ============================================================
// Cryptium - Learning & Gamification Progress Utilities
// Manages XP, completed missions, explored stages in localStorage
// 100% backward compatible with 'cryptium_learning_progress_v1'
// ============================================================

export const PROGRESS_STORAGE_KEY = 'cryptium_learning_progress_v1';

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
      };
    }
    const parsed = JSON.parse(raw);
    return {
      explored: Array.isArray(parsed.explored) ? parsed.explored : ['fundamentos'],
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      completedMissions: typeof parsed.completedMissions === 'object' && parsed.completedMissions !== null ? parsed.completedMissions : {},
    };
  } catch {
    return {
      explored: ['fundamentos'],
      completed: [],
      xp: 0,
      completedMissions: {},
    };
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

    // Automatic progression unlocks
    const nextStages = {
      fundamentos: 'simetrica',
      simetrica: 'asimetrica',
      asimetrica: 'hash',
      hash: 'firmas',
      firmas: 'criptoanalisis',
    };

    const nextId = nextStages[moduleId];
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
