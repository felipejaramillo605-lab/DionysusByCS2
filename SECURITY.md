# Security Policy

## Supported version

Only the latest version of the `main` branch is supported during active development.

## Reporting a vulnerability

Do not open a public issue for suspected vulnerabilities, exposed credentials, authorization bypasses, or tenant-isolation defects.

Report the issue privately to the repository owner and include:

- affected component and version or commit;
- reproducible steps without real customer data;
- expected and observed behavior;
- potential impact;
- suggested mitigation, if known.

Do not include passwords, access tokens, private keys, production database contents, or personal information in the report.

## Response priorities

- Critical: immediate containment and credential rotation when applicable.
- High: prioritized remediation and validation.
- Medium and low: scheduled according to risk and exploitability.

Security fixes must preserve evidence, use an isolated branch, pass CI, and be reviewed before merge.
