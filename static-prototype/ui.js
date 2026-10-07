/* Локальные DOM-утилиты прототипа. Без внешних библиотек и загрузки модулей. */
const UI = (() => {
  const Fragment = Symbol('fragment');
  const instances = new Map();
  let active, slot, root, tree, queued = false, effects = [], visited;
  const element = (type, props, ...children) => ({ type, props: props || {}, children });
  const changed = (a, b) => !a || !b || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]));
  function useState(initial) {
    const owner = active, i = slot++;
    if (!(i in owner.hooks)) owner.hooks[i] = typeof initial === 'function' ? initial() : initial;
    return [owner.hooks[i], value => {
      const next = typeof value === 'function' ? value(owner.hooks[i]) : value;
      if (!Object.is(next, owner.hooks[i])) { owner.hooks[i] = next; schedule(); }
    }];
  }
  function useRef(initial) {
    const i = slot++;
    return active.hooks[i] || (active.hooks[i] = { current: initial });
  }
  function useMemo(factory, deps) {
    const i = slot++, old = active.hooks[i];
    if (!old || changed(old.deps, deps)) active.hooks[i] = { value: factory(), deps };
    return active.hooks[i].value;
  }
  function useEffect(fn, deps) {
    const owner = active, i = slot++, old = owner.hooks[i];
    if (!old || changed(old.deps, deps)) {
      const entry = { deps, cleanup: old?.cleanup };
      owner.hooks[i] = entry;
      effects.push(() => { entry.cleanup?.(); entry.cleanup = fn(); });
    }
  }
  function expand(node, path) {
    if (node == null || typeof node === 'boolean') return [];
    if (Array.isArray(node)) return node.flatMap((child, i) => expand(child, path + '/' + (child?.props?.key ?? i)));
    if (typeof node !== 'object') return [{ type: '#text', text: String(node), path }];
    if (node.type === Fragment) return expand(node.children, path + '/fragment');
    if (typeof node.type === 'function') {
      const id = path + ':' + node.type.name;
      let instance = instances.get(id);
      if (!instance || instance.type !== node.type) {
        instance = { type: node.type, hooks: [] }; instances.set(id, instance);
      }
      visited.add(id);
      const prev = active, prevSlot = slot;
      active = instance; slot = 0;
      const result = node.type({ ...node.props, children: node.children.length === 1 ? node.children[0] : node.children });
      active = prev; slot = prevSlot;
      return expand(result, id);
    }
    return [{ ...node, path, children: expand(node.children, path) }];
  }
  const unitless = new Set(['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flex', 'flexGrow', 'flexShrink', 'order', 'gridRow', 'gridColumn', 'scale', 'aspectRatio', 'fillOpacity', 'strokeOpacity', 'strokeWidth']);
  const cssName = key => key.startsWith('--') ? key : key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
  function updateProps(el, props, old = {}) {
    for (const key of new Set([...Object.keys(old), ...Object.keys(props)])) {
      const value = props[key];
      if (key === 'key' || key === 'children') continue;
      if (key === 'ref') {
        if (old[key] !== value) {
          if (typeof old[key] === 'function') old[key](null); else if (old[key]) old[key].current = null;
          if (typeof value === 'function') value(el); else if (value) value.current = el;
        }
      } else if (key === 'style') {
        for (const name of new Set([...Object.keys(old.style || {}), ...Object.keys(value || {})])) {
          let val = value?.[name];
          if (typeof val === 'number' && val !== 0 && !unitless.has(name) && !name.startsWith('--')) val += 'px';
          el.style.setProperty(cssName(name), val == null ? '' : String(val));
        }
      } else if (/^on[A-Z]/.test(key)) {
        let event = key.slice(2).toLowerCase();
        if (event === 'doubleclick') event = 'dblclick';
        if (event === 'change' && el.tagName === 'INPUT' && !['checkbox', 'radio', 'file'].includes(props.type)) event = 'input';
        if (event === 'change' && el.tagName === 'TEXTAREA') event = 'input';
        if (old[key]) el.removeEventListener(event, old[key]);
        if (value) el.addEventListener(event, value);
      } else if (key === 'value' || key === 'checked' || key === 'selected') {
        const next = value ?? (key === 'value' ? '' : false);
        if (el[key] !== next && String(el[key]) !== String(next)) el[key] = next;
      } else {
        let attr = ({ className: 'class', htmlFor: 'for', tabIndex: 'tabindex' })[key] || key;
        if (el.namespaceURI.includes('svg') && !['viewBox', 'preserveAspectRatio'].includes(attr)) attr = cssName(attr);
        if (value == null || value === false) el.removeAttribute(attr);
        else el.setAttribute(attr, value === true ? '' : String(value));
      }
    }
  }
  function release(el) {
    const ref = el._props?.ref;
    if (typeof ref === 'function') ref(null); else if (ref && ref.current === el) ref.current = null;
    for (const child of el.childNodes) release(child);
  }
  function patch(parent, nodes, svg = false) {
    const existing = new Map(Array.from(parent.childNodes, el => [el._path, el]));
    nodes.forEach((node, i) => {
      let el = existing.get(node.path);
      if (el && el._type !== node.type) { release(el); el.remove(); el = null; }
      const isSvg = svg || node.type === 'svg';
      if (!el) {
        el = node.type === '#text' ? document.createTextNode(node.text) : isSvg ? document.createElementNS('http://www.w3.org/2000/svg', node.type) : document.createElement(node.type);
        el._path = node.path; el._type = node.type;
      }
      existing.delete(node.path);
      if (parent.childNodes[i] !== el) parent.insertBefore(el, parent.childNodes[i] || null);
      if (node.type === '#text') { if (el.data !== node.text) el.data = node.text; }
      else {
        updateProps(el, node.props, el._props);
        el._props = node.props;
        patch(el, node.children, isSvg && node.type !== 'foreignObject');
        if (node.props.value != null && el.tagName === 'SELECT') el.value = node.props.value;
      }
    });
    for (const el of existing.values()) { release(el); el.remove(); }
  }
  function render() {
    queued = false; effects = []; visited = new Set();
    const nodes = expand(tree, 'root');
    patch(root, nodes);
    for (const [id, instance] of instances) if (!visited.has(id)) {
      for (const hook of instance.hooks) hook?.cleanup?.();
      instances.delete(id);
    }
    for (const effect of effects) effect();
  }
  function schedule() { if (!queued) { queued = true; queueMicrotask(render); } }
  return { element, Fragment, useState, useRef, useMemo, useEffect,
    useCallback: (fn, deps) => useMemo(() => fn, deps),
    createRoot: target => ({ render: node => { root = target; tree = node; render(); } }) };
})();
