#!/bin/sh

# generate CA
openssl genrsa -out dev_ca_key.pem 2048
openssl req -new -x509 -sha256 -days 1826 -nodes -subj "/CN=Dev CA" -key dev_ca_key.pem -out dev_ca.pem

# Generate certificate
openssl genrsa -out dev_key.pem 2048
openssl req -new -subj "/CN=dev" -key dev_key.pem -out dev.csr
openssl x509 -req -sha256 -days 1826 -in dev.csr -CA dev_ca.pem -CAkey dev_ca_key.pem -CAcreateserial -extfile dev.ext -out dev.pem

# Remove CA key and CSR
rm dev_ca_key.pem dev.csr
