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

  const mount = (size: Parameters<typeof sizeOf>[1]) => {
    const element = document.createElement('div');
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

  it('leaves a container whose content fits out of the tab order', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 118, clientHeight: 118});

    const detach = attach(element);

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

    expect(element.getAttribute('tabindex')).toBe('0');
    detach();
  });

  it('removes the tab stop when the content fits again', async () => {
    const attach = await load();
    const element = mount({scrollHeight: 442, clientHeight: 118});
    const detach = attach(element);

    sizeOf(element, {scrollHeight: 100, clientHeight: 118});
    fire([entry(element)], {} as ResizeObserver);

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

    expect(element.getAttribute('tabindex')).toBe('0');
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

    sizeOf(element, {scrollHeight: 442, clientHeight: 118});
    fire([entry(second)], {} as ResizeObserver);

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
    await Promise.resolve();

    expect(element.getAttribute('tabindex')).toBe('0');
    detach();
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
