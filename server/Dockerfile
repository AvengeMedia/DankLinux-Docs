FROM golang:1.25-alpine AS builder
WORKDIR /src

COPY server/go.mod server/go.sum ./
RUN go mod download

COPY server/ ./
RUN CGO_ENABLED=0 go build -ldflags "-s -w" -o /out/api ./cmd/api

FROM stablecog/ubuntu:22.04

COPY --from=builder /out/api /app/api
COPY ./blog /app/blog

ENV BLOG_DIR=/app/blog

EXPOSE 8337

CMD ["/app/api"]
