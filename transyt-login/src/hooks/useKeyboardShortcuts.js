import { useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const useKeyboardShortcuts = () => {
  const { toggleTheme } = useTheme();

  const handleKeyPress = useCallback((event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const { key, ctrlKey, altKey } = event;

    if (ctrlKey && key === 'd') {
      event.preventDefault();
      toggleTheme();
      return;
    }

    if (altKey && key === 'n') {
      event.preventDefault();
      const notificationBtn = document.querySelector('[data-notification-toggle]');
      if (notificationBtn) notificationBtn.click();
      return;
    }

    if (key === 'Escape') {
      const closeButtons = document.querySelectorAll('[data-close-modal]');
      closeButtons.forEach(btn => btn.click());
      return;
    }

  }, [toggleTheme]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return {};
};

export default useKeyboardShortcuts;