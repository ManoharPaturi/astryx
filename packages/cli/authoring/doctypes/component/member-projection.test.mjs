// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  findParentOwnedMemberProjection,
  projectParentOwnedMemberDoc,
  stripMemberProjectionMetadata,
} from './member-projection.mjs';

function parent(overrides = {}) {
  return {
    name: 'Parent',
    usage: {
      description: 'Parent usage.',
      anatomy: [
        {name: 'First', required: true, description: 'First part.'},
        {name: 'Second', required: false, description: 'Second part.'},
        {name: 'Third', required: false, description: 'Third part.'},
      ],
    },
    theming: {
      targets: [
        {className: 'astryx-parent-first', states: ['active']},
        {className: 'astryx-parent-second', visualProps: ['size']},
        {className: 'astryx-parent-third'},
      ],
    },
    components: [
      {
        name: 'Child',
        projection: {
          anatomy: ['Third', 'First'],
          targets: ['astryx-parent-third', 'astryx-parent-first'],
        },
      },
    ],
    ...overrides,
  };
}

function child(overrides = {}) {
  return {
    name: 'Child',
    displayName: 'Child',
    subComponentOf: 'Parent',
    description: 'Child description.',
    props: [{name: 'value', type: 'string', description: 'Value.'}],
    examples: [{code: '<Child />'}],
    playground: {defaults: {value: 'example'}},
    ...overrides,
  };
}

describe('projectParentOwnedMemberDoc', () => {
  it('selects exact entries in parent order and preserves child-owned fields', () => {
    const parentDoc = parent();
    const childDoc = child({
      usage: {
        description: 'Child usage.',
        anatomy: [
          {name: 'Child part', required: false, description: 'Child-owned.'},
        ],
      },
      theming: {
        vars: [{name: '--child', description: 'Child var.', default: '0'}],
        targets: [{className: 'astryx-child-local'}],
      },
    });
    const beforeParent = structuredClone(parentDoc);
    const beforeChild = structuredClone(childDoc);

    const projected = projectParentOwnedMemberDoc(parentDoc, childDoc);

    expect(projected.usage.description).toBe('Child usage.');
    expect(projected.usage.anatomy.map(entry => entry.name)).toEqual([
      'Child part',
      'First',
      'Third',
    ]);
    expect(projected.theming.targets).toEqual([
      {className: 'astryx-child-local'},
      {className: 'astryx-parent-first', states: ['active']},
      {className: 'astryx-parent-third'},
    ]);
    expect(projected.theming.vars).toEqual(childDoc.theming.vars);
    expect(projected.props).toEqual(childDoc.props);
    expect(projected.examples).toEqual(childDoc.examples);
    expect(projected.playground).toEqual(childDoc.playground);
    expect(parentDoc).toEqual(beforeParent);
    expect(childDoc).toEqual(beforeChild);
  });

  it('creates child usage from its description when projecting anatomy', () => {
    const projected = projectParentOwnedMemberDoc(parent(), child());
    expect(projected.usage).toMatchObject({
      description: 'Child description.',
      anatomy: [
        {name: 'First', required: true, description: 'First part.'},
        {name: 'Third', required: false, description: 'Third part.'},
      ],
    });
  });

  it('returns an unprojected child unchanged', () => {
    const childDoc = child();
    expect(
      projectParentOwnedMemberDoc(
        parent({components: [{name: 'Child'}]}),
        childDoc,
      ),
    ).toBe(childDoc);
  });

  it('finds and strips projection metadata without changing other ref fields', () => {
    const parentDoc = parent();
    expect(findParentOwnedMemberProjection(parentDoc, 'Child')).toEqual({
      anatomy: ['Third', 'First'],
      targets: ['astryx-parent-third', 'astryx-parent-first'],
    });
    expect(stripMemberProjectionMetadata(parentDoc).components).toEqual([
      {name: 'Child'},
    ]);
    expect(parentDoc.components[0]).toHaveProperty('projection');
  });

  it.each([
    [
      'an unknown projection field',
      {components: [{name: 'Child', projection: {targetz: ['astryx-parent-first']}}]},
      /unknown projection field "targetz"/,
    ],
    [
      'a stale anatomy selector',
      {components: [{name: 'Child', projection: {anatomy: ['Missing']}}]},
      /anatomy selector "Missing" matched 0/,
    ],
    [
      'a stale target selector',
      {components: [{name: 'Child', projection: {targets: ['astryx-missing']}}]},
      /target selector "astryx-missing" matched 0/,
    ],
    [
      'a duplicate selector',
      {
        components: [
          {name: 'Child', projection: {anatomy: ['First', 'First']}},
        ],
      },
      /duplicate anatomy selector "First"/,
    ],
    [
      'a duplicate selected parent entry',
      {
        usage: {
          anatomy: [
            {name: 'First', description: 'One.'},
            {name: 'First', description: 'Two.'},
          ],
        },
        components: [
          {name: 'Child', projection: {anatomy: ['First']}},
        ],
      },
      /anatomy selector "First" matched 2/,
    ],
  ])('fails closed on %s', (_name, overrides, expected) => {
    expect(() => projectParentOwnedMemberDoc(parent(overrides), child())).toThrow(
      expected,
    );
  });

  it('rejects duplicate parent references for the same child', () => {
    expect(() =>
      findParentOwnedMemberProjection(
        parent({
          components: [
            {name: 'Child', projection: {anatomy: ['First']}},
            {name: 'Child'},
          ],
        }),
        'Child',
      ),
    ).toThrow(/lists this member 2 times/);
  });

  it.each([
    [
      'anatomy',
      child({
        usage: {
          description: 'Child usage.',
          anatomy: [{name: 'First', description: 'Duplicate.'}],
        },
      }),
      /child authors projected anatomy "First"/,
    ],
    [
      'target',
      child({
        theming: {targets: [{className: 'astryx-parent-first'}]},
      }),
      /child authors projected target "astryx-parent-first"/,
    ],
  ])('rejects a child-authored duplicate %s', (_name, childDoc, expected) => {
    expect(() => projectParentOwnedMemberDoc(parent(), childDoc)).toThrow(
      expected,
    );
  });

  it('rejects a child that points at a different parent', () => {
    expect(() =>
      projectParentOwnedMemberDoc(parent(), child({subComponentOf: 'Other'})),
    ).toThrow(/subComponentOf must be "Parent"/);
  });
});
