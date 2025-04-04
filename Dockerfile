FROM node:22.12.0

RUN apt update && apt install -y openssh-client gettext git curl zip bash zsh wget

# LOCAL build and push
# DOCKER buildx build --platform linux/amd64,linux/arm64 --push --provenance=false -t 853826018359.dkr.ecr.us-east-1.amazonaws.com/maf/ci-cd/docker-node-ci:22.12.0 --progress plain .