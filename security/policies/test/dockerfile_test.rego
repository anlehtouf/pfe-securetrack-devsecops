package dockerfile

import rego.v1

# Test: Dockerfile with no USER directive should fail
test_no_user_directive if {
    deny["POLICY VIOLATION: No USER directive found. Containers must run as a non-root user. Add 'USER <username>' to the Dockerfile."] with input as [
        {"Cmd": "from", "Value": ["node:20-alpine"]},
        {"Cmd": "workdir", "Value": ["/app"]},
        {"Cmd": "copy", "Value": [".", "."]},
        {"Cmd": "cmd", "Value": ["node", "src/app.js"]},
    ]
}

# Test: Dockerfile with root USER should fail
test_root_user if {
    deny["POLICY VIOLATION: Container must not run as root user. Use a non-root user (e.g., USER node or USER appuser)."] with input as [
        {"Cmd": "from", "Value": ["node:20-alpine"]},
        {"Cmd": "user", "Value": ["root"]},
        {"Cmd": "cmd", "Value": ["node", "src/app.js"]},
    ]
}

# Test: Dockerfile with no HEALTHCHECK should fail
test_no_healthcheck if {
    deny["POLICY VIOLATION: No HEALTHCHECK directive found. Add a HEALTHCHECK to enable container orchestration health monitoring."] with input as [
        {"Cmd": "from", "Value": ["node:20-alpine"]},
        {"Cmd": "user", "Value": ["node"]},
        {"Cmd": "cmd", "Value": ["node", "src/app.js"]},
    ]
}

# Test: Dockerfile using :latest tag should fail
test_latest_tag if {
    deny[msg] with input as [
        {"Cmd": "from", "Value": ["node:latest"]},
        {"Cmd": "user", "Value": ["node"]},
        {"Cmd": "healthcheck", "Value": ["CMD", "curl", "-f", "http://localhost:5000/api/health"]},
    ]
    contains(msg, ":latest tag")
}

# Test: Dockerfile using ADD should fail
test_add_instead_of_copy if {
    deny["POLICY VIOLATION: Use COPY instead of ADD. ADD has extra functionality (URL fetch, tar extraction) that increases attack surface."] with input as [
        {"Cmd": "from", "Value": ["node:20-alpine"]},
        {"Cmd": "add", "Value": [".", "."]},
        {"Cmd": "user", "Value": ["node"]},
        {"Cmd": "healthcheck", "Value": ["CMD", "curl", "-f", "http://localhost:5000/api/health"]},
    ]
}

# Test: Valid Dockerfile should pass (no denies for user/healthcheck)
test_valid_dockerfile if {
    count(deny) == 0 with input as [
        {"Cmd": "from", "Value": ["node:20-alpine"]},
        {"Cmd": "workdir", "Value": ["/app"]},
        {"Cmd": "copy", "Value": ["package*.json", "./"]},
        {"Cmd": "run", "Value": ["npm ci --only=production"]},
        {"Cmd": "copy", "Value": [".", "."]},
        {"Cmd": "user", "Value": ["node"]},
        {"Cmd": "healthcheck", "Value": ["CMD", "wget", "-qO-", "http://localhost:5000/api/health"]},
        {"Cmd": "cmd", "Value": ["node", "src/app.js"]},
    ]
}
