package utils

import "net/http"

func GetIPAddress(r *http.Request) string {
	if ip := r.Header.Get("CF-Connecting-IP"); ip != "" {
		return ip
	}
	if ip := r.Header.Get("X-Real-Ip"); ip != "" {
		return ip
	}
	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		return ip
	}
	return r.RemoteAddr
}

type HeaderGetter interface {
	Header(name string) string
	RemoteAddr() string
}

func GetIPAddressFromHeaders(h HeaderGetter) string {
	if ip := h.Header("CF-Connecting-IP"); ip != "" {
		return ip
	}
	if ip := h.Header("X-Real-Ip"); ip != "" {
		return ip
	}
	if ip := h.Header("X-Forwarded-For"); ip != "" {
		return ip
	}
	return h.RemoteAddr()
}
