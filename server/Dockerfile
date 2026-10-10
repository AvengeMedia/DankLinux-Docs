FROM stablecog/ubuntu:22.04

COPY ./server/cmd/api/api /app/api
COPY ./blog /app/blog

ENV BLOG_DIR=/app/blog

EXPOSE 8337

CMD ["/app/api"]