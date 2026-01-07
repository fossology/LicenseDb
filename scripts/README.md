# Scripts

This directory contains utility scripts for the LicenseDb project.

## Commit Validation Scripts

### `validate-commit-msg.sh`
Validates a single commit message against the conventional commit format.

Usage:
```bash
./validate-commit-msg.sh [commit-message-file]
```

If no file is provided, it defaults to `.git/COMMIT_EDITMSG`.

### `validate-commit-history.sh`
Validates multiple commit messages in a specified range against the conventional commit format.
This is designed for CI/CD validation of pull requests.

Usage:
```bash
./validate-commit-history.sh [commit-range]
```

If no range is provided, it defaults to `HEAD~1..HEAD`.

### Format
Both scripts validate against the conventional commit format:
```
<type>(<scope>): <subject>
```

Where type is one of:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests
- `chore`: Changes to the build process or auxiliary tools

Example:
```
feat(auth): add login functionality
fix(api): resolve null pointer exception
docs(readme): update installation instructions
```