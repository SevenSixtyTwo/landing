package utilenv

import "strings"

func LoadSliceVar(variable *[]string, name string, sep string) {
	var tmp string

	LoadStrVar(&tmp, name)

	*variable = strings.Split(tmp, sep)
}
