package cmd

import (
	"os"

	"github.com/spf13/cobra"
)

const (
	defaultConfigFile = "featurectrl.config.json"
	defaultApiUrl     = "https://api.featurectrl.io"

	flagConfig  = "config"
	flagConfigP = "c"
	flagApiKey  = "api-key"
	flagApiUrl  = "api-url"

	envVarConfig = "FEATURECTRL_CONFIG_PATH"
	envVarApiKey = "FEATURECTRL_API_KEY"
	envVarApiUrl = "FEATURECTRL_API_URL"
)

var RootCmd = &cobra.Command{
	Use:          "featurectrl",
	Short:        "featurectrl CLI",
	SilenceUsage: true,
}

func getConfigPath(cmd *cobra.Command) string {
	value, err := cmd.Flags().GetString(flagConfig)
	if err != nil {
		return ""
	}

	if value == defaultConfigFile {
		value = os.Getenv(envVarConfig)
	}

	if value == "" {
		value = defaultConfigFile
	}

	return value
}

func getApiKey(cmd *cobra.Command) string {
	value, err := cmd.Flags().GetString(flagApiKey)
	if err != nil {
		return ""
	}

	if value == "" {
		value = os.Getenv(envVarApiKey)
	}
	return value
}

func getApiUrl(cmd *cobra.Command) string {
	value, err := cmd.Flags().GetString(flagApiUrl)

	if err != nil {
		return ""
	}

	if value == defaultApiUrl {
		value = os.Getenv(envVarApiUrl)
	}

	if value == "" {
		value = defaultApiUrl
	}

	return value
}

func init() {
	RootCmd.PersistentFlags().StringP(flagConfig, flagConfigP, defaultConfigFile, "path to the featurectrl config file")

	RootCmd.PersistentFlags().String(flagApiUrl, defaultApiUrl, "Server API URL")
	RootCmd.PersistentFlags().String(flagApiKey, "", "API key (private)")
}
