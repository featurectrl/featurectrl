package cmd

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"

	"github.com/featurectrl/featurectrl/cli/internal/config"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Create a featurectrl.config.json skeleton in the current directory",
	Args:  cobra.NoArgs,

	RunE: func(cmd *cobra.Command, args []string) error {
		configPath := getConfigPath(cmd)
		appName, _ := cmd.Flags().GetString("app-name")

		if appName == "" {
			prompted, err := promptAppName(cmd.InOrStdin(), cmd.OutOrStdout())
			if err != nil {
				return err
			}
			appName = prompted
		}
		if appName == "" {
			return errors.New("app name is required (pass --app-name or enter one when prompted)")
		}

		cfg := config.Example(appName)

		if err := config.Save(configPath, cfg); err != nil {
			return err
		}

		abs, err := filepath.Abs(configPath)
		if err != nil {
			abs = configPath
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
	initCmd.Flags().StringP("app-name", "a", "", "name of the app to declare in the config")

	RootCmd.AddCommand(initCmd)
}
