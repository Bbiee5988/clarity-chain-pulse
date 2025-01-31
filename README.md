# ChainPulse

A blockchain activity monitoring tool built on Stacks using Clarity smart contracts.

## Features
- Track transaction counts and volumes
- Monitor active addresses
- Store historical blockchain metrics
- Query analytics data
- Prevent duplicate/out-of-order block recording
- Track last recorded block height

## Usage
The contract provides functions to:
- Record new block metrics (with validation)
- Query historical data
- Get aggregated statistics
- Check last recorded block height

## Development
1. Install Clarinet
2. Run tests: `clarinet test`
3. Deploy contract

## Recent Enhancements
- Added validation to prevent recording of duplicate blocks
- Added tracking of last recorded block height
- Blocks must be recorded in sequential order
- Enhanced aggregate stats to include last recorded height
