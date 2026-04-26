# Preview Deployment Testing

Latest verified preview deployment:

```text
https://mamamtu-6bqtnxuv9-godfrey-marikis-projects.vercel.app
```

Vercel reports this deployment as `READY`.

## Current Access Blocker

Unauthenticated HTTP checks return `401 Unauthorized` because Vercel Deployment Protection is enabled for preview URLs.

This is expected when Standard Protection is active. It protects preview deployments and deployment URLs, while the production domain remains public.

## Safe Testing Options

Recommended: keep Deployment Protection enabled and configure Protection Bypass for Automation for CI/browser verification.

1. Configure Protection Bypass for Automation and use the `x-vercel-protection-bypass` header or query parameter for automated checks.
2. Open the preview URL while signed in to the Vercel account/team that has access to the project for manual testing.
3. Add a Deployment Protection Exception for a preview domain only if bypass tokens are not enough and the plan supports it.

Avoid disabling preview protection entirely. Preview deployments can contain unreleased features, test data, and debugging surfaces that should not be public by default.

## Permission Note

Disabling protection, adding an exception, or creating an automation bypass token changes who or what can access preview deployments. Do this only intentionally.

Sources:

- Vercel Deployment Protection: `https://vercel.com/docs/security/deployment-protection`
- Protection Bypass for Automation: `https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation`
