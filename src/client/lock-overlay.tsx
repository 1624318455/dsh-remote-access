/**
 * The page-lock overlay — a full-screen modal rendered inside `shell.overlay`
 * (frame-wide, above every column) while the page lock is engaged.
 *
 * Security level 1: this modal only blocks the web page. It never intercepts
 * `/api` or `/ws`; the plugin spec explicitly documents that public exposure
 * requires the Caddy reverse proxy (level 2).
 */

import { useState } from 'react'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from './slot-contract.ts'
import type { RemoteAccessFace } from './card.tsx'
import { translate, resolveLang, type Lang } from './locales.ts'

const lang: Lang = resolveLang(undefined)
const t = (key: string): string => translate(lang, key)

export type LockOverlayProps = PropsRuntime<'shell.overlay'> & InjectFace<RemoteAccessFace>

/**
 * Render the lock modal when engaged; render nothing otherwise.
 * @param props - the shared controller face.
 */
export function LockOverlay(props: LockOverlayProps): JSX.Element | null {
  const state = props.useRemoteAccess(snapshot => snapshot)
  const [password, setPassword] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')

  if (!state.locked) return null

  const submit = async (): Promise<void> => {
    if (verifying) return
    if (password.length === 0) {
      setError(t('overlay.error.empty'))
      return
    }
    setVerifying(true)
    setError('')
    const result = await props.verifyAndUnlock(password)
    setVerifying(false)
    if (!result.ok) {
      if (result.error === 'not-configured') setError(t('overlay.error.notConfigured'))
      else if (result.error === 'network') setError(t('overlay.error.network'))
      else setError(t('overlay.error.wrong'))
      setPassword('')
    }
  }

  return (
    <div className="dra-lock-backdrop" role="dialog" aria-modal="true">
      <div className="dra-lock-card">
        <h2>{t('overlay.title')}</h2>
        <div>{t('overlay.desc')}</div>
        <input
          className="dra-input"
          type="password"
          autoFocus
          placeholder={t('overlay.placeholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void submit() }}
          disabled={verifying}
        />
        <button className="dra-btn dra-btn-primary" onClick={() => { void submit() }} disabled={verifying}>
          {verifying ? t('overlay.unlocking') : t('overlay.unlock')}
        </button>
        <div className="dra-lock-error">{error}</div>
        <div className="dra-banner-danger">{t('overlay.hint')}</div>
        <div className="dra-lock-hint">{t('overlay.hint2')}</div>
      </div>
    </div>
  )
}
