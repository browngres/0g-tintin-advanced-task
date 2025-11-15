# 0G x TinTinLand 进阶课 作业

## Task 1

没有代码题

## Task 2

**题目**：

> 编写 Golang 程序，将一个 4GB 的文件，切分成 10 个 400MB 的文件，并使用 0g-storage-client 上传并下载（参考 fragment size 参数设置）

**作答**：`Task2\main.go`

**说明**：`4 GB = 4*1024*1024*1024 Byte`，由于切分 10 份后的 byte 数不是整数（实际单位转换是按 1024 计算），因此实际作答改成切分 8 份。

> 必须使用 go <= 1.23
> `go install github.com/joho/godotenv/cmd/godotenv@latest` > `go install github.com/0glabs/0g-storage-client`

**备用链接**：

-   [0g-storage-client Go SDK](https://github.com/0gfoundation/0g-storage-client)
-   [faucet](https://faucet.0g.ai/)
-   [testnet storage scan](https://storagescan-galileo.0g.ai/)
-   [testnet RPC](https://evmrpc-testnet.0g.ai/)
-   [GO SDK 集成指南](https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk)
-   [0g-storage-go-starter-kit](https://github.com/0gfoundation/0g-storage-go-starter-kit)

## go 依赖踩坑

> `github.com/0glabs/` 已经更改成 `github.com/0gfoundation/` 但是仓库 go.mod 没有改。因此代码中目前仍需按前者导入

一开始使用 go1.25 ，依赖的版本踩了坑。跟着 AI 排查以及试图寻求更新方案很长时间。最后只能降级 go

> `github.com/0gfoundation/0g-storage-client` 依赖 `go-ethereum` 和 `openweb3/go-rpc-provider` > `go-ethereum` v1.14.x 只能在 Go ≤1.22 下工作。
> `openweb3/go-rpc-provider` 没有更新维护。只能在 `go-ethereum` v1.14.x 上工作

如果在 go 1.23+ 使用 `go-ethereum` v1.14.x

```
# command-line-arguments
link: github.com/fjl/memsize: invalid reference to runtime.stopTheWorld
```

如果更新 `go-ethereum`，则会

```
# github.com/openweb3/go-rpc-provider
XXX\pkg\mod\github.com\openweb3\go-rpc-provider@v1.1.1\handler.go:370:55: cannot call pointer method UpdateSince on "github.com/ethereum/go-ethereum/metrics".Timer
XXX\pkg\mod\github.com\openweb3\go-rpc-provider@v1.1.1\metrics.go:41:9: cannot use metrics.GetOrRegisterTimer(m, nil) (value of type *"github.com/ethereum/go-ethereum/metrics".Timer) as "github.com/ethereum/go-ethereum/metrics".Timer value in return statement
```

最后无奈安装低版本的 go，例如 `1.22.8`。如果已经有 go，安装共存版本：

```bash
go install golang.org/dl/go1.22.8
go1.22.8 download
go1.22.8 version
```

安装在 `~/sdk/go1.22.8` , bin 在 `%GOPATH%/bin`。之后用 go1.22.8 替换命令中的 go 即可
