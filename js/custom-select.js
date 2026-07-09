/**
 * custom-select.js — themeable dropdown for the support portal filters.
 *
 * Native <select> option lists can't be styled (the OS draws them, hence the
 * blue highlight). This progressively enhances any `select[data-custom-select]`
 * into a fully themed dropdown while keeping the real <select> in the DOM as the
 * source of truth: selecting an item sets the <select>'s value and dispatches a
 * native `change` event, so existing listeners keep working unchanged.
 */
(function () {
  function enhance(select) {
    if (select.dataset.csReady) return;
    select.dataset.csReady = '1';

    const options = Array.from(select.options);

    const wrap = document.createElement('div');
    wrap.className = 'fl-select';
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);         

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'fl-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML =
      '<span class="fl-select-label"></span>' +
      '<svg class="fl-select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    wrap.appendChild(trigger);

    const menu = document.createElement('ul');
    menu.className = 'fl-select-menu';
    menu.setAttribute('role', 'listbox');
    wrap.appendChild(menu);

    const label = trigger.querySelector('.fl-select-label');
    const items = [];

    options.forEach((opt, i) => {
      const li = document.createElement('li');
      li.className = 'fl-select-option';
      li.setAttribute('role', 'option');
      li.dataset.value = opt.value;
      li.textContent = opt.textContent;
      li.tabIndex = -1;
      menu.appendChild(li);
      items.push(li);

      li.addEventListener('click', () => {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncFromSelect();
        close();
        trigger.focus();
      });
    });

    function syncFromSelect() {
      const val = select.value;
      const chosen = options.find(o => o.value === val) || options[0];
      label.textContent = chosen ? chosen.textContent : '';
      items.forEach(li => {
        const active = li.dataset.value === val;
        li.classList.toggle('is-selected', active);
        li.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    function open() {
      closeAll();
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      document.addEventListener('click', onOutside, true);
      document.addEventListener('keydown', onKey);
    }
    function close() {
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onOutside, true);
      document.removeEventListener('keydown', onKey);
    }
    function onOutside(e) {
      if (!wrap.contains(e.target)) close();
    }
    function onKey(e) {
      const current = items.findIndex(li => li.classList.contains('is-selected'));
      if (e.key === 'Escape') { close(); trigger.focus(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move(current, 1); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); move(current, -1); }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const focused = menu.querySelector('.fl-select-option:focus') || items[current];
        focused?.click();
      }
    }
    function move(from, dir) {
      const next = Math.max(0, Math.min(items.length - 1, (from < 0 ? 0 : from) + dir));
      items[next].focus();
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      wrap.classList.contains('is-open') ? close() : open();
    });

    syncFromSelect();
  }

  const openWraps = () => document.querySelectorAll('.fl-select.is-open');
  function closeAll() {
    openWraps().forEach(w => {
      w.classList.remove('is-open');
      w.querySelector('.fl-select-trigger')?.setAttribute('aria-expanded', 'false');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('select[data-custom-select]').forEach(enhance);
  });
})();
