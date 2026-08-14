import React, { useEffect, useState } from 'react'
import { QrCode, Copy, CheckCircle2, Link2, UserX, RefreshCw } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import Modal from '../components/common/Modal.jsx'
import {
  generateInviteCode, submitInviteCode, approveConnection, getConnectionStatus, disconnectSupporter,
} from '../data/api.js'
import { useApp } from '../context/AppContext.jsx'

function QRPlaceholder() {
  // Deterministic pseudo-QR pattern purely for visual flavor — not a real QR code.
  const cells = Array.from({ length: 49 }, (_, i) => (i * 37) % 5 < 2)
  return (
    <div className="w-40 h-40 bg-white rounded-xl border border-ink-100 p-3 grid grid-cols-7 gap-[3px]">
      {cells.map((on, i) => (
        <div key={i} className={`rounded-sm ${on ? 'bg-ink-900' : 'bg-transparent'}`} />
      ))}
    </div>
  )
}

export default function SupporterConnection() {
  const { auth, showToast } = useApp()
  const isSupporter = auth.accountType === 'supporter'
  const [connection, setConnection] = useState(null)
  const [codeInput, setCodeInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const refresh = () => getConnectionStatus().then(setConnection)

  useEffect(() => { refresh() }, [])

  const handleGenerate = async () => {
    setLoading(true)
    await generateInviteCode()
    await refresh()
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(connection?.inviteCode || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleSubmitCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    await submitInviteCode(codeInput.toUpperCase())
    await refresh()
    setLoading(false)
  }

  const handleSimulateApproval = async () => {
    setLoading(true)
    await approveConnection()
    await refresh()
    showToast('Connection successful!')
    setLoading(false)
  }

  const handleDisconnect = async () => {
    setLoading(true)
    await disconnectSupporter()
    await refresh()
    setConfirmOpen(false)
    showToast('Supporter removed', 'info')
    setLoading(false)
  }

  if (!connection) return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading…</div>

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Supporter connection</h1>
        <p className="text-ink-500 text-sm mt-1">
          {isSupporter ? 'Connect to the person you\'re supporting.' : 'Invite a trusted person to see what you choose to share.'}
        </p>
      </div>

      {connection.status === 'connected' && (
        <Card className="flex flex-col items-center text-center gap-3 !py-10">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-teal-600" />
          </div>
          <h2 className="font-display font-semibold text-ink-900 text-lg">Connected to {connection.connectedPersonName}</h2>
          <p className="text-sm text-ink-500 max-w-xs">
            {isSupporter
              ? 'You will now see the updates they choose to share, right on your dashboard.'
              : 'They can now see whatever you\'ve allowed in your sharing permissions.'}
          </p>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleGenerate} disabled={isSupporter}>
              Reconnect
            </Button>
            <Button variant="danger" size="sm" icon={UserX} onClick={() => setConfirmOpen(true)}>
              Remove
            </Button>
          </div>
        </Card>
      )}

      {connection.status === 'pending' && (
        <Card className="flex flex-col items-center text-center gap-4 !py-10">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center animate-pulse">
            <Link2 size={26} className="text-amber-500" />
          </div>
          <h2 className="font-display font-semibold text-ink-900 text-lg">Connection request pending</h2>
          <p className="text-sm text-ink-500 max-w-sm">
            {isSupporter
              ? 'Waiting for approval on the other side. In this demo, you can simulate that approval below.'
              : 'Share your code or QR with them, then approve their request once they enter it.'}
          </p>
          {!isSupporter && connection.inviteCode && (
            <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-4 py-2.5">
              <span className="font-mono font-bold text-lg tracking-widest text-rose-600">{connection.inviteCode}</span>
              <button onClick={handleCopy} className="text-rose-500 hover:text-rose-600">
                <Copy size={16} />
              </button>
              {copied && <span className="text-xs text-teal-600 font-medium">Copied</span>}
            </div>
          )}
          <Button onClick={handleSimulateApproval} disabled={loading}>
            {loading ? 'Connecting…' : isSupporter ? 'Simulate: they approve' : 'Approve connection'}
          </Button>
        </Card>
      )}

      {connection.status === 'none' && !isSupporter && (
        <Card className="flex flex-col items-center text-center gap-4 !py-10">
          <QRPlaceholder />
          <p className="text-sm text-ink-500 max-w-sm">
            Generate a one-time code or QR for your supporter to scan. They'll only see what your sharing permissions allow.
          </p>
          <Button icon={QrCode} onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating…' : 'Generate invitation code'}
          </Button>
        </Card>
      )}

      {connection.status === 'none' && isSupporter && (
        <Card className="!py-8">
          <form onSubmit={handleSubmitCode} className="flex flex-col gap-4 items-center text-center">
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-1">
              <Link2 size={26} className="text-teal-600" />
            </div>
            <p className="text-sm text-ink-500 max-w-sm">Enter the invitation code shared with you to request a connection.</p>
            <Input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="e.g. 7F3KQ2"
              className="text-center font-mono tracking-widest text-lg"
              required
            />
            <Button type="submit" variant="teal" disabled={loading || !codeInput}>
              {loading ? 'Sending…' : 'Send connection request'}
            </Button>
          </form>
        </Card>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove this connection?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDisconnect} disabled={loading}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          {connection.connectedPersonName} will no longer be able to see any shared information. You can reconnect later with a new code.
        </p>
      </Modal>
    </div>
  )
}
