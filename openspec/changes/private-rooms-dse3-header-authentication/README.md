# private-rooms-dse3-header-authentication

Authenticate DSE3 header flags and encrypted-name presence

**Status: deferred to the next version** (owner decision of 2026-11-02). The
Document Server 10.0.0.133 library reads container version 2 only, so the
switch to version 3 waits for a Document Server release that reads it. Until
then `private-rooms-dse3-header-limitation` records the unauthenticated header
fields as a v1 limitation; the open tasks in tasks.md stay as the plan, and
task 2.3 retires that limitation when the change resumes.
