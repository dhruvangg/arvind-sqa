import React, { useState } from 'react';
import { postSapWebhook } from '../services/api';
import { Cpu, Send, Check, Copy, X, Terminal } from 'lucide-react';

interface SapWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_SAP_PAYLOAD = {
  notification_id: `QM-2026-${Math.floor(10000 + Math.random() * 90000)}`,
  plant_code: 'ARV-SANTEJ',
  work_center: 'WEAVING-LOOM-22',
  material_code: 'DENIM-STRETCH-12OZ',
  defect_code: 'DEF_WEAVE_BROKEN_PICK',
  defect_description: 'Weave Defect - Missing Pick Across Roll',
  severity: 'Critical',
  notes: 'Automated vision scanner flagged continuous pick irregularity on loom beam #4.',
};

export const SapWebhookModal: React.FC<SapWebhookModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(SAMPLE_SAP_PAYLOAD, null, 2)
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [responseLog, setResponseLog] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    try {
      setIsSubmitting(true);
      setResponseLog(null);
      const parsed = JSON.parse(jsonText);
      const result = await postSapWebhook(parsed);
      setResponseLog(JSON.stringify(result, null, 2));
      onSuccess();
    } catch (err: any) {
      setResponseLog(`Error: ${err.message || 'Failed to dispatch SAP Webhook'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const curlCommand = `curl -X POST http://localhost:8000/api/sap-webhook \\
  -H "Content-Type: application/json" \\
  -d '${jsonText.replace(/\n/g, ' ')}'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Mock SAP QM Webhook Integration
              </h3>
              <p className="text-[11px] text-slate-500">
                Simulate SAP Quality Management event payloads (POST /api/sap-webhook)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-700">SAP JSON Payload</span>
              <button
                onClick={copyCurl}
                className="text-[11px] font-semibold text-arvind-600 flex items-center gap-1 hover:underline"
              >
                {copiedCurl ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" /> Copied cURL!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy cURL
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={8}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full font-mono text-[11px] p-2.5 bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Results Output */}
          {responseLog && (
            <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] border border-slate-800">
              <div className="flex items-center gap-1 text-slate-400 font-bold mb-1">
                <Terminal className="w-3.5 h-3.5" /> Webhook Response:
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap">{responseLog}</pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={() =>
              setJsonText(
                JSON.stringify(
                  {
                    ...SAMPLE_SAP_PAYLOAD,
                    notification_id: `QM-2026-${Math.floor(
                      10000 + Math.random() * 90000
                    )}`,
                  },
                  null,
                  2
                )
              )
            }
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
          >
            Regenerate Sample
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              Close
            </button>
            <button
              onClick={handleSend}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Webhook</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
