package config

import (
	"encoding/json"
	"fmt"
	"os"
)

type Config struct {
	Organization string                `json:"organization"`
	App          string                `json:"app"`
	Flags        map[string]FlagConfig `json:"flags"`
	Segments     []string              `json:"segments"`
}

type FlagConfig struct {
	DefaultValue json.RawMessage `json:"defaultValue"`
	Description  string          `json:"description,omitempty"`
}

func Example(orgSlug, appName string) *Config {
	return &Config{
		Organization: orgSlug,
		App:          appName,
		Flags: map[string]FlagConfig{
			"example_flag": {
				DefaultValue: json.RawMessage(`{"enabled": false}`),
				Description:  "An example feature flag",
			},
		},
		Segments: []string{"example_segment"},
	}
}

func Save(path string, c *Config) error {
	data, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return fmt.Errorf("encode config: %w", err)
	}
	data = append(data, '\n')

	f, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
	if err != nil {
		return fmt.Errorf("create %s: %w", path, err)
	}
	defer f.Close()

	if _, err := f.Write(data); err != nil {
		return fmt.Errorf("write %s: %w", path, err)
	}
	return nil
}
