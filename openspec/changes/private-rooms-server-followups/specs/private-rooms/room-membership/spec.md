# Spec Delta

## REMOVED Requirements

### Requirement: Refused access change in a private room is explained
**Reason**: The server no longer refuses a leave, a removal or a role change of a member for want of keys (`server-contract`, "Key check only when access is first granted"), so the text Common:EncryptedAccessChangeRefused had no case left to explain.
**Migration**: A failed leave, removal or role change in a private room is shown as in any room. The helper, its call sites and the Common key are deleted.
