#!/bin/bash

# Starting value, step, and end value
start=200
step=200
end=5000

# Loop through values from start to end with specified step
for ((x=start; x<=end; x+=step)); do
    echo "Running npm run import $x $step"
    npm run import "$x" "$step"
    echo "Completed npm run import $x $step"

    # Only sleep if it's not the last iteration
    if [ "$x" -lt "$end" ]; then
        echo "Sleeping for 5 minutes..."
        sleep 5m
    fi
done
