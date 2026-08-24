// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input None (pure type definitions)
 * @output The indicator contract: families, states, props, names, registry
 * @position Type foundation for stateful control visuals
 *
 * An **indicator** is a decorative visual that expresses a piece of component
 * state: the box a checkbox draws, the circle a radio draws, the mark on a
 * chosen list option. The owning component keeps the input, role, accessible
 * name, focus, and keyboard behavior; the indicator turns state into a picture.
 *
 * Componentizing them buys three things a theme could not otherwise have:
 *
 *   1. **Theme it** — an indicator renders stable `astryx-*` class targets, so
 *      `defineTheme({components})` restyles it like any other component, in one
 *      place rather than per host component.
 *   2. **Swizzle it** — `astryx swizzle <Name>` copies the source to own.
 *   3. **Replace it** — `defineTheme({indicators})` swaps in another component
 *      by name, and every component that renders that indicator follows. A
 *      product that wants radio visuals for single selection replaces `check`.
 *
 * Indicators come in **families**, and a family fixes the state space. That is
 * what lets one mechanism serve semantics as different as "is this option
 * chosen" and "are several of these chosen" without either pretending to be
 * the other, and without a shared enum that would typecheck `indeterminate` on
 * a radio.
 *
 * Each family's vocabulary is the one the accessibility layer already uses, so
 * a component passing state down says the same word its ARIA attribute says.
 * Sharing one enum across families was measured and rejected (#4831): it
 * produced call sites reading `aria-expanded={isOpen}` beside
 * `state={isOpen ? 'on' : 'off'}`.
 */

import type {ComponentType, ReactNode, Ref} from 'react';
import type {BaseProps} from '../BaseProps';

/**
 * The indicator families, each mapped to the states it can express.
 *
 * Single and multi selection are separate families because their state spaces
 * genuinely differ: `aria-checked` is `true|false` for a radio and
 * `true|false|mixed` for a checkbox. Keeping them apart is what makes a
 * replacement type-checkable — a checkbox visual cannot stand in where only
 * two states are ever passed, and a radio cannot be asked to draw a partial
 * state it has no picture for.
 *
 * Adding a family is additive *when the family has states*: declare it here,
 * then declare indicators of that family in {@link IndicatorMap}. Packages
 * outside core can contribute families through module augmentation.
 *
 * A family with NO states is not additive, and `busy` is the case that found
 * it. `state` was declared unconditionally required, so an empty state space
 * (`never`) makes every call site unsatisfiable and a single-member filler
 * state (`'busy'`) makes every call site write a word that carries nothing.
 * Admitting one costs a change to {@link IndicatorProps}: `state` and `size`
 * are now derived from the family rather than fixed, so a family declares the
 * domain of each prop instead of only the state enum. Existing families
 * resolve to exactly the props they had, which is why nothing downstream of
 * them changed.
 */
export interface IndicatorFamilyMap {
  /** Is this one thing chosen? Radios, and the mark on a selected option. */
  singleSelection: 'unchecked' | 'checked';
  /** Which of these are chosen? Checkboxes, including the partial state. */
  multiSelection: 'unchecked' | 'checked' | 'indeterminate';
  /**
   * Is work in flight? Spinners, and any branded loading visual standing in
   * for one.
   *
   * The state space is EMPTY, and that is the point: a busy visual is either
   * rendered or it is not, so there is no state for a host to pass and none
   * for a replacement to draw. `never` says so in the type system — see
   * {@link IndicatorProps}, where an empty state space removes the `state`
   * prop instead of demanding an inhabitant of an uninhabitable type.
   */
  busy: never;
}

export type IndicatorFamily = keyof IndicatorFamilyMap & string;

/** The states an indicator of family `F` can be asked to draw. */
export type IndicatorState<F extends IndicatorFamily = IndicatorFamily> =
  IndicatorFamilyMap[F];

/** Indicator size scale — matches the control sizes of the owning inputs. */
export type IndicatorSize = 'sm' | 'md';

/**
 * The size scale each family draws at.
 *
 * A family fixes the size space for the same reason it fixes the state space:
 * the scale belongs to what the indicator IS, not to the mechanism. Selection
 * marks sit inside a control and take the control's two sizes. A busy visual
 * also stands alone — a page-level spinner is not sized by any control — so
 * its family keeps the four sizes `Spinner` has always shipped.
 *
 * Every host that renders a busy indicator inside a control passes `sm` or
 * `md`; `lg` and `xl` only ever appear on a standalone `<Spinner>`. So the two
 * extra sizes cost the control hosts nothing, and a replacement that only
 * draws `sm`/`md` is still a valid selection-mark replacement — the widening
 * is confined to the family that asked for it.
 */
export interface IndicatorFamilySizeMap {
  singleSelection: IndicatorSize;
  multiSelection: IndicatorSize;
  busy: IndicatorSize | 'lg' | 'xl';
}

/** The sizes an indicator of family `F` can be asked to draw at. */
export type IndicatorSizeOf<F extends IndicatorFamily = IndicatorFamily> =
  IndicatorFamilySizeMap[F];

/**
 * Which edge of its row an indicator sits on.
 *
 * Logical, not physical: `start` is the left edge in LTR and the right edge in
 * RTL. Owned by the host component, not by the indicator — an indicator draws a
 * picture and has no say in where the row puts it — which is why this is a prop
 * on the components that lay out rows rather than part of
 * {@link IndicatorProps}.
 */
export type IndicatorPosition = 'start' | 'end';

/**
 * The props every indicator accepts, whatever its family. {@link IndicatorProps}
 * adds the two the family parameterizes.
 *
 * Indicators are **decorative**: they render `aria-hidden` visuals and own no
 * role, focus, keyboard handling, or state. The component that renders one
 * (CheckboxInput, RadioListItem, a listbox option, a loading Button) keeps all
 * of that. An indicator's only job is to turn a piece of the host's state into
 * a picture — for a busy indicator, the fact that it is rendered at all is
 * that piece.
 *
 * The a11y props are omitted from this interface rather than left to
 * convention: un-hiding an indicator has it announced next to the control that
 * owns the accessible name — the same thing said twice (#4918). A replacement
 * that genuinely needs announcing is not an indicator; name the owning control.
 *
 * `tabIndex` is omitted for the same reason, one step on: the element is
 * unconditionally `aria-hidden`, so a tab stop on it is a focusable node inside
 * a hidden subtree. Measured with axe in real Chromium: 0 `aria-hidden-focus`
 * violations becomes 1 the moment it is forwarded.
 *
 * The omission is only half enforceable, and it is worth knowing which half.
 * TypeScript exempts JSX attribute names that are not valid JS identifiers from
 * excess-property checking, so a LITERAL `role=` is a compile error while
 * `aria-hidden` and `aria-label` are not — and a spread (`{...props}`, the
 * ordinary host idiom) bypasses the check for every member, `role` included.
 * Measured, not assumed. So the components also emit their own `aria-hidden`
 * AFTER `{...rest}` and drop a forwarded `tabIndex`: that ordering, not the
 * type, is what enforces the contract. Nothing else is stripped — a forwarded
 * `aria-label` still reaches the DOM, inert inside an `aria-hidden` subtree.
 *
 * Interaction state is deliberately *not* a prop. Hover and focus reach an
 * indicator through the CSS ancestor marker ({@link indicatorScope}) applied
 * by its owner, so a row hover tints the control without anyone threading a
 * boolean through React — and an owner that should not tint its indicator
 * simply does not apply the marker.
 */
export interface IndicatorCommonProps extends Omit<
  BaseProps<HTMLSpanElement>,
  'aria-hidden' | 'role' | 'aria-label' | 'aria-labelledby' | 'tabIndex'
> {
  /** Ref forwarded to the indicator's root element. */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Whether the owning control is disabled. Purely visual — the owner still
   * owns the actual disabled semantics.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Content rendered inside the indicator chrome *instead of* the state mark.
   * CheckboxInput uses this to show a loading Spinner inside the box while a
   * change action is pending.
   */
  children?: ReactNode;
}

/**
 * The `state` prop, present only for families that have states to draw.
 *
 * A family with an empty state space (`busy`) gets `state?: never`, which
 * accepts a host that passes nothing and rejects a host that passes anything.
 * Declaring `state: never` instead — the shape that falls out of the original
 * definition — would make EVERY call site an error, because `never` has no
 * inhabitant to pass.
 *
 * `[T] extends [never]` rather than `T extends never`: a bare conditional
 * distributes over a naked type parameter, and distributing over `never`
 * yields `never` for the whole conditional rather than taking the true branch.
 */
type IndicatorStateProp<F extends IndicatorFamily> = [
  IndicatorState<F>,
] extends [never]
  ? {state?: never}
  : {state: IndicatorState<F>};

/**
 * What an indicator of family `F` is rendered with: the common props, plus the
 * two the family fixes the domain of — `state` and `size`.
 */
export type IndicatorProps<F extends IndicatorFamily = IndicatorFamily> =
  IndicatorCommonProps &
    IndicatorStateProp<F> & {
      /**
       * Control size. The scale is fixed by the family.
       * @default 'md'
       */
      size?: IndicatorSizeOf<F>;
    };

/** An indicator is any component accepting {@link IndicatorProps} of its family. */
export type IndicatorComponent<F extends IndicatorFamily = IndicatorFamily> =
  ComponentType<IndicatorProps<F>>;

/**
 * The named indicators a theme can replace, each mapped to its family.
 *
 * The name is what a theme addresses, and what every component renders
 * through — so replacing `check` reaches every single-selection mark at once,
 * which is the point.
 *
 * Packages outside core can contribute their own through module augmentation.
 * Core ships no default for a name it does not know, so the package that adds
 * the name owns its default — `getIndicator`/`useIndicator` return
 * `| undefined` for it, and the call site supplies the fallback:
 *
 * ```ts
 * declare module '@astryxdesign/core/Indicator' {
 *   interface IndicatorMap {
 *     'brand-star': 'singleSelection';
 *   }
 * }
 *
 * const Star = useIndicator('brand-star') ?? BrandStar;
 * ```
 */
export interface IndicatorMap {
  /** The mark on a chosen option — a checkmark by default. */
  check: 'singleSelection';
  /** The filled circle of a radio control. */
  radio: 'singleSelection';
  /** The box of a checkbox control, including its partial state. */
  checkbox: 'multiSelection';
  /**
   * The visual for work in flight — a rotating ring by default, and the one
   * name that reaches every loading affordance in the system at once: Button,
   * the text and date inputs, Switch, Thumbnail, the selectors, the chat rows.
   */
  spinner: 'busy';
}

export type IndicatorName = keyof IndicatorMap & string;

/** The indicator names belonging to family `F`. */
export type IndicatorNameOfFamily<F extends IndicatorFamily> = {
  [N in IndicatorName]: IndicatorMap[N] extends F ? N : never;
}[IndicatorName];

/**
 * Theme-provided indicator overrides, keyed by indicator name.
 *
 * Family-checked: each entry must accept the state space of that indicator's
 * family, so a replacement cannot be written against the wrong states. A
 * `check` replacement that only handles `collapsed`/`expanded`, or a `radio`
 * replacement expecting `indeterminate`, is a type error rather than a
 * runtime surprise.
 */
export type IndicatorRegistry = {
  [N in IndicatorName]?: IndicatorComponent<IndicatorMap[N]>;
};
