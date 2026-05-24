package cmd

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/featurectrl/featurectrl/cli/internal/api"
	"github.com/featurectrl/featurectrl/cli/internal/config"
)

var pushCmd = &cobra.Command{
	Use:   "push",
	Short: "Push the local featurectrl config to the server",
	Args:  cobra.NoArgs,
	RunE: func(cmd *cobra.Command, args []string) error {
		configPath := getConfigPath(cmd)
		apiUrl := getApiUrl(cmd)
		apiKey := getApiKey(cmd)

		if apiKey == "" {
			return fmt.Errorf("API key required (set --%s or %s)", flagApiKey, envVarApiKey)
		}

		cfg, err := config.Load(configPath)
		if err != nil {
			return err
		}
		if cfg.App == "" {
			return errors.New(`"app" field in config must be a non-empty string`)
		}

		client := &api.Client{BaseURL: apiUrl, APIKey: apiKey}
		resp, err := client.SubmitConfig(cfg.App, cfg)
		if err != nil {
			return err
		}

		fmt.Printf("pushed %d flags, %d segments to app %q\n", len(resp.Flags), len(resp.Segments), resp.App.Name)
		return nil
	},
}

func init() {
	RootCmd.AddCommand(pushCmd)
}
