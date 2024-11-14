#!/bin/bash
# Default port
PORT=5000

# Parse the incoming arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --port) PORT="$2"; shift ;;
    esac
    shift
done

if command -v nvm &> /dev/null; then
    echo "Using nvm to manage Node.js versions"
    # Load nvm and use the specified Node version if .nvmrc exists
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    if [[ -f ".nvmrc" ]]; then
        nvm install "$(cat .nvmrc)"
        nvm use "$(cat .nvmrc)"
    else
        # Optionally, specify a default Node version if .nvmrc is missing
        nvm use default || nvm install node
    fi
else
    echo "nvm not found, using system Node.js version."
fi

# Install project dependencies
npm install

# Start the React application on the specified port
PORT="$PORT" npm run start
