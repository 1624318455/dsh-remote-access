/**
 * The dsh-remote-access settings card — the full five-section panel from the
 * plugin spec, rendered inside the DSH settings shell (`settings.plugin.item`,
 * keyed by the settings namespace).
 *
 * All outputs are strings the user copies; the plugin never writes files or
 * starts programs.
 */

import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from './slot-contract.ts'
import type { RemoteAccessController, RemoteAccessState } from './controller.ts'
import { translate, resolveLang, type Lang } from './locales.ts'
import { CADDY_DEFAULT_PORT, CADDY_DEFAULT_BACKEND, CADDY_DEFAULT_USER } from '../lib/caddy.ts'

const lang: Lang = resolveLang(undefined)
const t = (key: string, params?: Record<string, string | number>): string => translate(lang, key, params)

/** Business face injected into both the card and the lock overlay. */
export interface RemoteAccessFace {
  hooks: {
    remoteAccess: RemoteAccessController
  }
  verifyAndUnlock: (password: string) => Promise<{ ok: boolean; error?: string }>
  clearLocalToken: () => void
  savePagePassword: (password: string) => Promise<{ ok: boolean; error?: string }>
  disablePageLock: () => Promise<void>
  generateHash: (password: string, rounds: number) => Promise<{ ok: boolean; hash?: string; error?: string }>
  generateCaddyfile: () => { ok: boolean; error?: string }
  macCommand: () => string
  winCommand: () => string
  refreshAudit: () => Promise<void>
  copyText: (text: string, label: string) => Promise<boolean>
  setField: <K extends keyof RemoteAccessState>(field: K, value: RemoteAccessState[K]) => void
}

export type RemoteAccessCardProps = PropsRuntime<'settings.plugin.item'> & InjectFace<RemoteAccessFace>

const severityClass: Record<string, string> = {
  danger: 'dra-danger',
  warn: 'dra-warn',
  ok: 'dra-ok',
}

/**
 * Render the plugin card.
 * @param props - locale-independent state + the controller actions.
 */
export function RemoteAccessCard(props: RemoteAccessCardProps): JSX.Element {
  const state = props.useRemoteAccess(snapshot => snapshot)
  const copied = state.copied

  return (
    <div className="dra-card">
      <div className="dra-section">
        <h4>{t('card.title')}</h4>
        <div className="dra-muted">{t('card.subtitle')}</div>
      </div>

      {/* ① 页面访问密码 · 安全等级 1 */}
      <div className="dra-section">
        <h4>{t('lock.section')}</h4>
        <div className="dra-banner-danger">{t('lock.warning')}</div>
        <div className="dra-row">
          <span className="dra-status">
            {state.pageLockEnabled ? t('lock.status.on') : t('lock.status.off')}
            {' · '}
            {state.hashConfigured ? t('lock.status.hash') : t('lock.status.nohash')}
          </span>
        </div>
        <div className="dra-row">
          <input
            className="dra-input"
            type="password"
            placeholder={t('lock.passwordPlaceholder')}
            value={state.pagePassword}
            onChange={(e) => props.setField('pagePassword', e.target.value)}
          />
          <button
            className="dra-btn dra-btn-primary"
            disabled={state.savingPassword || state.pagePassword.length === 0}
            onClick={() => { void props.savePagePassword(state.pagePassword) }}
          >
            {state.savingPassword ? t('lock.saving') : t('lock.save')}
          </button>
        </div>
        {state.passwordSaved && <div className="dra-ok">{t('lock.saved')}</div>}
        {state.passwordError === 'empty' && <div className="dra-danger">{t('lock.error.empty')}</div>}
        {state.passwordError === 'too-short' && <div className="dra-danger">{t('lock.error.tooShort')}</div>}
        {state.passwordError === 'write-failed' && <div className="dra-danger">{t('lock.error.writeFailed')}</div>}
        <div className="dra-row">
          <button className="dra-btn" onClick={() => props.clearLocalToken()}>
            {t('lock.clearToken')}
          </button>
          {state.pageLockEnabled && (
            <button className="dra-btn" onClick={() => { void props.disablePageLock() }}>
              {t('lock.disable')}
            </button>
          )}
        </div>
        {state.pageLockEnabled && <div className="dra-muted">{t('lock.disableHint')}</div>}
      </div>

      {/* ② 公网安全配置 · 安全等级 2 */}
      <div className="dra-section">
        <h4>{t('caddy.section')}</h4>
        <div className="dra-banner-info">{t('caddy.warning')}</div>

        <div className="dra-muted">{t('caddy.hashTitle')}</div>
        <div className="dra-row">
          <input
            className="dra-input"
            type="password"
            placeholder={t('caddy.hashPassword')}
            value={state.hashGenPassword}
            onChange={(e) => props.setField('hashGenPassword', e.target.value)}
          />
          <input
            className="dra-input"
            type="number"
            style={{ flex: '0 0 80px' }}
            min={4}
            max={31}
            value={state.hashGenRounds}
            onChange={(e) => props.setField('hashGenRounds', Number(e.target.value))}
          />
          <button
            className="dra-btn"
            disabled={state.hashGenPassword.length === 0}
            onClick={() => { void props.generateHash(state.hashGenPassword, state.hashGenRounds) }}
          >
            {t('caddy.generateHash')}
          </button>
        </div>
        {state.hashGenError === 'empty' && <div className="dra-danger">{t('lock.error.empty')}</div>}
        {state.hashGenError === 'gen-failed' && <div className="dra-danger">{t('caddy.fileError')}</div>}
        {state.hashGenResult !== '' && (
          <div className="dra-row">
            <textarea className="dra-textarea" readOnly value={state.hashGenResult} />
          </div>
        )}
        <div className="dra-row">
          <button
            className="dra-btn"
            disabled={state.hashGenResult === ''}
            onClick={() => { void props.copyText(state.hashGenResult, 'hash') }}
          >
            {t('caddy.copyHash')}
          </button>
          {copied === 'hash' && <span className="dra-copied">{t('copied')}</span>}
        </div>

        <div className="dra-muted">{t('caddy.paramsTitle')}</div>
        <div className="dra-row">
          <input
            className="dra-input"
            placeholder={t('caddy.port')}
            value={state.caddyPortInput}
            onChange={(e) => props.setField('caddyPortInput', e.target.value)}
          />
        </div>
        <div className="dra-row">
          <input
            className="dra-input"
            placeholder={t('caddy.backend')}
            value={state.caddyBackendInput}
            onChange={(e) => props.setField('caddyBackendInput', e.target.value)}
          />
        </div>
        <div className="dra-row">
          <input
            className="dra-input"
            placeholder={t('caddy.user')}
            value={state.caddyUserInput}
            onChange={(e) => props.setField('caddyUserInput', e.target.value)}
          />
        </div>
        <div className="dra-row">
          <button
            className="dra-btn dra-btn-primary"
            disabled={state.hashGenResult === ''}
            onClick={() => props.generateCaddyfile()}
          >
            {t('caddy.generateFile')}
          </button>
          {state.hashGenResult === '' && <span className="dra-muted">{t('caddy.hashFirst')}</span>}
        </div>
        {state.caddyError !== '' && <div className="dra-danger">{t('caddy.fileError')}{state.caddyError}</div>}
        {state.caddyOutput !== '' && (
          <div className="dra-row">
            <textarea className="dra-textarea" readOnly value={state.caddyOutput} />
          </div>
        )}
        <div className="dra-row">
          <button
            className="dra-btn"
            disabled={state.caddyOutput === ''}
            onClick={() => { void props.copyText(state.caddyOutput, 'caddy') }}
          >
            {t('caddy.copyFile')}
          </button>
          {copied === 'caddy' && <span className="dra-copied">{t('copied')}</span>}
        </div>

        <div className="dra-muted">{t('caddy.mac')}</div>
        <textarea className="dra-textarea" readOnly value={props.macCommand()} />
        <div className="dra-row">
          <button className="dra-btn" onClick={() => { void props.copyText(props.macCommand(), 'mac') }}>
            {t('caddy.copyMac')}
          </button>
          {copied === 'mac' && <span className="dra-copied">{t('copied')}</span>}
        </div>

        <div className="dra-muted">{t('caddy.win')}</div>
        <textarea className="dra-textarea" readOnly value={props.winCommand()} />
        <div className="dra-row">
          <button className="dra-btn" onClick={() => { void props.copyText(props.winCommand(), 'win') }}>
            {t('caddy.copyWin')}
          </button>
          {copied === 'win' && <span className="dra-copied">{t('copied')}</span>}
        </div>
      </div>

      {/* ③ 安全风险审计 */}
      <div className="dra-section">
        <h4>{t('audit.section')}</h4>
        <div className="dra-muted">{t('audit.desc')}</div>
        <div className="dra-row">
          <button className="dra-btn" onClick={() => { void props.refreshAudit() }}>
            {t('audit.refresh')}
          </button>
        </div>
        {state.auditError !== '' && <div className="dra-danger">{t('audit.error')}</div>}
        {state.auditFindings.map((finding, index) => (
          <div key={`${finding.key}-${index}`} className={`dra-row ${severityClass[finding.severity] ?? 'dra-muted'}`}>
            <strong>[{t(`audit.severity.${finding.severity}`)}]</strong>
            <span>{t(finding.key, finding.key === 'audit.envHint' ? {} : undefined)}</span>
          </div>
        ))}
      </div>

      {/* ④ 小白使用指引 */}
      <div className="dra-section">
        <h4>{t('help.section')}</h4>
        <div className="dra-muted">{t('help.intro')}</div>
        <div>{t('help.download')}</div>
        <ul>
          <li>{t('help.downloadMac')}</li>
          <li>{t('help.downloadWin')}</li>
        </ul>
        <div><a href="https://github.com/caddyserver/caddy/releases" target="_blank" rel="noreferrer">{t('help.github')}</a></div>
        <div>{t('help.step2')}</div>
        <ul>
          <li>{t('help.step2Mac')}</li>
          <li>{t('help.step2Win')}</li>
        </ul>
        <div>{t('help.step3')}</div>
        <div>{t('help.step4')}</div>
        <div>{t('help.step5')}</div>
        <code>{t('help.tunnel')}</code>
        <div>{t('help.pitfalls')}</div>
        <ul>
          <li>{t('help.pitfall1')}</li>
          <li>{t('help.pitfall2')}</li>
          <li>{t('help.pitfall3')}</li>
          <li>{t('help.pitfall4')}</li>
          <li>{t('help.pitfall5')}</li>
        </ul>
        <div className="dra-banner-danger">{t('help.risk')}</div>
      </div>
    </div>
  )
}
