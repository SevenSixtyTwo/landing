package utilenv

import (
	"fmt"
	"os"
	"strconv"
)

func LoadIntVar(variable *int, name string) error {
	if str, ok := os.LookupEnv(name); !ok {
		return fmt.Errorf("%s environment not declare", name)
	} else {
		var err error
		if *variable, err = strconv.Atoi(str); err != nil {
			return fmt.Errorf("%s environment not integer: %v", name, err)
		}
	}

	return nil
}
