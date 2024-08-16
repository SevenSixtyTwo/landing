package env

import utilenv "api/utils/env"

var (
	FROM     string
	TO       []string
	SERVER   string
	PASSWORD string
)

// import --> const --> var --> init()
func init() {
	utilenv.LoadFileEnv("./secrets/.smtp.env")

	utilenv.LoadStrVar(&FROM, "FROM")
	utilenv.LoadStrVar(&SERVER, "SERVER")
	utilenv.LoadStrVar(&PASSWORD, "PASSWORD")

	utilenv.LoadSliceVar(&TO, "TO", ",")
}
