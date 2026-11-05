# Spec Delta

## ADDED Requirements

### Requirement: Cancelling a queued encrypted upload in the SDK stops it
The SDK SHALL take the cancel signal of every file of an encrypted upload batch when the batch starts, so that cancelling a file that is still waiting in the batch stops it before any of its bytes are sent.

#### Scenario: File cancelled while waiting
- **WHEN** a user uploads two files into a private room through the SDK and cancels the second while the first is still uploading
- **THEN** the second file is not uploaded, no file is created for it, and its row is gone
