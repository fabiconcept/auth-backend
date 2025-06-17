### 1. What claims are in your JWT?

Based on my JWT implementation in `src/utils/jwt.ts`, my JSON Web Tokens (JWTs) contain the following claims:

*   **Access Token**:
    *   `sub` (Subject): The user's unique ID.
    *   `email`: The user's email address.
    *   Standard claims: `iat` (Issued At) and `exp` (Expiration Time), which is set to 30 minutes.

*   **Refresh Token**:
    *   `sub` (Subject): The user's unique ID.
    *   `jti` (JWT ID): A unique identifier for the token, used for tracking and revocation.
    *   Standard claims: `iat` (Issued At) and `exp` (Expiration Time), which is set to 7 days.

This setup follows the principle of least privilege for the access token by including only the necessary information for stateless authentication, while the refresh token is used solely to obtain a new access token.

### 2. How do you handle refresh token reuse?

The current implementation in `src/controllers/authController.ts` employs **refresh token rotation**. When a client uses a refresh token:

1.  The system verifies the token and finds the corresponding entry in the database.
2.  It checks if the token has already been marked as `revoked`.
3.  If valid, the old refresh token is immediately revoked in the database: `data: { revoked: true }`.
4.  A **new** access token and a **new** refresh token (with a new `jti`) are generated and sent to the client.

**Threat Mitigation**:
This strategy prevents a stolen refresh token from being used indefinitely. If an attacker steals and uses the token, the legitimate user's subsequent attempt will fail because the token will have been revoked. However, the current implementation does not include **theft detection**. A more robust system would invalidate all active refresh tokens for a user if a *revoked* token is ever used, as this is a strong indicator of a compromised token.

### 3. How do you secure cookies?

My cookie security, as defined in `src/utils/cookies.ts`, is strong and addresses major threats:

*   **`httpOnly: true`**: This is the most critical flag for mitigating Cross-Site Scripting (XSS). It prevents client-side JavaScript from accessing the cookie, meaning an XSS payload cannot steal the tokens.
*   **`secure: isProduction`**: This flag ensures that cookies are only sent over HTTPS in the production environment, protecting against man-in-the-middle attacks.
*   **`sameSite: isProduction ? 'strict' : 'lax'`**: This is a primary defense against Cross-Site Request Forgery (CSRF). In production, `strict` mode prevents the browser from sending the cookie with any cross-site requests, even navigations. `lax` is a reasonable default for development.

These settings provide a secure foundation for storing tokens in cookies.

### 4. How do you revoke all tokens after a password change?

**This functionality is not currently implemented in the codebase.** A password change is a critical security event, and all active sessions should be terminated to prevent a compromised account from remaining accessible.

Here’s how it could be implemented:

1.  **Revoke All Refresh Tokens**: When a user changes their password, you would update the database to revoke all active refresh tokens associated with their `userId`:
    ```typescript
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true },
    });
    ```
2.  **Invalidate Access Tokens**: Since access tokens are stateless, they cannot be directly revoked. The common solution is to add a `passwordChangedAt` timestamp to the `User` model. This timestamp would be included as a claim in the access token. A middleware would then verify that the token's issue date (`iat`) is *after* the `passwordChangedAt` timestamp. If not, the token is rejected.

### 5. Would you use DB or Redis for token storage and why?

Currently, my application uses the **primary database (via Prisma)** to store the state of refresh tokens. This is a practical and common approach.

*   **Database (Current Approach)**:
    *   **Pros**: Simplicity (no extra infrastructure), data consistency, and transactional integrity with other user data.
    *   **Cons**: Potentially slower than in-memory alternatives, which could become a bottleneck at very high scale.

*   **Redis**:
    *   **Pros**: Extremely fast in-memory reads/writes, making it ideal for high-throughput scenarios like token validation. It also has built-in support for setting a Time-to-Live (TTL) on keys, which is perfect for tokens.
    *   **Cons**: Adds complexity (managing another service), and persistence needs to be carefully configured to prevent data loss.

**Decision**: For most applications, using the existing database is a perfectly valid and secure choice. It aligns with practical scalability—you only need to introduce Redis if token validation latency becomes a measurable performance issue. The current approach prioritizes simplicity and maintainability.

### 6. Do you rotate refresh tokens or detect reuse?

As mentioned in question #2, the system **rotates refresh tokens**. A new token is issued with each refresh request, and the old one is invalidated.

However, it only performs a basic check for reuse (i.e., it rejects already-revoked tokens). It **does not implement advanced reuse detection**. True reuse detection involves creating a "family" of tokens and invalidating the entire family if a previously used token from that family is presented. This provides a higher level of security against replay attacks where a stolen token is used by an attacker after the user has already used it.
