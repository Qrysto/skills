# Troubleshooting and configuration

[Back to the README](../README.md)

## Troubleshooting

### "No skills found"

Ensure the repository contains valid `SKILL.md` files with both `name` and `description` in the frontmatter.

### Skill not loading in agent

- Verify the skill was installed to the correct path
- Check the agent's documentation for skill loading requirements
- Ensure the `SKILL.md` frontmatter is valid YAML

### Permission errors

Ensure you have write access to the target directory.

## Environment Variables

| Variable                  | Description                                                                 |
| ------------------------- | --------------------------------------------------------------------------- |
| `INSTALL_INTERNAL_SKILLS` | Set to `1` or `true` to show and install skills marked as `internal: true`  |
| `DISABLE_TELEMETRY`       | Set to disable security-audit requests (usage telemetry is always disabled) |
| `DO_NOT_TRACK`            | Alternative way to disable security-audit requests                          |
| `GITHUB_TOKEN`            | Optional explicit token for authenticated GitHub API requests               |
| `GH_TOKEN`                | Fallback explicit token for authenticated GitHub API requests               |

```bash
# Install internal skills
INSTALL_INTERNAL_SKILLS=1 npx @krysto/skills add vercel-labs/agent-skills --list
```

## Telemetry

Usage telemetry is disabled in this fork. Neither the CLI nor programmatic API
sends usage events to the upstream `/tele/t` endpoint, even with `telemetry: true`.

Discovery still sends search queries to `https://skills.sh/api/search` and skill
downloads may use `https://skills.sh/api/download/`. Security-audit requests send
source and skill identifiers to `https://www.skills.sh/tele/audit`, limited to
GitHub repositories confirmed to be public. Set `DISABLE_TELEMETRY=1` or
`DO_NOT_TRACK=1` to disable audit requests; search and downloads remain available.
