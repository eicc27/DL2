#!/bin/sh
sudo docker build -t crawler-service:test .
sudo docker tag crawler-service:test 081094903724.dkr.ecr.us-east-1.amazonaws.com/crawler-mirror-repo:latest
sudo docker push 081094903724.dkr.ecr.us-east-1.amazonaws.com/crawler-mirror-repo:latest