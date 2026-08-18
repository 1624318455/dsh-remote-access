/**
 * Local SlotMap contract for the two slots this plugin registers into:
 *
 * - `settings.plugin.item` — one plugin card inside the plugin configuration
 *   section (keyed slot, key = the settings namespace this card owns).
 * - `shell.overlay` — the frame-wide floating layer; the page-lock modal
 *   lives here so it renders above every column and blocks the app.
 *
 * Both slots are declared by the running shell; this module pins the exact
 * contracts locally (the published rc.6 types lag the keyed/list shapes).
 */

import type {} from '@deepseek-ai/dsh-client-ui-slots'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /** One plugin's card inside the plugin configuration section, keyed by the settings namespace. */
    'settings.plugin.item': {
      kind: 'keyed'
      scope: 'root'
      owner: {
        /** Marker field: card owner props are intentionally empty. */
        children?: never
      }
    }
    /** Frame-wide floating layer above every column. */
    'shell.overlay': {
      kind: 'list'
      scope: 'root'
      owner: {
        /** Marker field: overlay owner props are intentionally empty. */
        children?: never
      }
    }
  }
}

export {}
