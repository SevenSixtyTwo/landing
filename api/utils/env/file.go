package utilenv

import (
	"errors"
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

func LoadFileEnv(path string) {
	if err := godotenv.Load(path); err != nil {
		panic(fmt.Errorf("load file env `%s`: %v", path, err))
	}
}

func FileIsExist(path string) {
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		panic(fmt.Errorf("error file not exist `%s`: %v", path, err))
	}
}

func LoadFileToString(p string, s *string) {
	byteResourceSr, err := os.ReadFile(p)
	if err != nil {
		panic(fmt.Errorf("read kafka schema: %v", err))
	}

	schemaString := string(byteResourceSr)
	*s = schemaString
}
