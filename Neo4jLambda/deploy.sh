#!/bin/sh
sudo docker build -t n4j-service:test .
sudo docker tag n4j-service:test 081094903724.dkr.ecr.us-east-1.amazonaws.com/n4j-mirror-repo:latest
sudo docker push 081094903724.dkr.ecr.us-east-1.amazonaws.com/n4j-mirror-repo:latest