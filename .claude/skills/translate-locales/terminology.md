# Translation terminology

Fixed term choices for translating locale keys, shared by the `translate-locales`
and `translate-key` skills. Each entry was settled by the technical writers' review
of the locales (October 2026) or is already the dominant form across the locale
files. Use these terms even where an older string in the same file still uses a
different word. Those strings are leftovers, not precedent.

## "AI agents & tools"

This is the name of the paid AI service, formerly "AI features". It is the billing
page title (`Common:AIFeatures`) and is reused verbatim in every string that names
the service. Never translate it back to "AI features", "AI functions" or similar.

| Lang | Term | Lang | Term |
|------|------|------|------|
| ar-SA | وكلاء وأدوات الذكاء الاصطناعي | lv | MI aģenti un rīki |
| az | AI agentləri və alətlər | nl | AI-agenten en -tools |
| bg | ИИ агенти и инструменти | pl | Agenci i narzędzia AI |
| cs | AI agenti a nástroje | pt | Agentes e ferramentas de IA |
| de | KI-Agenten und Tools | pt-BR | Agentes e ferramentas de IA |
| el-GR | AI πράκτορες και εργαλεία | ro | Agenți și instrumente IA |
| es | Agentes y herramientas de IA | ru | ИИ-агенты и инструменты |
| fi | AI-agentit ja -työkalut | si | AI නියෝජිතයන් සහ මෙවලම් |
| fr | Agents et outils IA | sk | AI agenti a nástroje |
| hy-AM | ԱԲ գործակալներ և գործիքներ | sl | AI agenti in orodja |
| it | Agenti e strumenti IA | sq-AL | Agjentët dhe mjetet e AI |
| ja-JP | AIエージェントとツール | sr-Cyrl-RS | АИ агенти и алати |
| ko-KR | AI 에이전트 및 도구 | sr-Latn-RS | AI agenti i alati |
| lo-LA | AI ຕົວແທນ ແລະ ເຄື່ອງມື | tr | AI aracıları ve araçları |
| uk-UA | Агенти та інструменти AI | vi | Tác nhân và công cụ AI |
| zh-CN | AI 智能体和工具 | | |

Inflect the term as the sentence requires. In `ru` the prefix «ИИ-» is written once
and covers both nouns, so never write «ИИ-агенты и ИИ-инструменты». «Агенты» is
animate, so the accusative is «Активировать ИИ-агентов и инструменты», not
«ИИ-агенты».

## AI agent, AI search

- `zh-CN`: "AI agent" is «AI 智能体», never «AI 代理».
- `ru`: "AI agent" is «ИИ-агент» and "AI Search" is «ИИ-поиск». Use the prefix form,
  never «агент ИИ» or «поиск с ИИ».

## Full admin

"Full admin" is the top portal role. Translate it with the language's super-admin
term below. Never use "workspace administrator" or a plain "administrator": those
are different roles. When the English says "your Full admin", keep the possessive
(«Ihren Super-Administrator», «votre super-administrateur»).

| Lang | Term | Lang | Term |
|------|------|------|------|
| ar-SA | المسؤول العام | pl | superadministrator |
| az | super administrator | pt, pt-BR | superadministrador |
| bg | суперадминистратор | ro | superadministrator |
| cs | supersprávce | ru | суперадминистратор |
| de | Super-Administrator | sk | supersprávca |
| es | superadministrador | sl | superskrbnik |
| fr | super-administrateur | sq-AL | superadministrator |
| hy-AM | գերադմինիստրատոր | sr-Cyrl-RS | суперадминистратор |
| it | superamministratore | sr-Latn-RS | superadministrator |
| ja-JP | スーパー管理者 | uk-UA | суперадміністратор |
| lv | superadministrators | zh-CN | 超级管理员 |
| nl | superbeheerder | | |

For the other languages, grep the existing strings whose English contains
"Full admin" and reuse the term they share.

## French: add-ons and plugins

- "Add-on(s)", the paid services in Billing, is «extension(s)», feminine:
  «Extensions actives», «Aucune extension active».
- "Plugin(s)", the uploadable workspace extensions, is «module(s) complémentaire(s)».

These two must not collide: never translate "add-on" as «module complémentaire».
