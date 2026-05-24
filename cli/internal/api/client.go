package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/featurectrl/featurectrl/cli/internal/config"
)

type Client struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client
}

type NamedRef struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SubmitConfigResponse struct {
	OK       bool       `json:"ok"`
	App      NamedRef   `json:"app"`
	Flags    []NamedRef `json:"flags"`
	Segments []NamedRef `json:"segments"`
}

func (c *Client) httpClient() *http.Client {
	if c.HTTPClient != nil {
		return c.HTTPClient
	}
	return http.DefaultClient
}

func (c *Client) SubmitConfig(appName string, body *config.Config) (*SubmitConfigResponse, error) {
	base := strings.TrimRight(c.BaseURL, "/")
	endpoint := fmt.Sprintf("%s/apps/%s/submit-config", base, url.PathEscape(appName))

	payload, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("encode request body: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.APIKey)

	resp, err := c.httpClient().Do(req)
	if err != nil {
		return nil, fmt.Errorf("POST %s: %w", endpoint, err)
	}
	defer resp.Body.Close()

	const maxBody = 4 << 10
	respBody, _ := io.ReadAll(io.LimitReader(resp.Body, maxBody))

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		msg := strings.TrimSpace(string(respBody))
		if msg == "" {
			msg = resp.Status
		}
		return nil, fmt.Errorf("server returned %d: %s", resp.StatusCode, msg)
	}

	var out SubmitConfigResponse
	if err := json.Unmarshal(respBody, &out); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}
	return &out, nil
}
