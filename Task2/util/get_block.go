package main

import (
    "context"
    "fmt"
    "log"

    "github.com/ethereum/go-ethereum/ethclient"
)

func main() {
    rpcURL := "https://ethereum.publicnode.com"
    // 备选：https://cloudflare-eth.com

    client, err := ethclient.Dial(rpcURL)
    if err != nil {
        log.Fatalf("连接失败: %v", err)
    }
    defer client.Close()

    // 获取最新区块号
    blockNumber, err := client.BlockNumber(context.Background())
    if err != nil {
        log.Fatalf("获取区块号失败: %v", err)
    }

    fmt.Printf("当前最新区块号: %d\n", blockNumber)

    // 获取区块详情
    block, err := client.BlockByNumber(context.Background(), nil)
    if err != nil {
        log.Fatalf("获取区块失败: %v", err)
    }

    fmt.Printf("区块哈希: %s\n", block.Hash().Hex())
    fmt.Printf("时间戳: %d\n", block.Time())
    fmt.Printf("交易数: %d\n", len(block.Transactions()))
}