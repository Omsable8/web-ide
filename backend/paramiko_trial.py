import paramiko

# SSH connection details
hostname = '192.168.0.104'
username = 'thunder'
password = '2011'  # Or use key-based authentication

try:
    # Create an SSH client
    client = paramiko.SSHClient()

    # Automatically add the server's host key (not recommended for production without proper key management)
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    # Connect to the SSH server
    client.connect(hostname=hostname, username=username, passphrase=password)

    # Execute a command
    command = 'ls -l'
    stdin, stdout, stderr = client.exec_command(command)

    # Read the command output
    output = stdout.read().decode('utf-8')
    error = stderr.read().decode('utf-8')

    if output:
        print(f"Command '{command}' output:\n{output}")
    if error:
        print(f"Command '{command}' error:\n{error}")

except paramiko.AuthenticationException:
    print("Authentication failed. Check your username and password.")
except paramiko.SSHException as e:
    print(f"SSH connection error: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
finally:
    # Close the SSH connection
    if 'client' in locals() and client:
        client.close()