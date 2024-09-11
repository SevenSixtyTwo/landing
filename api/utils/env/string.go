package utilenv

import (
	"fmt"
	"os"
)

func LoadStrVar(variable *string, name string) {
	var ok bool
	if *variable, ok = os.LookupEnv(name); !ok {
		panic(fmt.Errorf("`%s` environment not declare", name))
	}
}