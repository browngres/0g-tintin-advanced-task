
import { useState, useEffect } from 'react';

interface AccountTabProps {
  broker: any;
  notice: string;
  setNotice: (notice: string) => void;
}

export default function AccountTab({ broker, notice, setNotice }: AccountTabProps) {

  const [balance, setBalance] = useState<{
    total: number;
    available: number;
  } | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // 获取余额
  const fetchBalance = async () => {
    if (!broker) {
      console.log("No broker loaded in AccountTab.");
      return;
    }

    try {
      const { ledgerInfo } = await broker.ledger.ledger.getLedgerWithDetail();
      const total = Number(ledgerInfo[0]) / 1e18;
      const locked = Number(ledgerInfo[1]) / 1e18;
      setBalance({ total, available: total - locked });
    } catch {
      setBalance(null);
    }
  };

  // 充值
  const handleDeposit = async () => {
    if (!broker || !depositAmount) return;

    setLoading(true);
    try {
      const amount = parseFloat(depositAmount);

      // 检查是否有账本
      let hasLedger = false;
      try {
        await broker.ledger.ledger.getLedgerWithDetail();
        hasLedger = true;
      } catch {}

      if (hasLedger) {
        await broker.ledger.depositFund(amount);
      } else {
        await broker.ledger.addLedger(amount);
      }

      setNotice(`充值 ${amount} 0G 成功`);
      setDepositAmount("");
      await fetchBalance();
    } catch (err) {
      setNotice("充值失败");
    }
    setLoading(false);
  };

  // 自动获取余额
  useEffect(() => { fetchBalance(); }, [broker]);

  // 退还
  const handleRefund = async () => {
    if (!broker || !refundAmount) return;
    setLoading(true);
    try {
      const amount = parseFloat(refundAmount);
      await broker.ledger.refund(amount);
      setNotice(`退还 ${amount} 0G 成功`);
    } catch (err) {
      setNotice("充值失败");
    }
    await fetchBalance();
    setDepositAmount("");
    setLoading(false);
  }

  return (
    <div>
      <h2 className='text-lg font-bold my-2'>账户余额</h2>
      {balance ? (
        <p> 余额: {balance.available.toFixed(4)} 0G (总计:{" "} {balance.total.toFixed(4)})</p>
      ) : (
        <p>暂无账本</p>
      )}

      <div className="my-5 flex flex-col sm:flex-row gap-3">
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="充值金额"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all"
        />

        <button
          onClick={handleDeposit}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
        >
          {loading ? "处理中..." : "充值"}
        </button>
      </div>

      <div className="my-5 flex flex-col sm:flex-row gap-3">
        <input
          type="number"
          value={refundAmount}
          onChange={(e) => setRefundAmount(e.target.value)}
          placeholder="退还金额"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all"
        />

        <button
          onClick={handleRefund}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
        >
          {loading ? "处理中..." : "退还"}
        </button>
      </div>

    </div>
  );
}