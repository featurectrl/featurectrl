package cmd

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"

	"github.com/featurectrl/featurectrl/cli/internal/config"
)

const defaultConfigFile = "featurectrl.config.json"

var appName string

var initCmd = &cobra.Command{
	Use:   "init [config-file]",
	Short: "Create a featurectrl.config.json skeleton in the current directory",
	Args:  cobra.MaximumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		path := defaultConfigFile
		if len(args) == 1 {
			path = args[0]
		}

		name := appName
		if name == "" {
			prompted, err := promptAppName(cmd.InOrStdin(), cmd.OutOrStdout())
			if err != nil {
				return err
			}
			name = prompted
		}
		if name == "" {
			return errors.New("app name is required (pass --app-name or enter one when prompted)")
		}

		cfg := &config.Config{
			App: name,
			Flags: map[string]config.FlagConfig{
				"example_flag": {
					DefaultValue: json.RawMessage(`{"enabled": false}`),
					Description:  "An example feature flag — rename or remove.",
				},
			},
			Segments: []string{"example_segment"},
		}

		if err := config.Save(path, cfg); err != nil {
			return err
		}

		abs, err := filepath.Abs(path)
		if err != nil {
			abs = path
		}
		fmt.Printf("created %s\n", abs)
		return nil
	},
}

func promptAppName(in io.Reader, out io.Writer) (string, error) {
	if _, err := fmt.Fprint(out, "App name: "); err != nil {
		return "", err
	}
	line, err := bufio.NewReader(in).ReadString('\n')
	if err != nil && !errors.Is(err, io.EOF) {
		return "", fmt.Errorf("read app name: %w", err)
	}
	return strings.TrimSpace(line), nil
}

func init() {
	initCmd.Flags().StringVarP(&appName, "app-name", "a", "", "name of the app to declare in the config")

	RootCmd.AddCommand(initCmd)
}
