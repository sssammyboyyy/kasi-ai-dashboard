# Directive: Fix Docker Connectivity

**Goal**: Restore communication between Docker Client and Docker Daemon (WSL2/Windows).

**Inputs**:
- Admin PowerShell access.
- Docker Desktop installed.

**Diagnostic Steps**:
1. Check `docker context ls`. Ensure `default` or `desktop-linux` is active and valid.
2. Check `wsl -l -v`. Ensure `docker-desktop` is RUNNING.
3. Check `$env:DOCKER_HOST`. Ensure it's empty (for default pipe) or matches the context.

**Common Fixes**:
- **Reset Context**: `docker context use default`.
- **Restart WSL**: `wsl --shutdown` and restart Docker Desktop.
- **Unset Host**: `Remove-Item Env:\DOCKER_HOST`.
- **Services**: `Restart-Service com.docker.service`.

**Verification**:
- Run `docker run --rm hello-world`. Success = Fixed.
