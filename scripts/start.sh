#!/bin/bash

SCRIPT_DIR=$(dirname "$(realpath "$0")")

# %if app_type == portal
source "$SCRIPT_DIR/config_manager.sh"
# %endif
source "$SCRIPT_DIR/utils.sh"

PORT=5000
# %if app_type == portal
URL=""
# %endif

ENV="dev"

VALID_ENVS=("sandbox" "dev" "prod")

validate_env() {
    local env=$1
    for valid_env in "${VALID_ENVS[@]}"; do
        if [[ "$env" == "$valid_env" ]]; then
            return 0
        fi
    done
    return 1
}

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --port) PORT="$2"; shift 2 ;;
        # %if app_type == portal
        --url) URL="$2"; shift 2 ;;
        # %endif
        --env) ENV="$2"; shift 2 ;;
        --help)
            # %if app_type == portal
            echo "Usage: $0 [--port PORT] [--env sandbox|dev|prod] [--url URL]"
            # %else
            echo "Usage: $0 [--port PORT] [--env sandbox|dev|prod]"
            # %endif
            exit 0
            ;;
        *)
            print_error "Unknown parameter: $1"
            echo "Use --help for usage information."
            exit 1
            ;;
    esac
done

if ! validate_env "$ENV"; then
    print_error "Invalid environment: $ENV"
    echo "Valid environments are: sandbox, dev, prod"
    exit 1
fi

# %if app_type == portal
ensure_key_and_secret "$ENV" || exit 1
# %endif

# Install dependencies
echo "Installing dependencies..."
npm install || {
    echo "Error: npm install failed."
    exit 1
}

# %if app_type == portal
open_browser() {
    if command -v xdg-open &>/dev/null; then
        # Linux (xdg-open for most distributions)
        xdg-open "$URL" &>/dev/null
        return $?
    elif command -v open &>/dev/null; then
        # macOS
        open "$URL" &>/dev/null
        return $?
    elif command -v start &>/dev/null; then
        # Windows (via WSL or Git Bash)
        start "$URL" &>/dev/null
        return $?
    else
        # Browser opening not supported
        return 1
    fi
}


if [[ -n "$URL" ]]; then
    echo "Starting with custom URL: $URL"
    if open_browser; then
        echo "The URL has been opened in your default browser: $URL"
    else
        echo "Unable to open the URL in your browser."
        echo "Please manually open the following URL:"
        echo "$URL"
    fi
    BROWSER=none PORT="$PORT" npm run start
else
    echo "Starting React application on port $PORT..."
    PORT="$PORT" npm run start
fi
# %else
echo "Starting React application on port $PORT..."
PORT="$PORT" npm run start
# %endif
