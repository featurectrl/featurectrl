package cmd

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/featurectrl/featurectrl/cli/internal/api"
	"github.com/featurectrl/featurectrl/cli/internal/config"
)

var publishCmd = &cobra.Command{
	Use:   "publish",
	Short: "Publish the local featurectrl config to the server",
	Args:  cobra.NoArgs,
	RunE: func(cmd *cobra.Command, args []string) error {
		configPath := getConfigPath(cmd)
		apiUrl := getApiUrl(cmd)
		apiKey := getApiKey(cmd)

		if apiKey == "" {
			return fmt.Errorf("API key required (set --%s or %s)", flagApiKey, envVarApiKey)
		}

		payload, err := os.ReadFile(configPath)
		if err != nil {
			return fmt.Errorf("read config %s: %w", configPath, err)
		}
		if !json.Valid(payload) {
			return fmt.Errorf("config %s is not valid JSON", configPath)
		}

		var cfg config.Config
		if err := json.Unmarshal(payload, &cfg); err != nil {
			return fmt.Errorf("parse config %s: %w", configPath, err)
		}
		if cfg.Organization == "" {
			return fmt.Errorf("organization is required in %s", configPath)
		}

		client := &api.Client{BaseURL: apiUrl, APIKey: apiKey}
		resp, err := client.PublishApp(cfg.Organization, payload)
		if err != nil {
			return err
		}

		fmt.Printf("published %d flags, %d segments to app %q\n", len(resp.Flags), len(resp.Segments), resp.App.Name)
		return nil
	},
}

func init() {
	RootCmd.AddCommand(publishCmd)
}
