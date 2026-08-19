import React, { useEffect, useState } from 'react'
import {
  QrCode,
  Copy,
  CheckCircle2,
  Link2,
  UserX,
  RefreshCw,
} from 'lucide-react'

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
import { QRCodeSVG } from 'qrcode.react'

function QRCodeDisplay({ inviteCode }) {
  return (
    <div className="w-40 h-40 bg-white rounded-xl border border-ink-100 p-3 flex items-center justify-center">
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
  const [fetchError, setFetchError] = useState(null)
  const [codeInput, setCodeInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    try {
      setFetchError(null)

      const data = await getConnectionStatus()
      setConnection(data)
    } catch (err) {
      setFetchError(
        err?.message || 'Failed to load connection status.'
      )
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleGenerate = async () => {
    try {
      setLoading(true)
      setFetchError(null)

      await generateInviteCode()
      await refresh()
    } catch (err) {
      showToast(
        err?.message || 'Failed to generate invitation.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    const inviteCode = connection?.inviteCode || ''

    if (!inviteCode) return

    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch {
      showToast('Unable to copy the invitation code.', 'error')
    }
  }

  const handleSubmitCode = async (event) => {
    event.preventDefault()

    if (!codeInput.trim()) return

    try {
      setLoading(true)
      setFetchError(null)

      await submitInviteCode(codeInput.trim().toUpperCase())
      setCodeInput('')

      await refresh()

      showToast('Connection request sent.')
    } catch (err) {
      showToast(
        err?.message || 'Failed to submit invitation code.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSimulateApproval = async () => {
    try {
      setLoading(true)
      setFetchError(null)

      await approveConnection()
      await refresh()

      showToast('Connection successful!')
    } catch (err) {
      showToast(
        err?.message || 'Failed to approve connection.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setLoading(true)
      setFetchError(null)

      await disconnectSupporter()
      await refresh()

      setConfirmOpen(false)

      showToast('Supporter removed', 'info')
    } catch (err) {
      showToast(
        err?.message || 'Failed to remove connection.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  if (fetchError) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-3">
        <p className="text-rose-500 font-medium">
          Could not load connection status
        </p>

        <p className="text-ink-400 text-sm max-w-sm">
          {fetchError}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (!connection) {
    return (
      <div className="animate-pulse text-ink-400 text-sm py-20 text-center">
        Loading…
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 animate-fadeIn">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
          Supporter connection
        </h1>

        <p className="text-ink-500 text-sm mt-1">
          {isSupporter
            ? 'Connect to the person you\'re supporting.'
            : 'Invite a trusted person to see what you choose to share.'}
        </p>
      </div>

      {/* CONNECTED */}
      {connection.status === 'connected' && (
        <Card className="flex flex-col items-center text-center gap-3 !py-10">

          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
            <CheckCircle2
              size={28}
              className="text-teal-600"
            />
          </div>

          <h2 className="font-display font-semibold text-ink-900 text-lg">
            Connected to {connection.connectedPersonName}
          </h2>

          <p className="text-sm text-ink-500 max-w-xs">
            {isSupporter
              ? 'You will now see the updates they choose to share, right on your dashboard.'
              : 'They can now see whatever you\'ve allowed in your sharing permissions.'}
          </p>

          <div className="flex gap-3 mt-2">

            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={handleGenerate}
              disabled={isSupporter || loading}
            >
              Reconnect
            </Button>

            <Button
              variant="danger"
              size="sm"
              icon={UserX}
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
            >
              Remove
            </Button>

          </div>
        </Card>
      )}

      {/* PENDING */}
      {connection.status === 'pending' && (
        <Card className="flex flex-col items-center text-center gap-4 !py-10">

          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center animate-pulse">
            <Link2
              size={26}
              className="text-amber-500"
            />
          </div>

          <h2 className="font-display font-semibold text-ink-900 text-lg">
            Connection request pending
          </h2>

          <p className="text-sm text-ink-500 max-w-sm">
            {isSupporter
              ? 'Waiting for approval on the other side.'
              : 'Share your code or QR with them, then approve their request once they enter it.'}
          </p>

          {/* OWNER VIEW */}
          {!isSupporter && connection.inviteCode && (
            <>
              <QRCodeDisplay
                inviteCode={connection.inviteCode}
              />

              <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-4 py-2.5">

                <span className="font-mono font-bold text-lg tracking-widest text-rose-600">
                  {connection.inviteCode}
                </span>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-rose-500 hover:text-rose-600"
                  aria-label="Copy invitation code"
                >
                  <Copy size={16} />
                </button>

                {copied && (
                  <span className="text-xs text-teal-600 font-medium">
                    Copied
                  </span>
                )}

              </div>
            </>
          )}

          <Button
            onClick={handleSimulateApproval}
            disabled={loading}
          >
            {loading
              ? 'Connecting…'
              : isSupporter
                ? 'Simulate: they approve'
                : 'Approve connection'}
          </Button>

        </Card>
      )}

      {/* OWNER — NO CONNECTION */}
      {connection.status === 'none' && !isSupporter && (
        <Card className="flex flex-col items-center text-center gap-4 !py-10">

          <div className="w-40 h-40 bg-white rounded-xl border border-ink-100 flex items-center justify-center">
            <QrCode
              size={72}
              className="text-ink-300"
            />
          </div>

          <p className="text-sm text-ink-500 max-w-sm">
            Generate an invitation code to create a QR code
            your supporter can scan. They'll only see what
            your sharing permissions allow.
          </p>

          <Button
            icon={QrCode}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading
              ? 'Generating…'
              : 'Generate invitation code'}
          </Button>

        </Card>
      )}

      {/* SUPPORTER — NO CONNECTION */}
      {connection.status === 'none' && isSupporter && (
        <Card className="!py-8">

          <form
            onSubmit={handleSubmitCode}
            className="flex flex-col gap-4 items-center text-center"
          >

            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-1">
              <Link2
                size={26}
                className="text-teal-600"
              />
            </div>

            <p className="text-sm text-ink-500 max-w-sm">
              Enter the invitation code shared with you
              to request a connection.
            </p>

            <Input
              value={codeInput}
              onChange={(event) =>
                setCodeInput(event.target.value)
              }
              placeholder="e.g. 7F3KQ2"
              className="text-center font-mono tracking-widest text-lg"
              required
            />

            <Button
              type="submit"
              variant="teal"
              disabled={loading || !codeInput.trim()}
            >
              {loading
                ? 'Sending…'
                : 'Send connection request'}
            </Button>

          </form>
        </Card>
      )}

      {/* REMOVE CONNECTION MODAL */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove this connection?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              onClick={handleDisconnect}
              disabled={loading}
            >
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          {connection.connectedPersonName || 'This connection'}
          {' '}
          will no longer be able to see any shared information.
          You can reconnect later with a new code.
        </p>
      </Modal>

    </div>
  )
}