FROM golang:alpine

WORKDIR /app

COPY go.mod go.sum ./

# Dynamically patch the go.mod version to match the container's Go version
RUN go_version=$(go version | awk '{print $3}' | sed -E 's/go([0-9]+\.[0-9]+).*/\1/') && \
    sed -i "s/go 1.25/go ${go_version}/g" go.mod

# Set CGO_ENABLED=0 to build without GCC/C dependencies
ENV CGO_ENABLED=0

RUN go mod download

COPY . .

EXPOSE 8080

CMD ["go", "run", "./cmd/main.go"]
