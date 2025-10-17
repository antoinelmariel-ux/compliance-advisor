export var STORAGE_KEY = 'complianceAdvisorState';
export var loadPersistedState = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    var raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Impossible de charger l'état sauvegardé :", error);
    return null;
  }
};
export var persistState = state => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Impossible de sauvegarder l'état :", error);
  }
};