import React, { useEffect, useState } from 'react'
import {
  QrCode, Copy, CheckCircle2, Link2, UserX, RefreshCw,
  AlertCircle, Check, Users, Clock,
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

  const [connection, setConnection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [codeInput, setCodeInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const refresh = async () => {
    try {
      setFetchError(null)
      const data = await getConnectionStatus()
      setConnection(data)
    } catch (err) {
      setFetchError(err?.message || 'Failed to load connection status.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  // ----------------------------------------------------
  // OWNER: Generate Invitation Code
  // ----------------------------------------------------
  const handleGenerate = async () => {
    try {
      setActionLoading(true)
      setFetchError(null)
      await generateInviteCode()
      await refresh()
      showToast('Invitation code generated!')
    } catch (err) {
      showToast(err?.message || 'Failed to generate invitation.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // ----------------------------------------------------
  // Copy Code to Clipboard
  // ----------------------------------------------------
  const handleCopy = async () => {
    const inviteCode = connection?.inviteCode || ''
    if (!inviteCode) return

    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      showToast('Invitation code copied to clipboard!')
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      showToast('Unable to copy code to clipboard.', 'error')
    }
  }

  // ----------------------------------------------------
  // SUPPORTER: Submit Invitation Code
  // ----------------------------------------------------
  const handleSubmitCode = async (e) => {
    e.preventDefault()
    const cleanCode = codeInput.trim().toUpperCase()
    if (!cleanCode) return

    try {
      setActionLoading(true)
      setFetchError(null)
      await submitInviteCode(cleanCode)
      setCodeInput('')
      await refresh()
      showToast('Connection request sent.')
    } catch (err) {
      showToast(err?.message || 'Failed to submit invitation code.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // ----------------------------------------------------
  // OWNER: Approve Incoming Request
  // ----------------------------------------------------
  const handleApprove = async () => {
    try {
      setActionLoading(true)
      setFetchError(null)
      await approveConnection()
      await refresh()
      showToast('Connection approved successfully!')
    } catch (err) {
      showToast(err?.message || 'Failed to approve connection.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // ----------------------------------------------------
  // Disconnect / Revoke Connection
  // ----------------------------------------------------
  const handleDisconnect = async () => {
    try {
      setActionLoading(true)
      setFetchError(null)
      await disconnectSupporter()
      await refresh()
      setConfirmOpen(false)
      showToast('Connection removed.', 'info')
    } catch (err) {
      showToast(err?.message || 'Failed to remove connection.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading connection status…</div>
  }

  if (fetchError) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-3">
        <AlertCircle size={36} className="text-rose-500" />
        <p className="text-rose-600 font-medium">Could not load connection status</p>
        <p className="text-ink-500 text-sm max-w-sm">{fetchError}</p>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={refresh}>
          Retry
        </Button>
      </div>
    )
  }

  const connStatus = connection?.status || 'none'
  const isOwner = !isSupporter

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
          {isSupporter ? 'Connect with user' : 'Supporter connection'}
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          {isSupporter
            ? 'Connect to the person you are supporting using their unique invitation code.'
            : 'Invite a trusted person to see what you choose to share.'}
        </p>
      </div>

      {/* ================================================================= */}
      {/* CASE 1: CONNECTED (ACTIVE) */}
      {/* ================================================================= */}
      {connStatus === 'connected' && (
        <Card className="flex flex-col items-center text-center gap-4 !py-10">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-teal-600" />
          </div>

          <div>
            <h2 className="font-display font-semibold text-ink-900 text-xl">
              Connected to {connection.connectedPersonName}
            </h2>
            <p className="text-sm text-ink-500 max-w-sm mt-1">
              {isSupporter
                ? 'You will now see the updates they choose to share on your Dashboard and AI Insights.'
                : 'They can now view the health metrics you have allowed in your Sharing Permissions.'}
            </p>
          </div>

          <div className="flex gap-3 mt-3">
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={handleGenerate}
                disabled={actionLoading}
              >
                Reconnect
              </Button>
            )}

            <Button
              variant="danger"
              size="sm"
              icon={UserX}
              onClick={() => setConfirmOpen(true)}
              disabled={actionLoading}
            >
              Disconnect
            </Button>
          </div>
        </Card>
      )}

      {/* ================================================================= */}
      {/* CASE 2: PENDING */}
      {/* ================================================================= */}
      {connStatus === 'pending' && (
        <Card className="flex flex-col items-center text-center gap-5 !py-8">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center animate-pulse">
            <Clock size={28} className="text-amber-600" />
          </div>

          <div>
            <h2 className="font-display font-semibold text-ink-900 text-xl">
              Connection request pending
            </h2>
            <p className="text-sm text-ink-500 max-w-sm mt-1">
              {isSupporter
                ? 'Your request has been sent. Waiting for the owner to approve your request.'
                : connection.hasSupporterJoined
                  ? `Supporter request received from ${connection.connectedPersonName}!`
                  : 'Share your invitation code or QR code with your supporter.'}
            </p>
          </div>

          {/* Owner View: Show QR and Copyable Code */}
          {isOwner && connection.inviteCode && (
            <div className="flex flex-col items-center gap-4 my-1">
              <QRCodeDisplay inviteCode={connection.inviteCode} />

              <div className="flex items-center gap-3 bg-rose-50/80 border border-rose-200/60 rounded-xl px-5 py-2.5">
                <span className="font-mono font-bold text-xl tracking-widest text-rose-700">
                  {connection.inviteCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-rose-100/80 text-rose-600 transition-colors"
                  aria-label="Copy invitation code"
                >
                  {copied ? <Check size={18} className="text-teal-600" /> : <Copy size={18} />}
                </button>
              </div>

              <p className="text-xs text-ink-400 max-w-xs">
                Your supporter can enter this code in their app or scan this QR code to connect.
              </p>
            </div>
          )}

          {/* Action buttons based on role */}
          <div className="flex gap-3 mt-1">
            {isOwner && connection.hasSupporterJoined && (
              <Button
                variant="primary"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? 'Approving…' : 'Approve connection'}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              disabled={actionLoading}
            >
              Cancel request
            </Button>
          </div>
        </Card>
      )}

      {/* ================================================================= */}
      {/* CASE 3: NO CONNECTION (OWNER) */}
      {/* ================================================================= */}
      {connStatus === 'none' && isOwner && (
        <Card className="flex flex-col items-center text-center gap-4 !py-10">
          <div className="w-36 h-36 bg-white rounded-2xl border border-ink-100 flex items-center justify-center shadow-sm">
            <QrCode size={64} className="text-ink-300" />
          </div>

          <p className="text-sm text-ink-600 max-w-sm leading-relaxed">
            Generate an invitation code to create a QR code your supporter can scan. They will only see what your sharing permissions allow.
          </p>

          <Button
            icon={QrCode}
            onClick={handleGenerate}
            disabled={actionLoading}
            size="lg"
          >
            {actionLoading ? 'Generating…' : 'Generate invitation code'}
          </Button>
        </Card>
      )}

      {/* ================================================================= */}
      {/* CASE 4: NO CONNECTION (SUPPORTER) */}
      {/* ================================================================= */}
      {connStatus === 'none' && isSupporter && (
        <Card className="!py-8">
          <form
            onSubmit={handleSubmitCode}
            className="flex flex-col gap-4 items-center text-center max-w-md mx-auto"
          >
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-1">
              <Link2 size={28} className="text-teal-600" />
            </div>

            <div>
              <h2 className="font-display font-semibold text-ink-900 text-lg">
                Enter Invitation Code
              </h2>
              <p className="text-sm text-ink-500 mt-1">
                Enter the 6-character invitation code shared by the person you are supporting.
              </p>
            </div>

            <div className="w-full max-w-xs">
              <Input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
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
              disabled={actionLoading || !codeInput.trim()}
              className="w-full max-w-xs"
            >
              {actionLoading ? 'Sending request…' : 'Send connection request'}
            </Button>
          </form>
        </Card>
      )}

      {/* ================================================================= */}
      {/* REMOVE / DISCONNECT CONFIRMATION MODAL */}
      {/* ================================================================= */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove this connection?"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDisconnect}
              disabled={actionLoading}
            >
              {actionLoading ? 'Removing…' : 'Remove connection'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-600 leading-relaxed">
          {connection?.connectedPersonName || 'This connection'} will no longer have access to any shared updates. You can generate a new connection at any time.
        </p>
      </Modal>
    </div>
  )
}