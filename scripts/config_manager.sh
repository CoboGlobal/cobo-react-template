#!/bin/bash

SCRIPT_DIR=$(dirname "$(realpath "$0")")
source "$SCRIPT_DIR/utils.sh"

strip_quotes() {
    echo "$1" | sed "s/^['\"]//;s/['\"]$//"
}

# Function: Validate key and secret
validate_key_and_secret() {
    local key=$(strip_quotes "$1")
    local secret=$(strip_quotes "$2")

    echo "Validating key and secret..."
    if ! cobo keys validate --secret "$secret" --pubkey "$key"; then
        print_error "Error: Validation failed for the provided key and secret."
        exit 1
    fi
    print_success "Validation successful for key and secret."
}

# Function: Check if .env file in the current directory has the required key and secret
check_env_file() {
    if [[ -f ".env" ]]; then
        key=$(grep -E "^REACT_COBO_APP_KEY=" .env | cut -d'=' -f2)
        secret=$(grep -E "^REACT_COBO_APP_SECRET=" .env | cut -d'=' -f2)

        if [[ -n "$key" && -n "$secret" ]]; then
            print_success "Key and secret already exist in .env file."
            validate_key_and_secret "$key" "$secret"
            return 0
        fi
    fi
    return 1
}

get_key_and_secret() {
    key=$(cobo app manifest -k app_key 2>/dev/null)
    if [[ "$key" == *"-"* || -z "$key" ]]; then
        print_error "Failed to retrieve APP_KEY from manifest."
        return 1
    fi

    # Try to get secret from current .env or parent .env
    if [[ -f ".env" ]]; then
        secret=$(grep -E "^REACT_COBO_APP_SECRET=" .env | cut -d'=' -f2)
        if [[ -z "$secret" ]]; then
          secret=$(grep -E "^APP_SECRET=" .env | cut -d'=' -f2)
        fi
    fi
    if [[ -z "$secret" ]]; then
        secret=$(grep -E "^APP_SECRET=" ../.env | cut -d'=' -f2)
    fi

    if [[ -n "$secret" ]]; then
        echo "Found APP_KEY and APP_SECRET."
        validate_key_and_secret "$key" "$secret"
        echo "Writing APP_KEY and APP_SECRET to current .env file..."
        echo "REACT_COBO_APP_KEY=$key" >> .env
        echo "REACT_COBO_APP_SECRET=$secret" >> .env
        return 0
    fi
    print_warning "APP_KEY or APP_SECRET not found."
    return 1
}

# Function: Generate and store new secret
generate_and_store_secret() {
    print_warning "Generating a new REACT_COBO_APP_SECRET..."
    cobo keys generate --force --key-type APP --file .env
    if [[ $? -eq 0 ]] && grep -q "^COBO_APP_SECRET=" .env && grep -q "^COBO_APP_KEY=" .env; then
        echo "REACT_COBO_APP_SECRET=$(grep "^COBO_APP_SECRET=" .env | cut -d'=' -f2-)"
        echo "REACT_COBO_APP_KEY=$(grep "^COBO_APP_KEY=" .env | cut -d'=' -f2-)"
        sed -i "/^COBO_APP_SECRET=/d" .env
        sed -i "/^COBO_APP_KEY=/d" .env
        print_success "New REACT_COBO_APP_SECRET generated and saved to .env file."
        return 0
    fi
    print_error "Failed to generate REACT_COBO_APP_SECRET."
    return 1
}

update_env_field() {
    local field_name=$1
    local default_value=$2
    if ! grep -q "^$field_name=" .env; then
        echo "$field_name=$default_value" >> .env
        echo "Added placeholder for $field_name."
    fi
}

generate_placeholders() {
    echo "Ensuring placeholders in .env file..."
    [[ -f ".env" ]] || touch .env

    update_env_field "REACT_COBO_APP_KEY" ""
    update_env_field "REACT_COBO_APP_SECRET" ""

    print_success ".env file is up to date with required placeholders."
}

set_client_id() {
    local env=$1
    local client_id

    if [[ "$env" == "prod" ]]; then
        client_id=$(cobo app manifest -k client_id 2>/dev/null)
    else
        client_id=$(cobo app manifest -k dev_client_id 2>/dev/null)
    fi

    if [[ -z "$client_id" || "$client_id" == *"-"* ]]; then
        print_warning "Failed to retrieve client ID from manifest. Using default placeholder."
        client_id="your-client-id-from-app-manifest"
    fi

    update_env_field "REACT_COBO_APP_CLIENT_ID" "$client_id"
}

ensure_key_and_secret() {
    set_client_id "$1"

    if check_env_file; then
        return 0
    fi

    if get_key_and_secret "$1"; then
        return 0
    fi

    read -p "Key and secret not found. Do you want to generate new ones? (Y/n): " choice
    choice=${choice:-Y}
    if [[ "$choice" =~ ^[Yy] ]]; then
        generate_and_store_secret
    else
        generate_placeholders
    fi

}
