'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  WarningCircle,
  Clock,
  LockKey,
  ShieldCheck,
  Envelope,
  User,
  ArrowRight,
} from '@phosphor-icons/react';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('t') || '';

  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [acceptedDetails, setAcceptedDetails] = useState<any>(null);

  if (!token) {
    return (
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/80 border border-rose-500/30 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <WarningCircle className="text-2xl" />
          </div>
          <h1 className="text-xl font-semibold text-slate-100 mb-2">Invalid Invitation Link</h1>
          <p className="text-sm text-slate-400 mb-6">
            This invitation link appears to be missing its security token. Please verify the URL or ask the circle owner to resend your invitation.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    setStatus('SUBMITTING');
    setErrorMessage('');

    try {
      const resp = await fetch('/api/circle/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawToken: token,
          authenticatedUid: `user_${emailInput.replace(/[^a-zA-Z0-9]/g, '_')}`,
          authenticatedEmail: emailInput,
          authenticatedDisplayName: nameInput || emailInput.split('@')[0],
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setStatus('ERROR');
        setErrorMessage(data.error || 'Failed to accept invitation');
        return;
      }

      setStatus('SUCCESS');
      setAcceptedDetails(data);
    } catch (err: any) {
      setStatus('ERROR');
      setErrorMessage(err.message || 'Network error while accepting invitation');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-cyan-500 selection:text-white">
      <div className="max-w-lg w-full p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-6 text-cyan-400">
          <ShieldCheck className="text-lg" />
          <span className="text-xs uppercase tracking-widest font-mono font-semibold">ParamSathya Sanctuary</span>
        </div>

        {status === 'SUCCESS' ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-3xl" />
            </div>
            <h2 className="text-2xl font-serif text-slate-100 mb-2">Welcome to the Memory Circle</h2>
            <p className="text-sm text-slate-400 mb-6">
              Your invitation has been accepted. You are now connected to the private remembrance vault as an authorized{' '}
              <strong className="text-cyan-300 font-medium">
                {acceptedDetails?.membership?.role || 'Contributor'}
              </strong>.
            </p>

            <a
              href="/experience/presence"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-semibold shadow-lg transition"
            >
              Enter Remembrance Vault <ArrowRight />
            </a>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-serif text-slate-100 mb-2">Private Circle Invitation</h1>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              You have been invited to participate in a private memory vault. To maintain authenticity and privacy, please verify your email address to claim this seat.
            </p>

            {status === 'ERROR' && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-3"
              >
                <WarningCircle className="text-base text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-200">Unable to accept invitation</p>
                  <p className="mt-0.5 text-rose-300/90">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAccept} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Name / Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Maya or Uncle Dev"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Invited Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Envelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter the exact email where you received the invite"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <LockKey className="text-slate-400" /> Must match the email address where the invitation was sent.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'SUBMITTING'}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {status === 'SUBMITTING' ? (
                    <>
                      <Clock className="animate-spin text-sm" /> Verifying Security Token...
                    </>
                  ) : (
                    <>
                      Accept Invitation &amp; Join Circle <ArrowRight />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080c14] text-slate-400 flex items-center justify-center text-xs">
          Loading invitation...
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
