#!/bin/sh
sudo docker build -t search-service:test .
sudo docker tag search-service:test 081094903724.dkr.ecr.us-east-1.amazonaws.com/search-mirror-repo:latest
sudo docker push 081094903724.dkr.ecr.us-east-1.amazonaws.com/search-mirror-repo:latest