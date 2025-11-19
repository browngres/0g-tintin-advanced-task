# 0G x TinTinLand 进阶课 作业

## Task 1

没有代码题

## Task 2

**题目**：

> 编写 Golang 程序，将一个 4GB 的文件，切分成 10 个 400MB 的文件，并使用 0g-storage-client 上传并下载（参考 fragment size 参数设置）

**作答**：`Task2\main.go`

**运行方法**：

> 必须使用 go <= 1.23

安装项目依赖（Go 会自动处理 go.mod 中的依赖）：

```bash
go mod tidy
```

项目依赖以下包（Go 会自动下载）：

-   `github.com/0gfoundation/0g-storage-client v1.2.1`
-   `github.com/joho/godotenv v1.5.1`

进入 Task2 目录后运行：

```bash
cd Task2
go run ./main.go
```

windows 需要将 `/` 换成 `\`

**说明**：

-   `4 GB = 4*1024*1024*1024 Byte`，由于切分 10 份后的 byte 数不是整数（实际单位转换是按 1024 计算），因此实际作答改成切分 8 份。

**测试上传结果**：

> (4MB 切 8 份) txHash=0xa5c941293f1ce27823f07c39f44c5035a5507a4e3a0d7514aec921ce09ed6a18
> root[0] = 0x8f6a2bc39677e8c0123b11295f92b4d2248ea2c9fa4b83505c491fc51376260e
> root[1] = 0xc50e1f9c84d2538cbb5fa535237c40cd68a7169a43385bead7cb0cc0b845e286
> root[2] = 0xa69bf9bbb31db25bf1bf0b0151f2bb6f31205101b7fac023ab876d990b16162d
> root[3] = 0x9b447ae972f49801d99b8f55687693209ca6334d694c357ddbce4f5616881f20
> root[4] = 0x68c43b16b4c2e7970ad4391675e2dfb3ee56a4e8d9518ba0762ede697eba664a
> root[5] = 0xcf55c4c5fcddeb3bfc9367eecf5070edd0f0da60130589309ed06baef7a96d20
> root[6] = 0xdcf139c8bc9e18497522f19a713f5ba4cbd127771fa0f0f26f8f82ecb9132ca6
> root[7] = 0xe46e91fad97638de13d34024c78c60ff8286a836fa2c4a17f8941689dcac3908

在浏览器查看此交易的 log 可以看到 8 次上传的记录，root 也对应：
[Transaction](https://chainscan-galileo.0g.ai/tx/0xa5c941293f1ce27823f07c39f44c5035a5507a4e3a0d7514aec921ce09ed6a18?tab=logs)

**备用链接**：

-   [0g-storage-client Go SDK](https://github.com/0gfoundation/0g-storage-client)
-   [faucet](https://faucet.0g.ai/)
-   [testnet storage scan](https://storagescan-galileo.0g.ai/)
-   [testnet RPC](https://evmrpc-testnet.0g.ai/)
-   [GO SDK 集成指南](https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk)
-   [0g-storage-go-starter-kit](https://github.com/0gfoundation/0g-storage-go-starter-kit)

## go 依赖踩坑

一开始使用 go1.25 ，依赖的版本踩了坑。跟着 AI 排查以及试图寻求更新方案很长时间。最后只能降级 go

**原因分析**：

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

**解决方案**：
最后无奈安装低版本的 go，例如 `1.22.8`。如果已经有 go，安装共存版本：

```bash
go install golang.org/dl/go1.22.8
go1.22.8 download
go1.22.8 version
```

安装在 `~/sdk/go1.22.8` , bin 在 `%GOPATH%/bin`。之后用 go1.22.8 替换命令中的 go 即可
