# CLAUDE.md

## Component props
 * For every component define props as interface `<Component>Props`
 * When defining types, prioritize using tRPC types.

## Forms
 * Use react-hook-forms for all forms. Never use useState to hold form values.
 * Define form schema using zod outside component in `formSchema`. Define type `FormValues` inferred from `formSchema`

## Dialogs
 * Dialog must always be defined in a component
 * Design dialogs to accept `handle`. Use `handle` to connect dialog trigger and dialog.
 * Do not put the trigger inside dialog components. Put trigger in the right place and connect it to dialog using `handle`.
 * use `useDialogHandle` to create dialog handle. NEVER USE Dialog.createHandle() directly.
 * NEVER manage open state with `useState` + `open`/`onOpenChange` when a `handle` is also passed. The `handle` owns the state. Mixing them leaves stale `state.open=true` on the handle's store after unmount, causing the next mounted dialog using that handle to flicker open. Use `handle.close()` to dismiss; pass `onOpenChange` (without `open`) only as a callback to react to changes (e.g. resetting a form).

## Routes
 * Design every route as a directory with `route.tsx` component in it
 * Place related components into `_components`, hooks into `_hooks`, libs and functions into `_libs` in the same directory
 * Follow the following pattern, unless there's a reason why code must be designed differently
   * Use `loader` for route, call `ensureQueryData` for queries that are going to be loaded (it helps with preloading it)
   * Use `useSuspenceQueries` or `useSuspenceQuery` to load data inside a component
   * Add `pendingComponent` for a route with skeleton. Call it `Loading` and place in the same file
