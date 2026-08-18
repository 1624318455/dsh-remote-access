/**
 * The dsh-remote-access settings card — a progressive-disclosure panel.
 *
 * Layout (layered accordion, one outer section open at a time):
 *
 *   外层折叠面板（一次展开一个模块）
 *   ├─ ① 页面访问密码（安全等级 1）        ← 默认展开
 *   ├─ ② 公网安全配置（安全等级 2）
 *   │    └─ 内层步骤折叠 ① 生成哈希 → ② 参数 → ③ Caddyfile/命令
 *   ├─ ③ 安全风险审计
 *   └─ ④ 小白使用指引
 *
 * Each outer section shows a live status badge in its header so the whole
 * configuration state is scannable without expanding anything. The Caddy
 * module's inner steps auto-advance: generating a hash opens the parameters
 * step, generating the Caddyfile opens the output step.
 *
 * All outputs are strings the user copies; the plugin never writes files or
 * starts programs.
 */

import { useState } from 'react'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from './slot-contract.ts'
import type { RemoteAccessController, RemoteAccessState } from './controller.ts'
import { translate, resolveLang, type Lang } from './locales.ts'

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

/** One outer accordion section key. */
type OuterSection = 'lock' | 'caddy' | 'audit' | 'help'
/** One inner Caddy step key. */
type CaddyStep = 'hash' | 'params' | 'output'

interface Badge {
  text: string
  cls: string
}

/**
 * Render the plugin card.
 * @param props - locale-independent state + the controller actions.
 */
export function RemoteAccessCard(props: RemoteAccessCardProps): JSX.Element {
  const state = props.useRemoteAccess(snapshot => snapshot)
  const copied = state.copied

  // Outer accordion: exactly one section open; default to the page password.
  const [openSection, setOpenSection] = useState<OuterSection | null>('lock')
  const toggleSection = (section: OuterSection): void => {
    setOpenSection(prev => (prev === section ? null : section))
  }

  // Inner Caddy steps: start at the hash step; auto-advance on success.
  const [openStep, setOpenStep] = useState<CaddyStep | null>('hash')
  const toggleStep = (step: CaddyStep): void => {
    setOpenStep(prev => (prev === step ? null : step))
  }

  const runGenerateHash = async (): Promise<void> => {
    const result = await props.generateHash(state.hashGenPassword, state.hashGenRounds)
    if (result.ok) setOpenStep('params')
  }

  const runGenerateCaddyfile = (): void => {
    const result = props.generateCaddyfile()
    if (result.ok) setOpenStep('output')
  }

  // --- header badges (scannable at a glance) ------------------------------
  const lockBadge: Badge = state.pageLockEnabled
    ? { text: t('badge.lockOn'), cls: 'dra-ok' }
    : { text: t('badge.lockOff'), cls: 'dra-muted' }

  const hashReady = state.hashGenResult !== ''
  const caddyReady = state.caddyOutput !== ''
  const caddyBadge: Badge = hashReady
    ? { text: t('badge.hashReady'), cls: 'dra-ok' }
    : { text: t('badge.hashPending'), cls: 'dra-warn' }

  const dangerCount = state.auditFindings.filter(f => f.severity === 'danger').length
  const auditBadge: Badge = state.auditError !== ''
    ? { text: t('badge.auditUnknown'), cls: 'dra-warn' }
    : dangerCount > 0
      ? { text: t('badge.auditDanger', { n: dangerCount }), cls: 'dra-danger' }
      : state.auditFindings.length > 0
        ? { text: t('badge.auditSafe'), cls: 'dra-ok' }
        : { text: t('badge.auditUnknown'), cls: 'dra-muted' }

  return (
    <div className="dra-card">
      {/* Card header — always visible, states the purpose + overall risk. */}
      <div className="dra-card-head">
        <h4>{t('card.title')}</h4>
        <div className="dra-muted">{t('card.subtitle')}</div>
      </div>

      {/* ==================== outer accordion ==================== */}
      <div className="dra-accordion">

        {/* ① 页面访问密码 · 安全等级 1 */}
        <div className="dra-acc-item">
          <button
            type="button"
            className="dra-acc-header"
            aria-expanded={openSection === 'lock'}
            onClick={() => toggleSection('lock')}
          >
            <span className="dra-acc-caret">{openSection === 'lock' ? '▾' : '▸'}</span>
            <span className="dra-acc-title">{t('lock.section')}</span>
            <span className={`dra-acc-badge ${lockBadge.cls}`}>{lockBadge.text}</span>
          </button>
          {openSection === 'lock' && (
            <div className="dra-acc-body">
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
          )}
        </div>

        {/* ② 公网安全配置 · 安全等级 2 */}
        <div className="dra-acc-item">
          <button
            type="button"
            className="dra-acc-header"
            aria-expanded={openSection === 'caddy'}
            onClick={() => toggleSection('caddy')}
          >
            <span className="dra-acc-caret">{openSection === 'caddy' ? '▾' : '▸'}</span>
            <span className="dra-acc-title">{t('caddy.section')}</span>
            <span className={`dra-acc-badge ${caddyBadge.cls}`}>{caddyBadge.text}</span>
          </button>
          {openSection === 'caddy' && (
            <div className="dra-acc-body">
              <div className="dra-banner-info">{t('caddy.warning')}</div>

              {/* ---------- inner step accordion ---------- */}
              <div className="dra-accordion dra-accordion-inner">

                {/* Step ① 生成 BCrypt 哈希 */}
                <div className="dra-acc-item dra-step-item">
                  <button
                    type="button"
                    className="dra-acc-header"
                    aria-expanded={openStep === 'hash'}
                    onClick={() => toggleStep('hash')}
                  >
                    <span className="dra-acc-caret">{openStep === 'hash' ? '▾' : '▸'}</span>
                    <span className="dra-step-num">①</span>
                    <span className="dra-acc-title">{t('caddy.hashTitle')}</span>
                    {hashReady && <span className="dra-acc-badge dra-ok">✓</span>}
                  </button>
                  {openStep === 'hash' && (
                    <div className="dra-acc-body">
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
                          onClick={() => { void runGenerateHash() }}
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
                    </div>
                  )}
                </div>

                {/* Step ② Caddy 配置参数 */}
                <div className="dra-acc-item dra-step-item">
                  <button
                    type="button"
                    className="dra-acc-header"
                    aria-expanded={openStep === 'params'}
                    onClick={() => toggleStep('params')}
                  >
                    <span className="dra-acc-caret">{openStep === 'params' ? '▾' : '▸'}</span>
                    <span className="dra-step-num">②</span>
                    <span className="dra-acc-title">{t('caddy.paramsTitle')}</span>
                    {caddyReady && <span className="dra-acc-badge dra-ok">✓</span>}
                  </button>
                  {openStep === 'params' && (
                    <div className="dra-acc-body">
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
                          onClick={() => runGenerateCaddyfile()}
                        >
                          {t('caddy.generateFile')}
                        </button>
                        {state.hashGenResult === '' && <span className="dra-muted">{t('caddy.hashFirst')}</span>}
                      </div>
                      {state.caddyError !== '' && (
                        <div className="dra-danger">{t('caddy.fileError')}{state.caddyError}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Step ③ Caddyfile + 启动命令 */}
                <div className="dra-acc-item dra-step-item">
                  <button
                    type="button"
                    className="dra-acc-header"
                    aria-expanded={openStep === 'output'}
                    onClick={() => toggleStep('output')}
                  >
                    <span className="dra-acc-caret">{openStep === 'output' ? '▾' : '▸'}</span>
                    <span className="dra-step-num">③</span>
                    <span className="dra-acc-title">{t('caddy.fileTitle')}</span>
                  </button>
                  {openStep === 'output' && (
                    <div className="dra-acc-body">
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

                      <div className="dra-step-divider" />
                      <div className="dra-muted">{t('caddy.mac')}</div>
                      <textarea className="dra-textarea" readOnly value={props.macCommand()} />
                      <div className="dra-row">
                        <button className="dra-btn" onClick={() => { void props.copyText(props.macCommand(), 'mac') }}>
                          {t('caddy.copyMac')}
                        </button>
                        {copied === 'mac' && <span className="dra-copied">{t('copied')}</span>}
                      </div>

                      <div className="dra-step-divider" />
                      <div className="dra-muted">{t('caddy.win')}</div>
                      <textarea className="dra-textarea" readOnly value={props.winCommand()} />
                      <div className="dra-row">
                        <button className="dra-btn" onClick={() => { void props.copyText(props.winCommand(), 'win') }}>
                          {t('caddy.copyWin')}
                        </button>
                        {copied === 'win' && <span className="dra-copied">{t('copied')}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* ---------- /inner step accordion ---------- */}
            </div>
          )}
        </div>

        {/* ③ 安全风险审计 */}
        <div className="dra-acc-item">
          <button
            type="button"
            className="dra-acc-header"
            aria-expanded={openSection === 'audit'}
            onClick={() => toggleSection('audit')}
          >
            <span className="dra-acc-caret">{openSection === 'audit' ? '▾' : '▸'}</span>
            <span className="dra-acc-title">{t('audit.section')}</span>
            <span className={`dra-acc-badge ${auditBadge.cls}`}>{auditBadge.text}</span>
          </button>
          {openSection === 'audit' && (
            <div className="dra-acc-body">
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
          )}
        </div>

        {/* ④ 小白使用指引 */}
        <div className="dra-acc-item">
          <button
            type="button"
            className="dra-acc-header"
            aria-expanded={openSection === 'help'}
            onClick={() => toggleSection('help')}
          >
            <span className="dra-acc-caret">{openSection === 'help' ? '▾' : '▸'}</span>
            <span className="dra-acc-title">{t('help.section')}</span>
          </button>
          {openSection === 'help' && (
            <div className="dra-acc-body">
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
          )}
        </div>
      </div>
    </div>
  )
}
