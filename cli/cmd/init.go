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
		orgSlug, _ := cmd.Flags().GetString("org")
		appName, _ := cmd.Flags().GetString("app-name")

		reader := bufio.NewReader(cmd.InOrStdin())
		out := cmd.OutOrStdout()

		if orgSlug == "" {
			prompted, err := promptLine(reader, out, "Organization slug: ", "organization slug")
			if err != nil {
				return err
			}
			orgSlug = prompted
		}
		if orgSlug == "" {
			return errors.New("organization slug is required (pass --org or enter one when prompted)")
		}

		if appName == "" {
			prompted, err := promptLine(reader, out, "App name: ", "app name")
			if err != nil {
				return err
			}
			appName = prompted
		}
		if appName == "" {
			return errors.New("app name is required (pass --app-name or enter one when prompted)")
		}

		cfg := config.Example(orgSlug, appName)

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

func promptLine(in *bufio.Reader, out io.Writer, prompt, label string) (string, error) {
	if _, err := fmt.Fprint(out, prompt); err != nil {
		return "", err
	}
	line, err := in.ReadString('\n')
	if err != nil && !errors.Is(err, io.EOF) {
		return "", fmt.Errorf("read %s: %w", label, err)
	}
	return strings.TrimSpace(line), nil
}

func init() {
	initCmd.Flags().StringP("org", "o", "", "organization slug to declare in the config")
	initCmd.Flags().StringP("app-name", "a", "", "name of the app to declare in the config")

	RootCmd.AddCommand(initCmd)
}
