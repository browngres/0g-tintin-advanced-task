import { useState } from "react"
interface ApiBoxProps {
  notice: string;
  setNotice: (notice: string) => void;
}

export default function ApiBox({ notice, setNotice }: ApiBoxProps) {
  const apiUrl = 'https://fapi.binance.com/fapi/v2/ticker/price?symbol=BTCUSDT';

  const [symbol, setSymbol] = useState("")
  const [price, setPrice] = useState("")
  const [time, setTime] = useState("")

  const fetchPrice = async () => {
    try {
      const res = await fetch(apiUrl)
      const data = await res.json()
      setSymbol(data.symbol || "")
      setPrice(data.price || "")
      setTime(data.time || "")
    } catch (err) {
      setNotice("请求价格失败")
      console.error(err)
    }
  }

  return (
    <div>
      {/* API URL + 按钮 */}
      <div className="flex items-center mb-3">
        <div className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm">
          {apiUrl}
        </div>

        <button
          onClick={fetchPrice}
          className="ml-3 px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
        >
          请求 API
        </button>
      </div>

      {/* 返回结果 */}
      <div className="flex space-x-4 text-s items-center">
        <span>symbol: {symbol}</span>
        <span>price: {price}</span>
        <span>time: {time}</span>
      </div>
    </div>
  )
}