import React, { useEffect, useState } from 'react'
import {
  QrCode,
  Copy,
  CheckCircle2,
  Link2,
  UserX,
  RefreshCw,
  AlertCircle,
  Check,
  Clock,
  UserPlus,
  Users,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import Modal from '../components/common/Modal.jsx'

import {
  generateInviteCode,
  submitInviteCode,
  approveConnection,
  getConnectionStatus,
  disconnectSupporter,
} from '../data/api.js'

import { useApp } from '../context/AppContext.jsx'

function QRCodeDisplay({ inviteCode }) {
  return (
    <div className="w-44 h-44 bg-white rounded-2xl border-2 border-ink-100 p-3.5 flex items-center justify-center shadow-sm">
      <QRCodeSVG
        value={inviteCode}
        size={136}
        bgColor="#FFFFFF"
        fgColor="#432C4A"
        level="M"
        includeMargin={false}
      />
    </div>
  )
}

export default function SupporterConnection() {
  const { auth, showToast } = useApp()

  const isSupporter = auth.accountType === 'supporter'

  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  const [codeInput, setCodeInput] = useState('')
  const [copiedCode, setCopiedCode] = useState(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState(null)

  /* ================================================================
     LOAD CONNECTIONS
  ================================================================= */

  const refresh = async () => {
    try {
      setFetchError(null)

      const data = await getConnectionStatus()

      setConnections(
        Array.isArray(data?.connections)
          ? data.connections
          : data?.status && data.status !== 'none'
            ? [data]
            : [],
      )
    } catch (err) {
      setFetchError(
        err?.message || 'Failed to load connection status.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  /* ================================================================
     GENERATE INVITATION
  ================================================================= */

  const handleGenerate = async () => {
    if (actionLoading) return

    try {
      setActionLoading(true)
      setFetchError(null)

      const code = await generateInviteCode()

      if (!code) {
        throw new Error('Invitation code was not returned.')
      }

      const newConnection = {
        id: `local-${Date.now()}`,
        status: 'pending',
        inviteCode: code,
        hasSupporterJoined: false,
        supporterUid: null,
        supporterName: null,
        supporterProfile: null,
      }

      setConnections((current) => [
        ...current.filter(
          (item) =>
            !(
              item.status === 'pending' &&
              !item.supporterUid &&
              item.inviteCode
            ),
        ),
        newConnection,
      ])

      showToast('Invitation code generated!')
    } catch (err) {
      console.error('GENERATE INVITE ERROR:', err)

      showToast(
        err?.message || 'Failed to generate invitation.',
        'error',
      )
    } finally {
      setActionLoading(false)
    }
  }

  /* ================================================================
     COPY INVITE CODE
  ================================================================= */

  const handleCopy = async (code) => {
    if (!code) return

    try {
      await navigator.clipboard.writeText(code)

      setCopiedCode(code)

      showToast('Invitation code copied to clipboard!')

      setTimeout(() => {
        setCopiedCode(null)
      }, 2000)
    } catch {
      showToast(
        'Unable to copy code to clipboard.',
        'error',
      )
    }
  }

  /* ================================================================
     SUPPORTER ENTERS CODE
  ================================================================= */

  const handleSubmitCode = async (event) => {
    event.preventDefault()

    const cleanCode = codeInput.trim().toUpperCase()

    if (!cleanCode || actionLoading) return

    try {
      setActionLoading(true)
      setFetchError(null)

      await submitInviteCode(cleanCode)

      setCodeInput('')

      await refresh()

      showToast('Connection request sent.')
    } catch (err) {
      showToast(
        err?.message || 'Failed to submit invitation code.',
        'error',
      )
    } finally {
      setActionLoading(false)
    }
  }

  /* ================================================================
     APPROVE SPECIFIC SUPPORTER
  ================================================================= */

  const handleApprove = async (connectionId) => {
    if (!connectionId || actionLoading) return

    try {
      setActionLoading(true)
      setFetchError(null)

      await approveConnection(connectionId)

      await refresh()

      showToast('Connection approved successfully!')
    } catch (err) {
      showToast(
        err?.message || 'Failed to approve connection.',
        'error',
      )
    } finally {
      setActionLoading(false)
    }
  }

  /* ================================================================
     DISCONNECT SPECIFIC SUPPORTER
  ================================================================= */

  const handleDisconnect = async () => {
    if (!selectedConnection?.id || actionLoading) return

    try {
      setActionLoading(true)
      setFetchError(null)

      await disconnectSupporter(selectedConnection.id)

      await refresh()

      setConfirmOpen(false)
      setSelectedConnection(null)

      showToast('Connection removed.', 'info')
    } catch (err) {
      showToast(
        err?.message || 'Failed to remove connection.',
        'error',
      )
    } finally {
      setActionLoading(false)
    }
  }

  /* ================================================================
     LOADING
  ================================================================= */

  if (loading) {
    return (
      <div className="animate-pulse text-ink-400 text-sm py-20 text-center">
        Loading connection status…
      </div>
    )
  }

  /* ================================================================
     ERROR
  ================================================================= */

  if (fetchError) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-3">
        <AlertCircle
          size={36}
          className="text-rose-500"
        />

        <p className="text-rose-600 font-medium">
          Could not load connection status
        </p>

        <p className="text-ink-500 text-sm max-w-sm">
          {fetchError}
        </p>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={refresh}
        >
          Retry
        </Button>
      </div>
    )
  }

  /* ================================================================
     FILTERS
  ================================================================= */

  const pendingRequests = connections.filter(
    (item) =>
      item.status === 'pending' &&
      item.supporterUid,
  )

  const pendingInvites = connections.filter(
    (item) =>
      item.status === 'pending' &&
      !item.supporterUid &&
      item.inviteCode,
  )

  const activeConnections = connections.filter(
    (item) => item.status === 'active',
  )

  /* ================================================================
     PAGE
  ================================================================= */

  return (
    <>
      <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fadeIn">

        {/* HEADER */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            {isSupporter
              ? 'Connect with user'
              : 'Supporter Circle'}
          </h1>

          <p className="text-ink-500 text-sm mt-1">
            {isSupporter
              ? 'Connect to the person you are supporting using their unique invitation code.'
              : 'Invite trusted people and control what they can see.'}
          </p>
        </div>

        {/* ============================================================
            SUPPORTER VIEW
        ============================================================= */}

        {isSupporter && (
          <>
            {connections.length === 0 ? (
              <Card className="!py-8">
                <form
                  onSubmit={handleSubmitCode}
                  className="flex flex-col gap-4 items-center text-center max-w-md mx-auto"
                >
                  <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
                    <Link2
                      size={28}
                      className="text-teal-600"
                    />
                  </div>

                  <div>
                    <h2 className="font-display font-semibold text-ink-900 text-lg">
                      Enter Invitation Code
                    </h2>

                    <p className="text-sm text-ink-500 mt-1">
                      Enter the invitation code shared by
                      the person you are supporting.
                    </p>
                  </div>

                  <div className="w-full max-w-xs">
                    <Input
                      value={codeInput}
                      onChange={(event) =>
                        setCodeInput(
                          event.target.value.toUpperCase(),
                        )
                      }
                      placeholder="e.g. 7F3KQ2"
                      className="text-center font-mono tracking-widest text-xl font-bold uppercase"
                      maxLength={8}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="teal"
                    size="lg"
                    disabled={
                      actionLoading ||
                      !codeInput.trim()
                    }
                    className="w-full max-w-xs"
                  >
                    {actionLoading
                      ? 'Sending request…'
                      : 'Send connection request'}
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="flex flex-col gap-4">
                <div>
                  <h2 className="font-display font-semibold text-ink-900 text-lg">
                    Your connections
                  </h2>

                  <p className="text-sm text-ink-500 mt-1">
                    Your connection requests and active
                    supporter relationships appear here.
                  </p>
                </div>

                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="rounded-2xl border border-ink-100 bg-ink-50/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink-900">
                          {connection.ownerName ||
                            connection.connectedPersonName ||
                            'User'}
                        </p>

                        <p className="text-xs text-ink-500 mt-1">
                          {connection.status === 'active'
                            ? 'Connected'
                            : 'Pending approval'}
                        </p>
                      </div>

                      {connection.status === 'active' && (
                        <CheckCircle2
                          size={22}
                          className="text-teal-600"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </>
        )}

        {/* ============================================================
            OWNER VIEW
        ============================================================= */}

        {!isSupporter && (
          <>
            
            {/* PENDING SUPPORTER REQUESTS */}
            {pendingRequests.length > 0 && (
              <Card className="!p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Clock
                      size={20}
                      className="text-amber-600"
                    />
                  </div>

                  <div>
                    <h2 className="font-display font-semibold text-ink-900 text-lg">
                      Pending requests
                    </h2>

                    <p className="text-sm text-ink-500">
                      Review who wants to join your Supporter Circle.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {pendingRequests.map((connection) => {
                    const profile =
                      connection.supporterProfile || {}

                    return (
                      <div
                        key={connection.id}
                        className="rounded-2xl border border-ink-100 bg-white p-5"
                      >
                        {/* Supporter header */}
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center overflow-hidden shrink-0">
                            {profile.photoUrl ? (
                              <img
                                src={profile.photoUrl}
                                alt={profile.name || 'Supporter'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserPlus
                                size={24}
                                className="text-rose-500"
                              />
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-display font-semibold text-ink-900 text-lg">
                              {profile.name ||
                                connection.supporterName ||
                                'Supporter'}
                            </h3>

                            <p className="text-sm text-ink-500 mt-1">
                              {profile.email ||
                                'Email not available'}
                            </p>

                            <p className="text-xs text-amber-600 font-semibold mt-2">
                              Waiting for approval
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid sm:grid-cols-2 gap-3 mt-5">
                          <div className="rounded-xl bg-ink-50 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-ink-400">
                              Account type
                            </p>

                            <p className="text-sm font-medium text-ink-800 mt-1">
                              {profile.role || 'Supporter'}
                            </p>
                          </div>

                          <div className="rounded-xl bg-ink-50 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-ink-400">
                              Phone
                            </p>

                            <p className="text-sm font-medium text-ink-800 mt-1">
                              {profile.phone || 'Not provided'}
                            </p>
                          </div>

                          <div className="rounded-xl bg-ink-50 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-ink-400">
                              City
                            </p>

                            <p className="text-sm font-medium text-ink-800 mt-1">
                              {profile.city || 'Not provided'}
                            </p>
                          </div>

                          <div className="rounded-xl bg-ink-50 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-ink-400">
                              Invitation code
                            </p>

                            <p className="text-sm font-mono font-bold text-ink-800 mt-1">
                              {connection.inviteCode || '—'}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-5">
                          <Button
                            variant="primary"
                            onClick={() =>
                              handleApprove(connection.id)
                            }
                            disabled={actionLoading}
                          >
                            {actionLoading
                              ? 'Approving…'
                              : 'Approve'}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedConnection(connection)
                              setConfirmOpen(true)
                            }}
                            disabled={actionLoading}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}

            {/* ACTIVE SUPPORTERS */}
            <Card className="!p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <CheckCircle2
                      size={20}
                      className="text-teal-600"
                    />
                  </div>

                  <div>
                    <h2 className="font-display font-semibold text-ink-900 text-lg">
                      Connected supporters
                    </h2>

                    <p className="text-sm text-ink-500">
                      People currently connected to you.
                    </p>
                  </div>
                </div>

                <span className="text-sm font-semibold text-ink-400">
                  {activeConnections.length}
                </span>
              </div>

              {activeConnections.length === 0 ? (
                <div className="text-center py-8">
                  <Users
                    size={32}
                    className="mx-auto text-ink-300"
                  />

                  <p className="text-sm text-ink-500 mt-3">
                    No active supporters yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeConnections.map((connection) => {
                    const profile =
                      connection.supporterProfile || {}

                    return (
                      <div
                        key={connection.id}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-ink-50/60 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center">
                            <Check
                              size={20}
                              className="text-teal-600"
                            />
                          </div>

                          <div>
                            <p className="font-semibold text-ink-900">
                              {profile.name ||
                                connection.supporterName ||
                                'Supporter'}
                            </p>

                            {profile.email && (
                              <p className="text-xs text-ink-500 mt-0.5">
                                {profile.email}
                              </p>
                            )}

                            <p className="text-xs text-teal-600 font-medium mt-1">
                              Connected
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="danger"
                          size="sm"
                          icon={UserX}
                          onClick={() => {
                            setSelectedConnection(
                              connection,
                            )
                            setConfirmOpen(true)
                          }}
                          disabled={actionLoading}
                        >
                          Disconnect
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* ACTIVE INVITATIONS */}
            <Card className="!p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                    <QrCode
                      size={20}
                      className="text-rose-500"
                    />
                  </div>

                  <div>
                    <h2 className="font-display font-semibold text-ink-900 text-lg">
                      Invitations
                    </h2>

                    <p className="text-sm text-ink-500">
                      Generate a separate code for each
                      supporter.
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  icon={QrCode}
                  onClick={handleGenerate}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? 'Generating…'
                    : 'Invite supporter'}
                </Button>
              </div>

              {pendingInvites.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-ink-500">
                    No active invitations.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pendingInvites.map((connection) => (
                    <div
                      key={connection.id}
                      className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        <QRCodeDisplay
                          inviteCode={
                            connection.inviteCode
                          }
                        />

                        <div className="flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                            Invitation code
                          </p>

                          <div className="flex items-center gap-3 mt-2">
                            <span className="font-mono font-bold text-2xl tracking-widest text-rose-700">
                              {connection.inviteCode}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  connection.inviteCode,
                                )
                              }
                              className="p-2 rounded-lg hover:bg-rose-100 text-rose-600"
                              aria-label="Copy invitation code"
                            >
                              {copiedCode ===
                              connection.inviteCode ? (
                                <Check
                                  size={18}
                                  className="text-teal-600"
                                />
                              ) : (
                                <Copy size={18} />
                              )}
                            </button>
                          </div>

                          <p className="text-xs text-ink-400 mt-2">
                            This invitation is waiting for a
                            supporter to join.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      {/* ================================================================
          DISCONNECT / REJECT MODAL
      ================================================================= */}

      <Modal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setSelectedConnection(null)
        }}
        title={
          selectedConnection?.status === 'pending'
            ? 'Reject this request?'
            : 'Remove this connection?'
        }
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setConfirmOpen(false)
                setSelectedConnection(null)
              }}
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              onClick={handleDisconnect}
              disabled={actionLoading}
            >
              {actionLoading
                ? 'Removing…'
                : selectedConnection?.status ===
                    'pending'
                  ? 'Reject request'
                  : 'Remove connection'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-600 leading-relaxed">
          {selectedConnection?.supporterProfile?.name ||
            selectedConnection?.supporterName ||
            selectedConnection?.connectedPersonName ||
            'This supporter'}{' '}
          will no longer have access to this connection.
        </p>
      </Modal>
    </>
  )
}