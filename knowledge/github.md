---
title: GitHub Activity Dataset
category: datasets
tags: [github, repos, commits, pull-requests, git]
---

# GitHub Activity Dataset

Simulates a GitHub organization with repositories, commit history, and pull request activity.

## Tables

### repos (40 rows)
Repositories across eight programming languages with star and fork counts.

### commits (600 rows)
Commit log with author, line additions/deletions, and timestamp. Authors drawn from a pool of 15 contributors.

### pull_requests (200 rows)
PRs with status (merged/open/closed). Merged PRs include a merged_at timestamp 1-14 days after creation.

## Relationships
- commits.repo_id references repos.id
- pull_requests.repo_id references repos.id

## Interesting queries
- Most active contributors (commits per author)
- Code churn by repo (additions vs deletions)
- PR merge rates and time-to-merge
- Language popularity by stars
