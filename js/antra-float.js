/* =========================================================
   ANTRA-WEB — Antra floating website-guide widget
   ---------------------------------------------------------
   Handles ONLY open/close/focus behaviour for the floating
   launcher + panel shell. The actual chat logic (sending
   messages, talking to the webhook/proxy, rendering replies)
   is entirely handled by the existing js/agent-chat.js engine,
   which is loaded on the same pages and auto-initializes the
   `.agent-chat[data-agent-chat]` element sitting inside this
   panel — nothing here duplicates or overrides that.

   Does not touch, load, or reference ava.html, flow.html, or
   anything specific to Ava/Flow.
   ========================================================= */

(function () {
  'use strict';

  function init() {
    var wrap = document.querySelector('[data-antra-float]');

    if (!wrap) {
      return;
    }

    var launcher = wrap.querySelector('[data-antra-launcher]');
    var panel = wrap.querySelector('[data-antra-panel]');
    var closeBtn = wrap.querySelector('[data-antra-close]');
    var textarea = wrap.querySelector('[data-chat-input]');

    if (!launcher || !panel) {
      return;
    }

    var isOpen = false;

    function open() {
      if (isOpen) {
        return;
      }

      isOpen = true;
      panel.hidden = false;
      wrap.classList.add('hint-dismissed');

      // allow the browser to paint hidden=false before animating in
      window.requestAnimationFrame(function () {
        wrap.classList.add('is-open');
      });

      launcher.setAttribute('aria-expanded', 'true');

      window.setTimeout(function () {
        if (textarea) {
          try {
            textarea.focus({ preventScroll: true });
          } catch (e) {
            textarea.focus();
          }
        }
      }, 220);

      document.addEventListener('keydown', onKeydown);
      document.addEventListener('click', onOutsideClick, true);
    }

    function close() {
      if (!isOpen) {
        return;
      }

      isOpen = false;
      wrap.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');

      window.setTimeout(function () {
        if (!isOpen) {
          panel.hidden = true;
        }
      }, 240);

      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('click', onOutsideClick, true);
    }

    function toggle() {
      if (isOpen) {
        close();
      } else {
        open();
      }
    }

    function onKeydown(event) {
      if (event.key === 'Escape') {
        close();
        launcher.focus();
      }
    }

    function onOutsideClick(event) {
      if (!wrap.contains(event.target)) {
        close();
      }
    }

    launcher.addEventListener('click', function () {
      wrap.classList.add('hint-dismissed');
      toggle();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        close();
        launcher.focus();
      });
    }

    // dismiss the decorative hint chip on any interaction with the page
    window.setTimeout(function () {
      var dismissHint = function () {
        wrap.classList.add('hint-dismissed');
        window.removeEventListener('scroll', dismissHint);
      };
      window.addEventListener('scroll', dismissHint, { once: true, passive: true });
    }, 6000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
