import React, { useEffect } from 'react';

const AccessibilityHelper = () => {
  useEffect(() => {
    // Agregar atributos ARIA a elementos dinámicos
    const addAriaLabels = () => {
      // Botones sin texto
      const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      buttons.forEach(button => {
        const icon = button.querySelector('svg');
        if (icon && !button.textContent.trim()) {
          const title = button.getAttribute('title') || 'Botón';
          button.setAttribute('aria-label', title);
        }
      });

      // Links sin texto
      const links = document.querySelectorAll('a:not([aria-label]):not([aria-labelledby])');
      links.forEach(link => {
        if (!link.textContent.trim()) {
          const title = link.getAttribute('title') || 'Enlace';
          link.setAttribute('aria-label', title);
        }
      });

      // Inputs sin label
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      inputs.forEach(input => {
        const placeholder = input.getAttribute('placeholder');
        if (placeholder && !input.previousElementSibling?.tagName === 'LABEL') {
          input.setAttribute('aria-label', placeholder);
        }
      });
    };

    // Ejecutar al cargar y cuando cambie el DOM
    addAriaLabels();
    const observer = new MutationObserver(addAriaLabels);
    observer.observe(document.body, { childList: true, subtree: true });

    // Mejorar navegación por teclado
    const handleKeyNavigation = (e) => {
      // Skip links con Tab
      if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        // Asegurar que los elementos sean visibles
        focusableElements.forEach(el => {
          if (el === document.activeElement) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }

      // Escape para cerrar modales
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"], .modal, [data-modal]');
        modals.forEach(modal => {
          if (modal.style.display !== 'none') {
            const closeBtn = modal.querySelector('[data-close], .close, button[aria-label*="cerrar"]');
            if (closeBtn) closeBtn.click();
          }
        });
      }
    };

    document.addEventListener('keydown', handleKeyNavigation);

    // Anunciar cambios importantes
    const announceChanges = () => {
      let announcer = document.getElementById('aria-announcer');
      if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'aria-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        document.body.appendChild(announcer);
      }
      return announcer;
    };

    // Función global para anunciar mensajes
    window.announceToScreenReader = (message) => {
      const announcer = announceChanges();
      announcer.textContent = message;
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    };

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyNavigation);
    };
  }, []);

  return null; // Este componente no renderiza nada visible
};

export default AccessibilityHelper;