package dockerfile

# Policy: Dockerfile Security Best Practices for SecureTrack
# Engine: Open Policy Agent (OPA) / Conftest

import rego.v1

# RULE 1: Container must not run as root
deny contains msg if {
    input[i].Cmd == "user"
    val := input[i].Value
    val[0] == "root"
    msg := "POLICY VIOLATION: Container must not run as root user. Use a non-root user (e.g., USER node or USER appuser)."
}

# RULE 2: A USER directive must exist
deny contains msg if {
    not any_user
    msg := "POLICY VIOLATION: No USER directive found. Containers must run as a non-root user. Add 'USER <username>' to the Dockerfile."
}

any_user if {
    input[i].Cmd == "user"
}

# RULE 3: A HEALTHCHECK directive must exist
deny contains msg if {
    not any_healthcheck
    msg := "POLICY VIOLATION: No HEALTHCHECK directive found. Add a HEALTHCHECK to enable container orchestration health monitoring."
}

any_healthcheck if {
    input[i].Cmd == "healthcheck"
}

# RULE 4: Base image must use a specific tag (not :latest)
deny contains msg if {
    input[i].Cmd == "from"
    val := input[i].Value[0]
    endswith(val, ":latest")
    msg := sprintf("POLICY VIOLATION: Base image '%s' uses :latest tag. Pin to a specific version (e.g., node:20-alpine).", [val])
}

# RULE 5: Base image should use alpine or slim variant
warn contains msg if {
    input[i].Cmd == "from"
    val := input[i].Value[0]
    not contains(val, "alpine")
    not contains(val, "slim")
    not contains(val, "distroless")
    msg := sprintf("POLICY WARNING: Base image '%s' is not a minimal image. Consider using alpine, slim, or distroless variants to reduce attack surface.", [val])
}

# RULE 6: COPY is preferred over ADD
deny contains msg if {
    input[i].Cmd == "add"
    msg := "POLICY VIOLATION: Use COPY instead of ADD. ADD has extra functionality (URL fetch, tar extraction) that increases attack surface."
}

# RULE 7: No secrets or env files should be copied
deny contains msg if {
    input[i].Cmd == "copy"
    val := concat(" ", input[i].Value)
    contains(val, ".env")
    msg := "POLICY VIOLATION: .env file is being copied into the image. Use runtime environment variables or Docker secrets instead."
}
