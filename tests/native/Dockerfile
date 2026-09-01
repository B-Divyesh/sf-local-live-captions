# Pinned base for native claim verification. `run-native-claim.sh` builds and
# uses this image when Docker is available; its Debian/Ubuntu bootstrap is the
# matching fallback for workers without a container runtime.
FROM ubuntu:22.04@sha256:2edbbc5dc405e9612ba3584ce95480277e3eb374407b5505fe26f17df77c7dbc

ENV DEBIAN_FRONTEND=noninteractive \
    RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:${PATH} \
    LLC_NATIVE_ENV_READY=1

ARG NODE_VERSION=22.23.0
ARG NODE_SHA256=14d7de44f235534799f8b171a4050d9a6a4bc99c87e053a25d3d54afa580aa20

RUN apt-get update \
  && apt-get install --yes --no-install-recommends \
    build-essential cmake curl file libclang-dev libglib2.0-dev libwebkit2gtk-4.1-dev \
    libappindicator3-dev librsvg2-dev patchelf libasound2-dev libpulse-dev \
    pkg-config pulseaudio pulseaudio-utils strace xz-utils ca-certificates \
  && curl --fail --location --silent --show-error --output /tmp/node.tar.xz "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
  && echo "${NODE_SHA256}  /tmp/node.tar.xz" | sha256sum --check --status \
  && tar --extract --xz --file /tmp/node.tar.xz --directory /usr/local --strip-components=1 \
  && rm -f /tmp/node.tar.xz \
  && curl --proto '=https' --tlsv1.2 --fail --silent --show-error https://sh.rustup.rs -o /tmp/rustup-init.sh \
  && sh /tmp/rustup-init.sh -y --profile minimal --default-toolchain 1.98.0 \
  && rm -f /tmp/rustup-init.sh \
  && rm -rf /var/lib/apt/lists/*
