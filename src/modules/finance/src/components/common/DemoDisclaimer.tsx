import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const DemoDisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Frontend Prototype Mode:</strong> All financial entries, transactions, receipts, and audit logs are simulated demo records. No real bank integrations or backend databases are connected.
        </span>
      </div>
      <div className="hidden md:flex items-center gap-1.5 text-amber-700 font-medium">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Demo Authorization Enforced</span>
      </div>
    </div>
  );
};
