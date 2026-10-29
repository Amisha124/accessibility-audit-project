# Accessibility Baseline & Repository Architecture Audit

## Project Overview

This project audits the accessibility of the National Portal of India website using Google Chrome Lighthouse.

The purpose is to identify accessibility issues, document evidence, assess their severity, and recommend practical improvements.

## Website Audited

* Website: https://www.india.gov.in/
* Tool: Google Chrome Lighthouse
* Audit category: Accessibility
* Testing method: Automated accessibility audit

## Initial Audit Result

The Lighthouse accessibility score recorded during the audit was 86/100.

The report identified potential issues involving ARIA roles, color contrast, list structure, touch target sizes, and repeated links.

## Project Structure

* `accessibility-audit-template.csv` — Accessibility audit findings
* `README.md` — Project documentation
* `index.html` — Project webpage
* `style.css` — Website styling
* `script.js` — JavaScript functionality
* `screenshots/` — Audit evidence and screenshots

## Accessibility Issues

The audit findings will be documented with their evidence, severity, user impact, recommended fixes, owner, and status.

## Limitations

Lighthouse automated testing identifies only some accessibility problems. Manual keyboard navigation and other accessibility checks are also required.

## Future Improvements

* Complete the accessibility findings report.
* Perform keyboard-only navigation testing.
* Create a maintainable project structure.
* Document setup instructions and architecture decisions.
