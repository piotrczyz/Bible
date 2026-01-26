# CLAUDE.md - AI Assistant Guide for Bible Repository

> This document provides context and guidelines for AI assistants working with this codebase.

## Project Overview

**Repository:** Bible
**Status:** New project - initial setup phase
**Purpose:** This repository serves as a comprehensive reference and documentation project.

## Repository Structure

```
Bible/
├── CLAUDE.md          # AI assistant guidelines (this file)
├── README.md          # Project documentation (to be created)
├── src/               # Source code (to be created)
│   ├── components/    # Reusable components
│   ├── utils/         # Utility functions
│   └── index.ts       # Main entry point
├── tests/             # Test files (to be created)
├── docs/              # Additional documentation (to be created)
└── .github/           # GitHub workflows and templates (to be created)
```

## Development Workflow

### Git Branching Strategy

- **Main branch:** Production-ready code
- **Feature branches:** Use format `feature/<description>` or `claude/<description>-<session-id>`
- **Bugfix branches:** Use format `fix/<description>`

### Commit Message Conventions

Follow conventional commits format:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions or modifications
- `chore:` Maintenance tasks

Example: `feat: add user authentication module`

### Pull Request Guidelines

1. Create descriptive PR titles
2. Include a summary of changes
3. Reference related issues if applicable
4. Ensure all tests pass before merging

## Code Style and Conventions

### General Principles

1. **Simplicity:** Write clear, readable code over clever solutions
2. **DRY (Don't Repeat Yourself):** Extract common logic into reusable functions
3. **Single Responsibility:** Each function/module should do one thing well
4. **Documentation:** Document complex logic and public APIs

### Naming Conventions

- **Files:** Use kebab-case for file names (e.g., `user-service.ts`)
- **Variables/Functions:** Use camelCase (e.g., `getUserById`)
- **Classes/Types:** Use PascalCase (e.g., `UserProfile`)
- **Constants:** Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)

### TypeScript Guidelines (when applicable)

- Prefer explicit types over `any`
- Use interfaces for object shapes
- Use type guards for runtime type checking
- Enable strict mode in TypeScript configuration

## Commands Reference

### Setup (to be configured)
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Testing (to be configured)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting (to be configured)
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## AI Assistant Guidelines

### When Working on This Repository

1. **Read before modifying:** Always read existing code before making changes
2. **Follow existing patterns:** Match the style and conventions already in place
3. **Keep changes focused:** Make minimal, targeted changes that address the specific task
4. **Test your changes:** Run tests after making modifications
5. **Document changes:** Update documentation when adding new features

### Things to Avoid

- Don't add unnecessary dependencies
- Don't create files unless absolutely necessary
- Don't over-engineer solutions
- Don't add features beyond what was requested
- Don't introduce security vulnerabilities (validate inputs, sanitize outputs)

### Code Quality Checklist

Before committing, ensure:
- [ ] Code follows project conventions
- [ ] No hardcoded secrets or credentials
- [ ] Error handling is appropriate
- [ ] Tests are added/updated as needed
- [ ] Documentation is updated if necessary

## Project Dependencies

*To be documented as dependencies are added.*

## Architecture Decisions

*To be documented as the project evolves.*

### Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-26 | Created initial CLAUDE.md | Establish AI assistant guidelines from project inception |

## Environment Setup

### Prerequisites

*To be documented based on project requirements.*

### Local Development

*To be documented based on project setup.*

## Troubleshooting

### Common Issues

*To be documented as issues are encountered.*

## Contributing

1. Create a feature branch from main
2. Make your changes following the guidelines above
3. Write/update tests as needed
4. Submit a pull request with a clear description
5. Address any review feedback

## Contact and Resources

*To be updated with relevant links and contacts.*

---

*Last updated: 2026-01-26*
