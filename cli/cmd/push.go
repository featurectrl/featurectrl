package cmd

import (
	"errors"
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/featurectrl/featurectrl/cli/internal/api"
	"github.com/featurectrl/featurectrl/cli/internal/config"
)

const (
	envAPIKey     = "FEATURECTRL_API_KEY"
	envAPIURL     = "FEATURECTRL_API_URL"
	defaultAPIURL = "https://api.featurectrl.io"
)

var (
	pushConfigPath string
	pushAPIKey     string
	pushAPIURL     string
)

var pushCmd = &cobra.Command{
	Use:   "push",
	Short: "Push the local featurectrl config to the server",
	Args:  cobra.NoArgs,
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := config.Load(pushConfigPath)
		if err != nil {
			return err
		}
		if cfg.App == "" {
			return errors.New(`"app" field in config must be a non-empty string`)
		}

		apiKey := pushAPIKey
		if apiKey == "" {
			apiKey = os.Getenv(envAPIKey)
		}
		if apiKey == "" {
			return fmt.Errorf("API key required (set --api-key or %s)", envAPIKey)
		}

		apiURL := pushAPIURL
		if apiURL == "" {
			apiURL = os.Getenv(envAPIURL)
		}
		if apiURL == "" {
			apiURL = defaultAPIURL
		}

		client := &api.Client{BaseURL: apiURL, APIKey: apiKey}
		resp, err := client.SubmitConfig(cfg.App, cfg)
		if err != nil {
			return err
		}

		fmt.Printf("pushed %d flags, %d segments to app %q\n", len(resp.Flags), len(resp.Segments), resp.App.Name)
		return nil
	},
}

func init() {
	pushCmd.Flags().StringVarP(&pushConfigPath, "config", "c", defaultConfigFile, "path to the featurectrl config file")
	pushCmd.Flags().StringVar(&pushAPIKey, "api-key", "", "Private API key")
	pushCmd.Flags().StringVar(&pushAPIURL, "api-url", "", fmt.Stringf("Server API URL (default: %s)", defaultAPIURL))

	RootCmd.AddCommand(pushCmd)
}
