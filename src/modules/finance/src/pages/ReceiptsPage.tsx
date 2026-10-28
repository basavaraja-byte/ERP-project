import React, { useState } from 'react';
import { 
  ReceiptText, 
  Search, 
  Printer, 
  Download, 
  CheckCircle2 
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/currency';
import { exportToCSV } from '../utils/csvExport';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Receipt } from '../types/finance';

export const ReceiptsPage: React.FC = () => {
  const { scopedReceipts, campuses } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const filteredReceipts = scopedReceipts.filter(r => {
    return (
      r.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.payment_reference.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getCampus = (campusId: string) => {
    return campuses.find(item => item.id === campusId) || campuses[0];
  };

  const handleExportCSV = () => {
    const rows = filteredReceipts.map(r => ({
      ReceiptNumber: r.receipt_number,
      Date: r.receipt_date,
      StudentName: r.student_name,
      StudentCode: r.student_code,
      Campus: getCampus(r.campus_id).name,
      Amount: r.amount,
      PaymentMethod: r.payment_method,
      PaymentReference: r.payment_reference,
      Status: r.status,
    }));
    exportToCSV('Official_Receipts_Register', rows);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Receipt Register</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified institutional fee receipts issued against confirmed payment settlements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Register</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search receipt number, student name, roll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {filteredReceipts.length} validated receipts issued
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Receipt No.</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Student Details</th>
                <th className="py-3 px-3">Campus</th>
                <th className="py-3 px-3">Transaction UTR</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3 text-right">Amount Received</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.map(rec => (
                <tr key={rec.receipt_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                    {rec.receipt_number}
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap font-mono">{rec.receipt_date}</td>

                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{rec.student_name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{rec.student_code}</div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                    {getCampus(rec.campus_id).city}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {rec.payment_reference}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap capitalize">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {rec.payment_method.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-slate-900">
                    {formatINR(rec.amount)}
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                      ISSUED
                    </Badge>
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => setSelectedReceipt(rec)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <ReceiptText className="w-3 h-3" />
                      <span>View & Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Official Fee Collection Receipt (Demo)"
          subtitle={`Receipt: ${selectedReceipt.receipt_number}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Printable Container */}
            <div id="printable-receipt-area" className="p-6 bg-white border border-slate-300 rounded-xl space-y-4 text-slate-800 relative">
              {/* Demo Watermark Notice */}
              <div className="absolute top-2 right-2 bg-amber-100 border border-amber-300 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                Prototype Demo Receipt
              </div>

              {/* Institution Header */}
              <div className="border-b border-slate-300 pb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                    ₹
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    EDUCATIONAL TRUST HIGHER ACADEMY
                  </h3>
                </div>
                <p className="text-slate-500 text-[11px]">
                  {getCampus(selectedReceipt.campus_id).name} — {getCampus(selectedReceipt.campus_id).address}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  GSTIN: 29AAATE0000A1Z5 | E-Receipt Verification Portal
                </p>
              </div>

              {/* Meta row */}
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-200">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-semibold">Receipt Number</p>
                  <p className="font-mono font-bold text-indigo-900 text-sm">{selectedReceipt.receipt_number}</p>
                  <p className="text-slate-500 text-[10px] uppercase font-semibold mt-2">Date of Issue</p>
                  <p className="font-mono text-slate-800 font-semibold">{selectedReceipt.receipt_date}</p>
                </div>

                <div className="text-right">
                  <p className="text-slate-500 text-[10px] uppercase font-semibold">Payment Method & UTR</p>
                  <p className="font-mono text-slate-800 font-semibold">{selectedReceipt.payment_reference}</p>
                  <p className="text-slate-600 capitalize text-[11px] mt-0.5">{selectedReceipt.payment_method.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Student details */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Student Name</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.student_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Roll / Student Code</span>
                  <span className="font-mono font-bold text-slate-900">{selectedReceipt.student_code}</span>
                </div>
              </div>

              {/* Breakdown Table */}
              <div>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3 border-b border-slate-200">Fee Classification</th>
                      <th className="py-2 px-3 border-b border-slate-200">Description</th>
                      <th className="py-2 px-3 border-b border-slate-200 text-right">Settled Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedReceipt.fee_breakdown.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-semibold text-slate-800">{item.category}</td>
                        <td className="py-2 px-3 text-slate-600">{item.subcategory}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatINR(item.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-[11px]">Total Realized Settlement</td>
                      <td className="py-2.5 px-3 text-right text-base text-indigo-900">{formatINR(selectedReceipt.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {selectedReceipt.remarks && (
                <div className="text-[11px] text-slate-600">
                  <strong>Notes:</strong> {selectedReceipt.remarks}
                </div>
              )}

              {/* Cashier signature stamp area */}
              <div className="pt-6 flex items-end justify-between text-[11px] text-slate-500">
                <div className="text-[10px] space-y-0.5">
                  <p>Computer-generated educational trust demo acknowledgement.</p>
                  <p>Subject to realization of bank instruments where applicable.</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span className="font-semibold text-slate-800">Authorized Accounts Cashier</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={handlePrintReceipt}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs inline-flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Demo Receipt</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
