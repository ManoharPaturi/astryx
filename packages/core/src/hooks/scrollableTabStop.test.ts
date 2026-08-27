// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';

/**
 * jsdom has no layout — scrollHeight and clientHeight are 0 for everything —
 * so the geometry is stubbed per element and the shared observer is driven by
 * hand. The behaviour in a real engine is measured in the browser probes;
 * these tests pin the decision logic and the cleanup.
 */
function sizeOf(
  element: HTMLElement,
  size: {
    scrollHeight?: number;
    clientHeight?: number;
    scrollWidth?: number;
    clientWidth?: number;
  },
) {
  for (const [key, value] of Object.entries({
    scrollHeight: 0,
    clientHeight: 0,
    scrollWidth: 0,
    clientWidth: 0,
    ...size,
  })) {
    Object.defineProperty(element, key, {value, configurable: true});
  }
}

describe('attachScrollableTabStop', () => {
  let fire: ResizeObserverCallback;

  beforeEach(() => {
    global.ResizeObserver = vi.fn(function (cb: ResizeObserverCallback) {
      fire = cb;
      return {observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn()};
    });
  });

  afterEach(() => {
    vi.resetModules();
    document.body.innerHTML = '';
  });

  const load = async () => {
    const {attachScrollableTabStop} = await import('./scrollableTabStop');
    return attachScrollableTabStop;
  };

  const entry = (target: Element) =>
    ({target}) as unknown as ResizeObserverEntry;

  const flushMeasure = async () => {
    await new Promise(resolve => requestAnimationFrame(resolve));
  };

  // The longhands, not the `overflow` shorthand: jsdom does not expand the
  // shorthand into computed longhands the way a browser does. The shorthand
  // path is covered by the Chromium probe instead.
  const mount = (
    size: Parameters<typeof sizeOf>[1],
    overflow: string = 'auto',
  ) => {
    const element = document.createElement('div');
    element.style.overflowX = overflow;
    element.style.overflowY = overflow;
    document.body.appendChild(element);
    sizeOf(element, size);
    return element;
  };

  it('adds a tab stop when the content overflows the block axis', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});

    const detach = attach(element);

    expect(element.getAttribute('tabindex')).toBe('0');
    detach();
  });

  it('adds a tab stop when the content overflows the inline axis', async () => {
    const attach = await load();
    const element = mount({scrollWidth: 643, clientWidth: 300});

    const detach = attach(element);

    expect(element.getAttribute('tabindex')).toBe('0');
    detach();
  });

  it('leaves a container that clips its overflow out of the tab order', async () => {
    const attach = await load();
    // scrollHeight grows past clientHeight under `clip` and `hidden` just as
    // it does under `auto`, but the user can move nothing.
    const element = mount({scrollHeight: 442, clientHeight: 118}, 'clip');

    const detach = attach(element);

    expect(element.hasAttribute('tabindex')).toBe(false);
    detach();
  });

  it('leaves a container that hides its overflow out of the tab order', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118}, 'hidden');

    const detach = attach(element);

    expect(element.hasAttribute('tabindex')).toBe(false);
    detach();
  });

  it('checks scrollability per axis, not for the element as a whole', async () => {
    const attach = await load();
    // Only the inline axis overflows, and that axis is clipped: the scrollable
    // block axis must not vouch for it.
    const element = mount({scrollWidth: 643, clientWidth: 300});
    element.style.overflowX = 'hidden';
    element.style.overflowY = 'auto';

    const detach = attach(element);

    expect(element.hasAttribute('tabindex')).toBe(false);
    detach();
  });

  it('leaves a container whose content fits out of the tab order', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 118, clientHeight: 118});

    const detach = attach(element);

    expect(element.hasAttribute('tabindex')).toBe(false);
    detach();
  });

  it('does not add a second stop before a visible sequential-focus child', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});
    const button = document.createElement('button');
    element.appendChild(button);

    const detach = attach(element);

    expect(element.hasAttribute('tabindex')).toBe(false);
    detach();
  });

  it('still owns the stop when descendants are hidden or negative-tabindex', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});
    const hidden = document.createElement('button');
    hidden.hidden = true;
    const programmatic = document.createElement('button');
    programmatic.tabIndex = -2;
    element.append(hidden, programmatic);

    const detach = attach(element);

    expect(element.getAttribute('tabindex')).toBe('0');
    detach();
  });

  it('tracks a visible sequential-focus descendant added and hidden later', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});
    const detach = attach(element);
    expect(element.getAttribute('tabindex')).toBe('0');

    const button = document.createElement('button');
    element.appendChild(button);
    await flushMeasure();
    expect(element.hasAttribute('tabindex')).toBe(false);

    button.hidden = true;
    await flushMeasure();
    expect(element.getAttribute('tabindex')).toBe('0');
    detach();
  });

  it('tracks overflow mode changes without waiting for a resize', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118}, 'hidden');
    const detach = attach(element);
    expect(element.hasAttribute('tabindex')).toBe(false);

    element.style.overflowY = 'auto';
    await flushMeasure();
    expect(element.getAttribute('tabindex')).toBe('0');

    element.style.overflowY = 'hidden';
    await flushMeasure();
    expect(element.hasAttribute('tabindex')).toBe(false);
    detach();
  });

  it('ignores a sub-pixel overflow', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 118.5, clientHeight: 118});

    const detach = attach(element);

    expect(element.hasAttribute('tabindex')).toBe(false);
    detach();
  });

  it('adds the tab stop when the content grows later', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 100, clientHeight: 118});
    const detach = attach(element);
    expect(element.hasAttribute('tabindex')).toBe(false);

    sizeOf(element, {scrollHeight: 442, clientHeight: 118});
    fire([entry(element)], {} as ResizeObserver);
    await flushMeasure();

    expect(element.getAttribute('tabindex')).toBe('0');
    detach();
  });

  it('removes the tab stop when the content fits again', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});
    const detach = attach(element);

    sizeOf(element, {scrollHeight: 100, clientHeight: 118});
    fire([entry(element)], {} as ResizeObserver);
    await flushMeasure();

    expect(element.hasAttribute('tabindex')).toBe(false);
    detach();
  });

  it('keeps the tab stop while the element itself has focus', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});
    const detach = attach(element);
    element.focus();
    expect(document.activeElement).toBe(element);

    sizeOf(element, {scrollHeight: 100, clientHeight: 118});
    fire([entry(element)], {} as ResizeObserver);
    await flushMeasure();

    expect(element.getAttribute('tabindex')).toBe('0');
    detach();
  });

  it('clears the stale tab stop once focus leaves', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});
    const detach = attach(element);
    element.focus();
    sizeOf(element, {scrollHeight: 100, clientHeight: 118});
    fire([entry(element)], {} as ResizeObserver);
    expect(element.getAttribute('tabindex')).toBe('0');

    element.blur();
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(element.hasAttribute('tabindex')).toBe(false);
    detach();
  });

  it('observes direct children, which is what sees content grow', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 100, clientHeight: 118});
    const child = document.createElement('div');
    element.appendChild(child);

    const detach = attach(element);
    sizeOf(element, {scrollHeight: 442, clientHeight: 118});
    // A fixed-height container does not resize when its content grows; the
    // child that holds the content does.
    fire([entry(child)], {} as ResizeObserver);
    await flushMeasure();

    expect(element.getAttribute('tabindex')).toBe('0');
    detach();
  });

  it('picks up a child that replaced the one it was observing', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 100, clientHeight: 118});
    const first = document.createElement('div');
    element.appendChild(first);
    const detach = attach(element);

    first.remove();
    const second = document.createElement('div');
    element.appendChild(second);
    // Removal fires the observer for the outgoing child; that callback
    // re-syncs the set, so the incoming one is observed from then on.
    fire([entry(first)], {} as ResizeObserver);
    await flushMeasure();

    sizeOf(element, {scrollHeight: 442, clientHeight: 118});
    fire([entry(second)], {} as ResizeObserver);
    await flushMeasure();

    expect(element.getAttribute('tabindex')).toBe('0');
    detach();
  });

  it('picks up a child appended straight into the container', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 100, clientHeight: 118});
    const detach = attach(element);
    expect(element.hasAttribute('tabindex')).toBe(false);

    // Nothing already in the container resizes when a sibling is added, so
    // this is the child-list observer's case, not the resize observer's.
    sizeOf(element, {scrollHeight: 442, clientHeight: 118});
    element.appendChild(document.createElement('div'));
    await flushMeasure();

    expect(element.getAttribute('tabindex')).toBe('0');
    detach();
  });

  it('coalesces one ResizeObserver delivery to one measurement', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});
    const children = Array.from({length: 200}, () =>
      document.createElement('div'),
    );
    element.append(...children);
    const detach = attach(element);
    const styleReads = vi.spyOn(window, 'getComputedStyle');
    styleReads.mockClear();

    fire(children.map(entry), {} as ResizeObserver);
    expect(styleReads).not.toHaveBeenCalled();
    await flushMeasure();

    expect(styleReads).toHaveBeenCalledTimes(1);
    detach();
    styleReads.mockRestore();
  });

  it('stops measuring once detached, even with a frame already queued', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});
    const detach = attach(element);
    element.focus();

    // Blur and detach in the same frame: the queued measure must not outlive
    // the detach and write the tab stop back onto a released element.
    element.blur();
    detach();
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(element.hasAttribute('tabindex')).toBe(false);

    sizeOf(element, {scrollHeight: 900, clientHeight: 118});
    fire([entry(element)], {} as ResizeObserver);
    expect(element.hasAttribute('tabindex')).toBe(false);
  });

  it('stops measuring after two focusouts in one frame', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});
    const child = document.createElement('div');
    element.appendChild(child);
    const detach = attach(element);
    element.focus();

    // focusout bubbles, so focus moving twice inside the container in one task
    // queues two frames. Only the last id is held, so a frame the detach
    // cannot cancel would survive and re-register the children.
    element.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
    element.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
    element.blur();
    detach();
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(element.hasAttribute('tabindex')).toBe(false);

    // The released hook must be deaf to the children it was observing.
    sizeOf(element, {scrollHeight: 900, clientHeight: 118});
    fire([entry(child)], {} as ResizeObserver);
    expect(element.hasAttribute('tabindex')).toBe(false);
  });

  it('does not touch a tabindex the consumer set', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});
    element.setAttribute('tabindex', '-1');

    const detach = attach(element);
    expect(element.getAttribute('tabindex')).toBe('-1');

    detach();
    expect(element.getAttribute('tabindex')).toBe('-1');
  });

  it('removes its own tab stop on detach', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});

    attach(element)();

    expect(element.hasAttribute('tabindex')).toBe(false);
  });
});
