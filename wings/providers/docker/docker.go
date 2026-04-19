package docker

import (
	"context"
	"io"
	"os"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
)

type Provider struct {
	Client *client.Client
}

func NewProvider() (*Provider, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	return &Provider{Client: cli}, nil
}

func (p *Provider) ListInstances(ctx context.Context) ([]types.Container, error) {
	return p.Client.ContainerList(ctx, container.ListOptions{All: true})
}

func (p *Provider) StartInstance(ctx context.Context, id string) error {
	return p.Client.ContainerStart(ctx, id, container.StartOptions{})
}

func (p *Provider) StopInstance(ctx context.Context, id string) error {
	return p.Client.ContainerStop(ctx, id, container.StopOptions{})
}

func (p *Provider) DeleteInstance(ctx context.Context, id string) error {
	return p.Client.ContainerRemove(ctx, id, container.RemoveOptions{Force: true})
}

func (p *Provider) CreateInstance(ctx context.Context, config *CreateConfig) (string, error) {
	// Pull Image
	reader, err := p.Client.ImagePull(ctx, config.Image, image.PullOptions{})
	if err != nil {
		return "", err
	}
	defer reader.Close()
	io.Copy(os.Stdout, reader)

	// Prepare Container Config
	containerCfg := &container.Config{
		Image:        config.Image,
		Cmd:          config.Cmd,
		Env:          config.Env,
		ExposedPorts: make(nat.PortSet),
		WorkingDir:   "/data",
		Tty:          true,
		OpenStdin:    true,
	}

	for p := range config.ExposedPorts {
		containerCfg.ExposedPorts[nat.Port(p)] = struct{}{}
	}

	// Prepare Host Config
	hostCfg := &container.HostConfig{
		Binds: config.Binds,
		Resources: container.Resources{
			Memory: config.Memory,
		},
		NetworkMode: "host",
	}

	// Create
	resp, err := p.Client.ContainerCreate(ctx, containerCfg, hostCfg, nil, nil, config.Name)
	if err != nil {
		return "", err
	}

	return resp.ID, nil
}

type CreateConfig struct {
	Name         string
	Image        string
	Cmd          []string
	Env          []string
	ExposedPorts map[string]struct{}
	Binds        []string
	Memory       int64
	Cpu          int64
}
