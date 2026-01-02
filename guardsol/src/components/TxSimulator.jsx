import React, { useState } from 'react';
import { simulateBase64Transaction } from '../utils/transactionSimulator';

export default function TxSimulator() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle | analyzing | done
  const [result, setResult] = useState(null);

  const DEMO_TX = 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAcJjkQt4XcX43Vk8FZ7QbUVXSF5oo9jt7x2Dm0E9ut/y+jagnMHpK8BDHt0PpssHwXGD2fBxS6MWBoxptD2u9TvrgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1NjSeWM5+GSJdoQd43Al9SVVXC9FfWGwbe7icpomwAUGodgXkTdUKpg0N73+KnqyVX9TXIp4citopJ3AAAAAAAah2BelAgULaAeR5s5tuI4eW3FQ9h/GeQpOtNEAAAAABqfVFxjHdMkoVmOYaR1etoteuKObS21cc1VbIQAAAAAGp9UXGSxcUSGMyUw9SvX/WNruCJuh/UTj29mKAAAAAAan1RcZNYTQ/u2bs0MdEyBr5UQoG1e4VmzFN1/0AAAAijW940iwWddz25ZC37fI0ue5fa+eTbC2ynBM3b0t4pcDAgMAAQBgAwAAAI5ELeF3F+N1ZPBWe0G1FV0heaKPY7e8dg5tBPbrf8voBAAAAAAAAABzZWVkgJaYAAAAAADIAAAAAAAAAAah2BeRN1QqmDQ3vf4qerJVf1NcinhyK2ikncAAAAAABAIBB3QAAAAAjkQt4XcX43Vk8FZ7QbUVXSF5oo9jt7x2Dm0E9ut/y+iORC3hdxfjdWTwVntBtRV0heaKPY7e8dg5tBPbrf8voAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQGAQMGCAUABAIAAAA=';

  async function runSimulation() {
    if (!input.trim()) return;

    setStatus('analyzing');
    setResult(null);

    // Matrix-style delay for UX (purely visual)
    setTimeout(async () => {
      const res = await simulateBase64Transaction(input);
      setResult(res);
      setStatus('done');
    }, 1200);
  }

  return (
    <div className="w-full max-w-3xl bg-dark-card/60 backdrop-blur-xl border border-neon-green/20 rounded-2xl p-8 shadow-2xl">

      {/* TITLE */}
      <h2 className="text-3xl font-mono text-neon-green mb-2 flex items-center gap-2">
        TRANSACTION X-RAY <span className="text-xl">🧬</span>
      </h2>

      <p className="text-sm text-text-secondary mb-6">
        Paste a base64 Solana transaction to analyze it <b>before signing</b>.
      </p>

      {/* INPUT */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste base64 transaction here…"
          className="w-full h-36 bg-dark-bg text-neon-green font-mono p-4 rounded-lg border border-neon-green/30 focus:outline-none focus:border-neon-green/60 transition"
        />
        <button
          onClick={() => setInput(DEMO_TX)}
          className="absolute top-2 right-2 text-xs bg-neon-green/10 text-neon-green px-2 py-1 rounded hover:bg-neon-green/20 transition-colors"
        >
          LOAD DEMO
        </button>
      </div>

      {/* ACTION */}
      <button
        onClick={runSimulation}
        className="mt-4 px-6 py-3 bg-neon-green text-black font-bold rounded-lg hover:bg-neon-green/90 transition-all duration-200 shadow-[0_0_20px_rgba(43,255,136,0.25)]"
      >
        Simulate Transaction
      </button>

      {/* MATRIX MODE */}
      {status === 'analyzing' && (
        <div className="mt-6 font-mono text-neon-green animate-pulse space-y-1">
          <p>▸ Decoding transaction bytes…</p>
          <p>▸ Simulating on Solana RPC…</p>
          <p>▸ Inspecting instructions…</p>
          <p>▸ Calculating risk score…</p>
        </div>
      )}

      {/* RESULT */}
      {status === 'done' && result && (
        <div className="mt-8 p-6 rounded-xl border border-white/10 bg-dark-bg">

          {result.success ? (
            <>
              <h3
                className={`text-2xl font-bold mb-1 ${result.analysis.verdict === 'DANGER'
                    ? 'text-red-500'
                    : result.analysis.verdict === 'CAUTION'
                      ? 'text-yellow-400'
                      : 'text-neon-green'
                  }`}
              >
                {result.analysis.verdict}
              </h3>

              <p className="text-sm text-text-muted mb-3">
                Risk Score: {result.analysis.score}/100
              </p>

              <ul className="space-y-1 text-sm text-text-primary">
                {result.analysis.reasons.map((reason, idx) => (
                  <li key={idx}>• {reason}</li>
                ))}
              </ul>

              {result.error && (
                <p className="mt-3 text-xs text-red-400">
                  Execution outcome: {JSON.stringify(result.error)}
                </p>
              )}
            </>
          ) : (
            <p className="text-red-400">{result.error}</p>
          )}
        </div>
      )}

      {/* DISCLAIMER */}
      <p className="mt-6 text-xs text-text-muted">
        This tool simulates transactions only. Nothing is signed or sent.
      </p>
    </div>
  );
}
