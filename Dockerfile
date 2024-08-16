FROM golang:1.22.5-alpine3.20 AS build

WORKDIR /app

COPY . .
RUN addgroup -S nonroot \   
    && adduser -S nonroot -G nonroot

# linker flags -s -w are used to get the smallest possible binaries
RUN GO111ENABLED=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64 \
    go -C "server/" build -ldflags "-s -w" -o /app/runs/program


FROM scratch

COPY --from=build /etc/passwd /etc/passwd

USER nonroot

COPY --from=build /app/server/web /web/
COPY --from=build /app/runs/program .

EXPOSE 8080

CMD ["./program"]

# -it => -interactive + -tty