import React, { useEffect, useState } from 'react';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { getGroqApiKey, saveGroqApiKey } from '../lib/groq';
import { getPlanDisplayLabel, getPlanUnlockSummary, setStoredUserPlan } from '../lib/plan';
import { usePlanState } from '../hooks/usePlanState';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [planToast, setPlanToast] = useState('');
  const plan = usePlanState();

  useEffect(() => {
    setApiKey(getGroqApiKey());
  }, []);

  const handleSave = () => {
    saveGroqApiKey(apiKey);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const showPlanToast = (message: string) => {
    setPlanToast(message);
    window.setTimeout(() => setPlanToast(''), 2500);
  };

  const handleCancelPlan = () => {
    setStoredUserPlan('FREE');
    showPlanToast("Subscription cancelled. You're now on Free plan.");
  };

  const handleSwitchPlan = (target: 'FREE' | 'PRO_99' | 'PRO_499') => {
    setStoredUserPlan(target);

    if (target === 'PRO_499') {
      showPlanToast('Switched to Rs 499 plan. All modules unlocked.');
      return;
    }

    if (target === 'PRO_99') {
      showPlanToast('Switched to Rs 99 plan. ATS and Resume unlocked.');
      return;
    }

    showPlanToast('Switched to Free plan. Premium modules locked.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1">Manage your AI configuration for generator features.</p>
      </div>

      <div className="tucf-card">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--accent)' }}
          >
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Settings</h2>
            <p>Store your Groq API key locally for AI-powered tools.</p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Current Plan
              </p>
              <h3 className="mt-1 text-lg font-semibold" style={{ color: '#ffffff' }}>
                {getPlanDisplayLabel(plan)}
              </h3>
              <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {getPlanUnlockSummary(plan)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={handleSave} className="rounded-xl px-6 py-3 text-white font-medium tucf-btn-primary">
                Save
              </button>

              <button
                type="button"
                onClick={handleCancelPlan}
                className="rounded-xl px-6 py-3 text-white font-medium"
                style={{ background: '#2a1a12', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Cancel Plan
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Groq API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="gsk_..."
            className="px-4 py-3"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleSwitchPlan('PRO_499')}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
          >
            Switch to Rs 499
          </button>
          <button
            type="button"
            onClick={() => handleSwitchPlan('PRO_99')}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
          >
            Switch to Rs 99
          </button>
          <button
            type="button"
            onClick={() => handleSwitchPlan('FREE')}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
          >
            Switch to FREE
          </button>
        </div>

        {saved && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm" style={{ color: '#4ade80' }}>
            <CheckCircle2 className="h-4 w-4" />
            <span>Saved</span>
          </div>
        )}

        {planToast ? (
          <div className="mt-4 inline-flex items-center gap-2 text-sm" style={{ color: '#f97316' }}>
            <span>{planToast}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Settings;
