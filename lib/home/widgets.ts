/**
 * Home widget stack: which widgets show and in which order.
 * Pure functions, so the rules (no unknown ids, at least one visible) are testable.
 */

export const WIDGET_IDS = ["surf", "lecture", "padel", "todos"] as const;

export type WidgetId = (typeof WIDGET_IDS)[number];

export const WIDGET_NAMES: Record<WidgetId, string> = {
  surf: "Surf forecast",
  lecture: "Next lecture",
  padel: "Padel",
  todos: "To-dos",
};

export interface WidgetPrefs {
  /** Every widget exactly once, in stack order. */
  order: WidgetId[];
  /** Widgets switched off by the user. */
  hidden: WidgetId[];
}

export const DEFAULT_WIDGET_PREFS: WidgetPrefs = { order: [...WIDGET_IDS], hidden: [] };

function isWidgetId(value: unknown): value is WidgetId {
  return (WIDGET_IDS as readonly unknown[]).includes(value);
}

/**
 * Turns whatever was stored into valid prefs: unknown or duplicate ids are dropped,
 * widgets added in a later app version are appended, and one widget always stays visible.
 */
export function normalizeWidgetPrefs(value: unknown): WidgetPrefs {
  if (!value || typeof value !== "object") return DEFAULT_WIDGET_PREFS;
  const { order, hidden } = value as Partial<Record<keyof WidgetPrefs, unknown>>;

  const stored = Array.isArray(order) ? order.filter(isWidgetId) : [];
  const fullOrder = [...new Set([...stored, ...WIDGET_IDS])];
  const hiddenIds = Array.isArray(hidden) ? [...new Set(hidden.filter(isWidgetId))] : [];

  if (hiddenIds.length >= fullOrder.length) return { order: fullOrder, hidden: [] };
  return { order: fullOrder, hidden: hiddenIds };
}

/** The widgets to show, in order. */
export function visibleWidgets(prefs: WidgetPrefs): WidgetId[] {
  return prefs.order.filter((id) => !prefs.hidden.includes(id));
}

/** Switches a widget on or off. The last visible widget can't be switched off. */
export function toggleWidget(prefs: WidgetPrefs, id: WidgetId): WidgetPrefs {
  if (prefs.hidden.includes(id)) {
    return { ...prefs, hidden: prefs.hidden.filter((h) => h !== id) };
  }
  if (visibleWidgets(prefs).length <= 1) return prefs;
  return { ...prefs, hidden: [...prefs.hidden, id] };
}

/** Moves a widget one place up (-1) or down (+1). Does nothing at the ends. */
export function moveWidget(prefs: WidgetPrefs, id: WidgetId, delta: -1 | 1): WidgetPrefs {
  const from = prefs.order.indexOf(id);
  const to = from + delta;
  if (from === -1 || to < 0 || to >= prefs.order.length) return prefs;
  const order = [...prefs.order];
  [order[from], order[to]] = [order[to], order[from]];
  return { ...prefs, order };
}
