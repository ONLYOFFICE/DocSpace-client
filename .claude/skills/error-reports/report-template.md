🔎 **Error reports after v<target>**

Sample: <N> reports from <U> users over <hours> h (<dd.mm>–<dd.mm>). <caveat>

**Client**
1. 🐞 `<error>` — <where>. <reports/users/versions>. Likely cause: <cause> in `<file>:<line>`.
2. ⚠️ <product gap> — <what UI offers vs what server rejects>.

**Server** (shown by the editor's error page, to be fixed in the backend)
3. 🆕 `<error>` — <where>, <N> portals.
4. `<error>` — <N> reports, <P> portals, share ×<k> vs <baseline>.

**Good news (so far)**
<target> has no <gone signatures with users count> yet. But <browser> has not sent a single report yet (<share>% in <baseline>), so it is too early to tell.

Analysis script and skill: `.claude/skills/error-reports` (`--signature <query>` gives a detailed report on one error).
