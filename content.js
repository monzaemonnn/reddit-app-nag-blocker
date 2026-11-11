/* Reddit App Nag Blocker. Local-only, with no extension API or network access. */
(() => {
  'use strict';

  const SHELLS = 'dialog,[role="dialog"],[aria-modal="true"],.rpl-bottom-sheet,' +
    'shreddit-app-prompt,shreddit-app-install-modal,xpromo-app-modal';
  const SEEDS = `${SHELLS},h1,h2,h3,[role="heading"],button,a`;
  const HEADLINE = /get the best of reddit in the app|get the app to (?:keep|continue) using reddit|reddit is better in the app/i;
  const CTA = /^(?:get (?:the )?reddit app|get the app|open (?:in (?:the )?)?app|continue in (?:the )?app|download (?:the )?(?:reddit )?app)$/i;
  const roots = new Set();
  const hosts = new Set();
  const pending = new Set();
  const temporaryOverflow = new Map();
  let timer = null;
  let repairUntil = 0;

  const normalized = text => (text || '').replace(/\s+/g, ' ').trim();
  const parentOf = node => node.parentElement || node.getRootNode()?.host || null;

  // Read rendered component text across open shadow roots, with a size limit.
  function textOf(element) {
    let value = element.textContent || '';
    if (value.length > 8000) return '';
    const components = [element, ...element.querySelectorAll('*')];
    for (const child of components) {
      if (child.shadowRoot) value += ' ' + textOf(child.shadowRoot);
      if (value.length > 8000) return '';
    }
    return normalized(value);
  }

  function isAppPrompt(element) {
    const text = textOf(element);
    if (!text) return false;
    // Require an app-promotion headline plus an actual app action. A post merely
    // quoting the headline is not sufficient.
    let hasAction = false;
    const inspect = root => {
      if (root.shadowRoot) inspect(root.shadowRoot);
      for (const action of root.querySelectorAll('button,a,[role="button"]')) {
        if (CTA.test(normalized(action.textContent))) hasAction = true;
      }
      for (const child of root.querySelectorAll('*')) {
        if (child.shadowRoot) inspect(child.shadowRoot);
      }
    };
    inspect(element);
    return HEADLINE.test(text) && hasAction;
  }

  function findShell(seed) {
    let fallback = null;
    let shell = null;
    for (let element = seed, depth = 0; element && depth < 14; element = parentOf(element), depth++) {
      // Never remove a feed, page, or user-authored post as a fallback.
      if (element.matches('html,body,main,article,shreddit-post,shreddit-comment,[role="main"],[role="feed"]')) break;
      if (element.matches(SHELLS)) shell = element;
      const style = getComputedStyle(element);
      if (style.position === 'fixed' && isAppPrompt(element)) fallback = element;
    }
    return shell || fallback;
  }

  function visible(element) {
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
  }

  function anotherModalIsOpen() {
    for (const root of roots) {
      if (root !== document && !root.host?.isConnected) continue;
      for (const element of root.querySelectorAll(SHELLS)) {
        if (element.localName === 'dialog' && !element.open) continue;
        if (visible(element)) return true;
      }
    }
    return false;
  }

  function repairPage() {
    if (Date.now() > repairUntil || anotherModalIsOpen()) {
      for (const [element, properties] of temporaryOverflow) {
        for (const property of properties) {
          if (element.style.getPropertyValue(property) === 'auto') element.style.removeProperty(property);
        }
      }
      temporaryOverflow.clear();
      return;
    }
    // Only release locks immediately after a confirmed app prompt was removed.
    // Do not override locking used by a login, report, or other active dialog.
    for (const element of [document.documentElement, document.body]) {
      if (!element) continue;
      if (element.classList.contains('scroll-is-blocked')) element.classList.remove('scroll-is-blocked');
      for (const property of ['overflow', 'overflow-y']) {
        if (/^(hidden|clip)$/.test(element.style.getPropertyValue(property))) element.style.removeProperty(property);
        if (/^(hidden|clip)$/.test(getComputedStyle(element).getPropertyValue(property))) {
          element.style.setProperty(property, 'auto', 'important');
          if (!temporaryOverflow.has(element)) temporaryOverflow.set(element, new Set());
          temporaryOverflow.get(element).add(property);
        }
      }
      if (getComputedStyle(element).pointerEvents === 'none') element.style.removeProperty('pointer-events');
    }
    // Modal implementations may make the background inert and hide it from AT.
    for (const root of roots) {
      for (const element of root.querySelectorAll('body[inert],main[inert],shreddit-app[inert],body > [inert]')) element.removeAttribute('inert');
    }
  }

  function removePrompt(shell) {
    // Native close releases top-layer backdrop and browser-managed inertness.
    if (shell.localName === 'dialog' && shell.open) shell.close();
    for (const dialog of shell.querySelectorAll('dialog[open]')) dialog.close();
    shell.remove();
    repairUntil = Date.now() + 1500;
    repairPage();
  }

  function scan() {
    timer = null;
    const candidates = [...pending];
    pending.clear();
    for (const seed of candidates) {
      if (!seed.isConnected) continue;
      // Avoid expensive ancestor/text inspection for ordinary links and buttons.
      if (!seed.matches(SHELLS) && !HEADLINE.test(normalized(seed.textContent)) && !CTA.test(normalized(seed.textContent))) continue;
      const shell = findShell(seed);
      if (shell && shell.isConnected && isAppPrompt(shell)) removePrompt(shell);
    }
    repairPage();
  }

  function schedule() {
    if (timer === null) timer = setTimeout(scan, 30);
  }

  function collect(node) {
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    if (!node || !node.querySelectorAll) return;
    if (node.matches?.(SEEDS)) pending.add(node);
    for (const seed of node.querySelectorAll(SEEDS)) pending.add(seed);
    for (const element of [node, ...node.querySelectorAll('*')]) {
      if (element.localName?.includes('-')) hosts.add(element);
      if (element.shadowRoot) observe(element.shadowRoot);
    }
    // A button or heading can be populated a text node at a time.
    for (let element = node, depth = 0; element?.nodeType === 1 && depth < 5; element = parentOf(element), depth++) {
      if (element.matches(SEEDS)) pending.add(element);
    }
  }

  const observers = new Map();
  function onMutations(records) {
    for (const record of records) {
      if (record.type === 'childList') {
        for (const added of record.addedNodes) collect(added);
        if (record.target.nodeType === 1 && record.target.matches(SEEDS)) pending.add(record.target);
      } else if (record.type === 'characterData') collect(record.target);
      else if (record.target.matches?.(SHELLS)) pending.add(record.target);
    }
    schedule();
  }

  function observe(root) {
    if (roots.has(root)) return;
    roots.add(root);
    const observer = new MutationObserver(onMutations);
    observers.set(root, observer);
    observer.observe(root, {
      subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ['class', 'style', 'open', 'aria-modal', 'role', 'inert']
    });
    collect(root);
    schedule();
  }

  observe(document);
  // Custom elements may attach their shadow root after the host is inserted.
  setInterval(() => {
    for (const host of hosts) {
      if (!host.isConnected) hosts.delete(host);
      else if (host.shadowRoot) observe(host.shadowRoot);
    }
    for (const root of roots) {
      if (root !== document && !root.host?.isConnected) {
        observers.get(root)?.disconnect();
        observers.delete(root);
        roots.delete(root);
      }
    }
    repairPage();
  }, 750);
})();
