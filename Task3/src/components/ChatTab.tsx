
import { useState, useEffect } from 'react';
import ApiBox from './ApiBox';

interface ChatTabProps {
  broker: any;
  selectedProvider: any;
  notice: string;
  setNotice: (notice: string) => void;
}

export default function ChatTab({
  broker,
  selectedProvider,
  notice,
  setNotice
}: ChatTabProps) {

  const [chatContents, setChatContents] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingMessageId, setVerifyingMessageId] = useState<string | null>(null);

  // 重置消息历史
  useEffect(() => {
    if (selectedProvider) { setChatContents([]); }
  }, [selectedProvider]);

  // 发送消息（基础版本）
  const sendMessage = async () => {
    if (!broker || !selectedProvider || !input.trim()) return;

    const userMsg = { role: "user", content: input };
    setChatContents((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 获取元数据和请求头
      const metadata = await broker.inference.getServiceMetadata(selectedProvider.address);
      const headers = await broker.inference.getRequestHeaders(
        selectedProvider.address,
        JSON.stringify([userMsg])
      );

      let account;
      try {
        account = await broker.inference.getAccount(selectedProvider.address);
      } catch (error) {
        console.error("获取子账户信息失败:", error);
        setNotice("获取子账户信息失败")
        return
        // await broker.ledger.transferFund(selectedProvider.address, "inference", BigInt(2e18));
      }

      console.log("账户信息:", account);
      console.log("账户信息:", account.balance);
      if (account.balance <= BigInt(1.5e18)) {
        console.log("子账户余额不足，正在充值...");
        await broker.ledger.transferFund(
          selectedProvider.address,
          "inference",
          BigInt(1e18)
        );
      }

      const response = await fetch(`${metadata.endpoint}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          chatContents: [userMsg],
          model: metadata.model,
          stream: false,
        }),
      });

      const result = await response.json();
      const aiMsg = {
        role: "assistant",
        content: result.choices[0].message.content,
        id: result.id,
        verified: false,
      };

      setChatContents((prev) => [...prev, aiMsg]);

      // 处理验证和计费
      if (result.id) {
        setVerifyingMessageId(result.id);
        setNotice("正在验证响应...");

        try {
          await broker.inference.processResponse(selectedProvider.address, aiMsg.content, result.id);
          setChatContents((prev) =>
            prev.map(msg => msg.id === result.id ? { ...msg, verified: true } : msg)
          );
          setNotice("响应验证成功");
        } catch (verifyErr) {
          console.error("验证失败:", verifyErr);
          setNotice("响应验证失败");
          // 标记验证失败
          setChatContents((prev) =>
            prev.map(msg => msg.id === result.id ? { ...msg, verified: false, verifyError: true } : msg)
          );
        } finally {
          setVerifyingMessageId(null);
          setTimeout(() => setNotice(""), 3000);
        }
      }
    } catch (err) {
      setChatContents((prev) => [...prev, {
        role: "assistant",
        content: "错误: " + (err instanceof Error ? err.message : String(err))
      }]);
    }
    setLoading(false);
  };


  if (!selectedProvider) {
    return (
      <div>
        <h2 className='text-lg font-bold my-2'>AI 聊天</h2>
        <p>请先选择并验证服务</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px] flex flex-col">
      <h2 className='text-lg font-bold my-2'>AI 聊天</h2>
      <p className='font-bold my-2'>当前服务: {selectedProvider.name} - {selectedProvider.model}</p>

      <div className="p-4 flex-1 overflow-y-auto space-y-4 border border-purple-300 rounded-lg">
        {chatContents.length === 0 ? (
          <div className='font-bold my-2'>
            开始与 AI 对话...
          </div>
        ) : (
          chatContents.map((msg, i) => (
            <div key={i} className='my-2'>
              <strong>{msg.role === "user" ? "你" : "AI"}:</strong> {msg.content}
              {msg.role === "assistant" && msg.id && (
                <span className='m-2'
                  style={{
                    color: msg.verifyError ? "#dc3545" :
                      msg.verified ? "#28a745" :
                        verifyingMessageId === msg.id ? "#ffc107" : "#6c757d"
                  }}>
                  {msg.verifyError ? "❌ 验证失败" :
                    msg.verified ? "✓ 已验证" :
                      verifyingMessageId === msg.id ? "⏳ 验证中..." : "⚠️ 未验证"}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col absolute bottom-1 left-2 right-2 px-2">
        {/* API 请求框 */}
        <ApiBox input={input} setInput={setInput} notice={notice} setNotice={setNotice} />
        <div className='flex my-4 shrink-0'>
          {/* 输入框 */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
            placeholder="输入消息..."
            className="flex-1 px-2 mr-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {/* 发送按钮 */}
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 mx-2 min-w-[90px] bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 transition-colors"
          >
            {loading ? "发送中..." : "发送"}
          </button>
        </div>
      </div>
    </div>
  );
}