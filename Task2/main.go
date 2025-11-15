package main

import (
	"crypto/rand"
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

const (
	// FILE_SIZE_4GB   = 4 * 1024 * 1024 * 1024
	FILE_SIZE_4MB   = 4 * 1024 * 1024  // dev
	FILE_TO_UPLOAD  = "./TempFile.bin"
	DOWNLOADED_FILE = "./DownloadedTempFile.bin"
)

func generateFile(size uint64, file_name string) (string, error) {
	data := make([]byte, size) // 单位是 Byte
	rand.Read(data)            // 随机填充

	if err := os.WriteFile(file_name, data, os.ModePerm); err != nil {
		fmt.Println("Failed to write file")
		return file_name, err
	}
	return file_name, nil
}

func deleteFile(file_name string) {

}

func main() {
	// 读取环境变量
	if err := godotenv.Load("../.env"); err != nil {
		fmt.Println("Error loading .env file.")
	}
	TESTNET_RPC := os.Getenv("TESTNET_RPC")
	PRIVATE_KEY := os.Getenv("PRIVATE_KEY")
	fmt.Println(TESTNET_RPC, PRIVATE_KEY)

	// 生成临时文件
	temp_file, err := generateFile(FILE_SIZE_4MB, FILE_TO_UPLOAD)
	if err != nil {
		fmt.Println("Failed to generate file. Exit.")
		return
	}

	f, err := os.Stat(temp_file)
	if err == nil {
		fmt.Println("Created size:", f.Size())
	}

	// 上传

	// 下载

	// 检查文件是否相同
	// sha256

	// 删除临时文件
}
