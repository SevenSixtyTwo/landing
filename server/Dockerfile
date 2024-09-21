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

COPY --from=build /app/server/out /out/
COPY --from=build /app/runs/program .

EXPOSE 8080

CMD ["./program"]

# -it => -interactive + -tty

# docker run -u 
# docker run --read-only --security-opt=no-new-privileges  --cap-drop all --cap-add CHOWN alpine
# docker run --read-only --security-opt=no-new-privileges --expose 8080 server