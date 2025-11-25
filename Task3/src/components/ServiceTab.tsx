
import { useState, useEffect } from 'react';

interface ServiceTabProps {
  broker: any;
  selectedProvider: any;
  setSelectedProvider: (provider: any) => void;
  notice: string;
  setNotice: (notice: string) => void;
}

export default function ServiceTab({
  broker,
  selectedProvider,
  setSelectedProvider,
  notice,
  setNotice
}: ServiceTabProps) {

  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取服务列表
  const fetchProviders = async () => {
    if (!broker) return;

    setLoading(true);
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("获取服务失败：超时")), 5000)
      );

      const services = await Promise.race([
        broker.inference.listService(),
        timeoutPromise
      ]);
      const list = services.map((s: any) => ({
        address: s.provider || "",
        name: s.name || s.model || "Unknown",
        model: s.model || "Unknown",
      }));
      setProviders(list);
      if (list.length > 0 && !selectedProvider) {
        setSelectedProvider(list[0]);
      }
    } catch (err: any) {
      setProviders([]);
      if (err.message.includes("超时")) {
        setNotice("获取服务失败：超时");
      } else {
        console.error("获取服务失败:", err);
      }
    }
    setLoading(false);
  };

  // 自动获取服务列表
  useEffect(() => { fetchProviders(); }, [broker]);

  // 验证服务
  const verifyService = async () => {
    if (!broker || !selectedProvider) return;

    setLoading(true);
    try {
      await broker.inference.acknowledgeProviderSigner(selectedProvider.address);
      setNotice("服务验证成功");
    } catch (err) {
      console.error("服务验证失败:", err);
      setNotice("服务验证失败");
    }
    setLoading(false);
  };

  return (

    <div>
      <h2 className='text-lg font-bold my-2'>服务列表</h2>
      {loading ? (
        <p>加载中...</p>
      ) : (
        <div>
          <select
            value={selectedProvider?.address || ""}
            onChange={(e) => {
              const p = providers.find((p) => p.address === e.target.value);
              setSelectedProvider(p);
            }}
            className="w-full px-4 py-2 border text-purple-300 border-gray-300 rounded-lg shadow-sm transition-all"
          >
            {providers.map((p) => (
              <option key={p.address} value={p.address}>
                {p.name} - {p.model}
              </option>
            ))}
          </select>

          {selectedProvider && (
            <div>
              <p className="my-2">地址: {selectedProvider.address}</p>
              <button
                onClick={verifyService}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
              {loading ? "验证中..." : "验证服务"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}