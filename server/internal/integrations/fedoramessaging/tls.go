package fedoramessaging

import (
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"os"
	"path/filepath"
)

const (
	caFile   = "cacert.pem"
	certFile = "fedora-cert.pem"
	keyFile  = "fedora-key.pem"
)

func loadTLS(dir string) (*tls.Config, error) {
	if dir == "" {
		return nil, errors.New("fedora messaging: TLS dir not set")
	}

	ca, err := os.ReadFile(filepath.Join(dir, caFile))
	if err != nil {
		return nil, err
	}
	pool := x509.NewCertPool()
	if !pool.AppendCertsFromPEM(ca) {
		return nil, fmt.Errorf("fedora messaging: no CA certificate parsed from %s", caFile)
	}

	pair, err := tls.LoadX509KeyPair(filepath.Join(dir, certFile), filepath.Join(dir, keyFile))
	if err != nil {
		return nil, fmt.Errorf("fedora messaging: client key pair: %w", err)
	}

	return &tls.Config{
		RootCAs:      pool,
		Certificates: []tls.Certificate{pair},
		MinVersion:   tls.VersionTLS12,
	}, nil
}
