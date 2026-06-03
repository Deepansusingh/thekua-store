FROM golang:alpine

WORKDIR /app

RUN apk add --no-cache git gcc musl-dev

COPY go.mod go.sum ./

# Dynamically patch the go.mod version to match the container's Go version
RUN go_version=$(go version | awk '{print $3}' | sed -E 's/go([0-9]+\.[0-9]+).*/\1/') && \
    sed -i "s/go 1.25/go ${go_version}/g" go.mod

RUN go mod download

COPY . .

EXPOSE 8080

CMD ["go", "run", "./cmd/main.go"]
