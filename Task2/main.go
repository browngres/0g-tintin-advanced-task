package main

import (
	"context"
	"crypto/rand"
	"fmt"
	"math"
	"math/big"
	"os"

	"runtime"
	"time"

	// "github.com/ethereum/go-ethereum/ethclient"
	"github.com/0glabs/0g-storage-client/common/blockchain"
	"github.com/0glabs/0g-storage-client/core"
	"github.com/0glabs/0g-storage-client/indexer"
	"github.com/0glabs/0g-storage-client/transfer" // 需要导入 transfer, indexer, core
	"github.com/joho/godotenv"
)

const (
	// TODO FILE_SIZE_4GB   = 4 * 1024 * 1024 * 1024
	FILE_SIZE_4MB   = 4 * 1024 * 1024 // for dev
	FILE_TO_UPLOAD  = "./TempFile.bin"
	DOWNLOADED_FILE = "./DownloadedTempFile.bin"
	TESTNET_INDEXER = "https://indexer-storage-testnet-turbo.0g.ai"
	// !! 说明：`4 GB = 4*1024*1024*1024 Byte`，由于切分 10 份后的 byte 数不是整数（实际单位转换是按 1024 计算），因此实际作答改成切分 8 份。
	FRAGMENT_SIZE = FILE_SIZE_4MB / 8
)

// 上传参数
var (
	fee                     = 0.01
	task_size               = 10
	finality_required       = transfer.FileFinalized
	expected_replica        = 1
	skip_tx                 = true
	num_retries             = 3
	step              int64 = 15
	method                  = "min"
	full_trusted            = true
	timeout                 = time.Duration(300) * time.Second
	go_routines             = runtime.GOMAXPROCS(0)
)

// 生成指定大小文件
func generateFile(size uint64, file_name string) (string, error) {
	// 如果文件已经存在则直接返回，不存在则创建
	f, err := os.Stat(file_name)
	if os.IsNotExist(err) {
		data := make([]byte, size) // 单位是 Byte
		rand.Read(data)            // 随机填充
		if err := os.WriteFile(file_name, data, os.ModePerm); err != nil {
			fmt.Println("Failed to write file")
			return file_name, err
		}
	}
	fmt.Println("Temp file size(Byte):", f.Size())
	return file_name, err // 如果文件存在， err == nil
}

// 删除指定文件
func deleteFile(file_name string) {

}

// 参数相关结构体
type transactionArgument struct {
	url   string
	key   string
	fee   float64
	nonce uint
}

type uploadArgument struct {
	transactionArgument

	file string
	tags string

	node    []string
	indexer string

	expectedReplica uint

	skipTx           bool
	finalityRequired bool
	taskSize         uint
	routines         int

	fragmentSize int64
	maxGasPrice  uint
	nRetries     int
	step         int64
	method       string
	fullTrusted  bool

	timeout time.Duration
}

type UploadOption struct {
	Tags             []byte
	FinalityRequired transfer.FinalityRequirement
	TaskSize         uint
	ExpectedReplica  uint
	SkipTx           bool
	Fee              *big.Int
	Nonce            *big.Int
	MaxGasPrice      *big.Int
	NRetries         int
	Step             int64
	Method           string
	FullTrusted      bool // v1.0.0 的 0g-storage-client 没有这个选项
}

func main() {
	// 超时
	ctx := context.Background()
	var cancel context.CancelFunc
	ctx, cancel = context.WithTimeout(ctx, timeout)
	defer cancel()

	// 读取环境变量
	if err := godotenv.Load("../.env"); err != nil {
		fmt.Println("Error loading .env file.")
		return
	}
	TESTNET_RPC := os.Getenv("TESTNET_RPC")
	PRIVATE_KEY := os.Getenv("PRIVATE_KEY")
	// fmt.Printf("%v\n%v\n", TESTNET_RPC, PRIVATE_KEY)

	// 连接到 RPC

	// * 使用 go-ethereum
	// client, err := ethclient.Dial(TESTNET_RPC)
	// if err != nil {
	//     fmt.Printf("Failed to connect: %v", err)
	// }
	// defer client.Close()

	// * 因为 uploader 使用 `web3go.Client`， 所以必须按照 SDK 使用 web3go
	w3client := blockchain.MustNewWeb3(TESTNET_RPC, PRIVATE_KEY)
	defer w3client.Close()

	if block_height, err := w3client.Eth.BlockNumber(); err == nil {
		fmt.Printf("Current Block Height: %v \n", block_height)
	} else {
		fmt.Println(err)
	}

	// 生成临时文件
	temp_file, err := generateFile(FILE_SIZE_4MB, FILE_TO_UPLOAD)
	if err != nil {
		fmt.Println("Failed to generate file. Exit.")
		return
	}

	/* ##################### */
	// 上传
	/*
		构建一个 `transfer.UploadOption` ，然后把文件读到内存里面。
		初始化一个 uploader，然后调用 `SplitableUpload`
		最终获取到 root，单个文件最大是 4G，如果超过 4G 会有多个 root。
	*/

	// 构建 uploadArgs
	uploadArgs := uploadArgument{
		transactionArgument: transactionArgument{
			url:   TESTNET_RPC,
			key:   PRIVATE_KEY,
			fee:   fee,
			nonce: 0,
		},
		file:             temp_file,
		tags:             "0x",
		node:             []string{},
		indexer:          TESTNET_INDEXER,
		expectedReplica:  uint(expected_replica),
		skipTx:           skip_tx,
		finalityRequired: true,
		taskSize:         uint(task_size),
		routines:         go_routines,
		fragmentSize:     FRAGMENT_SIZE,
		maxGasPrice:      uint(0),
		nRetries:         num_retries,
		step:             step,
		method:           method,
		fullTrusted:      full_trusted,
		timeout:          timeout,
	}

	// 构建 UploadOption
	fee_wei, _ := new(big.Float).Mul(new(big.Float).SetFloat64(uploadArgs.fee), big.NewFloat(math.Pow10(18))).Int(nil)

	opt := UploadOption{
		Tags:             []byte{},          // "0x" 解析后是空字符串
		FinalityRequired: finality_required, // 没有用 uploadArgs
		TaskSize:         uploadArgs.taskSize,
		ExpectedReplica:  uploadArgs.expectedReplica,
		SkipTx:           uploadArgs.skipTx,
		Fee:              fee_wei,
		Nonce:            big.NewInt(0),
		MaxGasPrice:      big.NewInt(0),
		NRetries:         uploadArgs.nRetries,
		Step:             uploadArgs.step,
		Method:           uploadArgs.method,
		FullTrusted:      uploadArgs.fullTrusted,
	}
	// fmt.Println(opt)

	// 打开文件
	file, err := core.Open(temp_file)
	if err != nil {
		fmt.Println("Failed to open file")
		return
	}
	defer file.Close()

	// 实例化 uploader，连接 indexer，选择节点
	indexerClient, err := indexer.NewClient(TESTNET_INDEXER)
	if err != nil {
		fmt.Println("Failed to initialize indexer client")
		return
	}
	// v1.0.0 的 0g-storage-client 没有 opt.FullTrusted 选项
	// up, err := indexerClient.NewUploaderFromIndexerNodes(ctx, file.NumSegments(), w3client, opt.ExpectedReplica, nil, opt.Method, opt.FullTrusted)
	uploader, err := indexerClient.NewUploaderFromIndexerNodes(ctx, file.NumSegments(), w3client, opt.ExpectedReplica, nil, opt.Method)
	if err != nil {
		fmt.Println(err)
		fmt.Println("Failed to initialize uploader")
		return
	}
	closer := indexerClient.Close
	defer closer()

	// _ = uploader

	// 执行上传
	uploader.WithRoutines(uploadArgs.routines)
	// v1.0.0 的 0g-storage-client 没有 opt.FullTrusted 选项
	// 因为类型问题，这里不得不重新构建一个不带 FullTrusted 的。
	opt_old := transfer.UploadOption{
		Tags:             []byte{},
		FinalityRequired: finality_required,
		TaskSize:         uploadArgs.taskSize,
		ExpectedReplica:  uploadArgs.expectedReplica,
		SkipTx:           uploadArgs.skipTx,
		Fee:              fee_wei,
		Nonce:            big.NewInt(0),
		MaxGasPrice:      big.NewInt(0),
		NRetries:         uploadArgs.nRetries,
		Step:             uploadArgs.step,
		Method:           uploadArgs.method,
	}

	_, roots, err := uploader.SplitableUpload(ctx, file, uploadArgs.fragmentSize, opt_old)
	if err != nil {
		fmt.Println("Failed to upload file")
	}
	// 如果上传的文件小于等于 4G，所以 len(roots) == 1
	// 如果切分了多个，也会有多个 root
	s := make([]string, len(roots))
	for i, root := range roots {
		s[i] = root.String()
		fmt.Printf("root[%v] = %v \n", i, s[i])
	}
	fmt.Printf("file uploaded in %v fragments.\n", len(roots))


	// 下载

	// 检查文件是否相同
	// sha256

	// 删除临时文件
}
