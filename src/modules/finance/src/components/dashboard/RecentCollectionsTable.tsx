import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/currency';
import { Badge } from '../common/Badge';

export const RecentCollectionsTable: React.FC = () => {
  const { scopedPayments, campuses } = useFinance();

  const confirmedPayments = scopedPayments
    .filter(p => p.status === 'confirmed')
    .slice(0, 5);

  const getCampusCity = (campusId: string) => {
    const c = campuses.find(item => item.id === campusId);
    return c ? c.city : campusId;
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Confirmed Collections
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest validated student fee receipts and bank credit settlements
          </p>
        </div>
        <Link
          to="/collections"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <span>View All Register</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto mt-4">
        {confirmedPayments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No confirmed collections recorded for current scope
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Campus</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {confirmedPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{payment.payment_date}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{payment.student_name}</div>
                    <div className="text-[11px] text-slate-400">{payment.student_code}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-medium text-slate-700">{getCampusCity(payment.campus_id)}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {payment.payment_reference}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap capitalize">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      <CreditCard className="w-3 h-3 text-slate-500" />
                      {payment.payment_method.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatINR(payment.amount)}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                      Confirmed
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
