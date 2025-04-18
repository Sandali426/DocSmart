#!/bin/bash

# Starting date
start_date="2025-04-18"

# Number of days
days=2

# Commits per day
commits_per_day=3

counter=1

for ((d=0; d<days; d++))
do
  # Calculate the current date
  current_date=$(date -d "$start_date +$d day" +"%Y-%m-%d")

  for ((c=1; c<=commits_per_day; c++))
  do
    export GIT_AUTHOR_DATE="$current_date 12:00:00"
    export GIT_COMMITTER_DATE="$current_date 12:00:00"

    echo "Commit $counter" >> progress.txt
    git add .
    git commit -m "Validations for user login"
    
    ((counter++))
  done
done
