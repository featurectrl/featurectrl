package cmd

import "fmt"

var (
	version = "dev"
	commit  = "unknown"
	date    = "unknown"
)

func init() {
	RootCmd.Version = fmt.Sprintf("%s (commit %s, built %s)", version, commit, date)
	RootCmd.SetVersionTemplate("{{.Name}} {{.Version}}\n")
}
